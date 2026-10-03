import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tag: string) => void;
  selectedCount: number;
}

export const BulkTagModal: React.FC<BulkTagModalProps> = ({ isOpen, onClose, onConfirm, selectedCount }) => {
  const [tagName, setTagName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Bulk Tag {selectedCount} Leads</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-semibold block">Enter tag label:</label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g. VIP, Q4 Target"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
            Cancel
          </button>
          <button
            disabled={!tagName.trim()}
            onClick={() => { onConfirm(tagName); onClose(); }}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" /> Apply Tag
          </button>
        </div>
      </div>
    </div>
  );
};
