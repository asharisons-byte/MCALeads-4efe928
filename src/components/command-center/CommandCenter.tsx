import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  RefreshCw,
  Sliders,
  Download,
  Search,
  Sparkles,
  Filter,
  Bot,
  ChevronDown,
} from 'lucide-react';
import {
  Lead,
  ActivityEvent,
  DateRangeOption,
  CustomDateRange,
  CommandCenterWidgetConfig,
  AgencyAlert,
  SophiaDailyBriefingData,
  SophiaExecutiveInsight,
  Campaign,
  TodayPriorityItem,
  SMSMessage,
} from '../../types';
import {
  getWidgetConfigs,
  saveWidgetConfigs,
  calculateRevenueMetrics,
  calculatePipelineForecast,
  calculateSalesFunnel,
  getHotLeadsRequiringAttention,
  getTodayPriorities,
  generateLocalSophiaBriefing,
  generateSophiaExecutiveInsights,
  getLeadsAtRisk,
  calculateChannelPerformance,
  getCampaigns,
  calculateRevenueByService,
  calculateRevenueByIndustry,
  calculateRevenueByLocation,
  calculateDailyActivitySummary,
  getPipelineMovements,
  calculateAgencyHealthScore,
  detectDataQualityIssues,
  detectDuplicateLeads,
  saveDuplicateDecision,
  generateAgencyAlerts,
  dismissAlert,
  getTeamPerformanceMetrics,
  filterLeadsByDate,
  FunnelStep,
} from '../../services/commandCenterService';
import {
  getStoredCallRecords,
} from '../../services/telephonyService';
import {
  getFollowUpTasks,
  getAggregatedObjections,
} from '../../services/callIntelligenceService';
import { getEmailDrafts } from '../../services/emailService';
import { getSMSMessages } from '../../services/messagingService';
import {
  fetchSophiaDailyBriefing,
  fetchSophiaExecutiveInsights,
} from '../../services/geminiService';

// Subcomponents
import { ExecutiveKPICards } from './ExecutiveKPICards';
import { SophiaBriefingAndPriorities } from './SophiaBriefingAndPriorities';
import { AlertsAndQuickActions } from './AlertsAndQuickActions';
import { RevenueAndFunnelSection } from './RevenueAndFunnelSection';
import { HotLeadsAndRiskSection } from './HotLeadsAndRiskSection';
import { SophiaExecutiveInsightsWidget } from './SophiaExecutiveInsightsWidget';
import { CrossChannelAndCampaignSection } from './CrossChannelAndCampaignSection';
import { CallIntelligenceAndObjectionsWidget } from './CallIntelligenceAndObjectionsWidget';
import { RevenueBreakdownsSection } from './RevenueBreakdownsSection';
import { ActivityAndHealthSection } from './ActivityAndHealthSection';
import { DashboardCustomizerModal } from './DashboardCustomizerModal';
import { ExportReportModal } from './ExportReportModal';
import { GlobalSearchCommandModal } from './GlobalSearchCommandModal';
import { NewCampaignModal } from './NewCampaignModal';

// Phase 5A Executive Intelligence Views & Modals
import { getClients, getProposals } from '../../services/conversionService';
import { calculateAgencyHealthBreakdown } from '../../services/executiveIntelligenceService';
import { ExecutiveOverviewView } from './ExecutiveOverviewView';
import { ExecutiveTelemetryGrid } from './ExecutiveTelemetryGrid';
import { ExecutiveRevenueView } from './ExecutiveRevenueView';
import { ExecutivePipelineView } from './ExecutivePipelineView';
import { ExecutiveClientsView } from './ExecutiveClientsView';
import { ExecutiveMarketsView } from './ExecutiveMarketsView';
import { ExecutiveServicesView } from './ExecutiveServicesView';
import { ExecutiveAIWorkforceView } from './ExecutiveAIWorkforceView';
import { ExecutiveGoalsView } from './ExecutiveGoalsView';
import { ExecutiveAlertsView } from './ExecutiveAlertsView';
import { ExecutiveReportsView } from './ExecutiveReportsView';
import { AskSophiaModal } from './AskSophiaModal';
import { HealthScoreBreakdownModal } from './HealthScoreBreakdownModal';

interface CommandCenterProps {
  leads: Lead[];
  activities: ActivityEvent[];
  onOpenLead: (leadId: string) => void;
  onOpenDialer: (leadId?: string) => void;
  onStartAICall: (leadId: string) => void;
  onOpenEmailModal: (leadId?: string) => void;
  onOpenSMSModal: (leadId?: string) => void;
  onViewPipeline: () => void;
  onViewFollowUps: () => void;
  onViewCampaigns: () => void;
  onViewCallIntelligence: () => void;
  onFilterByStage?: (stage: string) => void;
  onRefreshData?: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  leads,
  activities,
  onOpenLead,
  onOpenDialer,
  onStartAICall,
  onOpenEmailModal,
  onOpenSMSModal,
  onViewPipeline,
  onViewFollowUps,
  onViewCampaigns,
  onViewCallIntelligence,
  onFilterByStage,
  onRefreshData,
}) => {
  // State: Date Filtering
  const [dateOption, setDateOption] = useState<DateRangeOption>('Today');
  const [customRange, setCustomRange] = useState<CustomDateRange>({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State: Modal controls
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isAskSophiaOpen, setIsAskSophiaOpen] = useState(false);
  const [isWhyScoreOpen, setIsWhyScoreOpen] = useState(false);

  // State: Executive Command Center Navigation Tab
  const [currentSection, setCurrentSection] = useState<
    | 'overview'
    | 'revenue'
    | 'pipeline'
    | 'clients'
    | 'markets'
    | 'services'
    | 'ai_workforce'
    | 'goals'
    | 'alerts'
    | 'reports'
    | 'settings'
  >('overview');

  // State: Widget configs
  const [widgetConfigs, setWidgetConfigs] = useState<CommandCenterWidgetConfig[]>(() =>
    getWidgetConfigs()
  );

  // State: Briefing & AI Insights
  const [briefing, setBriefing] = useState<SophiaDailyBriefingData | null>(null);
  const [executiveInsights, setExecutiveInsights] = useState<SophiaExecutiveInsight[]>([]);
  const [isRefreshingBriefing, setIsRefreshingBriefing] = useState(false);

  // Dynamic telemetry from underlying stores
  const [calls, setCalls] = useState(() => getStoredCallRecords());
  const [followUps, setFollowUps] = useState(() => getFollowUpTasks());
  const [campaigns, setCampaigns] = useState(() => getCampaigns());
  const [alerts, setAlerts] = useState<AgencyAlert[]>([]);
  const [duplicateDecisionsKey, setDuplicateDecisionsKey] = useState(0);

  // Refresh active datasets
  const reloadTelemetry = () => {
    setCalls(getStoredCallRecords());
    setFollowUps(getFollowUpTasks());
    setCampaigns(getCampaigns());
    if (onRefreshData) onRefreshData();
  };

  // Keyboard shortcut for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update alerts when leads or followups change
  useEffect(() => {
    const generatedAlerts = generateAgencyAlerts(leads, followUps, campaigns);
    setAlerts(generatedAlerts);
  }, [leads, followUps, campaigns]);

  // Calculations grounded strictly in verified CRM data
  const filteredLeads = useMemo(() => {
    // When viewing "Today" or "Yesterday", we show all pipeline leads for comprehensive pipeline stats,
    // but filter activities strictly by date.
    return leads;
  }, [leads, dateOption, customRange]);

  const revenueMetrics = useMemo(() => calculateRevenueMetrics(filteredLeads), [filteredLeads]);
  const forecast = useMemo(() => calculatePipelineForecast(filteredLeads, activities), [filteredLeads, activities]);
  const funnelSteps = useMemo(() => calculateSalesFunnel(filteredLeads, activities), [filteredLeads, activities]);
  const hotLeads = useMemo(() => getHotLeadsRequiringAttention(filteredLeads, calls, followUps), [filteredLeads, calls, followUps]);
  const todayPriorities = useMemo(() => getTodayPriorities(filteredLeads, followUps, calls), [filteredLeads, followUps, calls]);
  const leadsAtRisk = useMemo(() => getLeadsAtRisk(filteredLeads, activities, followUps), [filteredLeads, activities, followUps]);
  const drafts = useMemo(() => getEmailDrafts(), []);
  const [messages, setMessages] = useState<SMSMessage[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      setMessages(await getSMSMessages());
    }
    fetchMessages();
  }, []);
  const channelMetrics = useMemo(
    () => calculateChannelPerformance(activities, calls, drafts, messages, filteredLeads),
    [activities, calls, drafts, messages, filteredLeads]
  );
  const objections = useMemo(() => getAggregatedObjections(), [calls]);
  const serviceRevenue = useMemo(() => calculateRevenueByService(filteredLeads), [filteredLeads]);
  const industryRevenue = useMemo(() => calculateRevenueByIndustry(filteredLeads), [filteredLeads]);
  const locationRevenue = useMemo(() => calculateRevenueByLocation(filteredLeads), [filteredLeads]);
  const activitySummary = useMemo(
    () => calculateDailyActivitySummary(activities, dateOption, customRange),
    [activities, dateOption, customRange]
  );
  const pipelineMovements = useMemo(() => getPipelineMovements(activities, filteredLeads), [activities, filteredLeads]);
  const healthScore = useMemo(
    () => calculateAgencyHealthScore(filteredLeads, followUps, activities, campaigns),
    [filteredLeads, followUps, activities, campaigns]
  );
  const dataQualityIssues = useMemo(() => detectDataQualityIssues(filteredLeads), [filteredLeads]);
  const duplicatePairs = useMemo(() => detectDuplicateLeads(filteredLeads), [filteredLeads, duplicateDecisionsKey]);
  const teamPerformance = useMemo(
    () => getTeamPerformanceMetrics(activities, calls, filteredLeads),
    [activities, calls, filteredLeads]
  );

  // Executive Intelligence Clients, Proposals & Health Matrix
  const clients = useMemo(() => getClients(), []);
  const proposals = useMemo(() => getProposals(), []);
  const healthBreakdown = useMemo(
    () =>
      calculateAgencyHealthBreakdown(
        filteredLeads,
        clients,
        proposals,
        followUps,
        activities,
        campaigns
      ),
    [filteredLeads, clients, proposals, followUps, activities, campaigns]
  );

  // Initialize or fetch Sophia Daily Briefing & Insights
  const refreshBriefingAndInsights = async () => {
    setIsRefreshingBriefing(true);
    try {
      // Local fallback ready immediately
      const localBriefing = generateLocalSophiaBriefing(filteredLeads, followUps, calls, campaigns);
      const localInsights = generateSophiaExecutiveInsights(filteredLeads, followUps, calls, campaigns);

      // Attempt AI call to Gemini backend
      const aiBriefing = await fetchSophiaDailyBriefing({
        followUpsDue: localBriefing.highlights.follow_ups_due_count,
        hotLeadsCount: localBriefing.highlights.hot_leads_count,
        proposalCount: localBriefing.highlights.proposal_requests_count,
        activeCampaigns: localBriefing.highlights.active_sequences_count,
        pipelineMRR: localBriefing.highlights.pipeline_mrr,
        wonMRR: localBriefing.highlights.won_mrr,
        topPriority: localBriefing.top_priority,
      });

      if (aiBriefing && aiBriefing.summary_paragraphs) {
        setBriefing({
          ...localBriefing,
          greeting: aiBriefing.greeting || localBriefing.greeting,
          summary_paragraphs: aiBriefing.summary_paragraphs,
          top_priority: aiBriefing.top_priority || localBriefing.top_priority,
        });
      } else {
        setBriefing(localBriefing);
      }

      // Fetch AI executive insights
      const aiInsights = await fetchSophiaExecutiveInsights({
        pipelineMRR: revenueMetrics.estimatedPipelineMRR,
        wonMRR: revenueMetrics.confirmedWonMRR,
        overdueFollowUpsCount: followUps.filter((f) => f.status === 'Pending').length,
        stalledProposalsCount: filteredLeads.filter((l) => l.pipeline_stage === 'Proposal Sent').length,
        hotLeadsCount: hotLeads.length,
        activeCampaignsCount: campaigns.length,
      });

      if (aiInsights && Array.isArray(aiInsights) && aiInsights.length > 0) {
        const validatedInsights = aiInsights.map((ins: any, idx: number) => ({
          ...ins,
          id: ins.id || `ai-insight-${idx}-${Date.now()}`,
        }));
        setExecutiveInsights(validatedInsights);
      } else {
        setExecutiveInsights(localInsights);
      }
    } catch (err) {
      console.warn('Briefing refresh failed, using deterministic local engine:', err);
      setBriefing(generateLocalSophiaBriefing(filteredLeads, followUps, calls, campaigns));
      setExecutiveInsights(generateSophiaExecutiveInsights(filteredLeads, followUps, calls, campaigns));
    } finally {
      setIsRefreshingBriefing(false);
    }
  };

  useEffect(() => {
    refreshBriefingAndInsights();
  }, [filteredLeads.length]);

  // Handlers
  const handleSaveWidgetConfigs = (newConfigs: CommandCenterWidgetConfig[]) => {
    setWidgetConfigs(newConfigs);
    saveWidgetConfigs(newConfigs);
  };

  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleExecuteAlertAction = (alert: AgencyAlert) => {
    if (alert.action_type === 'ai_call' && alert.related_lead_id) {
      onStartAICall(alert.related_lead_id);
    } else if (alert.action_type === 'call' && alert.related_lead_id) {
      onOpenDialer(alert.related_lead_id);
    } else if (alert.action_type === 'follow_up') {
      onViewFollowUps();
    } else if (alert.action_type === 'campaign') {
      onViewCampaigns();
    } else if (alert.related_lead_id) {
      onOpenLead(alert.related_lead_id);
    }
  };

  const handleResolveDuplicate = (pairId: string, decision: 'Merged' | 'Kept Separate') => {
    saveDuplicateDecision(pairId, decision);
    setDuplicateDecisionsKey((k) => k + 1);
  };

  // Helper to test if a widget is visible
  const isWidgetVisible = (widgetId: string) => {
    const config = widgetConfigs.find((w) => w.id === widgetId);
    return config ? config.visible : true;
  };

  return (
    <div id="mca-command-center" className="space-y-5 pb-4">
      {/* ── PrimaryMetricsTopGrid (Stitch): ten headline numbers pinned at the very top ── */}
      <ExecutiveTelemetryGrid leads={filteredLeads} clients={clients} onNavigateTab={(tab) => setCurrentSection(tab as any)} />

      {/* ── ControlSubStrip (Stitch) ── */}
      <section className="space-y-3" data-purpose="sub-strip-controls">
        <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">Agency Command Center</h1>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded font-bold">
                Executive View
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Marketing Charm Agency • Sophia AI Autonomous Sales &amp; Revenue Intelligence
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date range */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition"
              >
                <i className="fa-regular fa-calendar text-cyan-400"></i>
                <span>{dateOption}</span>
                <i className="fa-solid fa-chevron-down text-[9px] text-slate-500 ml-1"></i>
              </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-panel bg-mca-surface rounded-xl shadow-2xl p-2 z-30 space-y-1">
                {(
                  [
                    'Today',
                    'Yesterday',
                    'Last 7 Days',
                    'Last 30 Days',
                    'This Month',
                    'Last Month',
                    'Custom Range',
                  ] as DateRangeOption[]
                ).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateOption(opt);
                      if (opt !== 'Custom Range') setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateOption === opt
                        ? 'bg-mca-hover text-mca-neonGreen font-bold'
                        : 'text-slate-300 hover:bg-mca-hover'
                    }`}
                  >
                    {opt}
                  </button>
                ))}

                {dateOption === 'Custom Range' && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5 px-1">
                    <input
                      type="date"
                      value={customRange.startDate}
                      onChange={(e) => setCustomRange((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full text-xs p-1.5 rounded bg-mca-void/80 border border-white/10 text-slate-200"
                    />
                    <input
                      type="date"
                      value={customRange.endDate}
                      onChange={(e) => setCustomRange((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full text-xs p-1.5 rounded bg-mca-void/80 border border-white/10 text-slate-200"
                    />
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="w-full py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                    >
                      Apply Range
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Refresh telemetry */}
            <button
              onClick={() => {
                reloadTelemetry();
                refreshBriefingAndInsights();
              }}
              disabled={isRefreshingBriefing}
              className="w-8 h-8 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/10 text-xs text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-50"
              title="Refresh Feed"
            >
              <i className={`fa-solid fa-arrows-rotate ${isRefreshingBriefing ? 'animate-spin' : ''}`}></i>
            </button>

            {/* Customize layout */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="w-8 h-8 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/10 text-xs text-slate-400 hover:text-white flex items-center justify-center transition"
              title="Customize Dashboard Layout"
            >
              <i className="fa-solid fa-sliders"></i>
            </button>

            {/* Ask Sophia About My Agency */}
            <button
              onClick={() => setIsAskSophiaOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-600/50 text-xs font-semibold text-purple-200 flex items-center gap-2 transition shadow-neon-purple"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-cyan-300"></i>
              <span>Ask Sophia About My Agency</span>
            </button>

            {/* Export report */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition"
            >
              <i className="fa-solid fa-download text-slate-400"></i>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Quick sub-navigation tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-mca-border">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'pipeline', label: 'Pipeline' },
            { id: 'clients', label: 'Clients' },
            { id: 'markets', label: 'Markets' },
            { id: 'services', label: 'Services' },
            { id: 'ai_workforce', label: 'AI Workforce' },
            { id: 'goals', label: 'Goals & KPIs' },
            { id: 'alerts', label: 'Alerts', badge: alerts.length },
            { id: 'reports', label: 'Executive Reports' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1.5 ${
                currentSection === tab.id
                  ? 'bg-mca-surface text-mca-neonGreen font-semibold border-b-2 border-mca-neonGreen'
                  : 'text-slate-400 hover:text-white hover:bg-mca-hover/50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 3. SECTION VIEWS */}
      {currentSection === 'overview' && (
        <div className="space-y-6">
          <ExecutiveOverviewView
            leads={filteredLeads}
            clients={clients}
            proposals={proposals}
            followUps={followUps}
            activities={activities}
            healthBreakdown={healthBreakdown}
            onOpenWhyScore={() => setIsWhyScoreOpen(true)}
            onOpenAskSophia={() => setIsAskSophiaOpen(true)}
            onNavigateTab={(tab) => setCurrentSection(tab)}
            onOpenLead={onOpenLead}
            onStartAICall={onStartAICall}
            onOpenDialer={onOpenDialer}
          />

          {isWidgetVisible('executive_insights') && executiveInsights.length > 0 && (
            <SophiaExecutiveInsightsWidget
              insights={executiveInsights}
              onExecuteAction={(insight) => {
                if (insight.affected_lead_ids && insight.affected_lead_ids.length > 0) {
                  onOpenLead(insight.affected_lead_ids[0]);
                } else {
                  onViewPipeline();
                }
              }}
              onRefreshInsights={refreshBriefingAndInsights}
            />
          )}

          {isWidgetVisible('call_intelligence_summary') && (
            <CallIntelligenceAndObjectionsWidget
              calls={calls}
              objections={objections}
              followUps={followUps}
              onOpenCallIntelligence={onViewCallIntelligence}
              onOpenFollowUpQueue={onViewFollowUps}
            />
          )}

          {/* ── OperationsAndIntegrity (Stitch) ── */}
          {isWidgetVisible('agency_health_score') && (
            <ActivityAndHealthSection
              activitySummary={activitySummary}
              pipelineMovements={pipelineMovements}
              activities={activities}
              healthScore={healthScore}
              dataQualityIssues={dataQualityIssues}
              duplicatePairs={duplicatePairs}
              teamPerformance={teamPerformance}
              onOpenLead={onOpenLead}
              onResolveDuplicate={handleResolveDuplicate}
            />
          )}

          {/* ── Extended analytics (customizable widgets) ── */}
          <div className="flex items-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Detailed Telemetry &amp; Analytics</h2>
            <span className="flex-1 h-px bg-mca-border"></span>
          </div>

          {/* Quick Action Bar & Alerts */}
          <AlertsAndQuickActions
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
            onExecuteAlertAction={handleExecuteAlertAction}
            onAddNewLead={() => onOpenLead('')}
            onOpenDialer={() => onOpenDialer()}
            onOpenAIDispatch={() => onStartAICall(leads[0]?.lead_id || '')}
            onOpenEmailModal={() => onOpenEmailModal()}
            onOpenSMSModal={() => onOpenSMSModal()}
            onOpenExportModal={() => setIsExportOpen(true)}
            onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
            onOpenDataQualityModal={() => setIsCustomizerOpen(true)}
          />

          {/* Detailed Telemetry Modules */}
          {isWidgetVisible('kpi_cards') && (
            <ExecutiveKPICards
              metrics={revenueMetrics}
              hotLeadsCount={hotLeads.length}
              followUpsDueCount={followUps.filter((f) => f.status === 'Pending').length}
              activeCampaignsCount={campaigns.filter((c) => c.status === 'Active').length}
              onFilterHotLeads={() => {
                if (onFilterByStage) onFilterByStage('Hot');
              }}
              onViewFollowUps={onViewFollowUps}
              onViewPipeline={onViewPipeline}
              onViewCampaigns={onViewCampaigns}
            />
          )}

          {isWidgetVisible('briefing_and_priorities') && briefing && (
            <SophiaBriefingAndPriorities
              briefing={briefing}
              priorities={todayPriorities}
              leads={filteredLeads}
              onRefreshBriefing={refreshBriefingAndInsights}
              isRefreshing={isRefreshingBriefing}
              onOpenLead={onOpenLead}
              onStartCall={(id) => onOpenDialer(id)}
              onStartAICall={onStartAICall}
              onSendEmail={(id) => onOpenEmailModal(id)}
              onSendSMS={(id) => onOpenSMSModal(id)}
            />
          )}

          {isWidgetVisible('sales_funnel') && (
            <RevenueAndFunnelSection
              revenueMetrics={revenueMetrics}
              funnelSteps={funnelSteps}
              forecastStages={forecast.stages}
              hasReliableForecast={forecast.hasReliableForecast}
              historyNotice={forecast.historyNotice}
              onFilterFunnelStep={(step) => {
                if (onFilterByStage && step.stageFilter) {
                  onFilterByStage(step.stageFilter);
                }
              }}
            />
          )}

          {isWidgetVisible('hot_leads_panel') && (
            <HotLeadsAndRiskSection
              hotLeads={hotLeads}
              leadsAtRisk={leadsAtRisk}
              onOpenLead={onOpenLead}
              onStartCall={(id) => onOpenDialer(id)}
              onStartAICall={onStartAICall}
              onSendEmail={(id) => onOpenEmailModal(id)}
              onSendSMS={(id) => onOpenSMSModal(id)}
            />
          )}

        </div>
      )}

      {currentSection === 'revenue' && (
        <ExecutiveRevenueView
          leads={filteredLeads}
          clients={clients}
          proposals={proposals}
          onOpenClient={(id) => setCurrentSection('clients')}
        />
      )}

      {currentSection === 'pipeline' && (
        <div className="space-y-6">
          <ExecutivePipelineView
            leads={filteredLeads}
            clients={clients}
            activities={activities}
            onOpenLead={onOpenLead}
            onFilterByStage={onFilterByStage}
            onStartCall={onStartAICall}
          />
          <HotLeadsAndRiskSection
            hotLeads={hotLeads}
            leadsAtRisk={leadsAtRisk}
            onOpenLead={onOpenLead}
            onStartCall={(id) => onOpenDialer(id)}
            onStartAICall={onStartAICall}
            onSendEmail={(id) => onOpenEmailModal(id)}
            onSendSMS={(id) => onOpenSMSModal(id)}
          />
        </div>
      )}

      {currentSection === 'clients' && (
        <ExecutiveClientsView
          clients={clients}
          onOpenClient={(id) => {}}
          onOpenFollowUp={onViewFollowUps}
        />
      )}

      {currentSection === 'markets' && (
        <ExecutiveMarketsView
          leads={filteredLeads}
          clients={clients}
          onOpenLead={onOpenLead}
        />
      )}

      {currentSection === 'services' && (
        <ExecutiveServicesView
          clients={clients}
          leads={filteredLeads}
        />
      )}

      {currentSection === 'ai_workforce' && (
        <ExecutiveAIWorkforceView />
      )}

      {currentSection === 'goals' && (
        <ExecutiveGoalsView followUps={followUps} />
      )}

      {currentSection === 'alerts' && (
        <ExecutiveAlertsView
          onOpenClient={(id) => setCurrentSection('clients')}
          onOpenLead={onOpenLead}
          onStartCall={onStartAICall}
        />
      )}

      {currentSection === 'reports' && (
        <ExecutiveReportsView
          leads={filteredLeads}
          clients={clients}
          proposals={proposals}
          followUps={followUps}
        />
      )}

      {currentSection === 'settings' && (
        <div className="bg-mca-card rounded-xl p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-black text-white">Dashboard & Telemetry Settings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize visible executive widgets, audit data quality, and resolve duplicate records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-mca-void/50 space-y-2">
              <h4 className="text-sm font-bold text-white">Widget Customization</h4>
              <p className="text-xs text-slate-300">
                Reorder or toggle visibility for all command center widgets.
              </p>
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-4 py-2 rounded-xl bg-mca-hover hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Open Layout Customizer
              </button>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-mca-void/50 space-y-2">
              <h4 className="text-sm font-bold text-white">Data Integrity Controls</h4>
              <p className="text-xs text-slate-300">
                {duplicatePairs.length} duplicate lead pairs identified • {dataQualityIssues.length} quality warnings.
              </p>
              <button
                onClick={() => setCurrentSection('overview')}
                className="px-4 py-2 rounded-xl border border-white/15 bg-mca-card hover:bg-mca-void/40 text-slate-200 font-bold text-xs transition-colors"
              >
                Inspect Data Quality
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        configs={widgetConfigs}
        onSaveConfigs={handleSaveWidgetConfigs}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={{
          leads: filteredLeads,
          activities,
          calls,
          campaigns,
          followUps,
        }}
      />

      <GlobalSearchCommandModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        leads={filteredLeads}
        onSelectLead={onOpenLead}
        onAddNewLead={() => onOpenLead('')}
        onOpenDialer={() => onOpenDialer()}
        onOpenAIDispatch={() => onStartAICall(leads[0]?.lead_id || '')}
        onOpenFollowUpQueue={onViewFollowUps}
        onOpenExportModal={() => setIsExportOpen(true)}
      />

      <NewCampaignModal
        isOpen={isNewCampaignOpen}
        onClose={() => setIsNewCampaignOpen(false)}
        leads={filteredLeads}
        onCampaignCreated={() => setCampaigns(getCampaigns())}
      />

      {/* Phase 5A Executive Modals */}
      <AskSophiaModal
        isOpen={isAskSophiaOpen}
        onClose={() => setIsAskSophiaOpen(false)}
        leads={filteredLeads}
        clients={clients}
        proposals={proposals}
        followUps={followUps}
        activities={activities}
      />

      <HealthScoreBreakdownModal
        isOpen={isWhyScoreOpen}
        onClose={() => setIsWhyScoreOpen(false)}
        breakdown={healthBreakdown}
      />
    </div>
  );
};
