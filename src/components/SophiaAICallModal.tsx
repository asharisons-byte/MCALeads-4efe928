import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Phone,
  PhoneOff,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  Volume2,
  VolumeX,
  AlertTriangle,
  X,
  ArrowRight,
  RefreshCw,
  Edit3,
  Send,
  UserCheck,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Target,
  Zap,
} from 'lucide-react';
import {
  Lead,
  CallRecord,
  SophiaCallStrategy,
  SophiaCallTurn,
  SophiaCallAnalysis,
  PipelineStage,
} from '../types';
import { AIService, buildDeterministicCallStrategy } from '../services/aiService';
import { getAIModelConfig, SUPPORTED_GEMINI_MODELS } from '../services/aiConfig';
import {
  TelephonyService,
  formatDuration,
  formatPhoneNumber,
  saveCallRecord,
} from '../services/telephonyService';
import { addActivity, addNoteToLead } from '../services/leadService';
import { recordOptOut } from '../services/messagingService';

interface SophiaAICallModalProps {
  isOpen: boolean;
  lead: Lead;
  onClose: () => void;
  onLeadUpdated?: (leadId: string, updates: Partial<Lead>) => void;
  onOpenEmailComposer?: (lead: Lead) => void;
  onOpenSMSComposer?: (lead: Lead) => void;
}

type CallCenterView = 'strategy' | 'calling' | 'completed';

export const SophiaAICallModal: React.FC<SophiaAICallModalProps> = ({
  isOpen,
  lead,
  onClose,
  onLeadUpdated,
  onOpenEmailComposer,
  onOpenSMSComposer,
}) => {
  const [view, setView] = useState<CallCenterView>('strategy');
  const [aiConfig, setAiConfig] = useState(() => getAIModelConfig());

  // Compliance check
  const isRestricted =
    lead.status === 'Do Not Contact' ||
    Boolean(lead.sms_opt_out) ||
    lead.sms_eligibility === 'OPTED_OUT' ||
    lead.sms_eligibility === 'BLOCKED';

  // Strategy State
  const [strategy, setStrategy] = useState<SophiaCallStrategy>(() =>
    buildDeterministicCallStrategy(lead)
  );
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [editedObjective, setEditedObjective] = useState('');
  const [editedCta, setEditedCta] = useState('');

  // Live Call State
  const [callSession, setCallSession] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<
    'PREPARING' | 'CALLING' | 'RINGING' | 'CONNECTED' | 'AGENT_SPEAKING' | 'PAUSED' | 'ENDED'
  >('PREPARING');
  const [duration, setDuration] = useState(0);
  const [turns, setTurns] = useState<SophiaCallTurn[]>([]);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);
  const [transcriptStatus, setTranscriptStatus] = useState<'Listening' | 'Processing' | 'Available'>('Available');
  const [isHumanTakeover, setIsHumanTakeover] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Prospect response simulator & live inputs
  const [prospectInput, setProspectInput] = useState('');
  const [isSophiaThinking, setIsSophiaThinking] = useState(false);

  // In-call note
  const [inCallNote, setInCallNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Post-call Analysis State
  const [analysis, setAnalysis] = useState<SophiaCallAnalysis | null>(null);
  const [isAnalyzingCall, setIsAnalyzingCall] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<CallRecord | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isSophiaThinking]);

  // Sync edits
  useEffect(() => {
    if (strategy) {
      setEditedObjective(strategy.objective);
      setEditedCta(strategy.call_to_action);
    }
  }, [strategy]);

  // Load fresh strategy via Gemini on open
  useEffect(() => {
    if (isOpen && !isRestricted) {
      handleGenerateStrategy();
    }
  }, [isOpen, lead.lead_id]);

  // Live Duration Timer
  useEffect(() => {
    if (callStatus === 'CONNECTED' || callStatus === 'AGENT_SPEAKING') {
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callStatus]);

  if (!isOpen) return null;

  // Speak aloud helper using Web Speech API
  const speakSophiaUtterance = (text: string) => {
    if (!isAudioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      // Try to find a natural English female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('Zira'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  };

  // Generate strategy with Gemini
  const handleGenerateStrategy = async () => {
    setIsGeneratingStrategy(true);
    try {
      const result = await AIService.generateCallStrategy(lead);
      setStrategy(result);
    } catch (e) {
      console.warn('Fallback to deterministic strategy:', e);
      setStrategy(buildDeterministicCallStrategy(lead));
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  // Start the AI Call (User must explicitly click this!)
  const handleStartAICall = async () => {
    if (!lead.phone) return;
    setView('calling');
    setCallStatus('PREPARING');
    setDuration(0);
    setTurns([]);
    setLiveEvents([
      'AI Call initialized through Telephony Infrastructure',
      `Target: ${lead.business_name} (${lead.phone})`,
      'Configured Agent: Sophia (Marketing Charm Agency)',
    ]);
    setIsHumanTakeover(false);

    try {
      const res = await TelephonyService.startCall({
        lead,
        phoneNumber: lead.phone,
        callType: 'AI Call',
      });
      setCallSession(res.session);

      // Advance through telephony states realistically
      setTimeout(() => {
        setCallStatus('CALLING');
        setLiveEvents((prev) => [...prev, 'Dialing recipient terminal...']);
      }, 700);

      setTimeout(() => {
        setCallStatus('RINGING');
        setLiveEvents((prev) => [...prev, 'Ringing prospect line...']);
      }, 2200);

      setTimeout(() => {
        setCallStatus('CONNECTED');
        setLiveEvents((prev) => [
          ...prev,
          'Call connected successfully',
          'Sophia introducing herself to prospect',
        ]);

        // First Sophia Turn
        const introMsg = `Hi, this is Sophia calling from Marketing Charm Agency. I'll keep this very brief — did I catch you at an okay time?`;
        const initialTurn: SophiaCallTurn = {
          id: `turn_${Date.now()}`,
          speaker: 'Sophia',
          message: introMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          intent: 'Intro',
        };
        setTurns([initialTurn]);
        setTranscriptStatus('Listening');
        speakSophiaUtterance(introMsg);
      }, 4200);
    } catch (err) {
      console.error('Call connection failed:', err);
      setLiveEvents((prev) => [...prev, 'Connection error. Switching to resilient simulation mode.']);
      setCallStatus('CONNECTED');
    }
  };

  // Handle a turn from the prospect
  const handleProspectUtterance = async (utteranceText: string) => {
    if (!utteranceText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prospectTurn: SophiaCallTurn = {
      id: `turn_${Date.now()}_prospect`,
      speaker: 'Prospect',
      message: utteranceText.trim(),
      timestamp: timeStr,
    };

    const updatedTurns = [...turns, prospectTurn];
    setTurns(updatedTurns);
    setProspectInput('');
    setTranscriptStatus('Processing');

    // If human has taken over, Sophia does not generate an automated response
    if (isHumanTakeover) {
      setTranscriptStatus('Available');
      return;
    }

    setIsSophiaThinking(true);

    try {
      const systemPrompt = AIService.generateSystemPrompt(lead, strategy);
      const res = await AIService.generateConversationTurn({
        lead,
        systemPrompt,
        turns: updatedTurns,
        userUtterance: utteranceText.trim(),
      });

      const sophiaTurn: SophiaCallTurn = {
        id: `turn_${Date.now()}_sophia`,
        speaker: 'Sophia',
        message: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        intent: res.intent,
      };

      setTurns([...updatedTurns, sophiaTurn]);
      if (res.event_note) {
        setLiveEvents((prev) => [...prev, res.event_note!]);
      }
      setTranscriptStatus('Listening');
      speakSophiaUtterance(res.reply);
    } catch (e) {
      console.warn('AI conversation turn error:', e);
    } finally {
      setIsSophiaThinking(false);
    }
  };

  // Human Takeover
  const handleHumanTakeover = () => {
    setIsHumanTakeover(true);
    setCallStatus('AGENT_SPEAKING');
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setLiveEvents((prev) => [
      ...prev,
      'HUMAN TAKEOVER ACTIVATED: Sophia AI speech paused. Agent mic live.',
    ]);
    const takeoverTurn: SophiaCallTurn = {
      id: `turn_${Date.now()}_system`,
      speaker: 'System',
      message: 'Human sales agent took over conversation. AI speech synthesis paused.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setTurns((prev) => [...prev, takeoverTurn]);
  };

  // Pause / Resume AI Call
  const handleTogglePause = () => {
    if (callStatus === 'PAUSED') {
      setCallStatus('CONNECTED');
      setLiveEvents((prev) => [...prev, 'AI Call resumed']);
    } else {
      setCallStatus('PAUSED');
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setLiveEvents((prev) => [...prev, 'AI Call paused by user']);
    }
  };

  // End Call and Transition to Post-Call Analysis
  const handleEndCall = async () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCallStatus('ENDED');
    setView('completed');
    setIsAnalyzingCall(true);

    const callDuration = duration || 45;

    try {
      // 1. Run Gemini post-call analysis
      const postAnalysis = await AIService.analyzeCompletedCall({
        lead,
        duration: callDuration,
        turns,
        strategy,
      });
      setAnalysis(postAnalysis);

      // 2. Build full CallRecord
      const now = new Date().toISOString();
      const newRecord: CallRecord = {
        call_id: callSession?.callId || `call_ai_${Date.now()}`,
        lead_id: lead.lead_id,
        business_name: lead.business_name,
        contact_name: lead.contact_name,
        phone_number: lead.phone || '',
        direction: 'OUTBOUND',
        call_type: 'AI Call',
        status: 'COMPLETED',
        duration: callDuration,
        outcome:
          postAnalysis.interest_level === 'Hot'
            ? 'Interested'
            : postAnalysis.primary_objection?.includes('Do Not Contact')
            ? 'Do Not Contact'
            : postAnalysis.interest_level === 'Cold'
            ? 'Not Interested'
            : 'Follow Up',
        notes: postAnalysis.crm_notes,
        started_at: new Date(Date.now() - callDuration * 1000).toISOString(),
        ended_at: now,
        created_at: now,
        recording_status: 'Available',
        transcript: turns.map((t) => `[${t.speaker}]: ${t.message}`).join('\n'),
        transcript_status: 'Available',
        lead_score: lead.lead_score,
        pipeline_stage: lead.pipeline_stage,
        opportunity: strategy.primary_opportunity,
        estimated_retainer: strategy.verified_context.estimated_retainer,

        // Phase 2E fields
        ai_agent: 'Sophia',
        ai_provider: 'Google Gemini',
        ai_model: aiConfig.modelId,
        sentiment: postAnalysis.sentiment,
        interest_level: postAnalysis.interest_level,
        summary: postAnalysis.summary,
        objections: postAnalysis.primary_objection ? [postAnalysis.primary_objection] : [],
        key_insights: postAnalysis.key_insights,
        recommended_next_action: postAnalysis.recommended_next_action.action,
        promised_follow_up: postAnalysis.promised_follow_up,
        call_strategy: strategy,
        transcript_turns: turns,
      };

      saveCallRecord(newRecord);
      setCompletedRecord(newRecord);

      // 3. Write CRM Note
      await addNoteToLead(lead.lead_id, postAnalysis.crm_notes, 'Call Log', 'Sophia (AI Sales Rep)', true);

      // 4. Update Activity Timeline
      addActivity({
        id: `act-ai-call-${Date.now()}`,
        activity_id: `act-ai-call-${Date.now()}`,
        lead_id: lead.lead_id,
        lead_name: lead.business_name,
        timestamp: new Date().toISOString(),
        type: 'call_completed',
        activity_type: 'call_completed',
        channel: 'AI_CALL',
        title: `Sophia AI Call Completed (${formatDuration(callDuration)})`,
        description: postAnalysis.summary,
        author: 'Sophia (AI Sales Rep)',
        source: 'Sophia (AI)',
        metadata: {
          direction: 'OUTBOUND',
          status: 'COMPLETED',
          sentiment: postAnalysis.sentiment,
          interest_level: postAnalysis.interest_level,
          call_id: newRecord.call_id,
        },
      });

      // 5. Automatic conservative pipeline updates
      if (onLeadUpdated) {
        const updates: Partial<Lead> = {};

        // New Lead -> Contacted only if connected
        if (lead.pipeline_stage === 'New Lead' || !lead.pipeline_stage) {
          updates.pipeline_stage = 'Contacted';
        }

        // Do Not Contact enforcement
        if (
          postAnalysis.interest_level === 'Cold' &&
          postAnalysis.primary_objection?.includes('Do Not Contact')
        ) {
          updates.status = 'Do Not Contact';
          updates.sms_opt_out = true;
          updates.sms_opt_out_reason = 'Requested during Sophia AI call';
          updates.sms_opt_out_timestamp = now;
          recordOptOut(lead.lead_id, lead.phone || '', 'Verbally requested Do Not Contact during AI call', 'Requested verbally during Sophia AI call');
        }

        if (Object.keys(updates).length > 0) {
          onLeadUpdated(lead.lead_id, updates);
        }
      }
    } catch (err) {
      console.error('Post-call analysis failed:', err);
    } finally {
      setIsAnalyzingCall(false);
    }
  };

  return (
    <div
      id="sophia-ai-call-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="sophia-ai-call-modal-card"
        className="w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl bg-[#090d16] border border-purple-500/30 shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Sophia AI Call Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Sales Representative
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {aiConfig.modelId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Marketing Charm Agency • Enterprise Outbound Voice Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {view === 'calling' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                if (callStatus === 'CONNECTED' || callStatus === 'CALLING') {
                  handleEndCall();
                } else {
                  onClose();
                }
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Call Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* COMPLIANCE WARNING IF BLOCKED */}
          {isRestricted ? (
            <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 mx-auto flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Outreach Restricted</h3>
                <p className="text-sm text-rose-200 mt-1 max-w-lg mx-auto">
                  Outreach restricted due to compliance status. This contact has opted out,
                  requested Do Not Contact, or has active communication suppression. Sophia AI
                  calling is blocked to protect agency reputation.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Close Call Center
              </button>
            </div>
          ) : view === 'strategy' ? (
            /* =========================================================================
               VIEW 1: PRE-CALL STRATEGY & CRM LEAD REVIEW
               ========================================================================= */
            <div className="space-y-6">
              {/* Lead Snapshot Banner */}
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-white">
                      {lead.business_name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatPhoneNumber(lead.phone || '')}
                    </span>
                    {lead.contact_name && (
                      <span className="text-xs font-semibold text-purple-300">
                        • {lead.contact_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{lead.city || 'Oregon'}</span>
                    <span>•</span>
                    <span>{lead.niche || 'Contractor'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      ${lead.estimated_retainer || 2000}/mo Retainer
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      Lead Score
                    </div>
                    <div className="text-sm font-extrabold text-purple-300">
                      {lead.lead_score || 70}/100
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      Pipeline Stage
                    </div>
                    <div className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {lead.pipeline_stage || 'New Lead'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Call Strategy Header with Regenerate */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Sophia Dynamic Call Strategy</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Synthesized from verified CRM data by Google Gemini
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateStrategy}
                    disabled={isGeneratingStrategy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isGeneratingStrategy ? 'animate-spin' : ''}`}
                    />
                    <span>{isGeneratingStrategy ? 'Analyzing CRM...' : 'Regenerate'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditingStrategy(!isEditingStrategy)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEditingStrategy ? 'Done Editing' : 'Edit Strategy'}</span>
                  </button>
                </div>
              </div>

              {/* Strategy Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Objective Card */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase">
                    <Target className="w-3.5 h-3.5" />
                    <span>Sophia's Call Objective</span>
                  </div>
                  {isEditingStrategy ? (
                    <textarea
                      value={editedObjective}
                      onChange={(e) => setEditedObjective(e.target.value)}
                      className="w-full h-20 p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {editedObjective || strategy.objective}
                    </p>
                  )}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-white">Call Goal:</strong> {strategy.target_goal}
                    </div>
                  </div>
                </div>

                {/* Primary Opportunity Card */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Primary Opportunity & CTA</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200">
                    <strong>Opportunity:</strong> {strategy.primary_opportunity}
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Suggested CTA:</strong>{' '}
                    {isEditingStrategy ? (
                      <input
                        type="text"
                        value={editedCta}
                        onChange={(e) => setEditedCta(e.target.value)}
                        className="w-full mt-1 p-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    ) : (
                      editedCta || strategy.call_to_action
                    )}
                  </div>
                </div>
              </div>

              {/* Talking Points & Verified Pain Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Verified Pain Points (CRM Grounded)
                  </h4>
                  <ul className="space-y-1.5">
                    {strategy.pain_points.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Discovery Questions (Before Pitching)
                  </h4>
                  <ul className="space-y-1.5">
                    {strategy.discovery_questions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Known Objections Matrix */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Sophia Pre-Trained Objection Handlers
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {strategy.known_objections.map((obj, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1"
                    >
                      <div className="text-xs font-bold text-amber-300">"{obj.objection}"</div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        {obj.counter}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start AI Call Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Call connects via secure telephony
                  </span>
                  <button
                    id="mca-start-ai-call-btn"
                    onClick={handleStartAICall}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Start AI Call</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : view === 'calling' ? (
            /* =========================================================================
               VIEW 2: LIVE AI CALL MONITOR
               ========================================================================= */
            <div className="space-y-6">
              {/* Live Status Bar */}
              <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      callStatus === 'CONNECTED'
                        ? 'bg-emerald-400 animate-pulse'
                        : callStatus === 'AGENT_SPEAKING'
                        ? 'bg-amber-400 animate-ping'
                        : 'bg-blue-400 animate-bounce'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Status:</span>
                      <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 uppercase text-[10px]">
                        {callStatus}
                      </span>
                      {isHumanTakeover && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                          Agent Speaking
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Calling: {lead.business_name} • {formatPhoneNumber(lead.phone || '')}
                    </div>
                  </div>
                </div>

                {/* Audio Waves Simulation */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 h-6">
                    {[16, 24, 12, 28, 20, 14, 26, 18].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full ${
                          callStatus === 'CONNECTED' || callStatus === 'AGENT_SPEAKING'
                            ? 'bg-purple-400 animate-pulse'
                            : 'bg-slate-700'
                        }`}
                        style={{ height: `${callStatus === 'CONNECTED' ? h : 6}px` }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={isAudioEnabled ? 'Mute AI speech synthesis' : 'Unmute AI speech'}
                  >
                    {isAudioEnabled ? (
                      <Volume2 className="w-4 h-4 text-purple-300" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Main Live Workspace: 2-column (Transcript + Live Events) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left (2 cols): Live Transcript */}
                <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Live Transcript</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      Transcript Status: {transcriptStatus}
                    </span>
                  </div>

                  {/* Transcript Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {turns.map((turn) => {
                      const isSophia = turn.speaker === 'Sophia';
                      const isSystem = turn.speaker === 'System';

                      if (isSystem) {
                        return (
                          <div
                            key={turn.id}
                            className="p-2 text-center text-[11px] font-mono text-amber-300 bg-amber-950/20 border border-amber-500/20 rounded-lg"
                          >
                            {turn.message}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={turn.id}
                          className={`flex flex-col ${isSophia ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isSophia
                                  ? 'bg-purple-600/30 text-purple-300'
                                  : 'bg-sky-600/30 text-sky-300'
                              }`}
                            >
                              {turn.speaker}
                            </span>
                            <span className="text-[10px] text-slate-500">{turn.timestamp}</span>
                            {turn.intent && (
                              <span className="text-[9px] text-slate-400 italic">
                                ({turn.intent})
                              </span>
                            )}
                          </div>
                          <div
                            className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                              isSophia
                                ? 'bg-purple-950/40 text-purple-100 border border-purple-500/30 rounded-tl-sm'
                                : 'bg-slate-800 text-white border border-slate-700 rounded-tr-sm'
                            }`}
                          >
                            {turn.message}
                          </div>
                        </div>
                      );
                    })}

                    {isSophiaThinking && (
                      <div className="flex items-center gap-2 text-xs text-purple-300 animate-pulse p-2">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Sophia analyzing intent & framing response...</span>
                      </div>
                    )}

                    <div ref={transcriptEndRef} />
                  </div>

                  {/* Interactive Prospect Utterance Simulator */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    {/* Quick Simulated Response Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                      <span className="text-slate-400 font-semibold shrink-0">
                        Test Responses:
                      </span>
                      {[
                        "We already have someone handling that.",
                        "Are you an AI?",
                        "I'm pretty busy right now.",
                        "Send me an email with information.",
                        "What does your service cost?",
                        "Please do not call this number again.",
                      ].map((phrase, i) => (
                        <button
                          key={i}
                          onClick={() => handleProspectUtterance(phrase)}
                          disabled={isSophiaThinking || callStatus !== 'CONNECTED'}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap shrink-0 transition-colors border border-slate-700"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prospectInput}
                        onChange={(e) => setProspectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleProspectUtterance(prospectInput);
                        }}
                        disabled={isSophiaThinking || callStatus !== 'CONNECTED'}
                        placeholder="Type prospect reply or select quick response above..."
                        className="flex-1 p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleProspectUtterance(prospectInput)}
                        disabled={
                          !prospectInput.trim() ||
                          isSophiaThinking ||
                          callStatus !== 'CONNECTED'
                        }
                        className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right (1 col): Live Event Feed & Human Controls */}
                <div className="space-y-4">
                  {/* Live Event Feed */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 h-[220px] flex flex-col">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Live Event Feed
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] font-mono text-slate-400">
                      {liveEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-400 shrink-0">›</span>
                          <span className="text-slate-300">{evt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Human In-Call Controls */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Call Controls
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleTogglePause}
                        className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>{callStatus === 'PAUSED' ? 'Resume AI' : 'Pause AI'}</span>
                      </button>

                      <button
                        onClick={handleHumanTakeover}
                        disabled={isHumanTakeover}
                        className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isHumanTakeover
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHumanTakeover ? 'Speaking' : 'Take Over'}</span>
                      </button>
                    </div>

                    {/* End Call Button */}
                    <button
                      onClick={handleEndCall}
                      className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End AI Call &amp; Analyze</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               VIEW 3: POST-CALL GEMINI ANALYSIS & CRM UPDATES
               ========================================================================= */
            <div className="space-y-6">
              {isAnalyzingCall ? (
                <div className="p-12 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-white">
                    Sophia &amp; Gemini Analyzing Completed Call...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Extracting conversation sentiment, interest level, discovery insights,
                    objections, and preparing automated CRM notes.
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Analysis Success Banner */}
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Call Successfully Logged to CRM
                        </h3>
                        <p className="text-xs text-slate-300">
                          Duration: {formatDuration(duration || 45)} • Processed by Gemini Model{' '}
                          {aiConfig.modelId}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Pills */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          analysis.sentiment === 'Positive'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : analysis.sentiment === 'Negative'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        Sentiment: {analysis.sentiment}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          analysis.interest_level === 'Hot'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : analysis.interest_level === 'Warm'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        Interest: {analysis.interest_level}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Key Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase">
                        Executive Call Summary
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {analysis.summary}
                      </p>

                      {analysis.primary_objection && (
                        <div className="mt-3 p-2.5 rounded bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300">
                          <strong>Primary Objection:</strong> {analysis.primary_objection}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase">
                        Key Discovery Insights
                      </div>
                      <ul className="space-y-1.5">
                        {analysis.key_insights.map((ins, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Next Action Card */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sophia Recommended Next Action</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {analysis.recommended_next_action.action}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Priority:{' '}
                        <span className="text-amber-300 font-bold">
                          {analysis.recommended_next_action.priority}
                        </span>{' '}
                        • Channel: {analysis.recommended_next_action.suggested_channel} • Timing:{' '}
                        {analysis.recommended_next_action.suggested_timing}
                      </div>
                    </div>

                    {/* Action Execution Buttons */}
                    <div className="flex items-center gap-2">
                      {onOpenEmailComposer && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenEmailComposer(lead);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Website Audit Email</span>
                        </button>
                      )}

                      {onOpenSMSComposer && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenSMSComposer(lead);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Follow-Up via SMS</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Automatic CRM Note Record */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
                      <span>CRM Note Appended</span>
                      <span className="text-[10px] text-purple-300 font-mono">
                        Generated by Sophia AI
                      </span>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                      {analysis.crm_notes}
                    </pre>
                  </div>
                </div>
              ) : null}

              {/* Completed View Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Done • Return to CRM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
