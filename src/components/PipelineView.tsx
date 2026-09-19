import React from 'react';
import { Lead, PipelineStage } from '../types';
import {
  Flame,
  Star,
  MapPin,
  ChevronRight,
  DollarSign,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';

interface PipelineViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, stage: PipelineStage) => void;
}

const STAGES: PipelineStage[] = [
  'New Lead',
  'Contacted',
  'Audit Sent',
  'Proposal Sent',
  'Won',
  'Retainer',
];

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onSelectLead,
  onUpdateStage,
}) => {
  return (
    <div id="mca-pipeline-kanban" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Pipeline Board</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual kanban tracking deals from initial cold import through high-ticket retainers.
          </p>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.pipeline_stage === stage);
          const stageMRR = stageLeads.reduce((acc, l) => acc + (l.estimated_retainer || 0), 0);

          return (
            <div
              key={stage}
              className="flex flex-col rounded-2xl bg-[#0c101d] border border-slate-800/80 min-w-[220px] max-h-[78vh] overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-900/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{stage}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  ${stageMRR.toLocaleString()}/mo
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {stageLeads.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-800 rounded-xl">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.lead_id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div
                          onClick={() => onSelectLead(lead)}
                          className="font-bold text-xs text-white group-hover:text-indigo-300 cursor-pointer line-clamp-2"
                        >
                          {lead.business_name}
                        </div>
                        {lead.is_hot_target && (
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{lead.niche}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          ${lead.estimated_retainer?.toLocaleString()}/mo
                        </span>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          Score: {lead.lead_score}
                        </span>

                        {/* Move Stage Selector */}
                        <select
                          value={lead.pipeline_stage}
                          onChange={(e) =>
                            onUpdateStage(lead.lead_id, e.target.value as PipelineStage)
                          }
                          className="bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700 px-1 py-0.5"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              Move: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
