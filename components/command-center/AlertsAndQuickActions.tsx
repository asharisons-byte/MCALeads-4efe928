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
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badge: 'bg-rose-600 text-white',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
        };
      case 'High':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'Medium':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          badge: 'bg-indigo-600 text-white',
          icon: <Clock className="w-4 h-4 text-indigo-600" />,
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-900',
          badge: 'bg-slate-600 text-white',
          icon: <Bell className="w-4 h-4 text-slate-600" />,
        };
    }
  };

  return (
    <div id="alerts-and-quick-actions" className="space-y-4">
      {/* Global Quick Action Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick Actions:
          </span>

          <button
            onClick={onAddNewLead}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Lead
          </button>

          <button
            onClick={onOpenAIDispatch}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Launch Sophia AI Voice Outreach"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            Sophia AI Call
          </button>

          <button
            onClick={onOpenDialer}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            Open Dialer
          </button>

          <button
            onClick={onOpenEmailModal}
            className="hidden sm:flex px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            Email
          </button>

          <button
            onClick={onOpenSMSModal}
            className="hidden sm:flex px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
            SMS
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDataQualityModal && (
            <button
              onClick={onOpenDataQualityModal}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Review CRM Data Quality & Duplicates"
            >
              <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Data Quality</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export Performance and Intelligence Reports"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={onOpenGlobalSearch}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium flex items-center gap-2 transition-colors"
            title="Global Search (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search CRM</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 text-slate-600 rounded">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Agency Alert Center (Shows if alerts exist) */}
      {alerts.length > 0 && (
        <div id="agency-alerts-center" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Agency Action Alerts ({alerts.length})
              </span>
            </div>
            <span className="text-xs text-slate-400">Grounded in real CRM activity</span>
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
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                          {alert.category}
                        </span>
                        {alert.related_lead_name && (
                          <span className="text-xs font-bold text-slate-900 truncate">
                            • {alert.related_lead_name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 mt-1">
                        {alert.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {alert.message}
                      </div>

                      {/* Action Trigger */}
                      {alert.action_label && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => onExecuteAlertAction(alert)}
                            className="px-2.5 py-1 rounded-md bg-white text-xs font-semibold text-slate-800 border border-slate-300 shadow-2xs hover:bg-slate-50 transition-colors"
                          >
                            {alert.action_label} →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors shrink-0"
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
