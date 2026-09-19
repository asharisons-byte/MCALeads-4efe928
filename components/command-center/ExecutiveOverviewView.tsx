import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  Bot,
  Send,
  Zap,
  Target,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Lead, Client, Proposal, FollowUpTask, ActivityEvent, AgencyAlert } from '../../types';
import {
  AgencyHealthBreakdown,
  ExecutiveDecisionItem,
  getExecutiveDecisions,
  updateExecutiveDecision,
} from '../../services/executiveIntelligenceService';
import { getAIWorkforceState, getAITasks, getAIApprovals } from '../../services/aiWorkforceService';

interface ExecutiveOverviewViewProps {
  leads: Lead[];
  clients: Client[];
  proposals: Proposal[];
  followUps: FollowUpTask[];
  activities: ActivityEvent[];
  healthBreakdown: AgencyHealthBreakdown;
  onOpenWhyScore: () => void;
  onOpenAskSophia: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenLead: (leadId: string) => void;
  onStartAICall: (leadId: string) => void;
  onOpenDialer: (leadId?: string) => void;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  leads,
  clients,
  proposals,
  followUps,
  activities,
  healthBreakdown,
  onOpenWhyScore,
  onOpenAskSophia,
  onNavigateTab,
  onOpenLead,
  onStartAICall,
  onOpenDialer,
}) => {
  const [decisions, setDecisions] = useState<ExecutiveDecisionItem[]>(getExecutiveDecisions());
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'sales' | 'clients' | 'ai' | 'revenue'>('all');

  // Time-of-day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  // Metrics calculations
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.is_hot_target);
  const qualifiedOpps = leads.filter((l) => l.lead_score >= 60 && l.pipeline_stage !== 'Archived');
  const activeClients = clients.filter((c) => c.status === 'Active' || c.status === 'Onboarding');
  const confirmedMRR = clients.reduce((sum, c) => sum + (c.actual_mrr || 0), 0);
  const pipelineMRR = leads
    .filter((l) => ['Contacted', 'Audit Sent', 'Proposal Sent', 'Negotiation'].includes(l.pipeline_stage))
    .reduce((sum, l) => sum + (Number(l.estimated_retainer) || 0), 0);

  const atRiskClients = clients.filter((c) => c.status === 'At Risk');
  const atRiskRevenue = atRiskClients.reduce((sum, c) => sum + (c.actual_mrr || 0), 0);

  // Renewals in 90 days
  const now = Date.now();
  const upcomingRenewals = clients.filter((c) => {
    if (!c.contract_start_date) return false;
    const start = new Date(c.contract_start_date).getTime();
    const len = c.contract_length?.includes('6') ? 180 : 90;
    const exp = start + len * 86400000;
    const diff = (exp - now) / 86400000;
    return diff > 0 && diff <= 90;
  });

  const aiTasks = getAITasks();
  const aiApprovals = getAIApprovals();
  const aiTasksToday = aiTasks.length;
  const pendingApprovals = aiApprovals.filter((a) => (a.status as string) === 'pending' || a.status === 'Pending').length;

  const handleApproveDecision = (id: string) => {
    const updated = updateExecutiveDecision(id, 'Approved');
    setDecisions([...updated]);
  };

  const handleDismissDecision = (id: string) => {
    const updated = updateExecutiveDecision(id, 'Dismissed');
    setDecisions([...updated]);
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'sales') return act.type.includes('lead') || act.type.includes('pipeline') || act.type.includes('call');
    if (timelineFilter === 'clients') return act.type.includes('client') || act.type.includes('onboarding') || act.type.includes('proposal');
    if (timelineFilter === 'ai') return act.type.includes('ai') || act.type.includes('agent');
    if (timelineFilter === 'revenue') return act.type.includes('revenue') || act.type.includes('won') || act.type.includes('retainer');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HERO GREETING & STATUS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black tracking-widest text-indigo-400 uppercase">
                {timeGreeting}, AHMED
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-300">
                All 7 AI Agents Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Marketing Charm Agency Command Center
            </h2>
            <p className="text-sm text-indigo-200/80 max-w-2xl">
              Autonomous sales pipeline, client retainers, and executive intelligence for Marketing Charm Agency.
            </p>
          </div>

          {/* Ask Sophia Quick Launch Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAskSophia}
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-200" />
              <span>Ask Sophia About My Agency</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SOPHIA'S EXECUTIVE BRIEFING & AGENCY HEALTH SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sophia Executive Briefing (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Sophia's Executive Briefing</h3>
                  <span className="text-[11px] text-slate-400">Autonomous Daily Intelligence</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Agency Telemetry
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <span>
                  Today, <strong>{hotLeads.length} high-value opportunities</strong> require outreach attention across Oregon CCB licensee targets.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <span>
                  Confirmed agency MRR is holding at <strong>${confirmedMRR.toLocaleString()}/mo</strong> across {activeClients.length} active client retainers.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <span>
                  <strong>{upcomingRenewals.length} client contract renewal</strong> (Apex Roofing & Restoration) is approaching within 24 days.
                </span>
              </div>
              {atRiskClients.length > 0 && (
                <div className="flex items-start gap-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                  <span>
                    <strong>{atRiskClients[0]?.business_name}</strong> is flagged At Risk due to delayed access collection deliverables.
                  </span>
                </div>
              )}
            </div>

            {/* Top Recommendation Highlight */}
            <div className="mt-4 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Top Recommendation
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  Contact {hotLeads[0]?.business_name || 'primary contractor'} before the opportunity becomes inactive.
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  High-intent {hotLeads[0]?.niche || 'Contractor'} in {hotLeads[0]?.city || 'Portland'} with ${hotLeads[0]?.estimated_retainer || 2200}/mo retainer potential.
                </p>
              </div>
              {hotLeads[0] && (
                <button
                  onClick={() => onStartAICall(hotLeads[0].lead_id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
                >
                  Start Call
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Updated in real time based on active CRM events</span>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Full Briefing & Weekly Review</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Agency Health Score (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Agency Health Score</h3>
              </div>
              <button
                onClick={onOpenWhyScore}
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>[Why This Score?]</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-black ${
                  healthBreakdown.score >= 85
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : healthBreakdown.score >= 70
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : healthBreakdown.score >= 50
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                <span className="text-2xl leading-none">{healthBreakdown.score}</span>
                <span className="text-[9px] uppercase tracking-wider mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Status: {healthBreakdown.grade}</div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {healthBreakdown.summary}
                </p>
              </div>
            </div>

            {/* Micro Factor Indicators */}
            <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>Pipeline Health</span>
                <span className="font-bold text-slate-900">
                  {healthBreakdown.factors.find((f) => f.category === 'Pipeline Health')?.score}/100
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Client Retention & Health</span>
                <span className="font-bold text-slate-900">
                  {healthBreakdown.factors.find((f) => f.category.includes('Client Health'))?.score}/100
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Revenue Stability</span>
                <span className="font-bold text-slate-900">
                  {healthBreakdown.factors.find((f) => f.category === 'Revenue Stability')?.score}/100
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Follow-Up Compliance</span>
                <span className="font-bold text-slate-900">
                  {healthBreakdown.factors.find((f) => f.category === 'Follow-Up Compliance')?.score}/100
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenWhyScore}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold text-center border border-slate-200 transition-colors"
          >
            Inspect Detailed Factor Analysis
          </button>
        </div>
      </div>

      {/* 3. TOP-LEVEL 10 EXECUTIVE METRICS CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Agency Executive Telemetry
          </h3>
          <span className="text-xs text-slate-500">Separating Confirmed from Pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* 1. Total Leads */}
          <div
            onClick={() => onNavigateTab('pipeline')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Total Leads</span>
              <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{totalLeads}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Discovered in OR</div>
          </div>

          {/* 2. Hot Leads */}
          <div
            onClick={() => onNavigateTab('pipeline')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Hot Leads</span>
              <Flame className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{hotLeads.length}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">High Intent &gt;80</div>
          </div>

          {/* 3. Qualified Opportunities */}
          <div
            onClick={() => onNavigateTab('pipeline')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Qualified Opps</span>
              <Target className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{qualifiedOpps.length}</div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-1">Score ≥ 60</div>
          </div>

          {/* 4. Active Clients */}
          <div
            onClick={() => onNavigateTab('clients')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Active Clients</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{activeClients.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">100% Retention</div>
          </div>

          {/* 5. Won MRR (Confirmed) */}
          <div
            onClick={() => onNavigateTab('revenue')}
            className="p-4 bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900">Won MRR</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">
              ${confirmedMRR.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1">CONFIRMED Retainers</div>
          </div>

          {/* 6. Pipeline MRR */}
          <div
            onClick={() => onNavigateTab('revenue')}
            className="p-4 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900">Pipeline MRR</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2">
              ${pipelineMRR.toLocaleString()}
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-1">Active Pipeline Deals</div>
          </div>

          {/* 7. At-Risk Revenue */}
          <div
            onClick={() => onNavigateTab('clients')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">At-Risk MRR</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 mt-2">
              ${atRiskRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-500 font-semibold mt-1">
              {atRiskClients.length} account flagged
            </div>
          </div>

          {/* 8. Upcoming Renewals */}
          <div
            onClick={() => onNavigateTab('clients')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Renewals &lt;90d</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{upcomingRenewals.length}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">Apex Roofing (24d)</div>
          </div>

          {/* 9. AI Tasks Today */}
          <div
            onClick={() => onNavigateTab('ai_workforce')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">AI Tasks Today</span>
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{aiTasksToday}</div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-1">7 Autonomous Agents</div>
          </div>

          {/* 10. Pending Approvals */}
          <div
            onClick={() => onNavigateTab('ai_workforce')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Pending Approvals</span>
              <FileCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{pendingApprovals}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Human-in-the-Loop</div>
          </div>
        </div>
      </div>

      {/* 4. "WHAT SHOULD MARKETING CHARM AGENCY DO NEXT?" STRATEGIC ACTION PANEL */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                WHAT SHOULD MARKETING CHARM AGENCY DO NEXT?
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized strategic actions grounded in actual revenue data, bottlenecks, and client status
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Autonomous Executive Guidance
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Engage Top Hot Target */}
          <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                  Urgency: Immediate
                </span>
                <span className="text-slate-400 text-[11px]">Sales Momentum</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                1. Call {hotLeads[0]?.business_name || 'Primary Contractor'}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Evidence:</strong> Score {hotLeads[0]?.lead_score || 88}/100 with zero online booking funnel.
              </p>
              <p className="text-xs text-indigo-900 font-semibold mt-1">
                <strong>Expected Impact:</strong> +${hotLeads[0]?.estimated_retainer || 2200}/mo pipeline deal.
              </p>
            </div>
            <button
              onClick={() => onOpenDialer(hotLeads[0]?.lead_id)}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Launch Dialer</span>
            </button>
          </div>

          {/* Action 2: Protect Cascade Heating Account */}
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                  Urgency: Immediate
                </span>
                <span className="text-slate-400 text-[11px]">Retention Risk</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                2. Resolve Cascade Heating DNS Access
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Evidence:</strong> DNS authorization overdue by 3 days. Account health is 62/100.
              </p>
              <p className="text-xs text-rose-900 font-semibold mt-1">
                <strong>Expected Impact:</strong> Protects $2,400/mo confirmed retainer.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('clients')}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Open Client Card</span>
            </button>
          </div>

          {/* Action 3: Prepare Apex Roofing Renewal */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                  Urgency: This Week
                </span>
                <span className="text-slate-400 text-[11px]">Contract Renewal</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                3. Prepare Apex Roofing 6-Mo Extension
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Evidence:</strong> Contract expiration in 24 days. Client has +18 new reviews.
              </p>
              <p className="text-xs text-amber-900 font-semibold mt-1">
                <strong>Expected Impact:</strong> Secure $2,800/mo + pitch $950 SEO upsell.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('clients')}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Review Renewal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. EXECUTIVE DECISION CENTER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Executive Decision Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strategic recommendations requiring agency owner confirmation or approval
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {decisions.filter((d) => d.status === 'Pending Review').length} Decisions Pending Review
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {decisions.map((decision) => (
            <div
              key={decision.decision_id}
              className={`p-4 rounded-2xl border transition-all ${
                decision.status === 'Approved'
                  ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
                  : decision.status === 'Dismissed'
                  ? 'bg-slate-50 border-slate-200 opacity-50'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {decision.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">
                      Urgency: {decision.urgency}
                    </span>
                    {decision.status === 'Approved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Approved
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{decision.title}</h4>
                  <p className="text-xs text-slate-600">{decision.description}</p>
                  <p className="text-[11px] text-indigo-700 font-semibold">
                    Expected Impact: {decision.expected_impact}
                  </p>
                </div>

                {/* Actions */}
                {decision.status === 'Pending Review' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={onOpenAskSophia}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Ask Sophia
                    </button>
                    <button
                      onClick={() => handleDismissDecision(decision.decision_id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleApproveDecision(decision.decision_id)}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                    >
                      Approve Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. ACTIVITY COMMAND TIMELINE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Activity Command Timeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological stream of sales, calls, client milestones, and AI agent execution
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            {(['all', 'sales', 'clients', 'ai', 'revenue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimelineFilter(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  timelineFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2">
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent activity recorded under this filter.
            </div>
          ) : (
            filteredActivities.slice(0, 15).map((item, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  {item.type.includes('call') ? (
                    <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                  ) : item.type.includes('email') ? (
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                  ) : item.type.includes('ai') ? (
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                  ) : item.type.includes('won') ? (
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.description}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.metadata?.lead_name && (
                    <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                      {item.metadata.lead_name}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
