import React, { useState } from 'react';
import {
  AIActivity,
} from '../../types/aiWorkforce';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Activity,
  Bot,
} from 'lucide-react';

interface ActivityLogViewProps {
  activities: AIActivity[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ activities }) => {
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredActivities = activities.filter((act) => {
    if (selectedAgent !== 'all' && act.agent_id !== selectedAgent) return false;
    if (selectedStatus !== 'all' && act.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSumm = act.summary.toLowerCase().includes(q);
      const matchEnt = act.related_entity_name?.toLowerCase().includes(q);
      if (!matchSumm && !matchEnt) return false;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities or entity names..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Agents</option>
            <option value="sophia">Sophia</option>
            <option value="atlas">Atlas</option>
            <option value="nova">Nova</option>
            <option value="orbit">Orbit</option>
            <option value="aria">Aria</option>
            <option value="pulse">Pulse</option>
            <option value="nexus">Nexus</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning / Approval</option>
            <option value="info">Info</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between text-xs text-slate-400">
          <span>Displaying {filteredActivities.length} operational log entries</span>
          <span className="text-[11px] font-mono">Real-time sync active</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[65vh] overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No activity logs found for selected filters.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.activity_id}
                className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-start space-x-3 text-xs"
              >
                <div className="mt-0.5">{getStatusIcon(act.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="capitalize font-bold text-white text-xs">{act.agent_id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {act.activity_type}
                    </span>
                    {act.related_entity_name && (
                      <span className="text-slate-400 text-[11px]">
                        for <strong className="text-slate-200">{act.related_entity_name}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{act.summary}</p>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
