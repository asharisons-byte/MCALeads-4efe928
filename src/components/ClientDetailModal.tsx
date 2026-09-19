import React, { useState, useEffect } from 'react';
import { Client, OnboardingTask } from '../types';
import { updateOnboardingTask } from '../services/conversionService';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  ListChecks,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  UserCheck,
  ExternalLink,
  Users,
  FolderLock,
  Lock,
  Unlock,
  Plus,
  UserPlus,
  Activity,
  Trash2,
} from 'lucide-react';
import {
  ClientPortalUser,
  ClientUserRole,
  SharedDocument,
  ClientPortalAnalytics,
  ClientPortalActivity,
} from '../types/clientPortal';
import {
  getClientUsers,
  getAllClientDocumentsForAgency,
  getClientPortalAnalytics,
  getClientPortalActivities,
  updateDocumentSharing,
  addSharedDocument,
  addClientUser,
  removeClientUser,
  toggleClientPortalAccess,
  isClientPortalAccessDisabled,
  createClientInvitation,
} from '../services/clientPortalService';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  onUpdate: () => void;
  onLaunchPortal?: (user: ClientPortalUser) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onUpdate,
  onLaunchPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'handoff_brief' | 'onboarding' | 'client_portal'>('handoff_brief');
  const [currentClient, setCurrentClient] = useState<Client>(client);

  // Client Portal State
  const [portalUsers, setPortalUsers] = useState<ClientPortalUser[]>([]);
  const [portalDocs, setPortalDocs] = useState<SharedDocument[]>([]);
  const [portalAnalytics, setPortalAnalytics] = useState<ClientPortalAnalytics | null>(null);
  const [portalActivities, setPortalActivities] = useState<ClientPortalActivity[]>([]);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);

  // Invite modal state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ClientUserRole>('Client Admin');
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  // Add document state
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<SharedDocument['category']>('Deliverables');
  const [newDocVisibility, setNewDocVisibility] = useState<SharedDocument['visibility']>('Share with Client');

  const refreshPortalData = () => {
    setPortalUsers(getClientUsers(currentClient.client_id));
    setPortalDocs(getAllClientDocumentsForAgency(currentClient.client_id));
    setPortalAnalytics(getClientPortalAnalytics(currentClient.client_id));
    setPortalActivities(getClientPortalActivities(currentClient.client_id));
    setIsAccessDisabled(isClientPortalAccessDisabled(currentClient.client_id));
  };

  useEffect(() => {
    refreshPortalData();
  }, [currentClient.client_id]);

  const completedTasks = currentClient.onboarding_checklist.filter((t) => t.completed).length;
  const totalTasks = currentClient.onboarding_checklist.length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
    const updated = updateOnboardingTask(currentClient.client_id, taskId, !currentCompleted);
    if (updated) {
      setCurrentClient(updated);
      onUpdate();
    }
  };

  const handleTogglePortalAccess = () => {
    const nextState = !isAccessDisabled;
    toggleClientPortalAccess(currentClient.client_id, nextState);
    setIsAccessDisabled(nextState);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    addClientUser({
      client_id: currentClient.client_id,
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
      currentClient.client_id,
      currentClient.business_name,
      inviteName.trim(),
      inviteEmail.trim().toLowerCase(),
      inviteRole
    );

    setInviteFeedback(`Invitation sent to ${inviteEmail} (${inviteRole}).`);
    setInviteName('');
    setInviteEmail('');
    refreshPortalData();
    setTimeout(() => {
      setInviteFeedback(null);
      setShowInviteForm(false);
    }, 1800);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    addSharedDocument({
      client_id: currentClient.client_id,
      title: newDocTitle.trim(),
      category: newDocCategory,
      visibility: newDocVisibility,
      file_type: 'pdf',
      file_size: '2.8 MB',
      file_url: 'https://drive.google.com/marketingcharmagency/shared',
      shared_by: 'Agency Project Lead',
    });

    setNewDocTitle('');
    setShowDocForm(false);
    refreshPortalData();
  };

  const handleLaunchLive = () => {
    if (!onLaunchPortal) return;
    const userToLaunch = portalUsers[0] || {
      user_id: `usr_${Date.now()}`,
      client_id: currentClient.client_id,
      name: currentClient.contact_name || 'Client Principal',
      email: currentClient.email || 'client@company.com',
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
    onLaunchPortal(userToLaunch);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{currentClient.business_name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    currentClient.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentClient.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Marketing Charm Agency Client • MRR: ${currentClient.actual_mrr.toLocaleString()}/mo • Contract: {currentClient.contract_length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 border-b border-slate-200 flex gap-2 bg-white">
          <button
            onClick={() => setActiveTab('handoff_brief')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'handoff_brief'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Client Handoff Brief
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'onboarding'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Onboarding Checklist ({completedTasks}/{totalTasks})
          </button>
          <button
            onClick={() => setActiveTab('client_portal')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'client_portal'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Client Portal (Phase 4B)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Active MRR</span>
              <span className="text-base font-bold text-slate-900">
                ${currentClient.actual_mrr.toLocaleString()}/mo
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Setup Fee Paid</span>
              <span className="text-base font-bold text-slate-900">
                ${currentClient.setup_fee.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Commencement</span>
              <span className="text-base font-bold text-slate-900">
                {currentClient.contract_start_date}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Onboarding Progress</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900">{progressPct}%</span>
              </div>
            </div>
          </div>

          {activeTab === 'handoff_brief' ? (
            /* CLIENT HANDOFF BRIEF */
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Fulfillment & Account Management Blueprint
                </div>
                <h3 className="text-base font-bold">Client Handoff Brief</h3>
                <p className="text-xs text-slate-400">
                  Synthesized from Sophia's qualification, verified digital audit, and accepted proposal.
                </p>
              </div>

              {/* Business & Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Business Profile
                  </span>
                  <p className="text-slate-700">{currentClient.handoff_brief.business_information}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Primary Contacts
                  </span>
                  <p className="text-slate-700">{currentClient.handoff_brief.primary_contacts}</p>
                </div>
              </div>

              {/* Services Purchased */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Services Sold & Active Retainer Scope
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentClient.services.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Promises Made & Objections Resolved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                    Promises & Commitments Made
                  </h4>
                  <ul className="space-y-1.5 text-slate-700">
                    {currentClient.handoff_brief.promises_made.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                    Objections Resolved During Sales
                  </h4>
                  <ul className="space-y-1.5 text-slate-700">
                    {currentClient.handoff_brief.objections_resolved.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Onboarding Steps */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                  Recommended Fulfillment Steps
                </h4>
                <div className="space-y-1">
                  {currentClient.handoff_brief.recommended_onboarding_steps.map((st, idx) => (
                    <p key={idx} className="text-slate-700 font-medium">{st}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'onboarding' ? (
            /* ONBOARDING CHECKLIST */
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Onboarding Implementation Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete these tasks to activate full client management
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {completedTasks} of {totalTasks} Completed
                </span>
              </div>

              <div className="space-y-3">
                {currentClient.onboarding_checklist.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id, task.completed)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {task.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-xs">
                        <span className="text-slate-400 block">Due: {task.due_date}</span>
                        <span className="text-slate-500 font-medium">{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* CLIENT PORTAL MANAGEMENT TAB (PHASE 4B) */
            <div className="space-y-6">
              {/* Action Toolbar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-purple-950 text-white border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold">White-Label Client Experience Platform</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Isolated Client Tenant
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Manage client credentials, govern shared files, and inspect engagement analytics.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLaunchLive}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Client Portal</span>
                  </button>

                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 text-xs font-semibold border border-purple-800/80 flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite to Portal</span>
                  </button>

                  <button
                    onClick={handleTogglePortalAccess}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isAccessDisabled
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 hover:bg-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isAccessDisabled ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Access Disabled</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Access Active</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Portal Analytics Widget (Section 39) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-600" />
                    <span>Client Portal Analytics & Engagement</span>
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      portalAnalytics?.engagement_level === 'High'
                        ? 'bg-emerald-100 text-emerald-800'
                        : portalAnalytics?.engagement_level === 'Moderate'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Engagement: {portalAnalytics?.engagement_level || 'Moderate'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Total Logins</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {portalAnalytics?.total_logins || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Last: {portalAnalytics?.last_login_at ? new Date(portalAnalytics.last_login_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Reports Viewed</span>
                    <span className="text-base font-bold text-purple-600 mt-0.5 block">
                      {portalAnalytics?.reports_viewed_count || 0}
                    </span>
                    <span className="text-[10px] text-purple-700">Monthly Performance</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Docs Downloaded</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {portalAnalytics?.documents_downloaded_count || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">Shared Deliverables</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Pending Approvals</span>
                    <span className="text-base font-bold text-amber-600 mt-0.5 block">
                      {portalAnalytics?.pending_approvals_count || 0}
                    </span>
                    <span className="text-[10px] text-amber-700">Sign-Offs Required</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Open Requests</span>
                    <span className="text-base font-bold text-indigo-600 mt-0.5 block">
                      {portalAnalytics?.open_requests_count || 0}
                    </span>
                    <span className="text-[10px] text-indigo-700">In Ops Pipeline</span>
                  </div>
                </div>
              </div>

              {/* Invite Form Accordion */}
              {showInviteForm && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-purple-950">
                      Send Portal Invitation to Client Stakeholder
                    </h5>
                    <button
                      onClick={() => setShowInviteForm(false)}
                      className="text-purple-600 hover:text-purple-900 text-xs"
                    >
                      Close
                    </button>
                  </div>

                  {inviteFeedback && (
                    <div className="p-2 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      {inviteFeedback}
                    </div>
                  )}

                  <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      required
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="p-2 rounded-lg border border-purple-200 bg-white"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="p-2 rounded-lg border border-purple-200 bg-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as any)}
                        className="p-2 rounded-lg border border-purple-200 bg-white flex-1"
                      >
                        <option value="Client Admin">Client Admin</option>
                        <option value="Client Owner">Client Owner</option>
                        <option value="Client Member">Client Member</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shrink-0"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Client Users Section (Section 37) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-700" />
                    <span>Authorized Client Users ({portalUsers.length})</span>
                  </h4>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Last Login</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalUsers.map((u) => (
                        <tr key={u.user_id} className="hover:bg-slate-50/60">
                          <td className="p-3 font-bold text-slate-900">{u.name}</td>
                          <td className="p-3 font-mono text-slate-600">{u.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-3 text-right">
                            {u.role !== 'Client Owner' && (
                              <button
                                onClick={() => {
                                  removeClientUser(u.user_id);
                                  refreshPortalData();
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                title="Revoke User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Document Sharing Governance (Section 38) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FolderLock className="w-3.5 h-3.5 text-slate-700" />
                    <span>Content Sharing Governance ({portalDocs.length} items)</span>
                  </h4>
                  <button
                    onClick={() => setShowDocForm(!showDocForm)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Share Document</span>
                  </button>
                </div>

                {showDocForm && (
                  <form
                    onSubmit={handleAddDocument}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Document Title (e.g. Q3 Strategic Blueprint)"
                        required
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        className="p-2 rounded-lg border border-slate-300 bg-white"
                      />
                      <select
                        value={newDocCategory}
                        onChange={(e) => setNewDocCategory(e.target.value as any)}
                        className="p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Deliverables">Deliverables</option>
                        <option value="Reports">Reports</option>
                        <option value="Strategy Documents">Strategy Documents</option>
                        <option value="Contracts">Contracts</option>
                        <option value="Audit Documents">Audit Documents</option>
                        <option value="Shared Files">Shared Files</option>
                      </select>
                      <select
                        value={newDocVisibility}
                        onChange={(e) => setNewDocVisibility(e.target.value as any)}
                        className="p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Share with Client">Share with Client (Portal)</option>
                        <option value="Shared with Specific Client User">Specific Client User Only</option>
                        <option value="Internal Only">Internal Only (Hidden from Portal)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDocForm(false)}
                        className="px-3 py-1.5 text-slate-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold"
                      >
                        Add to Shared Library
                      </button>
                    </div>
                  </form>
                )}

                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">File Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Visibility Level</th>
                        <th className="p-3 text-right">Downloads</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalDocs.map((doc) => (
                        <tr key={doc.document_id} className="hover:bg-slate-50/60">
                          <td className="p-3 font-bold text-slate-900">{doc.title}</td>
                          <td className="p-3 text-slate-600">{doc.category}</td>
                          <td className="p-3 font-mono uppercase text-slate-500">{doc.file_type}</td>
                          <td className="p-3">
                            <select
                              value={doc.visibility}
                              onChange={(e) => {
                                updateDocumentSharing(doc.document_id, e.target.value as any);
                                refreshPortalData();
                              }}
                              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                                doc.visibility === 'Share with Client'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : doc.visibility === 'Shared with Specific Client User'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <option value="Share with Client">Share with Client</option>
                              <option value="Shared with Specific Client User">Specific Client User Only</option>
                              <option value="Internal Only">Internal Only (Hidden)</option>
                            </select>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-600">
                            {doc.download_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Portal Activity Audit Log (Section 37) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-700" />
                  <span>Portal Activity Audit Trail</span>
                </h4>

                <div className="rounded-xl border border-slate-200 overflow-hidden max-h-52 overflow-y-auto text-xs divide-y divide-slate-100">
                  {portalActivities.map((act) => (
                    <div key={act.activity_id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">{act.user_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        {act.activity_type}
                      </span>
                      <span className="text-slate-600 max-w-xs truncate">{act.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Client ID: {currentClient.client_id}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Close Client File
          </button>
        </div>
      </div>
    </div>
  );
};
