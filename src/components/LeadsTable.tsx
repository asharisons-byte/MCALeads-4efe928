import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
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
  Plus,
  Upload,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCode,
  FolderOpen,
  Table,
  UserCheck,
} from 'lucide-react';
import { Lead, PipelineStage, ViewFilterType } from '../types';
import * as XLSX from 'xlsx';
import { ExcelColumnConverterModal } from './ExcelColumnConverterModal';

interface TeamMember {
  id: number;
  displayName: string;
  role: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenImport?: (mode?: 'upload' | 'sheets' | 'paste' | 'preset') => void;
  onOpenAddLead?: () => void;
  onBulkUpdateStage: (leadIds: string[], stage: PipelineStage) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => void;
  onTriggerAIEnrichment: (leadIds: string[]) => void;
  onClearAllLeads?: () => void;
  onOpenDialer?: (lead: Lead) => void;
  onOpenAICall?: (lead: Lead) => void;
  onImportComplete?: (leads: Lead[], source: string, count: number) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('../lib/firebase.js');
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
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
  onImportComplete,
  currentPage: propCurrentPage,
  onPageChange,
}) => {
  // State
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewFilterType>('All Leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [nicheFilter, setNicheFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [sortField, setSortField] = useState<keyof Lead>('lead_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localPage, setLocalPage] = useState(1);
  const currentPage = propCurrentPage ?? localPage;
  const setCurrentPage = (page: number) => {
    setLocalPage(page);
    onPageChange?.(page);
  };
  const pageSize = 15;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkStageModal, setShowBulkStageModal] = useState(false);
  const [showBulkReassignModal, setShowBulkReassignModal] = useState(false);
  const [bulkStageTarget, setBulkStageTarget] = useState<PipelineStage>('Contacted');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [showColumnConverter, setShowColumnConverter] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Load team members when bulk reassign modal opens
  useEffect(() => {
    if (!showBulkReassignModal) return;
    (async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch('/api/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const members = (data.users || []).filter((u: any) =>
            ['SDR', 'ACCOUNT_EXECUTIVE', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST', 'Sales', 'Account Manager'].includes(u.role)
          );
          setTeamMembers(members);
        }
      } catch (e) {
        console.error('Failed to load team members', e);
      }
    })();
  }, [showBulkReassignModal]);

  // Sync state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const stage = params.get('stage');
    const niche = params.get('niche');
    const country = params.get('country');
    const owner = params.get('owner');
    const sort = params.get('sort');
    const order = params.get('order');

    if (page) setLocalPage(Number(page));
    if (stage) setStageFilter(stage);
    if (niche) setNicheFilter(niche);
    if (country) setCountryFilter(country);
    if (owner) setOwnerFilter(owner);
    if (sort) setSortField(sort as keyof Lead);
    if (order) setSortOrder(order as 'asc' | 'desc');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', localPage.toString());
    params.set('stage', stageFilter);
    params.set('niche', nicheFilter);
    params.set('country', countryFilter);
    params.set('owner', ownerFilter);
    params.set('sort', sortField);
    params.set('order', sortOrder);
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [localPage, stageFilter, nicheFilter, countryFilter, ownerFilter, sortField, sortOrder]);

  // Extract unique values for filters
  const { uniqueNiches, uniqueCountries, uniqueOwners } = useMemo(() => {
    const niches = new Set<string>();
    const countries = new Set<string>();
    const owners = new Set<string>();
    leads.forEach((l) => {
      if (l.niche) niches.add(l.niche);
      if (l.country) countries.add(l.country);
      if (l.owner) owners.add(l.owner);
    });
    return {
      uniqueNiches: Array.from(niches),
      uniqueCountries: Array.from(countries),
      uniqueOwners: Array.from(owners),
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (currentView === 'Hot Leads' && !l.is_hot_target) return false;
      if (currentView === 'No Website' && l.website_status !== 'No Website') return false;
      if (currentView === 'No GMB' && l.gmb_status !== 'No GMB' && l.gmb_status !== 'Thin GMB') return false;
      if (currentView === 'No Google Ads' && l.google_ads_status !== 'No Ads') return false;
      if (currentView === 'No Meta Pixel' && l.meta_pixel_status !== 'No Pixel') return false;
      if (currentView === 'High Value' && (l.estimated_retainer || 0) < 2400) return false;
      if (currentView === 'Needs Follow-Up' && l.pipeline_stage !== 'Contacted' && l.pipeline_stage !== 'Audit Sent') return false;
      if (currentView === 'New Leads' && l.pipeline_stage !== 'New Lead') return false;
      if (stageFilter !== 'All' && l.pipeline_stage !== stageFilter) return false;
      if (nicheFilter !== 'All' && l.niche !== nicheFilter) return false;
      if (countryFilter !== 'All' && l.country !== countryFilter) return false;
      if (ownerFilter !== 'All' && l.owner !== ownerFilter) return false;
      if (l.lead_score < scoreRange[0] || l.lead_score > scoreRange[1]) return false;
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
        const matchesOwner = l.owner?.toLowerCase().includes(q);
        if (!matchesName && !matchesContact && !matchesPhone && !matchesEmail && !matchesCity && !matchesNiche && !matchesGaps && !matchesId && !matchesOwner) {
          return false;
        }
      }
      return true;
    });
  }, [leads, currentView, stageFilter, nicheFilter, countryFilter, ownerFilter, searchQuery, scoreRange]);

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
  }, [sortedLeads, currentPage, pageSize]);

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
      setSelectedLeadIds(new Set(paginatedLeads.map((l) => l.lead_id)));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleSelectRow = (leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  // ── Bulk Reassign via API ────────────────────────────────────────────────
  const handleBulkReassign = async () => {
    if (!selectedMemberId || selectedLeadIds.size === 0) return;
    setIsAssigning(true);
    setAssignError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/leads/reassign-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ leadIds: Array.from(selectedLeadIds), targetMemberId: selectedMemberId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.error || 'Failed to reassign leads');
        return;
      }
      setShowBulkReassignModal(false);
      setSelectedMemberId('');
      setSelectedLeadIds(new Set());
    } catch (e: any) {
      setAssignError(e.message || 'Network error during reassignment');
    } finally {
      setIsAssigning(false);
    }
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
      Country: l.country || 'USA',
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

  const ownerBadgeColor = (owner: string) => {
    if (owner?.toLowerCase().includes('sophia')) return 'bg-violet-900/40 text-violet-300 border border-violet-500/30';
    return 'bg-slate-800 text-slate-300 border border-slate-700/50';
  };

  return (
    <div id="mca-leads-page" className="flex flex-col gap-4 w-full min-h-0">
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
            Production CRM — 0–100 explainable scoring, detected gaps, verified contacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAddLead && (
            <button
              onClick={onOpenAddLead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          )}

          <a
            href="https://drive.google.com/drive/folders/13CDyT2NXYzZtZ-2Jj-TX3Fh6pQz9Dvi7?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Go to Excel Sheet</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80" />
          </a>

          <button
            onClick={() => setShowColumnConverter(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            <Table className="w-3.5 h-3.5 text-indigo-400" />
            <span>Convert Columns</span>
          </button>

          {onOpenImport && (
            <div className="relative">
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 shadow-sm overflow-hidden">
                <button
                  onClick={() => onOpenImport('upload')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Import Leads</span>
                </button>
                <button
                  onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
                  className="px-2 py-2 border-l border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {isImportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-[#0e1322] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-40 space-y-1 text-xs">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                    Select Import Source
                  </div>
                  <button
                    onClick={() => { setIsImportMenuOpen(false); setShowColumnConverter(true); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200 transition-colors text-left cursor-pointer border border-emerald-500/20 bg-emerald-500/5"
                  >
                    <Table className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-emerald-300">Convert Columns &amp; Paste Data</div>
                      <div className="text-[10px] text-emerald-400/80">Convert any Excel columns for Suite</div>
                    </div>
                  </button>
                  <button onClick={() => { setIsImportMenuOpen(false); onOpenImport('upload'); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div><div className="font-semibold text-white">CSV or Excel (.csv, .xlsx)</div><div className="text-[10px] text-slate-400">Spreadsheet file upload</div></div>
                  </button>
                  <button onClick={() => { setIsImportMenuOpen(false); onOpenImport('sheets'); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer">
                    <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div><div className="font-semibold text-white">Google Sheet Link</div><div className="text-[10px] text-slate-400">Live fetch via shared link or ID</div></div>
                  </button>
                  <button onClick={() => { setIsImportMenuOpen(false); onOpenImport('paste'); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div><div className="font-semibold text-white">Paste Raw Data</div><div className="text-[10px] text-slate-400">Copy &amp; paste CSV, TSV, JSON</div></div>
                  </button>
                  <div className="border-t border-slate-800/80 my-1 pt-1">
                    <a href="/suite_leads_template.xlsx" download="suite_leads_template.xlsx" className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer">
                      <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div><div className="font-semibold">Download Template (.xlsx)</div><div className="text-[10px] text-slate-400">28-column database schema</div></div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {onClearAllLeads && leads.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete all ${leads.length} leads?`)) {
                  onClearAllLeads();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-rose-900/40 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved Views Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80">
        {(['All Leads','Hot Leads','No Website','No GMB','No Google Ads','No Meta Pixel','High Value','Needs Follow-Up','New Leads'] as ViewFilterType[]).map((view) => (
          <button
            key={view}
            onClick={() => { setCurrentView(view); setCurrentPage(1); }}
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, owner, niche, gaps..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showAdvancedFilters || stageFilter !== 'All' || nicheFilter !== 'All' || ownerFilter !== 'All'
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLeadIds.size > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-indigo-300 font-mono">{selectedLeadIds.size} selected</span>
            <div className="h-4 w-px bg-indigo-500/30" />
            <button onClick={() => { setAssignError(null); setShowBulkReassignModal(true); }} className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Bulk Assign
            </button>
            <button onClick={() => setShowBulkStageModal(true)} className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              Move Stage
            </button>
            <button onClick={() => onTriggerAIEnrichment(Array.from(selectedLeadIds))} className="text-xs text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Enrich AI
            </button>
            <button onClick={() => setShowConfirmDelete(true)} className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Pipeline Stage</label>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200">
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
            <select value={nicheFilter} onChange={(e) => setNicheFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200">
              <option value="All">All Niches</option>
              {uniqueNiches.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Assigned To</label>
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200">
              <option value="All">All Owners</option>
              {uniqueOwners.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Country</label>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200">
              <option value="All">All Countries</option>
              {uniqueCountries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Score Range</label>
            <div className="flex gap-2">
              <input type="number" value={scoreRange[0]} onChange={(e) => setScoreRange([Number(e.target.value), scoreRange[1]])} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200" min="0" max="100" />
              <input type="number" value={scoreRange[1]} onChange={(e) => setScoreRange([scoreRange[0], Number(e.target.value)])} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200" min="0" max="100" />
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setStageFilter('All'); setNicheFilter('All'); setCountryFilter('All'); setOwnerFilter('All'); setScoreRange([0, 100]); setSearchQuery(''); }} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* CRM Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-xl flex-1 min-h-0 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-2.5 w-8 text-center"></th>
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedLeadIds.has(l.lead_id))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th onClick={() => handleSort('business_name')} className="p-2.5 cursor-pointer hover:text-white min-w-[160px]">
                  <div className="flex items-center gap-1.5"><span>Business</span><ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-2.5 min-w-[90px]">Location</th>
                <th className="p-2.5 min-w-[100px]">Contact</th>
                <th className="p-2.5 min-w-[80px]">GMB</th>
                <th className="p-2.5 min-w-[80px]">Website</th>
                <th className="p-2.5 min-w-[120px]">Gaps</th>
                <th className="p-2.5 min-w-[120px]">Opportunity</th>
                <th onClick={() => handleSort('lead_score')} className="p-2.5 cursor-pointer hover:text-white text-center min-w-[60px]">
                  <div className="flex items-center justify-center gap-1.5"><span>Score</span><ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('estimated_retainer')} className="p-2.5 cursor-pointer hover:text-white text-right min-w-[90px]">
                  <div className="flex items-center justify-end gap-1.5"><span>Retainer</span><ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-2.5 text-center min-w-[90px]">Stage</th>
                {/* NEW: Assigned To column */}
                <th onClick={() => handleSort('owner')} className="p-2.5 cursor-pointer hover:text-white min-w-[120px]">
                  <div className="flex items-center gap-1.5"><span>Assigned To</span><ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-2.5 text-center min-w-[60px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-10 h-10 text-slate-600" />
                      <p className="font-semibold">No leads match your current filters.</p>
                      <p className="text-xs text-slate-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.has(lead.lead_id);
                  const isExpanded = expandedLeadId === lead.lead_id;
                  return (
                    <React.Fragment key={lead.lead_id}>
                      <tr className={`hover:bg-slate-800/40 transition-colors group ${isSelected ? 'bg-indigo-950/20' : ''}`}>
                        <td className="p-2.5 text-center">
                          <button onClick={() => setExpandedLeadId(isExpanded ? null : lead.lead_id)}>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => { e.stopPropagation(); handleSelectRow(lead.lead_id); }}
                            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-2.5 min-w-[160px]">
                          <div onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }} className="cursor-pointer group-hover:text-indigo-300 font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">{lead.business_name}</span>
                            {lead.is_hot_target && <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-300 whitespace-nowrap">{lead.city || '—'}</td>
                        <td className="p-2.5 whitespace-nowrap text-slate-300">{lead.phone || '—'}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${lead.gmb_status === 'No GMB' ? 'bg-rose-900/40 text-rose-300' : lead.gmb_status === 'Thin GMB' ? 'bg-amber-900/40 text-amber-300' : 'text-slate-400'}`}>
                            {lead.gmb_status || 'Established'}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${lead.website_status === 'No Website' ? 'bg-rose-900/40 text-rose-300' : 'text-slate-400'}`}>
                            {lead.website_status || 'Active'}
                          </span>
                        </td>
                        <td className="p-2.5 min-w-[120px]">
                          <span className="text-slate-300 text-[11px] leading-tight">{lead.gaps?.slice(0, 2).join(', ') || '—'}{lead.gaps?.length > 2 ? ` +${lead.gaps.length - 2}` : ''}</span>
                        </td>
                        <td className="p-2.5 min-w-[120px]">
                          <span className="text-slate-300 text-[11px]">{lead.recommended_service || '—'}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-200">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${lead.lead_score >= 80 ? 'text-emerald-300' : lead.lead_score >= 60 ? 'text-amber-300' : 'text-slate-300'}`}>
                            {lead.lead_score}
                          </span>
                        </td>
                        <td className="p-2.5 text-right whitespace-nowrap font-mono text-emerald-400 text-xs">
                          ${(lead.estimated_retainer || 0).toLocaleString()}/mo
                        </td>
                        <td className="p-2.5 text-center min-w-[90px]">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium whitespace-nowrap">
                            {lead.pipeline_stage}
                          </span>
                        </td>
                        {/* Assigned To */}
                        <td className="p-2.5 min-w-[120px]">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate max-w-[110px] block ${ownerBadgeColor(lead.owner || '')}`}>
                            {lead.owner || 'Unassigned'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center min-w-[60px]">
                          <button onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View</button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-950/50">
                          <td colSpan={14} className="px-6 py-3">
                            <div className="text-xs text-slate-300 grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div><span className="text-slate-500 font-semibold">GMB:</span> {lead.gmb_status} ({lead.gmb_rating} ★, {lead.gmb_review_count} reviews)</div>
                              <div><span className="text-slate-500 font-semibold">Website:</span> {lead.website || 'No Website'}</div>
                              <div><span className="text-slate-500 font-semibold">All Gaps:</span> {lead.gaps?.join(', ') || '—'}</div>
                              <div><span className="text-slate-500 font-semibold">Email:</span> {lead.email || '—'}</div>
                              <div><span className="text-slate-500 font-semibold">Niche:</span> {lead.niche || '—'}</div>
                              <div><span className="text-slate-500 font-semibold">State:</span> {lead.state || '—'}</div>
                              <div><span className="text-slate-500 font-semibold">Retainer:</span> ${(lead.estimated_retainer || 0).toLocaleString()}/mo</div>
                              <div><span className="text-slate-500 font-semibold">Assigned:</span> {lead.owner || 'Unassigned'}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {sortedLeads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
          </div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bulk Reassign Modal (fully wired to API) ──────────────────────── */}
      {showBulkReassignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Bulk Assign {selectedLeadIds.size} Leads</h3>
                <p className="text-xs text-slate-400 mt-0.5">Reassign selected leads to a sales team member</p>
              </div>
              <button onClick={() => setShowBulkReassignModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Select Sales Team Member:</label>
              {teamMembers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Loading team members…</p>
              ) : (
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">— Select a team member —</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={String(m.id)}>{m.displayName} ({m.role})</option>
                  ))}
                </select>
              )}
            </div>

            {assignError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {assignError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowBulkReassignModal(false); setAssignError(null); }} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
                Cancel
              </button>
              <button
                disabled={!selectedMemberId || isAssigning}
                onClick={handleBulkReassign}
                className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isAssigning ? (
                  <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> Assigning…</>
                ) : (
                  <><UserCheck className="w-3.5 h-3.5" /> Assign {selectedLeadIds.length} Leads</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stage Modal */}
      {showBulkStageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Bulk Update Stage ({selectedLeadIds.size} Leads)</h3>
              <button onClick={() => setShowBulkStageModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <select value={bulkStageTarget} onChange={(e) => setBulkStageTarget(e.target.value as PipelineStage)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200">
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Audit Sent">Audit Sent</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Retainer">Retainer</option>
              <option value="Archived">Archived</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowBulkStageModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
              <button 
                disabled={isBulkUpdating}
                onClick={async () => {
                  setIsBulkUpdating(true);
                  await onBulkUpdateStage(Array.from(selectedLeadIds), bulkStageTarget);
                  setSelectedLeadIds(new Set());
                  setShowBulkStageModal(false);
                  setIsBulkUpdating(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50"
              >
                {isBulkUpdating ? 'Updating...' : 'Update Leads'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">Delete {selectedLeadIds.size} Leads?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">This cannot be undone. {selectedLeadIds.size} lead records will be permanently removed.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowConfirmDelete(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
              <button onClick={() => { onBulkDelete(Array.from(selectedLeadIds)); setSelectedLeadIds(new Set()); setShowConfirmDelete(false); }} className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ExcelColumnConverterModal
        isOpen={showColumnConverter}
        onClose={() => setShowColumnConverter(false)}
        existingLeads={leads}
        onImportComplete={(imported, source, count) => {
          if (onImportComplete) onImportComplete(imported, source, count);
          setShowColumnConverter(false);
        }}
      />
    </div>
  );
};
