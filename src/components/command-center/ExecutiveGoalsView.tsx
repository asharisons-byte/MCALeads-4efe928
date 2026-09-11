import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit2,
  Save,
  X,
  Sparkles,
  Award,
} from 'lucide-react';
import { AgencyGoal } from '../../types';
import {
  getAgencyGoals,
  saveAgencyGoal,
  calculateFollowUpCompliance,
} from '../../services/executiveIntelligenceService';
import { FollowUpTask } from '../../types';

interface ExecutiveGoalsViewProps {
  followUps: FollowUpTask[];
}

export const ExecutiveGoalsView: React.FC<ExecutiveGoalsViewProps> = ({ followUps }) => {
  const [goals, setGoals] = useState<AgencyGoal[]>(getAgencyGoals());
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState<number>(0);

  const compliance = calculateFollowUpCompliance(followUps);

  const handleStartEdit = (goal: AgencyGoal) => {
    setEditingGoalId(goal.goal_id);
    setEditTargetValue(goal.target_value);
  };

  const handleSaveEdit = (goal: AgencyGoal) => {
    const updated = saveAgencyGoal({
      ...goal,
      target_value: editTargetValue,
      progress_pct: editTargetValue > 0 ? Math.round((goal.current_value / editTargetValue) * 100) : 0,
    });
    setGoals([...updated]);
    setEditingGoalId(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. AGENCY GOALS & TARGET PACING */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">Agency Milestones & Goal Pacing</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking against Q3/Q4 executive benchmarks with Sophia pacing forecasts
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Autonomous Pacing Engine
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const isEditing = editingGoalId === goal.goal_id;
            return (
              <div
                key={goal.goal_id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {goal.timeframe} Goal
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{goal.title}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      goal.pacing_status === 'Ahead'
                        ? 'bg-emerald-100 text-emerald-800'
                        : goal.pacing_status === 'On Track'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {goal.pacing_status}
                  </span>
                </div>

                {/* Values & Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-medium">Current:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">
                        {goal.metric_unit === '$'
                          ? `$${goal.current_value.toLocaleString()}`
                          : `${goal.current_value} ${goal.metric_unit}`}
                      </span>
                      <span className="text-slate-400">/</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editTargetValue}
                            onChange={(e) => setEditTargetValue(Number(e.target.value))}
                            className="w-20 px-2 py-0.5 rounded border border-indigo-400 text-xs text-right font-bold"
                          />
                          <button
                            onClick={() => handleSaveEdit(goal)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingGoalId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(goal)}
                          className="text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-1 group"
                        >
                          <span>
                            {goal.metric_unit === '$'
                              ? `$${goal.target_value.toLocaleString()}`
                              : `${goal.target_value} ${goal.metric_unit}`}
                          </span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.progress_pct >= 90
                          ? 'bg-emerald-500'
                          : goal.progress_pct >= 60
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress_pct)}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-semibold">
                    {goal.progress_pct}% Accomplished
                  </div>
                </div>

                {/* Sophia Recommendation */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-indigo-700 text-[10px]">
                    <Sparkles className="w-3 h-3" /> Sophia Guidance:
                  </div>
                  <p className="leading-relaxed">{goal.sophia_recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FOLLOW-UP COMPLIANCE & TEAM DISCIPLINE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Follow-Up Compliance & Sales Pacing</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensuring no Oregon contractor lead falls through the cracks
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {compliance.compliance_rate}% Compliance Rate
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Total Tasks</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{compliance.total_tasks}</div>
            <span className="text-[10px] text-slate-400">Scheduled in CRM</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Completed On Time</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{compliance.completed_on_time}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">{compliance.compliance_rate}% Compliance</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Overdue Follow-Ups</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{compliance.overdue_count}</div>
            <span className="text-[10px] text-rose-600 font-semibold">Immediate Priority</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Response Time</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{compliance.average_response_time}</div>
            <span className="text-[10px] text-indigo-600 font-semibold">Under 4h target</span>
          </div>
        </div>
      </div>
    </div>
  );
};
