import React from 'react';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

export interface BulkOperationProgress {
  id: string;
  type: 'AI Call' | 'SMS' | 'Email';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'running' | 'completed' | 'failed';
}

interface BulkProgressOverlayProps {
  operation: BulkOperationProgress;
  onClose: () => void;
}

export const BulkProgressOverlay: React.FC<BulkProgressOverlayProps> = ({ operation, onClose }) => {
  const progress = (operation.processed / operation.total) * 100;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Bulk {operation.type}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Progress</span>
          <span>{operation.processed} / {operation.total}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          {operation.successful} Success
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {operation.failed} Failed
        </div>
      </div>

      {operation.status === 'running' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Processing next lead...
        </div>
      )}
    </div>
  );
};
