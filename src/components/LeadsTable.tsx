import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  SlidersHorizontal,
  Globe,
  Star,
  MapPin,
  Phone,
  Bot,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Lead, PipelineStage, ViewFilterType } from '../types';
import * as XLSX from 'xlsx';

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenImport?: () => void;
  onOpenAddLead?: () => void;
  onBulkUpdateStage: (leadIds: string[], stage: PipelineStage) => void;
  onBulkDelete: (leadIds: string[]) => void;
  onTriggerAIEnrichment: (leadIds: string[]) => void;
  onClearAllLeads?: () => void;
  onOpenDialer?: (lead: Lead) => void;
  onOpenAICall?: (lead: Lead) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onSelectLead,
  onOpenImport,
  onOpenAddLead,
  onBulkUpdateStage,
  onBulkDelete,
  onTriggerAIEnrichment,
  onClearAllLeads,
  onOpenDialer,
  onOpenAICall,
}) => {
  // State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewFilterType>('All Leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [nicheFilter, setNicheFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Lead>('lead_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkStageModal, setShowBulkStageModal] = useState(false);
  const [bulkStageTarget, setBulkStageTarget] = useState<PipelineStage>('Contacted');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Extract unique niches for filter
  const uniqueNiches = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.niche) set.add(l.niche);
    });
    return Array.from(set);
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Saved View Filter
      if (currentView === 'Hot Leads' && !l.is_hot_target) return false;
      if (currentView === 'No Website' && l.website_status !== 'No Website') return false;
      if (currentView === 'No GMB' && l.gmb_status !== 'No GMB' && l.gmb_status !== 'Thin GMB') return false;
      if (currentView === 'No Google Ads' && l.google_ads_status !== 'No Ads') return false;
      if (currentView === 'No Meta Pixel' && l.meta_pixel_status !== 'No Pixel') return false;
      if (currentView === 'High Value' && (l.estimated_retainer || 0) < 2400) return false;
      if (currentView === 'Needs Follow-Up' && l.pipeline_stage !== 'Contacted' && l.pipeline_stage !== 'Audit Sent') return false;
      if (currentView === 'New Leads' && l.pipeline_stage !== 'New Lead') return false;

      // Stage Filter
      if (stageFilter !== 'All' && l.pipeline_stage !== stageFilter) return false;

      // Niche Filter
      if (nicheFilter !== 'All' && l.niche !== nicheFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = l.business_name?.toLowerCase().includes(q);
        const matchesContact = l.contact_name?.toLowerCase().includes(q);
        const matchesPhone = l.phone?.toLowerCase().includes(q);
        const matchesEmail = l.email?.toLowerCase().includes(q);
        const matchesCity = l.city?.toLowerCase().includes(q);
        const matchesNiche = l.niche?.toLowerCase().includes(q);
        const matchesGaps = l.gaps?.some((g) => g.toLowerCase().includes(q));
        const matchesId = l.lead_id?.toLowerCase().includes(q);
        if (!matchesName && !matchesContact && !matchesPhone && !matchesEmail && !matchesCity && !matchesNiche && !matchesGaps && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [leads, currentView, stageFilter, nicheFilter, searchQuery]);

  // Sorted Leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = (aVal as string).toLowerCase();
      if (typeof bVal === 'string') bVal = (bVal as string).toLowerCase();

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortField, sortOrder]);

  // Paginated Leads
  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, currentPage]);

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(paginatedLeads.map((l) => l.lead_id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectRow = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'xlsx' | 'json') => {
    const exportData = filteredLeads.map((l) => ({
      'Lead ID': l.lead_id,
      'Business Name': l.business_name,
      'Contact Name': l.contact_name || '',
      Phone: l.phone || '',
      Email: l.email || '',
      Website: l.website || '',
      Address: l.address || '',
      City: l.city || '',
      State: l.state || '',
      Niche: l.niche || '',
      'GMB Rating': l.gmb_rating || '',
      'GMB Reviews': l.gmb_review_count || '',
      'Lead Score (0-100)': l.lead_score,
      'Marketing Gaps': l.gaps?.join(', ') || '',
      'Recommended Service': l.recommended_service || '',
      'AI Est. Retainer': l.estimated_retainer || '',
      'Pipeline Stage': l.pipeline_stage,
      Owner: l.owner,
      'Created At': l.created_at,
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mca-leads-${Date.now()}.json`;
      a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
      XLSX.writeFile(wb, `mca-leads-${Date.now()}.${format}`);
    }
  };

  return (
    <div id="mca-leads-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Leads</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
              {filteredLeads.length} of {leads.length} records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production CRM table with 0–100 explainable scoring, detected gaps, and verified contact points.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onClearAllLeads && leads.length > 0 && (
            <button
              id="leads-btn-clear-all"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete all ${leads.length} leads and clear the CRM? This cannot be undone.`)) {
                  onClearAllLeads();
                }
              }}
              title="Clear all leads from CRM"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-rose-900/40 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
          <button
            id="leads-btn-export"
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Saved Views Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80">
        {(
          [
            'All Leads',
            'Hot Leads',
            'No Website',
            'No GMB',
            'No Google Ads',
            'No Meta Pixel',
            'High Value',
            'Needs Follow-Up',
            'New Leads',
          ] as ViewFilterType[]
        ).map((view) => (
          <button
            key={view}
            onClick={() => {
              setCurrentView(view);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentView === view
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search leads, niche, phone, gaps..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showAdvancedFilters || stageFilter !== 'All' || nicheFilter !== 'All'
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Bulk Actions Menu (Active when items selected) */}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-indigo-300 font-mono">
              {selectedLeadIds.length} selected
            </span>
            <div className="h-4 w-px bg-indigo-500/30" />
            <button
              onClick={() => setShowBulkStageModal(true)}
              className="text-xs text-white hover:text-indigo-200 font-semibold"
            >
              Change Stage
            </button>
            <button
              onClick={() => onTriggerAIEnrichment(selectedLeadIds)}
              className="text-xs text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Enrich</span>
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Collapsible Panel */}
      {showAdvancedFilters && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Pipeline Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
            >
              <option value="All">All Stages</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Audit Sent">Audit Sent</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Retainer">Retainer</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Niche / Industry</label>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
            >
              <option value="All">All Niches</option>
              {uniqueNiches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStageFilter('All');
                setNicheFilter('All');
                setSearchQuery('');
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* CRM Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedLeads.length > 0 &&
                      paginatedLeads.every((l) => selectedLeadIds.includes(l.lead_id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th
                  onClick={() => handleSort('business_name')}
                  className="p-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Business</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">GMB</th>
                <th className="p-3.5">Website</th>
                <th className="p-3.5">Marketing Gaps</th>
                <th className="p-3.5">Opportunity</th>
                <th
                  onClick={() => handleSort('lead_score')}
                  className="p-3.5 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('estimated_retainer')}
                  className="p-3.5 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Est. Retainer</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 text-center">Stage</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-slate-400">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-white">No Leads Found</div>
                      <p className="text-xs text-slate-400">
                        No records match the current view and search filters. Try clearing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.lead_id);
                  return (
                    <tr
                      key={lead.lead_id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(lead.lead_id)}
                          className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Business */}
                      <td className="p-3.5">
                        <div
                          onClick={() => onSelectLead(lead)}
                          className="cursor-pointer group-hover:text-indigo-300 font-bold text-slate-100 flex items-center gap-1.5"
                        >
                          <span>{lead.business_name}</span>
                          {lead.is_hot_target && (
                            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {lead.lead_id} • {lead.niche || 'Local Business'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">
                        <div>{lead.city || 'Portland'}, {lead.state || 'OR'}</div>
                        <div className="text-[10px] text-slate-400">{lead.postal_code || '97201'}</div>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5 whitespace-nowrap">
                        {lead.phone && lead.phone !== 'Not Available' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenDialer) onOpenDialer(lead);
                              }}
                              className="text-slate-200 font-mono hover:text-emerald-400 hover:underline flex items-center gap-1 text-xs"
                              title={`Dial ${lead.phone}`}
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{lead.phone}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-slate-500 font-mono text-xs">Not provided</div>
                        )}
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {lead.email || 'Not provided'}
                        </div>
                      </td>

                      {/* GMB */}
                      <td className="p-3.5 whitespace-nowrap">
                        {lead.gmb_rating ? (
                          <div className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{lead.gmb_rating}</span>
                            <span className="text-slate-400 text-[10px]">
                              ({lead.gmb_review_count || 0})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-medium">Thin GMB</span>
                        )}
                        <div className="text-[10px] text-slate-400">{lead.gmb_status || 'Established'}</div>
                      </td>

                      {/* Website */}
                      <td className="p-3.5 whitespace-nowrap">
                        {lead.website && !lead.website.toLowerCase().includes('no website') ? (
                          <div>
                            <span className="text-slate-300 truncate max-w-[120px] block">
                              {lead.website.replace(/^https?:\/\//, '')}
                            </span>
                            <span
                              className={`text-[10px] font-medium ${
                                lead.pagespeed_score && lead.pagespeed_score < 40
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              Speed: {lead.pagespeed_score ? `${lead.pagespeed_score}/100` : 'Untested'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            No Website
                          </span>
                        )}
                      </td>

                      {/* Marketing Gaps */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {lead.gaps.slice(0, 2).map((gap, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 whitespace-nowrap"
                            >
                              {gap}
                            </span>
                          ))}
                          {lead.gaps.length > 2 && (
                            <span className="px-1 py-0.5 rounded text-[9px] text-slate-400">
                              +{lead.gaps.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Opportunity */}
                      <td className="p-3.5 max-w-[160px]">
                        <div className="text-slate-200 font-medium truncate">
                          {lead.recommended_service}
                        </div>
                      </td>

                      {/* Score & Priority Tier */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg font-bold font-mono text-xs ${
                              (lead.overall_priority_score || lead.lead_score) >= 90
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : (lead.overall_priority_score || lead.lead_score) >= 75
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {lead.overall_priority_score || lead.lead_score}
                          </span>
                          {(lead.priority_tier || lead.intelligence?.priority_tier) && (
                            <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {lead.priority_tier || lead.intelligence?.priority_tier}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Retainer */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="font-extrabold text-emerald-400 font-mono">
                          ${lead.estimated_retainer?.toLocaleString()}/mo
                        </div>
                        <div className="text-[9px] text-slate-400">AI Retainer</div>
                      </td>

                      {/* Stage */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            lead.pipeline_stage === 'Won' || lead.pipeline_stage === 'Retainer'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : lead.pipeline_stage === 'Proposal Sent'
                              ? 'bg-amber-500/20 text-amber-300'
                              : lead.pipeline_stage === 'Contacted' || lead.pipeline_stage === 'Audit Sent'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {lead.pipeline_stage}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {lead.phone && lead.phone !== 'Not Available' && onOpenAICall && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAICall(lead);
                              }}
                              className="px-2 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 border border-purple-500/30"
                              title="Launch Sophia AI Voice Call"
                            >
                              <Bot className="w-3 h-3" />
                              <span>Sophia AI</span>
                            </button>
                          )}
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-[11px] font-semibold transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Change Stage Modal */}
      {showBulkStageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Bulk Update Stage ({selectedLeadIds.length} Leads)
              </h3>
              <button
                onClick={() => setShowBulkStageModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">
                Select New Pipeline Stage:
              </label>
              <select
                value={bulkStageTarget}
                onChange={(e) => setBulkStageTarget(e.target.value as PipelineStage)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Audit Sent">Audit Sent</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
                <option value="Retainer">Retainer</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowBulkStageModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBulkUpdateStage(selectedLeadIds, bulkStageTarget);
                  setSelectedLeadIds([]);
                  setShowBulkStageModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                Update Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">
                Confirm Deletion of {selectedLeadIds.length} Leads
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove {selectedLeadIds.length} selected lead records from the CRM? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBulkDelete(selectedLeadIds);
                  setSelectedLeadIds([]);
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
