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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Agency Health Score Breakdown</h3>
              <p className="text-xs text-slate-400">
                Mathematical Evaluation • 7 Operational & Revenue Factors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-black ${
                breakdown.score >= 85
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : breakdown.score >= 70
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : breakdown.score >= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span className="text-xl leading-none">{breakdown.score}</span>
              <span className="text-[9px] uppercase tracking-wider mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rating</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    breakdown.score >= 85
                      ? 'bg-emerald-100 text-emerald-800'
                      : breakdown.score >= 70
                      ? 'bg-blue-100 text-blue-800'
                      : breakdown.score >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {breakdown.grade}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{breakdown.summary}</p>
            </div>
          </div>
        </div>

        {/* Factors List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Factor Breakdown</h4>
          {breakdown.factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {factor.impact === 'Positive' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : factor.impact === 'Negative' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span>{factor.category}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                    {factor.weight}% weight
                  </span>
                </div>
                <div className="font-bold text-slate-700">{factor.score}/100</div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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

              <p className="text-[11px] text-slate-500 leading-relaxed">{factor.details}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" /> Transparent calculation based on live MCA telemetry
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
