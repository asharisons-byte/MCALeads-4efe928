import React, { useState } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Bell,
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Download,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import {
  ClientPortalUser,
  ClientBillingInfo,
  ClientUserRole,
} from '../../types/clientPortal';
import {
  getClientUsers,
  addClientUser,
  removeClientUser,
  createClientInvitation,
  logClientPortalActivity,
} from '../../services/clientPortalService';

interface ClientAccountViewProps {
  currentUser: ClientPortalUser;
  billingInfo: ClientBillingInfo;
  businessName: string;
  onRefresh: () => void;
}

export const ClientAccountView: React.FC<ClientAccountViewProps> = ({
  currentUser,
  billingInfo,
  businessName,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing' | 'notifications'>(
    'profile'
  );
  const [usersList, setUsersList] = useState<ClientPortalUser[]>(() =>
    getClientUsers(currentUser.client_id)
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ClientUserRole>('Client Member');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [invoiceDownloadNotice, setInvoiceDownloadNotice] = useState<string | null>(null);

  // Notification state
  const [preferences, setPreferences] = useState(currentUser.notification_preferences);
  const [prefSavedNotice, setPrefSavedNotice] = useState(false);

  const isOwnerOrAdmin =
    currentUser.role === 'Client Owner' || currentUser.role === 'Client Admin';

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    // Create client user and invitation
    addClientUser({
      client_id: currentUser.client_id,
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
      currentUser.client_id,
      businessName,
      inviteName.trim(),
      inviteEmail.trim().toLowerCase(),
      inviteRole
    );

    logClientPortalActivity({
      client_id: currentUser.client_id,
      user_id: currentUser.user_id,
      user_name: currentUser.name,
      activity_type: 'Approval Submitted',
      resource_type: 'auth',
      resource_id: currentUser.user_id,
      details: `Invited team member ${inviteName} as ${inviteRole}`,
    });

    setUsersList(getClientUsers(currentUser.client_id));
    setInviteSuccess(`Successfully invited ${inviteName} (${inviteEmail}) to the portal.`);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
    setTimeout(() => setInviteSuccess(null), 4000);
    onRefresh();
  };

  const handleRemoveUser = (targetUserId: string, targetName: string) => {
    if (targetUserId === currentUser.user_id) return;
    removeClientUser(targetUserId);
    setUsersList(getClientUsers(currentUser.client_id));
    onRefresh();
  };

  const handleDownloadInvoice = (invNum: string) => {
    logClientPortalActivity({
      client_id: currentUser.client_id,
      user_id: currentUser.user_id,
      user_name: currentUser.name,
      activity_type: 'File Downloaded',
      resource_type: 'document',
      resource_id: invNum,
      details: `Downloaded Invoice receipt #${invNum}`,
    });

    setInvoiceDownloadNotice(`Invoice receipt #${invNum} downloaded successfully.`);
    setTimeout(() => setInvoiceDownloadNotice(null), 3000);
  };

  const handleSavePreferences = () => {
    setPrefSavedNotice(true);
    setTimeout(() => setPrefSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Account, Team & Billing Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage authorized team access, view billing receipts, and configure notification preferences for {businessName}.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'profile', label: 'Company Profile', icon: Building2 },
            { id: 'team', label: 'Team Access', icon: Users },
            { id: 'billing', label: 'Billing & Retainer', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {inviteSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{inviteSuccess}</span>
        </div>
      )}

      {invoiceDownloadNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{invoiceDownloadNotice}</span>
        </div>
      )}

      {/* TAB 1: COMPANY PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Company Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Business Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {businessName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Industry</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Residential & Commercial Plumbing Services
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Address</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  1040 SW 5th Ave, Portland, OR 97204
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  (503) 555-0149
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Website</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  https://westcoastplumbing.com
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              Dedicated Agency Team
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  AI Sales & Client Concierge
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Sophia</div>
                <p className="text-[11px] text-slate-500">
                  Available 24/7 across your portal for report explanations and milestone guidance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Account Director
                </span>
                <div className="font-bold text-slate-900 dark:text-white">Marcus Vance</div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> marcus@marketingcharmagency.com
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Senior Technical Lead
                </span>
                <div className="font-bold text-slate-900 dark:text-white">Elena Rostova</div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> elena@marketingcharmagency.com
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM MANAGEMENT */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized Organization Users
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage members of {businessName} authorized to view reports, request services, and submit approvals.
              </p>
            </div>

            {isOwnerOrAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Team Member</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {usersList.map((user) => {
              const isSelf = user.user_id === currentUser.user_id;

              return (
                <div
                  key={user.user_id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-1.5 py-0.2 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{user.email}</span>
                        {user.title && <span>• {user.title}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        user.role === 'Client Owner'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200'
                          : user.role === 'Client Admin'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {user.role}
                    </span>

                    {isOwnerOrAdmin && !isSelf && user.role !== 'Client Owner' && (
                      <button
                        onClick={() => handleRemoveUser(user.user_id, user.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BILLING & RETAINER */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Active Plan Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Retainer & Billing Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Current Plan</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {billingInfo.current_plan}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Monthly Retainer</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  ${billingInfo.monthly_retainer.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mb-1">
                  Account Status
                </span>
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  {billingInfo.payment_status}
                </div>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Official Invoice Receipts
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {billingInfo.invoices.map((inv) => (
                <div
                  key={inv.invoice_number}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {inv.invoice_number}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200">
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Period: {inv.service_period} • Issued {inv.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ${inv.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(inv.invoice_number)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-indigo-500" />
                      <span>Receipt PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize how and when you receive milestone and report alerts from Marketing Charm Agency.
              </p>
            </div>

            {prefSavedNotice && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                id: 'report_notifications',
                title: 'Monthly Performance Reports',
                desc: 'Receive alerts when monthly growth and audit digests are published.',
              },
              {
                id: 'approval_notifications',
                title: 'Pending Approvals & Sign-Offs',
                desc: 'Alert when campaign creatives, website changes, or strategy decisions require your review.',
              },
              {
                id: 'service_updates',
                title: 'Active Service Milestone Updates',
                desc: 'Notifications when key technical or local search stages reach completion.',
              },
              {
                id: 'email_notifications',
                title: 'Email Digest Notifications',
                desc: 'Send matching summaries to your verified email address.',
              },
            ].map((pref) => (
              <div key={pref.id} className="pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {pref.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{pref.desc}</p>
                </div>

                <input
                  type="checkbox"
                  checked={(preferences as any)[pref.id]}
                  onChange={(e) => {
                    setPreferences({ ...preferences, [pref.id]: e.target.checked });
                    handleSavePreferences();
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Invite Team Member to Portal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grant team members access to {businessName}'s command center.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jessica Vance"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jessica@westcoastplumbing.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Portal Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ClientUserRole)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="Client Admin">Client Admin (Can approve items and invite users)</option>
                  <option value="Client Member">Client Member (View reports, submit requests)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
