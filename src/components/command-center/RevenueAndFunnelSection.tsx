import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Filter,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  RevenueCalculations,
  FunnelStep,
  StageForecastItem,
} from '../../services/commandCenterService';

interface RevenueAndFunnelSectionProps {
  revenueMetrics: RevenueCalculations;
  funnelSteps: FunnelStep[];
  forecastStages: StageForecastItem[];
  hasReliableForecast: boolean;
  historyNotice: string;
  onFilterFunnelStep?: (step: FunnelStep) => void;
}

export const RevenueAndFunnelSection: React.FC<RevenueAndFunnelSectionProps> = ({
  revenueMetrics,
  funnelSteps,
  forecastStages,
  hasReliableForecast,
  historyNotice,
  onFilterFunnelStep,
}) => {
  return (
    <div id="revenue-and-funnel-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Visual Sales Funnel (7 Cols) */}
      <div className="lg:col-span-7 bg-mca-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                Sales Funnel & Drop-Off Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks conversion from cold contractor license to won monthly retainer
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Overall Win: <span className="font-bold text-emerald-400">{revenueMetrics.overallConversionRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Funnel Steps */}
          <div className="space-y-2.5">
            {funnelSteps.map((step, idx) => {
              // Calculate width proportional to count (with a minimum of 20% for visibility)
              const maxCount = funnelSteps[0].count || 1;
              const widthPct = Math.max(22, Math.round((step.count / maxCount) * 100));

              return (
                <div
                  key={step.key}
                  onClick={() => onFilterFunnelStep && onFilterFunnelStep(step)}
                  className="group cursor-pointer p-2.5 rounded-lg border border-white/5 hover:border-indigo-800/50 hover:bg-mca-void/70 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-950/50 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white">{step.name}</span>
                      <span className="text-[11px] text-slate-500">
                        ({step.count} leads)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {idx > 0 && step.dropOffRate > 0 && (
                        <span className="text-[11px] font-medium text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded">
                          -{step.dropOffRate}% drop
                        </span>
                      )}
                      <span className="font-bold text-slate-100">
                        ${step.revenueValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar representing funnel step */}
                  <div className="w-full bg-mca-hover h-3 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all ${
                        step.key === 'won'
                          ? 'bg-emerald-500'
                          : step.key === 'proposal_sent'
                          ? 'bg-blue-600'
                          : step.key === 'audit_sent'
                          ? 'bg-blue-500'
                          : 'bg-indigo-400'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>{step.percentageOfTop}% of total pipeline</span>
                    <span className="group-hover:text-indigo-400 transition-colors">
                      Filter leads →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Click any stage cohort to filter active leads table</span>
          <span className="text-indigo-400 font-medium">Real-Time CRM Tracking</span>
        </div>
      </div>

      {/* Pipeline Forecasting & Revenue Intelligence (5 Cols) */}
      <div className="lg:col-span-5 bg-mca-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-1.5">
                Pipeline Stage Forecasting
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic value by progression stage
              </p>
            </div>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mca-hover text-slate-200">
              {hasReliableForecast ? 'Historical Model' : 'Early Stage'}
            </div>
          </div>

          {/* History Notice / Disclaimer */}
          <div
            className={`p-3 rounded-lg text-xs mb-3.5 flex items-start gap-2.5 ${
              hasReliableForecast
                ? 'bg-emerald-950/70 border border-emerald-800/50 text-emerald-300'
                : 'bg-amber-950/70 border border-amber-800/50 text-amber-300'
            }`}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Forecast Notice: </span>
              {historyNotice}
            </div>
          </div>

          {/* Forecast Stages Table */}
          <div className="space-y-2">
            {forecastStages.map((st) => (
              <div
                key={st.stage}
                className="p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs hover:bg-mca-void/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {st.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {st.leadCount} prospects • {st.conversionRate}% cohort share
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-white text-xs sm:text-sm">
                    ${st.estimatedMRR.toLocaleString()}/mo
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {st.stage === 'Won' ? 'Confirmed MRR' : 'Potential MRR'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Guarantee Metric Box */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="bg-mca-void/40 rounded-lg p-3 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-medium">Won Revenue (Locked In):</span>
              <div className="text-sm font-bold text-emerald-300">
                ${revenueMetrics.confirmedWonMRR.toLocaleString()}/mo
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-medium">Pending Close in Proposal:</span>
              <div className="text-sm font-bold text-indigo-300">
                $
                {forecastStages
                  .find((s) => s.stage === 'Proposal Sent')
                  ?.estimatedMRR.toLocaleString() || '0'}
                /mo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
