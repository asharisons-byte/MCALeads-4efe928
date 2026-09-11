import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Flame,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart2,
  HelpCircle,
  Phone,
} from 'lucide-react';
import {
  CallIntelligence,
  AggregatedObjection,
  ObjectionCategory,
  Lead,
  CallRecord,
} from '../types';
import {
  getAllCallIntelligence,
  getAggregatedObjections,
} from '../services/callIntelligenceService';
import { getStoredCallRecords } from '../services/telephonyService';

interface CallIntelligenceDashboardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenCallDetail: (call: CallRecord) => void;
  onOpenDialer: (lead: Lead, phone?: string) => void;
  onOpenAICall: (lead: Lead) => void;
}

export const CallIntelligenceDashboard: React.FC<CallIntelligenceDashboardProps> = ({
  leads,
  onSelectLead,
  onOpenCallDetail,
  onOpenDialer,
  onOpenAICall,
}) => {
  const [intelList, setIntelList] = useState<CallIntelligence[]>(() => getAllCallIntelligence());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [objectionSearch, setObjectionSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Timing');

  const aggregatedObjections = useMemo(() => {
    return getAggregatedObjections(
      selectedCategory !== 'All' ? { category: selectedCategory } : undefined
    );
  }, [intelList, selectedCategory]);

  const calls = useMemo(() => getStoredCallRecords(), []);

  // Filtered objections
  const filteredObjections = useMemo(() => {
    return aggregatedObjections.filter((obj) => {
      if (!objectionSearch.trim()) return true;
      const q = objectionSearch.toLowerCase();
      return (
        obj.category.toLowerCase().includes(q) ||
        obj.recommended_response.toLowerCase().includes(q) ||
        obj.sample_statements.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [aggregatedObjections, objectionSearch]);

  // High level analytics
  const metrics = useMemo(() => {
    const totalCalls = intelList.length;
    if (totalCalls === 0) {
      return {
        totalCalls: 0,
        avgEngagement: 0,
        positiveSentimentPct: 0,
        hotLeadsCount: 0,
        totalObjections: 0,
      };
    }

    const sumEngagement = intelList.reduce((acc, i) => acc + (i.engagement_score || 0), 0);
    const positiveCount = intelList.filter((i) => i.sentiment === 'Positive').length;
    const hotCount = intelList.filter(
      (i) => i.lead_temperature === 'Hot' || i.interest_level === 'Hot'
    ).length;
    const totalObjs = intelList.reduce((acc, i) => acc + (i.objections?.length || 0), 0);

    return {
      totalCalls,
      avgEngagement: Math.round(sumEngagement / totalCalls),
      positiveSentimentPct: Math.round((positiveCount / totalCalls) * 100),
      hotLeadsCount: hotCount,
      totalObjections: totalObjs,
    };
  }, [intelList]);

  return (
    <div id="call-intelligence-dashboard" className="flex-1 flex flex-col h-full bg-[#060a12] text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Post-Call Intelligence & Objection Database
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Phase 2F • Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transforming manual and Sophia AI contractor conversations into structured CRM intelligence, objection handling playbooks, and grounded insights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {intelList.length} Transcripts Analyzed
          </span>
        </div>
      </div>

      {/* Main Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Avg Engagement Score</span>
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
              {metrics.avgEngagement}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Dynamic score based on conversation signals
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <ThumbsUp className="w-3 h-3 text-emerald-400" />
              <span>Positive Receptivity</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {metrics.positiveSentimentPct}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Calls expressing open interest or asking for audits
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Hot / High-Intent</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {metrics.hotLeadsCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ready for immediate proposal or audit delivery
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Recorded Objections</span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
              {metrics.totalObjections}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Categorized with actionable counter-strategies
            </p>
          </div>
        </div>

        {/* SECTION 1: OBJECTION DATABASE */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Contractor Objection Database & Handling Playbook</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real pushback captured across Oregon trade contractors, with exact quotes and Sophia counter-strategies.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search objections..."
                  value={objectionSearch}
                  onChange={(e) => setObjectionSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Timing">Timing</option>
                <option value="Price">Price</option>
                <option value="Already Has Provider">Already Has Provider</option>
                <option value="Too Busy">Too Busy</option>
                <option value="Trust">Trust</option>
                <option value="No Budget">No Budget</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Bad Previous Experience">Bad Experience</option>
              </select>
            </div>
          </div>

          {/* Objection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {filteredObjections.map((obj) => {
              const isExpanded = expandedCategory === obj.category;
              return (
                <div
                  key={obj.category}
                  className={`p-4 rounded-xl border transition-all ${
                    obj.count > 0
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {obj.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {obj.count} Detected ({obj.percentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Affects {obj.leads_affected} contractor leads
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : obj.category)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Frequency Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(obj.percentage, 5)}%` }}
                    />
                  </div>

                  {/* Sophia Recommended Strategy */}
                  <div className="mt-3 p-2.5 rounded-lg bg-purple-950/20 text-xs text-purple-200 border border-purple-500/20">
                    <div className="text-[10px] font-bold text-purple-300 uppercase flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span>Sophia Recommended Counter:</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">{obj.recommended_response}</p>
                  </div>

                  {/* Sample Quotes (Expanded) */}
                  {isExpanded && obj.sample_statements.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Sample Contractor Utterances:
                      </div>
                      <div className="space-y-1.5">
                        {obj.sample_statements.map((stmt, i) => (
                          <div
                            key={i}
                            className="text-xs text-slate-300 italic bg-slate-900 p-2 rounded border-l-2 border-rose-500/50"
                          >
                            "{stmt}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: RECENT INTELLIGENCE STREAM */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Call Intelligence Stream</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed breakdowns showing Lead Temperature, Engagement Score, and original Opportunity Score.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {intelList.map((intel) => {
              const matchedLead = leads.find((l) => l.lead_id === intel.lead_id);
              const matchedCall = calls.find((c) => c.call_id === intel.call_id);

              return (
                <div
                  key={intel.intelligence_id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Top Row: Business Name, Temperature Badge, Scores */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {intel.business_name}
                        </span>

                        {intel.contact_name && (
                          <span className="text-xs text-slate-400">
                            • {intel.contact_name}
                          </span>
                        )}

                        {/* Temperature Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                            intel.lead_temperature === 'Hot'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : intel.lead_temperature === 'Warm'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : intel.lead_temperature === 'Do Not Contact'
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{intel.lead_temperature}</span>
                        </span>

                        {/* Sentiment */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          Sentiment: {intel.sentiment}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {intel.summary}
                      </p>
                    </div>

                    {/* Dual Scores: Opportunity Score vs Dynamic Engagement Score */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center min-w-[90px]">
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          Lead Score
                        </div>
                        <div className="text-sm font-bold font-mono text-indigo-300">
                          {matchedLead?.lead_score || 85}/100
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-center min-w-[90px]">
                        <div className="text-[9px] text-purple-300 uppercase font-semibold">
                          Engagement
                        </div>
                        <div className="text-sm font-bold font-mono text-purple-200">
                          {intel.engagement_score}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Best Action Banner */}
                  {intel.next_best_action && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          Next Action:
                        </span>{' '}
                        <strong className="text-white">{intel.next_best_action.action}</strong>{' '}
                        <span className="text-slate-400">
                          ({intel.next_best_action.suggested_channel} • {intel.next_best_action.suggested_timing})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {matchedCall && (
                          <button
                            onClick={() => onOpenCallDetail(matchedCall)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                          >
                            View Call
                          </button>
                        )}

                        {matchedLead && (
                          <button
                            onClick={() => onSelectLead(matchedLead)}
                            className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-colors"
                          >
                            Open Lead
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
