import React from 'react';
import { SophiaExecutiveInsight } from '../../types';

interface SophiaExecutiveInsightsWidgetProps {
  insights: SophiaExecutiveInsight[];
  onExecuteAction: (insight: SophiaExecutiveInsight) => void;
  onRefreshInsights?: () => void;
}

/** Stitch palette per insight category (border / label / action colour + icon). */
const meta = (category: SophiaExecutiveInsight['category']) => {
  switch (category) {
    case 'Follow-Up Risk':
      return { icon: 'fa-clock', text: 'text-rose-400', border: 'border-rose-900/30', action: 'text-rose-400' };
    case 'Sales Risk':
      return { icon: 'fa-triangle-exclamation', text: 'text-rose-400', border: 'border-rose-900/30', action: 'text-rose-400' };
    case 'Lead Opportunity':
      return { icon: 'fa-bullseye', text: 'text-amber-400', border: 'border-amber-900/30', action: 'text-amber-400' };
    case 'Revenue Opportunity':
      return { icon: 'fa-arrow-trend-up', text: 'text-emerald-400', border: 'border-emerald-900/30', action: 'text-emerald-400' };
    case 'Campaign Opportunity':
      return { icon: 'fa-paper-plane', text: 'text-blue-400', border: 'border-blue-900/30', action: 'text-blue-400' };
    default:
      return { icon: 'fa-wand-magic-sparkles', text: 'text-purple-400', border: 'border-purple-900/30', action: 'text-purple-400' };
  }
};

const priorityChip = (p: SophiaExecutiveInsight['priority']) =>
  p === 'Critical'
    ? 'bg-rose-950 text-rose-300'
    : p === 'High'
    ? 'bg-amber-950 text-amber-300'
    : p === 'Medium'
    ? 'bg-blue-950 text-blue-300'
    : 'bg-slate-800 text-slate-300';

/** Sophia Executive Insights — Stitch "SophiaExecutiveInsights" section. */
export const SophiaExecutiveInsightsWidget: React.FC<SophiaExecutiveInsightsWidgetProps> = ({
  insights,
  onExecuteAction,
  onRefreshInsights,
}) => (
  <section id="sophia-executive-insights" className="glass-panel p-4 rounded-xl space-y-3" data-purpose="executive-insights">
    <div className="flex items-center justify-between pb-2 border-b border-mca-border">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-purple-950 flex items-center justify-center text-purple-400 text-xs">
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Sophia Executive Insights</h3>
          <p className="text-[10px] font-mono text-slate-400">
            AI-synthesized strategic recommendations grounded strictly in current pipeline telemetry
          </p>
        </div>
      </div>
      {onRefreshInsights && (
        <button onClick={onRefreshInsights} className="text-xs font-mono text-cyan-400 hover:underline">
          Re-analyze Pipeline →
        </button>
      )}
    </div>

    <div className={`grid grid-cols-1 gap-3 ${insights.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'}`}>
      {insights.map((insight, idx) => {
        const m = meta(insight.category);
        const key = insight.id ? `insight-${insight.id}` : `insight-${insight.category}-${idx}`;
        return (
          <div key={key} className={`p-3.5 rounded-lg bg-mca-card border ${m.border} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`${m.text} font-bold flex items-center gap-1`}>
                  <i className={`fa-solid ${m.icon}`}></i> {insight.category}
                </span>
                <span className={`${priorityChip(insight.priority)} px-1.5 py-0.5 rounded uppercase`}>
                  {insight.priority}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white mt-1.5">{insight.title}</h5>
              <p className="text-[11px] text-slate-400 mt-1">{insight.description}</p>
              {insight.estimated_value ? (
                <div className="text-[11px] font-mono text-emerald-400 mt-1.5">
                  Revenue Potential: +${insight.estimated_value.toLocaleString()}/mo
                </div>
              ) : null}
              <div className="text-[10px] font-mono text-slate-400 mt-2 bg-slate-900/60 p-2 rounded border border-white/5">
                <span className="text-purple-300 font-bold">Recommended:</span> {insight.recommended_action}
              </div>
            </div>
            <button
              onClick={() => onExecuteAction(insight)}
              className={`mt-3 text-xs font-mono ${m.action} hover:text-white flex items-center gap-1 self-start`}
            >
              Take Action →
            </button>
          </div>
        );
      })}
    </div>
  </section>
);
