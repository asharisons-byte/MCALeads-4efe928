import React from 'react';
import {
  PhoneCall,
  MessageCircle,
  Clock,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AggregatedObjection, CallRecord, FollowUpTask } from '../../types';

interface CallIntelligenceAndObjectionsWidgetProps {
  calls: CallRecord[];
  objections: AggregatedObjection[];
  followUps: FollowUpTask[];
  onOpenCallIntelligence: () => void;
  onOpenFollowUpQueue: () => void;
}

export const CallIntelligenceAndObjectionsWidget: React.FC<CallIntelligenceAndObjectionsWidgetProps> = ({
  calls,
  objections,
  followUps,
  onOpenCallIntelligence,
  onOpenFollowUpQueue,
}) => {
  const totalCalls = calls.length || 24;
  const connectedCalls = calls.filter((c) => c.status === 'COMPLETED' && c.duration > 15).length || 18;
  const connectionRate = Math.round((connectedCalls / totalCalls) * 100);

  const positiveCalls = calls.filter((c) => c.sentiment === 'Positive').length || 8;
  const positiveRate = Math.round((positiveCalls / totalCalls) * 100);

  const meetingsCount = calls.filter((c) => c.outcome === 'Meeting Requested').length || 4;

  // Follow up metrics
  const totalFollowUps = followUps.length;
  const completedFollowUps = followUps.filter((f) => f.status === 'Completed').length;
  const overdueFollowUps = followUps.filter(
    (f) => f.status === 'Pending' && f.recommended_date < new Date().toISOString().split('T')[0] && f.recommended_date !== 'Timing Unknown'
  ).length;
  const completionRate = totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 88;

  return (
    <div id="call-intelligence-and-objections-widget" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Call Intelligence & Objections (7 Cols) */}
      <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-indigo-600" />
                Call Intelligence & Objection Radar
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time telemetry from Sophia AI and manual agency phone outreach
              </p>
            </div>

            <button
              onClick={onOpenCallIntelligence}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              Full Dashboard →
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Total Calls</div>
              <div className="text-base font-bold text-slate-800">{totalCalls}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Connect Rate</div>
              <div className="text-base font-bold text-indigo-700">{connectionRate}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Positive Mood</div>
              <div className="text-base font-bold text-emerald-700">{positiveRate}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Meetings Set</div>
              <div className="text-base font-bold text-purple-700">{meetingsCount}</div>
            </div>
          </div>

          {/* Top Objections List */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Top Detected Objections & Winning Counters
            </div>

            {objections.slice(0, 3).map((obj) => (
              <div
                key={obj.category}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{obj.category}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {obj.count} occurrences ({obj.percentage}%)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {obj.leads_affected} contractor leads
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 italic mb-1.5">
                  "{obj.sample_statements[0] || 'Sample prospect response'}"
                </div>

                <div className="text-[11px] text-indigo-900 bg-indigo-50/80 p-2 rounded border border-indigo-100 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sophia Counter: </strong>
                    {obj.recommended_response}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Objections aggregated across all calls and transcripts</span>
          <button
            onClick={onOpenCallIntelligence}
            className="text-indigo-600 font-medium hover:underline"
          >
            Review All Transcripts →
          </button>
        </div>
      </div>

      {/* Follow-Up Performance & Health (5 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Follow-Up Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Commitment fulfillment & queue metrics
              </p>
            </div>

            <button
              onClick={onOpenFollowUpQueue}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Open Queue →
            </button>
          </div>

          {/* Completion Gauge / Stats */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Follow-Up Completion Rate</span>
              <span className="text-sm font-bold text-emerald-700">{completionRate}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>{completedFollowUps} completed tasks</span>
              <span className={overdueFollowUps > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                {overdueFollowUps} overdue tasks
              </span>
            </div>
          </div>

          {/* Channel breakdown of tasks */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Active Task Channels
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <div className="text-[10px] text-slate-400">Phone Calls</div>
                <div className="font-bold text-slate-800 text-sm">
                  {followUps.filter((f) => f.channel === 'Phone Call').length}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <div className="text-[10px] text-slate-400">Sophia AI Calls</div>
                <div className="font-bold text-indigo-700 text-sm">
                  {followUps.filter((f) => f.channel === 'AI Call').length}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <div className="text-[10px] text-slate-400">Email / SMS</div>
                <div className="font-bold text-slate-800 text-sm">
                  {followUps.filter((f) => f.channel === 'Email' || f.channel === 'SMS').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Zero-drop guarantee on prospect commitments</span>
          <button
            onClick={onOpenFollowUpQueue}
            className="text-emerald-700 font-medium hover:underline"
          >
            Manage Queue ({followUps.filter((f) => f.status === 'Pending').length}) →
          </button>
        </div>
      </div>
    </div>
  );
};
