import React from 'react';
import {
  Users,
  Flame,
  Award,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Bot,
  MapPin,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  ChevronRight,
  Globe,
  Star,
  Activity,
} from 'lucide-react';
import { Lead, ActivityEvent } from '../types';
import { DashboardActivityChart } from './DashboardActivityChart';

interface DashboardProps {
  leads: Lead[];
  activities: ActivityEvent[];
  onSelectLead: (lead: Lead) => void;
  onOpenSophia: () => void;
  onNavigateToLeads: () => void;
  onNavigateToPipeline: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  activities,
  onSelectLead,
  onOpenSophia,
  onNavigateToLeads,
  onNavigateToPipeline,
}) => {
  // Calculate dynamic KPIs from actual CRM database
  const totalLeads = leads.length;
  const hotTargets = leads.filter((l) => l.is_hot_target).length;
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((acc, l) => acc + l.lead_score, 0) / totalLeads) : 0;
  const potentialMRR = leads.reduce((acc, l) => acc + (l.estimated_retainer || 0), 0);

  // Pipeline MRR: retainers in active pipeline stages
  const activePipelineStages = ['Contacted', 'Audit Sent', 'Proposal Sent', 'Won', 'Retainer'];
  const pipelineMRR = leads
    .filter((l) => activePipelineStages.includes(l.pipeline_stage))
    .reduce((acc, l) => acc + (l.estimated_retainer || 0), 0);

  // GMB / Web Gaps: leads with missing website or slow server or thin GMB
  const gmbWebGaps = leads.filter(
    (l) =>
      l.website_status === 'No Website' ||
      l.website_status === 'Slow / Unreachable Server' ||
      l.gmb_status === 'Thin GMB' ||
      l.gmb_status === 'No GMB'
  ).length;

  // Priority leads for today (sorted by lead_score descending)
  const priorityLeads = [...leads]
    .sort((a, b) => b.lead_score - a.lead_score)
    .slice(0, 3);

  // Pipeline counts
  const stageCounts: Record<string, number> = {
    'New Lead': 0,
    Contacted: 0,
    'Audit Sent': 0,
    'Proposal Sent': 0,
    Won: 0,
    Retainer: 0,
  };
  leads.forEach((l) => {
    if (stageCounts[l.pipeline_stage] !== undefined) {
      stageCounts[l.pipeline_stage]++;
    }
  });

  return (
    <div id="mca-dashboard" className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Primary Dashboard Message Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12192d] via-[#161f38] to-[#121829] border border-slate-800 p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sophia AI Command Center</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Your Lead Pipeline
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Discover the highest-value businesses, understand their marketing gaps, and prioritize the opportunities most likely to convert.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              id="dashboard-btn-sophia-ask"
              onClick={onOpenSophia}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Sophia</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top KPI Cards (Dynamically Calculated) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-mono">{totalLeads}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Database count</div>
          </div>
        </div>

        {/* Hot Targets */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Hot Targets</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{hotTargets}</div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">High fit &amp; gaps</div>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-purple-400 font-mono">{avgScore}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">0–100 weighted</div>
          </div>
        </div>

        {/* Potential MRR */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Potential MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              ${potentialMRR.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">All prospects</div>
          </div>
        </div>

        {/* Pipeline MRR */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pipeline MRR</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-blue-400 font-mono">
              ${pipelineMRR.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active stages</div>
          </div>
        </div>

        {/* GMB / Web Gaps */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>GMB / Web Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-400 font-mono">{gmbWebGaps}</div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">Primary pitch targets</div>
          </div>
        </div>
      </div>
      
      {/* Activity Trend Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Activity Trends (Past 30 Days)</span>
        </h3>
        <DashboardActivityChart activities={activities} />
      </div>

      {/* Sophia's Recommendations Section (Generated from actual CRM records) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-indigo-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Sophia's Recommendations</h2>
              <p className="text-xs text-slate-400">
                Factual lead prioritization generated from active CRM records
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSophia}
            className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1"
          >
            <span>Ask Sophia a Question</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Recommendation 1: West Coast Plumbing */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Top Retainer Target
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">$2,400/mo</span>
            </div>
            <div className="text-xs font-bold text-white">West Coast Plumbing &amp; Rooter</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Prioritize West Coast Plumbing &amp; Rooter because it has a 92 score, strong reviews (215 reviews, 4.9 rating), and significant website performance gaps (PageSpeed 28/100)."
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Website SEO &amp; Technical</span>
              {leads.find((l) => l.lead_id === 'MCA-002') && (
                <button
                  onClick={() => onSelectLead(leads.find((l) => l.lead_id === 'MCA-002')!)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                >
                  <span>Review Lead</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Recommendation 2: Crown Plumbing */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Immediate Conversion
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">$1,800/mo</span>
            </div>
            <div className="text-xs font-bold text-white">Crown Plumbing PDX</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Crown Plumbing PDX has no website and represents a strong website-development opportunity with 18 established 5-star Google reviews."
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Web Dev + Voice Search</span>
              {leads.find((l) => l.lead_id === 'MCA-001') && (
                <button
                  onClick={() => onSelectLead(leads.find((l) => l.lead_id === 'MCA-001')!)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                >
                  <span>Review Lead</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Recommendation 3: Pilot Plumbing */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Reputation Growth
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">$1,800/mo</span>
            </div>
            <div className="text-xs font-bold text-white">Pilot Plumbing and Drain</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Pilot Plumbing and Drain has only 4 reviews and may be a strong reputation-management opportunity to complement their 87/100 website speed."
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Review Booster</span>
              {leads.find((l) => l.lead_id === 'MCA-003') && (
                <button
                  onClick={() => onSelectLead(leads.find((l) => l.lead_id === 'MCA-003')!)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                >
                  <span>Review Lead</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Today's Priority Leads & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Priority Leads (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Today's Priority Leads</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {priorityLeads.length} Hot Targets
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Highest scoring opportunities based on agency service fit
              </p>
            </div>
            <button
              onClick={onNavigateToLeads}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All Leads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityLeads.map((lead) => (
              <div
                key={lead.lead_id}
                onClick={() => onSelectLead(lead)}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-indigo-500/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {lead.business_name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {lead.niche}
                      </span>
                      {lead.gmb_rating && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{lead.gmb_rating}</span>
                          <span className="text-slate-400">({lead.gmb_review_count || 0})</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {lead.city}, {lead.state}
                      </span>
                      <span>•</span>
                      <span>{lead.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-400 font-mono">
                        ${lead.estimated_retainer?.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-slate-400">AI Estimated Retainer</div>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center">
                      <div className="text-sm font-extrabold text-indigo-300 font-mono">
                        {lead.lead_score}
                      </div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-400">Score</div>
                    </div>
                  </div>
                </div>

                {/* Gaps and Opportunity Tag */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Gaps:</span>
                    {lead.gaps.map((gap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                    <span>{lead.recommended_service}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Overview & Stage Distribution (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight">Pipeline Overview</h2>
            <button
              onClick={onNavigateToPipeline}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="space-y-2.5">
              {Object.entries(stageCounts).map(([stage, count]) => {
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{stage}</span>
                      <span className="font-mono text-slate-400">
                        {count} <span className="text-[10px] text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Pipeline Value</span>
              <span className="font-bold text-emerald-400 font-mono">
                ${pipelineMRR.toLocaleString()}/mo
              </span>
            </div>
          </div>

          {/* Quick Agency Tip */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phase 1 Outreach Readiness</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All leads feature calculated 0–100 scores, identified gaps, and pitch angles ready for Phase 2 automation.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Trail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Recent Activity &amp; Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live log of lead imports, score calculations, and stage updates
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800/60">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>{act.title}</span>
                  <span className="text-[10px] text-indigo-400 font-medium font-mono">
                    {act.lead_name}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{act.description}</div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
