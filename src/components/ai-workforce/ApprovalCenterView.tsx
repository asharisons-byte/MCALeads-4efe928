import React, { useState } from 'react';
import {
  AIApproval,
  AIApprovalStatus,
  AIApprovalActionType,
} from '../../types/aiWorkforce';
import {
  approveAIApproval,
  rejectAIApproval,
  editAndApproveAIApproval,
} from '../../services/aiWorkforceService';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  DollarSign,
  Send,
  History,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface ApprovalCenterViewProps {
  approvals: AIApproval[];
  onApprovalsUpdated: () => void;
  onOpenEmailComposer?: (leadId: string) => void;
  onOpenSMSComposer?: (leadId: string) => void;
}

export const ApprovalCenterView: React.FC<ApprovalCenterViewProps> = ({
  approvals,
  onApprovalsUpdated,
  onOpenEmailComposer,
  onOpenSMSComposer,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [editingApproval, setEditingApproval] = useState<AIApproval | null>(null);
  const [rejectingApproval, setRejectingApproval] = useState<AIApproval | null>(null);
  const [inspectingApproval, setInspectingApproval] = useState<AIApproval | null>(null);

  // Edit draft state
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Reject reason
  const [rejectReason, setRejectReason] = useState('');

  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const historyApprovals = approvals.filter((a) => a.status !== 'Pending');

  const handleApprove = (approval: AIApproval) => {
    approveAIApproval(approval.approval_id, 'MCA Lead Agency Staff');
    onApprovalsUpdated();
  };

  const handleOpenEdit = (approval: AIApproval) => {
    const payload = approval.current_content || approval.proposed_content;
    setEditingApproval(approval);
    setEditSubject(payload.subject || '');
    setEditBody(payload.body || payload.message || payload.text || '');
    setEditNotes('');
  };

  const handleSaveEdit = () => {
    if (!editingApproval) return;
    editAndApproveAIApproval(
      editingApproval.approval_id,
      {
        ...editingApproval.proposed_content,
        subject: editSubject,
        body: editBody,
        message: editBody,
        text: editBody,
      },
      editNotes || 'Edited and customized by agency staff',
      'MCA Lead Agency Staff'
    );
    setEditingApproval(null);
    onApprovalsUpdated();
  };

  const handleConfirmReject = () => {
    if (!rejectingApproval) return;
    rejectAIApproval(rejectingApproval.approval_id, rejectReason || 'Not aligned with current agency strategy');
    setRejectingApproval(null);
    setRejectReason('');
    onApprovalsUpdated();
  };

  const getActionIcon = (actionType: AIApprovalActionType) => {
    switch (actionType) {
      case 'Email Ready to Send':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'SMS Ready to Send':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'AI Call Ready':
        return <Phone className="w-4 h-4 text-sky-400" />;
      case 'Proposal Ready':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'Pricing Recommendation':
        return <DollarSign className="w-4 h-4 text-rose-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">AI Governance & Approval Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Human-in-the-loop control tower for Marketing Charm Agency. By strict agency policy, outbound emails,
            SMS messages, proposals, and pricing recommendations cannot be dispatched without explicit human sign-off.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/60 px-3.5 py-2 rounded-lg text-center">
            <div className="text-base font-bold text-amber-400">{pendingApprovals.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Pending Approvals</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-3.5 py-2 rounded-lg text-center">
            <div className="text-base font-bold text-emerald-400">
              {historyApprovals.filter((a) => a.status === 'Approved' || a.status === 'Modified').length}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Approved Today</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Pending Approvals</span>
          {pendingApprovals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Approval Audit Log ({historyApprovals.length})</span>
        </button>
      </div>

      {/* Tab Content: Pending */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All Clear — No Pending Approvals</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                The AI Workforce is running smoothly. New outbound prospect outreach, proposals, or pricing actions will appear here for staff review.
              </p>
            </div>
          ) : (
            pendingApprovals.map((approval) => {
              const payload = approval.current_content || approval.proposed_content;
              return (
                <div
                  key={approval.approval_id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all space-y-4"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                        {getActionIcon(approval.action_type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-white text-sm">{approval.title}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Requires Sign-off
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Generated by <strong className="capitalize text-indigo-400">{approval.agent_id}</strong> • Target Entity: {approval.related_entity_name} ({approval.related_entity_type})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setInspectingApproval(approval)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Evidence & Rules</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(approval)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Draft</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectingApproval(approval);
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(approval)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>

                  {/* Draft Preview Box */}
                  <div className="bg-slate-850 bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 space-y-2">
                    {payload.subject && (
                      <div className="text-xs text-slate-300 pb-2 border-b border-slate-700/50">
                        <span className="text-slate-500 font-semibold uppercase mr-2">Subject:</span>
                        <strong className="text-white">{payload.subject}</strong>
                      </div>
                    )}
                    <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {payload.body || payload.message || payload.text || JSON.stringify(payload, null, 2)}
                    </div>
                  </div>

                  {/* Footer Rules & Evidence Mini-summary */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Triggered Policy:</span>
                      <span className="text-slate-300 font-medium">
                        {approval.rules_triggered[0] || 'Mandatory human verification policy'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span>Confidence: <strong className="text-indigo-300">{approval.confidence}</strong></span>
                      <span>Requested: {new Date(approval.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Reviewed By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {historyApprovals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No historical approvals recorded yet.
                  </td>
                </tr>
              ) : (
                historyApprovals.map((app) => (
                  <tr key={app.approval_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                      {getActionIcon(app.action_type)}
                      <span>{app.action_type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{app.related_entity_name}</td>
                    <td className="py-3 px-4 capitalize text-indigo-400">{app.agent_id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          app.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'Modified'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{app.reviewed_by || 'Staff'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {app.reviewed_at ? new Date(app.reviewed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 line-clamp-1 max-w-xs">
                      {app.feedback_notes || app.final_action || 'Approved'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Draft Modal */}
      {editingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full text-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Edit AI-Generated Draft</h3>
                <p className="text-xs text-slate-400">
                  Modifying {editingApproval.action_type} for {editingApproval.related_entity_name}
                </p>
              </div>
              <button onClick={() => setEditingApproval(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {editingApproval.proposed_content?.subject !== undefined && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Message Body
                </label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-sans focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Revision Notes (saved for AI quality feedback)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adjusted tone, added reference to emergency weekend calls..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end space-x-2">
              <button
                onClick={() => setEditingApproval(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Save & Approve Modified Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full text-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Reject AI Recommendation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rejecting {rejectingApproval.action_type} for {rejectingApproval.related_entity_name}
              </p>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-300">
                Please specify a rejection reason. This feedback will be recorded in the AI Quality Feedback Loop to
                refine future agent prompt parameters.
              </p>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Contractor already indicated they don't do residential repiping..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end space-x-2">
              <button
                onClick={() => setRejectingApproval(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Evidence Modal */}
      {inspectingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full text-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Evidence & Governance Policies</h3>
                <p className="text-xs text-slate-400">{inspectingApproval.title}</p>
              </div>
              <button onClick={() => setInspectingApproval(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div>
                <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1">
                  Triggered Security & Quality Rules
                </h4>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1">
                  {inspectingApproval.rules_triggered.map((rule, i) => (
                    <div key={i} className="flex items-center space-x-2 text-amber-300">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1">
                  Verified Data Evidence
                </h4>
                <ul className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                  {inspectingApproval.evidence_summary.map((ev, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-300">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Confidence Assessment: <strong className="text-indigo-300">{inspectingApproval.confidence}</strong></span>
                <span>Approval ID: {inspectingApproval.approval_id}</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                onClick={() => setInspectingApproval(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
