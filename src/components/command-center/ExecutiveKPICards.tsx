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
        className="bg-mca-card rounded-xl p-5 border border-emerald-800/50 relative overflow-hidden group hover:border-emerald-700/60 transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Confirmed Won MRR
              </span>
              <span
                title="Actual signed retainers in Won stage. Never includes projected or unclosed deals."
                className="cursor-help text-emerald-400/70 hover:text-emerald-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ${metrics.confirmedWonMRR.toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1">/mo</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/50 flex items-center justify-center text-emerald-400 border border-emerald-900/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {metrics.wonDealsCount} Signed Client Retainers
          </span>
          <span className="text-slate-400">
            Avg: ${metrics.avgWonRetainer.toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* 2. Estimated Pipeline MRR (Qualified Active Pipeline) */}
      <div
        id="kpi-pipeline-mrr"
        className="bg-mca-card rounded-xl p-5 border border-indigo-800/50 relative overflow-hidden group hover:border-indigo-700/60 transition-all cursor-pointer"
        onClick={onViewPipeline}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Estimated Pipeline MRR
              </span>
              <span
                title="Sum of estimated retainer values for active opportunities in Contacted, Audit Sent, and Proposal Sent stages."
                className="cursor-help text-indigo-400/70 hover:text-indigo-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ${metrics.estimatedPipelineMRR.toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1">/mo</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-900/40">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-indigo-900/40 flex items-center justify-between text-xs text-slate-300">
          <span className="text-indigo-300 font-medium">
            {metrics.activeOpportunitiesCount} Active Opportunities
          </span>
          <span className="text-slate-400">
            Total Cap: ${metrics.potentialTotalPipelineValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Hot Leads Requiring Action */}
      <div
        id="kpi-hot-leads"
        className="bg-mca-card rounded-xl p-5 border border-amber-800/50 relative overflow-hidden group hover:border-amber-700/60 transition-all cursor-pointer"
        onClick={onFilterHotLeads}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Hot Targets
              </span>
              <span
                title="High-priority contractor leads with top opportunity scores or recent positive engagement."
                className="cursor-help text-amber-300/70 hover:text-amber-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {hotLeadsCount}
              <span className="text-sm font-normal text-slate-400 ml-1">leads</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/50 flex items-center justify-center text-amber-400 border border-amber-900/40">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs text-slate-300">
          <span className="text-amber-300 font-medium">Ready for immediate outreach</span>
          <span className="text-amber-400 group-hover:underline">View list →</span>
        </div>
      </div>

      {/* 4. Follow-Ups Due Today */}
      <div
        id="kpi-follow-ups"
        className={`bg-mca-card rounded-xl p-5 border relative overflow-hidden group transition-all cursor-pointer ${
          followUpsDueCount > 0 ? 'border-rose-800/50 hover:border-rose-700/60' : 'border-white/10'
        }`}
        onClick={onViewFollowUps}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  followUpsDueCount > 0 ? 'text-rose-300' : 'text-slate-300'
                }`}
              >
                Follow-Ups Due
              </span>
              <span
                title="Scheduled prospect commitments, audit reviews, and promised call times."
                className="cursor-help text-slate-500 hover:text-slate-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {followUpsDueCount}
              <span className="text-sm font-normal text-slate-400 ml-1">tasks</span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              followUpsDueCount > 0
                ? 'bg-rose-950/50 text-rose-400 border-rose-900/40'
                : 'bg-mca-void/40 text-slate-400 border-white/5'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
            followUpsDueCount > 0 ? 'border-rose-900/40 text-rose-300 font-medium' : 'border-white/5 text-slate-400'
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
        <div className="bg-mca-void/80 rounded-lg px-4 py-3 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total CRM Leads
            </div>
            <div className="text-lg font-bold text-white">{metrics.totalLeadsCount}</div>
          </div>
          <div className="text-xs text-slate-400 font-medium">Verified CCB</div>
        </div>

        <div className="bg-mca-void/80 rounded-lg px-4 py-3 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Active Campaigns
            </div>
            <div className="text-lg font-bold text-white">{activeCampaignsCount}</div>
          </div>
          <button
            onClick={onViewCampaigns}
            className="text-xs text-indigo-400 font-medium hover:underline"
          >
            Sequences →
          </button>
        </div>

        <div className="bg-mca-void/80 rounded-lg px-4 py-3 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Closing Rate
            </div>
            <div className="text-lg font-bold text-white">
              {metrics.overallConversionRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-xs text-emerald-400 font-medium">Won Retainers</div>
        </div>

        <div className="bg-mca-void/80 rounded-lg px-4 py-3 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Pipeline Depth
            </div>
            <div className="text-lg font-bold text-white">
              ${metrics.potentialTotalPipelineValue.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">Total Volume</div>
        </div>
      </div>
    </div>
  );
};
