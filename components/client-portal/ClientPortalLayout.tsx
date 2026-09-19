import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  CheckCircle,
  FileText,
  MessageSquare,
  ClipboardList,
  Clock,
  FolderLock,
  Flag,
  Calendar,
  CreditCard,
  Bell,
  Sparkles,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Building2,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  ClientPortalUser,
  ClientServiceProgress,
  ClientDeliverable,
  ClientPerformanceReport,
  ClientApproval,
  ClientRequest,
  ClientMessage,
  SharedDocument,
  ClientOnboardingProgress,
  ClientAccessRequest,
  ClientMeeting,
  ClientBillingInfo,
} from '../../types/clientPortal';
import {
  seedClientPortalData,
  getClientServices,
  getClientDeliverables,
  getClientReports,
  getClientApprovals,
  getClientRequests,
  getClientMessages,
  getClientDocuments,
  getClientOnboarding,
  getClientAccessRequests,
  getClientMeetings,
  getClientBilling,
  getClientOrganizationName,
  getCurrentClientPortalSession,
} from '../../services/clientPortalService';

// Sub-components
import { ClientPortalDashboard } from './ClientPortalDashboard';
import { ClientServicesView } from './ClientServicesView';
import { ClientDeliverablesView } from './ClientDeliverablesView';
import { ClientReportingView } from './ClientReportingView';
import { ClientMessagingView } from './ClientMessagingView';
import { ClientRequestsView } from './ClientRequestsView';
import { ClientApprovalsView } from './ClientApprovalsView';
import { ClientDocumentsView } from './ClientDocumentsView';
import { ClientOnboardingView } from './ClientOnboardingView';
import { ClientMeetingsView } from './ClientMeetingsView';
import { ClientAccountView } from './ClientAccountView';
import { ClientSophiaAssistantModal } from './ClientSophiaAssistantModal';

interface ClientPortalLayoutProps {
  currentUser: ClientPortalUser;
  onLogout: () => void;
  onExitToAgencySuite: () => void;
}

export const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({
  currentUser,
  onLogout,
  onExitToAgencySuite,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSophiaOpen, setIsSophiaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Client Data States
  const clientId = currentUser.client_id;
  const businessName = getClientOrganizationName(clientId);

  const [services, setServices] = useState<ClientServiceProgress[]>([]);
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);
  const [reports, setReports] = useState<ClientPerformanceReport[]>([]);
  const [approvals, setApprovals] = useState<ClientApproval[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [onboarding, setOnboarding] = useState<ClientOnboardingProgress | null>(null);
  const [accessRequests, setAccessRequests] = useState<ClientAccessRequest[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [billing, setBilling] = useState<ClientBillingInfo | null>(null);

  const refreshData = () => {
    seedClientPortalData();
    setServices(getClientServices(clientId));
    setDeliverables(getClientDeliverables(clientId));
    setReports(getClientReports(clientId));
    setApprovals(getClientApprovals(clientId));
    setRequests(getClientRequests(clientId));
    setMessages(getClientMessages(clientId));
    setDocuments(getClientDocuments(clientId));
    setOnboarding(getClientOnboarding(clientId));
    setAccessRequests(getClientAccessRequests(clientId));
    setMeetings(getClientMeetings(clientId));
    setBilling(getClientBilling(clientId));
  };

  useEffect(() => {
    refreshData();
  }, [clientId]);

  // Apply dark mode class to html/container
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending').length;
  const unreadMessagesCount = messages.filter((m) => m.sender_type === 'agency').length;

  const session = getCurrentClientPortalSession();
  const isAgencyPreview = Boolean(session?.is_agency_preview);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'deliverables', label: 'Deliverables', icon: CheckCircle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'messages', label: 'Communication', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
    { id: 'approvals', label: 'Approvals', icon: Clock, badge: pendingApprovalsCount },
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { id: 'onboarding', label: 'Onboarding', icon: Flag },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'account', label: 'Account & Billing', icon: CreditCard },
  ];

  return (
    <div
      className={`min-h-screen font-sans ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } flex flex-col`}
    >
      {/* Agency Operator Preview Banner (Displayed when accessing via Agency Hub) */}
      {isAgencyPreview && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-bold">Agency Preview Session:</span>
            <span>
              Simulating client-facing experience as <strong>{currentUser.name}</strong> ({businessName}). Internal agency operations and CRM data remain strictly segregated.
            </span>
          </div>
          <button
            onClick={onExitToAgencySuite}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-950 dark:text-amber-100 font-semibold text-[11px] flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Return to Internal Suite</span>
          </button>
        </div>
      )}

      {/* Top Banner: Navigation & Brand Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Client Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 text-sm">
                MCA
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                    Marketing Charm Agency
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Client Portal
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Your Digital Growth Command Center
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{businessName}</span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask Sophia Trigger */}
            <button
              onClick={() => setIsSophiaOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 dark:from-indigo-950/60 to-purple-50 dark:to-purple-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:border-indigo-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Ask Sophia</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Portal Notifications
                    </span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {pendingApprovalsCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('approvals');
                          setNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 cursor-pointer"
                      >
                        <div className="font-bold">Pending Sign-Offs ({pendingApprovalsCount})</div>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                          Items require your authorized client decision.
                        </p>
                      </div>
                    )}

                    <div
                      onClick={() => {
                        setActiveTab('reports');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Monthly Report Ready
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {reports[0]?.period || 'Monthly'} growth summary published.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Client User Profile Pill & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400">{currentUser.role}</div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out of Client Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tab Bar */}
        <div className="hidden lg:block border-t border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onExitToAgencySuite}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Exit to Internal Agency Suite</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <ClientPortalDashboard
            businessName={businessName}
            currentUser={currentUser}
            services={services}
            deliverables={deliverables}
            reports={reports}
            approvals={approvals}
            requests={requests}
            meetings={meetings}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenSophia={() => setIsSophiaOpen(true)}
            onOpenRequestModal={() => setActiveTab('requests')}
          />
        )}

        {activeTab === 'services' && (
          <ClientServicesView services={services} businessName={businessName} />
        )}

        {activeTab === 'deliverables' && (
          <ClientDeliverablesView
            deliverables={deliverables}
            currentUser={currentUser}
            businessName={businessName}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'reports' && (
          <ClientReportingView reports={reports} businessName={businessName} />
        )}

        {activeTab === 'messages' && (
          <ClientMessagingView
            messages={messages}
            currentUser={currentUser}
            businessName={businessName}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'requests' && (
          <ClientRequestsView
            requests={requests}
            currentUser={currentUser}
            businessName={businessName}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'approvals' && (
          <ClientApprovalsView
            approvals={approvals}
            currentUser={currentUser}
            businessName={businessName}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'documents' && (
          <ClientDocumentsView
            documents={documents}
            currentUser={currentUser}
            businessName={businessName}
          />
        )}

        {activeTab === 'onboarding' && onboarding && (
          <ClientOnboardingView
            onboarding={onboarding}
            accessRequests={accessRequests}
            currentUser={currentUser}
            businessName={businessName}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'meetings' && (
          <ClientMeetingsView
            meetings={meetings}
            currentUser={currentUser}
            businessName={businessName}
          />
        )}

        {activeTab === 'account' && billing && (
          <ClientAccountView
            currentUser={currentUser}
            billingInfo={billing}
            businessName={businessName}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Floating Ask Sophia Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsSophiaOpen(true)}
          className="px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
          <span>Ask Sophia AI</span>
        </button>
      </div>

      {/* Sophia AI Concierge Modal */}
      {isSophiaOpen && (
        <ClientSophiaAssistantModal
          isOpen={isSophiaOpen}
          businessName={businessName}
          activeReport={reports[0] || null}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onClose={() => setIsSophiaOpen(false)}
        />
      )}

      {/* Agency Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Marketing Charm Agency
            </span>
            <span>•</span>
            <span>Client Portal v4.2 White-Label Edition</span>
          </div>

          <button
            onClick={onExitToAgencySuite}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Exit to Internal Agency CRM Suite</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
