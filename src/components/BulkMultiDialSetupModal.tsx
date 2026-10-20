import React from 'react';
import { Lead } from '../types';
import { Phone, AlertCircle, X } from 'lucide-react';

interface BulkMultiDialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (leads: Lead[]) => void;
  selectedLeads: Lead[];
}

export const BulkMultiDialSetupModal: React.FC<BulkMultiDialSetupModalProps> = ({ isOpen, onClose, onStart, selectedLeads }) => {
  if (!isOpen) return null;

  const validLeads = selectedLeads.filter(l => l.phone);
  const invalidLeads = selectedLeads.filter(l => !l.phone);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Bulk Manual Multi-Dial Setup</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm text-slate-300 mb-4">
            You have selected {selectedLeads.length} leads. We will dial them sequentially.
          </p>
          
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-semibold text-white">Leads to dial ({validLeads.length}):</h3>
            {validLeads.map(l => (
              <div key={l.lead_id} className="text-xs text-slate-400 bg-slate-800 p-2 rounded flex justify-between">
                <span>{l.business_name || l.lead_id}</span>
                <span>{l.phone}</span>
              </div>
            ))}
          </div>

          {invalidLeads.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Skipped leads ({invalidLeads.length}):
              </h3>
              {invalidLeads.map(l => (
                <div key={l.lead_id} className="text-xs text-rose-300/70 bg-rose-950/30 p-2 rounded">
                  {l.business_name || l.lead_id} (No phone number)
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={() => onStart(validLeads)} 
            disabled={validLeads.length === 0}
            className="px-3 py-1.5 text-sm font-semibold bg-[var(--primary)] text-white rounded hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> Start Multi-Dialing
          </button>
        </div>
      </div>
    </div>
  );
};
