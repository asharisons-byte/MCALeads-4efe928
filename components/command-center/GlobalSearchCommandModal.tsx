import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Building,
  Phone,
  Radio,
  Mail,
  Plus,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Lead } from '../../types';

interface GlobalSearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
  onAddNewLead: () => void;
  onOpenDialer: () => void;
  onOpenAIDispatch: () => void;
  onOpenFollowUpQueue: () => void;
  onOpenExportModal: () => void;
}

export const GlobalSearchCommandModal: React.FC<GlobalSearchCommandModalProps> = ({
  isOpen,
  onClose,
  leads,
  onSelectLead,
  onAddNewLead,
  onOpenDialer,
  onOpenAIDispatch,
  onOpenFollowUpQueue,
  onOpenExportModal,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter leads
  const filteredLeads = q
    ? leads
        .filter(
          (l) =>
            l.business_name.toLowerCase().includes(q) ||
            (l.phone && l.phone.includes(q)) ||
            (l.city && l.city.toLowerCase().includes(q)) ||
            (l.niche && l.niche.toLowerCase().includes(q)) ||
            (l.pipeline_stage && l.pipeline_stage.toLowerCase().includes(q))
        )
        .slice(0, 8)
    : leads.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contractor leads, phone, city, or commands..."
            className="w-full text-sm outline-hidden placeholder-slate-400 text-slate-900"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="p-3 space-y-4 flex-1 overflow-y-auto">
          {/* Quick Command Shortcuts */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Quick Commands
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => {
                  onClose();
                  onAddNewLead();
                }}
                className="p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left flex items-center gap-2 text-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Add New Contractor Lead</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAIDispatch();
                }}
                className="p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left flex items-center gap-2 text-slate-800 transition-colors"
              >
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>Launch Sophia AI Call</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenDialer();
                }}
                className="p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left flex items-center gap-2 text-slate-800 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Open CRM Dialer</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenFollowUpQueue();
                }}
                className="p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left flex items-center gap-2 text-slate-800 transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>View Follow-Up Queue</span>
              </button>
            </div>
          </div>

          {/* Lead Search Results */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Contractor Leads ({filteredLeads.length})
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching leads found for "{query}".
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.lead_id}
                    onClick={() => {
                      onClose();
                      onSelectLead(lead.lead_id);
                    }}
                    className="p-2.5 rounded-lg hover:bg-indigo-50/70 hover:border-indigo-200 border border-transparent flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                          {lead.business_name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {lead.city || 'Portland'}, OR • {lead.niche} • Score {lead.lead_score}/100
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 text-[10px]">
                        {lead.pipeline_stage}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search by contractor business name, city, or CCB trade</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
