import React, { useState } from 'react';
import { Lead, AuditReport, Proposal, ServicePackage } from '../types';
import {
  createProposalDraft,
  getAuditsByLead,
  getServicePackages,
} from '../services/conversionService';
import {
  X,
  Sparkles,
  Award,
  Search,
  Building,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';

interface ProposalCreationModalProps {
  leads: Lead[];
  initialLead?: Lead;
  initialAudit?: AuditReport;
  onClose: () => void;
  onProposalCreated: (proposal: Proposal) => void;
}

export const ProposalCreationModal: React.FC<ProposalCreationModalProps> = ({
  leads,
  initialLead,
  initialAudit,
  onClose,
  onProposalCreated,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLead?.lead_id || leads[0]?.lead_id || ''
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_local_growth');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId);
  const leadAudits = selectedLead ? getAuditsByLead(selectedLead.lead_id) : [];
  const activeAudit = initialAudit || leadAudits[0];

  const servicePackages = getServicePackages();

  const filteredLeads = leads.filter(
    (l) =>
      l.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.city && l.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.niche && l.niche.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const newProposal = await createProposalDraft(
        selectedLead,
        activeAudit,
        selectedPackageId
      );
      setIsGenerating(false);
      onProposalCreated(newProposal);
    } catch (err: any) {
      console.error('Proposal creation error:', err);
      setIsGenerating(false);
      setErrorMsg(err.message || 'Failed to create proposal. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Client Acquisition Proposal</h2>
              <p className="text-xs text-slate-500">
                Marketing Charm Agency • Sophia AI Proposal Engine
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Target Lead Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Target Lead
            </label>

            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.lead_id}
                  onClick={() => setSelectedLeadId(lead.lead_id)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selectedLeadId === lead.lead_id
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-950 font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.business_name}</span>
                    <span className="text-slate-400">({lead.city || 'Oregon'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{lead.pipeline_stage}</span>
                    {selectedLeadId === lead.lead_id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Audit Info */}
          {activeAudit ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Connected Digital Audit: v{activeAudit.version}</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Proposal strategy, findings, and deliverables will automatically reference verified audit findings.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              No previous audit detected for this lead. A baseline strategic proposal will be initialized from CRM data.
            </div>
          )}

          {/* Package Preset Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Starting Service Package
            </label>
            <div className="space-y-2.5">
              {servicePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPackageId === pkg.id
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-slate-900">{pkg.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{pkg.tagline}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        ${pkg.default_monthly_retainer.toLocaleString()}/mo
                      </span>
                      <span className="text-[11px] text-slate-400">Setup: ${pkg.default_setup_fee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!selectedLead || isGenerating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Drafting Proposal...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create Proposal Draft
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
