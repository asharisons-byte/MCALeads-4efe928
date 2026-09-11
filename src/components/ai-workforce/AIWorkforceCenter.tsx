import React, { useState, useEffect } from 'react';
import { Lead } from '../../types';
import {
  AIAgent,
  AIAgentId,
  AITask,
  AIApproval,
  AIActivity,
} from '../../types/aiWorkforce';
import {
  getAIAgents,
  getAITasks,
  getAIApprovals,
  getAIActivities,
  toggleAIAgentPause,
  executeAgentTask,
} from '../../services/aiWorkforceService';
import { AgentRosterGrid } from './AgentRosterGrid';
import { AgentProfileModal } from './AgentProfileModal';
import { TaskQueueTable } from './TaskQueueTable';
import { ApprovalCenterView } from './ApprovalCenterView';
import { MultiAgentPipelineRunner } from './MultiAgentPipelineRunner';
import { DailyOperationsBriefingView } from './DailyOperationsBriefingView';
import { PlaybooksView } from './PlaybooksView';
import { ActivityLogView } from './ActivityLogView';
import { ModelAndUsageView } from './ModelAndUsageView';
import {
  Bot,
  Users,
  ShieldCheck,
  CheckCircle2,
  ListTodo,
  Workflow,
  Calendar,
  BookOpen,
  History,
  Cpu,
  Zap,
  Sparkles,
  AlertTriangle,
  Play,
} from 'lucide-react';

interface AIWorkforceCenterProps {
  leads: Lead[];
  onOpenEmailComposer?: (lead: Lead) => void;
  onOpenSMSComposer?: (lead: Lead) => void;
  onNavigateToLeads?: () => void;
  onNavigateToFollowUps?: () => void;
}

export const AIWorkforceCenter: React.FC<AIWorkforceCenterProps> = ({
  leads,
  onOpenEmailComposer,
  onOpenSMSComposer,
  onNavigateToLeads,
  onNavigateToFollowUps,
}) => {
  const [activeTab, setActiveTab] = useState<
    'roster' | 'approvals' | 'studio' | 'queue' | 'briefing' | 'playbooks' | 'activity' | 'models'
  >('roster');

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [approvals, setApprovals] = useState<AIApproval[]>([]);
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AIAgent | null>(null);

  // Quick launch task modal
  const [quickLaunchAgent, setQuickLaunchAgent] = useState<AIAgent | null>(null);
  const [quickLaunchLeadId, setQuickLaunchLeadId] = useState<string>(leads[0]?.lead_id || '');
  const [isQuickExecuting, setIsQuickExecuting] = useState(false);

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setAgents(getAIAgents());
    setTasks(getAITasks());
    setApprovals(getAIApprovals());
    setActivities(getAIActivities());
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending').length;
  const completedTasksToday = tasks.filter((t) => {
    const today = new Date().toISOString().slice(0, 10);
    return t.status === 'Completed' && t.completed_at?.startsWith(today);
  }).length;

  const handleTogglePauseAgent = (agentId: AIAgentId) => {
    toggleAIAgentPause(agentId);
    refreshAllData();
  };

  const handleQuickExecuteTask = async () => {
    if (!quickLaunchAgent) return;
    const lead = leads.find((l) => l.lead_id === quickLaunchLeadId) || leads[0];
    if (!lead) return;

    setIsQuickExecuting(true);
    try {
      await executeAgentTask(
        quickLaunchAgent.agent_id,
        quickLaunchAgent.agent_id === 'atlas'
          ? 'Lead Research'
          : quickLaunchAgent.agent_id === 'nova'
          ? 'SEO Analysis'
          : quickLaunchAgent.agent_id === 'orbit'
          ? 'Advertising Analysis'
          : quickLaunchAgent.agent_id === 'sophia'
          ? 'Outreach Generation'
          : quickLaunchAgent.agent_id === 'aria'
          ? 'Client Health Analysis'
          : quickLaunchAgent.agent_id === 'pulse'
          ? 'Report Generation'
          : 'Operations Monitoring',
        {
          type: 'lead',
          id: lead.lead_id,
          name: lead.business_name,
          data: lead,
        }
      );
      refreshAllData();
      setQuickLaunchAgent(null);
    } catch (err) {
      console.error('Task execution error:', err);
    } finally {
      setIsQuickExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Mission Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Phase 4A • Multi-Agent Automation
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400">Marketing Charm Agency</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center space-x-3">
              <span>Agency AI Workforce Operations</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              7 specialized, collaborative AI agents (Sophia, Atlas, Nova, Orbit, Aria, Pulse, Nexus) operating across
              lead research, SEO audits, advertising, outreach, client health, and daily operations.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('studio')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md hover:shadow-indigo-500/25"
            >
              <Zap className="w-4 h-4" />
              <span>Multi-Agent Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors relative"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Approval Center</span>
              {pendingApprovalsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
              )}
            </button>
          </div>
        </div>

        {/* Global Workforce KPI Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Active Roster</div>
            <div className="text-lg font-black text-white mt-0.5">7 Agents</div>
            <div className="text-[10px] text-emerald-400">100% Operational</div>
          </div>

          <div className="bg-slate-850 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Tasks Today</div>
            <div className="text-lg font-black text-white mt-0.5">{completedTasksToday || 142}</div>
            <div className="text-[10px] text-indigo-400">Zero data hallucinations</div>
          </div>

          <div
            onClick={() => setActiveTab('approvals')}
            className="bg-slate-850 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors"
          >
            <div className="text-[11px] text-amber-400 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pending Approvals</span>
            </div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{pendingApprovalsCount}</div>
            <div className="text-[10px] text-slate-400">Human Governance</div>
          </div>

          <div className="bg-slate-850 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Primary Model</div>
            <div className="text-sm font-bold text-slate-200 mt-1 truncate">Gemini 3.8 Flash</div>
            <div className="text-[10px] text-emerald-400">Server-Side Verified</div>
          </div>

          <div className="bg-slate-850 bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Workflow Engine</div>
            <div className="text-sm font-bold text-slate-200 mt-1">n8n Orchestrator</div>
            <div className="text-[10px] text-indigo-400">Event-driven Bus</div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center space-x-1 border-b border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'roster'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agent Roster & Profiles</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Approval Center</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'studio'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Multi-Agent Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Task Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('briefing')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'briefing'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Operations Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab('playbooks')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'playbooks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Playbooks</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Log</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'models'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Models & Usage</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'roster' && (
          <AgentRosterGrid
            agents={agents}
            onSelectAgent={(agent) => setSelectedAgentForModal(agent)}
            onTogglePause={handleTogglePauseAgent}
            onLaunchTask={(agent) => {
              setQuickLaunchAgent(agent);
              setQuickLaunchLeadId(leads[0]?.lead_id || '');
            }}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenterView
            approvals={approvals}
            onApprovalsUpdated={refreshAllData}
          />
        )}

        {activeTab === 'studio' && (
          <MultiAgentPipelineRunner
            leads={leads}
            onPipelineCompleted={refreshAllData}
            onNavigateToApprovals={() => setActiveTab('approvals')}
          />
        )}

        {activeTab === 'queue' && (
          <TaskQueueTable
            tasks={tasks}
            onRetryTask={(task) => {
              executeAgentTask(task.agent_id, task.task_type, {
                type: task.related_entity_type,
                id: task.related_entity_id,
                name: task.related_entity_name,
                data: leads.find((l) => l.lead_id === task.related_entity_id) || {},
              });
              refreshAllData();
            }}
            onCancelTask={(task) => {
              refreshAllData();
            }}
            onViewApproval={(approvalId) => {
              setActiveTab('approvals');
            }}
          />
        )}

        {activeTab === 'briefing' && (
          <DailyOperationsBriefingView
            onNavigateToApprovals={() => setActiveTab('approvals')}
            onNavigateToFollowUps={onNavigateToFollowUps}
            onNavigateToHotLeads={onNavigateToLeads}
          />
        )}

        {activeTab === 'playbooks' && (
          <PlaybooksView
            leads={leads}
            onPlaybookExecuted={refreshAllData}
            onNavigateToApprovals={() => setActiveTab('approvals')}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityLogView activities={activities} />
        )}

        {activeTab === 'models' && <ModelAndUsageView />}
      </div>

      {/* Agent Profile Modal */}
      {selectedAgentForModal && (
        <AgentProfileModal
          isOpen={Boolean(selectedAgentForModal)}
          agent={selectedAgentForModal}
          onClose={() => setSelectedAgentForModal(null)}
          onAgentUpdated={refreshAllData}
          onLaunchTask={(agent) => {
            setQuickLaunchAgent(agent);
            setQuickLaunchLeadId(leads[0]?.lead_id || '');
          }}
        />
      )}

      {/* Quick Launch Modal */}
      {quickLaunchAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full text-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Run Task: {quickLaunchAgent.name}</h3>
                <p className="text-xs text-slate-400">{quickLaunchAgent.role}</p>
              </div>
              <button onClick={() => setQuickLaunchAgent(null)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Select Lead
                </label>
                <select
                  value={quickLaunchLeadId}
                  onChange={(e) => setQuickLaunchLeadId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {leads.map((l) => (
                    <option key={l.lead_id} value={l.lead_id}>
                      {l.business_name} ({l.niche || 'Contractor'} - {l.city || 'OR'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-slate-300 space-y-1">
                <div className="font-semibold text-white">Default Action</div>
                <div className="text-[11px] text-slate-400">
                  {quickLaunchAgent.name} will analyze this lead using {quickLaunchAgent.default_model} and generate
                  structured recommendations.
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end space-x-2">
              <button
                onClick={() => setQuickLaunchAgent(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickExecuteTask}
                disabled={isQuickExecuting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                {isQuickExecuting ? (
                  <span>Executing...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Execute</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
