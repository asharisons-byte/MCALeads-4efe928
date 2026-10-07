import React, { useState } from 'react';
import {
  Proposal,
  ProposalStatus,
  Lead,
  AuditReport,
  ServiceItem,
} from '../types';
import {
  updateProposalStatus,
  createNewProposalVersion,
  calculateProposalPricing,
  generateNegotiationAdvice,
  markProposalAccepted,
  convertToWonClient,
  prepareProposalEmailDraft,
  ALL_AGENCY_SERVICES,
} from '../services/conversionService';
import {
  X,
  Printer,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  FileText,
  Sliders,
  MessageSquare,
  History,
  Award,
  ChevronRight,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Lock,
} from 'lucide-react';

interface ProposalDetailModalProps {
  proposal: Proposal;
  lead?: Lead;
  audit?: AuditReport;
  onClose: () => void;
  onUpdate: () => void;
  onConvertedToClient?: () => void;
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  proposal,
  lead,
  audit,
  onClose,
  onUpdate,
  onConvertedToClient,
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'pricing_builder' | 'negotiation' | 'version_history' | 'email_delivery'>('document');

  // Pricing & Services editing state
  const [services, setServices] = useState<ServiceItem[]>(proposal.services || []);
  const [setupFee, setSetupFee] = useState<number>(proposal.pricing.setup_fee || 500);
  const [contractMonths, setContractMonths] = useState<number>(proposal.pricing.contract_length_months || 6);
  const [discount, setDiscount] = useState<number>(proposal.pricing.discount || 0);
  const [versionNote, setVersionNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Negotiation state
  const [objectionText, setObjectionText] = useState<string>('');
  const [targetBudget, setTargetBudget] = useState<string>('');
  const [negotiationResult, setNegotiationResult] = useState(proposal.negotiation_intelligence || null);

  // Won Client Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [confirmRetainer, setConfirmRetainer] = useState<number>(proposal.pricing.monthly_retainer);
  const [confirmSetup, setConfirmSetup] = useState<number>(proposal.pricing.setup_fee);
  const [confirmContract, setConfirmContract] = useState<string>(proposal.contract_length || '6 Months');
  const [confirmStartDate, setConfirmStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Email Delivery State
  const emailDraft = lead ? prepareProposalEmailDraft(lead, proposal) : { subject: '', body: '', recipient: '' };
  const [emailSubject, setEmailSubject] = useState(emailDraft.subject);
  const [emailBody, setEmailBody] = useState(emailDraft.body);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Re-calculate current pricing
  const currentPricing = calculateProposalPricing(services, setupFee, discount, contractMonths);

  const handleToggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleAddCatalogService = (catService: (typeof ALL_AGENCY_SERVICES)[0]) => {
    if (services.some((s) => s.id === catService.id)) return;
    setServices((prev) => [...prev, { ...catService, selected: true }]);
  };

  const handleRemoveService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleSaveNewVersion = () => {
    const updated = createNewProposalVersion(
      proposal.proposal_id,
      {
        services,
        pricing: currentPricing,
        monthly_retainer: currentPricing.monthly_retainer,
        setup_fee: currentPricing.setup_fee,
        contract_length: `${currentPricing.contract_length_months} Months`,
      },
      versionNote || `Adjusted package scope and retainer to $${currentPricing.monthly_retainer}/mo`
    );

    if (updated) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onUpdate();
    }
  };

  const handleAnalyzeObjection = () => {
    if (!objectionText.trim()) return;
    const budgetNum = targetBudget ? Number(targetBudget) : undefined;
    const advice = generateNegotiationAdvice(proposal, objectionText, budgetNum);
    setNegotiationResult(advice);
    onUpdate();
  };

  const handleApplyAlternativePackage = () => {
    if (!negotiationResult?.alternative_package) return;
    const alt = negotiationResult.alternative_package;
    setSetupFee(alt.revised_setup_fee);
    // Adjust retainer by updating services or setting proportional pricing
    createNewProposalVersion(
      proposal.proposal_id,
      {
        pricing: {
          ...currentPricing,
          monthly_retainer: alt.revised_retainer,
          setup_fee: alt.revised_setup_fee,
          recurring_monthly_cost: alt.revised_retainer,
          total_first_month: alt.revised_retainer + alt.revised_setup_fee,
        },
        monthly_retainer: alt.revised_retainer,
        setup_fee: alt.revised_setup_fee,
      },
      `Applied Sophia negotiation compromise: ${alt.name}`
    );
    onUpdate();
    setActiveTab('document');
  };

  const handleSendProposalEmail = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      updateProposalStatus(proposal.proposal_id, 'Sent');
      setIsSendingEmail(false);
      setEmailSentSuccess(true);
      onUpdate();
      setTimeout(() => setEmailSentSuccess(false), 3000);
    }, 600);
  };

  const handleExecuteConvertWon = () => {
    if (!lead) return;

    // 1. Mark proposal accepted
    markProposalAccepted(proposal.proposal_id, {
      business_name: proposal.content.cover_page.client_name,
      final_monthly_retainer: confirmRetainer,
      final_setup_fee: confirmSetup,
      contract_length: confirmContract,
      accepted_date: confirmStartDate,
    });

    // 2. Convert to formal Won Client & generate handoff brief + checklist
    convertToWonClient(proposal.proposal_id, lead, audit);

    setShowConvertModal(false);
    onUpdate();
    if (onConvertedToClient) onConvertedToClient();
    onClose();
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">Accepted (Won)</span>;
      case 'Sent':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-700/60">Sent to Client</span>;
      case 'Viewed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">Client Viewed</span>;
      case 'Negotiation':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700/60">In Negotiation</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700/60">Declined</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-mca-hover text-slate-200 border border-white/15">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-mca-hover/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-mca-card rounded-xl border border-white/10 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden my-4">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-mca-void/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{proposal.title}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-100">
                  v{proposal.version}
                </span>
                {getStatusBadge(proposal.status)}
              </div>
              <p className="text-xs text-slate-400">
                Marketing Charm Agency • Prepared by {proposal.content.cover_page.prepared_by} • ${proposal.pricing.monthly_retainer.toLocaleString()}/mo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-mca-hover rounded-lg transition-colors"
              title="Print Proposal"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-mca-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10 flex gap-2 bg-mca-card">
          <button
            onClick={() => setActiveTab('document')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'document'
                ? 'border-amber-600 text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Proposal Document
          </button>
          <button
            onClick={() => setActiveTab('pricing_builder')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pricing_builder'
                ? 'border-amber-600 text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Services & Pricing Editor
          </button>
          <button
            onClick={() => setActiveTab('negotiation')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'negotiation'
                ? 'border-amber-600 text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Sophia Negotiation AI
            {proposal.negotiation_intelligence && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('version_history')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'version_history'
                ? 'border-amber-600 text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Version History ({proposal.version_history.length})
          </button>
          <button
            onClick={() => setActiveTab('email_delivery')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'email_delivery'
                ? 'border-amber-600 text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            Client Delivery
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'document' && (
            /* FORMAL PROPOSAL DOCUMENT VIEW */
            <div className="max-w-3xl mx-auto bg-mca-card p-8 rounded-xl border border-white/10 shadow-sm space-y-8 font-sans">
              {/* Proposal Header & Letterhead */}
              <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
                <div>
                  <div className="text-xl font-extrabold text-white tracking-tight">
                    MARKETING CHARM AGENCY
                  </div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                    MCA Lead Agency Suite • Client Conversion Engine
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Prepared by: <strong className="text-slate-100">{proposal.content.cover_page.prepared_by}</strong>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="font-semibold text-white">Date: </span>
                    {proposal.content.cover_page.date}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Valid Until: </span>
                    {proposal.content.cover_page.valid_until}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Proposal ID: </span>
                    <span className="font-mono">{proposal.proposal_id}</span>
                  </div>
                </div>
              </div>

              {/* Cover Title */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-2 shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Strategic Proposal
                </span>
                <h1 className="text-2xl font-black">{proposal.content.cover_page.title}</h1>
                <p className="text-sm text-slate-600">
                  Prepared exclusively for <strong className="text-white">{proposal.content.cover_page.client_name}</strong>
                </p>
              </div>

              {/* About Agency */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  About Marketing Charm Agency
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {proposal.content.about_agency}
                </p>
              </div>

              {/* Client Overview & Identified Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-mca-void/40 border border-white/10 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Client Context</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{proposal.content.client_overview}</p>
                </div>
                <div className="p-4 rounded-xl bg-mca-void/40 border border-white/10 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Core Engagement Objectives</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{proposal.content.understanding_goals}</p>
                </div>
              </div>

              {/* Current Verified Growth Opportunities */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verified Market & Technical Opportunities
                </h3>
                <div className="space-y-2">
                  {proposal.content.current_opportunities.map((opp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-mca-void/40 border border-white/10 flex items-start gap-2.5 text-xs text-slate-100">
                      <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{opp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Strategy */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recommended Growth Strategy
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed bg-amber-950/50 p-4 rounded-xl border border-amber-800/50">
                  {proposal.content.recommended_strategy}
                </p>
              </div>

              {/* Implementation Roadmap (3 Phases) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3-Phase Implementation Roadmap
                </h3>
                <div className="space-y-3">
                  {proposal.content.implementation_roadmap.map((phase, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-mca-card border border-white/10 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{phase.phase}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300">
                          {phase.timeline}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{phase.focus}</p>
                      <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                        {phase.deliverables.map((d, dIdx) => (
                          <span key={dIdx} className="px-2 py-0.5 rounded text-xs bg-mca-hover text-slate-200">
                            ✓ {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services & Deliverables Included */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Scope of Services & Deliverables
                </h3>
                <div className="space-y-3">
                  {proposal.services.filter((s) => s.selected).map((srv) => (
                    <div key={srv.id} className="p-4 rounded-xl border border-white/10 bg-mca-void/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-white">
                          ${srv.monthly_price.toLocaleString()}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{srv.description}</p>
                      <ul className="text-xs text-slate-200 space-y-1 pl-5 list-disc">
                        {srv.deliverables.map((d, dIdx) => (
                          <li key={dIdx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment Table */}
              <div className="p-6 rounded-xl bg-mca-hover text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                    Investment Schedule
                  </h3>
                  <span className="text-xs text-slate-500">Agreement Term: {proposal.contract_length}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Monthly Retainer Investment</span>
                    <span className="font-semibold text-white">${proposal.pricing.monthly_retainer.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>One-Time Onboarding & Technical Setup</span>
                    <span className="font-semibold text-white">${proposal.pricing.setup_fee.toLocaleString()}</span>
                  </div>
                  {proposal.pricing.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Agency Courtesy Adjustment</span>
                      <span>-${proposal.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base font-extrabold">
                    <span className="text-amber-400">Total First Month Investment</span>
                    <span className="text-xl text-white">${proposal.pricing.total_first_month.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Recurring Monthly Thereafter</span>
                    <span className="text-slate-600">${proposal.pricing.recurring_monthly_cost.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>

              {/* Optional Add-Ons */}
              {proposal.content.optional_addons && proposal.content.optional_addons.length > 0 && (
                <div className="p-4 rounded-xl border border-white/10 bg-mca-void/40 space-y-2">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Optional Service Add-Ons</h4>
                  <div className="space-y-1">
                    {proposal.content.optional_addons.map((add, idx) => (
                      <div key={idx} className="text-xs text-slate-200 flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>{add}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why MCA & Terms */}
              <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-300 space-y-2">
                <div>
                  <strong className="text-white block mb-0.5">Why Marketing Charm Agency:</strong>
                  {proposal.content.why_mca}
                </div>
                <div>
                  <strong className="text-white block mb-0.5">Standard Agency Terms of Engagement:</strong>
                  {proposal.content.acceptance_terms}
                </div>
                <div className="p-3 bg-mca-hover rounded-lg text-slate-200">
                  <strong className="text-white block mb-0.5">Next Steps for Activation:</strong>
                  <pre className="font-sans whitespace-pre-line text-xs">{proposal.content.next_steps}</pre>
                </div>
              </div>

              {/* Sign-off Signature */}
              <div className="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <p className="font-bold text-white">Marketing Charm Agency</p>
                  <p>AI Sales Representative: Sophia</p>
                  <p>Client Conversion & Acquisition Engine</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">Accepted by Client Representative:</p>
                  <div className="w-44 border-b border-slate-400 mt-6" />
                  <p className="mt-1 text-[11px] text-slate-500">Signature / Date</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing_builder' && (
            /* INTERACTIVE SERVICES & PRICING BUILDER */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-300 text-sm flex items-start gap-3">
                <Sliders className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Interactive Proposal Pricing & Package Builder</p>
                  <p className="text-xs text-amber-300 mt-0.5">
                    Customize the services included in this proposal. Pricing updates transparently without hidden multipliers. When you save, a new version (v{proposal.version + 1}) is created with your audit trail.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Services Selection Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Included Services ({services.filter((s) => s.selected).length})
                    </h3>
                    <span className="text-xs text-slate-400">Toggle inclusion or remove</span>
                  </div>

                  <div className="space-y-3">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className={`p-4 rounded-xl border transition-all ${
                          srv.selected
                            ? 'bg-mca-card border-amber-700/60 shadow-sm'
                            : 'bg-mca-void/40 border-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={srv.selected}
                              onChange={() => handleToggleService(srv.id)}
                              className="w-4 h-4 rounded text-amber-400 focus:ring-amber-500 mt-1 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-mca-hover text-slate-200">
                                  {srv.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1">{srv.description}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-white block">
                              ${srv.monthly_price.toLocaleString()}/mo
                            </span>
                            <span className="text-[11px] text-slate-500">Setup: ${srv.setup_fee}</span>
                            <button
                              onClick={() => handleRemoveService(srv.id)}
                              className="mt-1 p-1 text-slate-500 hover:text-rose-400 transition-colors block ml-auto"
                              title="Remove service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Service from Catalog */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Add Service from Agency Catalog
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ALL_AGENCY_SERVICES.filter((c) => !services.some((s) => s.id === c.id)).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleAddCatalogService(cat)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-mca-hover hover:bg-slate-700 text-slate-100 flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {cat.name} (${cat.monthly_price}/mo)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Controls & Summary Column */}
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-mca-card border border-white/10 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Pricing Parameters
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        One-Time Setup Fee ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={setupFee}
                        onChange={(e) => setSetupFee(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm bg-mca-void/40 border border-white/15 rounded-lg text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Contract Commitment (Months)
                      </label>
                      <select
                        value={contractMonths}
                        onChange={(e) => setContractMonths(Number(e.target.value) || 6)}
                        className="w-full px-3 py-2 text-sm bg-mca-void/40 border border-white/15 rounded-lg text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      >
                        <option value={3}>3 Months (Milestone Pilot)</option>
                        <option value={6}>6 Months (Standard Agreement)</option>
                        <option value={12}>12 Months (Annual Growth Partner)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Courtesy Discount Adjustment ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-mca-void/40 border border-white/15 rounded-lg text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Do not discount without adjusting scope unless authorized.
                      </span>
                    </div>

                    {/* Live Calculation Box */}
                    <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Monthly Retainer:</span>
                        <strong className="text-white">${currentPricing.monthly_retainer.toLocaleString()}/mo</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Setup Fee:</span>
                        <strong className="text-white">${currentPricing.setup_fee.toLocaleString()}</strong>
                      </div>
                      {currentPricing.discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount:</span>
                          <strong>-${currentPricing.discount.toLocaleString()}</strong>
                        </div>
                      )}
                      <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                        <span>Total First Month:</span>
                        <span className="text-amber-400">${currentPricing.total_first_month.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Recurring Thereafter:</span>
                        <span>${currentPricing.recurring_monthly_cost.toLocaleString()}/mo</span>
                      </div>
                    </div>

                    {/* Version Change Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Version Notes (Audit Trail)
                      </label>
                      <input
                        type="text"
                        value={versionNote}
                        onChange={(e) => setVersionNote(e.target.value)}
                        placeholder="e.g. Scoped down paid ads per client request"
                        className="w-full px-3 py-1.5 text-xs bg-mca-void/40 border border-white/15 rounded-lg text-white"
                      />
                    </div>

                    <button
                      onClick={handleSaveNewVersion}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Save as New Version (v{proposal.version + 1})
                    </button>

                    {saveSuccess && (
                      <p className="text-xs font-bold text-emerald-400 text-center animate-pulse">
                        ✓ Version {proposal.version} saved successfully!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'negotiation' && (
            /* SOPHIA NEGOTIATION AI */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start gap-3 shadow-md">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-400">Sophia AI Objection-To-Proposal Intelligence</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    When a prospect pushes back on pricing, contract duration, or scope, Sophia analyzes their objection and recommends strategic counter-offers and scoped-down compromises.
                  </p>
                </div>
              </div>

              {/* Input Objection Card */}
              <div className="p-5 rounded-xl bg-mca-card border border-white/10 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Analyze Client Objection or Pushback
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    What did the prospect say or object to?
                  </label>
                  <textarea
                    rows={3}
                    value={objectionText}
                    onChange={(e) => setObjectionText(e.target.value)}
                    placeholder="e.g. 'We love the audit, but $2,400/month is out of our budget right now. Can we start smaller or do month-to-month?'"
                    className="w-full px-3.5 py-2 text-sm bg-mca-void/40 border border-white/15 rounded-lg text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Did they mention a target monthly budget? (Optional)
                  </label>
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full max-w-xs px-3 py-2 text-sm bg-mca-void/40 border border-white/15 rounded-lg text-white"
                  />
                </div>

                <button
                  onClick={handleAnalyzeObjection}
                  disabled={!objectionText.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-mca-hover hover:bg-slate-800 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Generate Sophia Strategic Counter-Offer
                </button>
              </div>

              {/* Negotiation Result Display */}
              {negotiationResult && (
                <div className="space-y-4 p-5 rounded-xl bg-mca-void/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Risk Assessment:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          negotiationResult.risk_assessment === 'Low'
                            ? 'bg-emerald-950 text-emerald-300'
                            : negotiationResult.risk_assessment === 'Medium'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {negotiationResult.risk_assessment} Risk
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Analyzed at: {new Date(negotiationResult.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-mca-card border border-white/10 text-xs text-slate-100 leading-relaxed space-y-2">
                    <strong className="text-white block">Sophia's Recommended Talking Points:</strong>
                    <p className="italic text-slate-200 bg-amber-950/50 p-3 rounded-lg border border-amber-800/50">
                      {negotiationResult.suggested_response}
                    </p>
                  </div>

                  {negotiationResult.alternative_package && (
                    <div className="p-4 rounded-xl bg-mca-card border border-amber-700/60 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Recommended Alternative Package
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          ${negotiationResult.alternative_package.revised_retainer.toLocaleString()}/mo
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {negotiationResult.alternative_package.name}
                      </h4>
                      <p className="text-xs text-slate-300">
                        <strong>Scope Adjustment: </strong>
                        {negotiationResult.alternative_package.scope_adjustment}
                      </p>
                      <button
                        onClick={handleApplyAlternativePackage}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Apply Alternative Package to Proposal
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'version_history' && (
            /* VERSION HISTORY TIMELINE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Proposal Version Audit Trail
                </h3>
                <span className="text-xs text-slate-400">Every change is tracked chronologically</span>
              </div>

              <div className="space-y-3">
                {proposal.version_history.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-4 rounded-xl bg-mca-card border border-white/10 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-mca-hover text-white">
                          v{ver.version}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100">{ver.changes}</h4>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(ver.date).toLocaleString()}
                      </span>
                    </div>

                    {ver.price_changes && (
                      <p className="text-xs text-amber-300 font-medium">
                        Pricing: {ver.price_changes}
                      </p>
                    )}

                    {ver.services_added && ver.services_added.length > 0 && (
                      <p className="text-xs text-emerald-300">
                        Added: {ver.services_added.join(', ')}
                      </p>
                    )}

                    {ver.services_removed && ver.services_removed.length > 0 && (
                      <p className="text-xs text-rose-300">
                        Removed: {ver.services_removed.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'email_delivery' && (
            /* CLIENT EMAIL DELIVERY VIEW */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-300 text-sm flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Review & Deliver Proposal</p>
                  <p className="text-xs text-amber-300 mt-0.5">
                    Sophia has generated this formal proposal email. When you approve and send, proposal status will automatically move to <strong>Sent</strong>, update the lead pipeline stage, and schedule follow-ups on Day 2, Day 4, and Day 7.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={lead?.email || ''}
                  disabled
                  placeholder="owner@business.com"
                  className="w-full px-3.5 py-2 text-sm bg-mca-void/40 border border-white/10 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-mca-card border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={10}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-mca-card border border-white/15 rounded-lg text-white font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">
                  Attachment: <span className="font-medium text-slate-200">MCA_Client_Acquisition_Proposal_v{proposal.version}.pdf</span>
                </p>
                <button
                  onClick={handleSendProposalEmail}
                  disabled={isSendingEmail || emailSentSuccess}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    'Sending Proposal...'
                  ) : emailSentSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Delivered & Pipeline Updated!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Approve & Send Proposal
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-mca-void/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Proposal Status:{' '}
              <strong className="text-slate-100">{proposal.status}</strong>
            </span>
            {proposal.tracking.sent_at && (
              <span className="text-[11px] text-slate-500">
                Sent: {new Date(proposal.tracking.sent_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
            >
              Close
            </button>

            {proposal.status !== 'Accepted' && (
              <button
                onClick={() => setShowConvertModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Convert to Won Client
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONVERT TO WON CLIENT CONFIRMATION MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 z-60 bg-mca-hover/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mca-card rounded-xl border border-white/10 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Client Acceptance & Won Retainer
                </h3>
                <p className="text-xs text-slate-400">
                  Convert {proposal.content.cover_page.client_name} into an active agency client
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-xs text-emerald-300 space-y-1">
              <p className="font-bold">Automated Won Actions:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-emerald-300">
                <li>Updates lead pipeline stage to <strong>Won / Retainer</strong></li>
                <li>Updates agency Won MRR in Revenue Intelligence</li>
                <li>Generates Client Handoff Brief for fulfillment</li>
                <li>Initiates 5-step client onboarding checklist</li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Confirmed Actual Monthly Retainer ($)
                </label>
                <input
                  type="number"
                  value={confirmRetainer}
                  onChange={(e) => setConfirmRetainer(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-mca-card border border-white/15 rounded-lg text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">
                    Setup Fee Paid ($)
                  </label>
                  <input
                    type="number"
                    value={confirmSetup}
                    onChange={(e) => setConfirmSetup(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-mca-card border border-white/15 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">
                    Agreement Term
                  </label>
                  <input
                    type="text"
                    value={confirmContract}
                    onChange={(e) => setConfirmContract(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-mca-card border border-white/15 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Contract Commencement Date
                </label>
                <input
                  type="date"
                  value={confirmStartDate}
                  onChange={(e) => setConfirmStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-mca-card border border-white/15 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConvertWon}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Acceptance & Convert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
