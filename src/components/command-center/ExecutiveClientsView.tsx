import React from 'react';
import {
  Users,
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Sparkles,
  ArrowRight,
  FileText,
  Calendar,
} from 'lucide-react';
import { Client } from '../../types';
import {
  calculateClientHealthMatrix,
  calculateChurnRisks,
  calculateUpcomingRenewals,
  calculateExpansionOpportunities,
} from '../../services/executiveIntelligenceService';

interface ExecutiveClientsViewProps {
  clients: Client[];
  onOpenClient?: (clientId: string) => void;
  onOpenFollowUp?: () => void;
}

export const ExecutiveClientsView: React.FC<ExecutiveClientsViewProps> = ({
  clients,
  onOpenClient,
  onOpenFollowUp,
}) => {
  const [selectedStrategyRenewal, setSelectedStrategyRenewal] = React.useState<any | null>(null);
  const matrix = calculateClientHealthMatrix(clients);
  const churnRisks = calculateChurnRisks(clients);
  const renewals = calculateUpcomingRenewals(clients);
  const expansions = calculateExpansionOpportunities(clients);

  const activeCount = clients.filter((c) => c.status === 'Active').length;
  const atRiskCount = clients.filter((c) => c.status === 'At Risk').length;
  const totalMRR = clients.reduce((sum, c) => sum + (c.actual_mrr || 0), 0);
  const atRiskMRR = clients
    .filter((c) => c.status === 'At Risk')
    .reduce((sum, c) => sum + (c.actual_mrr || 0), 0);

  // Split matrix into 4 quadrants
  const highValHealthy = matrix.filter((m) => m.quadrant === 'High Value / Healthy');
  const highValAtRisk = matrix.filter((m) => m.quadrant === 'High Value / At Risk');
  const lowValHealthy = matrix.filter((m) => m.quadrant === 'Low Value / Healthy');
  const lowValAtRisk = matrix.filter((m) => m.quadrant === 'Low Value / At Risk');

  return (
    <div className="space-y-6">
      {/* 1. CLIENT INTELLIGENCE SUMMARY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active Clients</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{clients.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            ${totalMRR.toLocaleString()}/mo Confirmed MRR
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">At-Risk Accounts</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{atRiskCount}</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
            ${atRiskMRR.toLocaleString()}/mo at risk
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Upcoming Renewals</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{renewals.length}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Within 90 Days</div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Expansion Pipeline</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{expansions.length}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Upsell Opportunities</div>
        </div>
      </div>

      {/* 2. CLIENT HEALTH MATRIX (4 QUADRANTS) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Client Health Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Client Value (Monthly Retainer) vs Client Health Score (0–100)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600">High-Risk Accounts Prioritized</span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Left: High Value / At Risk (PRIORITIZED!) */}
          <div className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> High Value / At Risk (URGENT)
              </span>
              <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                {highValAtRisk.length} Client(s)
              </span>
            </div>

            {highValAtRisk.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">No high value accounts at risk.</div>
            ) : (
              highValAtRisk.map((c) => (
                <div
                  key={c.client_id}
                  className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{c.business_name}</span>
                    <span className="text-rose-600">${c.monthly_retainer.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Health Score: {c.health_score}/100</span>
                    <span className="text-rose-600 font-semibold">{c.risk_factors.join(', ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Top Right: High Value / Healthy */}
          <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High Value / Healthy
              </span>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                {highValHealthy.length} Client(s)
              </span>
            </div>

            {highValHealthy.map((c) => (
              <div
                key={c.client_id}
                className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{c.business_name}</span>
                  <span className="text-emerald-700">${c.monthly_retainer.toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Health Score: {c.health_score}/100</span>
                  <span className="text-emerald-700 font-semibold">Healthy Engagement</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Left: Low Value / At Risk */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                Low Value / At Risk
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {lowValAtRisk.length} Client(s)
              </span>
            </div>
            {lowValAtRisk.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">Zero accounts in this quadrant.</div>
            ) : (
              lowValAtRisk.map((c) => <div key={c.client_id}>{c.business_name}</div>)
            )}
          </div>

          {/* Bottom Right: Low Value / Healthy */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                Low Value / Healthy
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {lowValHealthy.length} Client(s)
              </span>
            </div>
            {lowValHealthy.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">Zero accounts in this quadrant.</div>
            ) : (
              lowValHealthy.map((c) => <div key={c.client_id}>{c.business_name}</div>)
            )}
          </div>
        </div>
      </div>

      {/* 3. CHURN RISK INTELLIGENCE TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Churn Risk Intelligence</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified risk factors, potential revenue exposure, and preventative account interventions
            </p>
          </div>
          <span className="text-xs font-bold text-rose-600">
            ${atRiskMRR.toLocaleString()}/mo Total Exposure
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Client</th>
                <th className="pb-3 font-semibold">Risk Level</th>
                <th className="pb-3 font-semibold">Evidence & Factors</th>
                <th className="pb-3 font-semibold text-right">MRR Exposure</th>
                <th className="pb-3 font-semibold text-right">Health Score</th>
                <th className="pb-3 font-semibold text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {churnRisks.map((risk, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{risk.business_name}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        risk.risk_level === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : risk.risk_level === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {risk.risk_level} Risk
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 text-[11px]">{risk.evidence.join(', ')}</td>
                  <td className="py-3 text-right font-black text-rose-600">
                    ${risk.potential_revenue_at_risk.toLocaleString()}/mo
                  </td>
                  <td className="py-3 text-right font-bold text-slate-800">{risk.health_score}/100</td>
                  <td className="py-3 text-right text-[11px] font-medium text-indigo-700">
                    {risk.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RENEWAL COMMAND CENTER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Renewal Command Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Contracts scheduled for expiration and renewal reviews across 30, 60, and 90 day windows
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            {renewals.length} Approaching Renewal(s)
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {renewals.map((ren, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{ren.business_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Expires in {ren.days_remaining} Days ({ren.renewal_date})
                  </span>
                </div>
                <p className="text-slate-600">
                  Current Services: {ren.current_services.join(', ')} • Contract Renewal Value: $
                  {ren.renewal_value.toLocaleString()}
                </p>
                <p className="text-indigo-900 font-semibold text-[11px]">
                  <strong>Strategy:</strong> {ren.recommended_action}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {onOpenClient && (
                  <button
                    onClick={() => onOpenClient(ren.client_id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Open Client
                  </button>
                )}
                <button
                  onClick={() => setSelectedStrategyRenewal(ren)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Renewal Strategy</span>
                </button>
                <button
                  onClick={() => onOpenFollowUp && onOpenFollowUp()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Create Follow-Up
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CLIENT EXPANSION OPPORTUNITIES DASHBOARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Client Expansion Dashboard</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upsell, cross-sell, and service line additions identified for existing retainer accounts
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600">
            {expansions.length} Qualified Expansions
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {expansions.map((exp) => (
            <div
              key={exp.opportunity_id}
              className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{exp.client_name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {exp.type}
                </span>
              </div>
              <div className="font-bold text-indigo-900">{exp.recommended_service}</div>
              <p className="text-slate-600 text-[11px]">{exp.evidence}</p>
              <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60 font-semibold">
                <span className="text-slate-500">Estimated Value:</span>
                <span className="text-indigo-700 font-bold">+${exp.estimated_value}/mo MRR</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RENEWAL STRATEGY MODAL */}
      {selectedStrategyRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Sophia AI Renewal Strategy • {selectedStrategyRenewal.business_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStrategyRenewal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
                <div className="font-bold text-indigo-950">Contract Window & Health</div>
                <div className="text-slate-600">
                  Days Remaining: <strong>{selectedStrategyRenewal.days_remaining} Days</strong> ({selectedStrategyRenewal.renewal_date})
                </div>
                <div className="text-slate-600">
                  Current Retainer: <strong>${selectedStrategyRenewal.renewal_value?.toLocaleString()}/mo</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                  Proactive Retention Roadmap:
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedStrategyRenewal.recommended_action}. Present a 6-month extension with an included Google Review velocity boost and quarterly local search audit. Offer 5% annual prepay or maintain $2,800/mo rate lock.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="font-bold">Suggested Expansion Upsell:</div>
                <div className="text-[11px] mt-0.5">
                  Voice Search & AI Overview readiness add-on (+ $500/mo) to increase total account value to ${(selectedStrategyRenewal.renewal_value + 500).toLocaleString()}/mo.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedStrategyRenewal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedStrategyRenewal(null);
                  if (onOpenFollowUp) onOpenFollowUp();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
              >
                Queue Strategy Follow-Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
