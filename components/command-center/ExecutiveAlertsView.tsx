import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ExecutiveAlert } from '../../types';
import {
  getExecutiveAlerts,
  dismissExecutiveAlert,
} from '../../services/executiveIntelligenceService';

interface ExecutiveAlertsViewProps {
  onOpenClient?: (clientId: string) => void;
  onOpenLead?: (leadId: string) => void;
  onStartCall?: (leadId: string) => void;
}

export const ExecutiveAlertsView: React.FC<ExecutiveAlertsViewProps> = ({
  onOpenClient,
  onOpenLead,
  onStartCall,
}) => {
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');

  useEffect(() => {
    getExecutiveAlerts().then(setAlerts);
  }, []);

  const handleDismiss = async (id: string) => {
    const updated = await dismissExecutiveAlert(id);
    setAlerts([...updated]);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'All') return true;
    return a.severity === severityFilter;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'Critical' && !a.resolved).length;
  const highCount = alerts.filter((a) => a.severity === 'High' && !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* 1. HEADER & FILTER STRIP */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">Executive Alert Center</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time operational alerts requiring executive intervention or awareness
            </p>
          </div>

          {/* Severity Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Counts */}
        <div className="mt-4 flex items-center gap-4 text-xs font-bold">
          <span className="text-rose-600">{criticalCount} Critical Alert(s)</span>
          <span className="text-amber-600">{highCount} High Priority Alert(s)</span>
          <span className="text-slate-400">{alerts.length} Total Registered Alerts</span>
        </div>
      </div>

      {/* 2. ALERTS STREAM */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            No active alerts under this filter. All systems and retainers are within standard operating parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-5 rounded-3xl border transition-all ${
                alert.resolved
                  ? 'bg-slate-50/70 border-slate-200 opacity-60'
                  : alert.severity === 'Critical'
                  ? 'bg-rose-50/40 border-rose-300 shadow-2xs'
                  : alert.severity === 'High'
                  ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {alert.severity} Priority
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {alert.category}
                    </span>
                    {alert.resolved && (
                      <span className="text-[10px] font-bold text-emerald-600">Resolved</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                  <p className="text-slate-700 leading-relaxed">{alert.message}</p>

                  <div className="flex flex-wrap gap-4 text-[11px] pt-1 text-slate-500">
                    <span>
                      <strong>Evidence:</strong> {alert.evidence}
                    </span>
                    <span className="text-indigo-700 font-semibold">
                      <strong>Impact:</strong> {alert.impact}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!alert.resolved && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleDismiss(alert.alert_id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                    {alert.action_label && (
                      <button
                        onClick={() => {
                          if (alert.lead_id && onStartCall) {
                            onStartCall(alert.lead_id);
                          } else if (alert.client_id && onOpenClient) {
                            onOpenClient(alert.client_id);
                          }
                        }}
                        className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition-colors ${
                          alert.severity === 'Critical'
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : alert.severity === 'High'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {alert.action_label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
