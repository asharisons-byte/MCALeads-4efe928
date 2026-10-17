import React from 'react';
import { Lead } from '../types';

interface SearchSuggestionsProps {
  searchResults: Lead[];
  searchQuery: string;
  onSelectLead: (lead: Lead) => void;
  onClose: () => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  searchResults,
  searchQuery,
  onSelectLead,
  onClose,
}) => {
  if (searchResults.length === 0) {
    return (
      <div className="p-4 text-center text-xs font-mono text-slate-400">
        No matching leads found for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-0.5 mt-1">
      {searchResults.slice(0, 6).map((lead) => (
        <button
          key={lead.lead_id}
          onClick={() => {
            onSelectLead(lead);
            onClose();
          }}
          className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-mca-hover transition"
        >
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="truncate">{lead.business_name}</span>
              <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                {lead.lead_id}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              {lead.niche} · {lead.city}, {lead.state}
            </div>
          </div>
          <div className="text-right shrink-0 pl-3">
            <div className="text-xs font-mono font-bold text-mca-neonGreen">{lead.lead_score}/100</div>
            <div className="text-[10px] font-mono text-slate-400">
              ${lead.estimated_retainer?.toLocaleString()}/mo
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
