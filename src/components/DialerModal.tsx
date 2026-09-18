import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Grid,
  FileText,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  X,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import {
  Lead,
  CallRecord,
  CallState,
  CallOutcome,
  CallType,
  CallQueueItem,
  CallScript,
  SophiaTalkingPoints,
  PipelineStage,
} from '../types';
import {
  TelephonyService,
  formatDuration,
  formatPhoneNumber,
  getStoredCallRecords,
} from '../services/telephonyService';
import { TelnyxWebRTCService } from '../services/telnyxWebRTCService';

interface DialerModalProps {
  isOpen: boolean;
  initialLead?: Lead | null;
  initialPhoneNumber?: string;
  onClose: () => void;
  onLeadUpdated?: (leadId: string, updates: Partial<Lead>) => void;
  allLeads?: Lead[];
}

export const DialerModal: React.FC<DialerModalProps> = ({
  isOpen,
  initialLead = null,
  initialPhoneNumber,
  onClose,
  onLeadUpdated,
  allLeads = [],
}) => {
  // Current active lead
  const [activeLead, setActiveLead] = useState<Lead | null>(initialLead);
  const [phoneNumber, setPhoneNumber] = useState<string>(
    initialPhoneNumber || initialLead?.phone || ''
  );

  // Call state & timer
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [activeCallRecord, setActiveCallRecord] = useState<CallRecord | null>(null);

  // Call audio controls
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);

  // Notes & Outcome
  const [callNotes, setCallNotes] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const [showDoNotContactConfirm, setShowDoNotContactConfirm] = useState(false);
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);

  // Panels & Views
  const [leftTab, setLeftTab] = useState<'queue' | 'recent'>('queue');
  const [rightTab, setRightTab] = useState<'sophia' | 'script' | 'intel'>('sophia');

  // Call Queue state
  const [callQueue, setCallQueue] = useState<CallQueueItem[]>(() =>
    TelephonyService.getCallQueue()
  );
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>(() =>
    getStoredCallRecords().slice(0, 10)
  );

  // Sophia Assistant & Script state
  const [talkingPoints, setTalkingPoints] = useState<SophiaTalkingPoints | null>(null);
  const [callScript, setCallScript] = useState<CallScript | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Contact search in manual dial
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  // Timers & Polling refs
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isWebRTCConnected, setIsWebRTCConnected] = useState(false);
  const [webRTCStatus, setWebRTCStatus] = useState<string>('Idle');

  // Diagnostic Panel state
  const [diagnosticInfo, setDiagnosticInfo] = useState<{
    callId: string;
    lastError: string;
    stage: string;
    code: string;
    time: string;
    pstnResult: string;
    tokenStatus: string;
    tokenFetched: string;
    tokenExpires: string;
    wssStatus: string;
    sipRegistered: string;
  } | null>(null);

  // Helper to log and track diagnostics
  const addDiagnostic = (updates: Partial<{
    stage: string;
    error: string;
    code: string;
    pstnResult: string;
    tokenStatus: string;
    tokenFetched: string;
    tokenExpires: string;
    wssStatus: string;
    sipRegistered: string;
  }>) => {
    const diagnosticId = `MCA-CALL-${Date.now().toString().slice(-6)}`;
    const time = new Date().toLocaleTimeString();
    
    setDiagnosticInfo(prev => ({
      callId: prev?.callId || diagnosticId,
      lastError: updates.error || prev?.lastError || '',
      stage: updates.stage || prev?.stage || '',
      code: updates.code || prev?.code || '',
      time,
      pstnResult: updates.pstnResult || prev?.pstnResult || '',
      tokenStatus: updates.tokenStatus || prev?.tokenStatus || 'unknown',
      tokenFetched: updates.tokenFetched || prev?.tokenFetched || 'N/A',
      tokenExpires: updates.tokenExpires || prev?.tokenExpires || 'N/A',
      wssStatus: updates.wssStatus || prev?.wssStatus || 'unknown',
      sipRegistered: updates.sipRegistered || prev?.sipRegistered || 'unknown',
    }));
  };

  const mapTelnyxState = (state: string): CallState => {
    switch (state) {
        case 'active': return 'CONNECTED';
        case 'ringing': return 'RINGING';
        case 'ended': return 'COMPLETED';
        case 'hangup': return 'COMPLETED';
        case 'destroy': return 'COMPLETED';
        default: return 'CALLING';
    }
  };

  // When initial lead or phone changes
  useEffect(() => {
    if (initialLead) {
      setActiveLead(initialLead);
      setPhoneNumber(initialLead.phone || '');
    } else if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber);
      const matched = allLeads.find(
        (l) => l.phone && l.phone.replace(/\D/g, '') === initialPhoneNumber.replace(/\D/g, '')
      );
      if (matched) setActiveLead(matched);
    }
  }, [initialLead, initialPhoneNumber, allLeads]);

  // Load Sophia talking points & script whenever active lead changes
  useEffect(() => {
    if (activeLead) {
      TelephonyService.getSophiaTalkingPoints(activeLead).then((pts) => {
        setTalkingPoints(pts);
      });
      TelephonyService.generateCallScript(activeLead).then((sc) => {
        setCallScript(sc);
      });
    } else {
      setTalkingPoints(null);
      setCallScript(null);
    }
  }, [activeLead]);

  // Refresh Queue and Recents
  const refreshQueue = () => {
    setCallQueue(TelephonyService.getCallQueue());
    setRecentCalls(getStoredCallRecords().slice(0, 10));
  };

  // Duration Timer management
  useEffect(() => {
    if (callState === 'CONNECTED') {
      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    } else if (callState === 'ON_HOLD') {
      // Pause duration increment on hold
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    } else if (
      callState === 'COMPLETED' ||
      callState === 'FAILED' ||
      callState === 'NO_ANSWER' ||
      callState === 'BUSY' ||
      callState === 'IDLE'
    ) {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [callState]);

  // Status polling from backend during active call
  useEffect(() => {
    if (
      activeCallRecord &&
      (callState === 'PREPARING' ||
        callState === 'CALLING' ||
        callState === 'RINGING' ||
        callState === 'CONNECTED' ||
        callState === 'ON_HOLD')
    ) {
      statusPollingRef.current = setInterval(async () => {
        const res = await TelephonyService.getCallStatus(activeCallRecord.call_id);
        if (res.status && res.status !== callState) {
          setCallState(res.status);
          if (res.duration !== undefined && res.duration > callDuration) {
            setCallDuration(res.duration);
          }
        }
      }, 1200);
    } else {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
    }

    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
    };
  }, [activeCallRecord, callState, callDuration]);

  // Check if phone number is available
  const hasPhoneNumber = Boolean(phoneNumber && phoneNumber.trim() && phoneNumber !== 'Not Available');

  // Handle Call Start
  const handleStartCall = async () => {
    if (!hasPhoneNumber) return;

    setCallDuration(0);
    setCallState('PREPARING');
    setWebRTCStatus('Initializing WebRTC...');
    setSelectedOutcome(null);
    setDiagnosticInfo(null); // Clear previous diagnostics

    // 1. Try WebRTC
    try {
      addDiagnostic({ stage: 'webrtc:init' });
      setWebRTCStatus('Registering...');
      const client = await TelnyxWebRTCService.init();
      
      addDiagnostic({ stage: 'webrtc:connect:start' });
      setWebRTCStatus('Starting WebRTC call...');
      await TelnyxWebRTCService.makeCall(
        phoneNumber, 
        '+14052853816', 
        (state) => {
            console.log(`[MCA WebRTC] SDK State: ${state}`);
            addDiagnostic({ stage: `webrtc:status:${state}` });
            
            const internalState = mapTelnyxState(state);
            setCallState(internalState);
            setWebRTCStatus(state);
        }, 
        remoteAudioRef.current!
      );
      
      setIsWebRTCConnected(true);
      return;
    } catch (e: any) {
      console.error('[MCA WebRTC ERROR] Fallback triggered:', e);
      addDiagnostic({ stage: 'webrtc:connect:error', error: e.message || 'Unknown WebRTC error', code: e.code || 'N/A' });
      setWebRTCStatus(`Failed: ${e.message || 'Error'}`);
      setIsWebRTCConnected(false);
      // Wait for user to see the error
      await new Promise(r => setTimeout(r, 1000));
    }

    // 2. Fallback to PSTN
    addDiagnostic({ stage: 'pstn:fallback:start' });
    setWebRTCStatus('PSTN Fallback');
    const callType: CallType = activeLead ? 'Outbound Call' : 'Manual Call';
    
    try {
        const result = await TelephonyService.startCall({
            lead: activeLead,
            phoneNumber,
            callType,
        });
        
        addDiagnostic({ stage: 'pstn:start-success', pstnResult: JSON.stringify(result) });

        if (result.success) {
            setActiveCallRecord(result.callRecord);
            setCallState(result.session.status || 'PREPARING');
        } else {
            addDiagnostic({ stage: 'pstn:start-error', error: 'PSTN start failed', code: 'N/A' });
            setCallState('FAILED');
        }
    } catch (e: any) {
        addDiagnostic({ stage: 'pstn:start-error', error: e.message || 'Unknown PSTN error', code: 'N/A' });
        setCallState('FAILED');
    }
  };

  // Handle Call End
  const handleEndCall = async () => {
    // 1. If WebRTC call, disconnect it
    if (isWebRTCConnected) {
      await TelnyxWebRTCService.disconnect();
      setIsWebRTCConnected(false);
      setCallState('COMPLETED');
      return;
    }

    // 2. Fallback to PSTN
    if (!activeCallRecord) {
      setCallState('COMPLETED');
      return;
    }

    const { callRecord } = await TelephonyService.endCall(activeCallRecord.call_id, {
      duration: callDuration,
      notes: callNotes,
    });

    setActiveCallRecord(callRecord);
    setCallState('COMPLETED');
    refreshQueue();
  };

  // Handle Mute Toggle
  const handleToggleMute = async () => {
    if (!activeCallRecord) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    await TelephonyService.muteCall(activeCallRecord.call_id, newMute);
  };

  // Handle Hold Toggle
  const handleToggleHold = async () => {
    if (!activeCallRecord) return;
    const newHold = !isOnHold;
    setIsOnHold(newHold);
    setCallState(newHold ? 'ON_HOLD' : 'CONNECTED');
    await TelephonyService.holdCall(activeCallRecord.call_id, newHold);
  };

  // Keypad press (DTMF simulator)
  const handleKeypadPress = (digit: string) => {
    if (callState === 'IDLE') {
      setPhoneNumber((prev) => prev + digit);
    } else {
      // Audio click / DTMF feedback during call
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // audio context blocked or unsupported
      }
    }
  };

  // Handle Outcome Selection
  const handleSelectOutcome = (outcome: CallOutcome) => {
    if (outcome === 'Do Not Contact') {
      setShowDoNotContactConfirm(true);
    } else {
      setSelectedOutcome(outcome);
    }
  };

  // Save Outcome & Notes
  const handleSaveOutcomeAndClose = async () => {
    if (!activeCallRecord || !selectedOutcome) return;

    setIsSavingOutcome(true);
    await TelephonyService.setCallOutcome({
      callRecord: activeCallRecord,
      outcome: selectedOutcome,
      notes: callNotes,
      duration: callDuration,
      lead: activeLead,
      onLeadUpdate: onLeadUpdated,
    });

    setIsSavingOutcome(false);
    refreshQueue();

    // Check if there is next lead in queue
    const queue = TelephonyService.getCallQueue().filter((q) => q.status === 'pending');
    if (queue.length > 0 && queue[0].lead_id !== activeLead?.lead_id) {
      const nextItem = queue[0];
      const nextLead = allLeads.find((l) => l.lead_id === nextItem.lead_id);
      if (nextLead) {
        loadLeadIntoDialer(nextLead);
        return;
      }
    }

    onClose();
  };

  // Load a lead into the dialer
  const loadLeadIntoDialer = (lead: Lead) => {
    setActiveLead(lead);
    setPhoneNumber(lead.phone || '');
    setCallState('IDLE');
    setCallDuration(0);
    setActiveCallRecord(null);
    setCallNotes('');
    setSelectedOutcome(null);
    setIsMuted(false);
    setIsOnHold(false);
  };

  // Regenerate script with Sophia
  const handleRegenerateScript = async () => {
    if (!activeLead) return;
    setIsLoadingScript(true);
    const updated = await TelephonyService.generateCallScript(activeLead);
    setCallScript(updated);
    setIsLoadingScript(false);
  };

  // Copy full script
  const handleCopyScript = () => {
    if (!callScript) return;
    const text = `
=== MCA COLD CALL SCRIPT for ${activeLead?.business_name || 'Prospect'} ===

1. OPENING:
${callScript.opening}

2. DISCOVERY QUESTIONS:
${callScript.discovery_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

3. OPPORTUNITY DISCUSSION:
${callScript.opportunity_discussion}

4. SERVICE INTRODUCTION:
${callScript.service_introduction}

5. COMMON OBJECTIONS:
${callScript.common_objections.map((o) => `• Objection: ${o.objection}\n  Counter: ${o.counter}`).join('\n\n')}

6. CLOSING:
${callScript.closing}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  if (!isOpen) return null;

  const outcomesList: CallOutcome[] = [
    'Interested',
    'Follow Up',
    'Send Information',
    'Send Audit',
    'Meeting Requested',
    'Proposal Requested',
    'Voicemail',
    'No Answer',
    'Not Interested',
    'Wrong Number',
    'Do Not Contact',
  ];

  return (
    <div
      id="mca-dialer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/90 bg-[#0d1322]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  MCA Professional CRM Dialer
                </h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <span className={`w-1.5 h-1.5 rounded-full ${isWebRTCConnected ? 'bg-emerald-400' : 'bg-slate-400'} animate-pulse`} />
                  {isWebRTCConnected ? `WebRTC: ${webRTCStatus}` : webRTCStatus.startsWith('Failed') ? `PSTN Fallback (${webRTCStatus})` : 'PSTN Fallback Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct browser VoIP dialing powered by MCA telephony engine & Sophia sales intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Panel */}
        {diagnosticInfo && (
          <div className="px-5 py-3 bg-rose-950/20 border-b border-rose-900/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Call Diagnostics (ID: {diagnosticInfo.callId})
              </h3>
              <button 
                onClick={() => setDiagnosticInfo(null)}
                className="text-[10px] text-rose-400 hover:text-rose-200 underline"
              >
                Clear Error
              </button>
            </div>
            <div className="text-[11px] font-mono text-rose-200/80 space-y-1">
              <p>Stage: <span className="text-white">{diagnosticInfo.stage}</span></p>
              <p>Error: <span className="text-white">{diagnosticInfo.lastError || 'N/A'}</span></p>
              <p>Code: <span className="text-white">{diagnosticInfo.code || 'N/A'}</span></p>
              <p>Time: <span className="text-white">{diagnosticInfo.time}</span></p>
              <p>Token Status: <span className="text-white">{diagnosticInfo.tokenStatus}</span></p>
              <p>Token Fetched: <span className="text-white">{diagnosticInfo.tokenFetched}</span></p>
              <p>Token Expires: <span className="text-white">{diagnosticInfo.tokenExpires}</span></p>
              <p>WSS Connected: <span className="text-white">{diagnosticInfo.wssStatus}</span></p>
              <p>SIP Registered: <span className="text-white">{diagnosticInfo.sipRegistered}</span></p>
            </div>
          </div>
        )}

        {/* 3-Panel Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
          {/* ======================================================== */}
          {/* LEFT PANEL: Call Queue & Recent Leads (Cols 1-3) */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 flex flex-col min-h-0 bg-[#090d16] border-r border-slate-800/80">
            {/* Left Header Tabs */}
            <div className="flex items-center p-2 gap-1 border-b border-slate-800/80 bg-slate-900/40">
              <button
                onClick={() => setLeftTab('queue')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  leftTab === 'queue'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Call Queue ({callQueue.filter((q) => q.status === 'pending').length})
              </button>
              <button
                onClick={() => setLeftTab('recent')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  leftTab === 'recent'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recent Calls
              </button>
            </div>

            {/* Left Panel Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {leftTab === 'queue' ? (
                callQueue.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Call queue is empty</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Add leads from the Leads Table or Pipeline to prioritize today's cold outreach.
                    </p>
                  </div>
                ) : (
                  callQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        activeLead?.lead_id === item.lead_id
                          ? 'bg-indigo-950/40 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-white truncate max-w-[140px]">
                          {item.business_name}
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {item.lead_score}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {formatPhoneNumber(item.phone_number)}
                      </div>
                      {item.opportunity && (
                        <div className="text-[10px] text-slate-400 truncate mt-1">
                          {item.opportunity}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => {
                            const found = allLeads.find((l) => l.lead_id === item.lead_id);
                            if (found) loadLeadIntoDialer(found);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Load Lead</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              TelephonyService.skipCallQueueItem(item.id);
                              refreshQueue();
                            }}
                            className="px-1.5 py-1 rounded text-slate-400 hover:text-slate-200 text-[10px]"
                            title="Skip this lead"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => {
                              TelephonyService.removeFromCallQueue(item.id);
                              refreshQueue();
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 text-[10px]"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* Recent Calls List */
                recentCalls.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No recent calls recorded</p>
                  </div>
                ) : (
                  recentCalls.map((rc) => (
                    <div
                      key={rc.call_id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white truncate max-w-[130px]">
                          {rc.business_name}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDuration(rc.duration)}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {formatPhoneNumber(rc.phone_number)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {rc.outcome || rc.status}
                        </span>
                        <button
                          onClick={() => {
                            if (rc.lead_id) {
                              const found = allLeads.find((l) => l.lead_id === rc.lead_id);
                              if (found) loadLeadIntoDialer(found);
                            } else {
                              setActiveLead(null);
                              setPhoneNumber(rc.phone_number);
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Call Again</span>
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* CENTER PANEL: Active Call & Call Controls (Cols 4-8) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col min-h-0 bg-[#0c101d] overflow-y-auto p-5 space-y-5">
            {/* Active Lead Header Profile */}
            <div className="p-4 rounded-2xl bg-[#111728] border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-white">
                      {activeLead?.business_name || 'Manual Dialer Entry'}
                    </h3>
                    {!activeLead && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Unlinked Call
                      </span>
                    )}
                  </div>
                  {activeLead?.contact_name && (
                    <p className="text-xs text-slate-400">
                      Contact: <span className="text-slate-200 font-semibold">{activeLead.contact_name}</span>
                    </p>
                  )}
                  {activeLead?.niche && (
                    <p className="text-[11px] text-slate-400">
                      {activeLead.niche} • {activeLead.city || 'Portland'}, {activeLead.state || 'OR'}
                    </p>
                  )}
                </div>

                {activeLead?.lead_score !== undefined && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lead Score
                    </div>
                    <div className="text-xl font-extrabold font-mono text-amber-400">
                      {activeLead.lead_score}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Opportunity & Retainer Pills */}
              {activeLead && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">Opportunity Angle</span>
                    <span className="text-slate-200 font-bold truncate block">
                      {activeLead.opportunity_angle || activeLead.recommended_service || 'Local Search Optimization'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">Est. Retainer</span>
                    <span className="text-emerald-400 font-bold block">
                      ${activeLead.estimated_retainer || 2400}/mo
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number Input & Validation Check */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Dialing Destination Number</span>
                {activeLead && (
                  <button
                    onClick={() => {
                      setActiveLead(null);
                      setPhoneNumber('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    Clear Lead Link
                  </button>
                )}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number (e.g. +1 503-241-7998)"
                  disabled={callState !== 'IDLE' && callState !== 'FAILED'}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-80"
                />
                <button
                  onClick={() => setShowKeypad(!showKeypad)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    showKeypad
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Toggle numeric dial pad"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Requirement 2: Warning if no phone number exists */}
              {!hasPhoneNumber && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    No phone number is available for this lead. Do not invent or generate a phone number.
                  </span>
                </div>
              )}
            </div>

            {/* Collapsible Numeric Dial Pad */}
            {showKeypad && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
                  {[
                    { num: '1', sub: '' },
                    { num: '2', sub: 'ABC' },
                    { num: '3', sub: 'DEF' },
                    { num: '4', sub: 'GHI' },
                    { num: '5', sub: 'JKL' },
                    { num: '6', sub: 'MNO' },
                    { num: '7', sub: 'PQRS' },
                    { num: '8', sub: 'TUV' },
                    { num: '9', sub: 'WXYZ' },
                    { num: '*', sub: '' },
                    { num: '0', sub: '+' },
                    { num: '#', sub: '' },
                  ].map((btn) => (
                    <button
                      key={btn.num}
                      onClick={() => handleKeypadPress(btn.num)}
                      className="h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-800 flex flex-col items-center justify-center transition-all"
                    >
                      <span className="text-base font-bold text-white leading-none font-mono">
                        {btn.num}
                      </span>
                      {btn.sub && (
                        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
                          {btn.sub}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {callState === 'IDLE' && (
                  <div className="flex justify-center gap-3 mt-3">
                    <button
                      onClick={() => setPhoneNumber((p) => p.slice(0, -1))}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Backspace
                    </button>
                    <button
                      onClick={() => setPhoneNumber('')}
                      className="text-xs text-rose-400 hover:text-rose-300 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Live Call Status & Duration Display */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#101729] to-[#0d1222] border border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                {callState === 'CONNECTED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Connected
                  </span>
                ) : callState === 'CALLING' || callState === 'PREPARING' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Calling...
                  </span>
                ) : callState === 'RINGING' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    Ringing...
                  </span>
                ) : callState === 'ON_HOLD' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Pause className="w-3 h-3" />
                    On Hold
                  </span>
                ) : callState === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Call Ended
                  </span>
                ) : callState === 'FAILED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    Unable to connect call
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 text-xs font-semibold">
                    Ready to Call
                  </span>
                )}
              </div>

              {/* Requirement 9: Duration Timer */}
              <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                {formatDuration(callDuration)}
              </div>

              {callState === 'FAILED' && (
                <p className="text-xs text-rose-400">
                  Unable to connect the call. Please check the number and try again.
                </p>
              )}
            </div>

            {/* Requirement 4: Professional Call Controls */}
            <div className="flex items-center justify-center gap-3">
              {callState === 'IDLE' || callState === 'FAILED' ? (
                <button
                  onClick={handleStartCall}
                  disabled={!hasPhoneNumber}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Start Outbound Call</span>
                </button>
              ) : callState === 'PREPARING' ||
                callState === 'CALLING' ||
                callState === 'RINGING' ||
                callState === 'CONNECTED' ||
                callState === 'ON_HOLD' ? (
                <div className="w-full flex items-center justify-center gap-3">
                  {/* Mute Button */}
                  <button
                    onClick={handleToggleMute}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
                      isMuted
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? 'Muted' : 'Mute'}</span>
                  </button>

                  {/* Hold Button */}
                  <button
                    onClick={handleToggleHold}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
                      isOnHold
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>{isOnHold ? 'Resume' : 'Hold'}</span>
                  </button>

                  {/* Keypad Button */}
                  <button
                    onClick={() => setShowKeypad(!showKeypad)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
                      showKeypad
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Keypad</span>
                  </button>

                  {/* End Call Button */}
                  <button
                    onClick={handleEndCall}
                    className="flex-1 py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                </div>
              ) : null}
            </div>

            {/* Live Call Notes (Requirement 10) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Call Notes</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Saved automatically to Lead Timeline & Call Record
                </span>
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => {
                  setCallNotes(e.target.value);
                  if (activeCallRecord) {
                    TelephonyService.saveCallNotes(activeCallRecord.call_id, e.target.value);
                  }
                }}
                rows={3}
                placeholder="Type real-time notes: Prospect interested in SEO, asked for pricing, requested Friday callback..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Requirement 11: Call Outcome Screen (after call completed) */}
            {callState === 'COMPLETED' && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Select Call Outcome</span>
                  </h4>
                  <span className="text-[10px] text-indigo-300 font-medium">
                    Required to finalize call record
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {outcomesList.map((outcome) => (
                    <button
                      key={outcome}
                      onClick={() => handleSelectOutcome(outcome)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedOutcome === outcome
                          ? outcome === 'Do Not Contact'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-indigo-600 text-white shadow-sm'
                          : outcome === 'Do Not Contact'
                          ? 'bg-slate-900 text-rose-400 border border-rose-500/30 hover:bg-rose-950/40'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {outcome}
                    </button>
                  ))}
                </div>

                {/* Save and Close Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Discard & Close
                  </button>
                  <button
                    onClick={handleSaveOutcomeAndClose}
                    disabled={!selectedOutcome || isSavingOutcome}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {isSavingOutcome ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Notes & Set Outcome</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: Sophia Assistant & Call Script (Cols 9-12) */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col min-h-0 bg-[#090d16] overflow-hidden border-l border-slate-800/80">
            {/* Right Tabs */}
            <div className="flex items-center p-2 gap-1 border-b border-slate-800/80 bg-slate-900/40">
              <button
                onClick={() => setRightTab('sophia')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  rightTab === 'sophia'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Sophia Assist</span>
              </button>
              <button
                onClick={() => setRightTab('script')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  rightTab === 'script'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3 text-blue-400" />
                <span>Call Script</span>
              </button>
              <button
                onClick={() => setRightTab('intel')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  rightTab === 'intel'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3 h-3 text-amber-400" />
                <span>Lead Intel</span>
              </button>
            </div>

            {/* Right Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: Sophia Call Assistant Panel (Requirement 23) */}
              {rightTab === 'sophia' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sophia Real-Time Talking Points</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {talkingPoints?.lead_context ||
                        'Sophia assists you during manual cold calls with grounded talking points and discovery questions.'}
                    </p>
                  </div>

                  {/* Recommended Talking Points */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recommended Talking Points
                    </span>
                    <div className="space-y-1">
                      {(talkingPoints?.talking_points || [
                        `Acknowledge their established reputation in ${activeLead?.city || 'Oregon'}.`,
                        `Point out the high-intent keywords competitors are capturing.`,
                        `Highlight MCA's managed lead acquisition model.`,
                      ]).map((tp, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                        >
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{tp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Discovery Questions */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Sophia Suggested Discovery Questions
                    </span>
                    <div className="space-y-1">
                      {(talkingPoints?.recommended_questions || [
                        `"How are you currently generating most of your new leads?"`,
                        `"Are you satisfied with your inbound Google Map ranking volume?"`,
                        `"If we could send you 5 more high-margin jobs next month, could your crew handle it?"`,
                      ]).map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 italic"
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Objection Counters */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Common Objections & Quick Counters
                    </span>
                    <div className="space-y-2">
                      {(talkingPoints?.objections || [
                        {
                          objection: 'Already working with another agency',
                          counter: 'Many clients do too; MCA handles hyper-local search rank and speed conversions.',
                        },
                        {
                          objection: 'Too busy right now',
                          counter: 'Great time to stabilize high-margin jobs before the slow season.',
                        },
                      ]).map((obj, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                        >
                          <div className="font-bold text-rose-300">"{obj.objection}"</div>
                          <div className="text-slate-300 text-[11px]">{obj.counter}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Next Action */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Suggested Next Action
                    </span>
                    <p className="text-slate-200">
                      {talkingPoints?.suggested_next_action ||
                        'Secure verbal agreement to send customized 2-page digital audit and schedule 10-minute follow-up.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Structured 6-Part Call Script (Requirement 24) */}
              {rightTab === 'script' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">6-Part Sales Call Script</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleRegenerateScript}
                        disabled={isLoadingScript}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
                        title="Regenerate Script with Sophia"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingScript ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={handleCopyScript}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
                        title="Copy Script"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {callScript ? (
                    <div className="space-y-3 text-xs">
                      {/* 1. Opening */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                          1. Opening
                        </span>
                        <p className="text-slate-200 leading-relaxed">{callScript.opening}</p>
                      </div>

                      {/* 2. Discovery Questions */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                          2. Discovery Questions
                        </span>
                        <ul className="space-y-1 list-disc list-inside text-slate-200">
                          {callScript.discovery_questions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Opportunity Discussion */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          3. Opportunity Discussion
                        </span>
                        <p className="text-slate-200 leading-relaxed">{callScript.opportunity_discussion}</p>
                      </div>

                      {/* 4. Service Introduction */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          4. Service Introduction
                        </span>
                        <p className="text-slate-200 leading-relaxed">{callScript.service_introduction}</p>
                      </div>

                      {/* 5. Common Objections */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          5. Common Objections
                        </span>
                        {callScript.common_objections.map((obj, i) => (
                          <div key={i} className="pt-1.5 border-t border-slate-800/60 first:border-0 first:pt-0">
                            <div className="font-semibold text-rose-300">"{obj.objection}"</div>
                            <div className="text-slate-300 mt-0.5">{obj.counter}</div>
                          </div>
                        ))}
                      </div>

                      {/* 6. Closing */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          6. Closing & Next Step
                        </span>
                        <p className="text-slate-200 leading-relaxed">{callScript.closing}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      Loading Sophia sales script...
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Lead Intel Breakdown */}
              {rightTab === 'intel' && (
                <div className="space-y-3 text-xs">
                  {activeLead ? (
                    <>
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="font-bold text-white">Digital Footprint</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">GMB Rating</span>
                            <span className="font-bold text-amber-400">
                              {activeLead.gmb_rating ? `${activeLead.gmb_rating} ★` : 'Thin / None'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Reviews</span>
                            <span className="font-bold text-slate-200">
                              {activeLead.gmb_review_count || 0} reviews
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Speed Score</span>
                            <span className="font-bold text-slate-200">
                              {activeLead.pagespeed_score ? `${activeLead.pagespeed_score}/100` : 'Untested'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Pipeline Stage</span>
                            <span className="font-bold text-indigo-400">
                              {activeLead.pipeline_stage}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Marketing Gaps */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-white">Identified Marketing Gaps</div>
                        {activeLead.marketing_gaps && activeLead.marketing_gaps.length > 0 ? (
                          <div className="space-y-1">
                            {activeLead.marketing_gaps.map((gap, i) => (
                              <div
                                key={i}
                                className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]"
                              >
                                {gap}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-[11px]">No critical marketing gaps detected.</p>
                        )}
                      </div>

                      {/* Lead Notes Snippet */}
                      {activeLead.notes && activeLead.notes.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                          <div className="font-bold text-white">Previous Notes ({activeLead.notes.length})</div>
                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {activeLead.notes.slice(0, 3).map((n) => (
                              <div key={n.note_id} className="p-2 rounded bg-slate-950 text-[11px] text-slate-300">
                                {n.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No lead loaded. Intel will display when a CRM lead is linked to this dial session.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 25: Do Not Contact Confirmation Dialog */}
      {showDoNotContactConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#111728] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Mark this contact as Do Not Contact?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This will immediately add {formatPhoneNumber(phoneNumber)} to the strict suppression registry.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
              Marking a contact as <strong>Do Not Contact</strong> permanently blocks all future outbound phone calls, automated SMS messages, and email campaigns to guarantee complete TCPA compliance.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <audio ref={remoteAudioRef} />
              <button
                onClick={() => setShowDoNotContactConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedOutcome('Do Not Contact');
                  setShowDoNotContactConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Confirm Do Not Contact
              </button>
            </div>
          </div>
        </div>
      )}
        {/* Audio element for WebRTC */}
        <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};
