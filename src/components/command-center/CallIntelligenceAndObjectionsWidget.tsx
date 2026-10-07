import React from 'react';
import { AggregatedObjection, CallRecord, FollowUpTask } from '../../types';

interface CallIntelligenceAndObjectionsWidgetProps {
  calls: CallRecord[];
  objections: AggregatedObjection[];
  followUps: FollowUpTask[];
  onOpenCallIntelligence: () => void;
  onOpenFollowUpQueue: () => void;
}

/** Rotating Stitch accent trio for the "Sophia Counter" boxes + occurrence labels. */
const accents = [
  { occ: 'text-amber-400', box: 'text-cyan-300 bg-cyan-950/30 border-cyan-900/30' },
  { occ: 'text-rose-400', box: 'text-purple-300 bg-purple-950/30 border-purple-900/30' },
  { occ: 'text-blue-400', box: 'text-emerald-300 bg-emerald-950/30 border-emerald-900/30' },
];

const pct = (n: number, d: number) => (d > 0 ? Math.min(100, Math.round((n / d) * 100)) : 0);

/** Stitch "TelemetryRadarRow": Call Intelligence & Objection Radar + Follow-Up Performance. */
export const CallIntelligenceAndObjectionsWidget: React.FC<CallIntelligenceAndObjectionsWidgetProps> = ({
  calls,
  objections,
  followUps,
  onOpenCallIntelligence,
  onOpenFollowUpQueue,
}) => {
  // Real call telemetry (no placeholder fallbacks — zero calls shows zero)
  const totalCalls = calls.length;
  const connected = calls.filter((c) => c.status === 'COMPLETED' && c.duration > 15).length;
  const positive = calls.filter((c) => c.sentiment === 'Positive').length;
  const meetings = calls.filter((c) => c.outcome === 'Meeting Requested').length;
  const connectRate = pct(connected, totalCalls);
  const positiveRate = pct(positive, totalCalls);

  // Follow-up telemetry
  const today = new Date().toISOString().split('T')[0];
  const total = followUps.length;
  const completed = followUps.filter((f) => f.status === 'Completed').length;
  const overdue = followUps.filter(
    (f) => f.status === 'Pending' && f.recommended_date !== 'Timing Unknown' && f.recommended_date < today
  ).length;
  const open = followUps.filter((f) => f.status === 'Pending' || f.status === 'Scheduled');
  const completion = pct(completed, total);
  const phone = open.filter((f) => f.channel === 'Call' || f.channel === 'Meeting').length;
  const aiCalls = open.filter((f) => f.channel === 'AI Call').length;
  const emailSms = open.filter((f) => f.channel === 'Email' || f.channel === 'SMS').length;
  const rateTone = completion >= 70 ? ['text-emerald-400', 'bg-emerald-400'] : completion >= 40 ? ['text-amber-400', 'bg-amber-400'] : ['text-rose-400', 'bg-rose-500'];

  return (
    <section
      id="call-intelligence-and-objections-widget"
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      data-purpose="radar-telemetry-row"
    >
      {/* Radar Col 1 & 2 */}
      <div className="lg:col-span-2 glass-panel p-4 rounded-xl flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-mca-border">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-satellite-dish text-cyan-400"></i>
              <h3 className="text-sm font-bold text-white">Call Intelligence &amp; Objection Radar</h3>
            </div>
            <button onClick={onOpenCallIntelligence} className="text-xs font-mono text-cyan-400 hover:underline">
              Full Dashboard →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-center">
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">TOTAL CALLS</div>
              <div className="text-base font-mono font-bold text-white">{totalCalls}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">CONNECT RATE</div>
              <div className="text-base font-mono font-bold text-cyan-400">{connectRate}%</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">POSITIVE MOOD</div>
              <div className="text-base font-mono font-bold text-emerald-400">{positiveRate}%</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">MEETINGS SET</div>
              <div className="text-base font-mono font-bold text-purple-400">{meetings}</div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            TOP DETECTED OBJECTIONS &amp; WINNING COUNTERS
          </div>

          <div className="space-y-2 text-xs">
            {objections.length === 0 && (
              <div className="p-3 rounded bg-mca-card border border-white/5 text-center text-[11px] font-mono text-slate-500">
                No objections detected yet — log calls to build the objection radar.
              </div>
            )}
            {objections.slice(0, 3).map((obj, i) => {
              const a = accents[i % accents.length];
              return (
                <div key={obj.category} className="p-2.5 rounded bg-mca-card border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {obj.category}{' '}
                      <span className={`text-[10px] font-mono ${a.occ} font-normal`}>
                        {obj.count} occurrence{obj.count === 1 ? '' : 's'} ({obj.percentage}%)
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{obj.leads_affected} contractor leads</span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    "{obj.sample_statements[0] || 'Sample prospect response'}"
                  </div>
                  <div className={`text-[11px] font-mono p-1.5 rounded border ${a.box}`}>
                    <strong>Sophia Counter:</strong> {obj.recommended_response}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-mca-border flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>Objections aggregated across all calls and transcripts</span>
          <button onClick={onOpenCallIntelligence} className="text-cyan-400 hover:underline">
            Review All Transcripts →
          </button>
        </div>
      </div>

      {/* Radar Col 3: Follow-Up Performance */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-mca-border">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-list-check text-cyan-400"></i>
              <h3 className="text-sm font-bold text-white">Follow-Up Performance</h3>
            </div>
            <button onClick={onOpenFollowUpQueue} className="text-xs font-mono text-cyan-400 hover:underline">
              Open Queue →
            </button>
          </div>

          <div className="my-3 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Follow-Up Completion Rate</span>
              <span className={`${rateTone[0]} font-bold`}>{completion}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className={`${rateTone[1]} h-full rounded-full`} style={{ width: `${completion}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{completed} completed tasks</span>
              <span className={`${overdue > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
                {overdue} overdue tasks
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">ACTIVE TASK CHANNELS</div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] text-slate-400 whitespace-nowrap">Phone Calls</div>
              <div className="text-base font-bold text-white mt-1">{phone}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] text-slate-400 whitespace-nowrap">Sophia AI Calls</div>
              <div className="text-base font-bold text-purple-400 mt-1">{aiCalls}</div>
            </div>
            <div className="p-2 rounded bg-mca-card border border-white/5">
              <div className="text-[10px] text-slate-400 whitespace-nowrap">Email / SMS</div>
              <div className="text-base font-bold text-cyan-400 mt-1">{emailSms}</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-mca-border flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-500">Zero-drop guarantee on prospect commitments</span>
          <button onClick={onOpenFollowUpQueue} className="text-cyan-400 hover:underline">
            Manage Queue ({open.length}) →
          </button>
        </div>
      </div>
    </section>
  );
};
