import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Flame,
  Clock,
  Send,
  Percent,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { RevenueCalculations } from '../../services/commandCenterService';

interface ExecutiveKPICardsProps {
  metrics: RevenueCalculations;
  hotLeadsCount: number;
  followUpsDueCount: number;
  activeCampaignsCount: number;
  onFilterHotLeads?: () => void;
  onViewFollowUps?: () => void;
  onViewPipeline?: () => void;
  onViewCampaigns?: () => void;
}

export const ExecutiveKPICards: React.FC<ExecutiveKPICardsProps> = ({
  metrics,
  hotLeadsCount,
  followUpsDueCount,
  activeCampaignsCount,
  onFilterHotLeads,
  onViewFollowUps,
  onViewPipeline,
  onViewCampaigns,
}) => {
  return (
    <div id="executive-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Confirmed Won MRR (Strictly Real Won Revenue) */}
      <div
        id="kpi-won-mrr"
        className="bg-white rounded-xl p-5 border border-emerald-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Confirmed Won MRR
              </span>
              <span
                title="Actual signed retainers in Won stage. Never includes projected or unclosed deals."
                className="cursor-help text-emerald-600/70 hover:text-emerald-800"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              ${metrics.confirmedWonMRR.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {metrics.wonDealsCount} Signed Client Retainers
          </span>
          <span className="text-slate-500">
            Avg: ${metrics.avgWonRetainer.toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* 2. Estimated Pipeline MRR (Qualified Active Pipeline) */}
      <div
        id="kpi-pipeline-mrr"
        className="bg-white rounded-xl p-5 border border-indigo-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer"
        onClick={onViewPipeline}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Estimated Pipeline MRR
              </span>
              <span
                title="Sum of estimated retainer values for active opportunities in Contacted, Audit Sent, and Proposal Sent stages."
                className="cursor-help text-indigo-600/70 hover:text-indigo-800"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              ${metrics.estimatedPipelineMRR.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs text-slate-600">
          <span className="text-indigo-700 font-medium">
            {metrics.activeOpportunitiesCount} Active Opportunities
          </span>
          <span className="text-slate-500">
            Total Cap: ${metrics.potentialTotalPipelineValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Hot Leads Requiring Action */}
      <div
        id="kpi-hot-leads"
        className="bg-white rounded-xl p-5 border border-amber-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all cursor-pointer"
        onClick={onFilterHotLeads}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Hot Targets
              </span>
              <span
                title="High-priority contractor leads with top opportunity scores or recent positive engagement."
                className="cursor-help text-amber-700/70 hover:text-amber-900"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {hotLeadsCount}
              <span className="text-sm font-normal text-slate-500 ml-1">leads</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-slate-600">
          <span className="text-amber-700 font-medium">Ready for immediate outreach</span>
          <span className="text-amber-600 group-hover:underline">View list →</span>
        </div>
      </div>

      {/* 4. Follow-Ups Due Today */}
      <div
        id="kpi-follow-ups"
        className={`bg-white rounded-xl p-5 border shadow-xs relative overflow-hidden group transition-all cursor-pointer ${
          followUpsDueCount > 0 ? 'border-rose-200/80 hover:border-rose-300' : 'border-slate-200/80'
        }`}
        onClick={onViewFollowUps}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  followUpsDueCount > 0 ? 'text-rose-700' : 'text-slate-600'
                }`}
              >
                Follow-Ups Due
              </span>
              <span
                title="Scheduled prospect commitments, audit reviews, and promised call times."
                className="cursor-help text-slate-400 hover:text-slate-600"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {followUpsDueCount}
              <span className="text-sm font-normal text-slate-500 ml-1">tasks</span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              followUpsDueCount > 0
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-slate-50 text-slate-500 border-slate-100'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
            followUpsDueCount > 0 ? 'border-rose-100 text-rose-700 font-medium' : 'border-slate-100 text-slate-500'
          }`}
        >
          <span>
            {followUpsDueCount > 0 ? 'Requires action today' : 'All follow-ups complete'}
          </span>
          <span className="group-hover:underline">Open queue →</span>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-slate-50/80 rounded-lg px-4 py-3 border border-slate-200/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total CRM Leads
            </div>
            <div className="text-lg font-bold text-slate-900">{metrics.totalLeadsCount}</div>
          </div>
          <div className="text-xs text-slate-500 font-medium">Verified CCB</div>
        </div>

        <div className="bg-slate-50/80 rounded-lg px-4 py-3 border border-slate-200/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Campaigns
            </div>
            <div className="text-lg font-bold text-slate-900">{activeCampaignsCount}</div>
          </div>
          <button
            onClick={onViewCampaigns}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            Sequences →
          </button>
        </div>

        <div className="bg-slate-50/80 rounded-lg px-4 py-3 border border-slate-200/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Closing Rate
            </div>
            <div className="text-lg font-bold text-slate-900">
              {metrics.overallConversionRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-xs text-emerald-600 font-medium">Won Retainers</div>
        </div>

        <div className="bg-slate-50/80 rounded-lg px-4 py-3 border border-slate-200/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pipeline Depth
            </div>
            <div className="text-lg font-bold text-slate-900">
              ${metrics.potentialTotalPipelineValue.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">Total Volume</div>
        </div>
      </div>
    </div>
  );
};
