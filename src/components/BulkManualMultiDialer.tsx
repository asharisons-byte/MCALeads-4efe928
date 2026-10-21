import React from 'react';
import { Phone, X } from 'lucide-react';
import { BulkProgress } from '../services/bulkQueueService';

interface BulkManualMultiDialerProps {
  progress: BulkProgress;
  onClose: () => void;
  onCancel: () => void;
  onAdvanceManualCall: () => void;
}

export const BulkManualMultiDialer: React.FC<BulkManualMultiDialerProps> = ({
  progress,
  onClose,
  onCancel,
  onAdvanceManualCall,
}) => {
  const [isPaused, setIsPaused] = React.useState(false);

  const { currentLeadName, items, successful, failed } = progress;
  const total = items.length;
  const processed = successful + failed;

  React.useEffect(() => {
    if (progress.isComplete) {
      onClose();
    }
  }, [progress.isComplete, onClose]);

  return (
    <div className="fixed top-20 right-6 w-80 bg-[var(--surface-container-highest)] border border-[var(--outline)] rounded-lg shadow-xl z-50 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-500" />
          Multi-Dial Session
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="text-sm text-slate-300 mb-4">
        Processing <span className="font-bold">{processed + 1}</span> of <span className="font-bold">{total}</span>
      </div>

      <div className="bg-slate-800 p-3 rounded mb-4">
        <div className="text-xs text-slate-400 mb-1">Current Lead</div>
        <div className="text-sm font-semibold text-white truncate">{currentLeadName || 'Loading...'}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log('[BulkManualMultiDialer] Call Next clicked.');
            setIsPaused(false);
            onAdvanceManualCall();
          }}
          disabled={isPaused}
          className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white text-sm font-semibold rounded transition"
        >
          Call Next
        </button>
        <button
          onClick={() => {
            console.log('[BulkManualMultiDialer] Pause clicked. Current state:', isPaused);
            setIsPaused(!isPaused);
          }}
          className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded transition"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-1 mt-2 text-xs text-slate-400 hover:text-white"
      >
        Cancel Session
      </button>
    </div>
  );
};
