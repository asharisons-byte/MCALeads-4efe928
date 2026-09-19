import React from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { ClientServiceProgress } from '../../types/clientPortal';

interface ClientServicesViewProps {
  services: ClientServiceProgress[];
  businessName: string;
  onOpenSophia: () => void;
  onOpenRequestModal: () => void;
}

export const ClientServicesView: React.FC<ClientServicesViewProps> = ({
  services,
  businessName,
  onOpenSophia,
  onOpenRequestModal,
}) => {
  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {services.filter((s) => s.status === 'Active').length} Active Services Pacing
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Active Digital Growth Services
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Live progress milestones, active campaign stages, and upcoming deliverables for {businessName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRequestModal}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Request Scope Change</span>
          </button>
          <button
            onClick={onOpenSophia}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Ask Sophia About Services</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-6">
        {services.map((service) => (
          <div
            key={service.service_id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-5"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                    {service.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    {service.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {service.service_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Current Stage:
                  </span>
                  <span>{service.current_stage}</span>
                </div>
              </div>

              {/* Progress Percentage Indicator */}
              <div className="sm:text-right shrink-0">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {service.progress_pct}%
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Cycle Completion
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${service.progress_pct}%` }}
              ></div>
            </div>

            {/* Latest Agency Update (Client-Friendly) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-slate-200 block mb-0.5">
                  Latest Agency Performance Update
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {service.latest_update}
                </p>
                {service.agency_notes_for_client && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Info className="w-3 h-3 text-indigo-500" />
                    <span>{service.agency_notes_for_client}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones Breakdown: Completed vs Upcoming */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Completed Milestones */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Completed Milestones ({service.completed_milestones.length})</span>
                </div>
                <div className="space-y-2.5">
                  {service.completed_milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-white/90 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {m.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {m.date}
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {m.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Upcoming Milestones ({service.upcoming_milestones.length})</span>
                </div>
                <div className="space-y-2.5">
                  {service.upcoming_milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-white/90 dark:bg-slate-900/80 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {m.title}
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold shrink-0">
                          Target: {m.date}
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {m.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
