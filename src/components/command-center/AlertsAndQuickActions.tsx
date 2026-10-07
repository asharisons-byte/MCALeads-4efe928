import React from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  X,
  Plus,
  Phone,
  Radio,
  Mail,
  MessageSquare,
  Sparkles,
  Download,
  Search,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';
import { AgencyAlert } from '../../types';

interface AlertsAndQuickActionsProps {
  alerts: AgencyAlert[];
  onDismissAlert: (alertId: string) => void;
  onExecuteAlertAction: (alert: AgencyAlert) => void;
  onAddNewLead: () => void;
  onOpenDialer: () => void;
  onOpenAIDispatch: () => void;
  onOpenEmailModal: () => void;
  onOpenSMSModal: () => void;
  onOpenExportModal: () => void;
  onOpenGlobalSearch: () => void;
  onOpenDataQualityModal?: () => void;
}

export const AlertsAndQuickActions: React.FC<AlertsAndQuickActionsProps> = ({
  alerts,
  onDismissAlert,
  onExecuteAlertAction,
  onAddNewLead,
  onOpenDialer,
  onOpenAIDispatch,
  onOpenEmailModal,
  onOpenSMSModal,
  onOpenExportModal,
  onOpenGlobalSearch,
  onOpenDataQualityModal,
}) => {
  const getSeverityStyle = (severity: AgencyAlert['severity']) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-rose-950/50 border-rose-800/50 text-rose-300',
          badge: 'bg-rose-600 text-white',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        };
      case 'High':
        return {
          bg: 'bg-amber-950/50 border-amber-800/50 text-amber-300',
          badge: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case 'Medium':
        return {
          bg: 'bg-indigo-950/50 border-indigo-800/50 text-indigo-300',
          badge: 'bg-blue-600 text-white',
          icon: <Clock className="w-4 h-4 text-indigo-400" />,
        };
      default:
        return {
          bg: 'bg-mca-void/40 border-white/10 text-white',
          badge: 'bg-slate-600 text-white',
          icon: <Bell className="w-4 h-4 text-slate-300" />,
        };
    }
  };

  return (
    <div id="alerts-and-quick-actions" className="space-y-4">
      {/* Quick actions now live in the global Quick Action Dock (bottom bar) */}

      {/* Agency Alert Center (Shows if alerts exist) */}
      {alerts.length > 0 && (
        <div id="agency-alerts-center" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Agency Action Alerts ({alerts.length})
              </span>
            </div>
            <span className="text-xs text-slate-500">Grounded in real CRM activity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.slice(0, 4).map((alert) => {
              const style = getSeverityStyle(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${style.bg}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">{style.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${style.badge}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                          {alert.category}
                        </span>
                        {alert.related_lead_name && (
                          <span className="text-xs font-bold text-white truncate">
                            • {alert.related_lead_name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white mt-1">
                        {alert.title}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                        {alert.message}
                      </div>

                      {/* Action Trigger */}
                      {alert.action_label && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => onExecuteAlertAction(alert)}
                            className="px-2.5 py-1 rounded-md bg-mca-card text-xs font-semibold text-slate-100 border border-white/15 hover:bg-mca-void/40 transition-colors"
                          >
                            {alert.action_label} →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
