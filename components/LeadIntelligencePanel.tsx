import React, { useState } from 'react';
import {
  Lead,
  LeadIntelligence,
  PriorityTier,
  EvidenceBasedPainPoint,
  ScoreExplanation,
  ScoreHistory,
} from '../types';
import {
  getOrComputeLeadIntelligence,
  fetchAILeadIntelligence,
  applyScoreManualOverride,
  getScoreHistoryForLead,
} from '../services/leadIntelligenceService';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Zap,
  Target,
  Clock,
  ExternalLink,
  ChevronRight,
  Edit3,
  History,
  CheckCircle2,
  XCircle,
  Sliders,
  Send,
  PhoneCall,
  Bot,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

interface LeadIntelligencePanelProps {
  lead: Lead;
  onUpdateLead?: (leadId: string, updates: Partial<Lead>) => void;
  onExecuteAction?: (action: string) => void;
  onOpenCall?: () => void;
  onOpenAICall?: () => void;
  onOpenEmail?: () => void;
  onOpenSMS?: () => void;
}

export const LeadIntelligencePanel: React.FC<LeadIntelligencePanelProps> = ({
  lead,
  onUpdateLead,
  onExecuteAction,
  onOpenCall,
  onOpenAICall,
  onOpenEmail,
  onOpenSMS,
}) => {
  const [intelligence, setIntelligence] = useState<LeadIntelligence>(() =>
    getOrComputeLeadIntelligence(lead)
  );
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [selectedExplanation, setSelectedExplanation] = useState<ScoreExplanation | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideScoreType, setOverrideScoreType] = useState('overall_priority_score');
  const [overrideValue, setOverrideValue] = useState<number>(intelligence.overall_priority_score);
  const [overrideReason, setOverrideReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<ScoreHistory[]>([]);

  const handleRefreshAI = async () => {
    setIsRefreshingAI(true);
    try {
      const updated = await fetchAILeadIntelligence(lead);
      setIntelligence(updated);
      if (onUpdateLead) {
        onUpdateLead(lead.lead_id, {
          intelligence: updated,
          overall_priority_score: updated.overall_priority_score,
          priority_tier: updated.priority_tier,
          opportunity_score: updated.opportunity_score,
          service_match_score: updated.service_match_score,
          revenue_potential_score: updated.revenue_potential_score,
          contactability_score: updated.contactability_score,
          buying_intent_score: updated.buying_intent_score,
          data_confidence_score: updated.data_confidence_score,
        });
      }
    } catch (e) {
      console.error('Failed to run AI Lead Intelligence', e);
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;

    const updated = applyScoreManualOverride(
      lead,
      overrideScoreType,
      Number(overrideValue),
      overrideReason.trim(),
      'Agency Director'
    );
    setIntelligence(updated);
    setShowOverrideModal(false);
    setOverrideReason('');

    if (onUpdateLead) {
      onUpdateLead(lead.lead_id, {
        intelligence: updated,
        overall_priority_score: updated.overall_priority_score,
        priority_tier: updated.priority_tier,
      });
    }
  };

  const handleOpenHistory = () => {
    const list = getScoreHistoryForLead(lead.lead_id);
    setHistoryList(list);
    setShowHistoryModal(true);
  };

  const getTierColor = (tier: PriorityTier) => {
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

  const getTemperatureBadge = (temp: string) => {
    switch (temp) {
      case 'Hot':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Warm':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Cold':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div id="mca-lead-intelligence-panel" className="space-y-6">
      {/* Top Banner: Overall Priority Score & Tiers */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Circular / Large Score Badge */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-inner">
              <div className="text-center">
                <span className="text-3xl font-black tracking-tight text-white">
                  {intelligence.overall_priority_score}
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                  Priority
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getTierColor(
                    intelligence.priority_tier
                  )}`}
                >
                  {intelligence.priority_tier}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTemperatureBadge(
                    intelligence.lead_temperature
                  )}`}
                >
                  {intelligence.lead_temperature} Target
                </span>
                {intelligence.manual_overrides && intelligence.manual_overrides.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    <span>Manual Override Active</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                <span>Client Acquisition Intelligence</span>
                <span className="text-xs font-normal text-slate-400">
                  (Phase 3B Multi-Dimensional Scoring Engine)
                </span>
              </h2>

              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Algorithmic qualification synthesized across 8 dimensions. Priority ranking combines
                verified digital marketing opportunities, reachability, and client revenue potential.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setSelectedExplanation(intelligence.score_explanations?.overall_priority)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Why This Score?</span>
            </button>

            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Override Score</span>
            </button>

            <button
              onClick={handleOpenHistory}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Score History</span>
            </button>

            <button
              onClick={handleRefreshAI}
              disabled={isRefreshingAI}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAI ? 'animate-spin' : ''}`} />
              <span>{isRefreshingAI ? 'Analyzing with Gemini...' : 'Re-Analyze with Gemini'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Independent Multi-Dimensional Scores Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>8-Dimensional Acquisition Scores (0–100 Scale)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Independent evaluations without penalizing unverified data
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Opportunity Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Opportunity Score</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.opportunity)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.opportunity_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Verified digital marketing gaps & optimization room
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${intelligence.opportunity_score}%` }}
              />
            </div>
          </div>

          {/* 2. Service Match Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Service Match</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.service_match)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.service_match_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Primary: <strong className="text-slate-200">{intelligence.recommended_primary_service}</strong>
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${intelligence.service_match_score}%` }}
              />
            </div>
          </div>

          {/* 3. Revenue Potential Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Revenue Potential</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.revenue_potential)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.revenue_potential_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1 truncate">
                ${intelligence.estimated_retainer_min.toLocaleString()} – ${intelligence.estimated_retainer_max.toLocaleString()}/mo
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${intelligence.revenue_potential_score}%` }}
              />
            </div>
          </div>

          {/* 4. Contactability Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Contactability</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.contactability)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.contactability_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                {intelligence.contactability_breakdown.has_valid_phone && (
                  <span className="flex items-center gap-0.5 text-emerald-400">
                    <Phone className="w-3 h-3" /> Phone
                  </span>
                )}
                {intelligence.contactability_breakdown.has_valid_email && (
                  <span className="flex items-center gap-0.5 text-sky-400">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full"
                style={{ width: `${intelligence.contactability_score}%` }}
              />
            </div>
          </div>

          {/* 5. Buying Intent Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Buying Intent</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.buying_intent)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.buying_intent_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Confidence: <span className="text-slate-200">{intelligence.buying_intent_signals.confidence}</span>
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${intelligence.buying_intent_score}%` }}
              />
            </div>
          </div>

          {/* 6. Data Confidence Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Data Confidence</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.data_confidence)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.data_confidence_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Audit: {intelligence.data_confidence_breakdown.audit_completeness}% verified
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full"
                style={{ width: `${intelligence.data_confidence_score}%` }}
              />
            </div>
          </div>

          {/* 7. Engagement Score */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Engagement Score</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.engagement)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {intelligence.engagement_score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Phase 2F communications track
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${intelligence.engagement_score}%` }}
              />
            </div>
          </div>

          {/* 8. Overall Priority Score */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span className="font-bold">Overall Priority</span>
                <button
                  onClick={() => setSelectedExplanation(intelligence.score_explanations?.overall_priority)}
                  className="text-indigo-400 hover:text-white transition-colors"
                  title="Explain Score"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {intelligence.overall_priority_score}
                <span className="text-xs font-normal text-indigo-300">/100</span>
              </div>
              <p className="text-[11px] text-indigo-200 font-semibold mt-1 truncate">
                {intelligence.priority_tier} Ranking
              </p>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                style={{ width: `${intelligence.overall_priority_score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sophia Lead Brief Card (Section 13) */}
      {intelligence.sophia_brief && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Sophia Lead Brief</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold">
                    AI Sales Representative
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Grounded executive summary for instantaneous call or message preparation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAICall}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Launch Sophia AI Call</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                WHY THIS LEAD MATTERS
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                {intelligence.sophia_brief.why_this_lead_matters}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                BEST OPPORTUNITY
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                {intelligence.sophia_brief.best_opportunity}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                WHY NOW
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                {intelligence.sophia_brief.why_now}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                BEST CONTACT METHOD
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                {intelligence.sophia_brief.best_contact_method}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 md:col-span-2">
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                RECOMMENDED FIRST ACTION
              </div>
              <div className="flex items-center justify-between gap-3 mt-1.5">
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {intelligence.sophia_brief.recommended_first_action}
                </p>
                {onExecuteAction && (
                  <button
                    onClick={() => onExecuteAction(intelligence.sophia_brief?.recommended_first_action || 'Call')}
                    className="shrink-0 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[11px] font-bold text-white transition-colors"
                  >
                    Execute
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Pain Point Detection: Evidence-First (Section 14 & 15) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Evidence-First AI Pain Point Detection</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strictly grounded: distinguishes verified CRM facts from AI interpretations and agency recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              VERIFIED FACT
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              AI INTERPRETATION
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              RECOMMENDATION
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {intelligence.pain_points && intelligence.pain_points.length > 0 ? (
            intelligence.pain_points.map((pt) => (
              <div
                key={pt.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                      {pt.category}
                    </span>
                    <h4 className="text-xs font-bold text-white">{pt.finding}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Confidence: <strong className="text-slate-200">{pt.confidence}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                    <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                      VERIFIED FACT
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {pt.evidence.replace(/^VERIFIED FACT:\s*/i, '')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                    <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      AI INTERPRETATION
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {pt.business_impact.replace(/^AI INTERPRETATION:\s*/i, '')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                    <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                      RECOMMENDATION
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {pt.recommended_service.replace(/^RECOMMENDATION:\s*/i, '')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No critical pain points detected yet. Click Re-Analyze with Gemini to generate full audit.
            </div>
          )}
        </div>
      </div>

      {/* Service Opportunity Matrix (Section 24) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Service Opportunity Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Algorithmic match score and estimated monthly retainer value across all 9 MCA offerings.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            Est. Retainer: ${intelligence.estimated_retainer_min.toLocaleString()} – ${intelligence.estimated_retainer_max.toLocaleString()}/mo
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Match Score</th>
                <th className="py-2.5 px-3">Opportunity</th>
                <th className="py-2.5 px-3">Est. Value</th>
                <th className="py-2.5 px-3">Pitch Angle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {intelligence.service_matrix.map((srv, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {srv.service}
                    {idx === 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                        Primary
                      </span>
                    )}
                    {idx === 1 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-bold">
                        Secondary
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{srv.match_score}</span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${srv.match_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        srv.opportunity_level === 'High'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : srv.opportunity_level === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {srv.opportunity_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    ${srv.estimated_value_monthly.toLocaleString()}/mo
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={srv.pitch_angle}>
                    {srv.pitch_angle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommended Outreach Strategy (Section 25) */}
      {intelligence.recommended_strategy && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Recommended Outreach Strategy</span>
            </h3>
            <span className="text-[11px] text-slate-400">Optimized multi-touch conversion path</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Primary Channel</div>
              <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                <span>{intelligence.recommended_strategy.first_channel}</span>
                <span className="text-xs text-slate-400">→</span>
                <span className="text-xs text-slate-400">{intelligence.recommended_strategy.second_channel}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Recommended Timing</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">
                {intelligence.recommended_strategy.recommended_timing}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Primary Offer Hook</div>
              <div className="text-xs font-semibold text-emerald-400 mt-1">
                {intelligence.recommended_strategy.primary_offer}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 md:col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Call-to-Action</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">
                {intelligence.recommended_strategy.call_to_action}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Direct Actions</div>
                <div className="text-xs text-slate-400 mt-0.5">Begin outreach sequence</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenCall}
                  className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors"
                  title="Call Prospect"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenAICall}
                  className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-colors"
                  title="Sophia AI Call"
                >
                  <Bot className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenEmail}
                  className="p-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 transition-colors"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenSMS}
                  className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-colors"
                  title="Send SMS"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Score Explanation ([Why This Score?]) */}
      {selectedExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>{selectedExplanation.score_name}</span>
                </h3>
                <span className="text-xs font-semibold text-indigo-400">
                  Current Value: {selectedExplanation.score_value}/100
                </span>
              </div>
              <button
                onClick={() => setSelectedExplanation(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider mb-1">
                  Positive Influencing Factors
                </h4>
                {selectedExplanation.positive_factors.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedExplanation.positive_factors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">None flagged</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider mb-1">
                  Negative / Limiting Factors
                </h4>
                {selectedExplanation.negative_factors.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedExplanation.negative_factors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-200">
                        <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No negative factors detected</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                  Missing / Unknown Data Points (Not Penalized)
                </h4>
                {selectedExplanation.missing_data.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedExplanation.missing_data.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">All key fields confirmed</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider mb-1">
                  Calculation Formula & Summary
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {selectedExplanation.calculation_summary}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedExplanation(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Score Manual Override */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveOverride}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Manual Score Override</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Score to Override</label>
                <select
                  value={overrideScoreType}
                  onChange={(e) => {
                    setOverrideScoreType(e.target.value);
                    setOverrideValue((intelligence as any)[e.target.value] || 80);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="overall_priority_score">Overall Priority Score</option>
                  <option value="opportunity_score">Opportunity Score</option>
                  <option value="service_match_score">Service Match Score</option>
                  <option value="revenue_potential_score">Revenue Potential Score</option>
                  <option value="contactability_score">Contactability Score</option>
                  <option value="buying_intent_score">Buying Intent Score</option>
                  <option value="data_confidence_score">Data Confidence Score</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  New Score Value (0–100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-center text-white text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reason for Override <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Prospect confirmed direct budget allocation on owner call."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                Original algorithmic scores remain preserved in audit history. Manual overrides are stamped with user ID and timestamp.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-colors shadow-md"
              >
                Save Override
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Score History (Section 18) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                <span>Score Change History</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {historyList.length > 0 ? (
                historyList.map((h) => (
                  <div
                    key={h.history_id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-white capitalize">
                        {h.score_type.replace(/_/g, ' ')}
                      </span>
                      <span>{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">{h.previous_value}</span>
                      <span className="text-indigo-400">→</span>
                      <span className="font-bold text-emerald-400">{h.new_value}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">Source: {h.source}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">{h.reason}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No score modifications recorded yet for this prospect.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
