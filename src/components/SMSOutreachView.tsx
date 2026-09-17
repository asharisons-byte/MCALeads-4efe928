import React, { useState, useEffect, useMemo } from 'react';
import { Lead, SMSMessage } from '../types';
import {
  getSMSMessages,
  getOptOutRegistry,
  validateAndNormalizePhone,
  checkSMSEligibility,
} from '../services/messagingService';
import { SMSComposerModal } from './SMSComposerModal';
import { SMSConversationView } from './SMSConversationView';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Building2,
  Sparkles,
  Send,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Flame,
  X,
  Plus,
} from 'lucide-react';

interface SMSOutreachViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onRefreshLeads?: () => void;
}

export const SMSOutreachView: React.FC<SMSOutreachViewProps> = ({
  leads,
  onSelectLead,
  onRefreshLeads,
}) => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      const msgs = await getSMSMessages();
      setMessages(msgs);
    }
    fetchMessages();
  }, []);
  const [optOuts, setOptOuts] = useState(() => getOptOutRegistry());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'OUTBOUND' | 'INBOUND' | 'OPTED_OUT'>('ALL');
  const [activeThreadLead, setActiveThreadLead] = useState<Lead | null>(null);
  const [composerLead, setComposerLead] = useState<Lead | null>(null);
  const [composerPrefill, setComposerPrefill] = useState<string | undefined>(undefined);

  // Refresh data
  async function refreshData() {
    setMessages(await getSMSMessages());
    setOptOuts(getOptOutRegistry());
    if (onRefreshLeads) onRefreshLeads();
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = messages.length;
    const outbound = messages.filter((m) => m.direction === 'OUTBOUND').length;
    const inbound = messages.filter((m) => m.direction === 'INBOUND').length;
    const uniqueLeads = new Set(messages.map((m) => m.lead_id)).size;
    const optOutCount = optOuts.length;
    const optOutRate = outbound > 0 ? ((optOutCount / outbound) * 100).toFixed(1) : '0.0';

    return {
      total,
      outbound,
      inbound,
      uniqueLeads,
      optOutCount,
      optOutRate,
    };
  }, [messages, optOuts]);

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // Tab filter
      if (filterTab === 'OUTBOUND' && m.direction !== 'OUTBOUND') return false;
      if (filterTab === 'INBOUND' && m.direction !== 'INBOUND') return false;
      if (filterTab === 'OPTED_OUT' && !m.opt_out_status && m.status !== 'OPTED_OUT') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBiz = m.business_name?.toLowerCase().includes(q);
        const matchPhone = m.phone_number?.toLowerCase().includes(q) || m.phone_e164?.includes(q);
        const matchText = m.content.toLowerCase().includes(q);
        const matchIntent = m.reply_analysis?.intent.toLowerCase().includes(q);
        return matchBiz || matchPhone || matchText || matchIntent;
      }
      return true;
    });
  }, [messages, filterTab, searchQuery]);

  function handleOpenComposer(lead: Lead, prefill?: string) {
    setComposerLead(lead);
    setComposerPrefill(prefill);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              MCA Outreach Suite
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI SMS Outreach & Compliance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalized 1-on-1 SMS campaigns powered by Sophia with built-in opt-out & E.164 compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {leads.length > 0 && (
            <button
              id="new-sms-btn"
              onClick={() => handleOpenComposer(leads[0])}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Compose New SMS</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Messages</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {metrics.uniqueLeads} contractors</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sent Outbound</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{metrics.outbound}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sophia outreach scripts</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Inbound Replies</span>
            <ArrowDownLeft className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 font-mono">{metrics.inbound}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Analyzed by Sophia</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Opt-Out Registry</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{metrics.optOutCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Enforced suppression</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Opt-Out Rate</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-200 font-mono">{metrics.optOutRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Within safe industry standards</div>
        </div>
      </div>

      {/* Main Content Layout: Table + Live Thread Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages Table & Filters */}
        <div className={`${activeThreadLead ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['ALL', 'OUTBOUND', 'INBOUND', 'OPTED_OUT'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    filterTab === tab
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab === 'ALL'
                    ? `All (${metrics.total})`
                    : tab === 'OUTBOUND'
                    ? `Outbound (${metrics.outbound})`
                    : tab === 'INBOUND'
                    ? `Inbound (${metrics.inbound})`
                    : `Opted Out (${metrics.optOutCount})`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search business, phone, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Messages Feed Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No messages match your filter</p>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your search or send a new SMS to initiate outreach.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredMessages.map((msg) => {
                  const lead = leads.find((l) => l.lead_id === msg.lead_id);
                  const isOutbound = msg.direction === 'OUTBOUND';

                  return (
                    <div
                      key={msg.sms_id}
                      onClick={() => lead && setActiveThreadLead(lead)}
                      className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        activeThreadLead?.lead_id === msg.lead_id ? 'bg-slate-800/70 border-l-2 border-sky-500' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                              isOutbound
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            {isOutbound ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" />
                                Outbound
                              </>
                            ) : (
                              <>
                                <ArrowDownLeft className="w-3 h-3" />
                                Inbound
                              </>
                            )}
                          </span>

                          <span className="font-bold text-xs text-white truncate">
                            {msg.business_name || lead?.business_name || 'Contractor'}
                          </span>

                          {msg.reply_analysis?.intent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {msg.reply_analysis.intent}
                            </span>
                          )}

                          {msg.opt_out_status && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                              OPTED OUT
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          "{msg.content}"
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="font-mono text-slate-400">{msg.phone_number}</span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.segments_count && (
                            <>
                              <span>•</span>
                              <span>{msg.segments_count} {msg.segments_count === 1 ? 'seg' : 'segs'}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                          >
                            Lead CRM
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (lead) handleOpenComposer(lead);
                          }}
                          className="px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-[11px] font-semibold transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Conversation Inspector Side Panel */}
        {activeThreadLead && (
          <div className="lg:col-span-5 space-y-3 sticky top-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Conversation Thread
              </span>
              <button
                onClick={() => setActiveThreadLead(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SMSConversationView
              lead={activeThreadLead}
              onOpenComposer={(prefill) => handleOpenComposer(activeThreadLead, prefill)}
              onMessageChange={refreshData}
            />
          </div>
        )}
      </div>

      {/* SMS Composer Modal */}
      {composerLead && (
        <SMSComposerModal
          lead={composerLead}
          isOpen={Boolean(composerLead)}
          prefillContent={composerPrefill}
          onClose={() => {
            setComposerLead(null);
            setComposerPrefill(undefined);
          }}
          onSMSSent={() => {
            refreshData();
          }}
        />
      )}
    </div>
  );
};
