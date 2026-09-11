import React from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Send,
  Users,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SophiaExecutiveInsight } from '../../types';

interface SophiaExecutiveInsightsWidgetProps {
  insights: SophiaExecutiveInsight[];
  onExecuteAction: (insight: SophiaExecutiveInsight) => void;
  onRefreshInsights?: () => void;
}

export const SophiaExecutiveInsightsWidget: React.FC<SophiaExecutiveInsightsWidgetProps> = ({
  insights,
  onExecuteAction,
  onRefreshInsights,
}) => {
  const getCategoryMeta = (category: SophiaExecutiveInsight['category']) => {
    switch (category) {
      case 'Revenue Opportunity':
        return {
          icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'Sales Risk':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          color: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'Campaign Opportunity':
        return {
          icon: <Send className="w-4 h-4 text-indigo-600" />,
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'Lead Opportunity':
        return {
          icon: <Users className="w-4 h-4 text-blue-600" />,
          color: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'Follow-Up Risk':
        return {
          icon: <Clock className="w-4 h-4 text-amber-600" />,
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-slate-600" />,
          color: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div id="sophia-executive-insights" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              Sophia Executive Insights
            </h3>
            <p className="text-xs text-slate-500">
              AI-synthesized strategic recommendations grounded strictly in current pipeline telemetry
            </p>
          </div>
        </div>

        {onRefreshInsights && (
          <button
            onClick={onRefreshInsights}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            Re-analyze Pipeline →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => {
          const meta = getCategoryMeta(insight.category);
          const insightKey = insight.id ? `insight-${insight.id}` : `insight-${insight.category}-${idx}`;
          return (
            <div
              key={insightKey}
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${meta.color}`}>
                    {meta.icon}
                    {insight.category}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      insight.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : insight.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {insight.priority}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {insight.title}
                </h4>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {insight.description}
                </p>

                {insight.estimated_value && (
                  <div className="mt-2.5 text-xs font-semibold text-emerald-700">
                    Revenue Potential: +${insight.estimated_value.toLocaleString()}/mo
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <div className="text-[11px] text-slate-500 mb-2">
                  <strong>Recommended:</strong> {insight.recommended_action}
                </div>
                <button
                  onClick={() => onExecuteAction(insight)}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Take Action
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
