import React from 'react';
import {
  AIAgent,
  AIAgentId,
} from '../../types/aiWorkforce';
import {
  Bot,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Activity,
  Award,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AgentRosterGridProps {
  agents: AIAgent[];
  onSelectAgent: (agent: AIAgent) => void;
  onTogglePause: (agentId: AIAgentId) => void;
  onLaunchTask: (agent: AIAgent) => void;
}

export const AgentRosterGrid: React.FC<AgentRosterGridProps> = ({
  agents,
  onSelectAgent,
  onTogglePause,
  onLaunchTask,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {agents.map((agent) => {
        const isSophia = agent.agent_id === 'sophia';
        return (
          <div
            key={agent.agent_id}
            className={`relative bg-slate-900/90 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-slate-600 ${
              isSophia
                ? 'border-indigo-500/50 shadow-indigo-950/30'
                : 'border-slate-800'
            }`}
          >
            {/* Top Indicator */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: agent.avatar_color }}
                  >
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-base tracking-tight">{agent.name}</h3>
                      {isSophia && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Primary AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{agent.role}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    agent.is_paused
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : agent.status === 'Working'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {agent.is_paused ? 'Paused' : agent.status}
                </span>
              </div>

              {/* Status or Active Task */}
              {agent.current_task ? (
                <div className="mb-3.5 bg-blue-950/30 border border-blue-800/40 rounded-lg p-2 flex items-center space-x-2 text-xs text-blue-300">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span className="truncate">{agent.current_task}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-3.5 line-clamp-2 min-h-[32px]">
                  {agent.capabilities.slice(0, 3).join(' • ')}
                </p>
              )}

              {/* Core Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-800/50 rounded-lg border border-slate-800 mb-4 text-center">
                <div>
                  <div className="text-xs font-bold text-white">{agent.tasks_completed_count}</div>
                  <div className="text-[10px] text-slate-400">Completed</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400">{agent.success_rate}%</div>
                  <div className="text-[10px] text-slate-400">Success</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-300">{agent.avg_processing_time_ms}ms</div>
                  <div className="text-[10px] text-slate-400">Avg Speed</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onSelectAgent(agent)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 transition-colors"
              >
                <span>View Profile</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onTogglePause(agent.agent_id)}
                  title={agent.is_paused ? 'Resume Agent' : 'Pause Agent'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    agent.is_paused
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300'
                  }`}
                >
                  {agent.is_paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => onLaunchTask(agent)}
                  disabled={agent.is_paused}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <Zap className="w-3 h-3" />
                  <span>Run Task</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
