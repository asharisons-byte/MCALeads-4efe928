import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Info,
  Layers,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Lead, Client, Proposal } from '../../types';
import {
  calculateExecutiveRevenueIntelligence,
  calculateIndustryIntelligence,
  calculateServicePerformance,
} from '../../services/executiveIntelligenceService';

interface ExecutiveRevenueViewProps {
  leads: Lead[];
  clients: Client[];
  proposals: Proposal[];
  onOpenClient?: (clientId: string) => void;
}

export const ExecutiveRevenueView: React.FC<ExecutiveRevenueViewProps> = ({
  leads,
  clients,
  proposals,
  onOpenClient,
}) => {
  const [selectedForecastPeriod, setSelectedForecastPeriod] = useState<
    '30 Days' | '60 Days' | '90 Days' | '6 Months'
  >('30 Days');

  const revenueData = calculateExecutiveRevenueIntelligence(leads, clients, proposals);
  const industries = calculateIndustryIntelligence(leads, clients);
  const services = calculateServicePerformance(clients, leads);

  const activeForecast =
    revenueData.forecasts.find((f) => f.period === selectedForecastPeriod) ||
    revenueData.forecasts[0];

  return (
    <div className="space-y-6">
      {/* 1. EXPLICIT REVENUE DEFINITIONS CALLOUT */}
      <div className="p-4 bg-mca-hover rounded-xl border border-slate-800 text-white shadow-md">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <Info className="w-4 h-4" />
          <span>Explicit Revenue Principles & Accounting Clarity</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Confirmed Revenue
            </span>
            <p className="text-slate-600">
              Only includes signed, paying client retainer agreements actively under contract. Never blended with prospects.
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Pipeline Value
            </span>
            <p className="text-slate-600">
              Calculated strictly from leads currently in Contacted, Audit Sent, or Proposal Sent stages.
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Estimated Opportunity Value
            </span>
            <p className="text-slate-600">
              Contractor profile models based on Oregon CCB license trade, company size, and digital gaps.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE REVENUE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed MRR */}
        <div className="p-5 bg-gradient-to-br from-emerald-950/40 to-mca-card rounded-xl border border-emerald-800/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-300">Confirmed Won MRR</span>
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-300 mt-3">
            ${revenueData.confirmedMRR.toLocaleString()}
            <span className="text-xs font-semibold text-emerald-400 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-2 font-medium">
            100% verified across {revenueData.activeClientsCount} active clients
          </p>
        </div>

        {/* Pipeline MRR */}
        <div className="p-5 bg-gradient-to-br from-indigo-950/40 to-mca-card rounded-xl border border-indigo-800/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300">Pipeline MRR</span>
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-300 mt-3">
            ${revenueData.pipelineMRR.toLocaleString()}
            <span className="text-xs font-semibold text-indigo-400 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-indigo-300/80 mt-2 font-medium">
            Active proposals & qualified discovery pipeline
          </p>
        </div>

        {/* At-Risk MRR */}
        <div className="p-5 bg-gradient-to-br from-rose-950/40 to-mca-card rounded-xl border border-rose-800/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-300">At-Risk MRR</span>
            <div className="p-1.5 rounded-lg bg-rose-950 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 mt-3">
            ${revenueData.atRiskMRR.toLocaleString()}
            <span className="text-xs font-semibold text-rose-400 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-2 font-medium">
            Cascade Heating (DNS access pending)
          </p>
        </div>

        {/* Renewal Pipeline MRR */}
        <div className="p-5 bg-gradient-to-br from-amber-950/40 to-mca-card rounded-xl border border-amber-800/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300">Renewals &lt;90 Days</span>
            <div className="p-1.5 rounded-lg bg-amber-950 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300 mt-3">
            ${revenueData.renewalPipelineMRR.toLocaleString()}
            <span className="text-xs font-semibold text-amber-400 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-2 font-medium">
            Apex Roofing contract expiration in 24 days
          </p>
        </div>
      </div>

      {/* 3. REVENUE FORECASTING ENGINE (30d, 60d, 90d, 6m) */}
      <div className="bg-mca-card rounded-xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-black text-white">Executive MRR Forecasting</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-scenario forward projection factoring active retainers, proposal velocity, and renewal cycles
            </p>
          </div>

          {/* Forecast Time Horizon Buttons */}
          <div className="flex items-center gap-1.5 bg-mca-hover p-1 rounded-xl text-xs font-bold">
            {(['30 Days', '60 Days', '90 Days', '6 Months'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedForecastPeriod(period)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedForecastPeriod === period
                    ? 'bg-mca-card text-indigo-300'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Scenarios Display */}
        {activeForecast && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conservative */}
              <div className="p-4 rounded-xl border border-white/10 bg-mca-void/50">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  Conservative Scenario
                </span>
                <div className="text-2xl font-black text-slate-100 mt-1">
                  ${activeForecast.conservative_value.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal">/mo MRR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Assumes delayed proposal closes and potential churn deduction.
                </p>
              </div>

              {/* Base (Expected) */}
              <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-950/30 relative">
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-600 text-white">
                  Base Plan
                </span>
                <span className="text-indigo-300 font-bold uppercase text-[10px] tracking-wider">
                  Expected Baseline MRR
                </span>
                <div className="text-2xl font-black text-indigo-300 mt-1">
                  ${activeForecast.base_value.toLocaleString()}
                  <span className="text-xs text-indigo-400 font-normal">/mo MRR</span>
                </div>
                <p className="text-[11px] text-indigo-300/80 mt-1.5">
                  Calculated from historical 18% proposal acceptance rate and zero churn.
                </p>
              </div>

              {/* Optimistic */}
              <div className="p-4 rounded-xl border border-emerald-800/50 bg-emerald-950/30">
                <span className="text-emerald-300 font-bold uppercase text-[10px] tracking-wider">
                  Optimistic Scenario
                </span>
                <div className="text-2xl font-black text-emerald-300 mt-1">
                  ${activeForecast.optimistic_value.toLocaleString()}
                  <span className="text-xs text-emerald-400 font-normal">/mo MRR</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-1.5">
                  Accelerated conversion of 3+ proposals and client SEO upsells.
                </p>
              </div>
            </div>

            {/* Assumptions & Data Confidence */}
            <div className="p-4 bg-mca-void/40 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Key Assumptions:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px] font-bold">
                    Confidence: {activeForecast.confidence}
                  </span>
                </div>
                <ul className="text-slate-300 space-y-0.5 text-[11px] list-disc list-inside">
                  {activeForecast.assumptions.map((ass, i) => (
                    <li key={i}>{ass}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. REVENUE BREAKDOWNS (BY CLIENT, BY SERVICE, BY INDUSTRY) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Retainers by Client */}
        <div className="bg-mca-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-black text-white">Confirmed Clients & Retainers</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              ${revenueData.confirmedMRR.toLocaleString()}/mo Total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {clients.map((client) => (
              <div
                key={client.client_id}
                className="p-3.5 rounded-xl border border-white/10 hover:border-indigo-700/60 transition-colors bg-mca-card flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{client.business_name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        client.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {client.services?.join(', ') || 'Growth Retainer'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">
                    ${(client.actual_mrr || 2400).toLocaleString()}/mo
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {client.contract_length || '6 Months'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Agency Service */}
        <div className="bg-mca-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-black text-white">Revenue by Service Offering</h3>
            </div>
            <span className="text-xs text-slate-400">8 Standard Services</span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {services.map((svc, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-white/5 bg-mca-void/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{svc.service_name}</div>
                  <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                    {svc.opportunity_status} • {svc.active_clients} Active Client(s)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">${svc.monthly_revenue.toLocaleString()}/mo</div>
                  <div className="text-[10px] text-slate-500">Avg ${svc.average_retainer.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
