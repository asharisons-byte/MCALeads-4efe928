import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Users,
  FolderLock,
  ClipboardList,
  Clock,
  Activity,
  Building2,
  UserPlus,
  Send,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Trash2,
  FileText,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Sliders,
  MessageSquare,
  DollarSign,
  Download,
} from 'lucide-react';
import { Client } from '../../types';
import {
  ClientPortalUser,
  ClientUserRole,
  SharedDocument,
  ClientRequest,
  ClientApproval,
  ClientPortalActivity,
  ClientPortalAnalytics,
} from '../../types/clientPortal';
import {
  seedClientPortalData,
  getClientUsers,
  getClientDocuments,
  getAllClientDocumentsForAgency,
  getClientRequests,
  getClientApprovals,
  getClientPortalActivities,
  getClientPortalAnalytics,
  updateDocumentSharing,
  addSharedDocument,
  addClientUser,
  removeClientUser,
  createClientInvitation,
  updateClientRequestStatus,
  createAgencyClientApproval,
  toggleClientPortalAccess,
  isClientPortalAccessDisabled,
  getClientOrganizationName,
} from '../../services/clientPortalService';
import { getClients } from '../../services/conversionService';

interface ClientPortalAgencyHubProps {
  onLaunchPortalAsUser: (user: ClientPortalUser) => void;
  onOpenDirectLogin: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ClientPortalAgencyHub: React.FC<ClientPortalAgencyHubProps> = ({
  onLaunchPortalAsUser,
  onOpenDirectLogin,
  onNavigateTab,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('cli_west_coast');
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'users' | 'documents' | 'requests' | 'approvals' | 'audit_log'
  >('overview');

  // Data states for selected client
  const [users, setUsers] = useState<ClientPortalUser[]>([]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [approvals, setApprovals] = useState<ClientApproval[]>([]);
  const [activities, setActivities] = useState<ClientPortalActivity[]>([]);
  const [analytics, setAnalytics] = useState<ClientPortalAnalytics | null>(null);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);

  // Modals & form states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ClientUserRole>('Client Admin');
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<SharedDocument['category']>('Deliverables');
  const [newDocVisibility, setNewDocVisibility] = useState<SharedDocument['visibility']>('Share with Client');
  const [newDocFormat, setNewDocFormat] = useState('PDF');
  const [newDocUrl, setNewDocUrl] = useState('');

  const [showNewApprovalModal, setShowNewApprovalModal] = useState(false);
  const [approvalTitle, setApprovalTitle] = useState('');
  const [approvalCategory, setApprovalCategory] = useState<ClientApproval['category']>('Ad Creative');
  const [approvalDesc, setApprovalDesc] = useState('');
  const [approvalDeadline, setApprovalDeadline] = useState('');

  const [selectedRequestForResponse, setSelectedRequestForResponse] = useState<ClientRequest | null>(null);
  const [agencyResponseText, setAgencyResponseText] = useState('');
  const [agencyResponseStatus, setAgencyResponseStatus] = useState<ClientRequest['status']>('In Progress');

  // Load clients and seed
  useEffect(() => {
    seedClientPortalData();
    const allClients = getClients();
    setClients(allClients);
    if (allClients.length > 0 && !selectedClientId) {
      setSelectedClientId(allClients[0].client_id);
    }
  }, []);

  const refreshClientData = () => {
    if (!selectedClientId) return;
    setUsers(getClientUsers(selectedClientId));
    setDocuments(getAllClientDocumentsForAgency(selectedClientId));
    setRequests(getClientRequests(selectedClientId));
    setApprovals(getClientApprovals(selectedClientId));
    setActivities(getClientPortalActivities(selectedClientId));
    setAnalytics(getClientPortalAnalytics(selectedClientId));
    setIsAccessDisabled(isClientPortalAccessDisabled(selectedClientId));
  };

  useEffect(() => {
    refreshClientData();
  }, [selectedClientId]);

  const currentClient = clients.find((c) => c.client_id === selectedClientId);
  const currentBusinessName = currentClient?.business_name || getClientOrganizationName(selectedClientId);

  const handleToggleAccess = () => {
    const nextState = !isAccessDisabled;
    toggleClientPortalAccess(selectedClientId, nextState);
    setIsAccessDisabled(nextState);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    addClientUser({
      client_id: selectedClientId,
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      status: 'Active',
      notification_preferences: {
        email_notifications: true,
        portal_notifications: true,
        report_notifications: true,
        approval_notifications: true,
        service_updates: true,
      },
    });

    createClientInvitation(
      selectedClientId,
      currentBusinessName,
      inviteName.trim(),
      inviteEmail.trim().toLowerCase(),
      inviteRole
    );

    setInviteNotice(`Invitation generated & sent to ${inviteEmail} with ${inviteRole} role.`);
    setInviteName('');
    setInviteEmail('');
    refreshClientData();
    setTimeout(() => {
      setInviteNotice(null);
      setShowInviteModal(false);
    }, 1800);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    addSharedDocument({
      client_id: selectedClientId,
      title: newDocTitle.trim(),
      category: newDocCategory,
      visibility: newDocVisibility,
      file_type: 'pdf',
      file_size: '2.4 MB',
      file_url: newDocUrl.trim() || 'https://drive.google.com/marketingcharmagency/shared',
      shared_by: 'Agency Operations Lead',
    });

    setNewDocTitle('');
    setNewDocUrl('');
    setShowAddDocModal(false);
    refreshClientData();
  };

  const handleDocVisibilityChange = (docId: string, newVisibility: SharedDocument['visibility']) => {
    updateDocumentSharing(docId, newVisibility);
    refreshClientData();
  };

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalTitle.trim()) return;

    createAgencyClientApproval(selectedClientId, {
      title: approvalTitle.trim(),
      category: approvalCategory,
      description: approvalDesc.trim() || 'Client sign-off requested for scheduled deployment.',
      deadline: approvalDeadline || new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    });

    setApprovalTitle('');
    setApprovalDesc('');
    setShowNewApprovalModal(false);
    refreshClientData();
  };

  const handleUpdateReqStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForResponse) return;

    updateClientRequestStatus(
      selectedRequestForResponse.request_id,
      agencyResponseStatus,
      agencyResponseText.trim() || undefined,
      `task_ops_${Date.now().toString().slice(-4)}`
    );

    setSelectedRequestForResponse(null);
    setAgencyResponseText('');
    refreshClientData();
  };

  // Launch Portal as first active user or fallback owner
  const handleLaunchPortal = (specificRole?: ClientUserRole) => {
    const matched = specificRole
      ? users.find((u) => u.role === specificRole) || users[0]
      : users[0];

    if (matched) {
      onLaunchPortalAsUser(matched);
    } else {
      const fallbackUser: ClientPortalUser = {
        user_id: `usr_${Date.now()}`,
        client_id: selectedClientId,
        name: currentClient?.contact_name || 'Client Principal',
        email: currentClient?.email || 'contact@clientcompany.com',
        role: 'Client Owner',
        title: 'Managing Principal',
        status: 'Active',
        created_at: new Date().toISOString(),
        notification_preferences: {
          email_notifications: true,
          portal_notifications: true,
          report_notifications: true,
          approval_notifications: true,
          service_updates: true,
        },
      };
      onLaunchPortalAsUser(fallbackUser);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Hero Banner: Agency Control Center */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-purple-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Phase 4B Architecture
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Enterprise Multi-Tenant Data Isolation
              </span>
              {isAccessDisabled && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Portal Access Suspended
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              White-Label Client Portal & Experience Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Manage client organizations, govern document sharing, review client sign-offs, and inspect portal engagement analytics. All client data is strictly isolated from internal CRM notes, prompts, and profit margins.
            </p>
          </div>

          {/* Quick Launchpad Buttons */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleLaunchPortal('Client Owner')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Live Portal (Owner View)</span>
            </button>

            <button
              onClick={onOpenDirectLogin}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Test Client Sign-In Page</span>
            </button>
          </div>
        </div>

        {/* Client Organization Selector Bar */}
        <div className="mt-6 pt-5 border-t border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs font-bold text-slate-300">Active Client Account:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-slate-800/90 border border-purple-800/60 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.business_name} (${c.actual_mrr.toLocaleString()}/mo • {c.status})
                </option>
              ))}
              {/* Fallback demo organizations if not present */}
              {!clients.some((c) => c.client_id === 'cli_west_coast') && (
                <option value="cli_west_coast">West Coast Plumbing & Rooter ($2,400/mo)</option>
              )}
              {!clients.some((c) => c.client_id === 'cli_apex_roofing') && (
                <option value="cli_apex_roofing">Apex Roofing & Restoration ($3,500/mo)</option>
              )}
              {!clients.some((c) => c.client_id === 'cli_cascade_hvac') && (
                <option value="cli_cascade_hvac">Cascade Heating & Air ($1,800/mo)</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleToggleAccess}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                isAccessDisabled
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isAccessDisabled ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Portal Access Disabled (Click to Enable)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Portal Access Active (Click to Disable)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Client User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Organization Overview', icon: Building2 },
          { id: 'users', label: `Client Users (${users.length})`, icon: Users },
          { id: 'documents', label: `Shared Documents (${documents.length})`, icon: FolderLock },
          { id: 'requests', label: `Client Requests (${requests.length})`, icon: ClipboardList, badge: requests.filter((r) => r.status === 'Submitted').length },
          { id: 'approvals', label: `Sign-Offs & Approvals (${approvals.length})`, icon: Clock, badge: approvals.filter((a) => a.status === 'Pending').length },
          { id: 'audit_log', label: 'Audit Trail & Analytics', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* SUB-TAB 1: ORGANIZATION OVERVIEW */}
      {/* ========================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* High-Level Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Retainer MRR
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${currentClient?.actual_mrr.toLocaleString() || '2,400'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                Active Client
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Portal Users
              </span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                {users.length}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {users.filter((u) => u.status === 'Active').length} Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Pending Approvals
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {approvals.filter((a) => a.status === 'Pending').length}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold block">
                Awaiting Sign-off
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Open Requests
              </span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {requests.filter((r) => r.status !== 'Completed' && r.status !== 'Closed').length}
              </span>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold block">
                In Ops Queue
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Total Logins
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics?.total_logins || 14}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block">
                High Engagement
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Reports Viewed
              </span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {analytics?.reports_viewed_count || 6}
              </span>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold block">
                Sophia Assisted
              </span>
            </div>
          </div>

          {/* Quick Impersonation / View Launch Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Client Impersonation & Role Testing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a role to verify exact view boundaries and permission gating for {currentBusinessName}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  role: 'Client Owner' as const,
                  title: 'Owner Portal View',
                  desc: 'Full visibility, approvals, team management, billing invoices & contracts.',
                  color: 'border-purple-300 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200',
                  btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
                },
                {
                  role: 'Client Admin' as const,
                  title: 'Admin Portal View',
                  desc: 'Review deliverables, approve ad creatives, submit requests, and invite peers.',
                  color: 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200',
                  btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                },
                {
                  role: 'Client Member' as const,
                  title: 'Team Member View',
                  desc: 'Read-only reports, inspect live milestone progress, and submit work requests.',
                  color: 'border-slate-300 bg-slate-50/50 dark:bg-slate-850/50 text-slate-900 dark:text-slate-200',
                  btnColor: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${item.color} flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {item.role}
                    </span>
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleLaunchPortal(item.role)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${item.btnColor}`}
                  >
                    <span>Launch as {item.role}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SUB-TAB 2: CLIENT USERS MANAGEMENT */}
      {/* ========================================================== */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized Client Users for {currentBusinessName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage roles, inspect last login activity, and invite authorized stakeholder accounts.
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New User</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">User Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Title / Job Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            user.role === 'Client Owner'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : user.role === 'Client Admin'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">{user.title || 'Client Stakeholder'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onLaunchPortalAsUser(user)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-semibold transition-colors flex items-center gap-1 text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Impersonate</span>
                          </button>
                          {user.role !== 'Client Owner' && (
                            <button
                              onClick={() => {
                                removeClientUser(user.user_id);
                                refreshClientData();
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              title="Revoke User Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SUB-TAB 3: SHARED DOCUMENTS GOVERNANCE */}
      {/* ========================================================== */}
      {activeSubTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Content Sharing Governance for {currentBusinessName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control document visibility. Documents set to "Internal Only" remain strictly locked to agency personnel.
              </p>
            </div>

            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share New Document</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Document Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Uploaded By</th>
                    <th className="p-4">Visibility Setting</th>
                    <th className="p-4 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {documents.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {doc.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-500 uppercase">
                        {doc.file_type} ({doc.file_size})
                      </td>
                      <td className="p-4 text-slate-500">{doc.shared_by}</td>
                      <td className="p-4">
                        <select
                          value={doc.visibility}
                          onChange={(e) =>
                            handleDocVisibilityChange(doc.document_id, e.target.value as any)
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                            doc.visibility === 'Share with Client'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                              : doc.visibility === 'Shared with Specific Client User'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
                          }`}
                        >
                          <option value="Share with Client">Share with Client (Portal)</option>
                          <option value="Shared with Specific Client User">Specific Client User Only</option>
                          <option value="Internal Only">Internal Only (Locked)</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-600 dark:text-slate-400">
                        {doc.download_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SUB-TAB 4: CLIENT REQUESTS QUEUE */}
      {/* ========================================================== */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Client Service & Modification Requests
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inquiries and change orders submitted through the client portal. Responding directly notifies the client.
            </p>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.request_id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : req.priority === 'High'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {req.priority} Priority
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {req.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {req.subject}
                    </h4>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      req.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : req.status === 'In Progress'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    Status: {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl">
                  {req.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    Submitted by <strong>{req.submitted_by.name}</strong> ({req.submitted_by.role}) on{' '}
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedRequestForResponse(req);
                      setAgencyResponseStatus(req.status);
                      setAgencyResponseText(req.agency_response || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
                  >
                    Manage & Reply to Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SUB-TAB 5: CLIENT APPROVALS TRACKER */}
      {/* ========================================================== */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Client Sign-Off & Approval Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track client decisions on ad creatives, budget adjustments, and website updates.
              </p>
            </div>

            <button
              onClick={() => setShowNewApprovalModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Approval Request</span>
            </button>
          </div>

          <div className="space-y-3">
            {approvals.map((appr) => (
              <div
                key={appr.approval_id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {appr.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {appr.title}
                    </h4>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appr.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : appr.status === 'Changes Requested'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : appr.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {appr.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {appr.description}
                </p>

                {appr.client_feedback && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs">
                    <strong className="text-amber-950 dark:text-amber-300 font-bold block mb-0.5">
                      Client Feedback Notes:
                    </strong>
                    <span className="text-amber-900/90 dark:text-amber-200/90">
                      "{appr.client_feedback}"
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Sign-off Deadline: {appr.deadline}</span>
                  {appr.responded_by && (
                    <span>
                      Decided by {appr.responded_by.name} on{' '}
                      {appr.responded_at ? new Date(appr.responded_at).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SUB-TAB 6: AUDIT LOG & PORTAL ENGAGEMENT */}
      {/* ========================================================== */}
      {activeSubTab === 'audit_log' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Client Portal Audit Log & Security Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete chronological audit history for {currentBusinessName}. Every login, report access, download, and approval is immutably logged.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Timestamp & User</span>
              <span>Activity Type</span>
              <span>Details</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {activities.map((act) => (
                <div
                  key={act.activity_id}
                  className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {act.user_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    {act.activity_type}
                  </span>

                  <span className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {act.details}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Invite Client User */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Invite User to {currentBusinessName} Portal
            </h3>
            {inviteNotice ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                {inviteNotice}
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Jessica Taylor"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. jessica@clientcompany.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Client Admin">Client Admin (Approvals, Requests, Campaigns)</option>
                    <option value="Client Owner">Client Owner (Full Org Access, Billing & Invoices)</option>
                    <option value="Client Member">Client Member (Read-Only Reports & Requests)</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Share Document */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share Document with {currentBusinessName}
            </h3>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Q3 Strategic Local SEO Audit"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Deliverables">Deliverables</option>
                    <option value="Reports">Reports</option>
                    <option value="Strategy Documents">Strategy Documents</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Audit Documents">Audit Documents</option>
                    <option value="Shared Files">Shared Files</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Visibility Level</label>
                  <select
                    value={newDocVisibility}
                    onChange={(e) => setNewDocVisibility(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850"
                  >
                    <option value="Share with Client">Share with Client (Portal)</option>
                    <option value="Shared with Specific Client User">Specific User Only</option>
                    <option value="Internal Only">Internal Only (Hidden)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Asset URL or File Drive Link</label>
                <input
                  type="text"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Confirm & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Sign-Off / Approval */}
      {showNewApprovalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Client Sign-Off Request
            </h3>
            <form onSubmit={handleCreateApproval} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Approval Item Title</label>
                <input
                  type="text"
                  required
                  value={approvalTitle}
                  onChange={(e) => setApprovalTitle(e.target.value)}
                  placeholder="e.g. Q4 Google Ads Geo-Radius Expansion"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={approvalCategory}
                    onChange={(e) => setApprovalCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Ad Creative">Ad Creative</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Budget Increase">Budget Increase</option>
                    <option value="Campaign Strategy">Campaign Strategy</option>
                    <option value="Website Modification">Website Modification</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Sign-Off Deadline</label>
                  <input
                    type="date"
                    value={approvalDeadline}
                    onChange={(e) => setApprovalDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Scope & Description</label>
                <textarea
                  rows={3}
                  value={approvalDesc}
                  onChange={(e) => setApprovalDesc(e.target.value)}
                  placeholder="Provide context on what the client is approving and projected impact..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewApprovalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Submit for Client Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Respond to Client Request */}
      {selectedRequestForResponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Manage Client Request: {selectedRequestForResponse.subject}
            </h3>
            <p className="text-xs text-slate-500">
              Submitted by {selectedRequestForResponse.submitted_by.name} ({selectedRequestForResponse.category})
            </p>

            <form onSubmit={handleUpdateReqStatus} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Update Status</label>
                <select
                  value={agencyResponseStatus}
                  onChange={(e) => setAgencyResponseStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress (Assigned to Ops)</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Agency Response Note (Visible to Client)</label>
                <textarea
                  rows={4}
                  value={agencyResponseText}
                  onChange={(e) => setAgencyResponseText(e.target.value)}
                  placeholder="Explain actions taken or timeline for completion..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForResponse(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Status & Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
