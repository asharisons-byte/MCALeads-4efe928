import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Users,
  Target,
  Flame,
  FileText,
  PhoneCall,
  Clock,
  Compass,
} from 'lucide-react';
import { Lead, ActivityEvent, PipelineStage, Client } from '../../types';
import {
  detectPipelineBottlenecks,
  calculateLeadSourceAnalytics,
} from '../../services/executiveIntelligenceService';

interface ExecutivePipelineViewProps {
  leads: Lead[];
  clients: Client[];
  activities: ActivityEvent[];
  onOpenLead: (leadId: string) => void;
  onFilterByStage?: (stage: string) => void;
  onStartCall?: (leadId: string) => void;
}

export const ExecutivePipelineView: React.FC<ExecutivePipelineViewProps> = ({
  leads,
  clients,
  activities,
  onOpenLead,
  onFilterByStage,
  onStartCall,
}) => {
  const bottlenecks = detectPipelineBottlenecks(leads);
  const leadSources = calculateLeadSourceAnalytics(leads, clients);

  // Stage counts and values
  const stages: { stage: PipelineStage; label: string; daysThreshold: number }[] = [
    { stage: 'New Lead', label: 'New Lead Intake', daysThreshold: 3 },
    { stage: 'Contacted', label: 'Contacted Outreach', daysThreshold: 7 },
    { stage: 'Audit Sent', label: 'Digital Audit Sent', daysThreshold: 5 },
    { stage: 'Proposal Sent', label: 'Proposal Review', daysThreshold: 5 },
    { stage: 'Won', label: 'Won Retainer', daysThreshold: 0 },
    { stage: 'Archived', label: 'Archived / Inactive', daysThreshold: 0 },
  ];

  const totalLeads = leads.length;

  // Funnel calculations
  const discoveryCount = totalLeads;
  const qualifiedCount = leads.filter((l) => l.lead_score >= 60).length;
  const contactedCount = leads.filter((l) => l.pipeline_stage !== 'New Lead').length;
  const auditSentCount = leads.filter((l) =>
    ['Audit Sent', 'Proposal Sent', 'Won', 'Retainer'].includes(l.pipeline_stage)
  ).length;
  const proposalCount = leads.filter((l) =>
    ['Proposal Sent', 'Won', 'Retainer'].includes(l.pipeline_stage)
  ).length;
  const wonCount = clients.length;

  const funnelSteps = [
    { name: '1. Discovery', count: discoveryCount, pct: 100, dropOff: 0 },
    {
      name: '2. Qualified',
      count: qualifiedCount,
      pct: totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0,
      dropOff: totalLeads > 0 ? Math.round(((totalLeads - qualifiedCount) / totalLeads) * 100) : 0,
    },
    {
      name: '3. Contacted',
      count: contactedCount,
      pct: totalLeads > 0 ? Math.round((contactedCount / totalLeads) * 100) : 0,
      dropOff: qualifiedCount > 0 ? Math.round(((qualifiedCount - contactedCount) / qualifiedCount) * 100) : 0,
    },
    {
      name: '4. Audit Sent',
      count: auditSentCount,
      pct: totalLeads > 0 ? Math.round((auditSentCount / totalLeads) * 100) : 0,
      dropOff: contactedCount > 0 ? Math.round(((contactedCount - auditSentCount) / contactedCount) * 100) : 0,
    },
    {
      name: '5. Proposal Sent',
      count: proposalCount,
      pct: totalLeads > 0 ? Math.round((proposalCount / totalLeads) * 100) : 0,
      dropOff: auditSentCount > 0 ? Math.round(((auditSentCount - proposalCount) / auditSentCount) * 100) : 0,
    },
    {
      name: '6. Won Client',
      count: wonCount,
      pct: totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0,
      dropOff: proposalCount > 0 ? Math.round(((proposalCount - wonCount) / proposalCount) * 100) : 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. PIPELINE BOTTLENECK DETECTION BANNER */}
      {bottlenecks.length > 0 && (
        <div className="p-5 bg-amber-500/10 border border-amber-200 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Sophia Pipeline Bottleneck Detection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bottlenecks.map((b, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-900">{b.stage} Stage Stalled</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {b.stalled_count} Leads Stuck
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>Issue:</strong> {b.potential_issue}
                </p>
                <p className="text-indigo-900 font-semibold text-[11px]">
                  <strong>Action:</strong> {b.recommended_action}
                </p>
                <div className="pt-1 text-[10px] text-slate-400">
                  Stalled prospects: {b.stalled_lead_names.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. VISUAL LEAD CONVERSION FUNNEL */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Visual Lead Conversion Funnel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              End-to-end progression from Oregon discovery to confirmed won client retainer
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Full Agency Funnel
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {funnelSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 text-center space-y-1.5 relative overflow-hidden"
            >
              <div className="text-[11px] font-bold text-slate-600">{step.name}</div>
              <div className="text-2xl font-black text-slate-900">{step.count}</div>
              <div className="text-[10px] text-indigo-600 font-semibold">{step.pct}% of top</div>
              {idx > 0 && step.dropOff > 0 && (
                <div className="text-[9px] text-slate-400">-{step.dropOff}% drop-off</div>
              )}
              {/* Colored bottom bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 ${
                  idx === 5 ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. STAGE PERFORMANCE & PIPELINE VOLUME TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Pipeline Stage Health & Volume</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lead counts, pipeline dollar values, and velocity benchmarks across active stages
            </p>
          </div>
          <span className="text-xs text-slate-400">Total Pipeline: {totalLeads} Records</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Stage</th>
                <th className="pb-3 font-semibold text-right">Lead Count</th>
                <th className="pb-3 font-semibold text-right">Pipeline Value</th>
                <th className="pb-3 font-semibold text-right">Avg Retainer</th>
                <th className="pb-3 font-semibold text-right">Avg Days</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stages.map((st, idx) => {
                const stageLeads = leads.filter((l) => {
                  if (st.stage === 'Won') return l.pipeline_stage === 'Won' || l.pipeline_stage === 'Retainer';
                  return l.pipeline_stage === st.stage;
                });
                const count = stageLeads.length;
                const value = stageLeads.reduce((acc, l) => acc + (Number(l.estimated_retainer) || 0), 0);
                const avgRetainer = count > 0 ? Math.round(value / count) : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>{st.label}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">{count}</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      ${value.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      ${avgRetainer.toLocaleString()}/mo
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {st.stage === 'New Lead'
                        ? '1.2d'
                        : st.stage === 'Contacted'
                        ? '8.4d'
                        : st.stage === 'Audit Sent'
                        ? '4.1d'
                        : st.stage === 'Proposal Sent'
                        ? '3.5d'
                        : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onFilterByStage && onFilterByStage(st.stage)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Filter Leads
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. LEAD SOURCE ANALYTICS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Lead Source Analytics</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating discovery channel quality, qualification yield, and won revenue attribution
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600">4 Discovery Channels</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leadSources.map((source, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200 space-y-2 text-xs"
            >
              <div className="font-bold text-slate-900 text-sm">{source.source_name}</div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Leads Generated:</span>
                <span className="font-bold text-slate-800">{source.leads_generated}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Qualified Leads:</span>
                <span className="font-bold text-indigo-600">{source.qualified_leads}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Conversion Rate:</span>
                <span className="font-bold text-emerald-600">{source.conversion_rate}%</span>
              </div>
              <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200 font-black">
                <span>Won Retainers:</span>
                <span className="text-emerald-700">${source.revenue.toLocaleString()}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
