import React, { useState, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneOff,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Grid,
  Bot,
  Sparkles,
} from 'lucide-react';
import {
  CallRecord,
  CallOutcome,
  CallType,
  CallQueueItem,
  Lead,
} from '../types';
import {
  TelephonyService,
  formatDuration,
  formatPhoneNumber,
  getStoredCallRecords,
} from '../services/telephonyService';
import { CallDetailModal } from './CallDetailModal';
import { SophiaAICallModal } from './SophiaAICallModal';

interface CallsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenDialer: (lead?: Lead, phoneNumber?: string) => void;
  onRefreshLeads?: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  leads,
  onSelectLead,
  onOpenDialer,
  onRefreshLeads,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'queue'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'manual' | 'ai'>('all');

  // Stored calls & Queue
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => getStoredCallRecords());
  const [callQueue, setCallQueue] = useState<CallQueueItem[]>(() =>
    TelephonyService.getCallQueue()
  );

  // Selected Call Detail & Sophia AI Call Modal States
  const [selectedCallForDetail, setSelectedCallForDetail] = useState<CallRecord | null>(null);
  const [isSophiaAICallOpen, setIsSophiaAICallOpen] = useState(false);
  const [sophiaLead, setSophiaLead] = useState<Lead | null>(null);

  const refreshData = () => {
    setCallRecords(getStoredCallRecords());
    setCallQueue(TelephonyService.getCallQueue());
  };

  const handleOpenAICallForLead = (lead: Lead) => {
    setSophiaLead(lead);
    setIsSophiaAICallOpen(true);
  };

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate start of this week
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    return callRecords.filter((call) => {
      // Channel Filter (All / Manual / AI Calls)
      const isAI = call.call_type === 'AI Call' || call.ai_agent === 'Sophia';
      if (channelFilter === 'manual' && isAI) return false;
      if (channelFilter === 'ai' && !isAI) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const bName = (call.business_name || '').toLowerCase();
        const cName = (call.contact_name || '').toLowerCase();
        const phone = (call.phone_number || '').replace(/\D/g, '');
        const qClean = q.replace(/\D/g, '');
        const matchText = bName.includes(q) || cName.includes(q);
        const matchPhone = qClean && phone.includes(qClean);
        if (!matchText && !matchPhone) return false;
      }

      // Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Completed' && call.status !== 'COMPLETED') return false;
        if (statusFilter === 'Connected') {
          const isConn =
            call.outcome === 'Interested' ||
            call.outcome === 'Not Interested' ||
            call.outcome === 'Follow Up' ||
            call.outcome === 'Send Information' ||
            call.outcome === 'Send Audit' ||
            call.outcome === 'Meeting Requested' ||
            call.outcome === 'Proposal Requested' ||
            call.status === 'CONNECTED';
          if (!isConn) return false;
        }
        if (statusFilter === 'No Answer' && call.outcome !== 'No Answer' && call.status !== 'NO_ANSWER')
          return false;
        if (statusFilter === 'Voicemail' && call.outcome !== 'Voicemail') return false;
        if (statusFilter === 'Failed' && call.status !== 'FAILED') return false;
      }

      // Time Filter
      if (timeFilter === 'today') {
        const callDate = (call.started_at || call.created_at || '').split('T')[0];
        if (callDate !== todayStr) return false;
      } else if (timeFilter === 'week') {
        const callTime = new Date(call.started_at || call.created_at).getTime();
        if (callTime < weekAgo.getTime()) return false;
      }

      return true;
    });
  }, [callRecords, searchQuery, statusFilter, timeFilter, channelFilter]);

  // Analytics Metrics
  const totalCallsCount = callRecords.length;
  const connectedCallsCount = callRecords.filter(
    (c) =>
      c.outcome === 'Interested' ||
      c.outcome === 'Not Interested' ||
      c.outcome === 'Follow Up' ||
      c.outcome === 'Send Information' ||
      c.outcome === 'Send Audit' ||
      c.outcome === 'Meeting Requested' ||
      c.outcome === 'Proposal Requested'
  ).length;

  const connectRate =
    totalCallsCount > 0 ? Math.round((connectedCallsCount / totalCallsCount) * 100) : 0;

  const totalDuration = callRecords.reduce((acc, c) => acc + (c.duration || 0), 0);
  const avgDuration = totalCallsCount > 0 ? Math.round(totalDuration / totalCallsCount) : 0;

  return (
    <div id="mca-calls-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Calls & CRM Telephony
              </h1>
              <p className="text-xs text-slate-400">
                Track phone conversations, review call outcomes, and manage outbound cold calling queues.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const eligible = leads.find((l) => l.phone && !l.sms_opt_out && l.status !== 'Do Not Contact');
              if (eligible) handleOpenAICallForLead(eligible);
              else onOpenDialer();
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>Sophia AI Call</span>
          </button>

          <button
            onClick={() => onOpenDialer()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Open Dialer</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Calls
          </span>
          <div className="text-2xl font-extrabold font-mono text-white">
            {totalCallsCount}
          </div>
          <span className="text-[11px] text-slate-400">Recorded CRM calls</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Connected Calls
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {connectedCallsCount}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-semibold">
            {connectRate}% connect rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Avg Duration
          </span>
          <div className="text-2xl font-extrabold font-mono text-sky-400">
            {formatDuration(avgDuration)}
          </div>
          <span className="text-[11px] text-slate-400">Per conversation</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Today's Queue
          </span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {callQueue.filter((q) => q.status === 'pending').length}
          </div>
          <span className="text-[11px] text-slate-400">Leads waiting</span>
        </div>
      </div>

      {/* Main Tabs (Call History vs Today's Queue) */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Call History ({callRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>
            Today's Call Queue ({callQueue.filter((q) => q.status === 'pending').length})
          </span>
        </button>
      </div>

      {/* TAB 1: CALL HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business, contact, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              {/* Channel Filter (All / Manual / AI Calls) */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'all', label: 'All Calls' },
                  { id: 'manual', label: 'Manual' },
                  { id: 'ai', label: 'AI Calls (Sophia)' },
                ].map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => setChannelFilter(cf.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      channelFilter === cf.id
                        ? cf.id === 'ai'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cf.id === 'ai' && <Bot className="w-3 h-3" />}
                    <span>{cf.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {['All', 'Connected', 'Completed', 'No Answer', 'Voicemail', 'Failed'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        statusFilter === st
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFilter(tf.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      timeFilter === tf.id
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Call History Table */}
          <div className="rounded-2xl bg-[#0c111e] border border-slate-800/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Business & Contact</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Direction & Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Outcome</th>
                    <th className="p-3.5">
                      {channelFilter === 'ai' ? 'Interest & Next Action' : 'Notes / Next Action'}
                    </th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        <Phone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold">No calls match current filter criteria</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Use Sophia AI or the Dialer to initiate outbound outreach.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCalls.map((call) => {
                      const matchedLead = leads.find((l) => l.lead_id === call.lead_id);
                      const isAI = call.call_type === 'AI Call' || call.ai_agent === 'Sophia';
                      return (
                        <tr
                          key={call.call_id}
                          onClick={() => setSelectedCallForDetail(call)}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          {/* Business & Contact */}
                          <td className="p-3.5">
                            <div className="font-bold text-white flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                              <span>{call.business_name || 'Direct Number'}</span>
                              {isAI && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Sophia
                                </span>
                              )}
                              {matchedLead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectLead(matchedLead);
                                  }}
                                  className="text-slate-400 hover:text-indigo-400"
                                  title="View lead profile"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {call.contact_name && (
                              <div className="text-[11px] text-slate-400">
                                {call.contact_name}
                              </div>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="p-3.5 font-mono text-slate-200">
                            {formatPhoneNumber(call.phone_number)}
                          </td>

                          {/* Direction & Call Type */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              {call.direction === 'INBOUND' ? (
                                <PhoneIncoming className="w-3.5 h-3.5 text-sky-400" />
                              ) : (
                                <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              <span>{call.call_type}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                call.status === 'COMPLETED' || call.status === 'CONNECTED'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                  : call.status === 'FAILED'
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {call.status}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="p-3.5 font-mono text-slate-300">
                            {formatDuration(call.duration)}
                          </td>

                          {/* Outcome */}
                          <td className="p-3.5">
                            {call.outcome ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  call.outcome === 'Interested' ||
                                  call.outcome === 'Meeting Requested' ||
                                  call.outcome === 'Proposal Requested'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : call.outcome === 'Do Not Contact'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : call.outcome === 'Follow Up' ||
                                      call.outcome === 'Send Information' ||
                                      call.outcome === 'Send Audit'
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {call.outcome}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">—</span>
                            )}
                          </td>

                          {/* Notes / Interest Level / Next Action */}
                          <td className="p-3.5 max-w-xs">
                            {isAI ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {call.interest_level && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                        call.interest_level === 'Hot'
                                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                          : call.interest_level === 'Warm'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : 'bg-slate-800 text-slate-400 border-slate-700'
                                      }`}
                                    >
                                      {call.interest_level}
                                    </span>
                                  )}
                                  {call.sentiment && (
                                    <span className="text-[10px] text-slate-400">
                                      {call.sentiment}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-300 truncate">
                                  {call.recommended_next_action || call.summary || call.notes || '—'}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-300 truncate">
                                {call.notes || '—'}
                              </p>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(call.started_at || call.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {matchedLead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAICallForLead(matchedLead);
                                  }}
                                  className="px-2 py-1 rounded bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                                  title="Launch Sophia AI Call"
                                >
                                  <Bot className="w-3 h-3" />
                                  <span>Sophia AI</span>
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenDialer(matchedLead || undefined, call.phone_number);
                                }}
                                className="px-2 py-1 rounded bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                                title="Re-dial manually"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALL QUEUE (Requirement 22) */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Today's Call Queue</h2>
              <p className="text-xs text-slate-400">
                Prioritized batch of leads for manual telephone outreach today.
              </p>
            </div>
            {callQueue.length > 0 && (
              <button
                onClick={() => {
                  TelephonyService.clearCallQueue();
                  refreshData();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear Entire Queue
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {callQueue.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-slate-400">No leads in today's queue</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the "Add to Call Queue" button on any lead to load them here.
                </p>
              </div>
            ) : (
              callQueue.map((item, idx) => {
                const matchedLead = leads.find((l) => l.lead_id === item.lead_id);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-500 font-mono">
                            #{idx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-white">
                            {item.business_name}
                          </h3>
                        </div>
                        {item.contact_name && (
                          <div className="text-xs text-slate-400">
                            {item.contact_name}
                          </div>
                        )}
                        <div className="text-xs font-mono text-slate-300 mt-0.5">
                          {formatPhoneNumber(item.phone_number)}
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {item.lead_score} pts
                      </span>
                    </div>

                    {item.recommended_service && (
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                        <span className="text-slate-500 block text-[10px] font-semibold">
                          Recommended Service:
                        </span>
                        {item.recommended_service}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        {matchedLead && (
                          <button
                            onClick={() => handleOpenAICallForLead(matchedLead)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Sophia AI</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onOpenDialer(matchedLead || undefined, item.phone_number);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Manual Call</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            TelephonyService.skipCallQueueItem(item.id);
                            refreshData();
                          }}
                          className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => {
                            TelephonyService.removeFromCallQueue(item.id);
                            refreshData();
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Call Detail & Intelligence Modal */}
      {selectedCallForDetail && (
        <CallDetailModal
          isOpen={Boolean(selectedCallForDetail)}
          call={selectedCallForDetail}
          onClose={() => setSelectedCallForDetail(null)}
          matchedLead={leads.find((l) => l.lead_id === selectedCallForDetail.lead_id)}
          onSelectLead={onSelectLead}
          onOpenDialer={onOpenDialer}
          onOpenAICall={handleOpenAICallForLead}
        />
      )}

      {/* Sophia AI Voice Agent Call Center Modal */}
      {isSophiaAICallOpen && sophiaLead && (
        <SophiaAICallModal
          isOpen={isSophiaAICallOpen}
          lead={sophiaLead}
          onClose={() => {
            setIsSophiaAICallOpen(false);
            setSophiaLead(null);
            refreshData();
          }}
          onLeadUpdated={() => {
            refreshData();
            if (onRefreshLeads) onRefreshLeads();
          }}
        />
      )}
    </div>
  );
};
