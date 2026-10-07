import React, { useMemo } from 'react';
import { Lead, Client } from '../../types';
import { getAITasks, getAIApprovals } from '../../services/aiWorkforceService';

interface ExecutiveTelemetryGridProps {
  leads: Lead[];
  clients: Client[];
  onNavigateTab: (tab: string) => void;
}

/** Days until a client's contract ends (null when no start date). */
export function daysUntilRenewal(c: Client, now = Date.now()): number | null {
  if (!c.contract_start_date) return null;
  const start = new Date(c.contract_start_date).getTime();
  if (Number.isNaN(start)) return null;
  const len = c.contract_length?.includes('6') ? 180 : 90;
  return Math.ceil((start + len * 86400000 - now) / 86400000);
}

/**
 * ExecutiveTelemetryGrid — Stitch "PrimaryMetricsTopGrid".
 * Ten headline numbers pinned DIRECTLY at the top of the command canvas,
 * separating CONFIRMED retainers from PIPELINE deals.
 */
export const ExecutiveTelemetryGrid: React.FC<ExecutiveTelemetryGridProps> = ({ leads, clients, onNavigateTab }) => {
  const m = useMemo(() => {
    const hot = leads.filter((l) => l.is_hot_target).length;
    const qualified = leads.filter((l) => l.lead_score >= 60 && l.pipeline_stage !== 'Archived').length;
    const live = clients.filter((c) => c.status === 'Active' || c.status === 'Onboarding');
    const churned = clients.filter((c) => c.status === 'Churned').length;
    const retention = clients.length > 0 ? Math.round(((clients.length - churned) / clients.length) * 100) : 100;
    const wonMRR = clients.reduce((s, c) => s + (c.actual_mrr || 0), 0);
    const pipelineMRR = leads
      .filter((l) => ['Contacted', 'Audit Sent', 'Proposal Sent', 'Negotiation'].includes(l.pipeline_stage))
      .reduce((s, l) => s + (Number(l.estimated_retainer) || 0), 0);
    const atRisk = clients.filter((c) => c.status === 'At Risk');
    const atRiskMRR = atRisk.reduce((s, c) => s + (c.actual_mrr || 0), 0);
    const renewals = clients
      .map((c) => ({ c, d: daysUntilRenewal(c) }))
      .filter((r) => r.d !== null && r.d > 0 && r.d <= 90)
      .sort((a, b) => (a.d as number) - (b.d as number));

    const today = new Date().toISOString().split('T')[0];
    let aiToday = 0;
    let pending = 0;
    try {
      aiToday = getAITasks().filter((t) => (t.created_at || '').startsWith(today)).length;
      pending = getAIApprovals().filter((a) => String(a.status).toLowerCase() === 'pending').length;
    } catch {
      /* stores unavailable — show zero */
    }
    return { hot, qualified, live: live.length, retention, wonMRR, pipelineMRR, atRisk, atRiskMRR, renewals, aiToday, pending };
  }, [leads, clients]);

  const firstWord = (n?: string) => (n || '').split(/[\s&]+/)[0];
  const shortName = (n?: string) => (n || '').split(' & ')[0];
  const money = (n: number) => `$${n.toLocaleString()}`;
  const nextRenewal = m.renewals[0];

  const click = (tab: string) => () => onNavigateTab(tab);

  return (
    <section data-purpose="primary-top-metrics" id="mca-telemetry-grid">
      <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-chart-line text-cyan-400"></i>
          Agency Executive Telemetry (Live Sync)
        </span>
        <span className="text-slate-500 hidden sm:inline">Separating Confirmed from Pipeline Deals</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Card 1: Total Leads (Neon Cyan) */}
        <div
          onClick={click('leads')}
          className="glass-panel p-3.5 rounded-xl hud-border-cyan hover:border-cyan-500/40 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Total Leads</span>
            <i className="fa-solid fa-database text-cyan-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white group-hover:text-cyan-400 transition">
            {leads.length}
          </div>
          <div className="text-[10px] font-mono text-cyan-400/90 mt-0.5">Discovered in OR</div>
        </div>

        {/* Card 2: Hot Leads (Laser Emerald) */}
        <div
          onClick={click('leads')}
          className="glass-panel p-3.5 rounded-xl hud-border-green hover:border-mca-neonGreen transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Hot Leads</span>
            <i className="fa-solid fa-fire text-mca-neonGreen animate-bounce"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-mca-neonGreen">{m.hot}</div>
          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">High Intent &gt; 80</div>
        </div>

        {/* Card 3: Qualified Opps (Electric Purple) */}
        <div
          onClick={click('leads')}
          className="glass-panel p-3.5 rounded-xl hud-border-purple hover:border-purple-500/40 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Qualified Opps</span>
            <i className="fa-solid fa-bolt text-purple-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-300 group-hover:text-white transition">
            {m.qualified}
          </div>
          <div className="text-[10px] font-mono text-purple-400/90 mt-0.5">Score ≥ 60</div>
        </div>

        {/* Card 4: Active Clients */}
        <div
          onClick={click('clients')}
          className="glass-panel p-3.5 rounded-xl hud-border-green hover:border-emerald-500/40 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Active Clients</span>
            <i className="fa-solid fa-shield-halved text-emerald-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white group-hover:text-emerald-300 transition">
            {m.live}
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{m.retention}% Retention</div>
        </div>

        {/* Card 5: Won MRR */}
        <div
          onClick={click('revenue')}
          className="glass-panel p-3.5 rounded-xl hud-border-green bg-gradient-to-br from-emerald-950/20 to-transparent group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Won MRR</span>
            <i className="fa-solid fa-dollar-sign text-mca-neonGreen"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-mca-neonGreen">{money(m.wonMRR)}</div>
          <div className="text-[10px] font-mono text-slate-300 mt-0.5">CONFIRMED Retainers</div>
        </div>

        {/* Card 6: Pipeline MRR */}
        <div
          onClick={click('revenue')}
          className="glass-panel p-3.5 rounded-xl border-l-2 border-slate-600 hover:border-slate-500 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Pipeline MRR</span>
            <i className="fa-solid fa-arrow-trend-up text-slate-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-200 group-hover:text-white transition">
            {money(m.pipelineMRR)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">Active Pipeline Deals</div>
        </div>

        {/* Card 7: At-Risk MRR (Crimson) */}
        <div
          onClick={click('clients')}
          className="glass-panel p-3.5 rounded-xl hud-border-red bg-rose-950/20 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-rose-300 font-mono">
            <span>At-Risk MRR</span>
            <i className="fa-solid fa-triangle-exclamation text-rose-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400 group-hover:text-rose-300 transition">
            {money(m.atRiskMRR)}
          </div>
          <div className="text-[10px] font-mono text-rose-300 mt-0.5">
            {m.atRisk.length > 0
              ? `${m.atRisk.length} account${m.atRisk.length === 1 ? '' : 's'} flagged (${firstWord(m.atRisk[0].business_name)})`
              : 'No accounts flagged'}
          </div>
        </div>

        {/* Card 8: Renewals <90d (Amber) */}
        <div onClick={click('clients')} className="glass-panel p-3.5 rounded-xl hud-border-amber group cursor-pointer">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono">
            <span>Renewals &lt;90d</span>
            <i className="fa-solid fa-hourglass-half text-amber-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300 group-hover:text-white transition">
            {m.renewals.length}
          </div>
          <div className="text-[10px] font-mono text-amber-400 mt-0.5">
            {nextRenewal ? `${shortName(nextRenewal.c.business_name)} (${nextRenewal.d}d)` : 'None due'}
          </div>
        </div>

        {/* Card 9: AI Tasks Today */}
        <div
          onClick={click('ai_workforce')}
          className="glass-panel p-3.5 rounded-xl border-l-2 border-purple-500/50 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>AI Tasks Today</span>
            <i className="fa-solid fa-robot text-purple-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white group-hover:text-purple-300 transition">
            {m.aiToday}
          </div>
          <div className="text-[10px] font-mono text-purple-400 mt-0.5">7 Autonomous Agents</div>
        </div>

        {/* Card 10: Pending Approvals */}
        <div
          onClick={click('ai_workforce')}
          className="glass-panel p-3.5 rounded-xl border-l-2 border-slate-600 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Pending Approvals</span>
            <i className="fa-solid fa-user-check text-slate-400"></i>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-200 group-hover:text-white transition">
            {m.pending}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">Human-in-the-Loop</div>
        </div>
      </div>
    </section>
  );
};
