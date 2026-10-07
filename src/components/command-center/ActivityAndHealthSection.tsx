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
import { ActivityCommandTimeline } from './ActivityCommandTimeline';
import {
  AgencyHealthScore,
  DataQualityItem,
  DuplicateLeadPair,
  ActivityEvent,
} from '../../types';

interface ActivityAndHealthSectionProps {
  activitySummary: DailyActivitySummaryData;
  pipelineMovements: PipelineMovementEntry[];
  activities: ActivityEvent[];
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
  activities,
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
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50';
      case 'Healthy':
        return 'bg-blue-950/50 text-blue-300 border-blue-800/50';
      case 'Needs Attention':
        return 'bg-amber-950/50 text-amber-300 border-amber-800/50';
      default:
        return 'bg-rose-950/50 text-rose-300 border-rose-800/50';
    }
  };

  return (
    <section
      id="activity-and-health-section"
      className="glass-panel p-4 rounded-xl space-y-4"
      data-purpose="operations-integrity"
    >
      {/* Top Header & Navigation (Stitch: OperationsAndIntegrity) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-mca-border">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-wave-square text-mca-neonGreen"></i>
          <div>
            <h3 className="text-sm font-bold text-white">Operations, Health &amp; Data Integrity</h3>
            <p className="text-[10px] font-mono text-slate-400">
              Real activity logs, pipeline transitions, health scoring, and CRM duplicate controls
            </p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono flex-wrap">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              activeTab === 'activity'
                ? 'bg-slate-700 text-white ring-1 ring-mca-neonGreen/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <i className="fa-solid fa-bolt text-amber-400"></i> Daily Activity
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              activeTab === 'health'
                ? 'bg-slate-700 text-white ring-1 ring-mca-neonGreen/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <i className="fa-solid fa-heart-pulse text-rose-400"></i> Health Score ({healthScore.overall_score})
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              activeTab === 'quality'
                ? 'bg-slate-700 text-white ring-1 ring-mca-neonGreen/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <i className="fa-solid fa-database text-cyan-400"></i> Data Quality ({dataQualityIssues.length + duplicatePairs.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
              activeTab === 'team'
                ? 'bg-slate-700 text-white ring-1 ring-mca-neonGreen/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <i className="fa-solid fa-users-gear text-purple-400"></i> Team Output
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Activity Summary & Pipeline Movement */}
      {activeTab === 'activity' && (
        <div className="space-y-5">
          {/* Quick tally tiles */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">LEADS ADDED</div>
              <div className="text-sm font-bold text-white mt-0.5">{activitySummary.newLeadsAdded}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">MANUAL CALLS</div>
              <div className="text-sm font-bold text-white mt-0.5">{activitySummary.callsMade}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">SOPHIA AI CALLS</div>
              <div className="text-sm font-bold text-purple-400 mt-0.5">{activitySummary.aiCallsMade}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">EMAILS SENT</div>
              <div className="text-sm font-bold text-white mt-0.5">{activitySummary.emailsSent}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">SMS SENT</div>
              <div className="text-sm font-bold text-white mt-0.5">{activitySummary.smsSent}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">REPLIES</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{activitySummary.repliesReceived}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">PROPOSALS</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{activitySummary.proposalsSent}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[9px] text-slate-500">DEALS WON</div>
              <div className="text-sm font-bold text-mca-neonGreen mt-0.5">{activitySummary.dealsWon}</div>
            </div>
          </div>

          {/* Pipeline Movement Tracker & Activity Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Recent Pipeline Stage Movements</span>
                <span className="text-[11px] text-slate-500">Last 10 stage transitions</span>
              </div>

              <div className="divide-y divide-white/5 border border-white/5 rounded-lg overflow-hidden">
                {pipelineMovements.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No stage transitions recorded yet. Advance a lead in Pipeline view to track movement.
                  </div>
                ) : (
                  pipelineMovements.map((move) => (
                    <div
                      key={move.id}
                      onClick={() => onOpenLead(move.leadId)}
                      className="p-3 flex items-center justify-between text-xs hover:bg-mca-void/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-indigo-400">
                            {move.businessName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-mca-hover font-medium">
                              {move.previousStage}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-300 font-medium">
                              {move.newStage}
                            </span>
                            <span className="text-slate-500 ml-1">• by {move.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-500 text-[11px]">{move.date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* NEW ACTIVITY LOG */}
            <div>
              <ActivityCommandTimeline activities={activities} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Operational Agency Health Score */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Health Gauge Box (4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-mca-void/40 border border-white/10 text-center flex flex-col items-center justify-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Operational Agency Health
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center my-2">
              <div className="text-4xl font-extrabold text-white">
                {healthScore.overall_score}
                <span className="text-base font-normal text-slate-500">/100</span>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthBadgeStyle(
                healthScore.status
              )}`}
            >
              Status: {healthScore.status}
            </div>

            <p className="text-xs text-slate-400 mt-3 max-w-xs">
              Algorithmic health score evaluated against follow-up completion, contact velocity, and CRM data hygiene.
            </p>
          </div>

          {/* Health Breakdown Factors (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Component Health Factors
            </div>

            <div className="space-y-2.5">
              {healthScore.factors.map((factor) => (
                <div key={factor.name} className="p-3 rounded-lg border border-white/5 bg-mca-card">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
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
                    <div className="font-bold text-slate-100">
                      {factor.score}/100 <span className="text-[10px] text-slate-500">(wt {factor.weight}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-mca-hover h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.score >= 75 ? 'bg-emerald-500' : factor.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">{factor.detail}</div>
                </div>
              ))}
            </div>

            {/* Strengths & Risks Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-xs">
                <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Operational Strengths
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-950">
                  {healthScore.positive_summary.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/70 border border-amber-800/50 text-xs">
                <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
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
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Potential Duplicate Contractor Records ({duplicatePairs.length})</span>
              <span className="text-[11px] text-slate-500">Matched by phone, email, or company name</span>
            </div>

            {duplicatePairs.length === 0 ? (
              <div className="p-6 rounded-lg border border-white/5 bg-mca-void/40 text-center text-xs text-slate-400">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                No duplicate contractor records detected in CRM dataset.
              </div>
            ) : (
              <div className="space-y-3">
                {duplicatePairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="p-4 rounded-xl border border-white/10 bg-mca-void/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {pair.primary_lead.business_name}
                        </span>
                        <span className="text-xs text-slate-500">vs</span>
                        <span className="text-xs font-bold text-white">
                          {pair.duplicate_lead.business_name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300">
                          {pair.match_score}% Match ({pair.matched_by})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300 bg-mca-card p-2.5 rounded border border-white/5">
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
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                      >
                        Merge Records
                      </button>
                      <button
                        onClick={() => onResolveDuplicate(pair.id, 'Kept Separate')}
                        className="px-3 py-1.5 rounded-lg bg-mca-card border border-white/15 hover:bg-mca-void/40 text-slate-200 text-xs font-medium transition-colors"
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
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Missing Critical Contact Fields ({dataQualityIssues.length})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {dataQualityIssues.slice(0, 9).map((issue) => (
                <div
                  key={issue.issue_id}
                  onClick={() => onOpenLead(issue.lead_id)}
                  className="p-3 rounded-lg border border-white/5 bg-mca-card hover:border-indigo-800/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white group-hover:text-indigo-400 truncate">
                      {issue.business_name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        issue.severity === 'High'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-mca-hover text-slate-200'
                      }`}
                    >
                      {issue.issue_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{issue.suggested_fix}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team Performance (Sophia AI vs Agency Admin) */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 mb-2">
            Tracks output across human strategy leads and Sophia AI autonomous calling/follow-up execution.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamPerformance.map((member) => (
              <div
                key={member.user_id}
                className="p-4 rounded-xl border border-white/10 bg-mca-void/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        member.is_ai
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {member.is_ai ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {member.name}
                        {member.is_ai && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-semibold">
                            AI Agent
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{member.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-300">
                      ${member.won_revenue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Retainer Closed</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center text-xs">
                  <div className="bg-mca-card p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500">Calls</div>
                    <div className="font-bold text-slate-100">{member.calls_made}</div>
                  </div>
                  <div className="bg-mca-card p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500">Emails</div>
                    <div className="font-bold text-slate-100">{member.emails_sent}</div>
                  </div>
                  <div className="bg-mca-card p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500">Follow-Ups</div>
                    <div className="font-bold text-slate-100">{member.follow_ups_completed}</div>
                  </div>
                  <div className="bg-mca-card p-2 rounded border border-white/5">
                    <div className="text-[10px] text-slate-500">Meetings</div>
                    <div className="font-bold text-purple-300">{member.meetings_requested}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>MCA Autonomous Operations & Data Governance Engine</span>
        <span className="text-slate-200 font-medium">Auto-Synchronized</span>
      </div>
    </section>
  );
};
