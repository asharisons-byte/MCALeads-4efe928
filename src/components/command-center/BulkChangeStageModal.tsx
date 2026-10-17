import React, { useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { PipelineStage } from '../../types';

interface BulkChangeStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (stage: PipelineStage) => void;
}

const VALID_STAGES: PipelineStage[] = ['New Lead', 'Contacted', 'Audit Sent', 'Proposal Sent', 'Won', 'Archived'];

export const BulkChangeStageModal: React.FC<BulkChangeStageModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}) => {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(VALID_STAGES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mca-hover/50 backdrop-blur-xs p-4">
      <div className="bg-mca-card rounded-xl max-w-sm w-full p-6 shadow-xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            Change Stage
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Change stage for <strong>{selectedCount}</strong> selected {selectedCount === 1 ? 'lead' : 'leads'}.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">New Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as PipelineStage)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs bg-mca-card"
            >
              {VALID_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-slate-200 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedStage);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
};
