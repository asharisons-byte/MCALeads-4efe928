import React, { useState } from 'react';
import { Lead, AuditReport } from '../types';
import { generateAIAuditReport } from '../services/conversionService';
import {
  X,
  Sparkles,
  FileCheck,
  Search,
  Building,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AuditGenerationModalProps {
  leads: Lead[];
  initialLead?: Lead;
  onClose: () => void;
  onAuditGenerated: (audit: AuditReport) => void;
}

export const AuditGenerationModal: React.FC<AuditGenerationModalProps> = ({
  leads,
  initialLead,
  onClose,
  onAuditGenerated,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.lead_id || leads[0]?.lead_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId);

  const filteredLeads = leads.filter(
    (l) =>
      l.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.city && l.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.niche && l.niche.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleGenerate = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const newAudit = await generateAIAuditReport(selectedLead, customNotes);
      setIsGenerating(false);
      onAuditGenerated(newAudit);
    } catch (err: any) {
      console.error('Audit generation error:', err);
      setIsGenerating(false);
      setErrorMsg(err.message || 'Failed to generate audit. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Generate AI Digital Audit</h2>
              <p className="text-xs text-slate-500">
                Sophia AI evidence-based local growth scorecard and gap analysis
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
              Select Target Prospect
            </label>

            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by business name, city, or niche..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
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
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                      Score: {lead.lead_score || 0}
                    </span>
                    {selectedLeadId === lead.lead_id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Lead Verified Facts Snapshot */}
          {selectedLead && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wider">
                  Verified Data Available for Audit
                </span>
                <span className="text-[11px] text-slate-500">
                  Pipeline: {selectedLead.pipeline_stage}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <strong>Website: </strong>
                  {selectedLead.website || 'No website found'} ({selectedLead.website_status || 'Unverified'})
                </div>
                <div>
                  <strong>PageSpeed: </strong>
                  {typeof selectedLead.pagespeed_score === 'number'
                    ? `${selectedLead.pagespeed_score}/100`
                    : 'Not Audited'}
                </div>
                <div>
                  <strong>GMB Status: </strong>
                  {selectedLead.gmb_status || 'Unknown'} (Reviews: {selectedLead.gmb_review_count ?? 0})
                </div>
                <div>
                  <strong>Paid Ads: </strong>
                  Google Ads: {selectedLead.google_ads_status || 'None'}, Pixel: {selectedLead.meta_pixel_status || 'None'}
                </div>
              </div>
            </div>
          )}

          {/* Custom Audit Focus Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Custom Focus or Lead Context (Optional)
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Prospect mentioned during call they are losing emergency jobs to local 3-pack competitors."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
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
            onClick={handleGenerate}
            disabled={!selectedLead || isGenerating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sophia Generating Audit...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Audit Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
