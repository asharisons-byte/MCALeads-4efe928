import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Bot,
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Tag,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  Send,
  ExternalLink,
  History,
  GitCommit,
  ShieldAlert,
} from 'lucide-react';
import { ActivityEvent, Lead, PipelineStageHistoryEntry, Communication } from '../types';

interface ActivityTimelineProps {
  lead: Lead;
  activities: ActivityEvent[];
  communications?: Communication[];
  onAddNoteClick?: () => void;
}

type TimelineFilter = 'all' | 'emails' | 'calls' | 'messaging' | 'notes' | 'pipeline' | 'follow_ups';

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  lead,
  activities,
  communications = [],
  onAddNoteClick,
}) => {
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [expandedActivityIds, setExpandedActivityIds] = useState<Record<string, boolean>>({});
  const [activeSubView, setActiveSubView] = useState<'timeline' | 'stage_history' | 'comms_log'>('timeline');

  const toggleExpand = (id: string) => {
    setExpandedActivityIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter activities based on selected category
  const filteredActivities = activities.filter((act) => {
    const type = act.activity_type || act.type;
    if (filter === 'all') return true;
    if (filter === 'emails') {
      return (
        type === 'email_prepared' ||
        type === 'email_sent' ||
        type === 'email_received' ||
        type === 'email_draft_created' ||
        act.channel === 'EMAIL'
      );
    }
    if (filter === 'calls') {
      return (
        type === 'call_made' ||
        type === 'ai_call_made' ||
        type === 'call_started' ||
        type === 'call_connected' ||
        type === 'call_completed' ||
        type === 'call_failed' ||
        type === 'call_note_added' ||
        type === 'call_outcome_set' ||
        type === 'contact_do_not_contact' ||
        act.channel === 'CALL' ||
        act.channel === 'AI_CALL'
      );
    }
    if (filter === 'messaging') {
      return (
        type === 'sms_sent' ||
        type === 'sms_received' ||
        type === 'sms_delivered' ||
        type === 'sms_draft_created' ||
        type === 'contact_opted_out' ||
        act.channel === 'SMS'
      );
    }
    if (filter === 'notes') {
      return type === 'note_added' || act.channel === 'NOTE';
    }
    if (filter === 'pipeline') {
      return (
        type === 'pipeline_stage_changed' ||
        type === 'stage_changed' ||
        type === 'score_updated' ||
        type === 'lead_created' ||
        type === 'lead_imported' ||
        type === 'audit_sent' ||
        type === 'proposal_sent' ||
        act.channel === 'PIPELINE' ||
        act.channel === 'SYSTEM'
      );
    }
    if (filter === 'follow_ups') {
      return (
        type === 'follow_up_created' ||
        type === 'follow_up_completed' ||
        act.channel === 'FOLLOW_UP'
      );
    }
    return true;
  });

  const getActivityIcon = (act: ActivityEvent) => {
    const type = act.activity_type || act.type;
    switch (type) {
      case 'call_made':
      case 'call_started':
      case 'call_connected':
      case 'call_completed':
      case 'call_outcome_set':
        return {
          icon: <Phone className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        };
      case 'call_failed':
        return {
          icon: <PhoneOff className="w-4 h-4 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        };
      case 'call_note_added':
        return {
          icon: <FileText className="w-4 h-4 text-sky-400" />,
          bg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        };
      case 'contact_do_not_contact':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        };
      case 'ai_call_made':
        return {
          icon: <Bot className="w-4 h-4 text-purple-400" />,
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
        };
      case 'sms_sent':
      case 'sms_delivered':
      case 'sms_draft_created':
        return {
          icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        };
      case 'sms_received':
        return {
          icon: <MessageSquare className="w-4 h-4 text-sky-400" />,
          bg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        };
      case 'contact_opted_out':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        };
      case 'email_sent':
      case 'email_received':
      case 'email_prepared':
      case 'email_draft_created':
        return {
          icon: <Mail className="w-4 h-4 text-blue-400" />,
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        };
      case 'note_added':
        return {
          icon: <FileText className="w-4 h-4 text-indigo-400" />,
          bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
        };
      case 'follow_up_created':
      case 'follow_up_completed':
        return {
          icon: <Calendar className="w-4 h-4 text-amber-400" />,
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        };
      case 'pipeline_stage_changed':
      case 'stage_changed':
        return {
          icon: <GitCommit className="w-4 h-4 text-violet-400" />,
          bg: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
        };
      case 'ai_analysis_generated':
      case 'ai_pitch_generated':
        return {
          icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
          bg: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400',
        };
      case 'audit_sent':
      case 'proposal_sent':
        return {
          icon: <Send className="w-4 h-4 text-teal-400" />,
          bg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
        };
      case 'lead_created':
      case 'lead_imported':
      default:
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        };
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div id="mca-activity-timeline-container" className="space-y-6">
      {/* Top Header & Sub-navigation (Timeline / Stage History / Comms Log) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubView === 'timeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Unified Activity Feed ({activities.length})
          </button>

          <button
            onClick={() => setActiveSubView('stage_history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubView === 'stage_history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Stage History ({lead.stage_history?.length || 1})
          </button>

          <button
            onClick={() => setActiveSubView('comms_log')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubView === 'comms_log'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Comms Records ({communications.length})
          </button>
        </div>

        {onAddNoteClick && (
          <button
            onClick={onAddNoteClick}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Write Quick Note</span>
          </button>
        )}
      </div>

      {/* VIEW 1: UNIFIED ACTIVITY FEED */}
      {activeSubView === 'timeline' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-slate-500" />
              <span>Filter:</span>
            </span>

            {[
              { id: 'all', label: `All (${activities.length})` },
              { id: 'emails', label: 'Email Outreach' },
              { id: 'calls', label: 'Calls & AI' },
              { id: 'messaging', label: 'SMS' },
              { id: 'notes', label: `Notes (${lead.notes?.length || 0})` },
              { id: 'pipeline', label: 'Pipeline & Status' },
              { id: 'follow_ups', label: 'Follow-Ups' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as TimelineFilter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeline Stream */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-slate-800">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((act) => {
                const { icon, bg } = getActivityIcon(act);
                const isExpanded = Boolean(expandedActivityIds[act.id]);
                const author = act.source || act.author || 'Sophia (AI)';
                const isSophia = author.toLowerCase().includes('sophia');

                return (
                  <div key={act.id} className="relative group">
                    {/* Event Icon Pin */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shadow-md ${bg}`}
                    >
                      {icon}
                    </div>

                    {/* Event Card */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white tracking-tight">
                            {act.title}
                          </span>

                          {/* Author Badge */}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              isSophia
                                ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {author}
                          </span>

                          {act.channel && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                              {act.channel}
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatTimestamp(act.timestamp)}</span>
                        </div>
                      </div>

                      {/* Content Description */}
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {act.description}
                      </p>

                      {/* Specialized Email Card Details */}
                      {(act.channel === 'EMAIL' || act.activity_type === 'email_prepared' || act.metadata?.email_body) && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleExpand(act.id)}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                <span>Hide Full Email Content</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                <span>View Email Body &amp; Status</span>
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                                <div>
                                  <span className="text-slate-400">Recipient: </span>
                                  <span className="text-white font-mono font-semibold">
                                    {act.metadata?.recipient || lead.email || 'None provided'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400">Status:</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {act.metadata?.status || 'PREPARED'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="text-slate-400 text-xs font-semibold">Subject: </span>
                                <span className="text-slate-200 text-xs font-medium">
                                  {act.metadata?.subject || act.title}
                                </span>
                              </div>

                              {act.metadata?.email_body && (
                                <div>
                                  <span className="text-slate-400 text-xs font-semibold block mb-1">
                                    Email Body:
                                  </span>
                                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                    {act.metadata.email_body}
                                  </div>
                                </div>
                              )}

                              {act.metadata?.recipient && act.metadata.recipient.includes('@') && (
                                <div className="pt-2 flex justify-end">
                                  <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                      act.metadata.recipient
                                    )}&su=${encodeURIComponent(
                                      act.metadata.subject || ''
                                    )}&body=${encodeURIComponent(act.metadata.email_body || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open in Gmail</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Generic Metadata Expansion (for non-email or additional technical metadata) */}
                      {act.channel !== 'EMAIL' && act.activity_type !== 'email_prepared' && act.metadata && Object.keys(act.metadata).length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60">
                          <button
                            onClick={() => toggleExpand(act.id)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                <span>Hide Details</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                <span>View Details</span>
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-1">
                              {Object.entries(act.metadata ?? {}).map(([key, val]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <span className="text-slate-200">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-900/30 border border-slate-800/60">
                No activities recorded in this filter category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: PIPELINE STAGE HISTORY */}
      {activeSubView === 'stage_history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Historical Stage Transition Audit Log
            </h4>
            <p className="text-xs text-slate-400">
              Immutable log of every pipeline progression, timestamps, and actors.
            </p>
          </div>

          <div className="space-y-3">
            {(lead.stage_history && lead.stage_history.length > 0) ? (
              lead.stage_history.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        {entry.previous_stage}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {entry.new_stage}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-xs text-slate-400">{entry.reason}</p>
                    )}
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-slate-400 space-y-0.5">
                    <div className="font-mono">{formatTimestamp(entry.timestamp)}</div>
                    <div>
                      Actor: <strong className="text-slate-200">{entry.changed_by}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                Stage set to <strong className="text-emerald-400">{lead.pipeline_stage}</strong> on import.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: COMMUNICATION RECORDS */}
      {activeSubView === 'comms_log' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Communication Entity Records
              </h4>
              <p className="text-xs text-slate-400">
                Multi-channel communication data model tracking Call, AI Call, SMS, and Email dispatches.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              {communications.length} Logged
            </span>
          </div>

          <div className="space-y-3">
            {communications.length > 0 ? (
              communications.map((comm) => (
                <div
                  key={comm.communication_id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {comm.channel} ({comm.direction})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                        {comm.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatTimestamp(comm.timestamp)}
                    </span>
                  </div>

                  {comm.subject && (
                    <div className="text-xs font-semibold text-indigo-300">
                      Subject: {comm.subject}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {comm.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-900/30 border border-slate-800/60">
                No direct communications logged for this lead yet. Use the Action Bar above (Call, AI Call, SMS, Email) to dispatch or log.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
