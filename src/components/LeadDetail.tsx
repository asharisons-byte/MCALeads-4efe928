import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Award,
  Sparkles,
  Bot,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Send,
  Trash2,
  Edit2,
  Check,
  Copy,
  RefreshCw,
  FileText,
  HelpCircle,
  BarChart,
  ShieldCheck,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import {
  Lead,
  PipelineStage,
  LeadNote,
  ActivityEvent,
  Communication,
  CommunicationChannel,
  CommunicationStatus,
  CallRecord,
  AuditReport,
  Proposal,
} from '../types';
import { analyzeLeadWithAI } from '../services/geminiService';
import {
  getLeadActivities,
  getLeads,
  scheduleFollowUp,
  completeFollowUp,
  addActivity,
} from '../services/leadService';
import {
  getCommunications,
  saveCommunication,
  getSophiaRecommendedAction,
} from '../services/communicationService';
import { getStoredCallRecords } from '../services/telephonyService';
import { getAllCallIntelligence } from '../services/callIntelligenceService';
import {
  getAuditsByLead,
  getProposalsByLead,
} from '../services/conversionService';
import { AuditDetailModal } from './AuditDetailModal';
import { ProposalDetailModal } from './ProposalDetailModal';
import { AuditGenerationModal } from './AuditGenerationModal';
import { ProposalCreationModal } from './ProposalCreationModal';
import { CallDetailModal } from './CallDetailModal';
import { SophiaRecommendsCard } from './SophiaRecommendsCard';
import { LeadActionBar } from './LeadActionBar';
import { ActivityTimeline } from './ActivityTimeline';
import { FollowUpModal } from './FollowUpModal';
import { CommunicationModal } from './CommunicationModal';
import { EmailComposerModal } from './EmailComposerModal';
import { SMSComposerModal } from './SMSComposerModal';
import { SMSConversationView } from './SMSConversationView';
import { DialerModal } from './DialerModal';
import { SophiaAICallModal } from './SophiaAICallModal';
import { LeadIntelligencePanel } from './LeadIntelligencePanel';
import { TelephonyService } from '../services/telephonyService';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onAddNote: (leadId: string, content: string, activityType: LeadNote['activity_type']) => void;
  onDeleteNote: (leadId: string, noteId: string) => void;
  leads: Lead[];
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  onBack,
  onUpdateLead,
  onAddNote,
  onDeleteNote,
  leads,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'lead_intelligence'
    | 'activity'
    | 'sms_thread'
    | 'call_intelligence'
    | 'overview'
    | 'gaps'
    | 'ai_intelligence'
    | 'scoring'
    | 'notes'
    | 'original_data'
  >('lead_intelligence');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<LeadNote['activity_type']>('Discovery');
  const [newNoteAuthor, setNewNoteAuthor] = useState<'Agency User' | 'Sophia (AI Sales Rep)'>('Agency User');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Modal States
  const [activeCommChannel, setActiveCommChannel] = useState<CommunicationChannel | null>(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [isSMSComposerOpen, setIsSMSComposerOpen] = useState(false);
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [isSophiaAICallOpen, setIsSophiaAICallOpen] = useState(false);
  const [smsPrefill, setSmsPrefill] = useState<string | undefined>(undefined);
  const [selectedCallForModal, setSelectedCallForModal] = useState<CallRecord | null>(null);

  // Phase 3C: Audits & Proposals State
  const [selectedAuditForModal, setSelectedAuditForModal] = useState<AuditReport | null>(null);
  const [selectedProposalForModal, setSelectedProposalForModal] = useState<Proposal | null>(null);
  const [isAuditGenModalOpen, setIsAuditGenModalOpen] = useState(false);
  const [isProposalCreateModalOpen, setIsProposalCreateModalOpen] = useState(false);

  // Activities & Communications State
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    getLeadActivities(lead.lead_id, lead)
  );
  const [communications, setCommunications] = useState<Communication[]>(() =>
    getCommunications(lead.lead_id)
  );

  // Phase 2F: Call Intelligence & Records for this Lead
  const leadCalls = getStoredCallRecords().filter(
    (c) => c.lead_id === lead.lead_id || (lead.phone && c.phone_number.includes(lead.phone.replace(/\D/g, '').slice(-7)))
  );
  const allIntel = getAllCallIntelligence();
  const latestIntel = allIntel.find((i) => i.lead_id === lead.lead_id);

  useEffect(() => {
    setActivities(getLeadActivities(lead.lead_id, lead));
    setCommunications(getCommunications(lead.lead_id));
  }, [lead.lead_id, lead.notes, lead.pipeline_stage, lead.upcoming_follow_up]);

  // Sophia's reasoned next best action
  const recommendation = getSophiaRecommendedAction(lead, activities, communications);

  // Handle stage update
  const handleStageChange = (newStage: PipelineStage) => {
    onUpdateLead(lead.lead_id, { pipeline_stage: newStage });
  };

  // Re-run AI analysis with Gemini
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const enrichment = await analyzeLeadWithAI(lead);
      onUpdateLead(lead.lead_id, {
        ai_enrichment: enrichment,
        opportunity_angle: enrichment.opportunity_angle,
        recommended_service: enrichment.recommended_service,
        estimated_retainer: enrichment.estimated_retainer,
        estimated_revenue_lift: enrichment.estimated_revenue_lift,
        pain_points: enrichment.pain_points,
      });
      setActiveTab('ai_intelligence');
    } catch (e) {
      console.error('Failed to run AI analysis', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    onAddNote(lead.lead_id, newNoteContent.trim(), newNoteType);
    setNewNoteContent('');
    setTimeout(() => {
      setActivities(getLeadActivities(lead.lead_id, lead));
    }, 50);
  };

  // Schedule Follow-Up
  const handleScheduleFollowUp = async (data: {
    date: string;
    time?: string;
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    note?: string;
  }) => {
    const createdFollowUp = await scheduleFollowUp(lead.lead_id, data);
    if (createdFollowUp) {
      onUpdateLead(lead.lead_id, { upcoming_follow_up: createdFollowUp });
      setActivities(getLeadActivities(lead.lead_id, lead));
    }
  };

  // Complete Follow-Up
  const handleCompleteFollowUp = () => {
    completeFollowUp(lead.lead_id);
    onUpdateLead(lead.lead_id, { upcoming_follow_up: undefined });
    setActivities(getLeadActivities(lead.lead_id, lead));
  };

  // Log Communication Record & Timeline Activity
  const handleLogCommunication = (commData: {
    channel: CommunicationChannel;
    direction: 'OUTBOUND' | 'INBOUND';
    status: CommunicationStatus;
    subject?: string;
    content: string;
    metadata?: Record<string, any>;
  }) => {
    saveCommunication({
      lead_id: lead.lead_id,
      contact_id: `contact-${lead.lead_id}`,
      channel: commData.channel,
      direction: commData.direction,
      status: commData.status,
      subject: commData.subject,
      content: commData.content,
      provider_id: 'mca_dispatch',
      metadata: commData.metadata,
    });

    let activityType: ActivityEvent['activity_type'] = 'call_made';
    let title = 'Outreach Communication Dispatched';
    let source = 'Agency User';

    if (commData.channel === 'CALL') {
      activityType = commData.status === 'COMPLETED' ? 'call_completed' : 'call_made';
      title = `Phone Call Logged: ${commData.metadata?.outcome || 'Connected'}`;
    } else if (commData.channel === 'AI_CALL') {
      activityType = 'ai_call_made';
      title = 'Sophia AI Voice Outreach Call';
      source = 'Sophia (AI Sales Rep)';
    } else if (commData.channel === 'SMS') {
      activityType = 'sms_sent';
      title = `SMS Sent to ${lead.phone || 'Direct line'}`;
    } else if (commData.channel === 'EMAIL') {
      activityType = 'email_sent';
      title = `Email Sent: ${commData.subject || 'Growth Analysis'}`;
    }

    addActivity({
      id: `act-${Date.now()}`,
      activity_id: `act-${Date.now()}`,
      lead_id: lead.lead_id,
      lead_name: lead.business_name,
      timestamp: new Date().toISOString(),
      type: activityType,
      activity_type: activityType,
      channel: commData.channel,
      title,
      description: commData.content,
      author: source,
      source,
      metadata: commData.metadata,
    });

    setCommunications(getCommunications(lead.lead_id));
    setActivities(getLeadActivities(lead.lead_id, lead));
  };

  const handleExecuteRecommendedAction = (action: string) => {
    switch (action.toLowerCase()) {
      case 'call':
        setIsDialerOpen(true);
        break;
      case 'ai call':
        setIsSophiaAICallOpen(true);
        break;
      case 'sms':
        setIsSMSComposerOpen(true);
        break;
      case 'email':
        setIsEmailComposerOpen(true);
        break;
      case 'schedule follow-up':
        setFollowUpModalOpen(true);
        break;
      default:
        setIsDialerOpen(true);
    }
  };

  return (
    <div id="mca-lead-profile" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Re-analyze with Gemini */}
          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-sm"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze with Gemini'}</span>
          </button>
        </div>
      </div>

      {/* Lead Profile Header Card */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {lead.business_name}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {lead.lead_id}
              </span>
              {lead.is_hot_target && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Hot Target</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="font-semibold text-slate-300">{lead.niche}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {lead.city}, {lead.state} {lead.postal_code}
              </span>
              <span>•</span>
              <span>Owner: <strong className="text-slate-200">{lead.owner || 'Sophia'}</strong></span>
            </div>
          </div>

          {/* Quick Score & Pipeline Status */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400">Pipeline Stage</div>
              <select
                value={lead.pipeline_stage}
                onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
                className="mt-1 bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-lg px-3 py-1.5 focus:border-indigo-500"
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

            <div className="h-12 w-px bg-slate-800" />

            {/* Opportunity Score (Lead Score) */}
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {lead.lead_score}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Opportunity Score
              </div>
            </div>

            <div className="h-12 w-px bg-slate-800" />

            {/* Dynamic Engagement Score (Phase 2F) */}
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-purple-300 font-mono">
                {lead.engagement_score ?? latestIntel?.engagement_score ?? '—'}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold flex items-center justify-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Engagement</span>
              </div>
            </div>

            {/* Lead Temperature Badge */}
            <div className="text-center pl-1">
              <span
                className={`px-2 py-1 rounded text-[11px] font-bold border flex items-center gap-1 ${
                  (lead.lead_temperature || latestIntel?.lead_temperature || (lead.is_hot_target ? 'Hot' : 'Warm')) === 'Hot'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : (lead.lead_temperature || latestIntel?.lead_temperature) === 'Warm'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : (lead.lead_temperature || latestIntel?.lead_temperature) === 'Do Not Contact'
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{lead.lead_temperature || latestIntel?.lead_temperature || (lead.is_hot_target ? 'Hot' : 'Warm')}</span>
              </span>
              <div className="text-[9px] text-slate-500 uppercase font-semibold mt-1">
                Temperature
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Retainer</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              ${lead.estimated_retainer?.toLocaleString() || '1,800'}/mo
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Revenue Lift</div>
            <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
              {lead.estimated_revenue_lift || '$4,000–$8,000/mo'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Google Reviews</div>
            <div className="text-base font-bold text-amber-400 flex items-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{lead.gmb_rating || 'N/A'}</span>
              <span className="text-slate-400 text-xs font-normal">({lead.gmb_review_count || 0})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Service</div>
            <div className="text-xs font-bold text-white truncate mt-1">
              {lead.recommended_service}
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2A: Professional Lead Action Bar */}
      <LeadActionBar
        lead={lead}
        onOpenCall={() => setIsDialerOpen(true)}
        onOpenAICall={() => setIsSophiaAICallOpen(true)}
        onOpenSMS={() => setIsSMSComposerOpen(true)}
        onOpenEmail={() => setIsEmailComposerOpen(true)}
        onOpenScheduleFollowUp={() => setFollowUpModalOpen(true)}
        onCompleteFollowUp={handleCompleteFollowUp}
        onAddToCallQueue={() => TelephonyService.addToCallQueue(lead)}
        onOpenAudit={() => {
          const leadAudits = getAuditsByLead(lead.lead_id);
          if (leadAudits.length > 0) {
            setSelectedAuditForModal(leadAudits[0]);
          } else {
            setIsAuditGenModalOpen(true);
          }
        }}
        onOpenProposal={() => {
          const leadProps = getProposalsByLead(lead.lead_id);
          if (leadProps.length > 0) {
            setSelectedProposalForModal(leadProps[0]);
          } else {
            setIsProposalCreateModalOpen(true);
          }
        }}
      />

      {/* PHASE 2A: Sophia Recommends Next Best Action Card */}
      <SophiaRecommendsCard
        lead={lead}
        recommendation={recommendation}
        onExecuteAction={handleExecuteRecommendedAction}
        onRunAIAnalysis={handleRunAIAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'lead_intelligence', label: 'Lead Intelligence & AI Scoring (Phase 3B)' },
          { id: 'activity', label: `Activity & Communication (${activities.length})` },
          { id: 'sms_thread', label: 'SMS Thread & Chat' },
          { id: 'call_intelligence', label: `Call Intelligence (${leadCalls.length})` },
          { id: 'overview', label: 'Overview & Digital Footprint' },
          { id: 'gaps', label: 'Marketing Gaps & Offer' },
          { id: 'ai_intelligence', label: 'AI Intelligence (Gemini)' },
          { id: 'scoring', label: 'Score Breakdown (0–100)' },
          { id: 'notes', label: `Notes (${lead.notes?.length || 0})` },
          { id: 'original_data', label: 'Original Preserved Data' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Lead Intelligence & AI Scoring Engine (Phase 3B Centerpiece) */}
      {activeTab === 'lead_intelligence' && (
        <LeadIntelligencePanel
          lead={lead}
          onUpdateLead={onUpdateLead}
          onExecuteAction={handleExecuteRecommendedAction}
          onOpenCall={() => setIsDialerOpen(true)}
          onOpenAICall={() => setIsSophiaAICallOpen(true)}
          onOpenEmail={() => setIsEmailComposerOpen(true)}
          onOpenSMS={() => setIsSMSComposerOpen(true)}
        />
      )}

      {/* TAB: Activity & Communication (Phase 2A Centerpiece) */}
      {activeTab === 'activity' && (
        <ActivityTimeline
          lead={lead}
          activities={activities}
          communications={communications}
          onAddNoteClick={() => setActiveTab('notes')}
        />
      )}

      {/* TAB: SMS Outreach & Thread (Phase 2C Centerpiece) */}
      {activeTab === 'sms_thread' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>SMS Outreach & Compliance Conversation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct 1-on-1 SMS conversation with Sophia intent analysis, compliance verification, and instant simulation.
              </p>
            </div>
            <button
              onClick={() => setIsSMSComposerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compose SMS</span>
            </button>
          </div>

          <SMSConversationView
            lead={lead}
            onOpenComposer={(prefill) => {
              setSmsPrefill(prefill);
              setIsSMSComposerOpen(true);
            }}
            onMessageChange={() => {
              setActivities(getLeadActivities(lead.lead_id, lead));
              setCommunications(getCommunications(lead.lead_id));
            }}
          />
        </div>
      )}

      {/* TAB: Call Intelligence & Post-Call Auto-Notes (Phase 2F Centerpiece) */}
      {activeTab === 'call_intelligence' && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Conversation Intelligence & Grounded Auto-Notes</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold">
                    Phase 2F
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated sentiment analysis, objection categorization, commitment tracking, and CRM note generation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSophiaAICallOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/30"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Launch Sophia AI Call</span>
              </button>
              <button
                onClick={() => setIsDialerOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Manual Dialer</span>
              </button>
            </div>
          </div>

          {/* Calls List */}
          {leadCalls.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Phone className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No Calls Recorded Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Place an AI call with Sophia or use the manual dialer. Completed calls will automatically generate structured CRM notes, sentiment scores, and recommended follow-ups.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leadCalls.map((call) => {
                const callIntel = call.intelligence || allIntel.find((i) => i.call_id === call.call_id);
                return (
                  <div
                    key={call.call_id}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                  >
                    {/* Call Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          call.outcome === 'Meeting Requested' || call.outcome === 'Interested'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : call.outcome === 'Follow Up'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {call.outcome || 'Logged'}
                        </span>

                        <span className="text-xs font-bold text-white">
                          {call.call_type === 'AI Call' ? 'Sophia AI Voice Call' : 'Manual Outreach Call'}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(call.started_at || call.created_at).toLocaleString()}
                        </span>

                        <span className="text-xs text-slate-400">
                          Duration: <strong className="text-slate-200">{call.duration}s</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedCallForModal(call)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View Intelligence & Notes</span>
                      </button>
                    </div>

                    {/* Quick Summary */}
                    {callIntel ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {callIntel.summary}
                        </p>

                        {/* Badges & Scores */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono font-bold">
                            Engagement: {callIntel.engagement_score}/100
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                            Sentiment: {callIntel.sentiment}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            callIntel.lead_temperature === 'Hot'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            Temp: {callIntel.lead_temperature}
                          </span>

                          {callIntel.objections && callIntel.objections.length > 0 && (
                            <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/30 font-semibold">
                              {callIntel.objections.length} Objection(s) Captured
                            </span>
                          )}
                        </div>

                        {/* CRM Note Preview */}
                        {callIntel.crm_notes && (
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                              <FileText className="w-3 h-3 text-indigo-400" />
                              <span>Sophia Generated CRM Note:</span>
                            </div>
                            <p className="text-slate-300 italic">
                              {typeof callIntel.crm_notes === 'string'
                                ? callIntel.crm_notes
                                : (callIntel.crm_notes as any).key_takeaways || JSON.stringify(callIntel.crm_notes)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        {call.notes || 'No transcript analysis generated yet.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Overview & Digital Footprint */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact & Business Info */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Contact &amp; Entity Profile</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Business Name</span>
                <span className="font-semibold text-white">{lead.business_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Contact Decision Maker</span>
                <span className="font-semibold text-slate-200">{lead.contact_name || 'Owner / Principal'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Direct Phone</span>
                <span className="font-mono font-semibold text-slate-200">{lead.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Direct Email</span>
                <span className="font-mono font-semibold text-slate-200">{lead.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Physical Address</span>
                <span className="text-right text-slate-300">{lead.address || `${lead.city}, ${lead.state}`}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Country</span>
                <span className="text-right text-slate-300">{lead.country || 'USA'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Operating Hours</span>
                <span className="text-slate-300">{lead.opening_hours || 'Mon-Fri 8:00 AM - 5:00 PM'}</span>
              </div>
            </div>
          </div>

          {/* Digital Infrastructure Audit */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Digital Presence &amp; Speed Audit</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Website Status</span>
                <span
                  className={`font-semibold ${
                    lead.website_status === 'No Website'
                      ? 'text-rose-400'
                      : lead.website_status === 'Slow / Unreachable Server'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {lead.website_status || 'Active'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Website URL</span>
                {lead.website && !lead.website.toLowerCase().includes('no website') ? (
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{lead.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-rose-400 font-semibold">None (Opportunity)</span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">PageSpeed Performance Score</span>
                <span
                  className={`font-mono font-bold ${
                    lead.pagespeed_score && lead.pagespeed_score < 40
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {lead.pagespeed_score ? `${lead.pagespeed_score}/100` : 'Not run (No website)'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Meta Pixel Retargeting</span>
                <span
                  className={`font-semibold ${
                    lead.meta_pixel_status === 'Installed' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {lead.meta_pixel_status || 'No Pixel'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Google Ads Presence</span>
                <span
                  className={`font-semibold ${
                    lead.google_ads_status === 'Active' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {lead.google_ads_status || 'No Ads'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Detected CMS / Stack</span>
                <span className="text-slate-300 font-mono">{lead.cms || 'Custom HTML / Static'}</span>
              </div>
            </div>
          </div>

          {/* Google Maps & Local Search Embed */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Google Maps Information &amp; Coordinates</span>
              </h3>
              {lead.google_maps_url && (
                <a
                  href={lead.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">GMB Status</div>
                <div className="text-sm font-bold text-white">{lead.gmb_status || 'Established'}</div>
                <p className="text-xs text-slate-400">
                  {lead.gmb_rating} Stars across {lead.gmb_review_count || 0} reviews.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Coordinates</div>
                <div className="text-xs font-mono text-slate-300">
                  Lat: {lead.latitude || 45.5152}
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Lng: {lead.longitude || -122.6784}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Local Search Opportunity</div>
                <div className="text-xs font-bold text-emerald-400">
                  {lead.gmb_review_count && lead.gmb_review_count < 10
                    ? 'Review Booster Campaign'
                    : 'Local SEO & Citation Sync'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Map Pack prominence in {lead.city || 'Portland'}, {lead.state || 'OR'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Marketing Gaps & Offer */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Identified Marketing &amp; Conversion Gaps</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lead.gaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5"
                >
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>{gap}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {gap === 'No Website'
                      ? 'Zero branded landing asset leads to total competitor leakage.'
                      : gap === 'Slow / Unreachable Server'
                      ? 'Server latency (PageSpeed 28/100) causes extreme mobile bounce.'
                      : gap === 'No Pixel'
                      ? 'Inability to retarget warm past visitors via Meta/Instagram.'
                      : gap === 'No Ads'
                      ? 'Leaving paid high-intent local search demand completely uncontested.'
                      : 'Under-utilized local organic positioning.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Recommended Agency Offer</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Custom-tailored services based on verified digital gaps
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-400 font-mono">
                  ${lead.estimated_retainer?.toLocaleString()}/mo
                </div>
                <div className="text-[10px] text-slate-400">Target Monthly Retainer</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="text-xs font-bold text-indigo-300">
                Primary: {lead.recommended_service}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Opportunity Angle: <span className="font-semibold text-white">{lead.opportunity_angle}</span>
              </p>
            </div>

            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Secondary Service Upsells:
              </div>
              <div className="flex flex-wrap gap-2">
                {lead.secondary_services?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI Intelligence (Gemini) */}
      {activeTab === 'ai_intelligence' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-purple-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Gemini 3.8 Flash • Lead Intelligence Record
                  </h3>
                  <p className="text-xs text-slate-400">
                    Confidence: {lead.ai_enrichment?.confidence_score || 95}% • Synthesized by Sophia
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>

            {/* AI Summary */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Executive Assessment
              </div>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                {lead.ai_enrichment?.summary ||
                  `${lead.business_name} displays strong customer satisfaction but is handicapped by critical infrastructure omissions.`}
              </p>
            </div>

            {/* Primary Pain Point */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Primary Conversion Bottleneck
              </div>
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 font-medium">
                {lead.ai_enrichment?.primary_pain_point ||
                  'Missing responsive website funnel with zero retargeting pixel infrastructure.'}
              </div>
            </div>

            {/* Suggested Cold Outreach Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sophia's Suggested Outreach Pitch</span>
                </div>
                <button
                  onClick={() =>
                    handleCopyPitch(
                      lead.ai_enrichment?.suggested_pitch ||
                        `Hi ${lead.contact_name || 'there'}, this is Sophia with Marketing Charm Agency.`
                    )
                  }
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPitch ? 'Copied to Clipboard!' : 'Copy Pitch'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed font-mono">
                "{lead.ai_enrichment?.suggested_pitch ||
                  `Hi ${lead.contact_name || 'there'}, this is Sophia from Marketing Charm Agency. I noticed ${lead.business_name} has high customer ratings in ${lead.city}, but your digital conversion funnel has significant gaps costing you emergency jobs. We have prepared an audit showing exactly how to fix this.`}"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Score Breakdown (0–100 Explainability) */}
      {activeTab === 'scoring' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Deterministic 0–100 Lead Scoring Matrix</span>
              </h3>
              <p className="text-xs text-slate-400">
                Transparent and explainable point allocation based on verified business indicators
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {lead.lead_score}/100
              </span>
              <div className="text-[10px] text-slate-400">Total Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                category: 'Business Fit & Niche Potential',
                earned: lead.score_breakdown?.business_fit || 15,
                max: 15,
                reason: `${lead.niche} in ${lead.city} has high customer lifetime value and agency retainer viability.`,
              },
              {
                category: 'Google Business Profile (GMB) Opportunity',
                earned: lead.score_breakdown?.gmb_opportunity || 14,
                max: 15,
                reason: `GMB status is ${lead.gmb_status} with ${lead.gmb_rating || 'N/A'} rating and ${lead.gmb_review_count || 0} reviews.`,
              },
              {
                category: 'Website & Infrastructure Opportunity',
                earned: lead.score_breakdown?.website_opportunity || 15,
                max: 15,
                reason: `Website is ${lead.website_status} with speed audit score: ${lead.pagespeed_score || 'N/A'}.`,
              },
              {
                category: 'SEO & Organic Growth Gap',
                earned: lead.score_breakdown?.seo_opportunity || 10,
                max: 10,
                reason: `Local organic rank optimization required for service keywords in ${lead.city}.`,
              },
              {
                category: 'Google Ads Paid Search Opportunity',
                earned: lead.score_breakdown?.google_ads_opportunity || 10,
                max: 10,
                reason: `Currently running ${lead.google_ads_status}; high intent search queries available.`,
              },
              {
                category: 'Meta Pixel & Retargeting Opportunity',
                earned: lead.score_breakdown?.meta_ads_opportunity || 10,
                max: 10,
                reason: `Currently has ${lead.meta_pixel_status}; missing social audience recapture.`,
              },
              {
                category: 'Public Reputation & Rating Trust',
                earned: lead.score_breakdown?.reputation || 9,
                max: 10,
                reason: `Rating of ${lead.gmb_rating} proves real customer satisfaction.`,
              },
              {
                category: 'Direct Contactability',
                earned: lead.score_breakdown?.contactability || 10,
                max: 10,
                reason: `Phone (${lead.phone}) and email verified for direct multi-channel outreach.`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{item.category}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {item.earned}/{item.max} pts
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(item.earned / item.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Notes & Activities */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add Note or Call Log</span>
            </h3>

            <form onSubmit={handleAddNoteSubmit} className="space-y-3">
              <div className="flex items-center gap-3">
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2"
                >
                  <option value="Note">General Note</option>
                  <option value="Call Log">Call Log</option>
                  <option value="Audit">Audit Note</option>
                  <option value="Email">Email Communication</option>
                  <option value="Meeting">Meeting Record</option>
                </select>
                <span className="text-xs text-slate-400">Author: Sophia (AI Sales Rep)</span>
              </div>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Log details of conversation, technical audit findings, or outreach progress..."
                rows={3}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteContent.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* Chronological Notes Feed */}
          <div className="space-y-3">
            {lead.notes && lead.notes.length > 0 ? (
              lead.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{note.author}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-semibold border border-indigo-500/20">
                        {note.activity_type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{note.content}</p>
                  </div>

                  <button
                    onClick={() => onDeleteNote(lead.lead_id, note.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No notes logged yet. Use the form above to record notes, audits, or call logs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Original Data Preservation */}
      {activeTab === 'original_data' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Original Preserved Import Data</span>
              </h3>
              <p className="text-xs text-slate-400">
                Unaltered spreadsheet columns captured during original ingestion (Zero Data Overwrite)
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Preserved
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
              {JSON.stringify(lead.original_data || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Communication Modal (Call, AI Call, SMS, Email) */}
      {activeCommChannel && (
        <CommunicationModal
          lead={lead}
          channel={activeCommChannel}
          isOpen={Boolean(activeCommChannel)}
          onClose={() => setActiveCommChannel(null)}
          onLogCommunication={handleLogCommunication}
        />
      )}

      {/* Follow-Up Scheduling Modal */}
      {followUpModalOpen && (
        <FollowUpModal
          lead={lead}
          isOpen={followUpModalOpen}
          onClose={() => setFollowUpModalOpen(false)}
          onSchedule={handleScheduleFollowUp}
        />
      )}

      {/* PHASE 2B: Sophia AI Email Outreach Composer Modal */}
      {isEmailComposerOpen && (
        <EmailComposerModal
          lead={lead}
          isOpen={isEmailComposerOpen}
          activities={activities}
          onClose={() => setIsEmailComposerOpen(false)}
          onEmailPrepared={() => {
            setActivities(getLeadActivities(lead.lead_id, lead));
            setCommunications(getCommunications(lead.lead_id));
          }}
          onDraftSaved={() => {
            setActivities(getLeadActivities(lead.lead_id, lead));
          }}
        />
      )}

      {/* PHASE 2C: Sophia AI SMS Outreach Composer Modal */}
      {isSMSComposerOpen && (
        <SMSComposerModal
          lead={lead}
          isOpen={isSMSComposerOpen}
          prefillContent={smsPrefill}
          onClose={() => {
            setIsSMSComposerOpen(false);
            setSmsPrefill(undefined);
          }}
          onSMSSent={() => {
            setActivities(getLeadActivities(lead.lead_id, lead));
            setCommunications(getCommunications(lead.lead_id));
          }}
        />
      )}

      {/* PHASE 2D: Professional CRM Dialer Modal */}
      {isDialerOpen && (
        <DialerModal
          isOpen={isDialerOpen}
          initialLead={lead}
          initialPhoneNumber={lead.phone}
          allLeads={leads}
          onClose={() => {
            setIsDialerOpen(false);
            setActivities(getLeadActivities(lead.lead_id, lead));
            setCommunications(getCommunications(lead.lead_id));
          }}
          onLeadUpdated={onUpdateLead}
        />
      )}

      {/* PHASE 2E: Sophia AI Voice Calling Agent Modal */}
      {isSophiaAICallOpen && (
        <SophiaAICallModal
          isOpen={isSophiaAICallOpen}
          lead={lead}
          onClose={() => {
            setIsSophiaAICallOpen(false);
            setActivities(getLeadActivities(lead.lead_id, lead));
            setCommunications(getCommunications(lead.lead_id));
          }}
          onLeadUpdated={(leadId, updates) => {
            onUpdateLead(leadId, updates);
            setActivities(getLeadActivities(leadId, { ...lead, ...updates }));
          }}
          onOpenEmailComposer={() => setIsEmailComposerOpen(true)}
          onOpenSMSComposer={() => setIsSMSComposerOpen(true)}
        />
      )}

      {/* PHASE 3C: Digital Audit Detail Modal */}
      {selectedAuditForModal && (
        <AuditDetailModal
          audit={selectedAuditForModal}
          lead={lead}
          onClose={() => setSelectedAuditForModal(null)}
          onUpdate={() => {
            const updatedAudits = getAuditsByLead(lead.lead_id);
            if (updatedAudits.length > 0) setSelectedAuditForModal(updatedAudits[0]);
          }}
          onCreateProposal={() => {
            setSelectedAuditForModal(null);
            setIsProposalCreateModalOpen(true);
          }}
        />
      )}

      {/* PHASE 3C: Proposal Detail & Negotiation Modal */}
      {selectedProposalForModal && (
        <ProposalDetailModal
          proposal={selectedProposalForModal}
          lead={lead}
          onClose={() => setSelectedProposalForModal(null)}
          onUpdate={() => {
            const updatedProps = getProposalsByLead(lead.lead_id);
            if (updatedProps.length > 0) setSelectedProposalForModal(updatedProps[0]);
          }}
        />
      )}

      {/* PHASE 3C: Audit Generation Modal */}
      {isAuditGenModalOpen && (
        <AuditGenerationModal
          leads={leads}
          initialLead={lead}
          onClose={() => setIsAuditGenModalOpen(false)}
          onAuditGenerated={(newAudit) => {
            setIsAuditGenModalOpen(false);
            setSelectedAuditForModal(newAudit);
          }}
        />
      )}

      {/* PHASE 3C: Proposal Creation Modal */}
      {isProposalCreateModalOpen && (
        <ProposalCreationModal
          leads={leads}
          initialLead={lead}
          initialAudit={selectedAuditForModal || undefined}
          onClose={() => setIsProposalCreateModalOpen(false)}
          onProposalCreated={(newProp) => {
            setIsProposalCreateModalOpen(false);
            setSelectedProposalForModal(newProp);
          }}
        />
      )}
    </div>
  );
};
