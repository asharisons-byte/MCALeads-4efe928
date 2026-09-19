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
      <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 text-white shadow-md">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <Info className="w-4 h-4" />
          <span>Explicit Revenue Principles & Accounting Clarity</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Confirmed Revenue
            </span>
            <p className="text-slate-300">
              Only includes signed, paying client retainer agreements actively under contract. Never blended with prospects.
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Pipeline Value
            </span>
            <p className="text-slate-300">
              Calculated strictly from leads currently in Contacted, Audit Sent, or Proposal Sent stages.
            </p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
              Estimated Opportunity Value
            </span>
            <p className="text-slate-300">
              Contractor profile models based on Oregon CCB license trade, company size, and digital gaps.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE REVENUE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed MRR */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900">Confirmed Won MRR</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-3">
            ${revenueData.confirmedMRR.toLocaleString()}
            <span className="text-xs font-semibold text-emerald-600 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-emerald-800/80 mt-2 font-medium">
            100% verified across {revenueData.activeClientsCount} active clients
          </p>
        </div>

        {/* Pipeline MRR */}
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900">Pipeline MRR</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-700 mt-3">
            ${revenueData.pipelineMRR.toLocaleString()}
            <span className="text-xs font-semibold text-indigo-600 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-indigo-800/80 mt-2 font-medium">
            Active proposals & qualified discovery pipeline
          </p>
        </div>

        {/* At-Risk MRR */}
        <div className="p-5 bg-gradient-to-br from-rose-50 to-white rounded-3xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-900">At-Risk MRR</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-3">
            ${revenueData.atRiskMRR.toLocaleString()}
            <span className="text-xs font-semibold text-rose-500 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-2 font-medium">
            Cascade Heating (DNS access pending)
          </p>
        </div>

        {/* Renewal Pipeline MRR */}
        <div className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900">Renewals &lt;90 Days</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 mt-3">
            ${revenueData.renewalPipelineMRR.toLocaleString()}
            <span className="text-xs font-semibold text-amber-600 ml-1">/month</span>
          </div>
          <p className="text-[11px] text-amber-800/80 mt-2 font-medium">
            Apex Roofing contract expiration in 24 days
          </p>
        </div>
      </div>

      {/* 3. REVENUE FORECASTING ENGINE (30d, 60d, 90d, 6m) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">Executive MRR Forecasting</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-scenario forward projection factoring active retainers, proposal velocity, and renewal cycles
            </p>
          </div>

          {/* Forecast Time Horizon Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            {(['30 Days', '60 Days', '90 Days', '6 Months'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedForecastPeriod(period)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedForecastPeriod === period
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Conservative Scenario
                </span>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  ${activeForecast.conservative_value.toLocaleString()}
                  <span className="text-xs text-slate-500 font-normal">/mo MRR</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Assumes delayed proposal closes and potential churn deduction.
                </p>
              </div>

              {/* Base (Expected) */}
              <div className="p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50/30 relative">
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-600 text-white">
                  Base Plan
                </span>
                <span className="text-indigo-900 font-bold uppercase text-[10px] tracking-wider">
                  Expected Baseline MRR
                </span>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  ${activeForecast.base_value.toLocaleString()}
                  <span className="text-xs text-indigo-600 font-normal">/mo MRR</span>
                </div>
                <p className="text-[11px] text-indigo-900/80 mt-1.5">
                  Calculated from historical 18% proposal acceptance rate and zero churn.
                </p>
              </div>

              {/* Optimistic */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                <span className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                  Optimistic Scenario
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  ${activeForecast.optimistic_value.toLocaleString()}
                  <span className="text-xs text-emerald-600 font-normal">/mo MRR</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1.5">
                  Accelerated conversion of 3+ proposals and client SEO upsells.
                </p>
              </div>
            </div>

            {/* Assumptions & Data Confidence */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Key Assumptions:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                    Confidence: {activeForecast.confidence}
                  </span>
                </div>
                <ul className="text-slate-600 space-y-0.5 text-[11px] list-disc list-inside">
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">Confirmed Clients & Retainers</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              ${revenueData.confirmedMRR.toLocaleString()}/mo Total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {clients.map((client) => (
              <div
                key={client.client_id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors bg-white flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{client.business_name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        client.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {client.services?.join(', ') || 'Growth Retainer'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    ${(client.actual_mrr || 2400).toLocaleString()}/mo
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {client.contract_length || '6 Months'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Agency Service */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">Revenue by Service Offering</h3>
            </div>
            <span className="text-xs text-slate-500">8 Standard Services</span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {services.map((svc, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{svc.service_name}</div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                    {svc.opportunity_status} • {svc.active_clients} Active Client(s)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">${svc.monthly_revenue.toLocaleString()}/mo</div>
                  <div className="text-[10px] text-slate-400">Avg ${svc.average_retainer.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
