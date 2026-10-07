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
      <div className="bg-mca-card rounded-xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-black text-white">Executive Alert Center</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
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
                    ? 'bg-mca-hover text-white'
                    : 'bg-mca-hover text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Counts */}
        <div className="mt-4 flex items-center gap-4 text-xs font-bold">
          <span className="text-rose-400">{criticalCount} Critical Alert(s)</span>
          <span className="text-amber-400">{highCount} High Priority Alert(s)</span>
          <span className="text-slate-500">{alerts.length} Total Registered Alerts</span>
        </div>
      </div>

      {/* 2. ALERTS STREAM */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-mca-card rounded-xl border border-white/10 text-xs text-slate-500">
            No active alerts under this filter. All systems and retainers are within standard operating parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-5 rounded-xl border transition-all ${
                alert.resolved
                  ? 'bg-mca-void/70 border-white/10 opacity-60'
                  : alert.severity === 'Critical'
                  ? 'bg-rose-950/40 border-rose-700/60'
                  : alert.severity === 'High'
                  ? 'bg-amber-950/40 border-amber-700/60'
                  : 'bg-mca-card border-white/10'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-950 text-rose-300'
                          : alert.severity === 'High'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-mca-hover text-slate-200'
                      }`}
                    >
                      {alert.severity} Priority
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {alert.category}
                    </span>
                    {alert.resolved && (
                      <span className="text-[10px] font-bold text-emerald-400">Resolved</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                  <p className="text-slate-200 leading-relaxed">{alert.message}</p>

                  <div className="flex flex-wrap gap-4 text-[11px] pt-1 text-slate-400">
                    <span>
                      <strong>Evidence:</strong> {alert.evidence}
                    </span>
                    <span className="text-indigo-300 font-semibold">
                      <strong>Impact:</strong> {alert.impact}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!alert.resolved && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleDismiss(alert.alert_id)}
                      className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-400 hover:bg-mca-hover text-xs font-semibold"
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
                        className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-colors ${
                          alert.severity === 'Critical'
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : alert.severity === 'High'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-blue-600 hover:bg-blue-500'
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
