import React, { useState, useMemo } from 'react';
import {
  X,
  Phone,
  Bot,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Sparkles,
  FileText,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  User,
  ShieldCheck,
  Search,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Edit3,
  Save,
  ArrowRight,
  Flame,
  Target,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  CallRecord,
  Lead,
  CallIntelligence,
  FollowUpTask,
  ObjectionDetail,
} from '../types';
import { formatDuration, formatPhoneNumber, saveCallRecord } from '../services/telephonyService';
import {
  getCallIntelligence,
  saveCallIntelligence,
  processCallTranscript,
  getFollowUpTasks,
  updateFollowUpTask,
  saveFollowUpTask,
} from '../services/callIntelligenceService';

interface CallDetailModalProps {
  isOpen: boolean;
  call: CallRecord | null;
  onClose: () => void;
  onSelectLead?: (lead: Lead) => void;
  onOpenDialer?: (lead?: Lead, phone?: string) => void;
  onOpenAICall?: (lead: Lead) => void;
  onOpenEmail?: (lead: Lead, task?: FollowUpTask) => void;
  onOpenSMS?: (lead: Lead, task?: FollowUpTask) => void;
  matchedLead?: Lead;
  onUpdateCallRecord?: (call: CallRecord) => void;
}

export const CallDetailModal: React.FC<CallDetailModalProps> = ({
  isOpen,
  call,
  onClose,
  onSelectLead,
  onOpenDialer,
  onOpenAICall,
  onOpenEmail,
  onOpenSMS,
  matchedLead,
  onUpdateCallRecord,
}) => {
  if (!isOpen || !call) return null;

  // Active Tab: 6 required tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transcript' | 'recording' | 'analysis' | 'notes' | 'followup'
  >('overview');

  // Intelligence state
  const [intelligence, setIntelligence] = useState<CallIntelligence | null>(() => {
    return call.intelligence || getCallIntelligence(call.call_id) || null;
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Transcript Search
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Recording Audio Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(35); // in percent
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);

  // CRM Notes Editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(() => {
    return intelligence?.crm_notes || call.notes || '';
  });
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Editable / Pasteable Transcript
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [pastedTranscript, setPastedTranscript] = useState(call.transcript || '');

  // Follow-Up Tasks
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>(() => {
    const all = getFollowUpTasks();
    return all.filter(
      (t) =>
        t.source_call_id === call.call_id ||
        (call.lead_id && t.lead_id === call.lead_id)
    );
  });

  const isAICall = call.call_type === 'AI Call' || call.ai_agent === 'Sophia';
  const hasRecording =
    call.recording_url || call.recording_status === 'Available' || call.duration > 20;

  // Get full transcript text for search & display
  const rawTranscriptText = useMemo(() => {
    if (call.raw_transcript) return call.raw_transcript;
    if (call.transcript_turns && call.transcript_turns.length > 0) {
      return call.transcript_turns
        .map((t) => `[${t.speaker}]: ${t.message}`)
        .join('\n');
    }
    return call.transcript || '';
  }, [call]);

  // Handler for running / re-running Gemini transcript processing
  const handleProcessTranscript = async () => {
    setIsProcessing(true);
    try {
      const textToAnalyze = pastedTranscript || rawTranscriptText;
      const result = await processCallTranscript({
        callId: call.call_id,
        leadId: call.lead_id,
        transcript: textToAnalyze,
        transcript_turns: call.transcript_turns,
        lead: matchedLead,
        callRecord: call,
        duration: call.duration,
      });

      setIntelligence(result);
      setEditedNotes(result.crm_notes);

      // Refresh follow-up tasks
      const all = getFollowUpTasks();
      setFollowUpTasks(
        all.filter(
          (t) =>
            t.source_call_id === call.call_id ||
            (call.lead_id && t.lead_id === call.lead_id)
        )
      );

      // Update call record
      const updatedCall: CallRecord = {
        ...call,
        intelligence: result,
        engagement_score: result.engagement_score,
        lead_temperature: result.lead_temperature,
        raw_transcript: call.raw_transcript || textToAnalyze,
        transcript: textToAnalyze,
        notes: result.crm_notes,
      };
      saveCallRecord(updatedCall);
      if (onUpdateCallRecord) onUpdateCallRecord(updatedCall);

      setActiveTab('analysis');
    } catch (err) {
      console.error('Failed to process transcript:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEditedNotes = () => {
    if (intelligence) {
      const updatedIntel = { ...intelligence, crm_notes: editedNotes };
      saveCallIntelligence(updatedIntel);
      setIntelligence(updatedIntel);
    }
    const updatedCall = { ...call, notes: editedNotes };
    saveCallRecord(updatedCall);
    if (onUpdateCallRecord) onUpdateCallRecord(updatedCall);
    setIsEditingNotes(false);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(editedNotes || intelligence?.crm_notes || call.notes || '');
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    updateFollowUpTask(taskId, { status: nextStatus as any });
    setFollowUpTasks(
      getFollowUpTasks().filter(
        (t) =>
          t.source_call_id === call.call_id ||
          (call.lead_id && t.lead_id === call.lead_id)
      )
    );
  };

  // Search Highlighter Helper
  const highlightSearch = (text: string) => {
    if (!transcriptSearch.trim()) return text;
    const parts = text.split(new RegExp(`(${transcriptSearch})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === transcriptSearch.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-400/30 text-amber-200 px-0.5 rounded border border-amber-500/40"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      id="call-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="call-detail-modal-card"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090d16] border border-slate-800 shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isAICall
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-900/30'
                  : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isAICall ? <Bot className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {call.business_name || 'Prospect Contact'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isAICall
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {call.call_type}
                </span>
                {isAICall && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/50">
                    Agent: Sophia
                  </span>
                )}
                {intelligence?.engagement_score !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Engagement: {intelligence.engagement_score}/100
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Call ID: <span className="font-mono text-slate-300">{call.call_id}</span> •{' '}
                {new Date(call.started_at || call.created_at).toLocaleString()} • Duration:{' '}
                <strong className="text-slate-200">{formatDuration(call.duration)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!intelligence && (
              <button
                onClick={handleProcessTranscript}
                disabled={isProcessing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Analyzing...' : 'Analyze with Gemini'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6 Required Tabs Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800/80 bg-slate-950/70 overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'transcript'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transcript</span>
            {rawTranscriptText && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          {hasRecording && (
            <button
              onClick={() => setActiveTab('recording')}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'recording'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Recording</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Sophia Analysis</span>
            {intelligence && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Ready
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>CRM Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'followup'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Follow-Up</span>
            {followUpTasks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {followUpTasks.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Core Telephony Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Phone Number</div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {formatPhoneNumber(call.phone_number)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Duration</div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {formatDuration(call.duration)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Outcome</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {call.outcome || 'Connected'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Call Status</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">{call.status}</div>
                </div>
              </div>

              {/* Engagement & Sentiment Summary */}
              {intelligence ? (
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Intelligence Summary</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                        Sentiment: {intelligence.sentiment}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Interest: {intelligence.interest_level}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        Engagement: {intelligence.engagement_score}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {intelligence.summary}
                  </p>

                  {/* Next Best Action Preview */}
                  {intelligence.next_best_action && (
                    <div className="p-3 rounded-lg bg-slate-950/80 border border-purple-500/20 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                          Sophia Recommended Action:
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {intelligence.next_best_action.action} (
                          {intelligence.next_best_action.suggested_channel} •{' '}
                          {intelligence.next_best_action.suggested_timing})
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {intelligence.next_best_action.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('followup')}
                        className="px-2.5 py-1 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <span>View Follow-Up</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                  <Bot className="w-8 h-8 text-purple-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">No Post-Call Intelligence Processed Yet</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Run Gemini intelligence extraction to extract summary, sentiment, objections, commitments, and automated CRM notes.
                    </p>
                  </div>
                  <button
                    onClick={handleProcessTranscript}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isProcessing ? 'Processing with Gemini...' : 'Analyze with Gemini'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSCRIPT (With Real-Time Search & Highlight) */}
          {activeTab === 'transcript' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search transcript (e.g., 'pricing', 'SEO', 'call me later', 'budget')..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {transcriptSearch && (
                    <button
                      onClick={() => setTranscriptSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingTranscript ? 'View Turns' : 'Edit / Paste Transcript'}</span>
                </button>
              </div>

              {/* Editable / Pasted Transcript Input Mode */}
              {isEditingTranscript ? (
                <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Edit or Paste Call Transcript</span>
                    <span className="text-[10px] text-slate-500">
                      Original raw transcript is preserved separately
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedTranscript}
                    onChange={(e) => setPastedTranscript(e.target.value)}
                    placeholder="Paste call dialog or conversation text here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsEditingTranscript(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProcessTranscript}
                      disabled={isProcessing || !pastedTranscript.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Analyzing...' : 'Save & Analyze with Gemini'}</span>
                    </button>
                  </div>
                </div>
              ) : call.transcript_turns && call.transcript_turns.length > 0 ? (
                /* Dialogue Turns View */
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {call.transcript_turns.map((turn) => {
                    const isSophia = turn.speaker === 'Sophia';
                    return (
                      <div
                        key={turn.id}
                        className={`p-3 rounded-xl text-xs ${
                          isSophia
                            ? 'bg-purple-950/30 border border-purple-500/20 text-purple-100'
                            : 'bg-slate-800/80 border border-slate-700/80 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold flex items-center gap-1.5">
                            {isSophia && <Bot className="w-3 h-3 text-purple-400" />}
                            <span>{turn.speaker}</span>
                          </span>
                          <span>{turn.timestamp}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {highlightSearch(turn.message)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : rawTranscriptText ? (
                /* Raw Text View */
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {highlightSearch(rawTranscriptText)}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No transcript has been captured or pasted for this call yet.
                  </p>
                  <button
                    onClick={() => setIsEditingTranscript(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
                  >
                    Paste Transcript Manually
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECORDING (Audio Player) */}
          {activeTab === 'recording' && hasRecording && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Call Audio Recording
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    High Quality • 16-bit 48kHz
                  </span>
                </div>

                {/* Simulated Waveform & Scrubber */}
                <div className="space-y-2">
                  <div className="h-14 flex items-end gap-1 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const height = 20 + Math.sin(i * 0.4) * 15 + Math.random() * 20;
                      const isPlayed = (i / 48) * 100 <= playbackProgress;
                      return (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className={`flex-1 rounded-full transition-all ${
                            isPlayed ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      {formatDuration(Math.round((call.duration * playbackProgress) / 100))}
                    </span>
                    <span>{formatDuration(call.duration)}</span>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setPlaybackProgress(0)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Playback Speed selector */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-bold">
                    {([1, 1.25, 1.5] as const).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-0.5 rounded ${
                          playbackSpeed === speed
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOPHIA ANALYSIS (Post-Call Intelligence) */}
          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-fadeIn">
              {intelligence ? (
                <>
                  {/* Executive Summary & Scores */}
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Executive Call Summary</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Model: {intelligence.ai_model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {intelligence.summary}
                    </p>
                  </div>

                  {/* Intent, Needs & Decision Maker Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Intents & Business Needs */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Detected Intents & Business Needs
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(intelligence.intents || []).map((intent, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          >
                            {intent}
                          </span>
                        ))}
                      </div>
                      {intelligence.business_needs && intelligence.business_needs.length > 0 && (
                        <ul className="space-y-1 pt-2 border-t border-slate-800">
                          {intelligence.business_needs.map((need, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-indigo-400">•</span>
                              <span>{need}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Decision Maker Details */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Decision Maker Profile
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-300">
                        <div>
                          <span className="text-slate-400">Name:</span>{' '}
                          <strong className="text-white">
                            {intelligence.decision_maker_info?.name || call.contact_name || 'Owner'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Role:</span>{' '}
                          <span>{intelligence.decision_maker_info?.role || 'General Manager'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Availability:</span>{' '}
                          <span>{intelligence.decision_maker_info?.availability || 'Standard hours'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Authority:</span>{' '}
                          <span className="text-emerald-400 font-semibold">
                            {intelligence.decision_maker_info?.decision_authority || 'Primary Decision Maker'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points */}
                  {intelligence.pain_points && intelligence.pain_points.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Discovered Pain Points
                      </div>
                      <ul className="space-y-1.5">
                        {intelligence.pain_points.map((pt, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Objections Extracted with Quotes and Counters */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        Objections Raised & Suggested Counters
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {intelligence.objections?.length || 0} Recorded
                      </span>
                    </div>

                    {intelligence.objections && intelligence.objections.length > 0 ? (
                      <div className="space-y-3">
                        {intelligence.objections.map((obj, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                {obj.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-300 italic border-l-2 border-rose-500/40 pl-2 py-0.5">
                              "{obj.prospect_statement}"
                            </div>
                            <p className="text-xs text-slate-400">{obj.gemini_summary}</p>
                            <div className="text-xs bg-slate-900 p-2 rounded text-indigo-300 border border-indigo-500/20">
                              <strong className="text-white">Sophia Counter:</strong>{' '}
                              {obj.suggested_response_strategy}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No major objections raised during this call.
                      </p>
                    )}
                  </div>

                  {/* Follow-Up Commitment */}
                  {intelligence.follow_up_commitments && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                        Follow-Up Commitment
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        {intelligence.follow_up_commitments.promise_by_agency && (
                          <p>
                            <strong className="text-white">Agency Promise:</strong>{' '}
                            {intelligence.follow_up_commitments.promise_by_agency}
                          </p>
                        )}
                        {intelligence.follow_up_commitments.prospect_request && (
                          <p>
                            <strong className="text-white">Prospect Request:</strong>{' '}
                            {intelligence.follow_up_commitments.prospect_request}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Click below to generate Gemini post-call analysis from this transcript.
                  </p>
                  <button
                    onClick={handleProcessTranscript}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                  >
                    {isProcessing ? 'Processing...' : 'Analyze with Gemini'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CRM NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    CRM Call Notes
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/50">
                    Generated by Sophia AI
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyNotes}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotes ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isEditingNotes) handleSaveEditedNotes();
                      else setIsEditingNotes(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
                  >
                    {isEditingNotes ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditingNotes ? 'Save Note' : 'Edit Note'}</span>
                  </button>
                </div>
              </div>

              {isEditingNotes ? (
                <textarea
                  rows={12}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
                  {editedNotes || call.notes || 'No CRM notes recorded.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FOLLOW-UP */}
          {activeTab === 'followup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Linked Follow-Up Tasks ({followUpTasks.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Execute directly from queue with full conversation memory
                </span>
              </div>

              {followUpTasks.length > 0 ? (
                <div className="space-y-3">
                  {followUpTasks.map((task) => (
                    <div
                      key={task.follow_up_id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              task.priority === 'Critical'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : task.priority === 'High'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {task.type}
                          </span>
                          <span className="text-xs text-slate-400">
                            Due: <strong className="text-white">{task.recommended_date}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTaskStatus(task.follow_up_id, task.status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                              task.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{task.status}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200">{task.reason}</p>

                      {task.ai_recommendation && (
                        <div className="p-2.5 rounded bg-slate-950 text-xs text-purple-300 border border-purple-500/20">
                          <strong className="text-white">Sophia Recommendation:</strong>{' '}
                          {task.ai_recommendation}
                        </div>
                      )}

                      {/* Direct Contextual Execution Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
                        {matchedLead && onOpenEmail && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenEmail(matchedLead, task);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Send Email Audit</span>
                          </button>
                        )}

                        {matchedLead && onOpenSMS && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenSMS(matchedLead, task);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Send SMS Follow-Up</span>
                          </button>
                        )}

                        {matchedLead && onOpenAICall && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenAICall(matchedLead);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Sophia AI Call</span>
                          </button>
                        )}

                        {onOpenDialer && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenDialer(matchedLead, call.phone_number);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Manual Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No follow-up tasks linked to this call session.
                  </p>
                  <button
                    onClick={handleProcessTranscript}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 text-xs font-bold"
                  >
                    Analyze with Gemini to Auto-Generate Follow-Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
          <div>
            {matchedLead && onSelectLead && (
              <button
                onClick={() => {
                  onClose();
                  onSelectLead(matchedLead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Open Lead Profile</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {matchedLead && onOpenAICall && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAICall(matchedLead);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Sophia AI Call</span>
              </button>
            )}

            {onOpenDialer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDialer(matchedLead, call.phone_number);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Manual Call</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
