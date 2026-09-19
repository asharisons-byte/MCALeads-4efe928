import React, { useState } from 'react';
import {
  AuditReport,
  AuditFinding,
  AuditSeverity,
  Lead,
} from '../types';
import { updateAuditStatus, prepareAuditEmailDraft } from '../services/conversionService';
import {
  X,
  FileCheck,
  Printer,
  Mail,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';

interface AuditDetailModalProps {
  audit: AuditReport;
  lead?: Lead;
  onClose: () => void;
  onUpdate: () => void;
  onCreateProposal: (audit: AuditReport) => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  audit,
  lead,
  onClose,
  onUpdate,
  onCreateProposal,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'email_preview'>('report');
  const [emailSubject, setEmailSubject] = useState(
    lead ? prepareAuditEmailDraft(lead, audit).subject : `Digital Growth Audit for ${audit.business_name}`
  );
  const [emailBody, setEmailBody] = useState(
    lead ? prepareAuditEmailDraft(lead, audit).body : `Hi ${audit.business_name} team,\n\nAttached is your digital audit.`
  );
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Critical Issue
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            Informational
          </span>
        );
    }
  };

  const scorecardItems = [
    { label: 'Website Experience', val: audit.digital_scorecard.website },
    { label: 'Local SEO & Keywords', val: audit.digital_scorecard.seo },
    { label: 'Google Business Profile', val: audit.digital_scorecard.google_business_profile },
    { label: 'Reviews & Reputation', val: audit.digital_scorecard.reviews },
    { label: 'Performance (PageSpeed)', val: audit.digital_scorecard.performance },
    { label: 'Tracking & Analytics', val: audit.digital_scorecard.tracking },
    { label: 'Paid Advertising', val: audit.digital_scorecard.advertising },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      updateAuditStatus(audit.audit_id, 'Sent');
      setIsSending(false);
      setSendSuccess(true);
      onUpdate();
      setTimeout(() => setSendSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{audit.business_name}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                  v{audit.version}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    audit.status === 'Sent'
                      ? 'bg-emerald-100 text-emerald-800'
                      : audit.status === 'Reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {audit.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Marketing Charm Agency • Digital Audit • Generated by {audit.generated_by}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'report' ? 'email_preview' : 'report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                activeTab === 'email_preview'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              {activeTab === 'email_preview' ? 'View Report' : 'Email to Client'}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors title='Print Audit'"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'email_preview' ? (
            /* EMAIL COMPOSER & PREVIEW (Human in the loop approval) */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">Human-In-The-Loop Approval</p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Sophia has generated this audit email draft based strictly on verified findings. Review and adjust below before delivering. No emails are ever sent automatically without your explicit action.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={lead?.email || ''}
                  disabled
                  placeholder="prospect@business.com"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={10}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">
                  Attachment: <span className="font-medium text-slate-700">Marketing_Charm_Agency_Audit_v{audit.version}.pdf</span> (simulated delivery)
                </p>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending || sendSuccess}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Audit...
                    </>
                  ) : sendSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Audit Delivered!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Approve & Send Audit
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* FULL AUDIT REPORT VIEW */
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Sophia AI Executive Summary
                  </div>
                  <span className="text-xs text-slate-400">
                    Coverage: {audit.digital_scorecard.audit_coverage_pct}% of channels audited
                  </span>
                </div>

                <div className="text-base font-medium text-slate-100 leading-relaxed">
                  {audit.executive_summary.digital_growth_opportunity}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                      Top Verified Priority
                    </span>
                    <p className="text-sm font-medium text-white">{audit.executive_summary.top_priority}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                      Recommended Agency Solution
                    </span>
                    <p className="text-sm font-medium text-white">
                      {audit.executive_summary.recommended_agency_solution}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <strong className="text-white">Why It Matters: </strong>
                  {audit.executive_summary.why_it_matters}
                </div>
              </div>

              {/* Digital Scorecard */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Digital Channel Scorecard
                    </h3>
                    <p className="text-xs text-slate-500">
                      Scores computed strictly from verified crawl data. Channels without verifiable data are marked as "Not Audited".
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Overall Opportunity</span>
                    <span className="text-xl font-extrabold text-amber-600">
                      {typeof audit.digital_scorecard.overall_opportunity === 'number'
                        ? `${audit.digital_scorecard.overall_opportunity}/100`
                        : 'Not Audited'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {scorecardItems.map((item) => {
                    const isAudited = typeof item.val === 'number';
                    const score = isAudited ? (item.val as number) : 0;
                    return (
                      <div
                        key={item.label}
                        className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <span className="text-xs font-medium text-slate-600 mb-2">{item.label}</span>
                        <div>
                          {isAudited ? (
                            <>
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="text-lg font-bold text-slate-900">{score}</span>
                                <span className="text-xs text-slate-400">/100</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    score >= 75
                                      ? 'bg-emerald-500'
                                      : score >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 py-1">
                              <HelpCircle className="w-3.5 h-3.5" />
                              Not Audited
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified Findings Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Verified Findings & Opportunity Matrix ({audit.findings.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Factual Evidence → Business Impact → Recommended Action
                  </span>
                </div>

                <div className="space-y-3">
                  {audit.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                            {finding.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{finding.issue}</h4>
                        </div>
                        {getSeverityBadge(finding.severity)}
                      </div>

                      {/* Evidence */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">VERIFIED FINDING: </strong>
                        {finding.evidence.replace('VERIFIED FINDING:', '').trim()}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-amber-50/50 border border-amber-100 text-amber-900">
                          <strong className="text-amber-950">POTENTIAL BUSINESS IMPACT: </strong>
                          {finding.potential_business_impact}
                        </div>
                        <div className="p-2 rounded bg-blue-50/50 border border-blue-100 text-blue-900 flex items-center justify-between">
                          <div>
                            <strong className="text-blue-950">RECOMMENDED ACTION: </strong>
                            {finding.recommended_service}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Action Checklist */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recommended Remediation Sequence
                </h3>
                <div className="space-y-2">
                  {audit.priority_actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-sm text-slate-800"
                    >
                      <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment Range & Agency Guardrail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Estimated Agency Investment
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    {audit.estimated_agency_investment.monthly_retainer_range}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Setup Fee: {audit.estimated_agency_investment.setup_fee_range}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Agency Standard of Truth
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Marketing Charm Agency does not promise guaranteed search rankings or revenue figures. All findings reflect verified crawl data; business impacts are cautious estimates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Audit ID: <span className="font-mono text-slate-700">{audit.audit_id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onCreateProposal(audit);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 transition-all"
            >
              <Award className="w-4 h-4" />
              Generate Proposal from Audit
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
