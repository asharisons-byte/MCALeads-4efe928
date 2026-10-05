import React, { useState, useEffect } from 'react';
import {
  Loader2, CheckCircle, AlertCircle, X, Clock, Bot, Send, Mail, Phone,
  SkipForward, ChevronDown, ChevronUp,
} from 'lucide-react';
import { BulkProgress, BulkOpType, QueueItem } from '../services/bulkQueueService';

interface BulkProgressOverlayProps {
  progress: BulkProgress;
  onClose: () => void;
  onCancel: () => void;
  /** Manual call only — signal that the current call is done, move to next */
  onAdvanceManualCall?: () => void;
}

// ── Countdown clock ──────────────────────────────────────────────────────────
function useCountdown(targetMs?: number) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!targetMs) { setRemaining(0); return; }
    const tick = () => setRemaining(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [targetMs]);

  return remaining;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Icon per type ─────────────────────────────────────────────────────────────
const OP_META: Record<BulkOpType, { label: string; Icon: React.FC<any>; color: string }> = {
  AI_CALL:     { label: 'AI Call',     Icon: Bot,   color: 'text-[var(--secondary)]' },
  MANUAL_CALL: { label: 'Manual Call', Icon: Phone,  color: 'text-[var(--error)]' },
  SMS:         { label: 'Bulk SMS',    Icon: Send,   color: 'text-[var(--primary-container)]' },
  EMAIL:       { label: 'Bulk Email',  Icon: Mail,   color: 'text-[var(--tertiary-fixed-dim)]' },
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'text-[var(--outline)]',
  RUNNING:   'text-yellow-400 animate-pulse',
  SUCCESS:   'text-[var(--primary-container)]',
  FAILED:    'text-[var(--error)]',
  SKIPPED:   'text-[var(--outline)]',
  CANCELLED: 'text-slate-600',
};

// ── Component ─────────────────────────────────────────────────────────────────
export const BulkProgressOverlay: React.FC<BulkProgressOverlayProps> = ({
  progress,
  onClose,
  onCancel,
  onAdvanceManualCall,
}) => {
  const [expanded, setExpanded] = useState(false);
  const remaining = useCountdown(progress.nextScheduledAt);

  const { opType, total, successful, failed, pending, running, isComplete, items } = progress;
  const processed = successful + failed;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const meta = OP_META[opType];

  const hasCountdown = !isComplete && remaining > 0 && (opType === 'SMS' || opType === 'EMAIL');
  const needsManualAdvance = opType === 'MANUAL_CALL' && !isComplete;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-[var(--surface-container-lowest)] border border-[var(--hud-border-bright)] rounded-none shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hud-border-base)]">
        <div className="flex items-center gap-2">
          <meta.Icon className={`w-4 h-4 ${meta.color}`} />
          <span className="text-sm font-bold text-white">{meta.label}</span>
          {!isComplete && (
            <span className="text-xs font-mono text-[var(--outline)] bg-[var(--surface-container)] px-1.5 py-0.5 rounded">
              {processed}/{total}
            </span>
          )}
          {isComplete && (
            <span className="text-xs font-semibold text-[var(--primary-container)]">Complete</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isComplete && (
            <button
              onClick={onCancel}
              className="text-xs text-[var(--error)] hover:text-rose-300 font-semibold px-2 py-1 rounded hover:bg-[var(--surface-container)]"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[var(--outline)] hover:text-[var(--on-surface)] p-1"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {isComplete && (
            <button onClick={onClose} className="text-[var(--outline)] hover:text-[var(--on-surface)] p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="w-full bg-[var(--surface-container)] rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: isComplete
                ? failed > 0 ? '#f87171' : '#34d399'
                : 'linear-gradient(90deg,#6366f1,#818cf8)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--outline)] mt-1 mb-2">
          <span>{pct}%</span>
          <span className="flex gap-3">
            <span className="text-[var(--primary-container)]">✓ {successful}</span>
            {failed > 0 && <span className="text-[var(--error)]">✗ {failed}</span>}
            {pending > 0 && <span>{pending} pending</span>}
          </span>
        </div>
      </div>

      {/* Status row */}
      <div className="px-4 pb-3 space-y-2">
        {/* Currently running */}
        {progress.currentLeadName && running > 0 && (
          <div className="flex items-center gap-2 text-xs text-yellow-300">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            <span className="truncate">Processing: <strong>{progress.currentLeadName}</strong></span>
          </div>
        )}

        {/* Countdown timer for SMS/Email */}
        {hasCountdown && (
          <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-high)] rounded-none px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-[var(--tertiary-fixed-dim)] shrink-0" />
            <span>
              Next send in{' '}
              <span className="font-mono font-bold text-sky-300">{formatCountdown(remaining)}</span>
              {progress.items.find((i) => i.status === 'PENDING') && (
                <> — <span className="text-[var(--outline)] truncate">{progress.items.find((i) => i.status === 'PENDING')?.leadName}</span></>
              )}
            </span>
          </div>
        )}

        {/* Manual call: advance button */}
        {needsManualAdvance && onAdvanceManualCall && running === 0 && (
          <button
            onClick={onAdvanceManualCall}
            className="w-full text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-none px-3 py-2 flex items-center justify-center gap-2 transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Call Ended — Next Lead
          </button>
        )}

        {/* Complete summary */}
        {isComplete && (
          <div className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-high)] rounded-none px-3 py-2">
            {failed === 0
              ? `✅ All ${successful} leads processed successfully.`
              : `⚠️ ${successful} succeeded · ${failed} failed. Review failed leads below.`}
          </div>
        )}
      </div>

      {/* Expandable item list */}
      {expanded && (
        <div className="border-t border-[var(--hud-border-base)] max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-2 px-4 py-2 hover:bg-slate-800/50 border-b border-[var(--hud-border-base)]/50 last:border-0"
            >
              <span className={`text-xs ${STATUS_COLOR[item.status]}`}>
                {item.status === 'SUCCESS' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {item.status === 'FAILED' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                {item.status === 'RUNNING' && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
                {item.status === 'PENDING' && <Clock className="w-3 h-3 inline mr-1" />}
              </span>
              <span className="text-xs text-[var(--on-surface-variant)] truncate flex-1">{item.leadName}</span>
              <span className={`text-xs font-mono ${STATUS_COLOR[item.status]}`}>
                {item.status}
              </span>
              {item.error && (
                <span className="basis-full text-[11px] leading-snug text-rose-400 break-words select-text">
                  {item.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Re-export old interface shape so existing code that imports BulkOperationProgress still compiles
export interface BulkOperationProgress {
  id: string;
  type: 'AI Call' | 'SMS' | 'Email';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'running' | 'completed' | 'failed';
}
