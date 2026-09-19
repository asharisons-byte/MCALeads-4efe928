import React from 'react';
import { Lead } from '../types';
import { ListFilter, Flame, Globe, AlertTriangle, Star, ArrowRight } from 'lucide-react';

interface LeadListsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigateToLeads: () => void;
}

export const LeadListsView: React.FC<LeadListsViewProps> = ({
  leads,
  onSelectLead,
  onNavigateToLeads,
}) => {
  const lists = [
    {
      title: 'Hot Targets (Score 90+)',
      desc: 'Top-tier prospects with immediate service fit and high conversion potential.',
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      leads: leads.filter((l) => l.lead_score >= 90),
    },
    {
      title: 'Website Development Gaps',
      desc: 'Established businesses operating without an official owned website.',
      icon: Globe,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      leads: leads.filter((l) => l.website_status === 'No Website'),
    },
    {
      title: 'Technical SEO & PageSpeed Latency',
      desc: 'Slow loading servers (PageSpeed < 50) shedding high-intent mobile visitors.',
      icon: AlertTriangle,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      leads: leads.filter((l) => l.pagespeed_score !== undefined && l.pagespeed_score < 50),
    },
    {
      title: 'Review Acceleration Opportunities',
      desc: 'Strong businesses with fewer than 15 reviews ready for automated SMS review systems.',
      icon: Star,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      leads: leads.filter((l) => (l.gmb_review_count || 0) < 15),
    },
  ];

  return (
    <div id="mca-lead-lists" className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Lead Lists &amp; Segments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic audience segments grouped by agency marketing gaps and retainer potential.
          </p>
        </div>
        <button
          onClick={onNavigateToLeads}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
        >
          <span>Open Main CRM Table</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lists.map((list, idx) => {
          const Icon = list.icon;
          const totalMRR = list.leads.reduce((a, b) => a + (b.estimated_retainer || 0), 0);
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${list.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-mono">{list.leads.length} Leads</span>
                    <div className="text-[10px] text-emerald-400 font-mono">${totalMRR.toLocaleString()}/mo MRR</div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mt-3">{list.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{list.desc}</p>

                <div className="mt-4 space-y-2">
                  {list.leads.slice(0, 3).map((lead) => (
                    <div
                      key={lead.lead_id}
                      onClick={() => onSelectLead(lead)}
                      className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer text-xs group"
                    >
                      <span className="font-semibold text-slate-200 group-hover:text-indigo-300 truncate max-w-[200px]">
                        {lead.business_name}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        Score {lead.lead_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {list.leads.length > 3 && (
                <div className="pt-2 text-[11px] text-slate-500 text-center">
                  +{list.leads.length - 3} more leads in this segment
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
