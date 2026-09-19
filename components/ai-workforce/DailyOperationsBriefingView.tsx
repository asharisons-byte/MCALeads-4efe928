import React, { useState, useEffect } from 'react';
import {
  AIOperationsBriefing,
} from '../../types/aiWorkforce';
import {
  getOperationsBriefings,
  generateDailyOperationsBriefing,
} from '../../services/aiWorkforceService';
import {
  Bot,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DailyOperationsBriefingViewProps {
  onNavigateToApprovals?: () => void;
  onNavigateToFollowUps?: () => void;
  onNavigateToHotLeads?: () => void;
}

export const DailyOperationsBriefingView: React.FC<DailyOperationsBriefingViewProps> = ({
  onNavigateToApprovals,
  onNavigateToFollowUps,
  onNavigateToHotLeads,
}) => {
  const [briefings, setBriefings] = useState<AIOperationsBriefing[]>([]);
  const [currentBriefing, setCurrentBriefing] = useState<AIOperationsBriefing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadBriefings();
  }, []);

  const loadBriefings = async () => {
    const list = getOperationsBriefings();
    if (list.length === 0) {
      const initial = await generateDailyOperationsBriefing();
      setBriefings([initial]);
      setCurrentBriefing(initial);
    } else {
      setBriefings(list);
      setCurrentBriefing(list[0]);
    }
  };

  const handleGenerateFresh = async () => {
    setIsGenerating(true);
    try {
      const fresh = await generateDailyOperationsBriefing();
      const list = getOperationsBriefings();
      setBriefings(list);
      setCurrentBriefing(fresh);
    } catch (e) {
      console.error('Failed to generate briefing:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentBriefing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-400" />
        <p className="text-xs">Nexus is compiling the Daily Agency AI Briefing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              AI Operations Command • Nexus
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">{currentBriefing.headline}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compiled from verified pipeline activity across all 7 agency agents. Identifies bottleneck risks, hot leads, and pending human approvals.
          </p>
        </div>

        <button
          onClick={handleGenerateFresh}
          disabled={isGenerating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-md shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate Fresh Briefing'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-xs text-slate-400 mb-1">New Leads</div>
          <div className="text-xl font-bold text-white">{currentBriefing.metrics.new_leads_reviewed}</div>
          <div className="text-[10px] text-slate-500">Ingested</div>
        </div>

        <div
          onClick={onNavigateToHotLeads}
          className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <div className="text-xs text-amber-400 mb-1 flex items-center justify-center space-x-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Hot Leads</span>
          </div>
          <div className="text-xl font-bold text-white">{currentBriefing.metrics.hot_leads_identified}</div>
          <div className="text-[10px] text-amber-400/80">Score 80+</div>
        </div>

        <div
          onClick={onNavigateToFollowUps}
          className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center cursor-pointer hover:border-rose-500/40 transition-colors"
        >
          <div className="text-xs text-rose-400 mb-1">Overdue Calls</div>
          <div className="text-xl font-bold text-rose-400">{currentBriefing.metrics.overdue_followups}</div>
          <div className="text-[10px] text-slate-500">Attention Req.</div>
        </div>

        <div
          onClick={onNavigateToApprovals}
          className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center cursor-pointer hover:border-indigo-500/40 transition-colors"
        >
          <div className="text-xs text-indigo-400 mb-1">Approvals</div>
          <div className="text-xl font-bold text-indigo-300">{currentBriefing.metrics.approvals_pending}</div>
          <div className="text-[10px] text-indigo-400/80">Human Gate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-xs text-emerald-400 mb-1">Tasks Today</div>
          <div className="text-xl font-bold text-emerald-400">{currentBriefing.metrics.tasks_automated_today}</div>
          <div className="text-[10px] text-slate-500">Automated</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-xs text-slate-400 mb-1">At-Risk Clients</div>
          <div className="text-xl font-bold text-white">{currentBriefing.metrics.at_risk_clients}</div>
          <div className="text-[10px] text-slate-500">Retainers</div>
        </div>
      </div>

      {/* Executive Summary & Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Nexus Executive Narrative</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            {currentBriefing.executive_summary}
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Priorities</h4>
            <div className="space-y-1.5">
              {currentBriefing.recommended_priorities.map((item, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Operational Risk Alerts</span>
          </div>

          {currentBriefing.risk_alerts.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6">No operational risks detected.</div>
          ) : (
            <div className="space-y-2.5">
              {currentBriefing.risk_alerts.map((alert, i) => (
                <div
                  key={i}
                  className="bg-slate-800/60 border border-rose-500/20 rounded-lg p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white line-clamp-1">{alert.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{alert.recommended_action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Specialized Agent Contributions Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Multi-Agent Intelligence Contributions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBriefing.agent_contributions.map((contrib) => (
            <div
              key={contrib.agent_id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-xs">{contrib.agent_name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">({contrib.agent_id})</span>
                </div>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    contrib.priority_level === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400'
                      : contrib.priority_level === 'High'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {contrib.priority_level}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                {contrib.key_insight}
              </p>

              <div className="space-y-1 pt-1">
                {contrib.action_items.map((act, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
