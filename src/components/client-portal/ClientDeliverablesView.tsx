import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  RotateCcw,
  MessageSquare,
  Eye,
  AlertCircle,
  Filter,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import { ClientDeliverable, ClientPortalUser } from '../../types/clientPortal';
import {
  addDeliverableComment,
  updateDeliverableStatus,
  logClientPortalActivity,
} from '../../services/clientPortalService';

interface ClientDeliverablesViewProps {
  deliverables: ClientDeliverable[];
  currentUser: ClientPortalUser;
  onRefresh: () => void;
}

export const ClientDeliverablesView: React.FC<ClientDeliverablesViewProps> = ({
  deliverables,
  currentUser,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedDeliverable, setSelectedDeliverable] = useState<ClientDeliverable | null>(null);
  const [commentText, setCommentText] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const filteredDeliverables = deliverables.filter((d) => {
    if (filterStatus === 'All') return true;
    return d.status === filterStatus;
  });

  const handleApprove = (deliverable: ClientDeliverable) => {
    updateDeliverableStatus(deliverable.deliverable_id, 'Approved', currentUser);
    addDeliverableComment(
      deliverable.deliverable_id,
      currentUser,
      `Deliverable approved by ${currentUser.name} (${currentUser.role}).`
    );
    if (selectedDeliverable?.deliverable_id === deliverable.deliverable_id) {
      setSelectedDeliverable({ ...selectedDeliverable, status: 'Approved' });
    }
    onRefresh();
  };

  const handleRequestRevision = (deliverable: ClientDeliverable) => {
    if (!revisionNotes.trim()) return;
    updateDeliverableStatus(deliverable.deliverable_id, 'Revision Requested', currentUser);
    addDeliverableComment(
      deliverable.deliverable_id,
      currentUser,
      `Revision Requested: ${revisionNotes}`
    );
    setShowRevisionModal(false);
    setRevisionNotes('');
    if (selectedDeliverable?.deliverable_id === deliverable.deliverable_id) {
      setSelectedDeliverable({ ...selectedDeliverable, status: 'Revision Requested' });
    }
    onRefresh();
  };

  const handleAddComment = () => {
    if (!selectedDeliverable || !commentText.trim()) return;
    const updated = addDeliverableComment(
      selectedDeliverable.deliverable_id,
      currentUser,
      commentText
    );
    if (updated) {
      setSelectedDeliverable({ ...updated });
    }
    setCommentText('');
    onRefresh();
  };

  const handleDownload = (deliverable: ClientDeliverable) => {
    logClientPortalActivity({
      client_id: deliverable.client_id,
      user_id: currentUser.user_id,
      user_name: currentUser.name,
      activity_type: 'File Downloaded',
      resource_type: 'deliverable' as any,
      resource_id: deliverable.deliverable_id,
      details: `Downloaded deliverable "${deliverable.title}" (${deliverable.file_size})`,
    });
    setDownloadNotice(`Initiated secure download for "${deliverable.title}".`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const getStatusBadge = (status: ClientDeliverable['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'Ready for Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Ready for Review
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Revision Requested
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client Deliverables Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review completed work, download official creative blueprints, and submit sign-offs or revision notes.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Ready for Review', 'In Progress', 'Delivered', 'Approved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {downloadNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {downloadNotice}
          </span>
          <button onClick={() => setDownloadNotice(null)} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDeliverables.map((del) => (
          <div
            key={del.deliverable_id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {del.service_name}
                </span>
                {getStatusBadge(del.status)}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {del.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {del.summary}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1 font-mono">
                  <FileText className="w-3.5 h-3.5" />
                  {del.file_type} ({del.file_size})
                </span>
                <span>•</span>
                <span>Published: {del.date}</span>
                {del.comments.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <MessageSquare className="w-3 h-3 text-indigo-500" />
                      {del.comments.length} comment{del.comments.length > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDeliverable(del)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleDownload(del)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Download</span>
                </button>
              </div>

              {/* Review actions if ready */}
              {del.status === 'Ready for Review' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDeliverable(del);
                      setShowRevisionModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold transition-colors"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleApprove(del)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Deliverable Details Modal */}
      {selectedDeliverable && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedDeliverable.service_name}
                  </span>
                  <span>•</span>
                  {getStatusBadge(selectedDeliverable.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDeliverable.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Deliverable Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedDeliverable.summary}
                </p>
              </div>

              {/* File Specs & Download */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedDeliverable.file_type}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Size: {selectedDeliverable.file_size} • Published {selectedDeliverable.date}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(selectedDeliverable)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>

              {/* Comments Thread */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Feedback & Discussion ({selectedDeliverable.comments.length})
                </h4>

                <div className="space-y-3 mb-4">
                  {selectedDeliverable.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-xl text-xs ${
                        comment.author_role === 'Client'
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 ml-4'
                          : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {comment.author_name} ({comment.author_role})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {comment.message}
                      </p>
                    </div>
                  ))}
                  {selectedDeliverable.comments.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      No comments yet on this deliverable.
                    </p>
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment();
                    }}
                    placeholder="Add feedback or question regarding this deliverable..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Post</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Review Controls */}
            {selectedDeliverable.status === 'Ready for Review' && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs font-semibold"
                >
                  Request Revision
                </button>
                <button
                  onClick={() => handleApprove(selectedDeliverable)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Deliverable</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && selectedDeliverable && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              Request Revision on Deliverable
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please specify the revisions or changes you would like our team to make on "
              {selectedDeliverable.title}".
            </p>

            <textarea
              rows={4}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Detail the adjustments required (e.g., update phone number, add Beaverton zip codes, refine headline copy)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestRevision(selectedDeliverable)}
                disabled={!revisionNotes.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
