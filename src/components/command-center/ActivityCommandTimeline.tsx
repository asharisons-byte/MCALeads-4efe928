import React, { useState } from 'react';
import { ActivityEvent } from '../../types';

type Filter = 'all' | 'sales' | 'clients' | 'ai' | 'revenue';

/** Stitch "Activity Command Timeline" (lives inside Operations, Health & Data Integrity). */
export const ActivityCommandTimeline: React.FC<{ activities: ActivityEvent[] }> = ({ activities }) => {
  const [filter, setFilter] = useState<Filter>('all');

  const shown = activities.filter((a) => {
    const t = String(a.type || '');
    if (filter === 'all') return true;
    if (filter === 'sales') return t.includes('lead') || t.includes('pipeline') || t.includes('call');
    if (filter === 'clients') return t.includes('client') || t.includes('onboarding') || t.includes('proposal');
    if (filter === 'ai') return t.includes('ai') || t.includes('agent');
    return t.includes('revenue') || t.includes('won') || t.includes('retainer');
  });

  const icon = (t: string) =>
    t.includes('call')
      ? ['fa-phone', 'text-cyan-400']
      : t.includes('email')
      ? ['fa-envelope', 'text-blue-400']
      : t.includes('sms')
      ? ['fa-comment-sms', 'text-cyan-300']
      : t.includes('ai')
      ? ['fa-robot', 'text-purple-400']
      : t.includes('won')
      ? ['fa-dollar-sign', 'text-mca-neonGreen']
      : ['fa-bolt', 'text-amber-400'];

  return (
    <div className="pt-2" data-purpose="activity-command-timeline">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-white">Activity Command Timeline</div>
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {(['all', 'sales', 'clients', 'ai', 'revenue'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded capitalize ${
                filter === f ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ai' ? 'AI' : f}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="p-6 rounded-lg bg-mca-void/50 border border-white/5 text-center text-xs font-mono text-slate-500">
          No recent activity recorded under this filter. Autonomous background watcher active.
        </div>
      ) : (
        <div className="rounded-lg bg-mca-void/50 border border-white/5 divide-y divide-white/5 max-h-96 overflow-y-auto">
          {shown.slice(0, 15).map((item, idx) => {
            const [ic, col] = icon(String(item.type || ''));
            return (
              <div key={idx} className="px-3 py-2.5 flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-mca-card border border-white/5 flex items-center justify-center shrink-0">
                  <i className={`fa-solid ${ic} ${col} text-[11px]`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-200 truncate">{item.description}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.metadata?.lead_name && (
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{item.metadata.lead_name}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
