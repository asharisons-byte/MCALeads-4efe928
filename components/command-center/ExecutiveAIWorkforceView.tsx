import React from 'react';
import {
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { getAIWorkforceState, getAITasks, getAIApprovals } from '../../services/aiWorkforceService';

export const ExecutiveAIWorkforceView: React.FC = () => {
  const workforce = getAIWorkforceState();
  const tasks = getAITasks();
  const approvals = getAIApprovals();

  const totalTasksToday = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* 1. AUTOMATION HEALTH MONITOR BANNER */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All 7 AI Autonomous Agents Operational</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Marketing Charm Agency Autonomous Workforce
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Coordinated multi-agent workflow covering discovery, enrichment, outreach, audit generation, and client retention
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              Health: 99.4% Uptime
            </span>
          </div>
        </div>

        {/* High-level metrics strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Tasks Executed Today</span>
            <div className="text-2xl font-black text-white mt-1">{totalTasksToday}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">{completedTasks} Completed</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingApprovalsCount}</div>
            <span className="text-[10px] text-slate-400">Human-in-the-Loop Safe</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Average Task Latency</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">1.8s</div>
            <span className="text-[10px] text-indigo-300">Gemini Flash Fast Tier</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Autonomous Error Rate</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">0.6%</div>
            <span className="text-[10px] text-emerald-300">Self-Healing Enabled</span>
          </div>
        </div>
      </div>

      {/* 2. ALL 7 AI AGENTS SPECIALIST CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workforce.agents.map((agent) => {
          const agentKey = agent.agent_id || agent.id || '';
          const requiresApproval = agent.requiresApproval ?? (agent.permissions?.requires_approval?.length > 0);
          return (
            <div
              key={agentKey}
              className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{agent.name}</h4>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      {agent.role}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    agent.status === 'Active' || agent.status === 'active' || agent.status === 'idle'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {agent.description || agent.title || agent.role}
              </p>

              {/* Current Objective */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  Current Operational Objective
                </div>
                <div className="text-slate-800 font-medium">
                  {agentKey === 'sophia'
                    ? 'Analyzing hot leads & conducting owner briefings'
                    : agentKey === 'atlas'
                    ? 'Monitoring Oregon CCB registry updates'
                    : agentKey === 'nova'
                    ? 'Extracting contact emails and phone numbers'
                    : agentKey === 'orbit'
                    ? 'Dispatching multi-touch cold outreach emails'
                    : agentKey === 'aria'
                    ? 'Generating performance & GBP gap audits'
                    : agentKey === 'pulse'
                    ? 'Tracking client retainer KPIs & health scores'
                    : 'Orchestrating cross-agent dependencies'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Approval Req: {requiresApproval ? 'Yes (Strict)' : 'Autonomous'}</span>
                <span className="font-bold text-slate-700">Level: Senior AI</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
