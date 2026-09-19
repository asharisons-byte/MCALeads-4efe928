import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Key,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ClientOnboardingProgress,
  ClientAccessRequest,
  ClientPortalUser,
} from '../../types/clientPortal';
import { toggleOnboardingStep } from '../../services/clientPortalService';

interface ClientOnboardingViewProps {
  onboarding: ClientOnboardingProgress;
  accessRequests: ClientAccessRequest[];
  currentUser: ClientPortalUser;
  businessName: string;
  onRefresh: () => void;
}

export const ClientOnboardingView: React.FC<ClientOnboardingViewProps> = ({
  onboarding,
  accessRequests,
  currentUser,
  businessName,
  onRefresh,
}) => {
  const [expandedAccessId, setExpandedAccessId] = useState<string | null>(null);

  const completedStepsCount = onboarding.steps.filter((s) => s.completed).length;
  const progressPct = Math.round((completedStepsCount / (onboarding.steps.length || 1)) * 100);

  const handleToggleStep = (stepId: string) => {
    toggleOnboardingStep(currentUser.client_id, stepId);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Onboarding Command Center
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client Launch & Technical Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track onboarding milestones and review zero-password access delegation for {businessName}.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="sm:text-right shrink-0">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {progressPct}% Complete
          </div>
          <span className="text-[11px] text-slate-400">
            {completedStepsCount} of {onboarding.steps.length} Milestones Checked
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>

      {/* Onboarding Checklist Steps */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-500" />
          Onboarding Roadmap Milestones
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {onboarding.steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => handleToggleStep(step.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                step.completed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50/80 dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  step.completed
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Step {idx + 1} • {step.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      step.completed
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {step.action_label || (step.completed ? 'Completed' : 'Pending')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Requirements Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Technical Platform Access
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Zero-Password Platform Delegation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            In compliance with agency security standards, never send passwords in email or chat. Use the official delegation instructions below to grant Manager permissions to Marketing Charm Agency.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {accessRequests.map((req) => {
            const isExpanded = expandedAccessId === req.access_id;
            const isGranted = req.status === 'Granted & Verified';

            return (
              <div
                key={req.access_id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedAccessId(isExpanded ? null : req.access_id)}
                  className="p-4 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isGranted
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {req.platform}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {req.why_needed}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isGranted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse'
                      }`}
                    >
                      {req.status}
                    </span>
                    <button className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      Step-by-Step Delegation Instructions (Zero Passwords Required):
                    </h5>
                    <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {req.instructions.map((stepText, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {stepText}
                        </li>
                      ))}
                    </ol>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Agency Delegate: access@marketingcharmagency.com</span>
                      {req.verified_at && (
                        <span className="text-emerald-600 font-mono">
                          Verified on {new Date(req.verified_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
