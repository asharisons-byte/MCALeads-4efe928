import React, { useState } from 'react';
import {
  Bot,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Phone,
  Radio,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { SophiaDailyBriefingData, TodayPriorityItem, Lead } from '../../types';

interface SophiaBriefingAndPrioritiesProps {
  briefing: SophiaDailyBriefingData;
  priorities: TodayPriorityItem[];
  leads: Lead[];
  onRefreshBriefing: () => void;
  isRefreshing?: boolean;
  onOpenLead: (leadId: string) => void;
  onStartCall?: (leadId: string) => void;
  onStartAICall?: (leadId: string) => void;
  onSendEmail?: (leadId: string) => void;
  onSendSMS?: (leadId: string) => void;
}

export const SophiaBriefingAndPriorities: React.FC<SophiaBriefingAndPrioritiesProps> = ({
  briefing,
  priorities,
  leads,
  onRefreshBriefing,
  isRefreshing = false,
  onOpenLead,
  onStartCall,
  onStartAICall,
  onSendEmail,
  onSendSMS,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [completedPriorityIds, setCompletedPriorityIds] = useState<Set<string>>(new Set());

  // Speech synthesis audio playback
  const toggleAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const textToSpeak = `${briefing.greeting}. ${briefing.summary_paragraphs.join(' ')}. Your top priority is: ${briefing.top_priority.action} for ${briefing.top_priority.lead_name}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      
      // Attempt to find natural English voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find((v) => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English'));
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const togglePriorityComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedPriorityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getActionIcon = (actionType: TodayPriorityItem['action_type']) => {
    switch (actionType) {
      case 'AI Call':
        return <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />;
      case 'Call':
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'SMS':
        return <MessageSquare className="w-3.5 h-3.5 text-violet-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div id="briefing-and-priorities-widget" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Sophia Daily Briefing Card (7 Cols) */}
      <div className="lg:col-span-7 bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-xl p-6 shadow-sm border border-indigo-800/40 relative overflow-hidden flex flex-col justify-between">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 border-b border-indigo-800/50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-white">Sophia Daily Briefing</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    AI Intelligence
                  </span>
                </div>
                <div className="text-xs text-indigo-200/70">
                  Marketing Charm Agency Executive Sales Engine • Generated at {briefing.generated_at}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  isPlayingAudio
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/50 hover:bg-indigo-900/60 hover:text-white'
                }`}
                title={isPlayingAudio ? 'Mute Sophia audio' : 'Listen to Sophia audio briefing'}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Listen</span>
                  </>
                )}
              </button>

              <button
                onClick={onRefreshBriefing}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-indigo-950/60 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-900/60 hover:text-white transition-all disabled:opacity-50"
                title="Refresh Sophia analysis with current data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Briefing Narrative */}
          <div className="space-y-3 text-sm text-indigo-100/90 leading-relaxed">
            <p className="font-medium text-indigo-200">{briefing.greeting}</p>
            {briefing.summary_paragraphs.map((p, idx) => (
              <p key={idx} className="text-slate-300 text-xs sm:text-sm">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Top Priority Highlight Banner */}
        <div className="mt-5 p-3.5 rounded-lg bg-indigo-950/80 border border-indigo-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-600/30 text-indigo-300 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Top Priority Focus
              </div>
              <div className="text-sm font-bold text-white">
                {briefing.top_priority.lead_name}: {briefing.top_priority.action}
              </div>
              <div className="text-xs text-indigo-200/70">{briefing.top_priority.reason}</div>
            </div>
          </div>

          {briefing.top_priority.lead_id && (
            <button
              onClick={() => onOpenLead(briefing.top_priority.lead_id!)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              Open Prospect
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Today's Priorities Panel (5 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Today's Priorities
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  {priorities.filter((p) => !completedPriorityIds.has(p.id)).length} Actionable
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic queue of immediate outreach & closing tasks
              </p>
            </div>
          </div>

          {/* Priorities List */}
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {priorities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No overdue or urgent tasks for today. Agency operations are up to date!
              </div>
            ) : (
              priorities.map((item) => {
                const isCompleted = completedPriorityIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenLead(item.lead_id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 group ${
                      isCompleted
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        : item.priority === 'Critical'
                        ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                        : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Checkbox trigger */}
                    <button
                      onClick={(e) => togglePriorityComplete(item.id, e)}
                      className={`mt-0.5 p-1 rounded-md transition-colors ${
                        isCompleted
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                      title={isCompleted ? 'Mark pending' : 'Mark completed'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-semibold text-xs sm:text-sm truncate ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {item.business_name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 shrink-0">
                          ${item.estimated_mrr.toLocaleString()} MRR
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-slate-100 text-[10px] font-medium text-slate-700">
                          {getActionIcon(item.action_type)}
                          {item.action_type}
                        </span>
                        <span className="truncate">{item.action}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.due_time}
                        </span>

                        {/* Quick action buttons */}
                        <div
                          className="flex items-center gap-1 opacity-90 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.action_type === 'AI Call' && onStartAICall && (
                            <button
                              onClick={() => onStartAICall(item.lead_id)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
                              title="Start Sophia AI Call"
                            >
                              <Radio className="w-3 h-3" />
                              Launch AI
                            </button>
                          )}
                          {item.action_type === 'Call' && onStartCall && (
                            <button
                              onClick={() => onStartCall(item.lead_id)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
                              title="Call Lead"
                            >
                              <Phone className="w-3 h-3" />
                              Dial
                            </button>
                          )}
                          {item.action_type === 'Email' && onSendEmail && (
                            <button
                              onClick={() => onSendEmail(item.lead_id)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                              title="Draft Email"
                            >
                              <Mail className="w-3 h-3" />
                              Email
                            </button>
                          )}
                          {item.action_type === 'SMS' && onSendSMS && (
                            <button
                              onClick={() => onSendSMS(item.lead_id)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 flex items-center gap-1"
                              title="Send SMS"
                            >
                              <MessageSquare className="w-3 h-3" />
                              SMS
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Prioritized by closing probability & MRR</span>
          <span>Sophia Autonomous Dispatch</span>
        </div>
      </div>
    </div>
  );
};
