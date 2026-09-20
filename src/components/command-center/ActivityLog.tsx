import React, { useState, useMemo } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  FileText,
  Filter,
  Clock,
  Bot,
  GitCommit,
  Sparkles,
} from 'lucide-react';
import { ActivityEvent } from '../../types';

interface ActivityLogProps {
  activities: ActivityEvent[];
}

type LogFilter = 'all' | 'calls' | 'emails' | 'sms' | 'notes';

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  const [filter, setFilter] = useState<LogFilter>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const type = act.activity_type || act.type;
      if (filter === 'all') return true;
      if (filter === 'emails') return type.includes('email');
      if (filter === 'calls') return type.includes('call');
      if (filter === 'sms') return type.includes('sms');
      if (filter === 'notes') return type === 'note_added';
      return true;
    });
  }, [activities, filter]);

  const getActivityIcon = (act: ActivityEvent) => {
    const type = act.activity_type || act.type;
    if (type.includes('call')) return <Phone className="w-4 h-4 text-emerald-500" />;
    if (type.includes('email')) return <Mail className="w-4 h-4 text-blue-500" />;
    if (type.includes('sms')) return <MessageSquare className="w-4 h-4 text-sky-500" />;
    if (type === 'note_added') return <FileText className="w-4 h-4 text-indigo-500" />;
    return <GitCommit className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as LogFilter)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Activities</option>
          <option value="calls">Calls</option>
          <option value="emails">Emails</option>
          <option value="sms">SMS</option>
          <option value="notes">Notes</option>
        </select>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredActivities.length > 0 ? (
          filteredActivities.slice(0, 20).map((act) => (
            <div key={act.id} className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
              <div className="mt-0.5">{getActivityIcon(act)}</div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-900">{act.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{act.description}</div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-slate-400">No activities found for this filter.</div>
        )}
      </div>
    </div>
  );
};
