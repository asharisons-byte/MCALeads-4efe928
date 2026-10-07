import React from 'react';
import { X, ShieldCheck, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AgencyHealthBreakdown } from '../../services/executiveIntelligenceService';

interface HealthScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: AgencyHealthBreakdown;
}

export const HealthScoreBreakdownModal: React.FC<HealthScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  breakdown,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mca-hover/60 backdrop-blur-xs p-4">
      <div className="bg-mca-card w-full max-w-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-mca-hover text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Agency Health Score Breakdown</h3>
              <p className="text-xs text-slate-500">
                Mathematical Evaluation • 7 Operational & Revenue Factors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-mca-card/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="p-4 bg-mca-void/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border font-black ${
                breakdown.score >= 85
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                  : breakdown.score >= 70
                  ? 'bg-blue-950/50 text-blue-300 border-blue-800/50'
                  : breakdown.score >= 50
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/50'
                  : 'bg-rose-950/50 text-rose-300 border-rose-800/50'
              }`}
            >
              <span className="text-xl leading-none">{breakdown.score}</span>
              <span className="text-[9px] uppercase tracking-wider mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rating</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    breakdown.score >= 85
                      ? 'bg-emerald-950 text-emerald-300'
                      : breakdown.score >= 70
                      ? 'bg-blue-950 text-blue-300'
                      : breakdown.score >= 50
                      ? 'bg-amber-950 text-amber-300'
                      : 'bg-rose-950 text-rose-300'
                  }`}
                >
                  {breakdown.grade}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">{breakdown.summary}</p>
            </div>
          </div>
        </div>

        {/* Factors List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Factor Breakdown</h4>
          {breakdown.factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3 bg-mca-card rounded-xl border border-white/10 space-y-2 hover:border-white/15 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  {factor.impact === 'Positive' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : factor.impact === 'Negative' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{factor.category}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-mca-hover text-slate-400 font-semibold">
                    {factor.weight}% weight
                  </span>
                </div>
                <div className="font-bold text-slate-200">{factor.score}/100</div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-mca-hover rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    factor.score >= 80
                      ? 'bg-emerald-500'
                      : factor.score >= 60
                      ? 'bg-blue-500'
                      : factor.score >= 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{factor.details}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-mca-void/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500" /> Transparent calculation based on live MCA telemetry
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-mca-hover text-white font-semibold hover:bg-slate-800 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
