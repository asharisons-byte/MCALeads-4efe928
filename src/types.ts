export type PipelineStage =
  | 'New Lead'
  | 'Contacted'
  | 'Audit Sent'
  | 'Proposal Sent'
  | 'Won'
  | 'Retainer'
  | 'Archived';

export interface ScoreBreakdown {
  business_fit: number; // Max 15
  gmb_opportunity: number; // Max 15
  website_opportunity: number; // Max 15
  seo_opportunity: number; // Max 10
  google_ads_opportunity: number; // Max 10
  meta_ads_opportunity: number; // Max 10
  reputation: number; // Max 10
  contactability: number; // Max 10
  revenue_potential: number; // Max 5
  total: number; // 0–100
}

export interface ScoreWeights {
  business_fit: number;
  gmb_opportunity: number;
  website_opportunity: number;
  seo_opportunity: number;
  google_ads_opportunity: number;
  meta_ads_opportunity: number;
  reputation: number;
  contactability: number;
  revenue_potential: number;
}

export interface LeadNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  activity_type:
    | 'Note'
    | 'Call Log'
    | 'Email Sent'
    | 'Meeting'
    | 'Audit'
    | 'Discovery'
    | 'Objection'
    | 'Gatekeeper'
    | 'Follow-Up'
    | 'Pricing'
    | 'Proposal'
    | 'Observation';
  is_ai_generated?: boolean;
}

export type ActivityType =
  | 'lead_created'
  | 'lead_imported'
  | 'ai_analysis_generated'
  | 'note_added'
  | 'call_made'
  | 'ai_call_made'
  | 'call_started'
  | 'call_connected'
  | 'call_completed'
  | 'call_failed'
  | 'call_note_added'
  | 'call_outcome_set'
  | 'contact_do_not_contact'
  | 'sms_sent'
  | 'sms_received'
  | 'sms_draft_created'
  | 'sms_delivered'
  | 'contact_opted_out'
  | 'email_sent'
  | 'email_received'
  | 'email_prepared'
  | 'email_draft_created'
  | 'follow_up_created'
  | 'follow_up_completed'
  | 'pipeline_stage_changed'
  | 'ai_pitch_generated'
  | 'audit_sent'
  | 'proposal_sent'
  // Backward compatibility
  | 'ai_analysis_completed'
  | 'score_updated'
  | 'stage_changed'
  | 'lead_updated';

export type ActivityChannel =
  | 'CALL'
  | 'AI_CALL'
  | 'SMS'
  | 'EMAIL'
  | 'SYSTEM'
  | 'NOTE'
  | 'PIPELINE'
  | 'MEETING'
  | 'FOLLOW_UP';

export interface ActivityEvent {
  id: string;
  activity_id?: string;
  lead_id: string;
  lead_name?: string;
  type: ActivityType;
  activity_type?: ActivityType;
  title: string;
  description: string;
  channel?: ActivityChannel;
  timestamp: string;
  author?: string;
  source?: string;
  metadata?: {
    previous_stage?: PipelineStage | string;
    new_stage?: PipelineStage | string;
    duration_seconds?: number;
    call_outcome?: string;
    follow_up_date?: string;
    follow_up_priority?: 'High' | 'Medium' | 'Low';
    follow_up_type?: string;
    communication_id?: string;
    phone_number?: string;
    email_address?: string;
    note_id?: string;
    is_ai_generated?: boolean;
    subject?: string;
    provider?: string;
    recipient?: string;
    draft_id?: string;
    email_type?: string;
    personalization_level?: string;
    email_body?: string;
    status?: string;
    [key: string]: any;
  };
}

export type CommunicationChannel = 'CALL' | 'AI_CALL' | 'SMS' | 'EMAIL';

export type CommunicationDirection = 'OUTBOUND' | 'INBOUND';

export type CommunicationStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'QUEUED'
  | 'PREPARED'
  | 'SENT'
  | 'DELIVERED'
  | 'CONNECTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'RECEIVED'
  | 'REPLIED'
  | 'OPENED'
  | 'CANCELLED';

export type EmailStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'PREPARED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'REPLIED'
  | 'FAILED';

export type EmailType =
  | 'Initial Outreach'
  | 'Follow-Up'
  | 'Audit Follow-Up'
  | 'Proposal Follow-Up'
  | 'Re-Engagement';

export type PersonalizationLevel = 'Low' | 'Medium' | 'High';

export type EmailTone =
  | 'More Direct'
  | 'More Friendly'
  | 'More Professional'
  | 'Shorter'
  | 'More Personalized'
  | 'Different Angle';

export interface EmailDraft {
  id: string;
  draft_id?: string;
  lead_id: string;
  business_name: string;
  contact_name?: string;
  recipient: string;
  subject: string;
  subject_options?: string[];
  body: string;
  email_type: EmailType;
  personalization_level: PersonalizationLevel;
  tone?: EmailTone | string;
  key_opportunity?: string;
  suggested_cta?: string;
  generated_by: string;
  created_at: string;
  updated_at: string;
  status: EmailStatus;
  lead_score?: number;
  niche?: string;
  city?: string;
  metadata?: Record<string, any>;
}

export type SMSEligibilityStatus =
  | 'ALLOWED'
  | 'UNKNOWN'
  | 'OPTED_OUT'
  | 'SUPPRESSED'
  | 'BLOCKED'
  | 'CONSENT_REQUIRED';

export type SMSStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RECEIVED'
  | 'OPTED_OUT';

export type SMSType =
  | 'Initial Outreach'
  | 'Follow-Up'
  | 'Audit Follow-Up'
  | 'Information Follow-Up'
  | 'Proposal Follow-Up'
  | 'Re-Engagement';

export type ReplyIntent =
  | 'Interested'
  | 'Not Interested'
  | 'Question'
  | 'Pricing'
  | 'Information Request'
  | 'Follow-Up Request'
  | 'Meeting Request'
  | 'Opt-Out'
  | 'Unclear';

export interface SophiaReplyAnalysis {
  intent: ReplyIntent;
  summary: string;
  suggested_response: string;
  recommended_next_action: string;
  confidence?: number;
}

export interface SMSMessage {
  sms_id: string;
  lead_id: string;
  contact_id?: string;
  business_name?: string;
  contact_name?: string;
  phone_number: string;
  phone_e164: string;
  raw_phone?: string;
  direction: CommunicationDirection;
  content: string;
  status: SMSStatus;
  provider_message_id?: string;
  sms_type?: SMSType;
  personalization_level?: PersonalizationLevel;
  segments_count?: number;
  character_count?: number;
  sent_at?: string;
  delivered_at?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
  consent_status?: 'CONSENT_GRANTED' | 'IMPLIED' | 'UNKNOWN' | 'REVOKED';
  opt_out_status?: boolean;
  opt_out_timestamp?: string;
  suppression_reason?: string;
  reply_analysis?: SophiaReplyAnalysis;
  reply_to_sms_id?: string;
  is_ai_suggested_reply?: boolean;
  metadata?: Record<string, any>;
}

export interface Communication {
  communication_id: string;
  lead_id: string;
  contact_id?: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  subject?: string;
  content: string;
  timestamp: string;
  provider_id?: string;
  metadata?: Record<string, any>;
}

export interface PipelineStageHistoryEntry {
  id: string;
  previous_stage: PipelineStage | 'Initial Import';
  new_stage: PipelineStage;
  timestamp: string;
  changed_by: string;
  reason?: string;
}

export interface UpcomingFollowUp {
  id: string;
  date: string;
  time?: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  note?: string;
  created_at: string;
}

export interface SophiaRecommendation {
  action: 'AI Call' | 'Call' | 'Email' | 'SMS' | 'Schedule Follow-Up' | 'Send Audit' | 'Send Proposal';
  channel: CommunicationChannel;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  recommended_next_step: string;
  suggested_opening?: string;
}

export interface SophiaLeadContext {
  lead_id: string;
  business_name: string;
  contact_name: string;
  niche: string;
  location: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  gmb_status: string;
  gmb_rating: number | string;
  gmb_reviews: number;
  website_status: string;
  pagespeed_score: number | string;
  google_ads_status: string;
  meta_pixel_status: string;
  seo_status: string;
  lead_score: number;
  score_breakdown: ScoreBreakdown;
  gaps: string[];
  recommended_service: string;
  estimated_retainer: number;
  estimated_revenue_lift: string;
  ai_pitch: string;
  pipeline_stage: PipelineStage;
  notes_count: number;
  recent_notes: string[];
  communications_count: number;
  recent_communications: {
    channel: string;
    direction: string;
    status: string;
    summary: string;
    timestamp: string;
  }[];
  recommendation: SophiaRecommendation;
}

export interface AIEnrichmentData {
  analyzed_at: string;
  model: string;
  summary: string;
  primary_pain_point: string;
  pain_points: string[];
  opportunity_angle: string;
  recommended_service: string;
  secondary_services: string[];
  estimated_retainer: number;
  estimated_revenue_lift: string;
  confidence_score: number;
  priority: 'Hot' | 'Medium' | 'Low';
  rationale: string;
  suggested_pitch: string;
}

export interface Lead {
  lead_id: string;
  business_name: string;
  contact_name?: string;
  phone?: string;
  phone_e164?: string;
  phone_original?: string;
  sms_eligibility?: SMSEligibilityStatus;
  sms_opt_out?: boolean;
  sms_opt_out_timestamp?: string;
  sms_opt_out_reason?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  niche?: string;
  industry?: string;
  service_category?: string;
  ccb_license_number?: string;
  lead_source?: string;

  // GMB & Google Maps
  gmb_status?: 'Established' | 'Thin GMB' | 'Unclaimed' | 'No GMB' | 'Needs Optimization';
  gmb_rating?: number;
  gmb_review_count?: number;
  gmb_url?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: string;

  // Website & Tech
  website_status?: 'Active' | 'Slow / Unreachable Server' | 'No Website' | 'Needs Redesign';
  pagespeed_score?: number;
  mobile_pagespeed?: number;
  desktop_pagespeed?: number;
  cms?: string;
  google_ads_status?: 'Active' | 'No Ads' | 'Inactive';
  meta_pixel_status?: 'Installed' | 'No Pixel' | 'Misconfigured';
  seo_status?: 'Strong' | 'Average' | 'Weak' | 'Needs Technical SEO';
  technology?: string[];

  // Scoring & AI
  lead_score: number;
  score_breakdown: ScoreBreakdown;
  gaps: string[];
  opportunity_angle: string;
  recommended_service: string;
  secondary_services?: string[];
  estimated_retainer: number; // monthly in USD
  estimated_revenue_lift?: string;
  pain_points?: string[];
  is_hot_target: boolean;

  // Pipeline & Ownership
  pipeline_stage: PipelineStage;
  owner: string;
  created_at: string;
  updated_at: string;
  notes: LeadNote[];
  stage_history?: PipelineStageHistoryEntry[];
  upcoming_follow_up?: UpcomingFollowUp;
  status?: string;
  do_not_contact?: boolean;
  marketing_gaps?: string[];

  // Critical Data Preservation:
  original_data: Record<string, any>;
  ai_enrichment?: AIEnrichmentData;
  tags?: string[];

  // Phase 2F: Post-Call Intelligence, Engagement & Temperature
  engagement_score?: number; // 0-100, dynamic engagement score separate from original lead_score
  lead_temperature?: LeadTemperature; // 'Hot' | 'Warm' | 'Cold' | 'Dormant' | 'Do Not Contact'
  lead_temperature_override?: boolean;
  decision_maker_info?: DecisionMakerInfo;
  latest_call_intelligence?: CallIntelligence;
  next_best_action?: NextBestAction;

  // Phase 3B: Advanced Lead Intelligence & AI Lead Scoring Engine
  intelligence?: LeadIntelligence;
  overall_priority_score?: number; // 0–100 weighted
  priority_tier?: PriorityTier; // TIER A, B, C, D, E
  opportunity_score?: number; // 0–100 marketing gaps
  service_match_score?: number; // 0–100 agency service fit
  revenue_potential_score?: number; // 0–100 estimated agency revenue
  contactability_score?: number; // 0–100 reachability
  buying_intent_score?: number; // 0–100 verified buying intent signals
  data_confidence_score?: number; // 0–100 reliability of records
  score_manual_override?: ScoreManualOverride;

  // Phase 3C: Proposal, Audit & Client Conversion Engine
  latest_audit_id?: string;
  audit_count?: number;
  latest_proposal_id?: string;
  proposal_status?: ProposalStatus;
  actual_mrr?: number;
  setup_fee_paid?: number;
  client_id?: string;
  contract_start_date?: string;
}

export interface AgencyConfig {
  agency_name: string;
  sender_name: string;
  product_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  app_title?: string;
  ai_representative_name?: string;
  ai_representative_role?: string;
  scoring_weights?: {
    business_fit: number;
    gmb_opportunity: number;
    website_opportunity: number;
    contactability: number;
    seo_opportunity?: number;
    google_ads_opportunity?: number;
    meta_ads_opportunity?: number;
    reputation?: number;
    revenue_potential?: number;
  };
}

export interface ImportHistoryItem {
  id: string;
  file_name: string;
  imported_date: string;
  rows_count: number;
  valid_count: number;
  duplicates_count: number;
  rejected_count: number;
  imported_by: string;
  status: 'Completed' | 'Processing' | 'Failed';
}

export type ViewFilterType =
  | 'All Leads'
  | 'Hot Leads'
  | 'No Website'
  | 'No GMB'
  | 'No Google Ads'
  | 'No Meta Pixel'
  | 'High Value'
  | 'Needs Follow-Up'
  | 'New Leads';

// ==========================================
// PHASE 2D: PROFESSIONAL CRM DIALER & CALLS
// ==========================================

export type CallState =
  | 'IDLE'
  | 'PREPARING'
  | 'QUEUED'
  | 'CALLING'
  | 'RINGING'
  | 'CONNECTED'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'PSTN_ACTIVE'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'VOICEMAIL'
  | 'FAILED'
  | 'CANCELLED';

export type CallOutcome =
  | 'Interested'
  | 'Not Interested'
  | 'Follow Up'
  | 'Send Information'
  | 'Send Audit'
  | 'Meeting Requested'
  | 'Proposal Requested'
  | 'Wrong Number'
  | 'No Answer'
  | 'Voicemail'
  | 'Do Not Contact';

export type CallType =
  | 'Manual Call'
  | 'Outbound Call'
  | 'Inbound Call'
  | 'AI Call';

export type MediaStatus = 'Not Available' | 'Processing' | 'Available' | 'Failed';

export interface CallRecord {
  call_id: string;
  lead_id?: string;
  contact_id?: string;
  business_name?: string;
  contact_name?: string;
  phone_number: string;
  direction: CommunicationDirection;
  call_type: CallType;
  status: CallState;
  duration: number; // in seconds
  outcome?: CallOutcome;
  notes?: string;
  provider_call_id?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
  recording_url?: string;
  recording_status?: MediaStatus;
  transcript?: string;
  transcript_status?: MediaStatus;
  lead_score?: number;
  pipeline_stage?: PipelineStage;
  opportunity?: string;
  estimated_retainer?: number;
  is_muted?: boolean;
  is_on_hold?: boolean;

  // Phase 2E: Sophia AI Calling Agent Fields
  ai_agent?: 'Sophia';
  ai_provider?: string;
  ai_model?: string;
  intent?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  interest_level?: 'Hot' | 'Warm' | 'Cold';
  summary?: string;
  objections?: string[];
  key_insights?: string[];
  recommended_next_action?: string;
  promised_follow_up?: string;
  system_prompt?: string;
  call_strategy?: SophiaCallStrategy;
  transcript_turns?: SophiaCallTurn[];

  // Phase 2F: Post-Call Intelligence & Transcripts
  raw_transcript?: string; // Preserved immutable original transcript
  intelligence?: CallIntelligence;
  engagement_score?: number; // 0-100
  lead_temperature?: LeadTemperature;

  metadata?: Record<string, any>;
}

export interface SophiaCallStrategy {
  objective: string;
  primary_opportunity: string;
  pain_points: string[];
  discovery_questions: string[];
  value_angle: string;
  call_to_action: string;
  known_objections: { objection: string; counter: string }[];
  target_goal: string;
  verified_context: {
    business_name: string;
    contact_name?: string;
    industry: string;
    location: string;
    gmb_status: string;
    rating?: number | string;
    reviews?: number | string;
    recommended_service: string;
    estimated_retainer: number;
    known_gaps: string[];
  };
}

export interface SophiaCallTurn {
  id: string;
  speaker: 'Sophia' | 'Prospect' | 'System';
  message: string;
  timestamp: string;
  intent?: string;
}

export interface SophiaCallAnalysis {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  interest_level: 'Hot' | 'Warm' | 'Cold';
  primary_objection?: string;
  key_insights: string[];
  promised_follow_up?: string;
  recommended_next_action: {
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    suggested_channel: 'Email' | 'Phone' | 'SMS' | 'Meeting';
    suggested_timing: string;
  };
  crm_notes: string;
  pipeline_stage_recommendation?: PipelineStage;
}

export interface AIModelConfig {
  provider: 'Google Gemini';
  modelId: string;
  temperature: number;
  systemPersona: string;
}

export interface CallQueueItem {
  id: string;
  lead_id: string;
  business_name: string;
  contact_name?: string;
  phone_number: string;
  lead_score: number;
  priority: 'High' | 'Medium' | 'Low';
  recommended_service?: string;
  opportunity?: string;
  added_at: string;
  status: 'pending' | 'calling' | 'completed' | 'skipped';
}

export interface CallScript {
  opening: string;
  discovery_questions: string[];
  opportunity_discussion: string;
  service_introduction: string;
  common_objections: { objection: string; counter: string }[];
  closing: string;
}

export interface SophiaTalkingPoints {
  lead_context: string;
  talking_points: string[];
  pain_points: string[];
  recommended_questions: string[];
  objections: { objection: string; counter: string }[];
  suggested_next_action: string;
}

// ========================================================
// PHASE 2F: TRANSCRIPT INTELLIGENCE, AUTO-NOTES, OBJECTION
// DATABASE & FOLLOW-UP AUTOMATION TYPES
// ========================================================

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold' | 'Dormant' | 'Do Not Contact';

export type ObjectionCategory =
  | 'Price'
  | 'Timing'
  | 'Already Has Provider'
  | 'No Budget'
  | 'Not Interested'
  | 'Too Busy'
  | 'Trust'
  | 'Bad Previous Experience'
  | 'No Need'
  | 'Decision Maker Unavailable'
  | 'Other';

export interface ObjectionDetail {
  id: string;
  category: ObjectionCategory;
  prospect_statement: string; // Verbatim quote/statement from prospect
  gemini_summary: string;
  suggested_response_strategy: string;
}

export interface DecisionMakerInfo {
  name?: string;
  role?: string;
  availability?: string;
  decision_authority?: string;
}

export interface FollowUpCommitment {
  promise_by_agency?: string;
  prospect_request?: string;
  follow_up_type: string;
  recommended_date?: string;
  timing_type?: 'Exact Date' | 'Timing Unknown' | 'Relative';
  recommended_channel?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  reason?: string;
}

export interface NextBestAction {
  action: string;
  reason: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  suggested_channel: 'Call' | 'AI Call' | 'Email' | 'SMS' | 'Meeting' | 'Audit' | 'Proposal';
  suggested_timing: string;
  dismissed?: boolean;
}

export interface CallIntelligence {
  intelligence_id: string;
  call_id: string;
  lead_id?: string;
  business_name?: string;
  contact_name?: string;
  phone_number?: string;
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  interest_level: 'Hot' | 'Warm' | 'Neutral' | 'Cold' | 'Not Interested' | 'Do Not Contact';
  engagement_score: number; // 0-100 dynamic engagement score
  lead_temperature: LeadTemperature;
  confidence_score?: number;
  intents: string[];
  pain_points: string[];
  objections: ObjectionDetail[];
  business_needs?: string[];
  current_marketing_situation?: string;
  existing_providers?: string;
  budget_signals?: string;
  timeline_signals?: string;
  decision_maker_info?: DecisionMakerInfo;
  follow_up_commitments?: FollowUpCommitment;
  key_insights: string[];
  next_best_action: NextBestAction;
  crm_notes: string;
  generated_at: string;
  ai_provider: string; // 'Google Gemini'
  ai_model: string;
  raw_transcript?: string; // Preserved raw transcript
  transcript_status?: MediaStatus;
}

export type FollowUpStatus = 'Pending' | 'Scheduled' | 'Completed' | 'Skipped' | 'Cancelled';

export type FollowUpType =
  | 'Call Follow-Up'
  | 'AI Call Follow-Up'
  | 'Email Follow-Up'
  | 'SMS Follow-Up'
  | 'Send Audit'
  | 'Send Proposal'
  | 'Schedule Meeting'
  | 'Custom Task';

export type FollowUpPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type FollowUpChannel = 'Call' | 'AI Call' | 'Email' | 'SMS' | 'Meeting';

export interface FollowUpTask {
  follow_up_id: string;
  lead_id: string;
  lead_name?: string;
  contact_name?: string;
  lead_phone?: string;
  lead_email?: string;
  source_call_id?: string;
  type: FollowUpType;
  channel: FollowUpChannel;
  reason: string;
  priority: FollowUpPriority;
  recommended_date: string; // YYYY-MM-DD or 'Timing Unknown'
  recommended_time?: string;
  status: FollowUpStatus;
  owner: string;
  ai_generated: boolean;
  ai_recommendation?: string;
  context_notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface AggregatedObjection {
  category: ObjectionCategory;
  count: number;
  percentage: number;
  top_industries: string[];
  sample_statements: string[];
  recommended_response: string;
  last_detected: string;
  leads_affected: number;
}

// ========================================================
// PHASE 3A: AGENCY COMMAND CENTER & REVENUE INTELLIGENCE
// ========================================================

export type DateRangeOption =
  | 'Today'
  | 'Yesterday'
  | 'Last 7 Days'
  | 'Last 30 Days'
  | 'This Month'
  | 'Last Month'
  | 'Custom Range';

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export type CommandCenterWidgetId =
  | 'kpi_cards'
  | 'briefing_and_priorities'
  | 'revenue_intelligence'
  | 'pipeline_forecast'
  | 'sales_funnel'
  | 'hot_leads_panel'
  | 'leads_at_risk'
  | 'executive_insights'
  | 'alerts_center'
  | 'channel_performance'
  | 'campaign_performance'
  | 'call_intelligence_summary'
  | 'objections_trends'
  | 'follow_up_performance'
  | 'revenue_by_service'
  | 'revenue_by_industry'
  | 'revenue_by_location'
  | 'activity_feed_and_movement'
  | 'agency_health_score'
  | 'data_quality_monitor'
  | 'team_performance';

export interface CommandCenterWidgetConfig {
  id: CommandCenterWidgetId;
  label: string;
  visible: boolean;
  order: number;
  category: 'Core Metrics' | 'Intelligence' | 'Operations' | 'Revenue' | 'Quality';
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Active' | 'Dismissed' | 'Snoozed';

export interface AgencyAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  category: 'Follow-Up' | 'Lead Inactivity' | 'Proposal' | 'Campaign' | 'Opportunity' | 'System';
  related_lead_id?: string;
  related_lead_name?: string;
  action_label?: string;
  action_type?: 'open_lead' | 'call' | 'ai_call' | 'email' | 'sms' | 'follow_up' | 'campaign';
  created_at: string;
  status: AlertStatus;
  snoozed_until?: string;
}

export type InsightCategory =
  | 'Revenue Opportunity'
  | 'Sales Risk'
  | 'Campaign Opportunity'
  | 'Lead Opportunity'
  | 'Follow-Up Risk';

export interface SophiaExecutiveInsight {
  id: string;
  category: InsightCategory;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  recommended_action: string;
  affected_lead_ids?: string[];
  estimated_value?: number;
}

export interface SophiaDailyBriefingData {
  greeting: string;
  generated_at: string;
  summary_paragraphs: string[];
  highlights: {
    follow_ups_due_count: number;
    hot_leads_count: number;
    proposal_requests_count: number;
    active_sequences_count: number;
    pipeline_mrr: number;
    won_mrr: number;
  };
  top_priority: {
    lead_id?: string;
    lead_name: string;
    action: string;
    reason: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'Multi-Channel';
  status: 'Active' | 'Paused' | 'Draft' | 'Completed';
  target_niche?: string;
  target_location?: string;
  enrolled_lead_ids: string[];
  replies_count: number;
  positive_responses_count: number;
  meetings_count: number;
  conversions_count: number;
  estimated_pipeline_value: number;
  won_value: number;
  created_at: string;
  last_activity_at: string;
}

export type DataQualityIssueType =
  | 'Missing Email'
  | 'Missing Phone'
  | 'Missing Website'
  | 'Duplicate Lead'
  | 'Incomplete CRM Record'
  | 'Invalid Phone Format';

export interface DataQualityItem {
  issue_id: string;
  issue_type: DataQualityIssueType;
  severity: 'High' | 'Medium' | 'Low';
  lead_id: string;
  business_name: string;
  field_name: string;
  suggested_fix?: string;
}

export interface DuplicateLeadPair {
  id: string;
  primary_lead: Lead;
  duplicate_lead: Lead;
  matched_by: 'Business Name' | 'Phone Number' | 'Email' | 'Website' | 'Address';
  match_score: number; // percentage
  status: 'Pending Review' | 'Merged' | 'Kept Separate';
}

export interface AgencyHealthFactor {
  name: string;
  score: number; // 0–100
  weight: number;
  status: 'Positive' | 'Neutral' | 'Risk';
  detail: string;
}

export interface AgencyHealthScore {
  overall_score: number; // 0–100
  status: 'Optimal' | 'Healthy' | 'Needs Attention' | 'At Risk';
  factors: AgencyHealthFactor[];
  positive_summary: string[];
  risks_summary: string[];
}

export interface TodayPriorityItem {
  id: string;
  lead_id: string;
  business_name: string;
  action: string;
  action_type: 'Call' | 'AI Call' | 'Email' | 'SMS' | 'Send Proposal' | 'Send Audit' | 'Follow Up';
  reason: string;
  due_time: string;
  priority: 'Critical' | 'High' | 'Medium';
  estimated_mrr: number;
  completed?: boolean;
}

export interface TeamMemberPerformance {
  user_id: string;
  name: string;
  role: string;
  is_ai: boolean;
  calls_made: number;
  emails_sent: number;
  sms_sent: number;
  follow_ups_completed: number;
  meetings_requested: number;
  won_revenue: number;
}

// =======================================================
// PHASE 3B: CLIENT ACQUISITION INTELLIGENCE & AI LEAD SCORING ENGINE
// =======================================================

export type PriorityTier = 'TIER A' | 'TIER B' | 'TIER C' | 'TIER D' | 'TIER E';

export interface ScoreWeightsConfig {
  opportunity: number; // default 25
  service_match: number; // default 15
  revenue_potential: number; // default 20
  contactability: number; // default 15
  buying_intent: number; // default 10
  data_confidence: number; // default 5
  engagement: number; // default 10
}

export interface PriorityTierThresholds {
  tier_a: number; // default 90 (Immediate Priority)
  tier_b: number; // default 75 (High Priority)
  tier_c: number; // default 55 (Qualified)
  tier_d: number; // default 35 (Low Priority)
}

export interface ServicePackageConfig {
  name: string;
  base_price: number;
  min_retainer: number;
  max_retainer: number;
  primary_indicators: string[];
}

export interface ScoringEngineConfig {
  weights: ScoreWeightsConfig;
  tier_thresholds: PriorityTierThresholds;
  industry_multipliers: Record<string, number>;
  service_packages: ServicePackageConfig[];
  confidence_rules: {
    require_phone: boolean;
    require_email: boolean;
    require_website: boolean;
    require_gmb: boolean;
  };
}

export type PainPointCategory =
  | 'Website'
  | 'SEO'
  | 'GMB'
  | 'Reviews'
  | 'Google Ads'
  | 'Meta Ads'
  | 'Tracking'
  | 'Conversion'
  | 'Technical Performance'
  | 'Brand Visibility';

export interface EvidenceBasedPainPoint {
  id: string;
  category: PainPointCategory;
  finding: string;
  evidence: string; // VERIFIED FACT
  business_impact: string; // AI INTERPRETATION
  recommended_service: string; // RECOMMENDATION
  confidence: 'High' | 'Medium' | 'Low';
}

export type AgencyServiceName =
  | 'Website Development'
  | 'Website SEO'
  | 'Technical Optimization'
  | 'Google Business Profile Optimization'
  | 'Google Ads Management'
  | 'Meta Ads'
  | 'Reputation Management'
  | 'Voice Search Optimization'
  | 'Lead Generation Systems';

export interface ServiceOpportunityItem {
  service: AgencyServiceName;
  match_score: number; // 0-100
  opportunity_level: 'High' | 'Medium' | 'Low';
  estimated_value_monthly: number;
  evidence_signals: string[];
  pitch_angle: string;
}

export interface AILeadAssessment {
  business_overview: string;
  verified_digital_presence: string[];
  marketing_opportunities: string[];
  primary_pain_points: EvidenceBasedPainPoint[];
  best_service_match: string;
  secondary_service_match: string;
  revenue_potential: string;
  contact_strategy: string;
  potential_objections: string[];
  recommended_outreach_channel: string;
  recommended_next_action: string;
  generated_at: string;
  model?: string;
}

export interface SophiaLeadBrief {
  why_this_lead_matters: string;
  best_opportunity: string;
  why_now: string;
  best_contact_method: string;
  recommended_first_action: string;
  generated_at: string;
}

export interface RecommendedOutreachStrategy {
  first_channel: 'Email' | 'Phone Call' | 'AI Call' | 'SMS';
  second_channel: 'Email' | 'Phone Call' | 'AI Call' | 'SMS';
  recommended_timing: string;
  primary_offer: string;
  primary_pain_point: string;
  call_to_action: string;
}

export interface ScoreExplanation {
  score_name: string;
  score_value: number;
  positive_factors: string[];
  negative_factors: string[];
  missing_data: string[]; // Classify missing as 'Unknown'
  calculation_summary: string;
}

export interface ScoreManualOverride {
  override_id: string;
  original_score: number;
  override_score: number;
  score_type: string; // 'overall_priority_score' | 'opportunity_score' | etc.
  reason: string;
  user: string;
  timestamp: string;
}

export interface ScoreHistory {
  history_id: string;
  lead_id: string;
  score_type: string;
  previous_value: number;
  new_value: number;
  reason: string;
  source: 'Gemini AI' | 'Rule Engine' | 'Audit' | 'User Activity' | 'Manual Override' | string;
  created_at: string;
}

export interface BuyingIntentSignals {
  observed_signals: string[];
  ai_interpretation: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface ContactabilityBreakdown {
  has_valid_phone: boolean;
  has_valid_email: boolean;
  has_verified_email: boolean;
  has_website_form: boolean;
  has_gmb_contact: boolean;
  multiple_channels: boolean;
  details: string[];
}

export interface DataConfidenceBreakdown {
  status: 'High' | 'Medium' | 'Low';
  verified_fields: string[];
  missing_fields: string[];
  duplicate_risk: boolean;
  audit_completeness: number; // 0-100%
  data_freshness: string;
}

export interface LeadIntelligence {
  lead_intelligence_id: string;
  lead_id: string;
  opportunity_score: number; // 0-100
  service_match_score: number; // 0-100
  revenue_potential_score: number; // 0-100
  contactability_score: number; // 0-100
  buying_intent_score: number; // 0-100
  data_confidence_score: number; // 0-100
  engagement_score: number; // 0-100 (from Phase 2F)
  overall_priority_score: number; // 0-100 (weighted)
  priority_tier: PriorityTier;
  lead_temperature: LeadTemperature;
  recommended_primary_service: string;
  recommended_secondary_service: string;
  estimated_retainer_min: number;
  estimated_retainer_max: number;
  buying_intent_signals: BuyingIntentSignals;
  contactability_breakdown: ContactabilityBreakdown;
  data_confidence_breakdown: DataConfidenceBreakdown;
  ai_assessment?: AILeadAssessment;
  sophia_brief?: SophiaLeadBrief;
  recommended_strategy?: RecommendedOutreachStrategy;
  service_matrix: ServiceOpportunityItem[];
  pain_points: EvidenceBasedPainPoint[];
  score_explanations: Record<string, ScoreExplanation>;
  manual_overrides?: ScoreManualOverride[];
  updated_at: string;
}

// ==========================================================
// PHASE 3C — PROPOSAL, AUDIT & CLIENT CONVERSION ENGINE TYPES
// ==========================================================

export type AuditSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type AuditCategory =
  | 'Google Business Profile'
  | 'Website'
  | 'PageSpeed'
  | 'Technical SEO'
  | 'Mobile Performance'
  | 'Website Technology'
  | 'Meta Pixel'
  | 'Google Ads'
  | 'Tracking'
  | 'Reviews'
  | 'Local Visibility'
  | 'Contact Information'
  | 'Social Presence';

export interface AuditFinding {
  id: string;
  category: AuditCategory;
  issue: string;
  evidence: string; // VERIFIED FINDING (must be grounded in actual lead data)
  severity: AuditSeverity;
  potential_business_impact: string; // BUSINESS IMPACT (cautious, estimated)
  recommended_service: string; // RECOMMENDED ACTION
  priority: number; // 1 to 5
}

export interface DigitalScorecard {
  website: number | 'Not Audited';
  seo: number | 'Not Audited';
  google_business_profile: number | 'Not Audited';
  reviews: number | 'Not Audited';
  performance: number | 'Not Audited';
  tracking: number | 'Not Audited';
  advertising: number | 'Not Audited';
  overall_opportunity: number | 'Not Audited';
  audit_coverage_pct: number;
  audited_categories_count: number;
  total_categories_count: number;
}

export type AuditStatus = 'Draft' | 'Generated' | 'Reviewed' | 'Sent' | 'Archived';

export interface AuditReport {
  audit_id: string;
  lead_id: string;
  business_name: string;
  version: number;
  status: AuditStatus;
  executive_summary: {
    digital_growth_opportunity: string;
    top_priority: string;
    why_it_matters: string;
    recommended_agency_solution: string;
  };
  business_overview: string;
  current_digital_presence: string;
  strengths: string[];
  opportunities: string[];
  critical_issues: string[];
  marketing_gaps: string[];
  revenue_opportunities: string[];
  recommended_services: string[];
  priority_actions: string[];
  expected_business_impact: string;
  recommended_next_step: string;
  findings: AuditFinding[];
  digital_scorecard: DigitalScorecard;
  competitor_notes?: string;
  estimated_agency_investment: {
    monthly_retainer_range: string;
    setup_fee_range: string;
  };
  changes?: string;
  generated_by: string;
  generated_at: string;
  sent_at?: string;
  reviewed_at?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  monthly_price: number;
  setup_fee: number;
  description: string;
  deliverables: string[];
  is_optional_addon?: boolean;
  selected: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  recommended_for: string;
  services: ServiceItem[];
  default_monthly_retainer: number;
  default_setup_fee: number;
  suggested_contract_months: number;
}

export type ProposalStatus =
  | 'Draft'
  | 'Internal Review'
  | 'Ready to Send'
  | 'Sent'
  | 'Viewed'
  | 'Negotiation'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Archived';

export interface ProposalPricing {
  monthly_retainer: number;
  setup_fee: number;
  discount: number;
  contract_length_months: number;
  optional_services_total: number;
  total_first_month: number;
  recurring_monthly_cost: number;
  notes?: string;
}

export interface ProposalRoadmapPhase {
  phase: string;
  timeline: string;
  focus: string;
  deliverables: string[];
}

export interface ProposalContent {
  cover_page: {
    title: string;
    client_name: string;
    agency_name: string;
    prepared_by: string;
    date: string;
    valid_until: string;
  };
  about_agency: string;
  client_overview: string;
  understanding_goals: string;
  current_opportunities: string[];
  recommended_strategy: string;
  implementation_roadmap: ProposalRoadmapPhase[];
  deliverables_summary: string[];
  investment_summary: string;
  optional_addons: string[];
  why_mca: string;
  next_steps: string;
  acceptance_terms: string;
}

export interface ProposalVersionHistory {
  version: number;
  date: string;
  author: string;
  changes: string;
  price_changes?: string;
  services_added?: string[];
  services_removed?: string[];
}

export interface ProposalTracking {
  sent_at?: string;
  opened_at?: string;
  viewed_at?: string;
  downloaded_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  view_count: number;
}

export interface ProposalNegotiationIntelligence {
  analyzed_at: string;
  objection_summary: string;
  risk_assessment: 'Low' | 'Medium' | 'High';
  client_signals: string[];
  suggested_response: string;
  recommended_compromise: string;
  alternative_package?: {
    name: string;
    revised_retainer: number;
    revised_setup_fee: number;
    scope_adjustment: string;
  };
}

export interface Proposal {
  proposal_id: string;
  lead_id: string;
  audit_id?: string;
  version: number;
  status: ProposalStatus;
  title: string;
  services: ServiceItem[];
  pricing: ProposalPricing;
  monthly_retainer: number;
  setup_fee: number;
  contract_length: string;
  content: ProposalContent;
  tracking: ProposalTracking;
  version_history: ProposalVersionHistory[];
  negotiation_intelligence?: ProposalNegotiationIntelligence;
  created_at: string;
  sent_at?: string;
  accepted_at?: string;
}

export type ClientStatus = 'Active' | 'Onboarding' | 'At Risk' | 'Churned';

export interface OnboardingTask {
  id: string;
  title: string;
  category: 'Setup' | 'Access Collection' | 'Strategy' | 'Kickoff' | 'Reporting';
  completed: boolean;
  due_date: string;
  assignee: string;
  description: string;
}

export interface ClientHandoffBrief {
  business_information: string;
  primary_contacts: string;
  services_purchased: string[];
  pain_points: string[];
  audit_summary: string;
  sales_conversation_summary: string;
  promises_made: string[];
  objections_resolved: string[];
  pricing: {
    actual_mrr: number;
    setup_fee: number;
    contract: string;
  };
  contract_information: string;
  recommended_onboarding_steps: string[];
}

export interface Client {
  client_id: string;
  original_lead_id: string;
  business_name: string;
  primary_contact: {
    name: string;
    phone: string;
    email: string;
    role?: string;
  };
  services: string[];
  actual_mrr: number;
  setup_fee: number;
  contract_start_date: string;
  contract_length: string;
  status: ClientStatus;
  created_at: string;
  handoff_brief: ClientHandoffBrief;
  onboarding_checklist: OnboardingTask[];
}

export interface ProposalAnalyticsMetrics {
  audits_generated: number;
  audits_sent: number;
  proposals_draft: number;
  proposals_sent: number;
  proposals_viewed: number;
  pending_decisions: number;
  accepted_proposals: number;
  rejected_proposals: number;
  won_mrr: number;
  conversion_rate: number;
  avg_proposal_value: number;
  avg_time_to_decision_days: number;
}

export * from './types/aiWorkforce';
export * from './types/clientPortal';
export * from './types/commandCenter';



