import React, { useState, useMemo } from 'react';
import {
  Mail,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  ChevronRight,
  Layers,
  ArrowUpDown,
  FileText,
  User,
  MapPin,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Lead, EmailDraft, EmailStatus, ActivityEvent } from '../types';
import {
  getEmailDrafts,
  deleteEmailDraft,
  markEmailPrepared,
  buildGmailComposeUrl,
  saveEmailDraft,
  generateSophiaEmail,
} from '../services/emailService';

interface EmailOutreachViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenEmailComposer: (lead: Lead) => void;
}

type FilterTab = 'all' | 'DRAFT' | 'PREPARED' | 'SENT' | 'REPLIED' | 'FAILED';

export const EmailOutreachView: React.FC<EmailOutreachViewProps> = ({
  leads,
  onSelectLead,
  onOpenEmailComposer,
}) => {
  const [drafts, setDrafts] = useState<EmailDraft[]>(() => getEmailDrafts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all');
  const [previewDraft, setPreviewDraft] = useState<EmailDraft | null>(null);

  // Bulk preparation state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSelectedLeadIds, setBulkSelectedLeadIds] = useState<string[]>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const reloadDrafts = () => {
    setDrafts(getEmailDrafts());
  };

  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this email draft?')) {
      deleteEmailDraft(draftId);
      reloadDrafts();
      if (previewDraft?.id === draftId) setPreviewDraft(null);
    }
  };

  const handleOpenInGmail = (e: React.MouseEvent, draft: EmailDraft) => {
    e.stopPropagation();
    if (!draft.recipient || !draft.recipient.includes('@')) {
      alert('This draft does not have a verified recipient email address.');
      return;
    }
    const lead = leads.find((l) => l.lead_id === draft.lead_id);
    if (lead) {
      markEmailPrepared(draft, lead);
      reloadDrafts();
    }
    const gmailUrl = buildGmailComposeUrl(draft.recipient, draft.subject, draft.body);
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  // Filtered drafts list
  const filteredDrafts = useMemo(() => {
    return drafts.filter((d) => {
      // Filter by tab status
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'DRAFT' && d.status !== 'DRAFT' && d.status !== 'GENERATED') {
          return false;
        }
        if (selectedFilter !== 'DRAFT' && d.status !== selectedFilter) {
          return false;
        }
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.business_name.toLowerCase().includes(q) ||
          d.recipient.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.niche?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [drafts, selectedFilter, searchQuery]);

  // Lead candidates for bulk generation (leads with email that don't have a draft yet)
  const availableBulkCandidates = useMemo(() => {
    const existingLeadIds = new Set(drafts.map((d) => d.lead_id));
    return leads.filter((l) => l.email && l.email.includes('@') && !existingLeadIds.has(l.lead_id));
  }, [leads, drafts]);

  const handleStartBulkGeneration = async () => {
    if (bulkSelectedLeadIds.length === 0) return;
    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: bulkSelectedLeadIds.length });

    const selectedLeads = leads.filter((l) => bulkSelectedLeadIds.includes(l.lead_id));

    for (let i = 0; i < selectedLeads.length; i++) {
      const targetLead = selectedLeads[i];
      try {
        const gen = await generateSophiaEmail(targetLead);
        saveEmailDraft({
          lead_id: targetLead.lead_id,
          business_name: targetLead.business_name,
          contact_name: targetLead.contact_name,
          recipient: targetLead.email || '',
          subject: gen.subject,
          subject_options: gen.subject_options,
          body: gen.body,
          email_type: gen.email_type,
          personalization_level: gen.personalization_level,
          key_opportunity: gen.key_opportunity,
          suggested_cta: gen.suggested_cta,
          lead_score: targetLead.lead_score,
          niche: targetLead.niche,
          city: targetLead.city,
          status: 'DRAFT',
        });
      } catch (e) {
        console.error('Bulk generation error on lead', targetLead.business_name, e);
      }
      setBulkProgress({ current: i + 1, total: selectedLeads.length });
    }

    setIsBulkGenerating(false);
    setIsBulkModalOpen(false);
    setBulkSelectedLeadIds([]);
    reloadDrafts();
  };

  const getStatusBadge = (status: EmailStatus) => {
    switch (status) {
      case 'PREPARED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            PREPARED
          </span>
        );
      case 'SENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Send className="w-3 h-3" />
            SENT
          </span>
        );
      case 'REPLIED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            REPLIED
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            FAILED
          </span>
        );
      case 'DRAFT':
      case 'GENERATED':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Email Outreach Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Sophia AI Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review Sophia-crafted cold emails, manage draft queues, and dispatch directly into Gmail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Prepare Drafts</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Total Stored Drafts</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">{drafts.length}</div>
          <div className="text-[11px] text-slate-500">Ready for review or dispatch</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Prepared in Gmail</span>
            <ExternalLink className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {drafts.filter((d) => d.status === 'PREPARED').length}
          </div>
          <div className="text-[11px] text-slate-500">Dispatched to Gmail tab</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Verified Lead Emails</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {leads.filter((l) => l.email && l.email.includes('@')).length}
          </div>
          <div className="text-[11px] text-slate-500">Available from Oregon CCB dataset</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>High Personalization</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {drafts.filter((d) => d.personalization_level === 'High').length}
          </div>
          <div className="text-[11px] text-slate-500">Grounded in CCB &amp; GMB data</div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
          {(['all', 'DRAFT', 'PREPARED', 'SENT', 'REPLIED'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === tab
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all'
                ? `All (${drafts.length})`
                : tab === 'DRAFT'
                ? `Drafts (${drafts.filter((d) => d.status === 'DRAFT' || d.status === 'GENERATED').length})`
                : tab === 'PREPARED'
                ? `Prepared (${drafts.filter((d) => d.status === 'PREPARED').length})`
                : tab === 'SENT'
                ? `Sent (${drafts.filter((d) => d.status === 'SENT').length})`
                : `Replied (${drafts.filter((d) => d.status === 'REPLIED').length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business, email, subject..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* EMAIL DRAFTS TABLE */}
      {filteredDrafts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-white">No Email Drafts Found</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? 'No drafts match your search query.'
              : 'Open any lead detail page to craft a personalized email with Sophia, or use "Bulk Prepare Drafts" above to prepare uncontacted leads.'}
          </p>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Drafts with Sophia</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Business &amp; Recipient</th>
                  <th className="py-3.5 px-4">Subject &amp; Intent</th>
                  <th className="py-3.5 px-4">Location &amp; Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDrafts.map((draft) => {
                  const lead = leads.find((l) => l.lead_id === draft.lead_id);
                  return (
                    <tr
                      key={draft.id}
                      onClick={() => setPreviewDraft(draft)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {draft.business_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          {draft.recipient ? (
                            <span>{draft.recipient}</span>
                          ) : (
                            <span className="text-amber-400/90 italic">No verified email</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-200 truncate" title={draft.subject}>
                          {draft.subject || 'No subject'}
                        </div>
                        <div className="text-[10px] text-indigo-300 flex items-center gap-1 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 border border-indigo-800/50">
                            {draft.email_type}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{draft.personalization_level} Personalization</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium">
                          {draft.city || 'Oregon'}, OR
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Score: <strong className="text-indigo-300">{draft.lead_score || 88}</strong>
                        </div>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(draft.status)}</td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(draft.updated_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Open in Email Composer"
                            onClick={() => {
                              if (lead) onOpenEmailComposer(lead);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Open in Gmail Compose"
                            onClick={(e) => handleOpenInGmail(e, draft)}
                            disabled={!draft.recipient || !draft.recipient.includes('@')}
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white transition-all disabled:opacity-40"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Delete Draft"
                            onClick={(e) => handleDeleteDraft(e, draft.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRAFT PREVIEW MODAL */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-white">{previewDraft.business_name}</h3>
                <p className="text-xs text-slate-400">Email Draft Preview • {previewDraft.status}</p>
              </div>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">To: </span>
                  <span className="text-white font-mono">{previewDraft.recipient || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Subject: </span>
                  <span className="text-white font-medium">{previewDraft.subject}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-indigo-300">
                  <span>Type: {previewDraft.email_type}</span>
                  <span>•</span>
                  <span>Personalization: {previewDraft.personalization_level}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm font-sans whitespace-pre-wrap leading-relaxed">
                {previewDraft.body}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950">
              <button
                onClick={() => {
                  const lead = leads.find((l) => l.lead_id === previewDraft.lead_id);
                  if (lead) {
                    setPreviewDraft(null);
                    onOpenEmailComposer(lead);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit in Composer</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDraft(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={(e) => handleOpenInGmail(e, previewDraft)}
                  disabled={!previewDraft.recipient || !previewDraft.recipient.includes('@')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Gmail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK EMAIL PREPARATION MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bulk Email Preparation</h3>
                  <p className="text-xs text-slate-400">Generate personalized Sophia drafts without sending</p>
                </div>
              </div>
              {!isBulkGenerating && (
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Individual AI Personalization</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-300/80">
                  Sophia analyzes each contractor's specific CCB registration, Google Maps standing, and review count individually. Emails are saved as <strong>DRAFT</strong> for manual review.
                </p>
              </div>

              {isBulkGenerating ? (
                <div className="p-8 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-white">
                    Generating Drafts with Sophia ({bulkProgress.current}/{bulkProgress.total})
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 transition-all duration-300"
                      style={{
                        width: `${(bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Applying safe grounding directives and tailoring outreach angles...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Eligible Leads with Verified Email ({availableBulkCandidates.length})
                    </span>
                    <button
                      onClick={() => {
                        if (bulkSelectedLeadIds.length === availableBulkCandidates.length) {
                          setBulkSelectedLeadIds([]);
                        } else {
                          setBulkSelectedLeadIds(availableBulkCandidates.map((l) => l.lead_id));
                        }
                      }}
                      className="text-indigo-400 hover:underline font-medium"
                    >
                      {bulkSelectedLeadIds.length === availableBulkCandidates.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800/60 bg-slate-950/40">
                    {availableBulkCandidates.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        All verified email leads already have active drafts created!
                      </div>
                    ) : (
                      availableBulkCandidates.map((l) => (
                        <label
                          key={l.lead_id}
                          className="flex items-center gap-3 p-3 hover:bg-slate-800/40 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={bulkSelectedLeadIds.includes(l.lead_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelectedLeadIds((prev) => [...prev, l.lead_id]);
                              } else {
                                setBulkSelectedLeadIds((prev) => prev.filter((id) => id !== l.lead_id));
                              }
                            }}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">{l.business_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">{l.email}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                              {l.lead_score || 88}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {!isBulkGenerating && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
                <span className="text-xs text-slate-400">
                  {bulkSelectedLeadIds.length} leads selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartBulkGeneration}
                    disabled={bulkSelectedLeadIds.length === 0}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {bulkSelectedLeadIds.length} Drafts</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
