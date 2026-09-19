import React, { useState } from 'react';
import {
  X,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Play,
  Pause,
  Zap,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AIAgent, AITask } from '../../types/aiWorkforce';
import { toggleAIAgentPause, getAITasks } from '../../services/aiWorkforceService';

interface AgentProfileModalProps {
  isOpen: boolean;
  agent: AIAgent | null;
  onClose: () => void;
  onAgentUpdated: () => void;
  onLaunchTask?: (agent: AIAgent) => void;
}

export const AgentProfileModal: React.FC<AgentProfileModalProps> = ({
  isOpen,
  agent,
  onClose,
  onAgentUpdated,
  onLaunchTask,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'history' | 'metrics'>('overview');

  if (!isOpen || !agent) return null;

  const allTasks = getAITasks();
  const agentTasks = allTasks.filter((t) => t.agent_id === agent.agent_id);

  const handleTogglePause = () => {
    toggleAIAgentPause(agent.agent_id);
    onAgentUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg font-bold text-xl"
              style={{ backgroundColor: agent.avatar_color }}
            >
              {agent.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold tracking-tight text-white">{agent.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    agent.is_paused
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : agent.status === 'Working'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {agent.is_paused ? 'Paused' : agent.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium">{agent.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">Primary Model: {agent.default_model} (Google Gemini)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTogglePause}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                agent.is_paused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
            >
              {agent.is_paused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Agent</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Agent</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Capabilities & Profile
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Permissions & Governance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Task History ({agentTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'metrics'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Operational SLA Metrics
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Mandate</h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60">
                  {agent.name} is Marketing Charm Agency's dedicated {agent.role}. Operating strictly on verified
                  business and market data, {agent.name} executes intelligence, draft preparation, and operational
                  monitoring while enforcing human approval guardrails before external actions.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Assigned Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agent.capabilities.map((cap, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 bg-slate-800/40 border border-slate-700/50 px-3 py-2 rounded-lg text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                {onLaunchTask && (
                  <button
                    onClick={() => {
                      onLaunchTask(agent);
                      onClose();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Task with {agent.name}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-5">
              {/* Can Auto Execute */}
              <div className="border border-emerald-500/20 bg-emerald-950/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Autonomous Execution Allowed</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Non-destructive tasks {agent.name} can complete directly into CRM records without human intervention:
                </p>
                <div className="space-y-1.5">
                  {agent.permissions.can_auto_execute.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requires Approval */}
              <div className="border border-amber-500/20 bg-amber-950/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Requires Explicit Human Approval</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  External communications or pricing actions that must be reviewed in the Approval Center:
                </p>
                <div className="space-y-1.5">
                  {agent.permissions.requires_approval.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strictly Forbidden */}
              <div className="border border-rose-500/20 bg-rose-950/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-rose-400 mb-2">
                  <X className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Strictly Prohibited & Guardrailed</h4>
                </div>
                <div className="space-y-1.5">
                  {agent.permissions.forbidden.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {agentTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No execution tasks logged yet for {agent.name}.
                </div>
              ) : (
                agentTasks.map((t) => (
                  <div
                    key={t.task_id}
                    className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{t.task_type}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            t.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : t.status === 'Waiting for Approval'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Entity: {t.related_entity_name}</p>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Tasks Completed</span>
                </div>
                <div className="text-2xl font-bold text-white">{agent.tasks_completed_count}</div>
                <div className="text-[11px] text-emerald-400 mt-1">100% SLA fulfillment</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approval Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">{agent.approval_rate}%</div>
                <div className="text-[11px] text-slate-400 mt-1">High human trust metric</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Avg Latency</span>
                </div>
                <div className="text-2xl font-bold text-white">{agent.avg_processing_time_ms} ms</div>
                <div className="text-[11px] text-slate-400 mt-1">Gemini 3.8 Flash high throughput</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Failed Tasks</span>
                </div>
                <div className="text-2xl font-bold text-white">{agent.failed_tasks_count}</div>
                <div className="text-[11px] text-slate-400 mt-1">Automatic retry enabled</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Agent ID: {agent.agent_id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
