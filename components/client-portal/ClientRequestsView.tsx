import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  X,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  ClientRequest,
  ClientPortalUser,
  ClientRequestCategory,
  ClientRequestPriority,
} from '../../types/clientPortal';
import { submitClientRequest } from '../../services/clientPortalService';

interface ClientRequestsViewProps {
  requests: ClientRequest[];
  currentUser: ClientPortalUser;
  businessName: string;
  onRefresh: () => void;
}

export const ClientRequestsView: React.FC<ClientRequestsViewProps> = ({
  requests,
  currentUser,
  businessName,
  onRefresh,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [category, setCategory] = useState<ClientRequestCategory>('Website Change');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ClientRequestPriority>('Medium');
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);

  const categories: ClientRequestCategory[] = [
    'Website Change',
    'Marketing Request',
    'New Campaign',
    'Support Request',
    'Question',
    'General Request',
  ];

  const priorities: ClientRequestPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    submitClientRequest(
      currentUser.client_id,
      {
        category,
        subject,
        description,
        priority,
      },
      currentUser
    );

    setSubject('');
    setDescription('');
    setShowNewModal(false);
    onRefresh();
  };

  const getStatusBadge = (status: ClientRequest['status']) => {
    switch (status) {
      case 'Completed':
      case 'Closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {status}
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'Under Review':
      case 'Received':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case 'Waiting for Client':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            Waiting for Your Reply
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (p: ClientRequestPriority) => {
    switch (p) {
      case 'Urgent':
        return <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">● Urgent</span>;
      case 'High':
        return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">● High</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-500">● {p}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client Request Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit website changes, creative adjustments, or support requests directly to the Marketing Charm Agency operations team.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Request</span>
        </button>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="p-6 hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors space-y-3 cursor-pointer"
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {req.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  {getPriorityBadge(req.priority)}
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Submitted by {req.submitted_by.name}
                  </span>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {req.subject}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {req.description}
              </p>

              {/* Agency response preview if available */}
              {req.agency_response && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-start gap-2.5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    Agency Update:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {req.agency_response}
                  </span>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No active requests submitted yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Submit New Agency Request
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically logged and routed to our dedicated account operations queue.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Request Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ClientRequestCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ClientRequestPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Update emergency weekend call forwarding number"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the changes or questions in detail. Include URLs, specific copy text, or instructions..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  Our account team responds within 1 business day. Urgent requests are flagged for immediate triage.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!subject.trim() || !description.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-600">
                    {selectedRequest.category}
                  </span>
                  <span>•</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedRequest.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.agency_response && (
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                    Agency Operations Response
                  </span>
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <p>{selectedRequest.agency_response}</p>
                    <div className="text-[10px] text-slate-400 mt-2">
                      Internal Task: #{selectedRequest.internal_task_id || 'N/A'} • Updated{' '}
                      {new Date(selectedRequest.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
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
