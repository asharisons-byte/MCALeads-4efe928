import React, { useState, useMemo } from 'react';
import {
  Lead,
  PriorityTier,
  ScoringEngineConfig,
  LeadTemperature,
  AgencyServiceName,
} from '../types';
import {
  calculateMultiDimensionalScores,
  getScoringConfig,
  saveScoringConfig,
  bulkScoreLeads,
  DEFAULT_SCORING_CONFIG,
} from '../services/leadIntelligenceService';
import {
  Sparkles,
  Target,
  Sliders,
  Filter,
  Search,
  ArrowUpDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Phone,
  Bot,
  Mail,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  DollarSign,
  ShieldAlert,
  Flame,
  Layers,
  Award,
} from 'lucide-react';

interface LeadIntelligenceViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onOpenCall?: (lead: Lead) => void;
  onOpenAICall?: (lead: Lead) => void;
  onOpenEmail?: (lead: Lead) => void;
  onOpenSMS?: (lead: Lead) => void;
}

type SubTab = 'priority_queue' | 'top_opportunities' | 'research_required' | 'service_matrix' | 'scoring_config';

export const LeadIntelligenceView: React.FC<LeadIntelligenceViewProps> = ({
  leads,
  onSelectLead,
  onUpdateLead,
  onOpenCall,
  onOpenAICall,
  onOpenEmail,
  onOpenSMS,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('priority_queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Bulk Scoring state
  const [isBulkScoring, setIsBulkScoring] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, step: '' });

  // Config state
  const [config, setConfig] = useState<ScoringEngineConfig>(() => getScoringConfig());
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Compute intelligence for all leads (memoized)
  const scoredLeads = useMemo(() => {
    return leads.map((lead) => {
      const intel = lead.intelligence || calculateMultiDimensionalScores(lead, config);
      return {
        ...lead,
        intelligence: intel,
        overall_priority_score: intel.overall_priority_score,
        priority_tier: intel.priority_tier,
        opportunity_score: intel.opportunity_score,
        service_match_score: intel.service_match_score,
        revenue_potential_score: intel.revenue_potential_score,
        contactability_score: intel.contactability_score,
        buying_intent_score: intel.buying_intent_score,
        data_confidence_score: intel.data_confidence_score,
        lead_temperature: intel.lead_temperature,
      };
    });
  }, [leads, config]);

  // Unique industries
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.niche) set.add(l.niche);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filtered Leads for Priority Queue
  const filteredQueueLeads = useMemo(() => {
    return scoredLeads
      .filter((lead) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = lead.business_name?.toLowerCase().includes(q);
          const matchContact = lead.contact_name?.toLowerCase().includes(q);
          const matchCity = lead.city?.toLowerCase().includes(q);
          const matchNiche = lead.niche?.toLowerCase().includes(q);
          if (!matchName && !matchContact && !matchCity && !matchNiche) return false;
        }

        // Tier Filter
        if (tierFilter !== 'all' && lead.priority_tier !== tierFilter) return false;

        // Temperature Filter
        if (tempFilter !== 'all' && lead.lead_temperature !== tempFilter) return false;

        // Service Filter
        if (
          serviceFilter !== 'all' &&
          lead.intelligence?.recommended_primary_service !== serviceFilter &&
          lead.intelligence?.recommended_secondary_service !== serviceFilter
        ) {
          return false;
        }

        // Industry Filter
        if (industryFilter !== 'all' && lead.niche !== industryFilter) return false;

        // Min Priority Score
        if (minScoreFilter > 0 && (lead.overall_priority_score || 0) < minScoreFilter) return false;

        return true;
      })
      .sort((a, b) => (b.overall_priority_score || 0) - (a.overall_priority_score || 0));
  }, [scoredLeads, searchQuery, tierFilter, tempFilter, serviceFilter, industryFilter, minScoreFilter]);

  // Research Required Queue (Tier E, missing key info or low confidence)
  const researchRequiredLeads = useMemo(() => {
    return scoredLeads
      .filter((lead) => {
        const intel = lead.intelligence;
        if (!intel) return false;
        const missingBoth = !intel.contactability_breakdown.has_valid_phone && !intel.contactability_breakdown.has_valid_email;
        const lowConfidence = intel.data_confidence_score < 40;
        const isTierE = intel.priority_tier === 'TIER E';
        return isTierE || missingBoth || lowConfidence;
      })
      .sort((a, b) => (a.data_confidence_score || 0) - (b.data_confidence_score || 0));
  }, [scoredLeads]);

  // Sophia's Top Opportunities (Top 10 High Priority / Tier A & B)
  const topOpportunities = useMemo(() => {
    return [...scoredLeads]
      .sort((a, b) => (b.overall_priority_score || 0) - (a.overall_priority_score || 0))
      .slice(0, 8);
  }, [scoredLeads]);

  // Global Service Opportunity Matrix Aggregation
  const serviceMatrixAggregation = useMemo(() => {
    const services: AgencyServiceName[] = [
      'Website Development',
      'Website SEO',
      'Technical Optimization',
      'Google Business Profile Optimization',
      'Google Ads Management',
      'Meta Ads',
      'Reputation Management',
      'Voice Search Optimization',
      'Lead Generation Systems',
    ];

    return services.map((serviceName) => {
      let matchCount = 0;
      let totalValue = 0;
      const topLeads: Lead[] = [];

      scoredLeads.forEach((lead) => {
        const srv = lead.intelligence?.service_matrix.find((s) => s.service === serviceName);
        if (srv && srv.match_score >= 70) {
          matchCount++;
          totalValue += srv.estimated_value_monthly;
          if (topLeads.length < 3 && srv.match_score >= 85) {
            topLeads.push(lead);
          }
        }
      });

      const matchRate = leads.length > 0 ? Math.round((matchCount / leads.length) * 100) : 0;

      return {
        service: serviceName,
        matchCount,
        matchRate,
        totalValue,
        topLeads,
      };
    });
  }, [scoredLeads, leads.length]);

  // Run Bulk AI Scoring
  const handleRunBulkScoring = async () => {
    setIsBulkScoring(true);
    try {
      await bulkScoreLeads(leads, (current, total, step) => {
        setBulkProgress({ current, total, step });
      });
      // Trigger update on parent
      if (onUpdateLead && leads.length > 0) {
        onUpdateLead(leads[0].lead_id, { updated_at: new Date().toISOString() });
      }
    } catch (e) {
      console.error('Bulk scoring error', e);
    } finally {
      setIsBulkScoring(false);
    }
  };

  // Save Scoring Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveScoringConfig(config);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_SCORING_CONFIG);
    saveScoringConfig(DEFAULT_SCORING_CONFIG);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  const getTierBadge = (tier: PriorityTier) => {
    switch (tier) {
      case 'TIER A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'TIER B':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'TIER C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'TIER D':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'TIER E':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div id="mca-lead-intelligence-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 3B Engine
            </span>
            <span className="text-xs text-slate-400">Sophia AI Acquisition Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span>AI Lead Scoring & Acquisition Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Algorithmic 8-dimensional lead ranking, evidence-first gap analysis, and automated Sophia opportunity matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRunBulkScoring}
            disabled={isBulkScoring}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBulkScoring ? 'animate-spin' : ''}`} />
            <span>{isBulkScoring ? 'Scoring Leads...' : 'Analyze & Score All Leads'}</span>
          </button>
        </div>
      </div>

      {/* Bulk Scoring Progress Bar if active */}
      {isBulkScoring && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
            <span>Analyzing Leads {bulkProgress.current} / {bulkProgress.total}</span>
            <span>{Math.round((bulkProgress.current / (bulkProgress.total || 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${(bulkProgress.current / (bulkProgress.total || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-indigo-300 italic">{bulkProgress.step}</p>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'priority_queue', label: `Lead Priority Queue (${filteredQueueLeads.length})`, icon: Target },
          { id: 'top_opportunities', label: `Sophia's Top Opportunities (${topOpportunities.length})`, icon: Award },
          { id: 'research_required', label: `Research Required Queue (${researchRequiredLeads.length})`, icon: ShieldAlert },
          { id: 'service_matrix', label: 'Service Opportunity Matrix', icon: Layers },
          { id: 'scoring_config', label: 'Scoring Engine Configuration', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LEAD PRIORITY QUEUE (Section 20) */}
      {activeTab === 'priority_queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search business, contact, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Priority Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Priority Tiers</option>
              <option value="TIER A">TIER A (Immediate Priority 90-100)</option>
              <option value="TIER B">TIER B (High Priority 75-89)</option>
              <option value="TIER C">TIER C (Qualified 55-74)</option>
              <option value="TIER D">TIER D (Low Priority 35-54)</option>
              <option value="TIER E">TIER E (Research Required &lt;35)</option>
            </select>

            {/* Lead Temperature Filter */}
            <select
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Temperatures</option>
              <option value="Hot">Hot Target</option>
              <option value="Warm">Warm Target</option>
              <option value="Cold">Cold Target</option>
              <option value="Dormant">Dormant</option>
            </select>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Industries</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Service Match Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Recommended Services</option>
              <option value="Website Development">Website Development</option>
              <option value="Website SEO">Website SEO</option>
              <option value="Technical Optimization">Technical Optimization</option>
              <option value="Google Business Profile Optimization">Google Business Profile</option>
              <option value="Google Ads Management">Google Ads</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Reputation Management">Reputation Management</option>
            </select>
          </div>

          {/* Queue Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/40">
                    <th className="py-3 px-4">Business & Location</th>
                    <th className="py-3 px-3">Tier</th>
                    <th className="py-3 px-3">Priority Score</th>
                    <th className="py-3 px-3">Opportunity</th>
                    <th className="py-3 px-3">Est. Retainer</th>
                    <th className="py-3 px-3">Primary Service</th>
                    <th className="py-3 px-3">Next Action</th>
                    <th className="py-3 px-4 text-right">Outreach Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredQueueLeads.map((lead) => {
                    const intel = lead.intelligence;
                    const tier = intel?.priority_tier || 'TIER C';
                    return (
                      <tr
                        key={lead.lead_id}
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => onSelectLead(lead)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{lead.business_name}</span>
                            {lead.is_hot_target && (
                              <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {lead.niche || 'Contractor'} • {lead.city || 'Oregon'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider border ${getTierBadge(
                              tier
                            )}`}
                          >
                            {tier}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white">
                              {intel?.overall_priority_score || lead.overall_priority_score || 70}
                            </span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{
                                  width: `${intel?.overall_priority_score || lead.overall_priority_score || 70}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-purple-400 text-xs">
                            {intel?.opportunity_score || lead.opportunity_score || 75}/100
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-emerald-400 text-xs">
                            ${intel?.estimated_retainer_min.toLocaleString()} – ${intel?.estimated_retainer_max.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-slate-200 truncate max-w-[160px]">
                          {intel?.recommended_primary_service || lead.recommended_service}
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 truncate max-w-[180px] text-[11px]">
                          {intel?.sophia_brief?.recommended_first_action || 'Initial audit & outreach'}
                        </td>

                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenCall && (
                              <button
                                onClick={() => onOpenCall(lead)}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 transition-colors"
                                title="Call Lead"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onOpenAICall && (
                              <button
                                onClick={() => onOpenAICall(lead)}
                                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 transition-colors"
                                title="Sophia AI Call"
                              >
                                <Bot className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onOpenEmail && (
                              <button
                                onClick={() => onOpenEmail(lead)}
                                className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 transition-colors"
                                title="Send Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onOpenSMS && (
                              <button
                                onClick={() => onOpenSMS(lead)}
                                className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 transition-colors"
                                title="Send SMS"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="View Full Profile"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: SOPHIA'S TOP OPPORTUNITIES (Section 21) */}
      {activeTab === 'top_opportunities' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Sophia's Highest-Leverage Client Acquisition Opportunities</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by composite revenue potential, confirmed digital gaps, and high contactability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topOpportunities.map((lead, idx) => {
              const intel = lead.intelligence;
              return (
                <div
                  key={lead.lead_id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => onSelectLead(lead)}>
                          {lead.business_name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {lead.niche || 'Contractor'} • {lead.city || 'Oregon'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400">
                        ${intel?.estimated_retainer_min.toLocaleString()} – ${intel?.estimated_retainer_max.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                        Est. Monthly Retainer
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider mb-1">
                      WHY IT MATTERS & BEST OPPORTUNITY
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {intel?.sophia_brief?.why_this_lead_matters || 'High fit with verified digital marketing opportunities.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <div className="text-xs text-slate-400">
                      Primary Service: <strong className="text-slate-200">{intel?.recommended_primary_service}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenAICall && (
                        <button
                          onClick={() => onOpenAICall(lead)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Bot className="w-3 h-3" />
                          <span>AI Call</span>
                        </button>
                      )}
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RESEARCH REQUIRED QUEUE (Section 23) */}
      {activeTab === 'research_required' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Lead Research Required Queue</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Leads missing essential contact points, with low data confidence, or needing deeper audit investigation.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-3">Data Confidence</th>
                  <th className="py-3 px-4">Missing Information</th>
                  <th className="py-3 px-4">Recommended Research Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {researchRequiredLeads.map((lead) => {
                  const intel = lead.intelligence;
                  const missing = intel?.data_confidence_breakdown.missing_fields || [];
                  return (
                    <tr key={lead.lead_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{lead.business_name}</div>
                        <div className="text-[11px] text-slate-400">{lead.niche} • {lead.city}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          {intel?.data_confidence_score || 30}% ({intel?.data_confidence_breakdown.status || 'Low'})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {missing.map((m, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs">
                        Run CCB license registry lookup & domain ownership check to locate direct owner email.
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE OPPORTUNITY MATRIX (Section 24) */}
      {activeTab === 'service_matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Full-Agency Service Opportunity Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative agency pipeline revenue potential across each MCA service line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serviceMatrixAggregation.map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm">{item.service}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.matchRate}% Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Matched Leads</span>
                    <div className="text-lg font-bold text-white mt-0.5">{item.matchCount}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pipeline Retainer</span>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                      ${item.totalValue.toLocaleString()}/mo
                    </div>
                  </div>
                </div>

                {item.topLeads.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-semibold block mb-1">Top Prospects:</span>
                    <div className="space-y-1">
                      {item.topLeads.map((l) => (
                        <div
                          key={l.lead_id}
                          onClick={() => onSelectLead(l)}
                          className="flex items-center justify-between text-slate-300 hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          <span className="truncate">{l.business_name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SCORING ENGINE CONFIGURATION (Section 28) */}
      {activeTab === 'scoring_config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Scoring Weights & Threshold Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust multi-dimensional scoring weights and priority tier classification boundaries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetConfig}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Reset Defaults
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-colors"
              >
                Save Weights
              </button>
            </div>
          </div>

          {configSavedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Scoring configuration saved successfully. Scores will update dynamically across all leads.</span>
            </div>
          )}

          {/* Weights Sliders */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Dimensional Weights (Must Sum to 100%)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Opportunity Weight</span>
                  <span className="text-indigo-400 font-bold">{config.weights.opportunity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.weights.opportunity}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, opportunity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Service Match Weight</span>
                  <span className="text-indigo-400 font-bold">{config.weights.service_match}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.weights.service_match}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, service_match: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Revenue Potential Weight</span>
                  <span className="text-indigo-400 font-bold">{config.weights.revenue_potential}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.weights.revenue_potential}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, revenue_potential: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Contactability Weight</span>
                  <span className="text-indigo-400 font-bold">{config.weights.contactability}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.weights.contactability}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, contactability: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Buying Intent Weight</span>
                  <span className="text-indigo-400 font-bold">{config.weights.buying_intent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.weights.buying_intent}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, buying_intent: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Engagement Weight</span>
                  <span className="text-indigo-400 font-bold">{config.weights.engagement}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.weights.engagement}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, engagement: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Priority Tier Thresholds */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Priority Tier Cutoff Boundaries (0–100)
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <label className="text-slate-400 block mb-1">TIER A Minimum</label>
                <input
                  type="number"
                  value={config.tier_thresholds.tier_a}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tier_thresholds: { ...config.tier_thresholds, tier_a: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <label className="text-slate-400 block mb-1">TIER B Minimum</label>
                <input
                  type="number"
                  value={config.tier_thresholds.tier_b}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tier_thresholds: { ...config.tier_thresholds, tier_b: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <label className="text-slate-400 block mb-1">TIER C Minimum</label>
                <input
                  type="number"
                  value={config.tier_thresholds.tier_c}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tier_thresholds: { ...config.tier_thresholds, tier_c: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <label className="text-slate-400 block mb-1">TIER D Minimum</label>
                <input
                  type="number"
                  value={config.tier_thresholds.tier_d}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tier_thresholds: { ...config.tier_thresholds, tier_d: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
