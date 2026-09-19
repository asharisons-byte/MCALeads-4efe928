import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  History,
  Sparkles,
  Info,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { ClientApproval, ClientPortalUser } from '../../types/clientPortal';
import { respondToClientApproval } from '../../services/clientPortalService';

interface ClientApprovalsViewProps {
  approvals: ClientApproval[];
  currentUser: ClientPortalUser;
  businessName: string;
  onRefresh: () => void;
}

export const ClientApprovalsView: React.FC<ClientApprovalsViewProps> = ({
  approvals,
  currentUser,
  businessName,
  onRefresh,
}) => {
  const [selectedApproval, setSelectedApproval] = useState<ClientApproval | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [actionType, setActionType] = useState<'Approve' | 'Request Changes' | 'Reject'>('Approve');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const historyApprovals = approvals.filter((a) => a.status !== 'Pending');

  const openActionModal = (
    appr: ClientApproval,
    type: 'Approve' | 'Request Changes' | 'Reject'
  ) => {
    setSelectedApproval(appr);
    setActionType(type);
    setFeedbackNote('');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (!selectedApproval) return;
    respondToClientApproval(selectedApproval.approval_id, actionType, currentUser, feedbackNote);
    setShowConfirmModal(false);
    setSelectedApproval(null);
    onRefresh();
  };

  const getStatusBadge = (status: ClientApproval['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Changes Requested
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {pendingApprovals.length} Pending Sign-Off
              {pendingApprovals.length === 1 ? '' : 's'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client Approval Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review proposed campaign changes, ad creatives, budget adjustments, or strategic plans for {businessName}.
          </p>
        </div>
      </div>

      {/* Pending Items Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending Approvals Awaiting Decision
        </h3>

        {pendingApprovals.map((appr) => (
          <div
            key={appr.approval_id}
            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200/80 dark:border-amber-900/60 p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {appr.category}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {appr.title}
                </h4>
                <span className="text-[11px] text-slate-400">
                  Requested on {new Date(appr.requested_at).toLocaleDateString()}
                </span>
              </div>
              <div>{getStatusBadge(appr.status)}</div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {appr.description}
            </p>

            {appr.supporting_info && (
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>{appr.supporting_info}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => openActionModal(appr, 'Reject')}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => openActionModal(appr, 'Request Changes')}
                className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs font-semibold transition-colors"
              >
                Request Changes
              </button>
              <button
                onClick={() => openActionModal(appr, 'Approve')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        ))}

        {pendingApprovals.length === 0 && (
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-6 text-center text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>All items are approved and up to date! No pending sign-offs.</span>
          </div>
        )}
      </div>

      {/* Decision History Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          Approval Decision Audit History
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {historyApprovals.map((appr) => (
            <div key={appr.approval_id} className="p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {appr.title}
                  </span>
                  <span className="text-[11px] text-slate-400">({appr.category})</span>
                </div>
                <div>{getStatusBadge(appr.status)}</div>
              </div>

              {appr.client_feedback && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  Feedback Note: "{appr.client_feedback}"
                </p>
              )}

              {/* History log */}
              <div className="pt-2 space-y-1">
                {appr.history.map((h, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {h.action}
                    </span>
                    <span>by {h.user_name}</span>
                    <span>• {new Date(h.timestamp).toLocaleDateString()}</span>
                    {h.note && <span>— "{h.note}"</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {historyApprovals.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No historical approvals recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation & Feedback Modal */}
      {showConfirmModal && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirm {actionType}: {selectedApproval.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are recording an authorized client decision for {businessName}. This decision will be stamped with your name ({currentUser.name}) and role ({currentUser.role}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional Feedback or Directives for the Agency Team:
              </label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Add instructions, approved budget ceilings, or specific notes..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm ${
                  actionType === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'Request Changes'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
