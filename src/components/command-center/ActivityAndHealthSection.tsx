import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Bot,
  User,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  DailyActivitySummaryData,
  PipelineMovementEntry,
  TeamMemberPerformance,
} from '../../services/commandCenterService';
import {
  AgencyHealthScore,
  DataQualityItem,
  DuplicateLeadPair,
} from '../../types';

interface ActivityAndHealthSectionProps {
  activitySummary: DailyActivitySummaryData;
  pipelineMovements: PipelineMovementEntry[];
  healthScore: AgencyHealthScore;
  dataQualityIssues: DataQualityItem[];
  duplicatePairs: DuplicateLeadPair[];
  teamPerformance: TeamMemberPerformance[];
  onOpenLead: (leadId: string) => void;
  onResolveDuplicate: (pairId: string, decision: 'Merged' | 'Kept Separate') => void;
}

export const ActivityAndHealthSection: React.FC<ActivityAndHealthSectionProps> = ({
  activitySummary,
  pipelineMovements,
  healthScore,
  dataQualityIssues,
  duplicatePairs,
  teamPerformance,
  onOpenLead,
  onResolveDuplicate,
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'health' | 'quality' | 'team'>('activity');

  const getHealthBadgeStyle = (status: AgencyHealthScore['status']) => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Healthy':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Needs Attention':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div id="activity-and-health-section" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Operations, Health & Data Integrity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real activity logs, pipeline transitions, health scoring, and CRM duplicate controls
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Daily Activity
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Health Score ({healthScore.overall_score})
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'quality'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Data Quality ({dataQualityIssues.length + duplicatePairs.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Team Output
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Activity Summary & Pipeline Movement */}
      {activeTab === 'activity' && (
        <div className="space-y-5">
          {/* Daily metrics counter grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Leads Added</div>
              <div className="text-base font-bold text-slate-800">{activitySummary.newLeadsAdded}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Manual Calls</div>
              <div className="text-base font-bold text-slate-800">{activitySummary.callsMade}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Sophia AI Calls</div>
              <div className="text-base font-bold text-indigo-700">{activitySummary.aiCallsMade}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Emails Sent</div>
              <div className="text-base font-bold text-slate-800">{activitySummary.emailsSent}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">SMS Sent</div>
              <div className="text-base font-bold text-slate-800">{activitySummary.smsSent}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Replies</div>
              <div className="text-base font-bold text-emerald-700">{activitySummary.repliesReceived}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Proposals</div>
              <div className="text-base font-bold text-indigo-700">{activitySummary.proposalsSent}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] uppercase font-semibold text-emerald-700">Deals Won</div>
              <div className="text-base font-bold text-emerald-800">{activitySummary.dealsWon}</div>
            </div>
          </div>

          {/* Pipeline Movement Tracker */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Recent Pipeline Stage Movements</span>
              <span className="text-[11px] text-slate-400">Last 10 stage transitions</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {pipelineMovements.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No stage transitions recorded yet. Advance a lead in Pipeline view to track movement.
                </div>
              ) : (
                pipelineMovements.map((move) => (
                  <div
                    key={move.id}
                    onClick={() => onOpenLead(move.leadId)}
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600">
                          {move.businessName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                            {move.previousStage}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                            {move.newStage}
                          </span>
                          <span className="text-slate-400 ml-1">• by {move.source}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 text-[11px]">{move.date}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Operational Agency Health Score */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Health Gauge Box (4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Operational Agency Health
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center my-2">
              <div className="text-4xl font-extrabold text-slate-900">
                {healthScore.overall_score}
                <span className="text-base font-normal text-slate-400">/100</span>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthBadgeStyle(
                healthScore.status
              )}`}
            >
              Status: {healthScore.status}
            </div>

            <p className="text-xs text-slate-500 mt-3 max-w-xs">
              Algorithmic health score evaluated against follow-up completion, contact velocity, and CRM data hygiene.
            </p>
          </div>

          {/* Health Breakdown Factors (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Component Health Factors
            </div>

            <div className="space-y-2.5">
              {healthScore.factors.map((factor) => (
                <div key={factor.name} className="p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          factor.status === 'Positive'
                            ? 'bg-emerald-500'
                            : factor.status === 'Neutral'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      ></span>
                      {factor.name}
                    </div>
                    <div className="font-bold text-slate-800">
                      {factor.score}/100 <span className="text-[10px] text-slate-400">(wt {factor.weight}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.score >= 75 ? 'bg-emerald-500' : factor.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1">{factor.detail}</div>
                </div>
              ))}
            </div>

            {/* Strengths & Risks Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs">
                <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Operational Strengths
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-950">
                  {healthScore.positive_summary.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs">
                <div className="font-bold text-amber-800 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Areas to Optimize
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-950">
                  {healthScore.risks_summary.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data Quality & Duplicate Detection */}
      {activeTab === 'quality' && (
        <div className="space-y-5">
          {/* Duplicate Leads Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Potential Duplicate Contractor Records ({duplicatePairs.length})</span>
              <span className="text-[11px] text-slate-400">Matched by phone, email, or company name</span>
            </div>

            {duplicatePairs.length === 0 ? (
              <div className="p-6 rounded-lg border border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                No duplicate contractor records detected in CRM dataset.
              </div>
            ) : (
              <div className="space-y-3">
                {duplicatePairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {pair.primary_lead.business_name}
                        </span>
                        <span className="text-xs text-slate-400">vs</span>
                        <span className="text-xs font-bold text-slate-900">
                          {pair.duplicate_lead.business_name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                          {pair.match_score}% Match ({pair.matched_by})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                        <div>
                          <strong>Record A:</strong> {pair.primary_lead.phone || 'No phone'} • {pair.primary_lead.city} • Stage: {pair.primary_lead.pipeline_stage}
                        </div>
                        <div>
                          <strong>Record B:</strong> {pair.duplicate_lead.phone || 'No phone'} • {pair.duplicate_lead.city} • Stage: {pair.duplicate_lead.pipeline_stage}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onResolveDuplicate(pair.id, 'Merged')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                      >
                        Merge Records
                      </button>
                      <button
                        onClick={() => onResolveDuplicate(pair.id, 'Kept Separate')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Keep Separate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Attributes / Data Quality Items */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Missing Critical Contact Fields ({dataQualityIssues.length})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {dataQualityIssues.slice(0, 9).map((issue) => (
                <div
                  key={issue.issue_id}
                  onClick={() => onOpenLead(issue.lead_id)}
                  className="p-3 rounded-lg border border-slate-100 bg-white hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                      {issue.business_name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        issue.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {issue.issue_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{issue.suggested_fix}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team Performance (Sophia AI vs Agency Admin) */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Tracks output across human strategy leads and Sophia AI autonomous calling/follow-up execution.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamPerformance.map((member) => (
              <div
                key={member.user_id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        member.is_ai
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {member.is_ai ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        {member.name}
                        {member.is_ai && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold">
                            AI Agent
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">
                      ${member.won_revenue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Retainer Closed</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center text-xs">
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-400">Calls</div>
                    <div className="font-bold text-slate-800">{member.calls_made}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-400">Emails</div>
                    <div className="font-bold text-slate-800">{member.emails_sent}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-400">Follow-Ups</div>
                    <div className="font-bold text-slate-800">{member.follow_ups_completed}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-400">Meetings</div>
                    <div className="font-bold text-purple-700">{member.meetings_requested}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>MCA Autonomous Operations & Data Governance Engine</span>
        <span className="text-slate-700 font-medium">Auto-Synchronized</span>
      </div>
    </div>
  );
};
