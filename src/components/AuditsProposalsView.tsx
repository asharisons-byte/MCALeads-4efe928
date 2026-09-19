import React, { useState, useEffect } from 'react';
import {
  Lead,
  AuditReport,
  Proposal,
  Client,
  ProposalAnalyticsMetrics,
  ProposalStatus,
  AuditStatus,
} from '../types';
import { ClientPortalUser } from '../types/clientPortal';
import {
  getAudits,
  getProposals,
  getClients,
  calculateProposalAnalytics,
  getServicePackages,
  ALL_AGENCY_SERVICES,
} from '../services/conversionService';
import { AuditDetailModal } from './AuditDetailModal';
import { ProposalDetailModal } from './ProposalDetailModal';
import { ClientDetailModal } from './ClientDetailModal';
import { AuditGenerationModal } from './AuditGenerationModal';
import { ProposalCreationModal } from './ProposalCreationModal';
import {
  FileCheck,
  Award,
  Plus,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  Send,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Mail,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AuditsProposalsViewProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onRefreshLeads?: () => void;
  onLaunchClientPortal?: (user: ClientPortalUser) => void;
}

export const AuditsProposalsView: React.FC<AuditsProposalsViewProps> = ({
  leads,
  onSelectLead,
  onRefreshLeads,
  onLaunchClientPortal,
}) => {
  const [subTab, setSubTab] = useState<'overview' | 'audits' | 'proposals' | 'clients' | 'packages'>('overview');

  // Core Data State
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [metrics, setMetrics] = useState<ProposalAnalyticsMetrics>({
    audits_generated: 0,
    audits_sent: 0,
    proposals_draft: 0,
    proposals_sent: 0,
    proposals_viewed: 0,
    pending_decisions: 0,
    accepted_proposals: 0,
    rejected_proposals: 0,
    won_mrr: 0,
    conversion_rate: 0,
    avg_proposal_value: 0,
    avg_time_to_decision_days: 0,
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('All');
  const [proposalStatusFilter, setProposalStatusFilter] = useState<string>('All');

  // Modals
  const [selectedAudit, setSelectedAudit] = useState<AuditReport | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);

  // Load data
  const refreshData = () => {
    const loadedAudits = getAudits();
    const loadedProposals = getProposals();
    const loadedClients = getClients();
    setAudits(loadedAudits);
    setProposals(loadedProposals);
    setClients(loadedClients);
    setMetrics(calculateProposalAnalytics());
    if (onRefreshLeads) onRefreshLeads();
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered lists
  const filteredAudits = audits.filter((a) => {
    const matchesSearch =
      a.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.executive_summary.top_priority.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = auditStatusFilter === 'All' || a.status === auditStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.cover_page.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = proposalStatusFilter === 'All' || p.status === proposalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const servicePackages = getServicePackages();

  const getProposalStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Viewed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Negotiation':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
              PHASE 3C
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Marketing Charm Agency • AI Representative: Sophia
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Audits, Proposals & Client Conversion Engine
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Move qualified prospects through evidence-based digital audits, tailored proposals, interactive pricing, and structured won client handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewAuditModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileCheck className="w-4 h-4 text-amber-600" />
            New Digital Audit
          </button>
          <button
            onClick={() => setShowNewProposalModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4" />
            New Proposal Draft
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setSubTab('overview')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'overview'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Overview & Pipeline Metrics
        </button>
        <button
          onClick={() => setSubTab('audits')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'audits'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Digital Audits ({audits.length})
        </button>
        <button
          onClick={() => setSubTab('proposals')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'proposals'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Proposals & Pricing ({proposals.length})
        </button>
        <button
          onClick={() => setSubTab('clients')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'clients'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Won Clients & Retainers ({clients.length})
        </button>
        <button
          onClick={() => setSubTab('packages')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === 'packages'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Service Packages & Catalog
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & PIPELINE METRICS */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Audits Generated</span>
              <div className="text-xl font-extrabold text-slate-900">{metrics.audits_generated}</div>
              <span className="text-[11px] text-slate-400">{metrics.audits_sent} delivered to leads</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Active Proposals</span>
              <div className="text-xl font-extrabold text-slate-900">{metrics.proposals_sent}</div>
              <span className="text-[11px] text-slate-400">{metrics.pending_decisions} pending decision</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Proposal Views</span>
              <div className="text-xl font-extrabold text-indigo-600">{metrics.proposals_viewed}</div>
              <span className="text-[11px] text-slate-400">Prospect engagement</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Conversion Rate</span>
              <div className="text-xl font-extrabold text-amber-600">{metrics.conversion_rate}%</div>
              <span className="text-[11px] text-slate-400">Accepted vs decided</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Won Monthly MRR</span>
              <div className="text-xl font-extrabold text-emerald-600">${metrics.won_mrr.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-700">{clients.length} active client retainers</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Avg Proposal Value</span>
              <div className="text-xl font-extrabold text-slate-900">${metrics.avg_proposal_value.toLocaleString()}</div>
              <span className="text-[11px] text-slate-400">Per monthly retainer</span>
            </div>
          </div>

          {/* Proposal Pipeline Kanban Overview */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Conversion Pipeline Status
                </h3>
                <p className="text-xs text-slate-500">
                  Strict Rule: Proposals in negotiation or sent are never treated as won until formal acceptance.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Total Proposals: {proposals.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Column 1: Drafts & Internal Review */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>1. Drafts & Review</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {proposals.filter((p) => p.status === 'Draft' || p.status === 'Internal Review' || p.status === 'Ready to Send').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {proposals.filter((p) => p.status === 'Draft' || p.status === 'Internal Review' || p.status === 'Ready to Send').map((p) => (
                    <div
                      key={p.proposal_id}
                      onClick={() => setSelectedProposal(p)}
                      className="p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer text-xs space-y-1 shadow-xs"
                    >
                      <div className="font-bold text-slate-900">{p.content.cover_page.client_name}</div>
                      <div className="text-slate-500 flex justify-between">
                        <span>${p.pricing.monthly_retainer.toLocaleString()}/mo</span>
                        <span className="font-semibold text-slate-700">v{p.version}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Sent & Viewed */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>2. Delivered & Viewed</span>
                  <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                    {proposals.filter((p) => p.status === 'Sent' || p.status === 'Viewed').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {proposals.filter((p) => p.status === 'Sent' || p.status === 'Viewed').map((p) => (
                    <div
                      key={p.proposal_id}
                      onClick={() => setSelectedProposal(p)}
                      className="p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 cursor-pointer text-xs space-y-1 shadow-xs"
                    >
                      <div className="font-bold text-slate-900">{p.content.cover_page.client_name}</div>
                      <div className="text-slate-500 flex justify-between">
                        <span>${p.pricing.monthly_retainer.toLocaleString()}/mo</span>
                        <span className="text-blue-700 font-medium">Views: {p.tracking.view_count || 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: In Negotiation */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>3. In Negotiation</span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                    {proposals.filter((p) => p.status === 'Negotiation').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {proposals.filter((p) => p.status === 'Negotiation').map((p) => (
                    <div
                      key={p.proposal_id}
                      onClick={() => setSelectedProposal(p)}
                      className="p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 cursor-pointer text-xs space-y-1 shadow-xs"
                    >
                      <div className="font-bold text-slate-900">{p.content.cover_page.client_name}</div>
                      <div className="text-slate-500 flex justify-between">
                        <span>${p.pricing.monthly_retainer.toLocaleString()}/mo</span>
                        <span className="text-amber-700 font-bold">Sophia AI Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4: Accepted (Won Retainers) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>4. Won Clients</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                    {proposals.filter((p) => p.status === 'Accepted').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {proposals.filter((p) => p.status === 'Accepted').map((p) => (
                    <div
                      key={p.proposal_id}
                      onClick={() => setSelectedProposal(p)}
                      className="p-3 rounded-lg bg-white border border-emerald-200 hover:border-emerald-300 cursor-pointer text-xs space-y-1 shadow-xs"
                    >
                      <div className="font-bold text-slate-900">{p.content.cover_page.client_name}</div>
                      <div className="text-slate-500 flex justify-between">
                        <span className="text-emerald-700 font-bold">${p.pricing.monthly_retainer.toLocaleString()}/mo</span>
                        <span className="text-slate-500">Won</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100">
                <FileCheck className="w-4 h-4" />
                Audit-First Outreach Strategy
              </div>
              <h3 className="text-lg font-bold">Run Evidence-Based Digital Audit</h3>
              <p className="text-xs text-amber-50 leading-relaxed">
                Sophia extracts verified findings (PageSpeed, Google Business Profile, Ads, and Schema) from actual crawl records. Present clear evidence to local business owners without making unsupported ranking promises.
              </p>
              <button
                onClick={() => setShowNewAuditModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-amber-800 hover:bg-amber-50 shadow-sm flex items-center gap-1.5 transition-all"
              >
                Audit Next Target Lead
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Award className="w-4 h-4" />
                Sophia Conversion Engine
              </div>
              <h3 className="text-lg font-bold">Draft Custom Proposal & Roadmap</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assemble high-ticket services into structured packages. Features interactive pricing sliders, objection negotiation AI, human-in-the-loop email approval, and automated client onboarding handoffs.
              </p>
              <button
                onClick={() => setShowNewProposalModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                Create New Proposal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DIGITAL AUDITS */}
      {subTab === 'audits' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audits by business or priority..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {['All', 'Generated', 'Reviewed', 'Sent'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAuditStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    auditStatusFilter === st
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAudits.map((audit) => {
              const matchedLead = leads.find((l) => l.lead_id === audit.lead_id);
              return (
                <div
                  key={audit.audit_id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{audit.business_name}</h4>
                        <span className="text-[11px] text-slate-500">
                          v{audit.version} • {new Date(audit.generated_at).toLocaleDateString()}
                        </span>
                      </div>
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

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 mb-3">
                      <span className="font-bold text-slate-900 block">Top Verified Priority:</span>
                      <p className="line-clamp-2">{audit.executive_summary.top_priority}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span>Opportunity Score:</span>
                      <strong className="text-amber-600 font-bold">
                        {typeof audit.digital_scorecard.overall_opportunity === 'number'
                          ? `${audit.digital_scorecard.overall_opportunity}/100`
                          : 'Not Audited'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Audit Coverage:</span>
                      <span className="font-medium text-slate-800">
                        {audit.digital_scorecard.audit_coverage_pct}% of channels
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Verified Findings:</span>
                      <span className="font-medium text-slate-800">
                        {audit.findings.length} findings
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAudit(audit)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Audit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAudit(audit);
                        setShowNewProposalModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Make Proposal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAudits.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 space-y-3">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Audits Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate an evidence-based digital audit for a prospect to identify verified marketing gaps.
              </p>
              <button
                onClick={() => setShowNewAuditModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700"
              >
                Generate First Audit
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: PROPOSALS & PRICING */}
      {subTab === 'proposals' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals by client or title..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {['All', 'Draft', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setProposalStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    proposalStatusFilter === st
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Proposals List */}
          <div className="space-y-3">
            {filteredProposals.map((proposal) => {
              const matchedLead = leads.find((l) => l.lead_id === proposal.lead_id);
              return (
                <div
                  key={proposal.proposal_id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">
                        {proposal.content.cover_page.client_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                        v{proposal.version}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getProposalStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      {proposal.negotiation_intelligence && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Sophia Negotiation Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {proposal.services.filter((s) => s.selected).map((s) => s.name).join(' • ')}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Term: {proposal.contract_length}</span>
                      <span>Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                      {proposal.tracking.sent_at && (
                        <span>Sent: {new Date(proposal.tracking.sent_at).toLocaleDateString()}</span>
                      )}
                      <span>Views: {proposal.tracking.view_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-lg font-extrabold text-slate-900">
                        ${proposal.pricing.monthly_retainer.toLocaleString()}
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Setup: ${proposal.pricing.setup_fee.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProposal(proposal)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      Proposal Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProposals.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Proposals Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a customized proposal using verified audit findings and strategic packages.
              </p>
              <button
                onClick={() => setShowNewProposalModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700"
              >
                Create First Proposal
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: WON CLIENTS & RETAINERS */}
      {subTab === 'clients' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{clients.length} Won Retainers</strong> actively syncing with Agency Command Center & Revenue Intelligence.
              </span>
            </div>
            <span className="font-extrabold text-sm text-emerald-950">
              Total Won MRR: ${metrics.won_mrr.toLocaleString()}/mo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              const doneTasks = client.onboarding_checklist.filter((t) => t.completed).length;
              const totalTasks = client.onboarding_checklist.length;
              const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={client.client_id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{client.business_name}</h4>
                        <span className="text-[11px] text-slate-500">
                          Active Since {client.contract_start_date}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          client.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Monthly Retainer:</span>
                        <strong className="text-slate-900 font-bold">${client.actual_mrr.toLocaleString()}/mo</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Setup Fee:</span>
                        <strong className="text-slate-900">${client.setup_fee.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Contract Term:</span>
                        <strong className="text-slate-900">{client.contract_length}</strong>
                      </div>
                    </div>

                    {/* Onboarding Progress */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Onboarding Checklist</span>
                        <span className="font-bold text-slate-800">{doneTasks}/{totalTasks} done</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      View Handoff Brief & Tasks
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {clients.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Won Clients Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once a proposal is accepted by a prospect, click "Convert to Won Client" in the proposal studio to initiate the onboarding workflow.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: SERVICE PACKAGES & CATALOG */}
      {subTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Marketing Charm Agency Packages
              </h3>
              <p className="text-xs text-slate-500">
                Pre-configured high-ticket service bundles optimized for local contractors and service businesses.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{pkg.name}</h4>
                    <p className="text-xs font-medium text-amber-700 mt-0.5">{pkg.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 block">
                      ${pkg.default_monthly_retainer.toLocaleString()}/mo
                    </span>
                    <span className="text-xs text-slate-400">Setup: ${pkg.default_setup_fee}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900">Recommended For: </strong>
                  {pkg.recommended_for}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Included Deliverables
                  </span>
                  {pkg.services.map((srv) => (
                    <div key={srv.id} className="text-xs text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{srv.name} (${srv.monthly_price}/mo)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Complete Agency Service Catalog */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Complete Agency Service Catalog ({ALL_AGENCY_SERVICES.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ALL_AGENCY_SERVICES.map((cat) => (
                <div key={cat.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{cat.name}</h4>
                    <span className="font-bold text-amber-600">${cat.monthly_price}/mo</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{cat.description}</p>
                  <span className="text-[10px] text-slate-400 block">Setup Fee: ${cat.setup_fee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedAudit && (
        <AuditDetailModal
          audit={selectedAudit}
          lead={leads.find((l) => l.lead_id === selectedAudit.lead_id)}
          onClose={() => setSelectedAudit(null)}
          onUpdate={refreshData}
          onCreateProposal={(auditToPropose) => {
            setSelectedAudit(null);
            setSelectedProposal(null);
            setShowNewProposalModal(true);
          }}
        />
      )}

      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          lead={leads.find((l) => l.lead_id === selectedProposal.lead_id)}
          audit={audits.find((a) => a.audit_id === selectedProposal.audit_id)}
          onClose={() => setSelectedProposal(null)}
          onUpdate={refreshData}
          onConvertedToClient={() => {
            refreshData();
            setSubTab('clients');
          }}
        />
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdate={refreshData}
          onLaunchPortal={onLaunchClientPortal}
        />
      )}

      {showNewAuditModal && (
        <AuditGenerationModal
          leads={leads}
          onClose={() => setShowNewAuditModal(false)}
          onAuditGenerated={(newAudit) => {
            setShowNewAuditModal(false);
            refreshData();
            setSelectedAudit(newAudit);
          }}
        />
      )}

      {showNewProposalModal && (
        <ProposalCreationModal
          leads={leads}
          initialAudit={selectedAudit || undefined}
          onClose={() => setShowNewProposalModal(false)}
          onProposalCreated={(newProposal) => {
            setShowNewProposalModal(false);
            refreshData();
            setSelectedProposal(newProposal);
          }}
        />
      )}
    </div>
  );
};
