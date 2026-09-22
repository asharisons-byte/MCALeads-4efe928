import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. ORGANIZATIONS & TENANTS
// ==========================================
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().default('Marketing Charm Agency'),
  slug: text('slug').notNull().default('marketing-charm-agency').unique(),
  organizationType: text('organization_type').notNull().default('AGENCY'), // 'AGENCY' | 'CLIENT' | 'SYSTEM'
  logoUrl: text('logo_url'),
  website: text('website').default('https://marketingcharmagency.com'),
  email: text('email').default('contact@marketingcharmagency.com'),
  phone: text('phone').default('+1-503-241-7998'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ==========================================
// 2. USERS & ACCESS MANAGEMENT
// ==========================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  organizationId: integer('organization_id').references(() => organizations.id),
  firstName: text('first_name'),
  lastName: text('last_name'),
  displayName: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: text('role').notNull().default('Admin'), // Admin, Manager, Sales, Account Manager, User
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'), // active, invited, suspended
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  inviteToken: text('invite_token').unique(),
  inviteExpiresAt: timestamp('invite_expires_at'),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  scope: text('scope').notNull().default('AGENCY'), // AGENCY, CLIENT, SYSTEM
  createdAt: timestamp('created_at').defaultNow(),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  module: text('module').notNull(),
  action: text('action').notNull(),
  description: text('description'),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  roleId: integer('role_id').references(() => roles.id).notNull(),
  organizationId: integer('organization_id').references(() => organizations.id),
  assignedAt: timestamp('assigned_at').defaultNow(),
  assignedBy: text('assigned_by'),
});

export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id).notNull(),
  permissionId: integer('permission_id').references(() => permissions.id).notNull(),
});

// ==========================================
// 3. LEADS (CENTRAL SOURCE OF TRUTH)
// ==========================================
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  leadId: text('lead_id').notNull().unique(), // e.g. CCB-189420 or uuid
  organizationId: integer('organization_id').references(() => organizations.id),
  businessName: text('business_name').notNull(),
  contactName: text('contact_name'),
  phone: text('phone'),
  phoneE164: text('phone_e164'),
  email: text('email'),
  website: text('website'),
  industry: text('industry').default('Contractor'),
  serviceCategory: text('service_category'),
  niche: text('niche'),
  address: text('address'),
  city: text('city'),
  county: text('county'),
  stateRegion: text('state_region').default('OR'),
  country: text('country').default('USA'),
  postalCode: text('postal_code'),
  latitude: numeric('latitude', { precision: 10, scale: 6 }),
  longitude: numeric('longitude', { precision: 10, scale: 6 }),
  googleMapsUrl: text('google_maps_url'),
  googlePlaceId: text('google_place_id'),
  leadSource: text('lead_source').default('Oregon CCB License Database'),
  leadStatus: text('lead_status').notNull().default('New Lead'), // New Lead, Contacted, Audit Sent, Proposal Sent, Negotiation, Won Retainer, Lost, Archived
  leadScore: integer('lead_score').notNull().default(50),
  estimatedRetainer: integer('estimated_retainer').default(2500),
  estimatedValue: integer('estimated_value').default(30000),
  assignedTo: text('assigned_to').default('Sophia (AI Sales Rep)'),
  assignedUserId: integer('assigned_user_id').references(() => users.id),
  ccbLicenseNumber: text('ccb_license_number'),
  isHotTarget: boolean('is_hot_target').default(false),
  doNotContact: boolean('do_not_contact').default(false),
  opportunityAngle: text('opportunity_angle'),
  recommendedService: text('recommended_service'),
  rawPayload: jsonb('raw_payload'), // Preserves original CCB / CSV dataset attributes
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  archivedAt: timestamp('archived_at'),
  deletedAt: timestamp('deleted_at'),
});

// ==========================================
// 4. LEAD DETAILS, AUDITS & SCORING
// ==========================================
export const leadDetails = pgTable('lead_details', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull().unique(),
  description: text('description'),
  businessHours: text('business_hours'),
  yearEstablished: integer('year_established'),
  employeeSize: text('employee_size'),
  serviceArea: text('service_area'),
  websiteStatus: text('website_status').default('Active'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const leadAudits = pgTable('lead_audits', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  gmbStatus: text('gmb_status').default('Established'),
  googleRating: numeric('google_rating', { precision: 3, scale: 1 }).default('4.5'),
  reviewCount: integer('review_count').default(12),
  websiteStatus: text('website_status').default('Active'),
  mobileScore: integer('mobile_score').default(45),
  desktopScore: integer('desktop_score').default(68),
  performanceScore: integer('performance_score').default(52),
  seoScore: integer('seo_score').default(55),
  cms: text('cms').default('WordPress'),
  metaPixelDetected: boolean('meta_pixel_detected').default(false),
  googleAdsDetected: boolean('google_ads_detected').default(false),
  technicalIssues: jsonb('technical_issues'),
  auditSummary: text('audit_summary'),
  lastAuditedAt: timestamp('last_audited_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leadScores = pgTable('lead_scores', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  totalScore: integer('total_score').notNull(),
  gmbScore: integer('gmb_score').default(10),
  websiteScore: integer('website_score').default(10),
  technicalScore: integer('technical_score').default(10),
  adsScore: integer('ads_score').default(10),
  opportunityScore: integer('opportunity_score').default(20),
  contactScore: integer('contact_score').default(10),
  confidence: numeric('confidence', { precision: 4, scale: 2 }).default('0.95'),
  reasoning: text('reasoning'),
  scoringVersion: text('scoring_version').default('v2-sophia'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leadScoreFactors = pgTable('lead_score_factors', {
  id: serial('id').primaryKey(),
  leadScoreId: integer('lead_score_id').references(() => leadScores.id).notNull(),
  factorName: text('factor_name').notNull(),
  factorValue: text('factor_value').notNull(),
  weight: integer('weight').notNull(),
  points: integer('points').notNull(),
  evidence: text('evidence'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const googleBusinessProfiles = pgTable('google_business_profiles', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  placeId: text('place_id'),
  businessName: text('business_name').notNull(),
  rating: numeric('rating', { precision: 3, scale: 1 }),
  reviewCount: integer('review_count'),
  profileStatus: text('profile_status').default('VERIFIED'),
  category: text('category'),
  address: text('address'),
  phone: text('phone'),
  website: text('website'),
  mapsUrl: text('maps_url'),
  latitude: numeric('latitude', { precision: 10, scale: 6 }),
  longitude: numeric('longitude', { precision: 10, scale: 6 }),
  lastVerifiedAt: timestamp('last_verified_at').defaultNow(),
  dataSource: text('data_source').default('Google Maps Places API'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const websiteAudits = pgTable('website_audits', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  url: text('url').notNull(),
  status: text('status').default('COMPLETED'),
  cms: text('cms'),
  mobileScore: integer('mobile_score'),
  desktopScore: integer('desktop_score'),
  performanceScore: integer('performance_score'),
  seoScore: integer('seo_score'),
  accessibilityScore: integer('accessibility_score'),
  bestPracticesScore: integer('best_practices_score'),
  loadTime: numeric('load_time', { precision: 6, scale: 2 }),
  serverStatus: text('server_status').default('ONLINE'),
  sslStatus: text('ssl_status').default('VALID'),
  lastAuditedAt: timestamp('last_audited_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const technologyAudits = pgTable('technology_audits', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  technologyName: text('technology_name').notNull(),
  technologyCategory: text('technology_category'),
  detected: boolean('detected').default(true),
  confidence: numeric('confidence', { precision: 4, scale: 2 }).default('0.90'),
  evidence: text('evidence'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const advertisingAudits = pgTable('advertising_audits', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  googleAdsDetected: boolean('google_ads_detected').default(false),
  metaPixelDetected: boolean('meta_pixel_detected').default(false),
  conversionTrackingDetected: boolean('conversion_tracking_detected').default(false),
  googleTagManagerDetected: boolean('google_tag_manager_detected').default(false),
  advertisingOpportunity: text('advertising_opportunity'),
  confidence: numeric('confidence', { precision: 4, scale: 2 }).default('0.85'),
  evidence: text('evidence'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leadOpportunities = pgTable('lead_opportunities', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  service: text('service').notNull(),
  opportunityType: text('opportunity_type').notNull(),
  priority: text('priority').default('HIGH'),
  estimatedMonthlyValue: integer('estimated_monthly_value').default(2500),
  confidence: numeric('confidence', { precision: 4, scale: 2 }).default('0.90'),
  evidence: text('evidence'),
  status: text('status').default('IDENTIFIED'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 5. AI CONTENT & PITCHES
// ==========================================
export const aiContent = pgTable('ai_content', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  contentType: text('content_type').notNull(), // 'AI Pitch' | 'Email' | 'Calling Script' | 'Loom Video Script' | 'Objection Handling' | 'Proposal Content' | 'Follow-Up Email' | 'SMS Script' | 'AI Summary'
  title: text('title').notNull(),
  content: text('content').notNull(),
  model: text('model').default('gemini-2.5-pro'),
  status: text('status').default('Approved'), // Draft, Approved, Archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiPitches = pgTable('ai_pitches', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  agentId: text('agent_id').default('sophia'),
  opportunityAngle: text('opportunity_angle'),
  primaryService: text('primary_service'),
  secondaryServices: jsonb('secondary_services'),
  revenueLiftEstimate: text('revenue_lift_estimate'),
  confidence: numeric('confidence', { precision: 4, scale: 2 }).default('0.92'),
  pitchContent: text('pitch_content').notNull(),
  model: text('model').default('gemini-2.5-pro'),
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
});

// ==========================================
// 6. COMMUNICATIONS (EMAILS, CALLS, SMS)
// ==========================================
export const emailMessages = pgTable('email_messages', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  campaignId: text('campaign_id'),
  direction: text('direction').notNull().default('Outbound'), // Outbound, Inbound
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull().default('Draft'), // Draft, Approved, Sent, Delivered, Failed, Replied
  provider: text('provider').default('Gmail API'),
  externalMessageId: text('external_message_id'),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  repliedAt: timestamp('replied_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailThreads = pgTable('email_threads', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  providerThreadId: text('provider_thread_id'),
  subject: text('subject').notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  status: text('status').default('OPEN'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const calls = pgTable('calls', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  phone: text('phone').notNull(),
  contactPhone: text('contact_phone'),
  direction: text('direction').default('Outbound'),
  provider: text('provider').default('Telnyx'),
  externalCallId: text('external_call_id'),
  status: text('status').default('Completed'), // Queued, Ringing, In Progress, Completed, Failed, Cancelled
  durationSeconds: integer('duration_seconds').default(0),
  recordingUrl: text('recording_url'),
  transcript: text('transcript'),
  transcriptStatus: text('transcript_status').default('COMPLETED'),
  aiSummary: text('ai_summary'),
  callOutcome: text('call_outcome').default('Connected - Positive Interest'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const callTranscripts = pgTable('call_transcripts', {
  id: serial('id').primaryKey(),
  callId: integer('call_id').references(() => calls.id).notNull(),
  speaker: text('speaker').notNull(), // 'Sophia (AI)' | 'Contractor' | 'Agent'
  text: text('text').notNull(),
  timestampSeconds: numeric('timestamp_seconds', { precision: 8, scale: 2 }),
  confidence: numeric('confidence', { precision: 4, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const callSummaries = pgTable('call_summaries', {
  id: serial('id').primaryKey(),
  callId: integer('call_id').references(() => calls.id).notNull(),
  agentId: text('agent_id').default('sophia'),
  summary: text('summary').notNull(),
  outcome: text('outcome').notNull(),
  sentiment: text('sentiment').default('POSITIVE'),
  objections: jsonb('objections'),
  nextSteps: text('next_steps'),
  followUpDate: text('follow_up_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const smsMessages = pgTable('sms_messages', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  direction: text('direction').notNull().default('Outbound'), // Outbound, Inbound
  status: text('status').notNull().default('Sent'), // Draft, Sent, Delivered, Failed, Replied
  provider: text('provider').default('Telnyx'),
  externalMessageId: text('external_message_id'),
  sentAt: timestamp('sent_at').defaultNow(),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 7. CRM NOTES, ACTIVITIES & STATUS HISTORY
// ==========================================
export const crmNotes = pgTable('crm_notes', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  clientId: integer('client_id'),
  authorUserId: integer('author_user_id').references(() => users.id),
  authorName: text('author_name').default('Sophia (AI Sales Rep)'),
  content: text('content').notNull(),
  noteType: text('note_type').notNull().default('General'), // General, Call Note, AI Note, Follow-Up, Objection, Sales
  visibility: text('visibility').notNull().default('Internal'), // Internal, Client Shared, Restricted
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  userId: integer('user_id').references(() => users.id),
  leadId: integer('lead_id').references(() => leads.id),
  clientId: integer('client_id'),
  activityType: text('activity_type').notNull(), // 'lead_created' | 'status_changed' | 'call_completed' | 'email_sent' | etc.
  title: text('title').notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leadStatusHistory = pgTable('lead_status_history', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id).notNull(),
  previousStatus: text('previous_status').notNull(),
  newStatus: text('new_status').notNull(),
  changedBy: text('changed_by').default('Sophia (AI)'),
  changeSource: text('change_source').default('AI'), // User, AI, Automation, System
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  leadId: integer('lead_id').references(() => leads.id),
  relatedClientId: integer('related_client_id'),
  title: text('title').notNull(),
  description: text('description'),
  taskType: text('task_type').default('Follow-Up'),
  priority: text('priority').notNull().default('Medium'), // Low, Medium, High, Urgent
  status: text('status').notNull().default('Open'), // Open, In Progress, Completed, Cancelled
  assignedTo: text('assigned_to').default('Sophia (AI Sales Rep)'),
  assignedUserId: integer('assigned_user_id').references(() => users.id),
  dueDate: text('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 8. CLIENTS, SERVICES, CONTRACTS & REVENUE
// ==========================================
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull().unique(), // e.g. CLI-101
  organizationId: integer('organization_id').references(() => organizations.id),
  leadId: integer('lead_id').references(() => leads.id),
  businessName: text('business_name').notNull(),
  website: text('website'),
  email: text('email'),
  phone: text('phone'),
  industry: text('industry'),
  address: text('address'),
  city: text('city'),
  stateRegion: text('state_region').default('OR'),
  country: text('country').default('USA'),
  postalCode: text('postal_code'),
  monthlyRetainer: integer('monthly_retainer').notNull().default(2800),
  actualMrr: integer('actual_mrr').notNull().default(2800),
  clientStatus: text('client_status').notNull().default('Active'), // Prospect, Onboarding, Active, Paused, At Risk, Former Client
  accountManager: text('account_manager').default('Sophia'),
  accountManagerId: integer('account_manager_id').references(() => users.id),
  startDate: text('start_date'),
  renewalDate: text('renewal_date'),
  healthScore: integer('health_score').default(85),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clientServices = pgTable('client_services', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  serviceName: text('service_name').notNull(), // 'SEO' | 'Website Development' | 'Google Ads' | 'Meta Ads' | 'GMB Optimization'
  serviceCategory: text('service_category'),
  monthlyPrice: integer('monthly_price').notNull().default(1500),
  status: text('status').notNull().default('Active'), // Active, Paused, Completed
  startDate: text('start_date'),
  renewalDate: text('renewal_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clientContracts = pgTable('client_contracts', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  title: text('title').notNull(),
  contractValue: integer('contract_value').notNull(),
  billingFrequency: text('billing_frequency').default('MONTHLY'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  renewalDate: text('renewal_date'),
  status: text('status').default('ACTIVE'),
  documentUrl: text('document_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clientHealthScores = pgTable('client_health_scores', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  healthScore: integer('health_score').notNull(),
  communicationScore: integer('communication_score').default(85),
  deliveryScore: integer('delivery_score').default(90),
  engagementScore: integer('engagement_score').default(80),
  paymentScore: integer('payment_score').default(95),
  riskLevel: text('risk_level').default('LOW'),
  evidence: text('evidence'),
  calculatedAt: timestamp('calculated_at').defaultNow(),
});

export const clientRenewals = pgTable('client_renewals', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  contractId: integer('contract_id').references(() => clientContracts.id),
  renewalDate: text('renewal_date').notNull(),
  estimatedValue: integer('estimated_value').notNull(),
  status: text('status').default('PENDING'),
  riskLevel: text('risk_level').default('LOW'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const revenueRecords = pgTable('revenue_records', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  clientId: integer('client_id').references(() => clients.id),
  serviceId: integer('service_id').references(() => clientServices.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD'),
  revenueType: text('revenue_type').notNull().default('Confirmed'), // Confirmed, Pipeline, Estimated
  periodStart: text('period_start'),
  periodEnd: text('period_end'),
  status: text('status').default('PAID'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id),
  clientId: integer('client_id').references(() => clients.id),
  title: text('title').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').default('SENT'), // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  sentAt: timestamp('sent_at'),
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agencyServices = pgTable('agency_services', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  defaultPrice: integer('default_price').notNull(),
  minimumPrice: integer('minimum_price').notNull(),
  maximumPrice: integer('maximum_price').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 9. AI WORKFORCE & TASKS
// ==========================================
export const aiAgents = pgTable('ai_agents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  name: text('name').notNull(), // Sophia, Atlas, Nova, Orbit, Aria, Pulse, Nexus
  role: text('role').notNull(),
  description: text('description'),
  status: text('status').default('ACTIVE'),
  provider: text('provider').default('Google Gemini'),
  defaultModel: text('default_model').default('gemini-2.5-pro'),
  configurationReference: jsonb('configuration_reference'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiTasks = pgTable('ai_tasks', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => aiAgents.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  taskType: text('task_type').notNull(),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  priority: text('priority').default('NORMAL'),
  status: text('status').default('PENDING'),
  inputReference: jsonb('input_reference'),
  outputReference: jsonb('output_reference'),
  errorSummary: text('error_summary'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});

export const aiOutputs = pgTable('ai_outputs', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => aiTasks.id),
  agentId: integer('agent_id').references(() => aiAgents.id),
  model: text('model').default('gemini-2.5-pro'),
  outputType: text('output_type').notNull(),
  content: text('content').notNull(),
  structuredData: jsonb('structured_data'),
  confidence: numeric('confidence', { precision: 4, scale: 2 }).default('0.95'),
  version: integer('version').default(1),
  status: text('status').default('APPROVED'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiApprovals = pgTable('ai_approvals', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => aiTasks.id),
  actionType: text('action_type').notNull(),
  status: text('status').default('PENDING'),
  requestedAt: timestamp('requested_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by'),
  finalOutputReference: text('final_output_reference'),
});

export const aiFeedback = pgTable('ai_feedback', {
  id: serial('id').primaryKey(),
  aiOutputId: integer('ai_output_id').references(() => aiOutputs.id),
  userId: integer('user_id').references(() => users.id),
  feedbackType: text('feedback_type').notNull(), // Approved, Edited, Rejected, Incorrect, Useful
  originalOutput: text('original_output'),
  editedOutput: text('edited_output'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 10. CLIENT PORTAL
// ==========================================
export const clientPortalUsers = pgTable('client_portal_users', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  role: text('role').default('Client Member'),
  status: text('status').default('ACTIVE'),
  invitedAt: timestamp('invited_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  lastLoginAt: timestamp('last_login_at'),
});

export const clientRequests = pgTable('client_requests', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  submittedBy: text('submitted_by').notNull(),
  category: text('category').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  priority: text('priority').default('NORMAL'),
  status: text('status').default('NEW'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clientApprovals = pgTable('client_approvals', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('PENDING'),
  requestedAt: timestamp('requested_at').defaultNow(),
  respondedAt: timestamp('responded_at'),
  respondedBy: text('responded_by'),
});

// ==========================================
// 11. DOCUMENTS & STORAGE
// ==========================================
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  clientId: integer('client_id').references(() => clients.id),
  leadId: integer('lead_id').references(() => leads.id),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'Audit' | 'Proposal' | 'Contract' | 'Report' | 'Deliverable'
  fileName: text('file_name').notNull(),
  storageReference: text('storage_reference').notNull(),
  mimeType: text('mime_type').default('application/pdf'),
  fileSize: integer('file_size'),
  visibility: text('visibility').default('Internal'), // Internal, Client, Restricted
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 12. NOTIFICATIONS & AUTOMATION RUNS
// ==========================================
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  priority: text('priority').default('NORMAL'),
  readAt: timestamp('read_at'),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const automationRuns = pgTable('automation_runs', {
  id: serial('id').primaryKey(),
  workflowName: text('workflow_name').notNull(),
  workflowProvider: text('workflow_provider').default('n8n'),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  status: text('status').default('SUCCESS'),
  externalRunId: text('external_run_id'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  errorSummary: text('error_summary'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: serial('id').primaryKey(),
  provider: text('provider').notNull(), // 'Telnyx' | 'Gmail' | 'n8n'
  eventType: text('event_type').notNull(),
  externalEventId: text('external_event_id').unique(),
  payloadReference: jsonb('payload_reference'),
  processingStatus: text('processing_status').default('PROCESSED'),
  processedAt: timestamp('processed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  provider: text('provider').notNull(), // 'Google', 'Gmail', 'Telnyx', 'n8n', 'Google Maps', 'Google Gemini'
  integrationType: text('integration_type').notNull(),
  status: text('status').notNull().default('CONNECTED'), // CONNECTED, CONFIGURING, ERROR, OFFLINE
  configurationReference: jsonb('configuration_reference'),
  lastSyncAt: timestamp('last_sync_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 13. SETTINGS & ADMINISTRATION
// ==========================================
export const organizationSettings = pgTable('organization_settings', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  settingKey: text('setting_key').notNull(),
  settingValue: text('setting_value').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencySettings = pgTable('agency_settings', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull().default('Marketing Charm Agency'),
  productName: text('product_name').notNull().default('MCA Lead Agency Suite'),
  companyLogo: text('company_logo'),
  defaultSenderName: text('default_sender_name').notNull().default('Sophia'),
  defaultAiAgent: text('default_ai_agent').notNull().default('Sophia'),
  currency: text('currency').notNull().default('USD'),
  timezone: text('timezone').notNull().default('America/Los_Angeles'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // 'lead.created', 'lead.status_updated', 'client.converted', etc.
  resourceType: text('resource_type').notNull(), // 'lead', 'client', 'email', 'proposal'
  resourceId: text('resource_id').notNull(),
  previousDataReference: jsonb('previous_data_reference'),
  newDataReference: jsonb('new_data_reference'),
  ipReference: text('ip_reference'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemErrors = pgTable('system_errors', {
  id: serial('id').primaryKey(),
  service: text('service').notNull(),
  module: text('module').notNull(),
  severity: text('severity').notNull().default('ERROR'), // INFO, WARNING, ERROR, CRITICAL
  errorCode: text('error_code'),
  friendlyMessage: text('friendly_message').notNull(),
  technicalReference: text('technical_reference'),
  status: text('status').default('OPEN'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const backgroundJobs = pgTable('background_jobs', {
  id: serial('id').primaryKey(),
  jobType: text('job_type').notNull(),
  payloadReference: jsonb('payload_reference'),
  status: text('status').default('PENDING'), // PENDING, PROCESSING, COMPLETED, FAILED
  priority: text('priority').default('NORMAL'),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  scheduledAt: timestamp('scheduled_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
});

// ==========================================
// 14. RELATIONS DEFINITIONS
// ==========================================
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  clients: many(clients),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  assignedLeads: many(leads),
  notes: many(crmNotes),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id],
  }),
  details: one(leadDetails, {
    fields: [leads.id],
    references: [leadDetails.leadId],
  }),
  audits: many(leadAudits),
  scores: many(leadScores),
  aiContent: many(aiContent),
  emails: many(emailMessages),
  calls: many(calls),
  sms: many(smsMessages),
  notes: many(crmNotes),
  activities: many(activities),
  tasks: many(tasks),
  client: one(clients, {
    fields: [leads.id],
    references: [clients.leadId],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  lead: one(leads, {
    fields: [clients.leadId],
    references: [leads.id],
  }),
  services: many(clientServices),
  contracts: many(clientContracts),
  renewals: many(clientRenewals),
  healthScores: many(clientHealthScores),
  revenueRecords: many(revenueRecords),
}));
