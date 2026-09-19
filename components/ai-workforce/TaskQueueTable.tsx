import React, { useState } from 'react';
import {
  AITask,
  AITaskStatus,
  AITaskPriority,
  AIAgentId,
  AITaskOutput,
} from '../../types/aiWorkforce';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
  FileText,
  Eye,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface TaskQueueTableProps {
  tasks: AITask[];
  onRetryTask: (task: AITask) => void;
  onCancelTask: (task: AITask) => void;
  onViewApproval?: (approvalId: string) => void;
}

export const TaskQueueTable: React.FC<TaskQueueTableProps> = ({
  tasks,
  onRetryTask,
  onCancelTask,
  onViewApproval,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [inspectTask, setInspectTask] = useState<AITask | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (selectedAgent !== 'all' && t.agent_id !== selectedAgent) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = t.related_entity_name.toLowerCase().includes(q);
      const matchType = t.task_type.toLowerCase().includes(q);
      const matchAgent = t.agent_id.toLowerCase().includes(q);
      if (!matchName && !matchType && !matchAgent) return false;
    }
    return true;
  });

  const getPriorityBadge = (p: AITaskPriority) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadge = (s: AITaskStatus) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Waiting for Approval':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Cancelled':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, entity name, or agent..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* Agent Filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Agents (7)</option>
            <option value="sophia">Sophia</option>
            <option value="atlas">Atlas</option>
            <option value="nova">Nova</option>
            <option value="orbit">Orbit</option>
            <option value="aria">Aria</option>
            <option value="pulse">Pulse</option>
            <option value="nexus">Nexus</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Queued">Queued</option>
            <option value="Processing">Processing</option>
            <option value="Waiting for Approval">Waiting for Approval</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Task & Type</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No tasks found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{task.task_type}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{task.task_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-slate-200">{task.agent_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 line-clamp-1">{task.related_entity_name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{task.related_entity_type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {task.output_reference && (
                        <button
                          onClick={() => setInspectTask(task)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[11px] font-medium transition-colors"
                        >
                          View Output
                        </button>
                      )}
                      {task.approval_id && onViewApproval && (
                        <button
                          onClick={() => onViewApproval(task.approval_id!)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold transition-colors"
                        >
                          Review Approval
                        </button>
                      )}
                      {task.status === 'Failed' && (
                        <button
                          onClick={() => onRetryTask(task)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-[11px] font-medium transition-colors"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Output Inspection Modal */}
      {inspectTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full text-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{inspectTask.task_type} Output</h3>
                <p className="text-xs text-slate-400">
                  Agent: <span className="capitalize font-semibold text-indigo-400">{inspectTask.agent_id}</span> • Entity: {inspectTask.related_entity_name}
                </p>
              </div>
              <button
                onClick={() => setInspectTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div>
                <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1">Executive Summary</h4>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-slate-200 leading-relaxed">
                  {inspectTask.output_reference?.summary || 'No summary available.'}
                </div>
              </div>

              {inspectTask.output_reference?.evidence && inspectTask.output_reference.evidence.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1">Verified Evidence</h4>
                  <ul className="space-y-1 bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                    {inspectTask.output_reference.evidence.map((ev, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inspectTask.output_reference?.recommendations && inspectTask.output_reference.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1">Recommendations</h4>
                  <ul className="space-y-1 bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                    {inspectTask.output_reference.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                <span>Confidence Rating: <strong className="text-indigo-300">{inspectTask.output_reference?.confidence || 'High'}</strong></span>
                <span>Task ID: {inspectTask.task_id}</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                onClick={() => setInspectTask(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
