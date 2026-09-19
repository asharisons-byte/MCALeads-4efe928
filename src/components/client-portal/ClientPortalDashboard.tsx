import React from 'react';
import {
  TrendingUp,
  PhoneCall,
  Users,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Download,
  Video,
} from 'lucide-react';
import {
  ClientServiceProgress,
  ClientDeliverable,
  ClientPerformanceReport,
  ClientApproval,
  ClientRequest,
  ClientMeeting,
  ClientPortalUser,
} from '../../types/clientPortal';

interface ClientPortalDashboardProps {
  businessName: string;
  currentUser: ClientPortalUser;
  services: ClientServiceProgress[];
  deliverables: ClientDeliverable[];
  reports: ClientPerformanceReport[];
  approvals: ClientApproval[];
  requests: ClientRequest[];
  meetings: ClientMeeting[];
  onNavigateTab: (tab: string) => void;
  onOpenSophia: () => void;
  onOpenRequestModal: () => void;
}

export const ClientPortalDashboard: React.FC<ClientPortalDashboardProps> = ({
  businessName,
  currentUser,
  services,
  deliverables,
  reports,
  approvals,
  requests,
  meetings,
  onNavigateTab,
  onOpenSophia,
  onOpenRequestModal,
}) => {
  const latestReport = reports[0];
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const openRequests = requests.filter((r) => r.status !== 'Completed' && r.status !== 'Closed');
  const upcomingMeeting = meetings.find((m) => m.status === 'Upcoming');
  const activeServices = services.filter((s) => s.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Retainer • In Good Standing
              </span>
              <span className="text-xs text-indigo-300">
                Marketing Charm Agency Client Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {businessName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Here’s what’s happening with your digital growth this month. Your campaigns generated{' '}
              <strong className="text-white font-bold">
                {latestReport?.metrics?.calls_generated?.value || 112} direct telephone inquiries
              </strong>{' '}
              with organic search visibility pacing ahead of target.
            </p>
          </div>

          {/* Quick Sophia Concierge Access */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={onOpenSophia}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Ask Sophia (AI Concierge)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approvals Urgent Callout Banner */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  {pendingApprovals.length} Approval
                  {pendingApprovals.length === 1 ? '' : 's'} Awaiting Your Decision
                </h3>
                <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                Latest: "{pendingApprovals[0].title}". Review supporting details and record your sign-off.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Review Approvals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'View Reports', tab: 'reports', icon: FileText, color: 'text-indigo-600' },
          { label: 'Deliverables', tab: 'deliverables', icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Submit Request', action: onOpenRequestModal, icon: Layers, color: 'text-purple-600' },
          { label: 'Message Agency', tab: 'messages', icon: MessageSquare, color: 'text-blue-600' },
          { label: 'Review Approvals', tab: 'approvals', icon: Clock, color: 'text-amber-600', badge: pendingApprovals.length },
          { label: 'Schedule Meeting', tab: 'meetings', icon: Calendar, color: 'text-rose-600' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => {
                if (action.action) action.action();
                else if (action.tab) onNavigateTab(action.tab);
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {action.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {action.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Services & Performance Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Services Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Active Retainer Services
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {activeServices.length} Growth channels actively managed
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('services')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View Milestones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeServices.map((service) => (
                <div
                  key={service.service_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {service.service_name}
                    </span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {service.progress_pct}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${service.progress_pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Stage: {service.current_stage}</span>
                    <span className="text-slate-400 font-mono">
                      {service.completed_milestones.length} milestones done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Monthly Report Digest Card */}
          {latestReport && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Latest Performance Digest ({latestReport.period})
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Verified search & telephone inquiry metrics
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('reports')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Full Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Direct Calls</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {latestReport.metrics.calls_generated.value}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                    +{latestReport.metrics.calls_generated.change_pct}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Qualified Leads</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {latestReport.metrics.qualified_inquiries.value}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                    +{latestReport.metrics.qualified_inquiries.change_pct}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Website Visitors</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {latestReport.metrics.website_traffic.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                    +{latestReport.metrics.website_traffic.change_pct}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Google Maps Views</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {latestReport.metrics.google_maps_views.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                    +{latestReport.metrics.google_maps_views.change_pct}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {latestReport.executive_summary}
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Meetings, Deliverables & Requests */}
        <div className="space-y-6">
          {/* Upcoming Strategy Session Card */}
          {upcomingMeeting && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase">
                  Strategy Session
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Tomorrow
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {upcomingMeeting.title}
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Hosted by {upcomingMeeting.host_name} • {upcomingMeeting.duration_minutes} min
                </div>
              </div>

              {upcomingMeeting.meeting_link && (
                <a
                  href={upcomingMeeting.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Google Meet</span>
                </a>
              )}
            </div>
          )}

          {/* Upcoming Deliverables Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Deliverables
              </h4>
              <button
                onClick={() => onNavigateTab('deliverables')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All ({deliverables.length})
              </button>
            </div>

            <div className="space-y-3">
              {deliverables.slice(0, 3).map((del) => (
                <div
                  key={del.deliverable_id}
                  onClick={() => onNavigateTab('deliverables')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {del.title}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {del.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {del.service_name} • {del.file_size}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Requests Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Open Client Requests
              </h4>
              <button
                onClick={() => onNavigateTab('requests')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View ({openRequests.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {openRequests.map((req) => (
                <div
                  key={req.request_id}
                  onClick={() => onNavigateTab('requests')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                      {req.subject}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {req.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {req.category} • Priority: {req.priority}
                  </div>
                </div>
              ))}

              {openRequests.length === 0 && (
                <p className="text-xs text-slate-400 py-2 text-center">
                  No open requests. Need a website update or campaign change?
                </p>
              )}

              <button
                onClick={onOpenRequestModal}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors mt-2"
              >
                + Submit New Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
