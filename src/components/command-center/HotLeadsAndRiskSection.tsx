import React from 'react';
import {
  Flame,
  AlertOctagon,
  Phone,
  Radio,
  Mail,
  MessageSquare,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  HotLeadCommandItem,
  LeadAtRiskItem,
} from '../../services/commandCenterService';
import { Lead } from '../../types';

interface HotLeadsAndRiskSectionProps {
  hotLeads: HotLeadCommandItem[];
  leadsAtRisk: LeadAtRiskItem[];
  onOpenLead: (leadId: string) => void;
  onStartCall?: (leadId: string) => void;
  onStartAICall?: (leadId: string) => void;
  onSendEmail?: (leadId: string) => void;
  onSendSMS?: (leadId: string) => void;
}

export const HotLeadsAndRiskSection: React.FC<HotLeadsAndRiskSectionProps> = ({
  hotLeads,
  leadsAtRisk,
  onOpenLead,
  onStartCall,
  onStartAICall,
  onSendEmail,
  onSendSMS,
}) => {
  return (
    <div id="hot-leads-and-risk-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Hot Leads Command Panel (7 Cols) */}
      <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Hot Leads Requiring Attention
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Contractors with verified gaps, high fit scores, or recent affirmative engagement
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {hotLeads.length} Hot Targets
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {hotLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hot leads currently flagged. Review all CRM leads in the Leads table.
              </div>
            ) : (
              hotLeads.map((item) => (
                <div
                  key={item.lead.lead_id}
                  onClick={() => onOpenLead(item.lead.lead_id)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                          {item.lead.business_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Score {item.score}/100
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.lead.city || 'Portland'}, {item.lead.state || 'OR'} • {item.lead.niche}
                        </span>
                      </div>

                      <div className="text-xs text-indigo-700 font-medium mt-1">
                        Angle: {item.recommendedAction}
                      </div>

                      {/* Signals / reasons */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.reasons.slice(0, 2).map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900">
                        ${item.estimatedMRR.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-slate-400">Est. Retainer</div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div
                    className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] text-slate-400">
                      Active Stage: <strong className="text-slate-700">{item.lead.pipeline_stage}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onStartAICall && (
                        <button
                          onClick={() => onStartAICall(item.lead.lead_id)}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Launch Sophia AI Voice Call"
                        >
                          <Radio className="w-3.5 h-3.5 text-indigo-600" />
                          AI Call
                        </button>
                      )}
                      {onStartCall && (
                        <button
                          onClick={() => onStartCall(item.lead.lead_id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Manual Dial"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          Dial
                        </button>
                      )}
                      <button
                        onClick={() => onOpenLead(item.lead.lead_id)}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Lead Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ranked by opportunity score and affirmative buying signals</span>
          <button
            onClick={() => onOpenLead(hotLeads[0]?.lead.lead_id || '')}
            className="text-amber-700 font-medium hover:underline"
          >
            Review All Hot Targets →
          </button>
        </div>
      </div>

      {/* Leads at Risk Panel (5 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Leads at Risk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stalled proposals, overdue promises, or inactive high-value targets
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {leadsAtRisk.length} Watchlist
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {leadsAtRisk.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No high-value leads currently at risk of cooling. Operations are healthy!
              </div>
            ) : (
              leadsAtRisk.map((risk, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenLead(risk.lead.lead_id)}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 hover:border-rose-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-900">
                        {risk.lead.business_name}
                      </div>
                      <div className="text-xs text-rose-700 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {risk.riskReason}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-rose-700">
                        ${risk.estimatedValue.toLocaleString()} MRR
                      </div>
                      <div className="text-[10px] text-slate-400">At Risk</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 mt-2 bg-white/80 p-2 rounded border border-rose-100">
                    <strong className="text-slate-800">Next Step: </strong>
                    {risk.recommendedAction}
                  </div>

                  {/* Recovery Action */}
                  <div
                    className="mt-2.5 flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onStartAICall && (
                      <button
                        onClick={() => onStartAICall(risk.lead.lead_id)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 transition-colors"
                      >
                        <Radio className="w-3 h-3" />
                        Recover via Sophia
                      </button>
                    )}
                    {onStartCall && (
                      <button
                        onClick={() => onStartCall(risk.lead.lead_id)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-slate-600" />
                        Call
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Early alert prevents prospect churn before closing</span>
          <span className="text-rose-700 font-medium">Inactivity Threshold: 48h</span>
        </div>
      </div>
    </div>
  );
};
