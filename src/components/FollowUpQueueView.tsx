import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Phone,
  Bot,
  Filter,
  Plus,
  Search,
  MoreVertical,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Trash2,
  Edit2,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  FollowUpTask,
  FollowUpStatus,
  FollowUpPriority,
  FollowUpChannel,
  FollowUpType,
  Lead,
} from '../types';
import {
  getFollowUpTasks,
  updateFollowUpTask,
  saveFollowUpTask,
  deleteFollowUpTask,
} from '../services/callIntelligenceService';
import { formatPhoneNumber } from '../services/telephonyService';

interface FollowUpQueueViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenEmail: (lead: Lead, task?: FollowUpTask) => void;
  onOpenSMS: (lead: Lead, task?: FollowUpTask) => void;
  onOpenDialer: (lead: Lead, phone?: string) => void;
  onOpenAICall: (lead: Lead) => void;
}

export const FollowUpQueueView: React.FC<FollowUpQueueViewProps> = ({
  leads,
  onSelectLead,
  onOpenEmail,
  onOpenSMS,
  onOpenDialer,
  onOpenAICall,
}) => {
  const [tasks, setTasks] = useState<FollowUpTask[]>(() => getFollowUpTasks());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Scheduled' | 'Completed' | 'Overdue'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | FollowUpPriority>('All');
  const [channelFilter, setChannelFilter] = useState<'All' | FollowUpChannel>('All');

  // New Task Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskLeadId, setNewTaskLeadId] = useState(leads[0]?.lead_id || '');
  const [newTaskType, setNewTaskType] = useState<FollowUpType>('Send Audit');
  const [newTaskChannel, setNewTaskChannel] = useState<FollowUpChannel>('Email');
  const [newTaskPriority, setNewTaskPriority] = useState<FollowUpPriority>('High');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskReason, setNewTaskReason] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Reschedule Modal state
  const [reschedulingTask, setReschedulingTask] = useState<FollowUpTask | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');

  const reloadTasks = () => {
    setTasks(getFollowUpTasks());
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        t.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.contact_name && t.contact_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.reason.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const isOverdue = t.status !== 'Completed' && t.recommended_date < todayStr;
      if (statusFilter === 'Overdue' && !isOverdue) return false;
      if (statusFilter !== 'All' && statusFilter !== 'Overdue' && t.status !== statusFilter) return false;

      // Priority
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

      // Channel
      if (channelFilter !== 'All' && t.channel !== channelFilter) return false;

      return matchSearch;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, channelFilter, todayStr]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const scheduled = tasks.filter((t) => t.status === 'Scheduled').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const overdue = tasks.filter((t) => t.status !== 'Completed' && t.recommended_date < todayStr).length;
    const dueToday = tasks.filter(
      (t) => t.status !== 'Completed' && t.recommended_date === todayStr
    ).length;

    return { total, pending, scheduled, completed, overdue, dueToday };
  }, [tasks, todayStr]);

  const handleToggleComplete = (task: FollowUpTask) => {
    const nextStatus: FollowUpStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateFollowUpTask(task.follow_up_id, { status: nextStatus });
    reloadTasks();
  };

  const handleExecuteChannel = (task: FollowUpTask) => {
    const matchedLead = leads.find((l) => l.lead_id === task.lead_id);
    if (!matchedLead) return;

    if (task.channel === 'Email') {
      onOpenEmail(matchedLead, task);
    } else if (task.channel === 'SMS') {
      onOpenSMS(matchedLead, task);
    } else if (task.channel === 'AI Call') {
      onOpenAICall(matchedLead);
    } else {
      onOpenDialer(matchedLead, task.lead_phone);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLead = leads.find((l) => l.lead_id === newTaskLeadId);
    if (!selectedLead) return;

    const newTask: FollowUpTask = {
      follow_up_id: `fu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lead_id: selectedLead.lead_id,
      lead_name: selectedLead.business_name,
      contact_name: selectedLead.contact_name,
      lead_phone: selectedLead.phone,
      lead_email: selectedLead.email,
      type: newTaskType,
      channel: newTaskChannel,
      priority: newTaskPriority,
      recommended_date: newTaskDate,
      reason: newTaskReason || 'Scheduled manual follow-up task',
      context_notes: newTaskNotes,
      status: 'Pending',
      owner: 'Alex (Agency Rep)',
      ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveFollowUpTask(newTask);
    reloadTasks();
    setIsCreateModalOpen(false);
    setNewTaskReason('');
    setNewTaskNotes('');
  };

  const handleSaveReschedule = () => {
    if (reschedulingTask && newRescheduleDate) {
      updateFollowUpTask(reschedulingTask.follow_up_id, {
        recommended_date: newRescheduleDate,
        status: 'Scheduled',
      });
      reloadTasks();
      setReschedulingTask(null);
    }
  };

  return (
    <div id="follow-up-queue-view" className="flex-1 flex flex-col h-full bg-[#060a12] text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Follow-Up Automation Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {stats.pending + stats.scheduled} Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Every call commitment tracked, scheduled, and ready for one-click contextual execution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={reloadTasks}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Follow-Up</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-6 pb-2 flex-shrink-0">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'All'
              ? 'bg-slate-800/80 border-indigo-500/50 shadow-md'
              : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
          }`}
        >
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Tasks</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">{stats.total}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Pending'
              ? 'bg-slate-800/80 border-indigo-500/50 shadow-md'
              : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
          }`}
        >
          <div className="text-[10px] text-amber-400 font-semibold uppercase">Due Today</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">{stats.dueToday}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Overdue')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Overdue'
              ? 'bg-slate-800/80 border-rose-500/50 shadow-md'
              : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
          }`}
        >
          <div className="text-[10px] text-rose-400 font-semibold uppercase">Overdue</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{stats.overdue}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Scheduled')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Scheduled'
              ? 'bg-slate-800/80 border-indigo-500/50 shadow-md'
              : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
          }`}
        >
          <div className="text-[10px] text-blue-400 font-semibold uppercase">Scheduled</div>
          <div className="text-xl font-bold font-mono text-blue-300 mt-0.5">{stats.scheduled}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Completed')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Completed'
              ? 'bg-slate-800/80 border-emerald-500/50 shadow-md'
              : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
          }`}
        >
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">Completed</div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">{stats.completed}</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by prospect, contact, or follow-up reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Channels</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
            <option value="Call">Phone Call</option>
            <option value="AI Call">Sophia AI Call</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{filteredTasks.length}</strong> tasks
        </div>
      </div>

      {/* Task Queue List */}
      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isOverdue = task.status !== 'Completed' && task.recommended_date < todayStr;
            const isToday = task.recommended_date === todayStr;
            const matchedLead = leads.find((l) => l.lead_id === task.lead_id);

            return (
              <div
                key={task.follow_up_id}
                className={`p-4 rounded-xl border transition-all ${
                  task.status === 'Completed'
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : isOverdue
                    ? 'bg-rose-950/10 border-rose-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                  {/* Left: Status Checkbox & Main Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 hover:border-indigo-400 bg-slate-950'
                      }`}
                      title={task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}
                    >
                      {task.status === 'Completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {task.lead_name}
                        </span>

                        {task.contact_name && (
                          <span className="text-xs text-slate-400">
                            ({task.contact_name})
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            task.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : task.priority === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {task.type}
                        </span>

                        {task.ai_generated && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            <span>Sophia AI</span>
                          </span>
                        )}

                        <span
                          className={`text-xs font-mono font-semibold ${
                            isOverdue
                              ? 'text-rose-400 font-bold'
                              : isToday
                              ? 'text-amber-300 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          Due: {task.recommended_date} {isOverdue && '(Overdue)'} {isToday && '(Today)'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {task.reason}
                      </p>

                      {task.ai_recommendation && (
                        <div className="p-2 rounded-lg bg-purple-950/20 text-xs text-purple-300 border border-purple-500/20 flex items-start gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>{task.ai_recommendation}</span>
                        </div>
                      )}

                      {task.context_notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          Notes: {task.context_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Channel Action Buttons & Reschedule */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Primary Channel Action Button */}
                    <button
                      onClick={() => handleExecuteChannel(task)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        task.channel === 'Email'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                          : task.channel === 'SMS'
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                          : task.channel === 'AI Call'
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {task.channel === 'Email' && <Mail className="w-3.5 h-3.5" />}
                      {task.channel === 'SMS' && <MessageSquare className="w-3.5 h-3.5" />}
                      {task.channel === 'AI Call' && <Bot className="w-3.5 h-3.5" />}
                      {task.channel === 'Call' && <Phone className="w-3.5 h-3.5" />}
                      <span>Execute {task.channel}</span>
                    </button>

                    {/* Reschedule Button */}
                    <button
                      onClick={() => {
                        setReschedulingTask(task);
                        setNewRescheduleDate(task.recommended_date);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Reschedule"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    {/* Open Lead */}
                    {matchedLead && (
                      <button
                        onClick={() => onSelectLead(matchedLead)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="View Lead Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Task */}
                    <button
                      onClick={() => {
                        deleteFollowUpTask(task.follow_up_id);
                        reloadTasks();
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-3">
            <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Follow-Up Tasks Match Your Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All commitments from calls are completed or no tasks match current search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#090d16] border border-slate-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Reschedule Follow-Up</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select new due date for <strong className="text-white">{reschedulingTask.lead_name}</strong>:
            </p>

            <input
              type="date"
              value={newRescheduleDate}
              onChange={(e) => setNewRescheduleDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReschedulingTask(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                Save New Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Follow-Up Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-[#090d16] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create New Follow-Up Task</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold">
                  Select Lead / Contractor
                </label>
                <select
                  value={newTaskLeadId}
                  onChange={(e) => setNewTaskLeadId(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {leads.map((l) => (
                    <option key={l.lead_id} value={l.lead_id}>
                      {l.business_name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">
                    Follow-Up Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Send Audit">Send Audit</option>
                    <option value="Send Proposal">Send Proposal</option>
                    <option value="Call Follow-Up">Call Follow-Up</option>
                    <option value="Email Follow-Up">Email Follow-Up</option>
                    <option value="SMS Follow-Up">SMS Follow-Up</option>
                    <option value="AI Call Follow-Up">AI Call Follow-Up</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">
                    Channel
                  </label>
                  <select
                    value={newTaskChannel}
                    onChange={(e) => setNewTaskChannel(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="Call">Phone Call</option>
                    <option value="AI Call">Sophia AI Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold">
                  Reason / Commitment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Send local map audit requested during call"
                  value={newTaskReason}
                  onChange={(e) => setNewTaskReason(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold">
                  Context Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Marcus is on job site, wants short video email"
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
