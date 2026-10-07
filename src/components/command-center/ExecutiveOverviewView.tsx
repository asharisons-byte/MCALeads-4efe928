import React, { useMemo, useState } from 'react';
import { Lead, Client, Proposal, FollowUpTask, ActivityEvent } from '../../types';
import {
  AgencyHealthBreakdown,
  ExecutiveDecisionItem,
  getExecutiveDecisions,
  updateExecutiveDecision,
} from '../../services/executiveIntelligenceService';
import { daysUntilRenewal } from './ExecutiveTelemetryGrid';

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

const shortName = (n?: string) => (n || '').split(' & ')[0];
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Stitch category chip colours for Decision Center items */
const categoryChip = (c: string) => {
  const k = (c || '').toLowerCase();
  if (k.includes('retention') || k.includes('client')) return 'bg-purple-950 text-purple-300';
  if (k.includes('operation')) return 'bg-indigo-950 text-indigo-300';
  if (k.includes('risk')) return 'bg-rose-950 text-rose-300';
  return 'bg-blue-950 text-blue-300';
};
const urgencyColour = (u: string) => (/immediate/i.test(u) ? 'text-rose-400' : 'text-amber-400');
const impactColour = (c: string) => {
  const k = (c || '').toLowerCase();
  if (k.includes('retention')) return 'text-emerald-400';
  if (k.includes('operation')) return 'text-purple-300';
  if (k.includes('risk')) return 'text-rose-300';
  return 'text-cyan-400';
};

/**
 * ExecutiveOverviewView — Stitch: DualIntelligenceRow + AutonomousGuidanceSection + ExecutiveDecisionCenter.
 * (Telemetry grid, title strip and tabs live in CommandCenter; insights / radar / operations follow.)
 */
export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  leads,
  clients,
  healthBreakdown,
  onOpenWhyScore,
  onOpenAskSophia,
  onNavigateTab,
  onOpenLead,
  onStartAICall,
  onOpenDialer,
}) => {
  const [decisions, setDecisions] = useState<ExecutiveDecisionItem[]>(getExecutiveDecisions());

  const d = useMemo(() => {
    const hot = leads
      .filter((l) => l.is_hot_target && l.pipeline_stage !== 'Archived')
      .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));
    const active = clients.filter((c) => c.status === 'Active' || c.status === 'Onboarding');
    const mrr = clients.reduce((s, c) => s + (c.actual_mrr || 0), 0);
    const atRisk = clients.filter((c) => c.status === 'At Risk');
    const renewals = clients
      .map((c) => ({ c, days: daysUntilRenewal(c) }))
      .filter((r) => r.days !== null && (r.days as number) > 0 && (r.days as number) <= 90)
      .sort((a, b) => (a.days as number) - (b.days as number));
    return { hot, active, mrr, atRisk, renewals };
  }, [leads, clients]);

  const topLead = d.hot[0];
  const risk = d.atRisk[0];
  const renewal = d.renewals[0];
  const factor = (match: (c: string) => boolean) => healthBreakdown.factors.find((f) => match(f.category));
  const bars = [
    { label: 'Pipeline Health', f: factor((c) => c === 'Pipeline Health'), text: 'text-emerald-400', bar: 'bg-emerald-400' },
    { label: 'Client Retention & Health', f: factor((c) => c.includes('Client Health')), text: 'text-cyan-400', bar: 'bg-cyan-400' },
    { label: 'Revenue Stability', f: factor((c) => c === 'Revenue Stability'), text: 'text-purple-400', bar: 'bg-purple-400' },
    { label: 'Follow-Up Compliance', f: factor((c) => c.includes('Follow')), text: 'text-rose-400', bar: 'bg-rose-500' },
  ];

  const score = healthBreakdown.score;
  const tone =
    score >= 85
      ? { label: 'text-emerald-400', box: 'bg-emerald-950/60 border-emerald-400', sub: 'text-emerald-400', icon: 'fa-circle-check' }
      : score >= 70
      ? { label: 'text-emerald-400', box: 'bg-cyan-950/60 border-cyan-400', sub: 'text-cyan-400', icon: 'fa-circle-check' }
      : score >= 50
      ? { label: 'text-amber-400', box: 'bg-amber-950/40 border-amber-400', sub: 'text-amber-400', icon: 'fa-circle-exclamation' }
      : { label: 'text-rose-400', box: 'bg-rose-950/40 border-rose-400', sub: 'text-rose-400', icon: 'fa-triangle-exclamation' };

  const pendingDecisions = decisions.filter((x) => x.status === 'Pending Review').length;

  const approve = (id: string) => setDecisions([...updateExecutiveDecision(id, 'Approved')]);
  const dismiss = (id: string) => setDecisions([...updateExecutiveDecision(id, 'Dismissed')]);

  const onboarding = (c: Client) => {
    const list = c.onboarding_checklist || [];
    return { done: list.filter((t) => t.completed).length, total: list.length };
  };

  return (
    <>
      {/* ── DualIntelligenceRow ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-purpose="dual-intelligence">
        {/* Sophia's Executive Briefing */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-mca-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <i className="fa-solid fa-robot text-xs"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sophia's Executive Briefing</h3>
                  <p className="text-[10px] font-mono text-slate-400">Autonomous Daily Intelligence</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live Agency Telemetry
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <i className="fa-solid fa-caret-right text-cyan-400 mt-1"></i>
                <span>
                  Today, <strong className="text-white">{d.hot.length} high-value opportunities</strong> require outreach
                  attention across Oregon CCB licensee targets.
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <i className="fa-solid fa-caret-right text-mca-neonGreen mt-1"></i>
                <span>
                  Confirmed agency MRR is holding at{' '}
                  <strong className="text-mca-neonGreen font-mono">{money(d.mrr)}/mo</strong> across {d.active.length} active
                  client retainer{d.active.length === 1 ? '' : 's'}.
                </span>
              </div>
              {renewal && (
                <div className="flex items-start gap-2 text-slate-300">
                  <i className="fa-solid fa-caret-right text-amber-400 mt-1"></i>
                  <span>
                    <strong className="text-amber-300">
                      {d.renewals.length} client contract renewal{d.renewals.length === 1 ? '' : 's'}
                    </strong>{' '}
                    ({renewal.c.business_name}) is approaching within {renewal.days} days.
                  </span>
                </div>
              )}
              {risk && (
                <div className="flex items-start gap-2 text-rose-300 bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
                  <i className="fa-solid fa-triangle-exclamation text-rose-400 mt-0.5"></i>
                  <span>
                    <strong>{risk.business_name}</strong> is flagged At-Risk due to delayed access collection deliverables (DNS /
                    CRM access pending).
                  </span>
                </div>
              )}
            </div>

            {/* Top Recommendation */}
            <div className="mt-3.5 p-3 rounded-lg bg-mca-card border border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  Top Recommendation
                </span>
                {topLead ? (
                  <>
                    <div className="text-xs font-semibold text-white mt-0.5">
                      Contact {topLead.business_name} before the opportunity becomes inactive.
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      High-intent {topLead.niche || 'Contractor'} in {topLead.city || 'your market'} with $
                      {Number(topLead.estimated_retainer || 0).toLocaleString()}/mo retainer potential.
                    </div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-white mt-0.5">
                    No hot leads right now — import or score more leads to surface the next best contact.
                  </div>
                )}
              </div>
              {topLead && (
                <button
                  onClick={() => onStartAICall(topLead.lead_id)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <i className="fa-solid fa-phone text-[10px]"></i>
                  <span>Start Call</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-mca-border flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Updated in real-time based on active CRM events</span>
            <button onClick={onOpenAskSophia} className="text-cyan-400 hover:underline flex items-center gap-1">
              View Full Briefing &amp; Weekly Review <i className="fa-solid fa-arrow-right text-[9px]"></i>
            </button>
          </div>
        </div>

        {/* Agency Health Score */}
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-mca-border">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield-heart text-cyan-400 text-sm"></i>
                <h3 className="text-sm font-bold text-white">Agency Health Score</h3>
              </div>
              <button onClick={onOpenWhyScore} className="text-[10px] font-mono text-cyan-400 hover:underline">
                [Why This Score?]
              </button>
            </div>

            <div className="flex items-center gap-4 my-3">
              <div
                className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center shrink-0 ${tone.box}`}
              >
                <span className="text-2xl font-bold font-mono text-white leading-none">{score}</span>
                <span className={`text-[9px] font-mono ${tone.sub}`}>/ 100</span>
              </div>
              <div>
                <div className={`text-xs font-bold flex items-center gap-1.5 ${tone.label}`}>
                  <i className={`fa-solid ${tone.icon}`}></i> Status: {healthBreakdown.grade}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{healthBreakdown.summary}</p>
              </div>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              {bars.map((b) => {
                const v = Math.max(0, Math.min(100, b.f?.score ?? 0));
                return (
                  <div key={b.label}>
                    <div className="flex justify-between text-slate-300 text-[10px] mb-1">
                      <span>{b.label}</span>
                      <span className={b.text}>{v}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`${b.bar} h-full rounded-full`} style={{ width: `${v}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={onOpenWhyScore}
            className="mt-3 w-full py-2 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            Inspect Detailed Factor Analysis
          </button>
        </div>
      </section>

      {/* ── AutonomousGuidanceSection ─────────────────────────────────── */}
      <section className="space-y-3" data-purpose="autonomous-guidance">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-mca-neonGreen animate-pulse"></span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              WHAT SHOULD MARKETING CHARM AGENCY DO NEXT?
            </h2>
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded">
            Autonomous Executive Guidance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1 — Sales momentum */}
          <div className="glass-panel p-4 rounded-xl hud-border-cyan flex flex-col justify-between space-y-3 hover:border-cyan-400/50 transition">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="bg-rose-950/80 text-rose-400 border border-rose-800/40 px-1.5 py-0.5 rounded font-bold">
                  Urgency: Immediate
                </span>
                <span className="text-slate-400">Sales Momentum</span>
              </div>
              {topLead ? (
                <>
                  <h4 className="text-sm font-bold text-white mt-2">1. Call {topLead.business_name}</h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-1">
                    Evidence: Score {topLead.lead_score}/100
                    {topLead.website_status && /no|missing|none/i.test(topLead.website_status)
                      ? ' with no website.'
                      : ' with an open growth gap.'}
                  </p>
                  <div className="mt-1 text-[11px] text-mca-neonGreen font-mono font-semibold">
                    Expected Impact: +${Number(topLead.estimated_retainer || 0).toLocaleString()}/mo pipeline deal.
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-white mt-2">1. Build the call list</h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-1">Evidence: No hot leads in the pipeline.</p>
                  <div className="mt-1 text-[11px] text-mca-neonGreen font-mono font-semibold">
                    Expected Impact: Restore daily outbound momentum.
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => (topLead ? onOpenDialer(topLead.lead_id) : onNavigateTab('pipeline'))}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <i className="fa-solid fa-phone text-xs"></i>
              <span>{topLead ? 'Launch Dialer' : 'Open Pipeline'}</span>
            </button>
          </div>

          {/* 2 — Retention risk */}
          <div className="glass-panel p-4 rounded-xl hud-border-red flex flex-col justify-between space-y-3 hover:border-rose-400/50 transition">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="bg-rose-950/80 text-rose-400 border border-rose-800/40 px-1.5 py-0.5 rounded font-bold">
                  Urgency: {risk ? 'Immediate' : 'Routine'}
                </span>
                <span className="text-rose-400 font-semibold">Retention Risk</span>
              </div>
              {risk ? (
                <>
                  <h4 className="text-sm font-bold text-white mt-2">2. Resolve {shortName(risk.business_name)} Access</h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-1">
                    Evidence: Account flagged At Risk. Onboarding {onboarding(risk).done}/{onboarding(risk).total} tasks done.
                  </p>
                  <div className="mt-1 text-[11px] text-rose-300 font-mono font-semibold">
                    Expected Impact: Protects {money(risk.actual_mrr)}/mo confirmed retainer.
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-white mt-2">2. Review client health</h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-1">Evidence: No accounts are currently flagged At Risk.</p>
                  <div className="mt-1 text-[11px] text-rose-300 font-mono font-semibold">
                    Expected Impact: Keeps {money(d.mrr)}/mo confirmed MRR protected.
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('clients')}
              className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <i className="fa-solid fa-id-card text-xs"></i>
              <span>Open Client Card</span>
            </button>
          </div>

          {/* 3 — Contract renewal */}
          <div className="glass-panel p-4 rounded-xl hud-border-amber flex flex-col justify-between space-y-3 hover:border-amber-400/50 transition">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="bg-amber-950/80 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded font-bold">
                  Urgency: This Week
                </span>
                <span className="text-slate-400">Contract Renewal</span>
              </div>
              {renewal ? (
                <>
                  <h4 className="text-sm font-bold text-white mt-2">
                    3. Prepare {shortName(renewal.c.business_name)} 6-Mo Extension
                  </h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-1">
                    Evidence: Contract expiration in {renewal.days} days.
                  </p>
                  <div className="mt-1 text-[11px] text-amber-300 font-mono font-semibold">
                    Expected Impact: Secure {money(renewal.c.actual_mrr)}/mo recurring revenue.
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-white mt-2">3. Plan the next renewal cycle</h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-1">Evidence: No contracts expire within 90 days.</p>
                  <div className="mt-1 text-[11px] text-amber-300 font-mono font-semibold">
                    Expected Impact: Stay ahead of churn before it starts.
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('clients')}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <i className="fa-solid fa-file-contract text-xs"></i>
              <span>Review Renewal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── ExecutiveDecisionCenter ───────────────────────────────────── */}
      <section className="glass-panel p-4 rounded-xl space-y-3" data-purpose="decision-center">
        <div className="flex items-center justify-between pb-2 border-b border-mca-border">
          <div>
            <h3 className="text-sm font-bold text-white">Executive Decision Center</h3>
            <p className="text-[11px] text-slate-400">
              Strategic recommendations requiring agency owner confirmation or approval
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {pendingDecisions} Decisions Pending Review
          </span>
        </div>

        <div className="space-y-2.5">
          {decisions.map((x) => {
            const pending = x.status === 'Pending Review';
            const immediate = /immediate/i.test(x.urgency);
            return (
              <div
                key={x.decision_id}
                className={`p-3 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/5 flex flex-wrap items-center justify-between gap-3 transition ${
                  x.status === 'Dismissed' ? 'opacity-50' : x.status === 'Approved' ? 'opacity-75' : ''
                }`}
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className={`${categoryChip(x.category)} px-1.5 py-0.5 rounded`}>{x.category}</span>
                    <span className={urgencyColour(x.urgency)}>Urgency: {x.urgency}</span>
                    {x.status === 'Approved' && (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                        Approved
                      </span>
                    )}
                    {x.status === 'Dismissed' && (
                      <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Dismissed</span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-white mt-1">{x.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{x.description}</p>
                  <div className={`text-[11px] font-mono mt-0.5 ${impactColour(x.category)}`}>
                    Expected Impact: {x.expected_impact}
                  </div>
                </div>

                {pending && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenAskSophia}
                      className="px-2.5 py-1 rounded bg-mca-surface border border-white/10 text-[11px] text-slate-300 hover:text-white"
                    >
                      Ask Sophia
                    </button>
                    <button
                      onClick={() => dismiss(x.decision_id)}
                      className="px-2.5 py-1 rounded bg-mca-surface border border-white/10 text-[11px] text-slate-400 hover:text-rose-400"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => approve(x.decision_id)}
                      className={`px-3 py-1 rounded font-semibold text-[11px] ${
                        immediate && /risk|operation/i.test(x.category)
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-black'
                      }`}
                    >
                      Approve Action
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {decisions.length === 0 && (
            <div className="py-6 text-center text-xs font-mono text-slate-500">No strategic decisions pending.</div>
          )}
        </div>
      </section>
    </>
  );
};
