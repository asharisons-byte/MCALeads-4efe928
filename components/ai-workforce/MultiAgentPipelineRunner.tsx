import React, { useState } from 'react';
import {
  Lead,
} from '../../types';
import {
  MultiAgentPipelineRun,
  AITaskOutput,
} from '../../types/aiWorkforce';
import { runMultiAgentPipeline } from '../../services/aiWorkforceService';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Bot,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface MultiAgentPipelineRunnerProps {
  leads: Lead[];
  onPipelineCompleted: () => void;
  onNavigateToApprovals?: () => void;
}

export const MultiAgentPipelineRunner: React.FC<MultiAgentPipelineRunnerProps> = ({
  leads,
  onPipelineCompleted,
  onNavigateToApprovals,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.lead_id || '');
  const [activeRun, setActiveRun] = useState<MultiAgentPipelineRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(null);

  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId) || leads[0];

  const handleStartPipeline = async () => {
    if (!selectedLead) return;
    setIsRunning(true);
    setExpandedStepIdx(0);

    try {
      const run = await runMultiAgentPipeline(selectedLead, (stepIdx) => {
        setExpandedStepIdx(stepIdx);
      });
      setActiveRun(run);
      onPipelineCompleted();
    } catch (e) {
      console.error('Pipeline failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Multi-Agent Collaboration Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Execute an end-to-end, multi-agent intelligence pipeline on any lead. Specialized AI agents collaborate
              in strict sequence—passing verified evidence downstream without inventing data, culminating in an
              executive sales strategy and human-governed outreach draft.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              disabled={isRunning}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 max-w-xs"
            >
              {leads.map((l) => (
                <option key={l.lead_id} value={l.lead_id}>
                  {l.business_name} ({l.niche || 'Contractor'} - {l.city || 'OR'})
                </option>
              ))}
            </select>

            <button
              onClick={handleStartPipeline}
              disabled={isRunning || !selectedLead}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-md transition-colors"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Pipeline Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Multi-Agent Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Structured Execution Chain
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-sky-400 font-bold">1. ATLAS</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Lead Research & Gaps</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-emerald-400 font-bold">2. NOVA</div>
              <div className="text-[11px] text-slate-400 mt-0.5">SEO & Web Audit</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-amber-400 font-bold">3. ORBIT</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Paid Ads & Tracking</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-indigo-400 font-bold">4. SOPHIA</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Outreach & Pitch</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-slate-300 font-bold">5. NEXUS</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Workflow Validation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Execution Display */}
      {activeRun && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">Pipeline Results: {activeRun.lead_name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeRun.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                  }`}
                >
                  {activeRun.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Run ID: {activeRun.run_id}</p>
            </div>

            {onNavigateToApprovals && (
              <button
                onClick={onNavigateToApprovals}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review in Approval Center</span>
              </button>
            )}
          </div>

          {/* Sequential Step Cards */}
          <div className="space-y-3">
            {activeRun.steps.map((step, idx) => {
              const isExpanded = expandedStepIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden transition-all"
                >
                  {/* Step Header */}
                  <div
                    onClick={() => setExpandedStepIdx(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          step.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : step.status === 'running'
                            ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{step.agent_name}</span>
                          <span className="text-slate-400 text-xs">({step.task_type})</span>
                        </div>
                        {step.output?.summary && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{step.output.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          step.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : step.status === 'running'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {step.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Step Details & Output */}
                  {isExpanded && step.output && (
                    <div className="p-4 pt-0 border-t border-slate-700/50 space-y-3 text-xs bg-slate-900/40">
                      <div>
                        <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                          Executive Synthesis
                        </h4>
                        <p className="text-slate-200 leading-relaxed bg-slate-850 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          {step.output.summary}
                        </p>
                      </div>

                      {step.output.evidence && step.output.evidence.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                            Verified Evidence
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {step.output.evidence.map((ev, i) => (
                              <div
                                key={i}
                                className="bg-slate-800/30 border border-slate-700/30 px-2.5 py-1.5 rounded text-[11px] text-slate-300 flex items-center space-x-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span className="truncate">{ev}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.output.recommendations && step.output.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                            Downstream Recommendations
                          </h4>
                          <div className="space-y-1">
                            {step.output.recommendations.map((rec, i) => (
                              <div
                                key={i}
                                className="bg-slate-800/30 border border-slate-700/30 px-2.5 py-1.5 rounded text-[11px] text-slate-300 flex items-center space-x-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>
                          Data Confidence: <strong className="text-indigo-300">{step.output.confidence}</strong>
                        </span>
                        {step.completed_at && (
                          <span>
                            Completed in: {new Date(step.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
      )}
    </div>
  );
};
