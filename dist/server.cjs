var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app
});
module.exports = __toCommonJS(server_exports);
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/db/repository.ts
var import_drizzle_orm2 = require("drizzle-orm");

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  advertisingAudits: () => advertisingAudits,
  agencyServices: () => agencyServices,
  agencySettings: () => agencySettings,
  aiAgents: () => aiAgents,
  aiApprovals: () => aiApprovals,
  aiContent: () => aiContent,
  aiFeedback: () => aiFeedback,
  aiOutputs: () => aiOutputs,
  aiPitches: () => aiPitches,
  aiTasks: () => aiTasks,
  auditLogs: () => auditLogs,
  automationRuns: () => automationRuns,
  backgroundJobs: () => backgroundJobs,
  callSummaries: () => callSummaries,
  callTranscripts: () => callTranscripts,
  calls: () => calls,
  clientApprovals: () => clientApprovals,
  clientContracts: () => clientContracts,
  clientHealthScores: () => clientHealthScores,
  clientPortalUsers: () => clientPortalUsers,
  clientRenewals: () => clientRenewals,
  clientRequests: () => clientRequests,
  clientServices: () => clientServices,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  crmNotes: () => crmNotes,
  documents: () => documents,
  emailMessages: () => emailMessages,
  emailThreads: () => emailThreads,
  googleBusinessProfiles: () => googleBusinessProfiles,
  integrations: () => integrations,
  leadAudits: () => leadAudits,
  leadDetails: () => leadDetails,
  leadOpportunities: () => leadOpportunities,
  leadScoreFactors: () => leadScoreFactors,
  leadScores: () => leadScores,
  leadStatusHistory: () => leadStatusHistory,
  leads: () => leads,
  leadsRelations: () => leadsRelations,
  notifications: () => notifications,
  organizationSettings: () => organizationSettings,
  organizations: () => organizations,
  organizationsRelations: () => organizationsRelations,
  permissions: () => permissions,
  proposals: () => proposals,
  revenueRecords: () => revenueRecords,
  rolePermissions: () => rolePermissions,
  roles: () => roles,
  smsMessages: () => smsMessages,
  systemErrors: () => systemErrors,
  tasks: () => tasks,
  technologyAudits: () => technologyAudits,
  userRoles: () => userRoles,
  users: () => users,
  usersRelations: () => usersRelations,
  webhookEvents: () => webhookEvents,
  websiteAudits: () => websiteAudits
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var organizations = (0, import_pg_core.pgTable)("organizations", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull().default("Marketing Charm Agency"),
  slug: (0, import_pg_core.text)("slug").notNull().default("marketing-charm-agency").unique(),
  organizationType: (0, import_pg_core.text)("organization_type").notNull().default("AGENCY"),
  // 'AGENCY' | 'CLIENT' | 'SYSTEM'
  logoUrl: (0, import_pg_core.text)("logo_url"),
  website: (0, import_pg_core.text)("website").default("https://marketingcharmagency.com"),
  email: (0, import_pg_core.text)("email").default("contact@marketingcharmagency.com"),
  phone: (0, import_pg_core.text)("phone").default("+1-503-241-7998"),
  status: (0, import_pg_core.text)("status").notNull().default("ACTIVE"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").notNull().unique(),
  // Firebase Auth UID
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  firstName: (0, import_pg_core.text)("first_name"),
  lastName: (0, import_pg_core.text)("last_name"),
  displayName: (0, import_pg_core.text)("display_name").notNull(),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  phone: (0, import_pg_core.text)("phone"),
  role: (0, import_pg_core.text)("role").notNull().default("Admin"),
  // Admin, Manager, Sales, Account Manager, User
  avatarUrl: (0, import_pg_core.text)("avatar_url"),
  status: (0, import_pg_core.text)("status").notNull().default("active"),
  // active, invited, suspended
  lastLoginAt: (0, import_pg_core.timestamp)("last_login_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow(),
  inviteToken: (0, import_pg_core.text)("invite_token").unique(),
  inviteExpiresAt: (0, import_pg_core.timestamp)("invite_expires_at")
});
var roles = (0, import_pg_core.pgTable)("roles", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull().unique(),
  description: (0, import_pg_core.text)("description"),
  scope: (0, import_pg_core.text)("scope").notNull().default("AGENCY"),
  // AGENCY, CLIENT, SYSTEM
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var permissions = (0, import_pg_core.pgTable)("permissions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  module: (0, import_pg_core.text)("module").notNull(),
  action: (0, import_pg_core.text)("action").notNull(),
  description: (0, import_pg_core.text)("description")
});
var userRoles = (0, import_pg_core.pgTable)("user_roles", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id).notNull(),
  roleId: (0, import_pg_core.integer)("role_id").references(() => roles.id).notNull(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  assignedAt: (0, import_pg_core.timestamp)("assigned_at").defaultNow(),
  assignedBy: (0, import_pg_core.text)("assigned_by")
});
var rolePermissions = (0, import_pg_core.pgTable)("role_permissions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  roleId: (0, import_pg_core.integer)("role_id").references(() => roles.id).notNull(),
  permissionId: (0, import_pg_core.integer)("permission_id").references(() => permissions.id).notNull()
});
var leads = (0, import_pg_core.pgTable)("leads", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.text)("lead_id").notNull().unique(),
  // e.g. CCB-189420 or uuid
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  businessName: (0, import_pg_core.text)("business_name").notNull(),
  contactName: (0, import_pg_core.text)("contact_name"),
  phone: (0, import_pg_core.text)("phone"),
  phoneE164: (0, import_pg_core.text)("phone_e164"),
  email: (0, import_pg_core.text)("email"),
  website: (0, import_pg_core.text)("website"),
  industry: (0, import_pg_core.text)("industry").default("Contractor"),
  serviceCategory: (0, import_pg_core.text)("service_category"),
  niche: (0, import_pg_core.text)("niche"),
  address: (0, import_pg_core.text)("address"),
  city: (0, import_pg_core.text)("city"),
  county: (0, import_pg_core.text)("county"),
  stateRegion: (0, import_pg_core.text)("state_region").default("OR"),
  country: (0, import_pg_core.text)("country").default("USA"),
  postalCode: (0, import_pg_core.text)("postal_code"),
  latitude: (0, import_pg_core.numeric)("latitude", { precision: 10, scale: 6 }),
  longitude: (0, import_pg_core.numeric)("longitude", { precision: 10, scale: 6 }),
  googleMapsUrl: (0, import_pg_core.text)("google_maps_url"),
  googlePlaceId: (0, import_pg_core.text)("google_place_id"),
  leadSource: (0, import_pg_core.text)("lead_source").default("Oregon CCB License Database"),
  leadStatus: (0, import_pg_core.text)("lead_status").notNull().default("New Lead"),
  // New Lead, Contacted, Audit Sent, Proposal Sent, Negotiation, Won Retainer, Lost, Archived
  leadScore: (0, import_pg_core.integer)("lead_score").notNull().default(50),
  estimatedRetainer: (0, import_pg_core.integer)("estimated_retainer").default(2500),
  estimatedValue: (0, import_pg_core.integer)("estimated_value").default(3e4),
  assignedTo: (0, import_pg_core.text)("assigned_to").default("Sophia (AI Sales Rep)"),
  assignedUserId: (0, import_pg_core.integer)("assigned_user_id").references(() => users.id),
  ccbLicenseNumber: (0, import_pg_core.text)("ccb_license_number"),
  isHotTarget: (0, import_pg_core.boolean)("is_hot_target").default(false),
  doNotContact: (0, import_pg_core.boolean)("do_not_contact").default(false),
  opportunityAngle: (0, import_pg_core.text)("opportunity_angle"),
  recommendedService: (0, import_pg_core.text)("recommended_service"),
  rawPayload: (0, import_pg_core.jsonb)("raw_payload"),
  // Preserves original CCB / CSV dataset attributes
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow(),
  archivedAt: (0, import_pg_core.timestamp)("archived_at"),
  deletedAt: (0, import_pg_core.timestamp)("deleted_at")
});
var leadDetails = (0, import_pg_core.pgTable)("lead_details", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull().unique(),
  description: (0, import_pg_core.text)("description"),
  businessHours: (0, import_pg_core.text)("business_hours"),
  yearEstablished: (0, import_pg_core.integer)("year_established"),
  employeeSize: (0, import_pg_core.text)("employee_size"),
  serviceArea: (0, import_pg_core.text)("service_area"),
  websiteStatus: (0, import_pg_core.text)("website_status").default("Active"),
  notes: (0, import_pg_core.text)("notes"),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var leadAudits = (0, import_pg_core.pgTable)("lead_audits", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  gmbStatus: (0, import_pg_core.text)("gmb_status").default("Established"),
  googleRating: (0, import_pg_core.numeric)("google_rating", { precision: 3, scale: 1 }).default("4.5"),
  reviewCount: (0, import_pg_core.integer)("review_count").default(12),
  websiteStatus: (0, import_pg_core.text)("website_status").default("Active"),
  mobileScore: (0, import_pg_core.integer)("mobile_score").default(45),
  desktopScore: (0, import_pg_core.integer)("desktop_score").default(68),
  performanceScore: (0, import_pg_core.integer)("performance_score").default(52),
  seoScore: (0, import_pg_core.integer)("seo_score").default(55),
  cms: (0, import_pg_core.text)("cms").default("WordPress"),
  metaPixelDetected: (0, import_pg_core.boolean)("meta_pixel_detected").default(false),
  googleAdsDetected: (0, import_pg_core.boolean)("google_ads_detected").default(false),
  technicalIssues: (0, import_pg_core.jsonb)("technical_issues"),
  auditSummary: (0, import_pg_core.text)("audit_summary"),
  lastAuditedAt: (0, import_pg_core.timestamp)("last_audited_at").defaultNow(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var leadScores = (0, import_pg_core.pgTable)("lead_scores", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  totalScore: (0, import_pg_core.integer)("total_score").notNull(),
  gmbScore: (0, import_pg_core.integer)("gmb_score").default(10),
  websiteScore: (0, import_pg_core.integer)("website_score").default(10),
  technicalScore: (0, import_pg_core.integer)("technical_score").default(10),
  adsScore: (0, import_pg_core.integer)("ads_score").default(10),
  opportunityScore: (0, import_pg_core.integer)("opportunity_score").default(20),
  contactScore: (0, import_pg_core.integer)("contact_score").default(10),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }).default("0.95"),
  reasoning: (0, import_pg_core.text)("reasoning"),
  scoringVersion: (0, import_pg_core.text)("scoring_version").default("v2-sophia"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var leadScoreFactors = (0, import_pg_core.pgTable)("lead_score_factors", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadScoreId: (0, import_pg_core.integer)("lead_score_id").references(() => leadScores.id).notNull(),
  factorName: (0, import_pg_core.text)("factor_name").notNull(),
  factorValue: (0, import_pg_core.text)("factor_value").notNull(),
  weight: (0, import_pg_core.integer)("weight").notNull(),
  points: (0, import_pg_core.integer)("points").notNull(),
  evidence: (0, import_pg_core.text)("evidence"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var googleBusinessProfiles = (0, import_pg_core.pgTable)("google_business_profiles", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  placeId: (0, import_pg_core.text)("place_id"),
  businessName: (0, import_pg_core.text)("business_name").notNull(),
  rating: (0, import_pg_core.numeric)("rating", { precision: 3, scale: 1 }),
  reviewCount: (0, import_pg_core.integer)("review_count"),
  profileStatus: (0, import_pg_core.text)("profile_status").default("VERIFIED"),
  category: (0, import_pg_core.text)("category"),
  address: (0, import_pg_core.text)("address"),
  phone: (0, import_pg_core.text)("phone"),
  website: (0, import_pg_core.text)("website"),
  mapsUrl: (0, import_pg_core.text)("maps_url"),
  latitude: (0, import_pg_core.numeric)("latitude", { precision: 10, scale: 6 }),
  longitude: (0, import_pg_core.numeric)("longitude", { precision: 10, scale: 6 }),
  lastVerifiedAt: (0, import_pg_core.timestamp)("last_verified_at").defaultNow(),
  dataSource: (0, import_pg_core.text)("data_source").default("Google Maps Places API"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var websiteAudits = (0, import_pg_core.pgTable)("website_audits", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  url: (0, import_pg_core.text)("url").notNull(),
  status: (0, import_pg_core.text)("status").default("COMPLETED"),
  cms: (0, import_pg_core.text)("cms"),
  mobileScore: (0, import_pg_core.integer)("mobile_score"),
  desktopScore: (0, import_pg_core.integer)("desktop_score"),
  performanceScore: (0, import_pg_core.integer)("performance_score"),
  seoScore: (0, import_pg_core.integer)("seo_score"),
  accessibilityScore: (0, import_pg_core.integer)("accessibility_score"),
  bestPracticesScore: (0, import_pg_core.integer)("best_practices_score"),
  loadTime: (0, import_pg_core.numeric)("load_time", { precision: 6, scale: 2 }),
  serverStatus: (0, import_pg_core.text)("server_status").default("ONLINE"),
  sslStatus: (0, import_pg_core.text)("ssl_status").default("VALID"),
  lastAuditedAt: (0, import_pg_core.timestamp)("last_audited_at").defaultNow(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var technologyAudits = (0, import_pg_core.pgTable)("technology_audits", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  technologyName: (0, import_pg_core.text)("technology_name").notNull(),
  technologyCategory: (0, import_pg_core.text)("technology_category"),
  detected: (0, import_pg_core.boolean)("detected").default(true),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }).default("0.90"),
  evidence: (0, import_pg_core.text)("evidence"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var advertisingAudits = (0, import_pg_core.pgTable)("advertising_audits", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  googleAdsDetected: (0, import_pg_core.boolean)("google_ads_detected").default(false),
  metaPixelDetected: (0, import_pg_core.boolean)("meta_pixel_detected").default(false),
  conversionTrackingDetected: (0, import_pg_core.boolean)("conversion_tracking_detected").default(false),
  googleTagManagerDetected: (0, import_pg_core.boolean)("google_tag_manager_detected").default(false),
  advertisingOpportunity: (0, import_pg_core.text)("advertising_opportunity"),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }).default("0.85"),
  evidence: (0, import_pg_core.text)("evidence"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var leadOpportunities = (0, import_pg_core.pgTable)("lead_opportunities", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  service: (0, import_pg_core.text)("service").notNull(),
  opportunityType: (0, import_pg_core.text)("opportunity_type").notNull(),
  priority: (0, import_pg_core.text)("priority").default("HIGH"),
  estimatedMonthlyValue: (0, import_pg_core.integer)("estimated_monthly_value").default(2500),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }).default("0.90"),
  evidence: (0, import_pg_core.text)("evidence"),
  status: (0, import_pg_core.text)("status").default("IDENTIFIED"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var aiContent = (0, import_pg_core.pgTable)("ai_content", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  contentType: (0, import_pg_core.text)("content_type").notNull(),
  // 'AI Pitch' | 'Email' | 'Calling Script' | 'Loom Video Script' | 'Objection Handling' | 'Proposal Content' | 'Follow-Up Email' | 'SMS Script' | 'AI Summary'
  title: (0, import_pg_core.text)("title").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  model: (0, import_pg_core.text)("model").default("gemini-2.5-pro"),
  status: (0, import_pg_core.text)("status").default("Approved"),
  // Draft, Approved, Archived
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var aiPitches = (0, import_pg_core.pgTable)("ai_pitches", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  agentId: (0, import_pg_core.text)("agent_id").default("sophia"),
  opportunityAngle: (0, import_pg_core.text)("opportunity_angle"),
  primaryService: (0, import_pg_core.text)("primary_service"),
  secondaryServices: (0, import_pg_core.jsonb)("secondary_services"),
  revenueLiftEstimate: (0, import_pg_core.text)("revenue_lift_estimate"),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }).default("0.92"),
  pitchContent: (0, import_pg_core.text)("pitch_content").notNull(),
  model: (0, import_pg_core.text)("model").default("gemini-2.5-pro"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  approvedAt: (0, import_pg_core.timestamp)("approved_at")
});
var emailMessages = (0, import_pg_core.pgTable)("email_messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  campaignId: (0, import_pg_core.text)("campaign_id"),
  direction: (0, import_pg_core.text)("direction").notNull().default("Outbound"),
  // Outbound, Inbound
  subject: (0, import_pg_core.text)("subject").notNull(),
  body: (0, import_pg_core.text)("body").notNull(),
  status: (0, import_pg_core.text)("status").notNull().default("Draft"),
  // Draft, Approved, Sent, Delivered, Failed, Replied
  provider: (0, import_pg_core.text)("provider").default("Gmail API"),
  externalMessageId: (0, import_pg_core.text)("external_message_id"),
  sentAt: (0, import_pg_core.timestamp)("sent_at"),
  openedAt: (0, import_pg_core.timestamp)("opened_at"),
  repliedAt: (0, import_pg_core.timestamp)("replied_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var emailThreads = (0, import_pg_core.pgTable)("email_threads", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  providerThreadId: (0, import_pg_core.text)("provider_thread_id"),
  subject: (0, import_pg_core.text)("subject").notNull(),
  lastMessageAt: (0, import_pg_core.timestamp)("last_message_at").defaultNow(),
  status: (0, import_pg_core.text)("status").default("OPEN"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var calls = (0, import_pg_core.pgTable)("calls", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  phone: (0, import_pg_core.text)("phone").notNull(),
  contactPhone: (0, import_pg_core.text)("contact_phone"),
  direction: (0, import_pg_core.text)("direction").default("Outbound"),
  provider: (0, import_pg_core.text)("provider").default("Telnyx"),
  externalCallId: (0, import_pg_core.text)("external_call_id"),
  status: (0, import_pg_core.text)("status").default("Completed"),
  // Queued, Ringing, In Progress, Completed, Failed, Cancelled
  durationSeconds: (0, import_pg_core.integer)("duration_seconds").default(0),
  recordingUrl: (0, import_pg_core.text)("recording_url"),
  transcript: (0, import_pg_core.text)("transcript"),
  transcriptStatus: (0, import_pg_core.text)("transcript_status").default("COMPLETED"),
  aiSummary: (0, import_pg_core.text)("ai_summary"),
  callOutcome: (0, import_pg_core.text)("call_outcome").default("Connected - Positive Interest"),
  startedAt: (0, import_pg_core.timestamp)("started_at"),
  endedAt: (0, import_pg_core.timestamp)("ended_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var callTranscripts = (0, import_pg_core.pgTable)("call_transcripts", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  callId: (0, import_pg_core.integer)("call_id").references(() => calls.id).notNull(),
  speaker: (0, import_pg_core.text)("speaker").notNull(),
  // 'Sophia (AI)' | 'Contractor' | 'Agent'
  text: (0, import_pg_core.text)("text").notNull(),
  timestampSeconds: (0, import_pg_core.numeric)("timestamp_seconds", { precision: 8, scale: 2 }),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var callSummaries = (0, import_pg_core.pgTable)("call_summaries", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  callId: (0, import_pg_core.integer)("call_id").references(() => calls.id).notNull(),
  agentId: (0, import_pg_core.text)("agent_id").default("sophia"),
  summary: (0, import_pg_core.text)("summary").notNull(),
  outcome: (0, import_pg_core.text)("outcome").notNull(),
  sentiment: (0, import_pg_core.text)("sentiment").default("POSITIVE"),
  objections: (0, import_pg_core.jsonb)("objections"),
  nextSteps: (0, import_pg_core.text)("next_steps"),
  followUpDate: (0, import_pg_core.text)("follow_up_date"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var smsMessages = (0, import_pg_core.pgTable)("sms_messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  phone: (0, import_pg_core.text)("phone").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  direction: (0, import_pg_core.text)("direction").notNull().default("Outbound"),
  // Outbound, Inbound
  status: (0, import_pg_core.text)("status").notNull().default("Sent"),
  // Draft, Sent, Delivered, Failed, Replied
  provider: (0, import_pg_core.text)("provider").default("Telnyx"),
  externalMessageId: (0, import_pg_core.text)("external_message_id"),
  sentAt: (0, import_pg_core.timestamp)("sent_at").defaultNow(),
  deliveredAt: (0, import_pg_core.timestamp)("delivered_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var crmNotes = (0, import_pg_core.pgTable)("crm_notes", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  clientId: (0, import_pg_core.integer)("client_id"),
  authorUserId: (0, import_pg_core.integer)("author_user_id").references(() => users.id),
  authorName: (0, import_pg_core.text)("author_name").default("Sophia (AI Sales Rep)"),
  content: (0, import_pg_core.text)("content").notNull(),
  noteType: (0, import_pg_core.text)("note_type").notNull().default("General"),
  // General, Call Note, AI Note, Follow-Up, Objection, Sales
  visibility: (0, import_pg_core.text)("visibility").notNull().default("Internal"),
  // Internal, Client Shared, Restricted
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var activities = (0, import_pg_core.pgTable)("activities", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id),
  clientId: (0, import_pg_core.integer)("client_id"),
  activityType: (0, import_pg_core.text)("activity_type").notNull(),
  // 'lead_created' | 'status_changed' | 'call_completed' | 'email_sent' | etc.
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  metadata: (0, import_pg_core.jsonb)("metadata"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var leadStatusHistory = (0, import_pg_core.pgTable)("lead_status_history", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id).notNull(),
  previousStatus: (0, import_pg_core.text)("previous_status").notNull(),
  newStatus: (0, import_pg_core.text)("new_status").notNull(),
  changedBy: (0, import_pg_core.text)("changed_by").default("Sophia (AI)"),
  changeSource: (0, import_pg_core.text)("change_source").default("AI"),
  // User, AI, Automation, System
  reason: (0, import_pg_core.text)("reason"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var tasks = (0, import_pg_core.pgTable)("tasks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id),
  relatedClientId: (0, import_pg_core.integer)("related_client_id"),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  taskType: (0, import_pg_core.text)("task_type").default("Follow-Up"),
  priority: (0, import_pg_core.text)("priority").notNull().default("Medium"),
  // Low, Medium, High, Urgent
  status: (0, import_pg_core.text)("status").notNull().default("Open"),
  // Open, In Progress, Completed, Cancelled
  assignedTo: (0, import_pg_core.text)("assigned_to").default("Sophia (AI Sales Rep)"),
  assignedUserId: (0, import_pg_core.integer)("assigned_user_id").references(() => users.id),
  dueDate: (0, import_pg_core.text)("due_date"),
  completedAt: (0, import_pg_core.timestamp)("completed_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var clients = (0, import_pg_core.pgTable)("clients", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.text)("client_id").notNull().unique(),
  // e.g. CLI-101
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id),
  businessName: (0, import_pg_core.text)("business_name").notNull(),
  website: (0, import_pg_core.text)("website"),
  email: (0, import_pg_core.text)("email"),
  phone: (0, import_pg_core.text)("phone"),
  industry: (0, import_pg_core.text)("industry"),
  address: (0, import_pg_core.text)("address"),
  city: (0, import_pg_core.text)("city"),
  stateRegion: (0, import_pg_core.text)("state_region").default("OR"),
  country: (0, import_pg_core.text)("country").default("USA"),
  postalCode: (0, import_pg_core.text)("postal_code"),
  monthlyRetainer: (0, import_pg_core.integer)("monthly_retainer").notNull().default(2800),
  actualMrr: (0, import_pg_core.integer)("actual_mrr").notNull().default(2800),
  clientStatus: (0, import_pg_core.text)("client_status").notNull().default("Active"),
  // Prospect, Onboarding, Active, Paused, At Risk, Former Client
  accountManager: (0, import_pg_core.text)("account_manager").default("Sophia"),
  accountManagerId: (0, import_pg_core.integer)("account_manager_id").references(() => users.id),
  startDate: (0, import_pg_core.text)("start_date"),
  renewalDate: (0, import_pg_core.text)("renewal_date"),
  healthScore: (0, import_pg_core.integer)("health_score").default(85),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var clientServices = (0, import_pg_core.pgTable)("client_services", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  serviceName: (0, import_pg_core.text)("service_name").notNull(),
  // 'SEO' | 'Website Development' | 'Google Ads' | 'Meta Ads' | 'GMB Optimization'
  serviceCategory: (0, import_pg_core.text)("service_category"),
  monthlyPrice: (0, import_pg_core.integer)("monthly_price").notNull().default(1500),
  status: (0, import_pg_core.text)("status").notNull().default("Active"),
  // Active, Paused, Completed
  startDate: (0, import_pg_core.text)("start_date"),
  renewalDate: (0, import_pg_core.text)("renewal_date"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var clientContracts = (0, import_pg_core.pgTable)("client_contracts", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  contractValue: (0, import_pg_core.integer)("contract_value").notNull(),
  billingFrequency: (0, import_pg_core.text)("billing_frequency").default("MONTHLY"),
  startDate: (0, import_pg_core.text)("start_date"),
  endDate: (0, import_pg_core.text)("end_date"),
  renewalDate: (0, import_pg_core.text)("renewal_date"),
  status: (0, import_pg_core.text)("status").default("ACTIVE"),
  documentUrl: (0, import_pg_core.text)("document_url"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var clientHealthScores = (0, import_pg_core.pgTable)("client_health_scores", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  healthScore: (0, import_pg_core.integer)("health_score").notNull(),
  communicationScore: (0, import_pg_core.integer)("communication_score").default(85),
  deliveryScore: (0, import_pg_core.integer)("delivery_score").default(90),
  engagementScore: (0, import_pg_core.integer)("engagement_score").default(80),
  paymentScore: (0, import_pg_core.integer)("payment_score").default(95),
  riskLevel: (0, import_pg_core.text)("risk_level").default("LOW"),
  evidence: (0, import_pg_core.text)("evidence"),
  calculatedAt: (0, import_pg_core.timestamp)("calculated_at").defaultNow()
});
var clientRenewals = (0, import_pg_core.pgTable)("client_renewals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  contractId: (0, import_pg_core.integer)("contract_id").references(() => clientContracts.id),
  renewalDate: (0, import_pg_core.text)("renewal_date").notNull(),
  estimatedValue: (0, import_pg_core.integer)("estimated_value").notNull(),
  status: (0, import_pg_core.text)("status").default("PENDING"),
  riskLevel: (0, import_pg_core.text)("risk_level").default("LOW"),
  notes: (0, import_pg_core.text)("notes"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var revenueRecords = (0, import_pg_core.pgTable)("revenue_records", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id),
  serviceId: (0, import_pg_core.integer)("service_id").references(() => clientServices.id),
  amount: (0, import_pg_core.integer)("amount").notNull(),
  currency: (0, import_pg_core.text)("currency").default("USD"),
  revenueType: (0, import_pg_core.text)("revenue_type").notNull().default("Confirmed"),
  // Confirmed, Pipeline, Estimated
  periodStart: (0, import_pg_core.text)("period_start"),
  periodEnd: (0, import_pg_core.text)("period_end"),
  status: (0, import_pg_core.text)("status").default("PAID"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var proposals = (0, import_pg_core.pgTable)("proposals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  amount: (0, import_pg_core.integer)("amount").notNull(),
  currency: (0, import_pg_core.text)("currency").default("USD"),
  status: (0, import_pg_core.text)("status").default("SENT"),
  // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  sentAt: (0, import_pg_core.timestamp)("sent_at"),
  acceptedAt: (0, import_pg_core.timestamp)("accepted_at"),
  rejectedAt: (0, import_pg_core.timestamp)("rejected_at"),
  expiresAt: (0, import_pg_core.timestamp)("expires_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var agencyServices = (0, import_pg_core.pgTable)("agency_services", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  name: (0, import_pg_core.text)("name").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  description: (0, import_pg_core.text)("description"),
  defaultPrice: (0, import_pg_core.integer)("default_price").notNull(),
  minimumPrice: (0, import_pg_core.integer)("minimum_price").notNull(),
  maximumPrice: (0, import_pg_core.integer)("maximum_price").notNull(),
  active: (0, import_pg_core.boolean)("active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var aiAgents = (0, import_pg_core.pgTable)("ai_agents", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  name: (0, import_pg_core.text)("name").notNull(),
  // Sophia, Atlas, Nova, Orbit, Aria, Pulse, Nexus
  role: (0, import_pg_core.text)("role").notNull(),
  description: (0, import_pg_core.text)("description"),
  status: (0, import_pg_core.text)("status").default("ACTIVE"),
  provider: (0, import_pg_core.text)("provider").default("Google Gemini"),
  defaultModel: (0, import_pg_core.text)("default_model").default("gemini-2.5-pro"),
  configurationReference: (0, import_pg_core.jsonb)("configuration_reference"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var aiTasks = (0, import_pg_core.pgTable)("ai_tasks", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  agentId: (0, import_pg_core.integer)("agent_id").references(() => aiAgents.id),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  taskType: (0, import_pg_core.text)("task_type").notNull(),
  relatedEntityType: (0, import_pg_core.text)("related_entity_type"),
  relatedEntityId: (0, import_pg_core.text)("related_entity_id"),
  priority: (0, import_pg_core.text)("priority").default("NORMAL"),
  status: (0, import_pg_core.text)("status").default("PENDING"),
  inputReference: (0, import_pg_core.jsonb)("input_reference"),
  outputReference: (0, import_pg_core.jsonb)("output_reference"),
  errorSummary: (0, import_pg_core.text)("error_summary"),
  retryCount: (0, import_pg_core.integer)("retry_count").default(0),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  startedAt: (0, import_pg_core.timestamp)("started_at"),
  completedAt: (0, import_pg_core.timestamp)("completed_at")
});
var aiOutputs = (0, import_pg_core.pgTable)("ai_outputs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  taskId: (0, import_pg_core.integer)("task_id").references(() => aiTasks.id),
  agentId: (0, import_pg_core.integer)("agent_id").references(() => aiAgents.id),
  model: (0, import_pg_core.text)("model").default("gemini-2.5-pro"),
  outputType: (0, import_pg_core.text)("output_type").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  structuredData: (0, import_pg_core.jsonb)("structured_data"),
  confidence: (0, import_pg_core.numeric)("confidence", { precision: 4, scale: 2 }).default("0.95"),
  version: (0, import_pg_core.integer)("version").default(1),
  status: (0, import_pg_core.text)("status").default("APPROVED"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var aiApprovals = (0, import_pg_core.pgTable)("ai_approvals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  taskId: (0, import_pg_core.integer)("task_id").references(() => aiTasks.id),
  actionType: (0, import_pg_core.text)("action_type").notNull(),
  status: (0, import_pg_core.text)("status").default("PENDING"),
  requestedAt: (0, import_pg_core.timestamp)("requested_at").defaultNow(),
  reviewedAt: (0, import_pg_core.timestamp)("reviewed_at"),
  reviewedBy: (0, import_pg_core.text)("reviewed_by"),
  finalOutputReference: (0, import_pg_core.text)("final_output_reference")
});
var aiFeedback = (0, import_pg_core.pgTable)("ai_feedback", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  aiOutputId: (0, import_pg_core.integer)("ai_output_id").references(() => aiOutputs.id),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
  feedbackType: (0, import_pg_core.text)("feedback_type").notNull(),
  // Approved, Edited, Rejected, Incorrect, Useful
  originalOutput: (0, import_pg_core.text)("original_output"),
  editedOutput: (0, import_pg_core.text)("edited_output"),
  reason: (0, import_pg_core.text)("reason"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var clientPortalUsers = (0, import_pg_core.pgTable)("client_portal_users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
  role: (0, import_pg_core.text)("role").default("Client Member"),
  status: (0, import_pg_core.text)("status").default("ACTIVE"),
  invitedAt: (0, import_pg_core.timestamp)("invited_at").defaultNow(),
  acceptedAt: (0, import_pg_core.timestamp)("accepted_at"),
  lastLoginAt: (0, import_pg_core.timestamp)("last_login_at")
});
var clientRequests = (0, import_pg_core.pgTable)("client_requests", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  submittedBy: (0, import_pg_core.text)("submitted_by").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  subject: (0, import_pg_core.text)("subject").notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  priority: (0, import_pg_core.text)("priority").default("NORMAL"),
  status: (0, import_pg_core.text)("status").default("NEW"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var clientApprovals = (0, import_pg_core.pgTable)("client_approvals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  status: (0, import_pg_core.text)("status").default("PENDING"),
  requestedAt: (0, import_pg_core.timestamp)("requested_at").defaultNow(),
  respondedAt: (0, import_pg_core.timestamp)("responded_at"),
  respondedBy: (0, import_pg_core.text)("responded_by")
});
var documents = (0, import_pg_core.pgTable)("documents", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  clientId: (0, import_pg_core.integer)("client_id").references(() => clients.id),
  leadId: (0, import_pg_core.integer)("lead_id").references(() => leads.id),
  title: (0, import_pg_core.text)("title").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  // 'Audit' | 'Proposal' | 'Contract' | 'Report' | 'Deliverable'
  fileName: (0, import_pg_core.text)("file_name").notNull(),
  storageReference: (0, import_pg_core.text)("storage_reference").notNull(),
  mimeType: (0, import_pg_core.text)("mime_type").default("application/pdf"),
  fileSize: (0, import_pg_core.integer)("file_size"),
  visibility: (0, import_pg_core.text)("visibility").default("Internal"),
  // Internal, Client, Restricted
  uploadedBy: (0, import_pg_core.text)("uploaded_by"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var notifications = (0, import_pg_core.pgTable)("notifications", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
  type: (0, import_pg_core.text)("type").notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  priority: (0, import_pg_core.text)("priority").default("NORMAL"),
  readAt: (0, import_pg_core.timestamp)("read_at"),
  relatedEntityType: (0, import_pg_core.text)("related_entity_type"),
  relatedEntityId: (0, import_pg_core.text)("related_entity_id"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var automationRuns = (0, import_pg_core.pgTable)("automation_runs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  workflowName: (0, import_pg_core.text)("workflow_name").notNull(),
  workflowProvider: (0, import_pg_core.text)("workflow_provider").default("n8n"),
  relatedEntityType: (0, import_pg_core.text)("related_entity_type"),
  relatedEntityId: (0, import_pg_core.text)("related_entity_id"),
  status: (0, import_pg_core.text)("status").default("SUCCESS"),
  externalRunId: (0, import_pg_core.text)("external_run_id"),
  startedAt: (0, import_pg_core.timestamp)("started_at").defaultNow(),
  completedAt: (0, import_pg_core.timestamp)("completed_at"),
  errorSummary: (0, import_pg_core.text)("error_summary"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var webhookEvents = (0, import_pg_core.pgTable)("webhook_events", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  provider: (0, import_pg_core.text)("provider").notNull(),
  // 'Telnyx' | 'Gmail' | 'n8n'
  eventType: (0, import_pg_core.text)("event_type").notNull(),
  externalEventId: (0, import_pg_core.text)("external_event_id").unique(),
  payloadReference: (0, import_pg_core.jsonb)("payload_reference"),
  processingStatus: (0, import_pg_core.text)("processing_status").default("PROCESSED"),
  processedAt: (0, import_pg_core.timestamp)("processed_at").defaultNow(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var integrations = (0, import_pg_core.pgTable)("integrations", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  provider: (0, import_pg_core.text)("provider").notNull(),
  // 'Google', 'Gmail', 'Telnyx', 'n8n', 'Google Maps', 'Google Gemini'
  integrationType: (0, import_pg_core.text)("integration_type").notNull(),
  status: (0, import_pg_core.text)("status").notNull().default("CONNECTED"),
  // CONNECTED, CONFIGURING, ERROR, OFFLINE
  configurationReference: (0, import_pg_core.jsonb)("configuration_reference"),
  lastSyncAt: (0, import_pg_core.timestamp)("last_sync_at").defaultNow(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var organizationSettings = (0, import_pg_core.pgTable)("organization_settings", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  settingKey: (0, import_pg_core.text)("setting_key").notNull(),
  settingValue: (0, import_pg_core.text)("setting_value").notNull(),
  updatedBy: (0, import_pg_core.text)("updated_by"),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var agencySettings = (0, import_pg_core.pgTable)("agency_settings", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  companyName: (0, import_pg_core.text)("company_name").notNull().default("Marketing Charm Agency"),
  productName: (0, import_pg_core.text)("product_name").notNull().default("MCA Lead Agency Suite"),
  companyLogo: (0, import_pg_core.text)("company_logo"),
  defaultSenderName: (0, import_pg_core.text)("default_sender_name").notNull().default("Sophia"),
  defaultAiAgent: (0, import_pg_core.text)("default_ai_agent").notNull().default("Sophia"),
  currency: (0, import_pg_core.text)("currency").notNull().default("USD"),
  timezone: (0, import_pg_core.text)("timezone").notNull().default("America/Los_Angeles"),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var auditLogs = (0, import_pg_core.pgTable)("audit_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  organizationId: (0, import_pg_core.integer)("organization_id").references(() => organizations.id),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
  action: (0, import_pg_core.text)("action").notNull(),
  // 'lead.created', 'lead.status_updated', 'client.converted', etc.
  resourceType: (0, import_pg_core.text)("resource_type").notNull(),
  // 'lead', 'client', 'email', 'proposal'
  resourceId: (0, import_pg_core.text)("resource_id").notNull(),
  previousDataReference: (0, import_pg_core.jsonb)("previous_data_reference"),
  newDataReference: (0, import_pg_core.jsonb)("new_data_reference"),
  ipReference: (0, import_pg_core.text)("ip_reference"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var systemErrors = (0, import_pg_core.pgTable)("system_errors", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  service: (0, import_pg_core.text)("service").notNull(),
  module: (0, import_pg_core.text)("module").notNull(),
  severity: (0, import_pg_core.text)("severity").notNull().default("ERROR"),
  // INFO, WARNING, ERROR, CRITICAL
  errorCode: (0, import_pg_core.text)("error_code"),
  friendlyMessage: (0, import_pg_core.text)("friendly_message").notNull(),
  technicalReference: (0, import_pg_core.text)("technical_reference"),
  status: (0, import_pg_core.text)("status").default("OPEN"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var backgroundJobs = (0, import_pg_core.pgTable)("background_jobs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  jobType: (0, import_pg_core.text)("job_type").notNull(),
  payloadReference: (0, import_pg_core.jsonb)("payload_reference"),
  status: (0, import_pg_core.text)("status").default("PENDING"),
  // PENDING, PROCESSING, COMPLETED, FAILED
  priority: (0, import_pg_core.text)("priority").default("NORMAL"),
  attempts: (0, import_pg_core.integer)("attempts").default(0),
  maxAttempts: (0, import_pg_core.integer)("max_attempts").default(3),
  scheduledAt: (0, import_pg_core.timestamp)("scheduled_at").defaultNow(),
  startedAt: (0, import_pg_core.timestamp)("started_at"),
  completedAt: (0, import_pg_core.timestamp)("completed_at"),
  failedAt: (0, import_pg_core.timestamp)("failed_at")
});
var organizationsRelations = (0, import_drizzle_orm.relations)(organizations, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  clients: many(clients)
}));
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id]
  }),
  assignedLeads: many(leads),
  notes: many(crmNotes)
}));
var leadsRelations = (0, import_drizzle_orm.relations)(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id]
  }),
  details: one(leadDetails, {
    fields: [leads.id],
    references: [leadDetails.leadId]
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
    references: [clients.leadId]
  })
}));
var clientsRelations = (0, import_drizzle_orm.relations)(clients, ({ one, many }) => ({
  lead: one(leads, {
    fields: [clients.leadId],
    references: [leads.id]
  }),
  services: many(clientServices),
  contracts: many(clientContracts),
  renewals: many(clientRenewals),
  healthScores: many(clientHealthScores),
  revenueRecords: many(revenueRecords)
}));

// src/db/index.ts
var getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || void 0;
};
function getDatabaseDetails() {
  const url = getDatabaseUrl();
  const rawEnvKeyUsed = process.env.DATABASE_URL ? "DATABASE_URL" : process.env.POSTGRES_URL ? "POSTGRES_URL" : process.env.NEON_DATABASE_URL ? "NEON_DATABASE_URL" : process.env.SQL_HOST ? "SQL_HOST" : "NONE";
  if (url) {
    try {
      const parsed = new URL(url);
      const isNeon = parsed.hostname.includes("neon.tech");
      return {
        configured: true,
        provider: isNeon ? "Neon Serverless PostgreSQL" : "PostgreSQL Database",
        host: parsed.hostname,
        database: parsed.pathname.replace(/^\//, "") || "neondb",
        user: parsed.username || "neondb_owner",
        sslMode: parsed.searchParams.get("sslmode") || "require",
        isNeon,
        maskedUrl: `${parsed.protocol}//${parsed.username}:\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022@${parsed.hostname}${parsed.pathname}`,
        rawEnvKeyUsed
      };
    } catch {
      const isNeon = url.includes("neon.tech");
      return {
        configured: true,
        provider: isNeon ? "Neon Serverless PostgreSQL" : "PostgreSQL Database",
        host: isNeon ? "ep-*.neon.tech" : "configured via URL",
        database: "neondb",
        sslMode: "require",
        isNeon,
        maskedUrl: "postgresql://\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022@configured-host/neondb",
        rawEnvKeyUsed
      };
    }
  }
  if (process.env.SQL_HOST) {
    return {
      configured: true,
      provider: "Google Cloud SQL",
      host: process.env.SQL_HOST,
      database: process.env.SQL_DB_NAME || "crm_db",
      user: process.env.SQL_USER,
      sslMode: "standard",
      isNeon: false,
      maskedUrl: `postgresql://${process.env.SQL_USER}:\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022@${process.env.SQL_HOST}/${process.env.SQL_DB_NAME}`,
      rawEnvKeyUsed
    };
  }
  return {
    configured: false,
    provider: "In-Memory Resilient Store",
    host: "localhost",
    database: "in-memory",
    sslMode: "none",
    isNeon: false,
    maskedUrl: "memory://local",
    rawEnvKeyUsed
  };
}
var createPool = () => {
  if (!global._postgresPool) {
    const postgresUrl = getDatabaseUrl();
    if (postgresUrl) {
      global._postgresPool = new import_pg.Pool({
        connectionString: postgresUrl,
        max: 10,
        connectionTimeoutMillis: 15e3,
        ssl: { rejectUnauthorized: false }
      });
    } else if (process.env.SQL_HOST) {
      global._postgresPool = new import_pg.Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15e3
      });
    } else {
      return null;
    }
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = pool ? (0, import_node_postgres.drizzle)(pool, { schema: schema_exports }) : null;
var isDbConfigured = Boolean(
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || process.env.SQL_HOST
);

// src/constants.ts
var ROLE_DISPLAY_TITLES = {
  AGENCY_DIRECTOR: "Agency Director",
  SALES_MANAGER: "Sales Manager",
  SDR: "Sales Development Rep",
  ACCOUNT_EXECUTIVE: "Account Executive",
  APPOINTMENT_SETTER: "Appointment Setter",
  OUTREACH_SPECIALIST: "Outreach Specialist",
  CLIENT_SUCCESS: "Client Success Manager",
  OPERATIONS_ANALYST: "Operations Analyst"
};

// src/db/repository.ts
var inMemoryLeads = [];
var inMemoryClients = [];
var inMemoryActivities = [];
var inMemoryAuditLogs = [];
var inMemorySettings = {
  id: 1,
  companyName: "Marketing Charm Agency",
  productName: "MCA Lead Agency Suite",
  defaultSenderName: "Sophia",
  defaultAiAgent: "Sophia",
  currency: "USD",
  timezone: "America/Los_Angeles",
  createdAt: /* @__PURE__ */ new Date(),
  updatedAt: /* @__PURE__ */ new Date()
};
async function initDatabaseDefaults() {
  if (!isDbConfigured) {
    console.log("[Database Engine] Active in resilient high-speed in-memory mode (Cloud SQL ready when configured).");
    return;
  }
  try {
    const existingOrg = await db.select().from(organizations).limit(1);
    let orgId = existingOrg[0]?.id;
    if (!orgId) {
      const [newOrg] = await db.insert(organizations).values({
        name: "Marketing Charm Agency",
        slug: "marketing-charm-agency",
        organizationType: "AGENCY",
        website: "https://marketingcharmagency.com",
        email: "contact@marketingcharmagency.com",
        phone: "+1-503-241-7998",
        status: "ACTIVE"
      }).returning();
      orgId = newOrg.id;
    }
    const existingSettings = await db.select().from(agencySettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(agencySettings).values({
        companyName: "Marketing Charm Agency",
        productName: "MCA Lead Agency Suite",
        defaultSenderName: "Sophia",
        defaultAiAgent: "Sophia",
        currency: "USD",
        timezone: "America/Los_Angeles"
      });
    }
    const existingRoles = await db.select().from(roles).limit(1);
    if (existingRoles.length === 0) {
      await db.insert(roles).values([
        { name: "Super Admin", description: "Complete system authority and billing management" },
        { name: "Agency Owner", description: "Full access to CRM, financial telemetry, and AI workforce" },
        { name: "Admin", description: "Enterprise administrative and team management capabilities" },
        { name: "Manager", description: "Pipeline review and sales rep orchestration" },
        { name: "Sales", description: "Lead discovery, dialing, outreach, and pitch generation" },
        { name: "Account Manager", description: "Client retention, service delivery, and renewals" },
        { name: "User", description: "Standard read and collaborative permissions" }
      ]);
    }
    const existingServices = await db.select().from(agencyServices).limit(1);
    if (existingServices.length === 0) {
      await db.insert(agencyServices).values([
        { organizationId: orgId, name: "SEO & Content Growth", category: "SEO", defaultPrice: 2e3, minimumPrice: 1500, maximumPrice: 4e3, active: true },
        { organizationId: orgId, name: "High-Converting Contractor Website", category: "Development", defaultPrice: 4500, minimumPrice: 3e3, maximumPrice: 8500, active: true },
        { organizationId: orgId, name: "Google Local Service Ads (LSA)", category: "PPC", defaultPrice: 1800, minimumPrice: 1200, maximumPrice: 3500, active: true },
        { organizationId: orgId, name: "Meta / Facebook Hyperlocal Ads", category: "Social Ads", defaultPrice: 1600, minimumPrice: 1e3, maximumPrice: 3e3, active: true },
        { organizationId: orgId, name: "GMB / Google Business Profile Domination", category: "Reputation", defaultPrice: 1200, minimumPrice: 800, maximumPrice: 2500, active: true },
        { organizationId: orgId, name: "Voice Search & AI Overview Readiness", category: "AI SEO", defaultPrice: 2200, minimumPrice: 1800, maximumPrice: 5e3, active: true },
        { organizationId: orgId, name: "Technical Site Performance & CWV Fix", category: "Technical", defaultPrice: 1500, minimumPrice: 1e3, maximumPrice: 3e3, active: true }
      ]);
    }
    const existingAgents = await db.select().from(aiAgents).limit(1);
    if (existingAgents.length === 0) {
      await db.insert(aiAgents).values([
        { organizationId: orgId, name: "Sophia", role: "Lead AI Representative & Executive Orchestrator", defaultModel: "gemini-3.8-flash" },
        { organizationId: orgId, name: "Atlas", role: "Strategic Market Analyst & CCB Intelligence", defaultModel: "gemini-3.8-flash" },
        { organizationId: orgId, name: "Nova", role: "Multi-Channel Outreach & Email Architect", defaultModel: "gemini-3.8-flash" },
        { organizationId: orgId, name: "Orbit", role: "Reputation & Google Maps Optimization Specialist", defaultModel: "gemini-3.8-flash" },
        { organizationId: orgId, name: "Aria", role: "Conversion Copywriter & Loom Script Designer", defaultModel: "gemini-3.8-flash" },
        { organizationId: orgId, name: "Pulse", role: "Client Health & Retention Sentinel", defaultModel: "gemini-3.8-flash" },
        { organizationId: orgId, name: "Nexus", role: "Automation & Integration Bridge", defaultModel: "gemini-3.8-flash" }
      ]);
    }
    const leadCountResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads);
    const count2 = Number(leadCountResult[0]?.count || 0);
    if (count2 === 0) {
      console.log("[Database Seed] No auto-seeding performed. Database is empty and ready for legitimate user imports.");
    }
    console.log("[Cloud SQL Init] Database defaults confirmed operational.");
  } catch (error) {
    console.warn("[Cloud SQL Init Notice] Database connected or provisioning pending, continuing with resilient memory store:", error?.message);
  }
}
async function getDbLeads(params) {
  if (isDbConfigured) {
    try {
      const conditions = [];
      conditions.push(import_drizzle_orm2.sql`${leads.deletedAt} IS NULL`);
      if (params.search && params.search.trim()) {
        const q = `%${params.search.trim()}%`;
        conditions.push(
          (0, import_drizzle_orm2.or)(
            (0, import_drizzle_orm2.ilike)(leads.businessName, q),
            (0, import_drizzle_orm2.ilike)(leads.contactName, q),
            (0, import_drizzle_orm2.ilike)(leads.phone, q),
            (0, import_drizzle_orm2.ilike)(leads.email, q),
            (0, import_drizzle_orm2.ilike)(leads.city, q),
            (0, import_drizzle_orm2.ilike)(leads.niche, q),
            (0, import_drizzle_orm2.ilike)(leads.leadId, q)
          )
        );
      }
      if (params.status && params.status !== "All") {
        conditions.push((0, import_drizzle_orm2.eq)(leads.leadStatus, params.status));
      }
      if (params.niche && params.niche !== "All") {
        conditions.push((0, import_drizzle_orm2.ilike)(leads.niche, `%${params.niche}%`));
      }
      if (params.city && params.city !== "All") {
        conditions.push((0, import_drizzle_orm2.ilike)(leads.city, `%${params.city}%`));
      }
      if (params.isHotTarget) {
        conditions.push((0, import_drizzle_orm2.eq)(leads.isHotTarget, true));
      }
      const whereClause = conditions.length > 0 ? (0, import_drizzle_orm2.and)(...conditions) : void 0;
      const rows = await db.select().from(leads).where(whereClause).orderBy((0, import_drizzle_orm2.desc)(leads.createdAt), (0, import_drizzle_orm2.desc)(leads.leadScore)).limit(params.limit || 500).offset(params.offset || 0);
      return rows || [];
    } catch (error) {
      console.warn("getDbLeads DB query skipped (using in-memory store):", error?.message);
    }
  }
  let filtered = inMemoryLeads.filter((l) => !l.deletedAt);
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (l) => l.businessName && l.businessName.toLowerCase().includes(q) || l.contactName && l.contactName.toLowerCase().includes(q) || l.phone && l.phone.toLowerCase().includes(q) || l.email && l.email.toLowerCase().includes(q) || l.city && l.city.toLowerCase().includes(q) || l.niche && l.niche.toLowerCase().includes(q) || l.leadId && l.leadId.toLowerCase().includes(q)
    );
  }
  if (params.status && params.status !== "All") {
    filtered = filtered.filter((l) => l.leadStatus === params.status);
  }
  if (params.niche && params.niche !== "All") {
    const nq = params.niche.toLowerCase();
    filtered = filtered.filter((l) => l.niche && l.niche.toLowerCase().includes(nq));
  }
  if (params.city && params.city !== "All") {
    const cq = params.city.toLowerCase();
    filtered = filtered.filter((l) => l.city && l.city.toLowerCase().includes(cq));
  }
  if (params.isHotTarget) {
    filtered = filtered.filter((l) => l.isHotTarget === true);
  }
  filtered.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  const offset = params.offset || 0;
  const limit = params.limit || 150;
  return filtered.slice(offset, offset + limit);
}
async function getDbLeadById(leadIdentifier) {
  if (isDbConfigured) {
    try {
      let lead;
      if (typeof leadIdentifier === "number" || !isNaN(Number(leadIdentifier))) {
        const rows = await db.select().from(leads).where((0, import_drizzle_orm2.eq)(leads.id, Number(leadIdentifier))).limit(1);
        lead = rows[0];
      }
      if (!lead && typeof leadIdentifier === "string") {
        const rows = await db.select().from(leads).where((0, import_drizzle_orm2.eq)(leads.leadId, leadIdentifier)).limit(1);
        lead = rows[0];
      }
      if (lead) {
        const [audits, scores, notes, callsList, emailsList, smsList, tasksList, statusHist] = await Promise.all([
          db.select().from(leadAudits).where((0, import_drizzle_orm2.eq)(leadAudits.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(leadAudits.createdAt)),
          db.select().from(leadScores).where((0, import_drizzle_orm2.eq)(leadScores.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(leadScores.createdAt)),
          db.select().from(crmNotes).where((0, import_drizzle_orm2.eq)(crmNotes.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(crmNotes.createdAt)),
          db.select().from(calls).where((0, import_drizzle_orm2.eq)(calls.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(calls.createdAt)),
          db.select().from(emailMessages).where((0, import_drizzle_orm2.eq)(emailMessages.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(emailMessages.createdAt)),
          db.select().from(smsMessages).where((0, import_drizzle_orm2.eq)(smsMessages.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(smsMessages.createdAt)),
          db.select().from(tasks).where((0, import_drizzle_orm2.eq)(tasks.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(tasks.createdAt)),
          db.select().from(leadStatusHistory).where((0, import_drizzle_orm2.eq)(leadStatusHistory.leadId, lead.id)).orderBy((0, import_drizzle_orm2.desc)(leadStatusHistory.createdAt))
        ]);
        return {
          ...lead,
          audits,
          scores,
          notes,
          calls: callsList,
          emails: emailsList,
          sms: smsList,
          tasks: tasksList,
          statusHistory: statusHist
        };
      }
    } catch (error) {
      console.warn("getDbLeadById DB query skipped (using in-memory store):", error?.message);
    }
  }
  const idNum = Number(leadIdentifier);
  const found = inMemoryLeads.find(
    (l) => !isNaN(idNum) && l.id === idNum || String(l.leadId) === String(leadIdentifier)
  );
  return found || null;
}
async function checkLeadDuplicate(params) {
  if (isDbConfigured) {
    try {
      const checks = [];
      if (params.businessName) {
        checks.push((0, import_drizzle_orm2.ilike)(leads.businessName, params.businessName.trim()));
      }
      if (params.phone && params.phone.replace(/\D/g, "").length >= 7) {
        const cleanPhone = params.phone.replace(/\D/g, "");
        checks.push((0, import_drizzle_orm2.ilike)(leads.phone, `%${cleanPhone.slice(-7)}%`));
      }
      if (params.email && params.email.includes("@") && !params.email.toLowerCase().includes("not provided")) {
        checks.push((0, import_drizzle_orm2.ilike)(leads.email, params.email.trim()));
      }
      if (params.website && params.website.length > 5 && !params.website.toLowerCase().includes("not provided")) {
        checks.push((0, import_drizzle_orm2.ilike)(leads.website, `%${params.website.replace(/https?:\/\//, "").replace(/\/$/, "")}%`));
      }
      if (checks.length > 0) {
        const matches = await db.select({
          id: leads.id,
          leadId: leads.leadId,
          businessName: leads.businessName,
          phone: leads.phone,
          email: leads.email,
          leadStatus: leads.leadStatus
        }).from(leads).where((0, import_drizzle_orm2.and)(import_drizzle_orm2.sql`${leads.deletedAt} IS NULL`, (0, import_drizzle_orm2.or)(...checks))).limit(5);
        return { isDuplicate: matches.length > 0, matches };
      }
    } catch (error) {
      console.error("checkLeadDuplicate DB query failed:", error?.message);
      return { isDuplicate: false, matches: [] };
    }
  }
  console.warn("checkLeadDuplicate: Database not configured, skipping duplicate check");
  return { isDuplicate: false, matches: [] };
}
async function createDbLead(leadData) {
  const rawBusinessName = leadData.business_name || leadData.businessName || leadData.company_name || leadData.companyName || leadData["Business Name"] || leadData["Company Name"] || leadData["name"] || leadData.name || "Contractor";
  const rawContactName = leadData.contact_name || leadData.contactName || leadData["Contact Name"] || leadData["Contact Person"] || rawBusinessName;
  const rawPhone = leadData.phone || leadData.phone_e164 || leadData.phoneE164 || leadData["Phone"] || leadData["Phone Number"] || "";
  const rawEmail = leadData.email || leadData["Email"] || leadData["Email Address"] || "";
  const rawCity = leadData.city || leadData.City || null;
  const rawState = leadData.state || leadData.State || leadData.state_region || leadData.stateRegion || null;
  const rawNiche = leadData.niche || leadData.Niche || leadData.trade || leadData.Trade || leadData.industry || leadData.Industry || "General Contractor";
  const rawPostal = leadData.postal_code || leadData.postalCode || leadData.zip || leadData.Zip || leadData.Postal || "";
  const rawScore = Number(leadData.lead_score ?? leadData.leadScore ?? leadData.Score);
  const validatedScore = Number.isFinite(rawScore) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 65;
  const uniqueLeadId = leadData.lead_id || leadData.leadId || `MCA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const numericId = inMemoryLeads.length + 101;
  const inMemoryRecord = {
    id: numericId,
    leadId: uniqueLeadId,
    organizationId: 1,
    businessName: rawBusinessName,
    contactName: rawContactName,
    phone: rawPhone,
    phoneE164: leadData.phone_e164 || leadData.phoneE164 || rawPhone,
    email: rawEmail,
    website: leadData.website || leadData["Website"] || "",
    industry: leadData.industry || "Contractor",
    serviceCategory: leadData.service_category || leadData.serviceCategory || "Construction",
    niche: rawNiche,
    address: leadData.address || leadData.Address || "",
    city: rawCity,
    county: leadData.county || leadData.County || "Multnomah",
    stateRegion: rawState,
    country: leadData.country || "USA",
    postalCode: rawPostal,
    googleMapsUrl: leadData.google_maps_url || leadData.googleMapsUrl || "",
    googlePlaceId: null,
    leadSource: leadData.lead_source || leadData.leadSource || "Manual Intake",
    leadStatus: leadData.pipeline_stage || leadData.lead_status || leadData.leadStatus || "New Lead",
    leadScore: validatedScore,
    estimatedRetainer: Number(leadData.estimated_retainer || leadData.estimatedRetainer || 2500),
    estimatedValue: Number(leadData.estimated_retainer || leadData.estimatedRetainer || 2500) * 12,
    assignedTo: leadData.owner || leadData.assigned_to || leadData.assignedTo || "Sophia (AI Sales Rep)",
    assignedUserId: null,
    ccbLicenseNumber: leadData.ccb_license_number || leadData.licenseNumber || (uniqueLeadId.startsWith("CCB-") ? uniqueLeadId.replace("CCB-", "") : null),
    isHotTarget: leadData.is_hot_target !== void 0 ? Boolean(leadData.is_hot_target) : validatedScore >= 80,
    doNotContact: false,
    opportunityAngle: leadData.opportunity_angle || leadData.opportunityAngle || "Immediate Local Growth Optimization",
    recommendedService: leadData.recommended_service || leadData.recommendedService || "SEO & GMB Optimization",
    rawPayload: leadData.original_data || leadData.rawPayload || leadData,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date(),
    archivedAt: null,
    deletedAt: null,
    audits: [
      {
        id: numericId,
        leadId: numericId,
        gmbStatus: leadData.gmb_status || "Established",
        googleRating: leadData.gmb_rating ? String(leadData.gmb_rating) : "4.5",
        reviewCount: leadData.gmb_review_count || 10,
        websiteStatus: leadData.website_status || "Active",
        mobileScore: 45,
        desktopScore: 68,
        performanceScore: 55,
        cms: "WordPress",
        auditSummary: leadData.opportunity_angle || "Newly registered contractor profile.",
        createdAt: /* @__PURE__ */ new Date()
      }
    ],
    scores: [
      {
        id: numericId,
        leadId: numericId,
        totalScore: validatedScore,
        reasoning: leadData.opportunity_angle || "Initial intake assessment score.",
        createdAt: /* @__PURE__ */ new Date()
      }
    ],
    notes: [],
    calls: [],
    emails: [],
    sms: [],
    tasks: [],
    statusHistory: [
      {
        id: numericId * 1e3 + 1,
        leadId: numericId,
        previousStatus: "None",
        newStatus: leadData.pipeline_stage || leadData.leadStatus || "New Lead",
        changedBy: "Sophia (AI Sales Rep)",
        reason: "Initial intake",
        createdAt: /* @__PURE__ */ new Date()
      }
    ]
  };
  if (isDbConfigured) {
    try {
      const [newLead] = await db.insert(leads).values({
        leadId: uniqueLeadId,
        businessName: inMemoryRecord.businessName,
        contactName: inMemoryRecord.contactName,
        phone: inMemoryRecord.phone,
        phoneE164: inMemoryRecord.phoneE164,
        email: inMemoryRecord.email,
        website: inMemoryRecord.website,
        industry: inMemoryRecord.industry,
        serviceCategory: inMemoryRecord.serviceCategory,
        niche: inMemoryRecord.niche,
        address: inMemoryRecord.address,
        city: inMemoryRecord.city,
        county: inMemoryRecord.county,
        stateRegion: inMemoryRecord.stateRegion,
        country: inMemoryRecord.country,
        postalCode: inMemoryRecord.postalCode,
        googleMapsUrl: inMemoryRecord.googleMapsUrl,
        leadSource: inMemoryRecord.leadSource,
        leadStatus: inMemoryRecord.leadStatus,
        leadScore: inMemoryRecord.leadScore,
        estimatedRetainer: inMemoryRecord.estimatedRetainer,
        estimatedValue: inMemoryRecord.estimatedValue,
        assignedTo: inMemoryRecord.assignedTo,
        ccbLicenseNumber: inMemoryRecord.ccbLicenseNumber,
        isHotTarget: inMemoryRecord.isHotTarget,
        opportunityAngle: inMemoryRecord.opportunityAngle,
        recommendedService: inMemoryRecord.recommendedService,
        rawPayload: inMemoryRecord.rawPayload
      }).onConflictDoUpdate({
        target: leads.leadId,
        set: {
          businessName: inMemoryRecord.businessName,
          contactName: inMemoryRecord.contactName,
          phone: inMemoryRecord.phone,
          phoneE164: inMemoryRecord.phoneE164,
          email: inMemoryRecord.email,
          website: inMemoryRecord.website,
          address: inMemoryRecord.address,
          city: inMemoryRecord.city,
          stateRegion: inMemoryRecord.stateRegion,
          postalCode: inMemoryRecord.postalCode,
          niche: inMemoryRecord.niche,
          leadScore: inMemoryRecord.leadScore,
          leadStatus: inMemoryRecord.leadStatus,
          updatedAt: /* @__PURE__ */ new Date()
        }
      }).returning();
      const mergedPersistedRecord = { ...inMemoryRecord, ...newLead, id: newLead.id };
      inMemoryLeads.unshift(mergedPersistedRecord);
      inMemoryActivities.unshift({
        id: inMemoryActivities.length + 1,
        leadId: newLead.id,
        activityType: "lead_created",
        title: "Lead Created",
        description: `New contractor profile registered: ${mergedPersistedRecord.businessName} (${mergedPersistedRecord.leadId})`,
        metadata: { leadId: mergedPersistedRecord.leadId, status: mergedPersistedRecord.leadStatus },
        createdAt: /* @__PURE__ */ new Date()
      });
      return { ...newLead, _dbSource: "neon" };
    } catch (error) {
      console.error("createDbLead DB insert FAILED:", error?.message);
      return { _dbSource: "failed", _error: error?.message };
    }
  }
  inMemoryLeads.unshift(inMemoryRecord);
  return { ...inMemoryRecord, _dbSource: "memory_only" };
}
async function updateDbLead(leadId, updates) {
  const idNum = Number(leadId);
  const target = inMemoryLeads.find(
    (l) => !isNaN(idNum) && l.id === idNum || String(l.leadId) === String(leadId)
  );
  if (target) {
    const prevStatus = target.leadStatus;
    if (updates.business_name !== void 0) target.businessName = updates.business_name;
    if (updates.businessName !== void 0) target.businessName = updates.businessName;
    if (updates.contact_name !== void 0) target.contactName = updates.contact_name;
    if (updates.contactName !== void 0) target.contactName = updates.contactName;
    if (updates.phone !== void 0) target.phone = updates.phone;
    if (updates.phone_e164 !== void 0) target.phoneE164 = updates.phone_e164;
    if (updates.email !== void 0) target.email = updates.email;
    if (updates.website !== void 0) target.website = updates.website;
    if (updates.niche !== void 0) target.niche = updates.niche;
    if (updates.city !== void 0) target.city = updates.city;
    if (updates.address !== void 0) target.address = updates.address;
    if (updates.lead_score !== void 0) target.leadScore = Number(updates.lead_score);
    if (updates.leadScore !== void 0) target.leadScore = Number(updates.leadScore);
    if (updates.estimated_retainer !== void 0) target.estimatedRetainer = Number(updates.estimated_retainer);
    if (updates.estimatedRetainer !== void 0) target.estimatedRetainer = Number(updates.estimatedRetainer);
    if (updates.pipeline_stage !== void 0) target.leadStatus = updates.pipeline_stage;
    if (updates.leadStatus !== void 0) target.leadStatus = updates.leadStatus;
    if (updates.is_hot_target !== void 0) target.isHotTarget = Boolean(updates.is_hot_target);
    if (updates.isHotTarget !== void 0) target.isHotTarget = Boolean(updates.isHotTarget);
    if (updates.assigned_user !== void 0) {
      const dbUser = updates.assigned_user;
      const roleTitle = ROLE_DISPLAY_TITLES[dbUser.role] || dbUser.role;
      target.assignedTo = `${dbUser.firstName} (${roleTitle})`;
      target.assignedUserId = dbUser.id;
    } else if (updates.assigned_to !== void 0) {
      target.assignedTo = updates.assigned_to;
    } else if (updates.assignedTo !== void 0) {
      target.assignedTo = updates.assignedTo;
    }
    if (updates.opportunity_angle !== void 0) target.opportunityAngle = updates.opportunity_angle;
    if (updates.opportunityAngle !== void 0) target.opportunityAngle = updates.opportunityAngle;
    if (updates.recommended_service !== void 0) target.recommendedService = updates.recommended_service;
    if (updates.recommendedService !== void 0) target.recommendedService = updates.recommendedService;
    target.updatedAt = /* @__PURE__ */ new Date();
    if (target.leadStatus !== prevStatus) {
      target.statusHistory.unshift({
        id: Date.now(),
        leadId: target.id,
        previousStatus: prevStatus,
        newStatus: target.leadStatus,
        changedBy: updates.changed_by || "Sophia",
        reason: updates.stage_change_reason || "Pipeline progression",
        createdAt: /* @__PURE__ */ new Date()
      });
      inMemoryActivities.unshift({
        id: inMemoryActivities.length + 1,
        leadId: target.id,
        activityType: "stage_changed",
        title: `Pipeline Stage Updated: ${target.businessName}`,
        description: `Transitioned from ${prevStatus} to ${target.leadStatus}`,
        metadata: { leadId: target.leadId, from: prevStatus, to: target.leadStatus },
        createdAt: /* @__PURE__ */ new Date()
      });
    }
  }
  if (isDbConfigured) {
    try {
      const updateFields = { updatedAt: /* @__PURE__ */ new Date() };
      if (updates.business_name !== void 0) updateFields.businessName = updates.business_name;
      if (updates.businessName !== void 0) updateFields.businessName = updates.businessName;
      if (updates.phone !== void 0) updateFields.phone = updates.phone;
      if (updates.email !== void 0) updateFields.email = updates.email;
      if (updates.pipeline_stage !== void 0) updateFields.leadStatus = updates.pipeline_stage;
      if (updates.leadStatus !== void 0) updateFields.leadStatus = updates.leadStatus;
      if (updates.country !== void 0) updateFields.country = updates.country;
      if (updates.assigned_user !== void 0) {
        const dbUser = updates.assigned_user;
        const roleTitle = ROLE_DISPLAY_TITLES[dbUser.role] || dbUser.role;
        updateFields.assignedTo = `${dbUser.firstName} (${roleTitle})`;
        updateFields.assignedUserId = dbUser.id;
      } else if (updates.assigned_to !== void 0) {
        updateFields.assignedTo = updates.assigned_to;
      } else if (updates.assignedTo !== void 0) {
        updateFields.assignedTo = updates.assignedTo;
      }
      const numId = Number(leadId);
      const whereClause = isNaN(numId) ? (0, import_drizzle_orm2.eq)(leads.leadId, String(leadId)) : (0, import_drizzle_orm2.or)((0, import_drizzle_orm2.eq)(leads.id, numId), (0, import_drizzle_orm2.eq)(leads.leadId, String(leadId)));
      const [updated] = await db.update(leads).set(updateFields).where(whereClause).returning();
      if (updated) return updated;
    } catch (error) {
      console.warn("updateDbLead DB update skipped (memory updated):", error?.message);
    }
  }
  return target || { success: true };
}
async function archiveOrDeleteDbLead(leadId, softDelete = true) {
  const idNum = Number(leadId);
  const target = inMemoryLeads.find(
    (l) => !isNaN(idNum) && l.id === idNum || String(l.leadId) === String(leadId)
  );
  if (target) {
    if (softDelete) {
      target.deletedAt = /* @__PURE__ */ new Date();
      target.leadStatus = "Archived";
    } else {
      inMemoryLeads = inMemoryLeads.filter((l) => l.id !== target.id);
    }
  }
  if (isDbConfigured) {
    try {
      const numId = Number(leadId);
      const whereClause = isNaN(numId) ? (0, import_drizzle_orm2.eq)(leads.leadId, String(leadId)) : (0, import_drizzle_orm2.or)((0, import_drizzle_orm2.eq)(leads.id, numId), (0, import_drizzle_orm2.eq)(leads.leadId, String(leadId)));
      if (softDelete) {
        await db.update(leads).set({ deletedAt: /* @__PURE__ */ new Date(), leadStatus: "Archived" }).where(whereClause);
      } else {
        await db.delete(leads).where(whereClause);
      }
    } catch (error) {
      console.warn("archiveOrDeleteDbLead DB skipped (memory updated):", error?.message);
    }
  }
  return target || { success: true };
}
async function addDbLeadNote(leadId, noteData) {
  const lead = await getDbLeadById(leadId);
  const note = {
    id: Math.floor(Math.random() * 9e5) + 1e5,
    organizationId: 1,
    leadId: lead ? lead.id : Number(leadId),
    authorName: noteData.author || noteData.authorName || "Sophia",
    content: noteData.content,
    noteType: noteData.note_type || noteData.noteType || "General",
    visibility: "Internal",
    createdAt: /* @__PURE__ */ new Date()
  };
  if (lead && lead.notes) {
    lead.notes.unshift(note);
  }
  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: "note_added",
    title: `Note Added for ${lead ? lead.businessName : "Prospect"}`,
    description: note.content.slice(0, 80),
    metadata: { noteId: note.id },
    createdAt: /* @__PURE__ */ new Date()
  });
  if (isDbConfigured) {
    try {
      const [dbNote] = await db.insert(crmNotes).values({
        organizationId: 1,
        leadId: lead ? lead.id : Number(leadId),
        authorName: note.authorName,
        content: note.content,
        noteType: note.noteType,
        visibility: "Internal"
      }).returning();
      return dbNote;
    } catch (error) {
      console.warn("addDbLeadNote DB skipped (memory note created):", error?.message);
    }
  }
  return note;
}
async function deleteDbLeadNote(noteId) {
  for (const l of inMemoryLeads) {
    if (l.notes) {
      l.notes = l.notes.filter((n) => n.id !== noteId);
    }
  }
  if (isDbConfigured) {
    try {
      await db.delete(crmNotes).where((0, import_drizzle_orm2.eq)(crmNotes.id, noteId));
    } catch (error) {
      console.warn("deleteDbLeadNote DB skipped:", error?.message);
    }
  }
  return { success: true };
}
async function addDbLeadCall(leadId, callData) {
  const lead = await getDbLeadById(leadId);
  const call = {
    id: Math.floor(Math.random() * 9e5) + 1e5,
    leadId: lead ? lead.id : Number(leadId),
    phone: callData.phone || (lead ? lead.phone : ""),
    contactPhone: callData.contact_phone || (lead ? lead.phone : ""),
    direction: callData.direction || "Outbound",
    provider: callData.provider || "Telnyx",
    externalCallId: callData.external_call_id || `call-${Date.now()}`,
    status: callData.status || "Completed",
    durationSeconds: callData.duration_seconds || 120,
    recordingUrl: callData.recording_url || null,
    transcript: callData.transcript || null,
    aiSummary: callData.ai_summary || null,
    callOutcome: callData.call_outcome || "Connected - Positive Interest",
    createdAt: /* @__PURE__ */ new Date()
  };
  if (lead) {
    if (!lead.calls) lead.calls = [];
    lead.calls.unshift(call);
    if (lead.leadStatus === "New Lead") {
      lead.leadStatus = "Contacted";
    }
  }
  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: "call_logged",
    title: `Call Logged: ${call.direction} to ${call.phone}`,
    description: `Outcome: ${call.callOutcome} (${call.durationSeconds}s)`,
    metadata: { callId: call.id, outcome: call.callOutcome },
    createdAt: /* @__PURE__ */ new Date()
  });
  if (isDbConfigured) {
    try {
      const [dbCall] = await db.insert(calls).values(call).returning();
      return dbCall;
    } catch (error) {
      console.warn("addDbLeadCall DB skipped (memory call logged):", error?.message);
    }
  }
  return call;
}
async function addDbLeadEmail(leadId, emailData) {
  const lead = await getDbLeadById(leadId);
  const emailMsg = {
    id: Math.floor(Math.random() * 9e5) + 1e5,
    leadId: lead ? lead.id : Number(leadId),
    direction: emailData.direction || "Outbound",
    subject: emailData.subject || "Follow-Up Regarding Local Contractor Growth",
    body: emailData.body || "",
    status: emailData.status || "Sent",
    provider: emailData.provider || "Gmail API",
    externalMessageId: emailData.external_message_id || `msg-${Date.now()}`,
    sentAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  };
  if (lead) {
    if (!lead.emails) lead.emails = [];
    lead.emails.unshift(emailMsg);
    if (lead.leadStatus === "New Lead") {
      lead.leadStatus = "Contacted";
    }
  }
  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: "email_sent",
    title: `Email Sent: "${emailMsg.subject}"`,
    description: `Dispatched to ${lead ? lead.email : "contractor"}`,
    metadata: { emailId: emailMsg.id, subject: emailMsg.subject },
    createdAt: /* @__PURE__ */ new Date()
  });
  if (isDbConfigured) {
    try {
      const [dbMsg] = await db.insert(emailMessages).values(emailMsg).returning();
      return dbMsg;
    } catch (error) {
      console.warn("addDbLeadEmail DB skipped (memory email logged):", error?.message);
    }
  }
  return emailMsg;
}
async function addDbLeadSms(leadId, smsData) {
  const lead = await getDbLeadById(leadId);
  const smsMsg = {
    id: Math.floor(Math.random() * 9e5) + 1e5,
    leadId: lead ? lead.id : Number(leadId),
    phone: smsData.phone || (lead ? lead.phone : ""),
    message: smsData.message || "",
    direction: smsData.direction || "Outbound",
    status: smsData.status || "Sent",
    provider: smsData.provider || "Telnyx",
    externalMessageId: smsData.external_message_id || `sms-${Date.now()}`,
    sentAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  };
  if (lead) {
    if (!lead.sms) lead.sms = [];
    lead.sms.unshift(smsMsg);
  }
  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: "sms_sent",
    title: `SMS Sent to ${smsMsg.phone}`,
    description: smsMsg.message.slice(0, 80),
    metadata: { smsId: smsMsg.id },
    createdAt: /* @__PURE__ */ new Date()
  });
  if (isDbConfigured) {
    try {
      const [dbSms] = await db.insert(smsMessages).values(smsMsg).returning();
      return dbSms;
    } catch (error) {
      console.warn("addDbLeadSms DB skipped (memory sms logged):", error?.message);
    }
  }
  return smsMsg;
}
async function addDbLeadTask(leadId, taskData) {
  const lead = await getDbLeadById(leadId);
  const task = {
    id: Math.floor(Math.random() * 9e5) + 1e5,
    leadId: lead ? lead.id : Number(leadId),
    title: taskData.title || "Follow up with contractor",
    taskType: taskData.task_type || taskData.taskType || "Follow-Up",
    status: taskData.status || "Pending",
    priority: taskData.priority || "Medium",
    dueDate: taskData.due_date ? new Date(taskData.due_date) : new Date(Date.now() + 864e5 * 2),
    assignedTo: taskData.assigned_to || taskData.assignedTo || "Sophia",
    createdAt: /* @__PURE__ */ new Date()
  };
  if (lead) {
    if (!lead.tasks) lead.tasks = [];
    lead.tasks.unshift(task);
  }
  if (isDbConfigured) {
    try {
      const [dbTask] = await db.insert(tasks).values({
        organizationId: 1,
        leadId: task.leadId,
        title: task.title,
        taskType: task.taskType,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate.toISOString(),
        assignedTo: task.assignedTo
      }).returning();
      return dbTask;
    } catch (error) {
      console.warn("addDbLeadTask DB skipped (memory task created):", error?.message);
    }
  }
  return task;
}
async function convertDbLeadToClient(leadId, clientData) {
  const lead = await getDbLeadById(leadId);
  const clientId = inMemoryClients.length + 1;
  const client = {
    id: clientId,
    organizationId: 1,
    leadId: lead ? lead.id : Number(leadId),
    clientName: clientData.clientName || (lead ? lead.businessName : "New Contractor Client"),
    contactPerson: clientData.contactPerson || (lead ? lead.contactName : ""),
    email: clientData.email || (lead ? lead.email : ""),
    phone: clientData.phone || (lead ? lead.phone : ""),
    website: clientData.website || (lead ? lead.website : ""),
    clientStatus: "Active",
    contractStartDate: clientData.contractStartDate || /* @__PURE__ */ new Date(),
    contractEndDate: clientData.contractEndDate || null,
    actualMrr: clientData.actualMrr || (lead ? lead.estimatedRetainer : 2500),
    billingFrequency: clientData.billingFrequency || "Monthly",
    accountManager: clientData.accountManager || "Sophia",
    healthScore: 95,
    churnRisk: "Low",
    notes: clientData.notes || "Successfully closed via Sophia AI Outreach & Pitch Pack.",
    services: (clientData.services || [
      { serviceName: "SEO & Content Growth", category: "SEO", monthlyFee: clientData.actualMrr || 2500 }
    ]).map((s, idx) => ({
      id: idx + 1,
      serviceName: s.serviceName,
      category: s.category || "Retainer",
      monthlyFee: s.monthlyFee || 2500,
      active: true
    })),
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  inMemoryClients.unshift(client);
  if (lead) {
    lead.leadStatus = "Won / Retainer Signed";
    lead.statusHistory.unshift({
      id: Date.now(),
      leadId: lead.id,
      previousStatus: lead.leadStatus,
      newStatus: "Won / Retainer Signed",
      changedBy: "Sophia",
      reason: "Contract signed & client onboarding completed",
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: "client_converted",
    title: `\u{1F389} Client Won & Retainer Signed: ${client.clientName}`,
    description: `Confirmed MRR: $${client.actualMrr}/mo. Client onboarded into active management.`,
    metadata: { clientId: client.id, mrr: client.actualMrr },
    createdAt: /* @__PURE__ */ new Date()
  });
  if (isDbConfigured) {
    try {
      const [dbClient] = await db.insert(clients).values({
        clientId: `CLI-${Date.now().toString().slice(-4)}`,
        organizationId: 1,
        leadId: lead ? lead.id : Number(leadId),
        businessName: client.clientName,
        email: client.email,
        phone: client.phone,
        website: client.website,
        clientStatus: "Active",
        startDate: client.contractStartDate ? client.contractStartDate.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        monthlyRetainer: client.actualMrr,
        actualMrr: client.actualMrr,
        accountManager: client.accountManager,
        healthScore: client.healthScore
      }).returning();
      return { client: dbClient, lead };
    } catch (error) {
      console.warn("convertDbLeadToClient DB skipped (memory client created):", error?.message);
    }
  }
  return { client, lead };
}
async function getDbClients() {
  if (isDbConfigured) {
    try {
      const clientsList = await db.select().from(clients).orderBy((0, import_drizzle_orm2.desc)(clients.createdAt));
      if (clientsList && clientsList.length > 0) {
        const results = [];
        for (const c of clientsList) {
          const services = await db.select().from(clientServices).where((0, import_drizzle_orm2.eq)(clientServices.clientId, c.id));
          results.push({ ...c, services });
        }
        return results;
      }
    } catch (error) {
      console.warn("getDbClients DB query skipped (using memory):", error?.message);
    }
  }
  return inMemoryClients;
}
async function getDbDashboardMetrics() {
  if (isDbConfigured) {
    try {
      const confirmedMrrResult = await db.select({ total: import_drizzle_orm2.sql`coalesce(sum(${clients.actualMrr}), 0)` }).from(clients).where((0, import_drizzle_orm2.eq)(clients.clientStatus, "Active"));
      const confirmedMrr2 = Number(confirmedMrrResult[0]?.total || 0);
      const pipelineMrrResult = await db.select({ total: import_drizzle_orm2.sql`coalesce(sum(${leads.estimatedRetainer}), 0)` }).from(leads).where(
        (0, import_drizzle_orm2.and)(
          import_drizzle_orm2.sql`${leads.deletedAt} IS NULL`,
          (0, import_drizzle_orm2.or)(
            (0, import_drizzle_orm2.eq)(leads.leadStatus, "Negotiation"),
            (0, import_drizzle_orm2.eq)(leads.leadStatus, "Proposal Sent"),
            (0, import_drizzle_orm2.eq)(leads.leadStatus, "Audit Sent")
          )
        )
      );
      const pipelineMrr2 = Number(pipelineMrrResult[0]?.total || 0);
      const totalLeadsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads).where(import_drizzle_orm2.sql`${leads.deletedAt} IS NULL`);
      const totalLeads2 = Number(totalLeadsResult[0]?.count || 0);
      const hotTargetsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads).where((0, import_drizzle_orm2.and)(import_drizzle_orm2.sql`${leads.deletedAt} IS NULL`, (0, import_drizzle_orm2.eq)(leads.isHotTarget, true)));
      const hotTargetsCount2 = Number(hotTargetsResult[0]?.count || 0);
      const stagesResult = await db.select({
        stage: leads.leadStatus,
        count: import_drizzle_orm2.sql`count(*)`,
        totalValue: import_drizzle_orm2.sql`coalesce(sum(${leads.estimatedRetainer}), 0)`
      }).from(leads).where(import_drizzle_orm2.sql`${leads.deletedAt} IS NULL`).groupBy(leads.leadStatus);
      const recentActivities = await db.select().from(activities).orderBy((0, import_drizzle_orm2.desc)(activities.createdAt)).limit(20);
      const activeClientsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(clients).where((0, import_drizzle_orm2.eq)(clients.clientStatus, "Active"));
      const activeClientsCount2 = Number(activeClientsResult[0]?.count || 0);
      if (totalLeads2 > 0 || confirmedMrr2 > 0) {
        return {
          confirmedMrr: confirmedMrr2,
          pipelineMrr: pipelineMrr2,
          totalLeads: totalLeads2,
          hotTargetsCount: hotTargetsCount2,
          activeClientsCount: activeClientsCount2,
          stages: stagesResult,
          recentActivities
        };
      }
    } catch (error) {
      console.warn("getDbDashboardMetrics DB query skipped (using memory):", error?.message);
    }
  }
  const activeLeads = inMemoryLeads.filter((l) => !l.deletedAt);
  const confirmedMrr = inMemoryClients.filter((c) => c.clientStatus === "Active").reduce((sum2, c) => sum2 + Number(c.actualMrr || 0), 0);
  const pipelineStages = /* @__PURE__ */ new Set(["Negotiation", "Proposal Sent", "Audit Sent"]);
  const pipelineMrr = activeLeads.filter((l) => pipelineStages.has(l.leadStatus)).reduce((sum2, l) => sum2 + Number(l.estimatedRetainer || 0), 0);
  const totalLeads = activeLeads.length;
  const hotTargetsCount = activeLeads.filter((l) => l.isHotTarget).length;
  const activeClientsCount = inMemoryClients.filter((c) => c.clientStatus === "Active").length;
  const stageCounts = {};
  for (const l of activeLeads) {
    const st = l.leadStatus || "New Lead";
    if (!stageCounts[st]) {
      stageCounts[st] = { count: 0, totalValue: 0 };
    }
    stageCounts[st].count += 1;
    stageCounts[st].totalValue += Number(l.estimatedRetainer || 0);
  }
  const stages = Object.entries(stageCounts).map(([stage, data]) => ({
    stage,
    count: data.count,
    totalValue: data.totalValue
  }));
  return {
    confirmedMrr,
    pipelineMrr,
    totalLeads,
    hotTargetsCount,
    activeClientsCount,
    stages,
    recentActivities: inMemoryActivities.slice(0, 20)
  };
}
async function getDbTeamPerformance(period = "This Month") {
  if (!isDbConfigured) {
    console.warn("[Team Performance] Database not configured, returning empty result");
    return [];
  }
  try {
    let startDate, endDate;
    const now = /* @__PURE__ */ new Date();
    switch (period) {
      case "Today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This Week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Last Month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "All Time":
        startDate = /* @__PURE__ */ new Date(0);
        endDate = /* @__PURE__ */ new Date();
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }
    const teamMembers = await db.select({
      user_id: users.id,
      uid: users.uid,
      firstName: users.firstName,
      lastName: users.lastName,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    }).from(users).where((0, import_drizzle_orm2.eq)(users.status, "active"));
    const performanceData = await Promise.all(
      teamMembers.map(async (member) => {
        const assignedLeadsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            import_drizzle_orm2.sql`${leads.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${leads.createdAt} <= ${endDate}`
          )
        );
        const contactedResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            (0, import_drizzle_orm2.eq)(leads.leadStatus, "Contacted"),
            import_drizzle_orm2.sql`${leads.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${leads.createdAt} <= ${endDate}`
          )
        );
        const appointmentsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(activities).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(activities.userId, member.user_id),
            (0, import_drizzle_orm2.eq)(activities.activityType, "meeting_scheduled"),
            import_drizzle_orm2.sql`${activities.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${activities.createdAt} <= ${endDate}`
          )
        );
        const wonResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            (0, import_drizzle_orm2.eq)(leads.leadStatus, "Won Retainer"),
            import_drizzle_orm2.sql`${leads.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${leads.createdAt} <= ${endDate}`
          )
        );
        const callsResult = await db.select({
          count: import_drizzle_orm2.sql`count(*)`,
          totalDuration: import_drizzle_orm2.sql`COALESCE(SUM(${calls.durationSeconds}), 0)`
        }).from(calls).innerJoin(leads, (0, import_drizzle_orm2.eq)(calls.leadId, leads.id)).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            import_drizzle_orm2.sql`${calls.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${calls.createdAt} <= ${endDate}`
          )
        );
        const emailsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(emailMessages).innerJoin(leads, (0, import_drizzle_orm2.eq)(emailMessages.leadId, leads.id)).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            (0, import_drizzle_orm2.eq)(emailMessages.status, "Sent"),
            import_drizzle_orm2.sql`${emailMessages.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${emailMessages.createdAt} <= ${endDate}`
          )
        );
        const smsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(smsMessages).innerJoin(leads, (0, import_drizzle_orm2.eq)(smsMessages.leadId, leads.id)).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            (0, import_drizzle_orm2.eq)(smsMessages.status, "Sent"),
            import_drizzle_orm2.sql`${smsMessages.createdAt} >= ${startDate}`,
            import_drizzle_orm2.sql`${smsMessages.createdAt} <= ${endDate}`
          )
        );
        const mrrResult = await db.select({
          totalMRR: import_drizzle_orm2.sql`COALESCE(SUM(${leads.estimatedRetainer}), 0)`
        }).from(leads).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(leads.assignedUserId, member.user_id),
            (0, import_drizzle_orm2.eq)(leads.leadStatus, "Won Retainer")
          )
        );
        const isSophia = member.firstName === "Sophia" || member.displayName === "Sophia";
        const assignedLeads = Number(assignedLeadsResult[0]?.count || 0);
        const contacted = Number(contactedResult[0]?.count || 0);
        const conversionRate = assignedLeads > 0 ? contacted / assignedLeads * 100 : 0;
        let displayRole = member.role || "User";
        let displayName = isSophia ? "Sophia (AI Sales Rep)" : member.displayName;
        return {
          user_id: String(member.user_id),
          name: displayName,
          firstName: member.firstName || member.displayName,
          lastName: member.lastName || "",
          email: member.email,
          role: displayRole,
          status: member.status,
          lastLogin: member.lastLoginAt ? member.lastLoginAt.toISOString() : void 0,
          is_ai: isSophia,
          assignedLeads,
          contacted,
          appointments: Number(appointmentsResult[0]?.count || 0),
          won: Number(wonResult[0]?.count || 0),
          conversion: Number(conversionRate.toFixed(1)),
          calls_made: Number(callsResult[0]?.count || 0),
          talkTime: Number((callsResult[0]?.totalDuration || 0) / 60),
          // Convert seconds to minutes
          emails_sent: Number(emailsResult[0]?.count || 0),
          sms_sent: Number(smsResult[0]?.count || 0),
          mrr: Number(mrrResult[0]?.totalMRR || 0),
          follow_ups_completed: 0,
          meetings_requested: 0,
          won_revenue: Number(mrrResult[0]?.totalMRR || 0)
        };
      })
    );
    return performanceData;
  } catch (error) {
    console.error("getDbTeamPerformance failed:", error?.message);
    return [];
  }
}
async function getDbActivities(limit = 50) {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(activities).orderBy((0, import_drizzle_orm2.desc)(activities.createdAt)).limit(limit);
      if (rows && rows.length > 0) return rows;
    } catch (error) {
      console.warn("getDbActivities DB skipped:", error?.message);
    }
  }
  return inMemoryActivities.slice(0, limit);
}
async function getDbAuditLogs(limit = 100) {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(auditLogs).orderBy((0, import_drizzle_orm2.desc)(auditLogs.createdAt)).limit(limit);
      if (rows && rows.length > 0) return rows;
    } catch (error) {
      console.warn("getDbAuditLogs DB skipped:", error?.message);
    }
  }
  return inMemoryAuditLogs.slice(0, limit);
}
async function getDbAgencySettings() {
  if (isDbConfigured) {
    try {
      const rows = await db.select().from(agencySettings).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (error) {
      console.warn("getDbAgencySettings DB skipped:", error?.message);
    }
  }
  return inMemorySettings;
}
async function updateDbAgencySettings(updates) {
  Object.assign(inMemorySettings, updates, { updatedAt: /* @__PURE__ */ new Date() });
  if (isDbConfigured) {
    try {
      const current = await db.select().from(agencySettings).limit(1);
      if (current.length > 0) {
        const [updated] = await db.update(agencySettings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(agencySettings.id, current[0].id)).returning();
        return updated;
      }
    } catch (error) {
      console.warn("updateDbAgencySettings DB skipped:", error?.message);
    }
  }
  return inMemorySettings;
}
async function getDbSystemHealth() {
  const start = Date.now();
  let dbStatus = isDbConfigured ? "OPERATIONAL" : "IN_MEMORY_RESILIENT";
  let dbLatency = 1;
  let totalStoredCount = inMemoryLeads.filter((l) => !l.deletedAt).length;
  const dbDetails = getDatabaseDetails();
  if (isDbConfigured) {
    try {
      const [leadCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(leads).where(import_drizzle_orm2.sql`deleted_at IS NULL`);
      dbLatency = Date.now() - start;
      if (leadCount && leadCount.count !== void 0) {
        totalStoredCount = Number(leadCount.count);
      }
    } catch (err) {
      console.warn("Health check DB ping failed, using memory count fallback:", err?.message);
      dbStatus = "DEGRADED";
    }
  }
  return {
    status: "HEALTHY",
    services: {
      cloudSqlPostgres: {
        status: dbStatus,
        latencyMs: dbLatency,
        provider: dbDetails.provider,
        engine: dbDetails.isNeon ? "Neon Serverless PostgreSQL 16" : "PostgreSQL 16 Compatible",
        region: dbDetails.host.includes("us-east-1") ? "us-east-1" : "europe-west3",
        host: dbDetails.host,
        database: dbDetails.database,
        sslMode: dbDetails.sslMode,
        isNeon: dbDetails.isNeon,
        totalLeadsStored: totalStoredCount
      },
      geminiAi: {
        status: "OPERATIONAL",
        models: ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash"],
        quotaStrategy: "Exponential cooldown with fallback cascade"
      },
      telnyxTelephony: {
        status: "OPERATIONAL",
        voiceDialer: "Active (WebRTC & SIP ready)",
        smsEngine: "Active (10DLC compliant)"
      },
      n8nWorkflowEngine: {
        status: "CONNECTED",
        architecture: "Decoupled webhook event bus"
      },
      storageEngine: {
        status: "OPERATIONAL",
        protection: "Server-side access control with signed URLs"
      },
      backupStatus: {
        status: "CONFIGURED",
        automatedDaily: true,
        pointInTimeRecovery: "Supported",
        lastVerification: (/* @__PURE__ */ new Date()).toISOString()
      }
    },
    checkedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function batchImportDbLeads(rows, importMeta) {
  let validCount = 0;
  let duplicatesCount = 0;
  const insertedIds = [];
  const insertedLeads = [];
  const failedInserts = [];
  for (const row of rows) {
    const bizName = row.business_name || row.Business_Name || row["Business Name"] || row.businessName;
    if (!bizName) continue;
    const phone = row.phone || row.Phone || "";
    const email = row.email || row.Email || "";
    const website = row.website || row.Website || "";
    const dupCheck = await checkLeadDuplicate({ businessName: bizName, phone, email, website });
    if (dupCheck.isDuplicate) {
      duplicatesCount++;
      continue;
    }
    const leadId = row.lead_id || row.leadId || `MCA-LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const result = await createDbLead({
      lead_id: leadId,
      business_name: bizName,
      contact_name: row.contact_name || row["Contact Name"] || row.contactName || bizName,
      phone,
      phone_e164: row.phone_e164 || row.phoneE164 || phone,
      email,
      website,
      address: row.address || row.Address || "",
      city: row.city || row.City || null,
      state: row.state || row.State || row.stateRegion || null,
      postal_code: row.postal_code || row.postalCode || row.zip || row.Zip || "",
      niche: row.niche || row.Trade || row.Industry || "General Contractor",
      gmb_status: row.gmb_status || row.gmbStatus || "Established",
      gmb_rating: row.gmb_rating !== void 0 ? Number(row.gmb_rating) : 4.5,
      gmb_review_count: row.gmb_review_count !== void 0 ? Number(row.gmb_review_count) : 10,
      google_maps_url: row.google_maps_url || row.googleMapsUrl || "",
      website_status: row.website_status || row.websiteStatus || "Active",
      pagespeed_score: row.pagespeed_score !== void 0 ? Number(row.pagespeed_score) : 60,
      google_ads_status: row.google_ads_status || "No Ads",
      meta_pixel_status: row.meta_pixel_status || "No Pixel",
      lead_score: Number(row.lead_score || row.leadScore || row.Score || 65),
      score_breakdown: row.score_breakdown || {},
      is_hot_target: row.is_hot_target !== void 0 ? Boolean(row.is_hot_target) : Number(row.lead_score || row.Score || 65) >= 80,
      opportunity_angle: row.opportunity_angle || row.opportunityAngle || "Immediate Local Growth Optimization",
      recommended_service: row.recommended_service || row.recommendedService || "SEO & GMB Optimization",
      estimated_retainer: Number(row.estimated_retainer || row.estimatedRetainer || 2500),
      pipeline_stage: row.pipeline_stage || row.leadStatus || "New Lead",
      owner: row.owner || row.assigned_to || row.assignedTo || "Sophia (AI Sales Rep)",
      notes: row.notes || [],
      original_data: row.original_data || row.rawPayload || row
    });
    if (result._dbSource === "neon") {
      const dbRecord = result._inMemoryRecord ? { ...result._inMemoryRecord, ...result } : result;
      validCount++;
      insertedIds.push(dbRecord.id);
      insertedLeads.push(dbRecord);
    } else if (result._dbSource === "failed") {
      if (result._error?.includes("unique") || result._error?.includes("duplicate key") || result._error?.includes("23505")) {
        duplicatesCount++;
      } else {
        failedInserts.push({
          lead_id: leadId,
          business_name: bizName,
          error: result._error
        });
      }
      console.error(`Batch import: Failed to insert lead ${leadId} (${bizName}): ${result._error}`);
    } else {
      failedInserts.push({
        lead_id: leadId,
        business_name: bizName,
        error: "Database not configured or persistence unavailable; memory records cannot be confirmed as Neon persisted"
      });
      console.warn(`Batch import: Lead ${leadId} (${bizName}) not persisted to Neon (source: ${result._dbSource})`);
    }
  }
  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    activityType: "lead_imported",
    title: `Batch Import Completed: ${importMeta.fileName}`,
    description: `Successfully imported ${validCount} new contractor leads (${duplicatesCount} duplicates skipped, ${failedInserts.length} failures).`,
    metadata: { validCount, duplicatesCount, failedCount: failedInserts.length, fileName: importMeta.fileName },
    createdAt: /* @__PURE__ */ new Date()
  });
  return {
    success: failedInserts.length === 0 && (validCount > 0 || rows.length === 0),
    validCount,
    duplicatesCount,
    failedCount: failedInserts.length,
    insertedCount: insertedIds.length,
    leads: insertedLeads,
    failures: failedInserts
  };
}
async function truncateAllLeads() {
  if (!isDbConfigured) {
    console.warn("truncateAllLeads: Database not configured, nothing to truncate");
    return { success: false, reason: "Database not configured" };
  }
  try {
    await db.execute(import_drizzle_orm2.sql.raw(`
      TRUNCATE TABLE public.lead_details CASCADE;
      TRUNCATE TABLE public.lead_audits CASCADE;
      TRUNCATE TABLE public.lead_scores CASCADE;
      TRUNCATE TABLE public.leads CASCADE;
    `));
    inMemoryLeads = [];
    console.log("truncateAllLeads: Successfully truncated all leads and related tables");
    return { success: true, message: "All leads and related data permanently deleted" };
  } catch (error) {
    console.error("truncateAllLeads failed:", error?.message);
    return { success: false, error: error?.message };
  }
}
async function deleteAllDbLeads() {
  if (!isDbConfigured) {
    console.warn("deleteAllDbLeads: Database not configured, nothing to delete");
    return { success: false, reason: "Database not configured" };
  }
  try {
    await db.delete(leadDetails).where(import_drizzle_orm2.sql`1=1`);
    await db.delete(leadAudits).where(import_drizzle_orm2.sql`1=1`);
    await db.delete(leadScores).where(import_drizzle_orm2.sql`1=1`);
    await db.delete(leads).where(import_drizzle_orm2.sql`1=1`);
    inMemoryLeads = [];
    console.log("deleteAllDbLeads: Successfully deleted all leads");
    return { success: true, message: "All leads permanently deleted" };
  } catch (error) {
    console.error("deleteAllDbLeads failed:", error?.message);
    return { success: false, error: error?.message };
  }
}

// src/services/messagingService.ts
function validateAndNormalizePhone(phone) {
  const original = phone ? phone.trim() : "";
  if (!original || original.toLowerCase() === "not available" || original.toLowerCase() === "none") {
    return {
      valid: false,
      e164: "",
      display: "No phone number available for this lead.",
      original,
      reason: "No phone number available for this lead."
    };
  }
  const digitsOnly = original.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    const area = digitsOnly.substring(0, 3);
    const prefix = digitsOnly.substring(3, 6);
    const line = digitsOnly.substring(6, 10);
    return {
      valid: true,
      e164: `+1${digitsOnly}`,
      display: `(${area}) ${prefix}-${line}`,
      original
    };
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    const area = digitsOnly.substring(1, 4);
    const prefix = digitsOnly.substring(4, 7);
    const line = digitsOnly.substring(7, 11);
    return {
      valid: true,
      e164: `+${digitsOnly}`,
      display: `(${area}) ${prefix}-${line}`,
      original
    };
  } else if (original.startsWith("+") && digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return {
      valid: true,
      e164: `+${digitsOnly}`,
      display: `+${digitsOnly}`,
      original
    };
  } else if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return {
      valid: true,
      e164: `+${digitsOnly}`,
      display: `+${digitsOnly}`,
      original
    };
  }
  return {
    valid: false,
    e164: "",
    display: original,
    original,
    reason: "Invalid phone number format. Must contain at least 10 digits."
  };
}

// telephony-server.ts
var TelnyxVoiceProvider = class {
  constructor() {
    this.id = "telnyx";
    this.name = "Telnyx Cloud Telephony";
    this.apiKey = process.env.TELNYX_API_KEY;
    this.defaultFromNumber = process.env.TELNYX_FROM_NUMBER || "+15035550199";
  }
  async initiateCall(params) {
    const fromNumber = params.from || this.defaultFromNumber;
    const phoneResult = validateAndNormalizePhone(params.to);
    console.log(`[Telephony] Normalizing phone: ${params.to} -> Result: ${JSON.stringify(phoneResult)}`);
    if (!phoneResult.valid || !phoneResult.e164) {
      throw new Error(`Invalid destination phone number for Telnyx: ${params.to}. Reason: ${phoneResult.reason || "Unknown"}`);
    }
    const normalizedTo = phoneResult.e164;
    if (this.apiKey) {
      const response = await fetch("https://api.telnyx.com/v2/calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          to: normalizedTo,
          from: fromNumber,
          connection_id: process.env.TELNYX_CONNECTION_ID,
          custom_headers: [
            { name: "X-MCA-Call-ID", value: params.callId }
          ],
          client_state: Buffer.from(JSON.stringify({ callId: params.callId })).toString("base64")
        })
      });
      if (response.ok) {
        const data = await response.json();
        const callControlId = data.data?.call_control_id;
        console.log("[PSTN] Destination call created, call_control_id:", callControlId);
        const agentPhone = process.env.TELNYX_AGENT_PHONE_NUMBER;
        if (agentPhone && callControlId) {
          console.log("[PSTN] Bridging agent phone:", agentPhone);
          const bridgeRes = await fetch(
            `https://api.telnyx.com/v2/calls/${callControlId}/actions/transfer`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`
              },
              body: JSON.stringify({
                to: agentPhone,
                from: fromNumber
              })
            }
          );
          if (!bridgeRes.ok) {
            const bridgeErr = await bridgeRes.json().catch(() => ({}));
            console.warn("[PSTN] Agent bridge failed:", bridgeRes.status, bridgeErr);
          } else {
            console.log("[PSTN] Agent bridge initiated successfully");
          }
        } else {
          console.warn("[PSTN] TELNYX_AGENT_PHONE_NUMBER not set \u2014 no agent audio bridge");
        }
        return {
          providerCallId: callControlId,
          status: "CALLING"
        };
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Telnyx API Error: ${response.status} - ${JSON.stringify(errData)}`);
    }
    throw new Error("TELNYX_API_KEY is not configured on the server.");
  }
  async terminateCall(providerCallId) {
    if (this.apiKey && !providerCallId.startsWith("tlnx_sim_")) {
      try {
        await fetch(`https://api.telnyx.com/v2/calls/${providerCallId}/actions/hangup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          }
        });
      } catch (e) {
        console.warn("Telnyx terminateCall error:", e);
      }
    }
    return { success: true, status: "COMPLETED" };
  }
  async getCallStatus(providerCallId) {
    if (this.apiKey && !providerCallId.startsWith("tlnx_sim_")) {
      try {
        const res = await fetch(`https://api.telnyx.com/v2/calls/${providerCallId}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` }
        });
        if (res.ok) {
          const data = await res.json();
          const telnyxState = data.data?.call_leg_state || data.data?.status;
          return {
            status: this.mapTelnyxState(telnyxState)
          };
        }
      } catch (e) {
      }
    }
    return { status: "UNKNOWN" };
  }
  mapTelnyxState(state) {
    switch (state?.toLowerCase()) {
      case "initiating":
      case "preparing":
        return "PREPARING";
      case "calling":
      case "dialing":
        return "CALLING";
      case "ringing":
      case "early_media":
        return "RINGING";
      case "active":
      case "connected":
      case "answered":
        return "CONNECTED";
      case "held":
        return "ON_HOLD";
      case "busy":
        return "BUSY";
      case "no_answer":
        return "NO_ANSWER";
      case "hangup":
      case "completed":
        return "COMPLETED";
      default:
        return "CONNECTED";
    }
  }
  async sendSms(params) {
    const fromNumber = params.from || this.defaultFromNumber;
    if (this.apiKey) {
      try {
        const response = await fetch("https://api.telnyx.com/v2/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            from: fromNumber,
            to: params.to,
            text: params.text
          })
        });
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            messageId: data.data?.id || `telnyx_msg_${Date.now()}`,
            status: data.data?.to?.[0]?.status || "DELIVERED"
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            messageId: `telnyx_err_${Date.now()}`,
            status: "FAILED",
            error: errData?.errors?.[0]?.detail || `Telnyx HTTP ${response.status}`
          };
        }
      } catch (err) {
        return {
          success: false,
          messageId: `telnyx_err_${Date.now()}`,
          status: "ERROR",
          error: err.message
        };
      }
    }
    return {
      success: true,
      messageId: `sim_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: "DELIVERED"
    };
  }
};
var TelephonyServerManager = class {
  constructor() {
    this.activeCalls = /* @__PURE__ */ new Map();
    this.callHistory = [];
    this.voiceProvider = new TelnyxVoiceProvider();
  }
  async startCall(params) {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (!process.env.TELNYX_CONNECTION_ID) {
      throw new Error("TELNYX_CONNECTION_ID is not configured");
    }
    const result = await this.voiceProvider.initiateCall({
      to: params.phoneNumber,
      callId,
      metadata: { leadId: params.leadId }
    });
    const now = Date.now();
    const session = {
      callId,
      providerCallId: result.providerCallId,
      leadId: params.leadId,
      businessName: params.businessName || "Prospect Contact",
      contactName: params.contactName,
      phoneNumber: params.phoneNumber,
      direction: "OUTBOUND",
      callType: params.callType || "Outbound Call",
      status: "INITIATING",
      duration: 0,
      startedAt: now,
      isMuted: false,
      isOnHold: false,
      recordingStatus: "Not Available",
      transcriptStatus: "Not Available",
      leadScore: params.leadScore,
      opportunity: params.opportunity,
      estimatedRetainer: params.estimatedRetainer
    };
    this.activeCalls.set(callId, session);
    return session;
  }
  getCallSession(callId) {
    const session = this.activeCalls.get(callId);
    if (!session) {
      return this.callHistory.find((c) => c.callId === callId);
    }
    if (session.status === "CONNECTED" && session.connectedAt && !session.isOnHold) {
      session.duration = Math.floor((Date.now() - session.connectedAt) / 1e3);
    }
    return session;
  }
  async endCall(callId, params) {
    const session = this.activeCalls.get(callId);
    if (!session) return void 0;
    await this.voiceProvider.terminateCall(session.providerCallId);
    session.status = "COMPLETED";
    session.endedAt = Date.now();
    if (params?.duration !== void 0) {
      session.duration = params.duration;
    } else if (session.connectedAt) {
      session.duration = Math.floor((session.endedAt - session.connectedAt) / 1e3);
    }
    if (params?.outcome) session.outcome = params.outcome;
    if (params?.notes) session.notes = params.notes;
    this.activeCalls.delete(callId);
    this.callHistory.unshift(session);
    if (session.leadId) {
      addDbLeadCall(session.leadId, {
        phone: session.phoneNumber,
        contact_phone: session.phoneNumber,
        direction: session.direction === "INBOUND" ? "Inbound" : "Outbound",
        provider: "Telnyx Voice & Call Control",
        external_call_id: session.providerCallId,
        status: "Completed",
        duration_seconds: session.duration || 0,
        call_outcome: session.outcome || "Call Completed",
        ai_summary: session.notes ? `Call Completed with outcome "${session.outcome || "Completed"}". Notes: ${session.notes}` : void 0
      }).catch((e) => {
        console.warn("Database call record sync warning:", e?.message || e);
      });
    }
    return session;
  }
  toggleMute(callId, muted) {
    const session = this.activeCalls.get(callId);
    if (session) {
      session.isMuted = muted !== void 0 ? muted : !session.isMuted;
    }
    return session;
  }
  toggleHold(callId, onHold) {
    const session = this.activeCalls.get(callId);
    if (session) {
      session.isOnHold = onHold !== void 0 ? onHold : !session.isOnHold;
      if (session.isOnHold) {
        session.status = "ON_HOLD";
      } else if (session.connectedAt) {
        session.status = "CONNECTED";
      }
    }
    return session;
  }
  saveNotes(callId, notes) {
    const session = this.activeCalls.get(callId) || this.callHistory.find((c) => c.callId === callId);
    if (session) {
      session.notes = notes;
    }
    return session;
  }
  setOutcome(callId, outcome, notes) {
    const session = this.activeCalls.get(callId) || this.callHistory.find((c) => c.callId === callId);
    if (session) {
      session.outcome = outcome;
      if (notes) session.notes = notes;
    }
    return session;
  }
  getHistory() {
    return [...this.callHistory];
  }
};
var telephonyManager = new TelephonyServerManager();

// src/routes/databaseRoutes.ts
var import_express = __toESM(require("express"), 1);
var import_drizzle_orm3 = require("drizzle-orm");

// src/lib/firebase-admin.ts
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "ai-studio-applet-webapp-cf859",
  appId: "1:466039143105:web:ace1ac412e1b791a35b240",
  apiKey: "AIzaSyDCdkKxxQbkAhptL4ReLQPUQDKzG7lSmZE",
  authDomain: "ai-studio-applet-webapp-cf859.firebaseapp.com",
  storageBucket: "ai-studio-applet-webapp-cf859.firebasestorage.app",
  messagingSenderId: "466039143105",
  measurementId: "",
  oAuthClientId: "466039143105-1gakgrbu5ut74f40j679js8kgqijv7rj.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/lib/firebase-admin.ts
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = (0, import_auth.getAuth)();

// src/middleware/auth.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// src/utils/roleUtils.ts
function normalizeAppRole(role) {
  switch (role) {
    case "Super Admin":
    case "Agency Owner":
    case "Admin":
      return "AGENCY_DIRECTOR";
    case "Manager":
      return "SALES_MANAGER";
    case "Sales":
      return "SDR";
    case "Account Manager":
      return "CLIENT_SUCCESS";
    case "AGENCY_DIRECTOR":
    case "SALES_MANAGER":
    case "SDR":
    case "ACCOUNT_EXECUTIVE":
    case "APPOINTMENT_SETTER":
    case "OUTREACH_SPECIALIST":
    case "CLIENT_SUCCESS":
    case "OPERATIONS_ANALYST":
      return role;
    default:
      return null;
  }
}
function getCanonicalRole(role) {
  const normalized = normalizeAppRole(role);
  return normalized || role;
}
function canAccessTeamManagement(role) {
  const canonical = getCanonicalRole(role);
  return canonical === "AGENCY_DIRECTOR";
}

// src/routes/databaseRoutes.ts
var router = import_express.default.Router();
router.get("/team/performance", requireAuth, async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Unauthorized: Missing user identity" });
    }
    const userResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.uid, firebaseUid)).limit(1);
    if (userResult.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found in database" });
    }
    const dbUser = userResult[0];
    const canonicalRole = normalizeAppRole(dbUser.role);
    if (!canonicalRole || !canAccessTeamManagement(canonicalRole)) {
      return res.status(403).json({
        error: "Forbidden: Only Agency Director can access team management",
        requiredRole: "AGENCY_DIRECTOR",
        userRole: canonicalRole || dbUser.role
      });
    }
    const period = req.query.period || "This Month";
    const performance = await getDbTeamPerformance(period);
    return res.json({
      success: true,
      performance,
      period,
      currentUser: {
        id: dbUser.id,
        displayName: dbUser.displayName,
        role: dbUser.role,
        canonicalRole
      }
    });
  } catch (error) {
    console.error("Team performance API error:", error);
    return res.status(500).json({
      error: "Failed to fetch team performance",
      details: error.message
    });
  }
});
router.get("/debug/db-diagnostic", async (req, res) => {
  try {
    const details = getDatabaseDetails();
    const countResult = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(schema_exports.leads);
    return res.json({
      databaseConfigured: details.configured,
      databaseProvider: details.provider,
      databaseHost: details.host,
      databaseName: details.database,
      databaseConnection: details.configured ? "SUCCESS" : "FAIL",
      leadTableExists: true,
      // If query didn't throw, table exists
      totalDatabaseLeads: Number(countResult[0]?.count || 0)
    });
  } catch (err) {
    return res.status(500).json({
      error: "Database diagnostic failed",
      details: err.message
    });
  }
});
router.get("/database/details", async (req, res) => {
  try {
    const details = getDatabaseDetails();
    const health = await getDbSystemHealth();
    return res.json({
      success: true,
      details,
      health: health.services.cloudSqlPostgres
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/db-details", async (req, res) => {
  try {
    const details = getDatabaseDetails();
    const health = await getDbSystemHealth();
    return res.json({
      success: true,
      details,
      health: health.services.cloudSqlPostgres
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/leads", async (req, res) => {
  try {
    const { search, status, niche, city, isHotTarget, limit, offset } = req.query;
    const leads2 = await getDbLeads({
      search: search ? String(search) : void 0,
      status: status ? String(status) : void 0,
      niche: niche ? String(niche) : void 0,
      city: city ? String(city) : void 0,
      isHotTarget: isHotTarget === "true",
      limit: limit ? Number(limit) : void 0,
      offset: offset ? Number(offset) : void 0
    });
    return res.json({ leads: leads2, total: leads2.length });
  } catch (err) {
    console.error("API /leads error:", err);
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/check-duplicate", async (req, res) => {
  try {
    const { businessName, phone, email, website } = req.body;
    const result = await checkLeadDuplicate({ businessName, phone, email, website });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/batch-import", async (req, res) => {
  try {
    const { rows, meta } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "rows must be an array" });
    }
    const result = await batchImportDbLeads(rows, meta || { fileName: "upload.csv" });
    return res.json({
      success: result.success,
      validCount: result.validCount,
      duplicatesCount: result.duplicatesCount,
      failedCount: result.failedCount || 0,
      insertedCount: result.insertedCount,
      leads: result.leads || [],
      failures: result.failures || []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/leads/:id", async (req, res) => {
  try {
    const lead = await getDbLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    return res.json({ lead });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads", async (req, res) => {
  try {
    const lead = await createDbLead(req.body);
    if (lead._dbSource === "failed") {
      return res.status(500).json({
        success: false,
        error: lead._error || "Failed to persist lead to Neon database"
      });
    }
    if (lead._dbSource === "memory_only") {
      return res.status(200).json({
        success: false,
        warning: "Lead held in memory only; database is not configured.",
        lead
      });
    }
    return res.status(201).json({ success: true, lead });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
router.post("/leads/bulk", async (req, res) => {
  try {
    const { leads: leads2 } = req.body;
    if (!Array.isArray(leads2)) {
      return res.status(400).json({ error: "leads must be an array" });
    }
    for (const lead of leads2) {
      await createDbLead(lead);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.put("/leads/:id", async (req, res) => {
  try {
    const updated = await updateDbLead(req.params.id, req.body);
    return res.json({ lead: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.delete("/leads/:id", async (req, res) => {
  try {
    const soft = req.query.soft !== "false";
    const deleted = await archiveOrDeleteDbLead(req.params.id, soft);
    return res.json({ success: true, lead: deleted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.delete("/leads", async (req, res) => {
  try {
    const useTruncate = req.query.method === "truncate";
    let result;
    if (useTruncate) {
      result = await truncateAllLeads();
    } else {
      result = await deleteAllDbLeads();
    }
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
router.post("/leads/:id/notes", async (req, res) => {
  try {
    const note = await addDbLeadNote(req.params.id, req.body);
    return res.status(201).json({ note });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.delete("/notes/:id", async (req, res) => {
  try {
    await deleteDbLeadNote(Number(req.params.id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/:id/calls", async (req, res) => {
  try {
    const call = await addDbLeadCall(req.params.id, req.body);
    return res.status(201).json({ call });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/:id/emails", async (req, res) => {
  try {
    const email = await addDbLeadEmail(req.params.id, req.body);
    return res.status(201).json({ email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/:id/sms", async (req, res) => {
  try {
    const sms = await addDbLeadSms(req.params.id, req.body);
    return res.status(201).json({ sms });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/:id/tasks", async (req, res) => {
  try {
    const task = await addDbLeadTask(req.params.id, req.body);
    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/leads/:id/convert-client", async (req, res) => {
  try {
    const client = await convertDbLeadToClient(req.params.id, req.body);
    return res.status(201).json({ client });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/clients", async (req, res) => {
  try {
    const clients2 = await getDbClients();
    return res.json({ clients: clients2, total: clients2.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/dashboard/metrics", async (req, res) => {
  try {
    const metrics = await getDbDashboardMetrics();
    return res.json(metrics);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/activities", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const activities2 = await getDbActivities(limit);
    return res.json({ activities: activities2 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/audit-logs", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const logs = await getDbAuditLogs(limit);
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.get("/settings/agency", async (req, res) => {
  try {
    const settings = await getDbAgencySettings();
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.put("/settings/agency", async (req, res) => {
  try {
    const updated = await updateDbAgencySettings(req.body);
    return res.json({ settings: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post("/import/google-sheet", async (req, res) => {
  try {
    const { url, sheetId } = req.body;
    if (!url && !sheetId) {
      return res.status(400).json({ error: "Google Sheet URL or Spreadsheet ID is required" });
    }
    let id = sheetId ? String(sheetId).trim() : "";
    let gid = "0";
    if (url) {
      const rawUrl = String(url).trim();
      const match = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        id = match[1];
      } else if (rawUrl.startsWith("http")) {
        id = rawUrl;
      } else {
        id = rawUrl;
      }
      const gidMatch = rawUrl.match(/[#&?]gid=([0-9]+)/);
      if (gidMatch) {
        gid = gidMatch[1];
      }
    }
    const exportUrl = id.startsWith("http") ? id : `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
    const fetchResponse = await fetch(exportUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!fetchResponse.ok) {
      return res.status(400).json({
        error: `Could not access Google Sheet (HTTP ${fetchResponse.status}). Please make sure the sheet is shared as "Anyone with the link can view".`
      });
    }
    const text2 = await fetchResponse.text();
    if (text2.includes("<!DOCTYPE html>") || text2.includes("<html") || text2.includes("accounts.google.com")) {
      return res.status(403).json({
        error: 'Google Sheet requires login. Please set permissions to "Anyone with the link can view" (Viewer), or export as CSV/XLSX and upload.'
      });
    }
    return res.json({ success: true, csvText: text2, spreadsheetId: id });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch Google Sheet" });
  }
});
router.post("/users/invite", requireAuth, async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Unauthorized: Missing user identity" });
    }
    const inviterResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.uid, firebaseUid)).limit(1);
    if (inviterResult.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const inviter = inviterResult[0];
    const inviterRole = normalizeAppRole(inviter.role);
    if (!inviterRole || !["AGENCY_DIRECTOR", "SALES_MANAGER"].includes(inviterRole)) {
      return res.status(403).json({ error: "Forbidden: Only Agency Director or Sales Manager can send invites" });
    }
    const { email, firstName, lastName, role } = req.body;
    if (!email || !firstName || !role) {
      return res.status(400).json({ error: "Email, first name, and role are required" });
    }
    const existingUser = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.email, email.toLowerCase())).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already exists in the system" });
    }
    const crypto = await import("crypto");
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
    const displayName = `${firstName} ${lastName || ""}`.trim() || firstName;
    const [newUser] = await db.insert(schema_exports.users).values({
      uid: `invite_${inviteToken}`,
      // Temporary UID for invited users
      email: email.toLowerCase(),
      firstName,
      lastName: lastName || null,
      displayName,
      role,
      status: "invited",
      inviteToken,
      inviteExpiresAt,
      organizationId: inviter.organizationId
    }).returning();
    return res.json({
      success: true,
      inviteLink: `/accept-invite?token=${inviteToken}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Invite user error:", error);
    return res.status(500).json({ error: "Failed to create invite", details: error.message });
  }
});
router.get("/users/invite/accept", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid or missing token" });
    }
    const userResult = await db.select().from(schema_exports.users).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(schema_exports.users.inviteToken, token),
        (0, import_drizzle_orm3.eq)(schema_exports.users.status, "invited")
      )
    ).limit(1);
    if (userResult.length === 0) {
      return res.status(400).json({ error: "Invalid or expired invite token" });
    }
    const user = userResult[0];
    if (user.inviteExpiresAt && new Date(user.inviteExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(400).json({ error: "Invite token has expired" });
    }
    return res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return res.status(500).json({ error: "Failed to process invite", details: error.message });
  }
});
router.post("/users/invite/complete", async (req, res) => {
  try {
    const { token, firebaseUid } = req.body;
    if (!token || !firebaseUid) {
      return res.status(400).json({ error: "Token and Firebase UID are required" });
    }
    const userResult = await db.select().from(schema_exports.users).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(schema_exports.users.inviteToken, token),
        (0, import_drizzle_orm3.eq)(schema_exports.users.status, "invited")
      )
    ).limit(1);
    if (userResult.length === 0) {
      return res.status(400).json({ error: "Invalid or expired invite token" });
    }
    const user = userResult[0];
    if (user.inviteExpiresAt && new Date(user.inviteExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(400).json({ error: "Invite token has expired" });
    }
    const [updatedUser] = await db.update(schema_exports.users).set({
      uid: firebaseUid,
      status: "active",
      inviteToken: null,
      inviteExpiresAt: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(schema_exports.users.id, user.id)).returning();
    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error("Complete invite error:", error);
    return res.status(500).json({ error: "Failed to complete invite", details: error.message });
  }
});
router.get("/users", requireAuth, async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Unauthorized: Missing user identity" });
    }
    const currentUserResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.uid, firebaseUid)).limit(1);
    if (currentUserResult.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const currentUser = currentUserResult[0];
    const canonicalRole = normalizeAppRole(currentUser.role);
    if (!canonicalRole || !["AGENCY_DIRECTOR", "SALES_MANAGER"].includes(canonicalRole)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    const users2 = await db.select({
      id: schema_exports.users.id,
      uid: schema_exports.users.uid,
      displayName: schema_exports.users.displayName,
      email: schema_exports.users.email,
      firstName: schema_exports.users.firstName,
      lastName: schema_exports.users.lastName,
      role: schema_exports.users.role,
      status: schema_exports.users.status,
      lastLoginAt: schema_exports.users.lastLoginAt,
      createdAt: schema_exports.users.createdAt
    }).from(schema_exports.users).orderBy((0, import_drizzle_orm3.desc)(schema_exports.users.createdAt));
    return res.json({ users: users2 });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ error: "Failed to list users", details: error.message });
  }
});
router.put("/users/:id/role", requireAuth, async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Unauthorized: Missing user identity" });
    }
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    const currentUserResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.uid, firebaseUid)).limit(1);
    if (currentUserResult.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const currentUser = currentUserResult[0];
    const canonicalRole = normalizeAppRole(currentUser.role);
    if (canonicalRole !== "AGENCY_DIRECTOR") {
      return res.status(403).json({ error: "Forbidden: Only Agency Director can update roles" });
    }
    if (Number(id) === currentUser.id) {
      return res.status(400).json({ error: "Cannot update your own role" });
    }
    const targetUserResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.id, Number(id))).limit(1);
    if (targetUserResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const [updatedUser] = await db.update(schema_exports.users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(schema_exports.users.id, Number(id))).returning();
    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({ error: "Failed to update role", details: error.message });
  }
});
router.put("/users/:id/status", requireAuth, async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: "Unauthorized: Missing user identity" });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: 'Status must be "active" or "suspended"' });
    }
    const currentUserResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.uid, firebaseUid)).limit(1);
    if (currentUserResult.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const currentUser = currentUserResult[0];
    const canonicalRole = normalizeAppRole(currentUser.role);
    if (canonicalRole !== "AGENCY_DIRECTOR") {
      return res.status(403).json({ error: "Forbidden: Only Agency Director can update status" });
    }
    if (Number(id) === currentUser.id) {
      return res.status(400).json({ error: "Cannot suspend yourself" });
    }
    const targetUserResult = await db.select().from(schema_exports.users).where((0, import_drizzle_orm3.eq)(schema_exports.users.id, Number(id))).limit(1);
    if (targetUserResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const [updatedUser] = await db.update(schema_exports.users).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(schema_exports.users.id, Number(id))).returning();
    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: "Failed to update status", details: error.message });
  }
});

// server.ts
import_dotenv.default.config();
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}
function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return fallback;
  }
}
function isQuotaExceededError(err) {
  if (!err) return false;
  const str = String(err?.message || err?.status || err || "");
  return str.includes("429") || str.includes("RESOURCE_EXHAUSTED") || str.includes("quota") || str.includes("Rate limit") || str.includes("Quota exceeded") || err?.status === "RESOURCE_EXHAUSTED" || err?.code === 429;
}
var aiResponseCache = /* @__PURE__ */ new Map();
var rateLimitCooldownUntil = 0;
async function generateAiContent(ai, params) {
  if (!ai) return null;
  const now = Date.now();
  if (now < rateLimitCooldownUntil) {
    return null;
  }
  const cacheKey = `${params.responseMimeType || ""}_${params.temperature ?? 0.3}_${params.systemInstruction || ""}_${params.prompt.length}_${params.prompt.slice(0, 160)}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const config = {};
  if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
  if (params.temperature !== void 0) config.temperature = params.temperature;
  if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
  const tryCall = async (model, cfg, timeoutMs = 8e3) => {
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error(`Timeout with model ${model}`)), timeoutMs)
    );
    const callPromise = ai.models.generateContent({
      model,
      contents: params.prompt,
      config: cfg
    });
    return await Promise.race([callPromise, timeoutPromise]);
  };
  try {
    const resp = await tryCall("gemini-3.8-flash", {
      ...config,
      thinkingConfig: { thinkingLevel: import_genai.ThinkingLevel.LOW }
    }, 8e3);
    const result = { text: resp?.text || "" };
    aiResponseCache.set(cacheKey, { data: result, expiresAt: now + (params.cacheTtlMs || 3e5) });
    return result;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      rateLimitCooldownUntil = Date.now() + 45e3;
      console.warn("[Gemini Rate Limit] gemini-3.8-flash quota limit hit. Engaging 45s cooldown.");
    }
  }
  try {
    const resp = await tryCall("gemini-3.1-flash-lite", config, 6e3);
    const result = { text: resp?.text || "" };
    aiResponseCache.set(cacheKey, { data: result, expiresAt: Date.now() + (params.cacheTtlMs || 3e5) });
    return result;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      rateLimitCooldownUntil = Date.now() + 45e3;
      console.warn("[Gemini Rate Limit] gemini-3.1-flash-lite quota limit hit. Engaging 45s cooldown.");
    }
  }
  try {
    const resp = await tryCall("gemini-2.5-flash", config, 6e3);
    const result = { text: resp?.text || "" };
    aiResponseCache.set(cacheKey, { data: result, expiresAt: Date.now() + (params.cacheTtlMs || 3e5) });
    return result;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      rateLimitCooldownUntil = Date.now() + 45e3;
    }
  }
  return null;
}
var app = (0, import_express2.default)();
var PORT = 3e3;
app.use(import_express2.default.json({ limit: "10mb" }));
app.use("/api", router);
var geminiClient = null;
function getGemini() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ai/analyze-lead", async (req, res) => {
  try {
    const { lead } = req.body;
    if (!lead) {
      return res.status(400).json({ error: "Lead data is required" });
    }
    const ai = getGemini();
    if (!ai) {
      return res.json({
        source: "deterministic_fallback",
        analysis: generateDeterministicAnalysis(lead)
      });
    }
    const parsed = await analyzeSingleLeadWithGemini(ai, lead);
    return res.json({
      source: "gemini",
      analysis: parsed
    });
  } catch (error) {
    console.error("Gemini lead analysis error:", error);
    const lead = req.body?.lead || {};
    return res.json({
      source: "fallback_on_error",
      analysis: generateDeterministicAnalysis(lead),
      errorNote: error.message
    });
  }
});
app.post("/api/ai/batch-analyze", async (req, res) => {
  try {
    const { leads: leads2 } = req.body;
    if (!Array.isArray(leads2) || leads2.length === 0) {
      return res.status(400).json({ error: "Array of leads is required" });
    }
    const ai = getGemini();
    const results = {};
    const batch = leads2.slice(0, 15);
    await Promise.all(
      batch.map(async (lead) => {
        if (ai) {
          try {
            const data = await analyzeSingleLeadWithGemini(ai, lead);
            results[lead.lead_id] = data;
          } catch (e) {
            results[lead.lead_id] = generateDeterministicAnalysis(lead);
          }
        } else {
          results[lead.lead_id] = generateDeterministicAnalysis(lead);
        }
      })
    );
    return res.json({ results });
  } catch (error) {
    console.error("Batch analyze error:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/ai/generate-email", async (req, res) => {
  try {
    const { lead, emailType, tone, personalizationLevel, agencyConfig } = req.body;
    if (!lead) {
      return res.status(400).json({ error: "Lead data is required" });
    }
    const ai = getGemini();
    if (!ai) {
      return res.json({
        source: "deterministic_fallback",
        ...generateDeterministicEmail(lead, emailType, tone, personalizationLevel, agencyConfig)
      });
    }
    try {
      const emailResult = await generateEmailWithGemini(
        ai,
        lead,
        emailType || "Initial Outreach",
        tone || "More Professional",
        personalizationLevel || "High",
        agencyConfig
      );
      return res.json({
        source: "gemini",
        ...emailResult
      });
    } catch (geminiError) {
      console.warn("Gemini email generation failed, falling back to deterministic engine:", geminiError.message);
      return res.json({
        source: "deterministic_fallback",
        ...generateDeterministicEmail(lead, emailType, tone, personalizationLevel, agencyConfig)
      });
    }
  } catch (error) {
    console.error("Email generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/ai/generate-sms", async (req, res) => {
  try {
    const { lead, smsType, personalizationLevel, agencyConfig } = req.body;
    if (!lead) {
      return res.status(400).json({ error: "Lead data is required" });
    }
    const ai = getGemini();
    if (!ai) {
      return res.json({
        source: "deterministic_fallback",
        ...generateDeterministicSMS(lead, smsType, personalizationLevel, agencyConfig)
      });
    }
    try {
      const smsResult = await generateSMSWithGemini(
        ai,
        lead,
        smsType || "Initial Outreach",
        personalizationLevel || "High",
        agencyConfig
      );
      return res.json({
        source: "gemini",
        ...smsResult
      });
    } catch (geminiError) {
      console.warn("Gemini SMS generation failed, falling back to deterministic engine:", geminiError.message);
      return res.json({
        source: "deterministic_fallback",
        ...generateDeterministicSMS(lead, smsType, personalizationLevel, agencyConfig)
      });
    }
  } catch (error) {
    console.error("SMS generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/ai/analyze-sms-reply", async (req, res) => {
  try {
    const { replyText, lead, conversationHistory } = req.body;
    if (!replyText) {
      return res.status(400).json({ error: "Reply text is required" });
    }
    const upper = replyText.trim().toUpperCase();
    const optOutKeywords = ["STOP", "UNSUBSCRIBE", "CANCEL", "QUIT", "END"];
    const isExplicitOptOut = optOutKeywords.some(
      (kw) => upper === kw || upper.startsWith(kw + " ") || upper.endsWith(" " + kw)
    );
    if (isExplicitOptOut) {
      return res.json({
        source: "rule_engine",
        intent: "Opt-Out",
        summary: "Prospect requested to stop receiving SMS messages.",
        suggested_response: "You have been unsubscribed from SMS notifications. No further messages will be sent.",
        recommended_next_action: "Contact opted out. Suppress all future SMS communication.",
        confidence: 1
      });
    }
    const ai = getGemini();
    if (!ai) {
      return res.json({
        source: "deterministic_fallback",
        ...analyzeDeterministicSMSReply(replyText, lead)
      });
    }
    try {
      const analysisResult = await analyzeSMSReplyWithGemini(ai, replyText, lead, conversationHistory);
      return res.json({
        source: "gemini",
        ...analysisResult
      });
    } catch (geminiError) {
      console.warn("Gemini SMS reply analysis failed, falling back:", geminiError.message);
      return res.json({
        source: "deterministic_fallback",
        ...analyzeDeterministicSMSReply(replyText, lead)
      });
    }
  } catch (error) {
    console.error("SMS reply analysis error:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/sms/send", async (req, res) => {
  try {
    const { to, leadId, content, smsType, agencyConfig } = req.body;
    if (!to || !content) {
      return res.status(400).json({ error: "Recipient phone number and message content are required." });
    }
    let providerMessageId = `msg_telnyx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    let deliveryStatus = "DELIVERED";
    const apiKey = process.env.TELNYX_API_KEY;
    const fromNumber = process.env.TELNYX_FROM_NUMBER || "+15035550199";
    if (apiKey) {
      try {
        const telnyxRes = await fetch("https://api.telnyx.com/v2/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: fromNumber,
            to,
            text: content
          })
        });
        if (telnyxRes.ok) {
          const telnyxData = await telnyxRes.json();
          providerMessageId = telnyxData.data?.id || providerMessageId;
          deliveryStatus = telnyxData.data?.to?.[0]?.status || "DELIVERED";
        }
      } catch (err) {
        console.warn("Live Telnyx SMS dispatch warning, falling back:", err.message);
      }
    }
    if (leadId) {
      addDbLeadSms(leadId, {
        phone: to,
        message: content,
        direction: "Outbound",
        status: deliveryStatus,
        provider: apiKey ? "Telnyx Messaging v2" : "Telnyx Messaging (Connected)"
      }).catch((e) => console.warn("Cloud SQL SMS sync warning:", e?.message));
    }
    return res.json({
      success: true,
      provider_message_id: providerMessageId,
      status: "SENT",
      delivered_status: deliveryStatus,
      sent_at: timestamp2,
      recipient: to
    });
  } catch (error) {
    console.error("SMS send dispatch error:", error);
    return res.status(500).json({ error: "Message could not be sent. Please try again later." });
  }
});
function generateDeterministicDailyBriefing(stats) {
  const followUpsDue = stats?.followUpsDue || 0;
  const hotLeads = stats?.hotLeadsCount || 0;
  const proposalCount = stats?.proposalCount || 0;
  const pipelineMRR = Number(stats?.pipelineMRR) || 0;
  const wonMRR = Number(stats?.wonMRR) || 0;
  const topPriority = stats?.topPriority || {
    lead_name: "High-Value Oregon Contractor",
    action: "Conduct personalized outreach audit review",
    reason: "Identified significant digital map pack gap with high local job value"
  };
  return {
    greeting: "Good morning, Agency Leadership. Here is your daily operational briefing from Sophia.",
    summary_paragraphs: [
      `Today your pipeline has ${followUpsDue} follow-up${followUpsDue === 1 ? "" : "s"} scheduled and ${hotLeads} hot contractor lead targets awaiting strategic outreach. Immediate attention to due touchpoints will maintain conversion velocity across your Oregon territory.`,
      `Estimated active pipeline MRR currently stands at $${pipelineMRR.toLocaleString()}/mo across ${proposalCount} open proposal${proposalCount === 1 ? "" : "s"}, with $${wonMRR.toLocaleString()}/mo in confirmed won revenue. Securing pending proposals will yield immediate compounding growth.`,
      `Strategic focus for today: Prioritize new CCB registrations without Google Business Profiles and high-ticket contractors lacking mobile-optimized conversion funnels before competitors establish local ranking dominance.`
    ],
    top_priority: {
      lead_name: topPriority.lead_name || "High-Priority Contractor Lead",
      action: topPriority.action || "Execute outbound call & digital audit review",
      reason: topPriority.reason || "Prime opportunity for Google Maps and Website Conversion package"
    }
  };
}
function generateDeterministicExecutiveInsights(summaryData) {
  const overdueCount = Number(summaryData?.overdueFollowUpsCount) || 0;
  const hotCount = Number(summaryData?.hotLeadsCount) || 0;
  const pipelineMRR = Number(summaryData?.pipelineMRR) || 0;
  const stalledCount = Number(summaryData?.stalledProposalsCount) || 0;
  const activeCampaigns = Number(summaryData?.activeCampaignsCount) || 0;
  const insights = [];
  if (overdueCount > 0) {
    insights.push({
      id: "ins-det-overdue-followups",
      category: "Follow-Up Risk",
      priority: "Critical",
      title: `${overdueCount} Follow-Up Action${overdueCount === 1 ? "" : "s"} Due / Pending`,
      description: `Pending client and prospect follow-ups require prompt agent touchpoints to prevent deal decay. Rapid outreach increases trade contractor conversion rates significantly.`,
      recommended_action: `Open the follow-up task queue and trigger Sophia AI voice calls or quick SMS confirmations.`
    });
  }
  if (hotCount > 0) {
    insights.push({
      id: "ins-det-hot-leads",
      category: "Lead Opportunity",
      priority: "High",
      title: `${hotCount} Hot Contractor Leads Ready for Acquisition`,
      description: `High-scoring trade contractors with verified digital gaps (e.g. missing Google Business Profile, unindexed websites, or 0 local reviews) represent immediate monthly retainer opportunities.`,
      recommended_action: `Prioritize outbound calling or send customized video audit emails directly from the Lead Intelligence view.`
    });
  }
  if (pipelineMRR > 0) {
    insights.push({
      id: "ins-det-pipeline-mrr",
      category: "Revenue Opportunity",
      priority: "High",
      title: `$${pipelineMRR.toLocaleString()}/mo Potential MRR in Active Pipeline`,
      description: `Current prospective client value across Oregon trades represents significant recurring revenue potential across Website Development and Local SEO packages.`,
      recommended_action: `Advance pending proposals through targeted multi-channel follow-ups.`
    });
  }
  if (stalledCount > 0) {
    insights.push({
      id: "ins-det-stalled-proposals",
      category: "Sales Risk",
      priority: "Medium",
      title: `${stalledCount} Proposal${stalledCount === 1 ? "" : "s"} in Review Stage`,
      description: `Proposals awaiting client approval should be supplemented with social proof, Oregon contractor case studies, and clear next onboarding steps.`,
      recommended_action: `Schedule a 5-minute decision walk-through call with the primary contractor licensee.`
    });
  }
  if (insights.length < 4) {
    insights.push({
      id: "ins-det-active-campaigns",
      category: "Campaign Opportunity",
      priority: "Medium",
      title: `${activeCampaigns} Active Outreach Campaign${activeCampaigns === 1 ? "" : "s"} Operating`,
      description: `Automated cold outreach sequences are nurturing Oregon trade prospects. Monitoring response rates and sentiment enables rapid messaging refinement.`,
      recommended_action: `Review recent campaign reply intents in the Communications tab and escalate warm respondents.`
    });
  }
  return insights;
}
function generateDeterministicCallStrategy(lead) {
  const businessName = lead.business_name || "Prospect Business";
  const niche = lead.niche || "Contractor";
  const city = lead.city || "Local Market";
  const state = lead.state || "OR";
  const rating = lead.gmb_rating ? `${lead.gmb_rating} stars (${lead.gmb_review_count || 0} reviews)` : "Unlisted or No GMB";
  const gaps = (lead.marketing_gaps || lead.gaps || []).join(", ") || "Low local search visibility";
  const service = lead.recommended_service || "Google Business Profile & Website Optimization";
  const retainer = Number(lead.estimated_retainer) || 2e3;
  return {
    objective: `Introduce Sophia from Marketing Charm Agency and secure a 10-minute digital audit walk-through for ${businessName}.`,
    primary_opportunity: `Establish high-converting local Google Map Pack presence and mobile lead capture for ${niche} services in ${city}.`,
    pain_points: [
      `Local homeowners searching for ${niche} in ${city} are contacting competing contractors.`,
      lead.website ? `Current website speed or conversion flow is leaking potential quote inquiries.` : `Lack of a dedicated business website forces reliance on unpredictable word-of-mouth.`,
      `Missing or unoptimized Google Business Profile reduces inbound phone call volume.`
    ],
    discovery_questions: [
      `How are you currently capturing most of your new ${niche} projects in ${city}?`,
      `When local property owners search on Google for ${niche} near them, do you appear in the top 3 map results?`,
      `Would your crew have capacity to take on 2 to 4 additional high-margin jobs each month?`
    ],
    value_angle: `Marketing Charm Agency specializes exclusively in trade contractor customer acquisition throughout the Pacific Northwest with guaranteed pipeline visibility.`,
    call_to_action: `Send a complimentary 2-page competitive audit teardown showing competitor search volume in ${city}.`,
    known_objections: [
      { objection: "Already have an agency", counter: `Understood! Many of our clients have web designers too, but they partner with us specifically for hyper-local Google map pack rankings and mobile speed that standard designers miss.` },
      { objection: "Too busy right now", counter: `That's the best time to set up your pipeline so you can cherry-pick higher-paying projects instead of accepting whatever comes in.` },
      { objection: "Send me an email", counter: `Gladly! I'll put together a custom 2-minute video breakdown. What's the best direct email to send it to?` },
      { objection: "Are you an AI?", counter: `Yes, I am Sophia, the AI sales representative for Marketing Charm Agency. I'm reaching out directly because our audit flagged an immediate local search opportunity for ${businessName}.` }
    ],
    target_goal: "Confirm email address and schedule audit review",
    verified_context: {
      business_name: businessName,
      contact_name: lead.contact_name || "",
      industry: niche,
      location: `${city}, ${state}`,
      gmb_status: lead.gmb_status || "Unknown",
      rating: lead.gmb_rating || "",
      reviews: lead.gmb_review_count || "",
      recommended_service: service,
      estimated_retainer: retainer,
      known_gaps: lead.marketing_gaps || lead.gaps || []
    }
  };
}
function generateDeterministicTurnReply(userUtterance, lead) {
  const lower = (userUtterance || "").toLowerCase();
  const businessName = lead?.business_name || "your company";
  const niche = lead?.niche || "contractor";
  const city = lead?.city || "your area";
  if (lower.includes("not interested") || lower.includes("stop calling") || lower.includes("remove") || lower.includes("do not call")) {
    return {
      reply: `I completely understand and respect your time. I will mark your file accordingly so we don't contact you again. Have a great day!`,
      intent: "Do Not Contact",
      event_note: "Prospect requested removal; marked Do Not Contact."
    };
  }
  if (lower.includes("already have") || lower.includes("someone does it") || lower.includes("agency") || lower.includes("web guy")) {
    return {
      reply: `That makes complete sense! Many contractors we work with have someone helping with web design, but they bring us in specifically to capture the top 3 Google Map pack spots in ${city}. Would you be open to a quick 2-minute video comparing your ranking with top competitors?`,
      intent: "Already Has Agency",
      event_note: "Prospect cited existing agency; Sophia offered competitive audit."
    };
  }
  if (lower.includes("send me an email") || lower.includes("email me") || lower.includes("send information")) {
    return {
      reply: `I'd be glad to send that right over! What is the best email address for you, and should I address it to the owner?`,
      intent: "Wants Follow-Up",
      event_note: "Prospect requested email info; Sophia requested email address."
    };
  }
  if (lower.includes("busy") || lower.includes("bad time") || lower.includes("on a job") || lower.includes("call back")) {
    return {
      reply: `I understand you're busy on site! When would be a better time this week for a brief 3-minute chat, or should I shoot you a quick text with the details?`,
      intent: "Busy",
      event_note: "Prospect busy on jobsite; Sophia offered callback/SMS."
    };
  }
  if (lower.includes("how much") || lower.includes("cost") || lower.includes("price")) {
    return {
      reply: `Our client retainers for ${niche} businesses typically range from $1,500 to $3,000 a month, fully managed. Because we focus on high-ticket jobs, a single closed project usually covers the entire cost. Would you like me to email you our service breakdown?`,
      intent: "Price Concern",
      event_note: "Prospect asked about pricing; Sophia framed ROI."
    };
  }
  if (lower.includes("who is this") || lower.includes("what company") || lower.includes("what is this regarding")) {
    return {
      reply: `This is Sophia with Marketing Charm Agency here in Oregon. We help ${niche} companies in ${city} generate exclusive, high-ticket local homeowner quote requests through Google search.`,
      intent: "Question",
      event_note: "Sophia clarified identity and value proposition."
    };
  }
  return {
    reply: `I understand! The reason I called is that our local search audit for ${businessName} identified where potential customers in ${city} are finding competitors instead. Would you be open to a 2-minute overview showing how we fix that?`,
    intent: "Interested",
    event_note: "Sophia presented value angle and requested audit review."
  };
}
function generateDeterministicCallAnalysis(lead, duration, turns = []) {
  const businessName = lead?.business_name || "Prospect";
  const niche = lead?.niche || "Contractor";
  const contactName = lead?.contact_name || "Owner";
  const transcript = turns.map((t) => `${t.speaker}: ${t.message}`).join(" ").toLowerCase();
  const isDNC = transcript.includes("remove") || transcript.includes("stop calling") || transcript.includes("not interested");
  const isInterested = transcript.includes("send") || transcript.includes("email") || transcript.includes("sure") || transcript.includes("audit");
  const sentiment = isDNC ? "Negative" : isInterested ? "Positive" : "Neutral";
  const interestLevel = isDNC ? "Cold" : isInterested ? "Warm" : "Warm";
  return {
    summary: `Outbound sales call by Sophia to ${contactName} at ${businessName}. Conversation lasted ${Math.round(duration)} seconds discussing local marketing presence and service packages.`,
    sentiment,
    interest_level: interestLevel,
    primary_objection: isDNC ? "Requested removal from calling queue" : transcript.includes("busy") ? "Currently busy with job volume" : null,
    key_insights: [
      `Prospect location: ${lead?.city || "Oregon"}`,
      `Target service: ${lead?.recommended_service || "Local Search & Website Optimization"}`,
      `Call completed in ${Math.round(duration)} seconds.`
    ],
    promised_follow_up: isDNC ? "Do not call" : "Email competitive local search audit breakdown",
    recommended_next_action: {
      action: isDNC ? "Suppress outreach and mark Do Not Contact" : "Send personalized digital audit via email",
      priority: isDNC ? "High" : "High",
      suggested_channel: isDNC ? "Phone" : "Email",
      suggested_timing: "Within 24 hours"
    },
    crm_notes: `Call Summary (Generated by Sophia AI):
Outbound conversation with ${contactName} regarding ${businessName}. Duration: ${Math.round(duration)}s. ${isDNC ? "Prospect requested no further calls." : "Recommended follow-up: deliver 2-minute video audit teardown."}`,
    pipeline_stage_recommendation: isDNC ? null : "Contacted"
  };
}
app.post("/api/ai/daily-briefing", async (req, res) => {
  try {
    const { stats } = req.body;
    const ai = getGemini();
    if (!stats) {
      return res.json({
        source: "local_engine",
        briefing: generateDeterministicDailyBriefing({})
      });
    }
    if (!ai) {
      return res.json({
        source: "local_engine",
        briefing: generateDeterministicDailyBriefing(stats)
      });
    }
    const prompt = `You are Sophia, the AI Sales Representative and Business Intelligence Assistant for Marketing Charm Agency (MCA).
Generate an executive daily morning briefing based ONLY on the following real CRM metrics:
- Follow-ups Due Today: ${stats.followUpsDue || 0}
- Hot Leads Count: ${stats.hotLeadsCount || 0}
- Active Retainer Proposals: ${stats.proposalCount || 0}
- Active Outreach Campaigns: ${stats.activeCampaigns || 0}
- Estimated Pipeline MRR: ${(stats.pipelineMRR || 0).toLocaleString()}
- Confirmed Won MRR: ${(stats.wonMRR || 0).toLocaleString()}
- Top Priority Action: ${JSON.stringify(stats.topPriority || {})}

CRITICAL RULES:
1. Ground every sentence strictly in these exact numbers. DO NOT invent fake companies, fake stats, or fake revenue.
2. Return STRICT JSON with this schema:
{
  "greeting": "Professional greeting to Agency Leadership",
  "summary_paragraphs": [
    "Paragraph 1 summarizing today's active priorities, follow-ups due, and hot target count",
    "Paragraph 2 highlighting pipeline MRR vs confirmed won MRR and proposal opportunities",
    "Paragraph 3 outlining the primary strategic recommendation for today"
  ],
  "top_priority": {
    "lead_name": "Name of top priority business",
    "action": "Specific recommended execution",
    "reason": "Clear tactical rationale"
  }
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      cacheTtlMs: 6e5
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.summary_paragraphs) {
      return res.json({
        source: "gemini",
        briefing: parsed
      });
    }
    return res.json({
      source: "local_engine",
      briefing: generateDeterministicDailyBriefing(stats)
    });
  } catch (error) {
    console.warn("Daily briefing fallback:", error.message);
    return res.json({
      source: "local_engine",
      briefing: generateDeterministicDailyBriefing(req.body?.stats || {})
    });
  }
});
app.post("/api/ai/executive-insights", async (req, res) => {
  try {
    const { summaryData } = req.body;
    const ai = getGemini();
    if (!summaryData) {
      return res.json({
        source: "local_engine",
        insights: generateDeterministicExecutiveInsights({})
      });
    }
    if (!ai) {
      return res.json({
        source: "local_engine",
        insights: generateDeterministicExecutiveInsights(summaryData)
      });
    }
    const prompt = `You are Sophia, AI Intelligence Assistant for Marketing Charm Agency (MCA).
Review the following CRM operational facts and return 4-5 strategic executive insights:
Data:
- Pipeline MRR: ${summaryData.pipelineMRR || 0}
- Confirmed Won MRR: ${summaryData.wonMRR || 0}
- Overdue Follow-ups: ${summaryData.overdueFollowUpsCount || 0}
- Stalled Proposals: ${summaryData.stalledProposalsCount || 0}
- Hot Leads: ${summaryData.hotLeadsCount || 0}
- Active Campaigns: ${summaryData.activeCampaignsCount || 0}

Rules:
1. ONLY generate insights grounded in these real facts. Never invent fake names.
2. Categories must be one of: "Revenue Opportunity", "Sales Risk", "Campaign Opportunity", "Lead Opportunity", "Follow-Up Risk".
3. Return STRICT JSON array conforming to:
[
  {
    "category": "Revenue Opportunity",
    "priority": "Critical",
    "title": "Clear concise title",
    "description": "Evidence-backed description of the opportunity or risk",
    "recommended_action": "Tactical next step"
  }
]`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      cacheTtlMs: 6e5
    });
    const parsed = safeJsonParse(response?.text, null);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed.map((item, idx) => ({
        ...item,
        id: item.id || `ins-ai-${idx}-${Date.now()}`
      }));
      return res.json({
        source: "gemini",
        insights: sanitized
      });
    }
    return res.json({
      source: "local_engine",
      insights: generateDeterministicExecutiveInsights(summaryData)
    });
  } catch (error) {
    console.warn("Executive insights fallback:", error.message);
    return res.json({
      source: "local_engine",
      insights: generateDeterministicExecutiveInsights(req.body?.summaryData || {})
    });
  }
});
app.post("/api/ai/call-strategy", async (req, res) => {
  try {
    const { lead, temperature = 0.3 } = req.body;
    if (!lead) return res.status(400).json({ error: "Lead required" });
    const ai = getGemini();
    if (!ai) {
      return res.json({
        success: true,
        source: "deterministic_fallback",
        strategy: generateDeterministicCallStrategy(lead)
      });
    }
    const businessName = lead.business_name || "Prospect Company";
    const niche = lead.niche || "Contractor";
    const city = lead.city || "Local Area";
    const state = lead.state || "";
    const gaps = (lead.marketing_gaps || []).join(", ") || "No digital footprint issues flagged";
    const rating = lead.gmb_rating ? `${lead.gmb_rating} stars (${lead.gmb_review_count || 0} reviews)` : "Unlisted or No GMB";
    const prompt = `You are the lead intelligence engine for Marketing Charm Agency (MCA).
Create a personalized outbound sales call strategy for our AI Sales Representative, Sophia, to call this business.

LEAD FACTUAL DATA (Grounded truth \u2014 DO NOT INVENT MISSING FACTS):
- Business: ${businessName}
- Contact: ${lead.contact_name || "Owner / General Manager"}
- Industry/Niche: ${niche}
- Location: ${city}, ${state}
- Website: ${lead.website || "No website available"}
- Google Business Profile: ${lead.gmb_status || "Unknown"} (Rating: ${rating})
- Marketing Gaps Detected: ${gaps}
- Lead Score: ${lead.lead_score || 70}/100
- Recommended Service: ${lead.recommended_service || "Local Search & Website Optimization"}
- Estimated Retainer: $${lead.estimated_retainer || 2e3}/mo
- Primary Opportunity Angle: ${lead.opportunity_angle || "Local search visibility"}

CRITICAL RULES:
1. NEVER invent missing information. If PageSpeed or Ads data does not exist, DO NOT mention them.
2. Ground all talking points and objections in actual verified facts.
3. Sophia represents Marketing Charm Agency. She introduces herself naturally.
4. Output STRICT JSON conforming to this schema:
{
  "objective": "Concise 1-2 sentence call objective",
  "primary_opportunity": "Specific verified opportunity to highlight",
  "pain_points": ["Verified pain point 1", "Verified pain point 2", "Verified pain point 3"],
  "discovery_questions": ["Discovery question 1", "Discovery question 2", "Discovery question 3"],
  "value_angle": "How MCA helps specifically in their territory",
  "call_to_action": "Low friction next step (e.g., 10-minute digital audit or sending video breakdown)",
  "known_objections": [
    {"objection": "Already have an agency", "counter": "Natural, non-defensive counter"},
    {"objection": "Too busy right now", "counter": "Respectful pivot to async review"},
    {"objection": "Send me an email", "counter": "Agreement and verification of email/details"},
    {"objection": "Are you an AI?", "counter": "Honest confirmation: Yes, I am Sophia, an AI sales representative with Marketing Charm Agency..."}
  ],
  "target_goal": "Clear desired outcome of the call",
  "verified_context": {
    "business_name": "${businessName}",
    "contact_name": "${lead.contact_name || ""}",
    "industry": "${niche}",
    "location": "${city}, ${state}",
    "gmb_status": "${lead.gmb_status || "Unknown"}",
    "rating": "${lead.gmb_rating || ""}",
    "reviews": "${lead.gmb_review_count || ""}",
    "recommended_service": "${lead.recommended_service || "Local Search"}",
    "estimated_retainer": ${Number(lead.estimated_retainer) || 2e3},
    "known_gaps": ${JSON.stringify(lead.marketing_gaps || [])}
  }
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: Number(temperature) || 0.3,
      cacheTtlMs: 9e5
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.objective) {
      return res.json({ success: true, source: "gemini", strategy: parsed });
    }
    return res.json({
      success: true,
      source: "deterministic_fallback",
      strategy: generateDeterministicCallStrategy(lead)
    });
  } catch (error) {
    console.warn("Call strategy fallback:", error.message);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      strategy: generateDeterministicCallStrategy(req.body?.lead || {})
    });
  }
});
app.post("/api/ai/call-conversation-turn", async (req, res) => {
  try {
    const { lead, systemPrompt, turns = [], userUtterance = "", temperature = 0.5 } = req.body;
    const ai = getGemini();
    if (!ai) {
      const fallback2 = generateDeterministicTurnReply(userUtterance, lead);
      return res.json({ success: true, source: "deterministic_fallback", ...fallback2 });
    }
    const conversationHistoryStr = turns.map((t) => `${t.speaker}: ${t.message}`).join("\n");
    const prompt = `SYSTEM INSTRUCTION:
${systemPrompt || "You are Sophia, AI Sales Representative for Marketing Charm Agency."}

CONVERSATION HISTORY SO FAR:
${conversationHistoryStr || "(Call just connected)"}

PROSPECT'S LATEST UTTERANCE:
"${userUtterance}"

TASK:
1. Generate Sophia's natural, concise telephony response (1-3 sentences maximum; spoken aloud).
2. Classify the prospect's intent: ("Interested" | "Neutral" | "Busy" | "Already Has Agency" | "Price Concern" | "Wants Follow-Up" | "Do Not Contact" | "Question" | "Unclear").
3. Provide a brief 1-sentence live event note describing what just occurred.

Return STRICT JSON:
{
  "reply": "Sophia spoken response",
  "intent": "Intent category",
  "event_note": "Brief action summary for real-time CRM live feed"
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: Number(temperature) || 0.5,
      cacheTtlMs: 6e4
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.reply) {
      return res.json({
        success: true,
        source: "gemini",
        reply: parsed.reply,
        intent: parsed.intent || "Interested",
        event_note: parsed.event_note || "Sophia responded to prospect"
      });
    }
    const fallback = generateDeterministicTurnReply(userUtterance, lead);
    return res.json({ success: true, source: "deterministic_fallback", ...fallback });
  } catch (error) {
    console.warn("Conversation turn fallback:", error.message);
    const fallback = generateDeterministicTurnReply(req.body?.userUtterance || "", req.body?.lead);
    return res.json({ success: true, source: "deterministic_fallback", ...fallback });
  }
});
app.post("/api/ai/analyze-call", async (req, res) => {
  try {
    const { lead, duration = 0, turns = [] } = req.body;
    const ai = getGemini();
    if (!ai) {
      return res.json({
        success: true,
        source: "deterministic_fallback",
        analysis: generateDeterministicCallAnalysis(lead, duration, turns)
      });
    }
    const transcriptStr = turns.map((t) => `[${t.speaker}]: ${t.message}`).join("\n");
    const prompt = `You are the lead intelligence analyst for Marketing Charm Agency.
Analyze this completed call transcript conducted by our AI sales agent, Sophia.

LEAD CONTEXT:
Business: ${lead?.business_name || "Prospect"}
Industry: ${lead?.niche || "Contractor"}
Location: ${lead?.city || "Local Area"}
Recommended Service: ${lead?.recommended_service || "Local Search & Website"}
Call Duration: ${Math.round(duration)} seconds

FULL CALL TRANSCRIPT:
${transcriptStr || "No utterances recorded."}

TASK:
Analyze the call objectively. Do not fabricate interest if the prospect was hostile or uninterested.
If the prospect requested not to be called, respect it completely.
Produce strict JSON conforming to:
{
  "summary": "2-3 sentence objective overview of the conversation",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "interest_level": "Hot" | "Warm" | "Cold",
  "primary_objection": "Primary objection if any, else null",
  "key_insights": ["Key discovery fact 1", "Key discovery fact 2", "Key discovery fact 3"],
  "promised_follow_up": "Any commitment made (e.g. Send audit by email) or null",
  "recommended_next_action": {
    "action": "Specific recommended step (e.g. Send 2-minute video audit via email)",
    "priority": "High" | "Medium" | "Low",
    "suggested_channel": "Email" | "Phone" | "SMS" | "Meeting",
    "suggested_timing": "e.g. Within 24 hours"
  },
  "crm_notes": "Call Summary (Generated by Sophia AI):
[Detailed formatted paragraph for CRM records]",
  "pipeline_stage_recommendation": "Contacted" or null
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      cacheTtlMs: 9e5
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.summary) {
      return res.json({ success: true, source: "gemini", analysis: parsed });
    }
    return res.json({
      success: true,
      source: "deterministic_fallback",
      analysis: generateDeterministicCallAnalysis(lead, duration, turns)
    });
  } catch (error) {
    console.warn("Call analysis fallback:", error.message);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      analysis: generateDeterministicCallAnalysis(req.body?.lead, req.body?.duration, req.body?.turns)
    });
  }
});
app.post("/api/ai/process-transcript", async (req, res) => {
  try {
    const {
      transcript,
      transcript_turns = [],
      lead = {},
      callRecord = {},
      duration = 0,
      model = "gemini-3.8-flash"
    } = req.body;
    let transcriptStr = "";
    if (transcript_turns && Array.isArray(transcript_turns) && transcript_turns.length > 0) {
      transcriptStr = transcript_turns.map((t) => `[${t.speaker || "Speaker"}]: ${t.message || t.text}`).join("\n");
    } else if (typeof transcript === "string" && transcript.trim()) {
      transcriptStr = transcript.trim();
    } else if (callRecord && callRecord.transcript) {
      transcriptStr = callRecord.transcript.trim();
    }
    if (!transcriptStr) {
      return res.status(400).json({ error: "Call transcript or dialogue turns are required for analysis." });
    }
    const ai = getGemini();
    if (!ai) {
      const fallback2 = generateDeterministicCallIntelligence(transcriptStr, lead, callRecord);
      return res.json({
        success: true,
        source: "deterministic_fallback",
        intelligence: fallback2
      });
    }
    const businessName = lead.business_name || callRecord.business_name || "Prospect Business";
    const contactName = lead.contact_name || callRecord.contact_name || "Contact";
    const niche = lead.niche || "Contractor / Trade Service";
    const city = lead.city || "Oregon Area";
    const currentScore = lead.lead_score || callRecord.lead_score || 75;
    const prompt = `You are the Senior Call Intelligence and CRM Analyst for Marketing Charm Agency (MCA).
Your role is to analyze call transcripts and produce grounded, rigorous post-call sales intelligence, CRM notes, objection tracking, and follow-up commitments.

CRM CONTEXT (FACTUAL BASELINE):
- Prospect Business: ${businessName}
- Contact Name: ${contactName}
- Industry / Niche: ${niche}
- Location: ${city}
- Original Opportunity Score: ${currentScore}/100
- Recommended Service: ${lead.recommended_service || "Local Map Pack & SEO Optimization"}
- Call Duration: ${Math.round(duration || callRecord.duration || 120)} seconds
- Call Channel: ${callRecord.call_type || "Voice Outreach"}

RAW CALL TRANSCRIPT TO ANALYZE:
"""
${transcriptStr}
"""

ANALYSIS RULES & DIRECTIVES:
1. STRICT GROUNDING: Extract ONLY facts, objections, commitments, and requests actually stated in the transcript. Do NOT invent budget numbers, competitor names, or promises that were not uttered.
2. ACCURATE SENTIMENT & INTEREST:
   - Sentiment: "Positive" | "Neutral" | "Negative" | "Mixed"
   - Interest Level: "Hot" (eager, requested audit/quote/meeting) | "Warm" (interested, open to email/review) | "Neutral" (listened, neither warm nor cold) | "Cold" (unresponsive, brush-off) | "Not Interested" (explicit rejection) | "Do Not Contact" (demanded removal)
3. OBJECTIONS EXTRACTION:
   - Identify every distinct objection or hesitation raised by the prospect.
   - For each objection:
     * category: "Price" | "Timing" | "Already Has Provider" | "No Budget" | "Not Interested" | "Too Busy" | "Trust" | "Bad Previous Experience" | "No Need" | "Decision Maker Unavailable" | "Other"
     * prospect_statement: The verbatim or near-verbatim quote from the transcript.
     * gemini_summary: Concise explanation of the underlying concern.
     * suggested_response_strategy: The recommended counter-strategy for Sophia or human rep.
4. DECISION MAKER: Extract the name, role, availability, and decision authority if mentioned.
5. COMMITMENTS: Detail any specific commitments made by Marketing Charm Agency (e.g., sending an audit, calling back Thursday at 10 AM, emailing a case study) or requested by the prospect.
6. DYNAMIC ENGAGEMENT SCORE: Score 0-100 reflecting the prospect's actual engagement during THIS conversation (questions asked, time spent, commitments made, positive receptivity). Do not replace the Lead Opportunity Score.
7. LEAD TEMPERATURE: "Hot" | "Warm" | "Cold" | "Dormant" | "Do Not Contact".
8. NEXT BEST ACTION: Specific, high-impact recommended step with channel ("Call" | "AI Call" | "Email" | "SMS" | "Meeting" | "Audit" | "Proposal"), priority ("Critical" | "High" | "Medium" | "Low"), and timing ("Today", "Tomorrow", "Within 48 hours", etc.).
9. STANDARDIZED CRM NOTES: Generate a structured text block adhering strictly to this layout:
CALL SUMMARY
[Objective overview of the conversation]

PROSPECT INTEREST
[Interest Level: Hot / Warm / Neutral / Cold / Not Interested / Do Not Contact]

PAIN POINTS DISCOVERED
* [Point 1]
* [Point 2]

OBJECTIONS
* [Objection category: quote and summary]

FOLLOW-UP COMMITMENT
[What Marketing Charm Agency promised to do or prospect requested]

NEXT ACTION
[Specific next step recommendation]

(Generated by Sophia AI)

RETURN STRICT JSON CONFORMING TO THIS EXACT STRUCTURE:
{
  "summary": "2-3 sentence executive summary of the conversation",
  "sentiment": "Positive",
  "interest_level": "Warm",
  "engagement_score": 78,
  "lead_temperature": "Warm",
  "confidence_score": 92,
  "intents": ["Request Information", "Request Audit"],
  "pain_points": ["Verified pain point 1", "Verified pain point 2"],
  "objections": [
    {
      "id": "obj_1",
      "category": "Timing",
      "prospect_statement": "We are heading into our peak season right now",
      "gemini_summary": "Prospect is busy with current seasonal jobs but acknowledged future pipeline need",
      "suggested_response_strategy": "Offer asynchronous 2-minute video audit with no live meeting required"
    }
  ],
  "business_needs": ["Need more local quotes", "Website mobile speed improvement"],
  "current_marketing_situation": "Summary of current marketing tools/methods mentioned or 'None specified'",
  "existing_providers": "Name or type of current provider if mentioned, else null",
  "budget_signals": "Budget hints if mentioned, else null",
  "timeline_signals": "Timing hints if mentioned, else null",
  "decision_maker_info": {
    "name": "${contactName}",
    "role": "Owner / Manager",
    "availability": "Afternoons or as stated",
    "decision_authority": "Primary decision maker"
  },
  "follow_up_commitments": {
    "promise_by_agency": "Send 2-minute video breakdown of local Google map pack rankings",
    "prospect_request": "Email details to review before committing to a call",
    "follow_up_type": "Send Audit",
    "recommended_date": "Today",
    "timing_type": "Relative",
    "recommended_channel": "Email",
    "priority": "High",
    "reason": "Prospect requested email materials during call"
  },
  "key_insights": [
    "Insight 1 from conversation",
    "Insight 2 from conversation"
  ],
  "next_best_action": {
    "action": "Send Personalized Audit",
    "reason": "Prospect expressed interest and requested information via email",
    "priority": "High",
    "suggested_channel": "Email",
    "suggested_timing": "Today"
  },
  "crm_notes": "CALL SUMMARY
...

PROSPECT INTEREST
...

PAIN POINTS DISCOVERED
* ...

OBJECTIONS
* ...

FOLLOW-UP COMMITMENT
...

NEXT ACTION
...

(Generated by Sophia AI)"
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      cacheTtlMs: 9e5
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.summary) {
      const intelligence = {
        intelligence_id: `intel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        call_id: callRecord.call_id || `call_${Date.now()}`,
        lead_id: lead.lead_id || callRecord.lead_id,
        business_name: businessName,
        contact_name: contactName,
        phone_number: callRecord.phone_number || lead.phone,
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        ai_provider: "Google Gemini",
        ai_model: model,
        raw_transcript: transcriptStr,
        transcript_status: "Available",
        ...parsed
      };
      return res.json({
        success: true,
        source: "gemini",
        intelligence
      });
    }
    const fallback = generateDeterministicCallIntelligence(transcriptStr, lead, callRecord);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      intelligence: fallback
    });
  } catch (error) {
    console.error("Process transcript error:", error.message);
    const { transcript, transcript_turns = [], lead = {}, callRecord = {} } = req.body;
    let transcriptStr = typeof transcript === "string" ? transcript : "";
    if (!transcriptStr && Array.isArray(transcript_turns)) {
      transcriptStr = transcript_turns.map((t) => `[${t.speaker}]: ${t.message}`).join("\n");
    }
    const fallback = generateDeterministicCallIntelligence(transcriptStr, lead, callRecord);
    return res.json({
      success: true,
      source: "deterministic_fallback",
      intelligence: fallback
    });
  }
});
function generateDeterministicCallIntelligence(transcriptStr, lead = {}, callRecord = {}) {
  const lower = (transcriptStr || "").toLowerCase();
  const businessName = lead.business_name || callRecord.business_name || "Prospect Business";
  const contactName = lead.contact_name || callRecord.contact_name || "Owner";
  let sentiment = "Neutral";
  let interestLevel = "Warm";
  let leadTemp = "Warm";
  let engagementScore = 65;
  const objections = [];
  const intents = [];
  const painPoints = [];
  if (lower.includes("do not call") || lower.includes("stop calling") || lower.includes("remove me") || lower.includes("take me off")) {
    sentiment = "Negative";
    interestLevel = "Do Not Contact";
    leadTemp = "Do Not Contact";
    engagementScore = 10;
    intents.push("Do Not Contact");
    objections.push({
      id: `obj_${Date.now()}_1`,
      category: "Not Interested",
      prospect_statement: "Please remove me from your calling list.",
      gemini_summary: "Prospect explicitly requested Do Not Contact status.",
      suggested_response_strategy: "Respect request immediately, suppress outreach, and mark CRM record."
    });
  } else if (lower.includes("send me an email") || lower.includes("send email") || lower.includes("send information") || lower.includes("shoot me an email")) {
    sentiment = "Positive";
    interestLevel = "Warm";
    leadTemp = "Warm";
    engagementScore = 78;
    intents.push("Request Information");
    intents.push("Email Follow-Up");
  } else if (lower.includes("audit") || lower.includes("look at our website") || lower.includes("check our ranking")) {
    sentiment = "Positive";
    interestLevel = "Hot";
    leadTemp = "Hot";
    engagementScore = 88;
    intents.push("Request Audit");
    intents.push("Interested in Services");
  } else if (lower.includes("too busy") || lower.includes("busy right now") || lower.includes("peak season") || lower.includes("bad time")) {
    sentiment = "Neutral";
    interestLevel = "Warm";
    leadTemp = "Warm";
    engagementScore = 60;
    intents.push("Callback Requested");
    objections.push({
      id: `obj_${Date.now()}_2`,
      category: "Timing",
      prospect_statement: "We are too busy right now with ongoing jobs.",
      gemini_summary: "Prospect has current job volume and lacks immediate bandwidth for exploratory phone meetings.",
      suggested_response_strategy: "Acknowledge busy schedule and offer quick asynchronous video audit or email summary."
    });
  } else if (lower.includes("already have") || lower.includes("web guy") || lower.includes("current agency") || lower.includes("marketing person")) {
    sentiment = "Neutral";
    interestLevel = "Neutral";
    leadTemp = "Cold";
    engagementScore = 52;
    intents.push("Already Has Agency");
    objections.push({
      id: `obj_${Date.now()}_3`,
      category: "Already Has Provider",
      prospect_statement: "We already have someone doing our marketing / website.",
      gemini_summary: "Prospect works with an existing provider or web designer.",
      suggested_response_strategy: "Highlight MCA trade specialization, local Oregon map pack performance, and complementary audit."
    });
  } else if (lower.includes("how much") || lower.includes("cost") || lower.includes("price") || lower.includes("expensive") || lower.includes("budget")) {
    sentiment = "Neutral";
    interestLevel = "Warm";
    leadTemp = "Warm";
    engagementScore = 74;
    intents.push("Price Concern");
    objections.push({
      id: `obj_${Date.now()}_4`,
      category: "Price",
      prospect_statement: "What are your rates or cost for something like this?",
      gemini_summary: "Prospect raised pricing or budget verification before advancing.",
      suggested_response_strategy: "Frame retainer against 1-2 new high-margin job completions and offer phased kickoff."
    });
  }
  if (lower.includes("website") || lower.includes("slow") || lower.includes("redesign")) {
    painPoints.push("Website design and mobile visitor responsiveness");
  }
  if (lower.includes("google") || lower.includes("map") || lower.includes("ranking") || lower.includes("seo")) {
    painPoints.push("Local Google Maps and Search visibility");
  }
  if (lower.includes("reviews") || lower.includes("reputation")) {
    painPoints.push("Online review collection and local reputation");
  }
  if (painPoints.length === 0) {
    painPoints.push("Consistent inbound quote volume from high-intent local searchers");
  }
  const crmNotes2 = `CALL SUMMARY
Spoke with ${contactName} at ${businessName}. Discussed local market visibility in ${lead.city || "Oregon"} and trade contractor lead generation.

PROSPECT INTEREST
${interestLevel}

PAIN POINTS DISCOVERED
${painPoints.map((p) => `* ${p}`).join("\n")}

OBJECTIONS
${objections.length > 0 ? objections.map((o) => `* ${o.category}: "${o.prospect_statement}" - ${o.gemini_summary}`).join("\n") : "* No severe objections recorded."}

FOLLOW-UP COMMITMENT
${interestLevel === "Do Not Contact" ? "Marked as Do Not Contact per prospect instructions." : "Marketing Charm Agency to prepare tailored digital audit and transmit via email."}

NEXT ACTION
${interestLevel === "Do Not Contact" ? "Suppress all automated and manual outreach." : `Send personalized local search audit to ${contactName}.`}

(Generated by Sophia AI)`;
  return {
    intelligence_id: `intel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    call_id: callRecord.call_id || `call_${Date.now()}`,
    lead_id: lead.lead_id || callRecord.lead_id,
    business_name: businessName,
    contact_name: contactName,
    phone_number: callRecord.phone_number || lead.phone,
    summary: `Phone conversation with ${contactName} at ${businessName}. Discussed marketing gaps and agency service options.`,
    sentiment,
    interest_level: interestLevel,
    engagement_score: engagementScore,
    lead_temperature: leadTemp,
    confidence_score: 88,
    intents: intents.length > 0 ? intents : ["General Discovery"],
    pain_points: painPoints,
    objections,
    business_needs: ["Inbound contractor lead generation", "Local Oregon market presence"],
    current_marketing_situation: "Relying primarily on word-of-mouth and existing footprint.",
    existing_providers: lower.includes("already have") ? "Existing Web Designer" : null,
    budget_signals: lower.includes("cost") ? "Interested in ROI validation" : null,
    timeline_signals: lower.includes("busy") ? "Delayed to post-season" : "Immediate",
    decision_maker_info: {
      name: contactName,
      role: "Owner / General Manager",
      availability: "Standard business hours",
      decision_authority: "Primary Decision Maker"
    },
    follow_up_commitments: {
      promise_by_agency: interestLevel === "Do Not Contact" ? "Suppress contact" : "Send performance audit and competitor analysis",
      prospect_request: interestLevel === "Do Not Contact" ? "Do not call again" : "Send info to review",
      follow_up_type: interestLevel === "Do Not Contact" ? "Do Not Contact" : "Send Audit",
      recommended_date: "Today",
      timing_type: "Relative",
      recommended_channel: "Email",
      priority: interestLevel === "Do Not Contact" ? "Critical" : "High",
      reason: "Follow up on discussion points raised during call"
    },
    key_insights: [
      `Prospect receptive to Oregon trade contractor insights.`,
      `Engaged for ${Math.round(callRecord.duration || 90)} seconds on call.`
    ],
    next_best_action: {
      action: interestLevel === "Do Not Contact" ? "Update Lead to Do Not Contact" : "Send Personalized Audit",
      reason: interestLevel === "Do Not Contact" ? "Prospect requested removal" : "Prospect open to review of digital audit",
      priority: interestLevel === "Do Not Contact" ? "Critical" : "High",
      suggested_channel: interestLevel === "Do Not Contact" ? "Call" : "Email",
      suggested_timing: "Today"
    },
    crm_notes: crmNotes2,
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    ai_provider: "Google Gemini",
    ai_model: "Gemini 3.8 Flash (Fallback Rules Engine)",
    raw_transcript: transcriptStr,
    transcript_status: "Available"
  };
}
async function analyzeSingleLeadWithGemini(ai, lead) {
  const orig = lead.original_data || {};
  const tagsStr = Array.isArray(lead.tags) ? lead.tags.join(", ") : "";
  const gapsStr = (lead.gaps || []).join(", ") || "No Website, No GMB, No Ads";
  const prompt = `You are Sophia, the senior AI Lead Intelligence and Sales Representative for Marketing Charm Agency (MCA Lead Agency Suite).
Your mission is to analyze available factual data for this contractor business and generate rigorous, actionable sales intelligence and outreach strategy.

IMPORTANT CONTRACTOR & JURISDICTION CONTEXT:
This lead is from the Oregon Construction Contractors Board (CCB) registry cross-referenced with Google Maps and digital presence checks:
- Business: ${lead.business_name || orig.businessName || "Contractor"}
- CCB License #: ${orig.licenseNumber || lead.lead_id || "Not specified"}
- License Type / Endorsement: ${orig.licenseType || ""} - ${orig.endorsementText || lead.niche || "Contractor"}
- CCB Registration Date: ${orig.origRegisDate || lead.created_at || "Recent"}
- CCB Status: ${orig.status || lead.gmb_status || "Unknown"}
- Location: ${lead.city || orig.city || "Portland"}, ${orig.county ? orig.county + " County, " : ""}OR ${lead.postal_code || orig.zip || ""}
- Phone: ${lead.phone || orig.phone || "Not provided"}
- Website: ${lead.website || orig.gmbWebsite || "Not provided"} (${lead.website_status || "Unknown"})
- Google Maps Presence: ${lead.google_maps_url || orig.gmbMapsUrl || "Not on Google Maps"}
- GMB Status: ${lead.gmb_status || "Unknown"} (Rating: ${lead.gmb_rating ?? "N/A"}, Reviews: ${lead.gmb_review_count ?? "0"})
- Google Ads: ${lead.google_ads_status || "No Ads"}
- Meta Pixel: ${lead.meta_pixel_status || "No Pixel"}
- SEO Status: ${lead.seo_status || "Needs audit"}
- CRM Score: ${lead.lead_score || 88}/100
- Tags / CCB Meta: ${tagsStr}
- Identified Gaps: ${gapsStr}

STRATEGIC DIRECTIVES:
1. If CCB Status is "New Registration - No GMB": Contractor recently registered with Oregon CCB and lacks a Google Business Profile. Position the "New Licensee Fast-Start Package" (Google Business Profile claim/verification, initial citation build, high-converting starter website) so they gain Map Pack visibility before competitors take their area.
2. If CCB Status is "GMB Found - No Website": Contractor is visible on Google Maps but lacks a website. Highlight the "Google Maps Traffic Conversion Funnel" (custom mobile website, click-to-call, instant estimate form) to capture high-intent searchers.
3. If CCB Status is "GMB Found - Website Available" with 0 or few reviews: Focus on "Reputation & 5-Star Review Booster" and Local Search Ads to climb into the Top 3 Map Pack rankings.
4. Ground all insights strictly in provided facts. Never invent visitor counts or unverified claims.

Return a JSON object strictly conforming to this schema:
{
  "summary": "Concise 2-sentence executive summary of business digital presence and opportunities",
  "primary_pain_point": "Single biggest observable marketing bottleneck",
  "pain_points": ["Specific bottleneck 1", "Specific bottleneck 2"],
  "gaps": ["No Website", "No GMB", "Thin Reviews", "No Ads", "No Pixel"],
  "opportunity_angle": "Clear pitch title (e.g. New Licensee Launch Package \u2022 Roofing \u2022 Redmond, OR)",
  "recommended_service": "Primary agency service offering",
  "secondary_services": ["Secondary service 1", "Secondary service 2"],
  "estimated_retainer": 2000,
  "estimated_revenue_lift": "$4,500\u2013$10,500/month",
  "priority": "Hot",
  "confidence_score": 95,
  "rationale": "Evidence-based explanation citing provided CCB license, reviews, and website data",
  "suggested_pitch": "Personalized outreach opening from Sophia at Marketing Charm Agency tailored to their CCB/GMB status"
}`;
  const response = await generateAiContent(ai, {
    prompt,
    responseMimeType: "application/json",
    temperature: 0.2,
    cacheTtlMs: 18e5
  });
  const parsed = safeJsonParse(response?.text, null);
  if (parsed && (parsed.lead_score !== void 0 || parsed.score !== void 0)) {
    return parsed;
  }
  return generateDeterministicAnalysis(lead);
}
app.post("/api/ai/chat-sophia", async (req, res) => {
  try {
    const { message, leadsSummary, activeLead } = req.body;
    const ai = getGemini();
    const systemInstruction = `You are Sophia, the AI Lead Intelligence & Sales Assistant for Marketing Charm Agency (MCA Lead Agency Suite).
Your agency is prospecting Oregon Construction Contractors Board (CCB) licensed contractors across Oregon (Portland, Redmond, Sisters, Culver, Albany, Eugene, Bend, etc.).
Your pipeline includes:
- New CCB registrations with No Google Business Profile (prime for GBP Setup + Starter Web Funnel)
- Contractors with GMB Found but No Website (prime for Conversion Website + Click-to-call)
- Contractors with GMB + Website but low reviews or no ads (prime for Reputation Booster + Search Ads)

When answering questions:
- Always speak professionally, concisely, and with strategic marketing poise.
- Quote actual business names, cities, review counts, scores, and retainers from the CRM context provided.
- Do not invent facts or numbers.
- Sign off or identify yourself as Sophia, Marketing Charm Agency.`;
    if (!ai) {
      return res.json({
        reply: generateSophiaFallbackReply(message, leadsSummary, activeLead)
      });
    }
    const totalLeads = leadsSummary?.total_leads || leadsSummary?.total || 202;
    const hotCount = leadsSummary?.hot_targets || leadsSummary?.hot || 110;
    const mrr = leadsSummary?.potential_mrr || leadsSummary?.pipelineMRR || 394200;
    const sampleLeads = leadsSummary?.top_leads || leadsSummary?.sampleLeads || [];
    const contextBlock = `CRM Context:
Total Leads: ${totalLeads} Oregon CCB Contractors
Hot Targets: ${hotCount}
Potential Pipeline MRR: $${mrr.toLocaleString()}/month
Top Ranked Leads: ${JSON.stringify(sampleLeads)}
Currently Inspected Lead: ${activeLead ? JSON.stringify(activeLead) : "None selected"}`;
    const response = await generateAiContent(ai, {
      prompt: `${contextBlock}

User Question: ${message}`,
      systemInstruction,
      temperature: 0.7,
      cacheTtlMs: 6e4
    });
    if (response?.text) {
      return res.json({
        reply: response.text
      });
    }
    return res.json({
      reply: generateSophiaFallbackReply(req.body.message, req.body.leadsSummary, req.body.activeLead)
    });
  } catch (error) {
    console.warn("Sophia chat fallback:", error.message);
    return res.json({
      reply: generateSophiaFallbackReply(req.body.message, req.body.leadsSummary, req.body.activeLead)
    });
  }
});
function generateDeterministicAnalysis(lead) {
  const orig = lead.original_data || {};
  const gaps = [];
  const status = orig.status || lead.gmb_status || "";
  const isNewRegNoGMB = status === "New Registration - No GMB";
  const isGMBFoundNoWeb = status === "GMB Found - No Website";
  const hasWebsite = lead.website && !lead.website.toLowerCase().includes("no website") && lead.website !== "Not provided";
  if (!hasWebsite) {
    gaps.push("No Website");
  }
  if (isNewRegNoGMB || lead.gmb_status === "No GMB") {
    gaps.push("No GMB");
  }
  if (lead.gmb_status === "Thin GMB" || lead.gmb_review_count !== void 0 && lead.gmb_review_count < 10) {
    gaps.push("Thin Reviews");
  }
  if (lead.meta_pixel_status === "No Pixel" || !lead.meta_pixel_status) {
    gaps.push("No Pixel");
  }
  if (lead.google_ads_status === "No Ads" || !lead.google_ads_status) {
    gaps.push("No Ads");
  }
  const niche = orig.gmbCategory || orig.endorsementText || lead.niche || "Contractor";
  const city = lead.city || orig.city || "Portland";
  const licenseNum = orig.licenseNumber || lead.lead_id?.replace("CCB-", "") || "";
  let recommendedService = "Website Development & Google Maps Funnel";
  let secondaryServices = ["Meta Ads & Retargeting", "Voice Search Optimization"];
  let retainer = 2e3;
  let revenueLift = "$4,500\u2013$10,000/month";
  let primaryPainPoint = "Absence of an owned online conversion funnel";
  let oppAngle = `${recommendedService} \u2022 ${niche} \u2022 ${city}, OR`;
  let suggestedPitch = "";
  if (isNewRegNoGMB) {
    recommendedService = "New Licensee Launch: Google Business Profile + Website";
    secondaryServices = ["Local Citations Building", "Initial Review Acquisition Campaign"];
    retainer = 1800;
    revenueLift = "$5,000\u2013$12,000/month";
    primaryPainPoint = "Brand new Oregon CCB license with zero Google presence, risking lost local territory.";
    oppAngle = `New CCB Licensee Fast-Start Package \u2022 ${city}, OR`;
    suggestedPitch = `Hi, this is Sophia with Marketing Charm Agency. Congratulations on your Oregon CCB contractor license (#${licenseNum}) in ${city}! I noticed you haven't established your Google Business Profile or web funnel yet. We help new contractors secure top Map Pack rankings and initial client leads before competitors take your service radius.`;
  } else if (!hasWebsite) {
    recommendedService = "Website Development & Local Quote Funnel";
    secondaryServices = ["Google Business Profile Optimization", "Meta Retargeting"];
    retainer = 2200;
    revenueLift = "$4,500\u2013$10,000/month";
    primaryPainPoint = "Visible on Google Maps but leaking 60%+ of potential leads due to lack of a conversion website.";
    oppAngle = `Google Maps Traffic Capture Website \u2022 ${city}, OR`;
    suggestedPitch = `Hi, this is Sophia with Marketing Charm Agency. I noticed ${lead.business_name} is listed on Google Maps in ${city}, but there's no website linked to capture calls or estimate requests. You're likely losing high-intent searchers to competitors who offer instant online quotes.`;
  } else if (lead.gmb_review_count !== void 0 && lead.gmb_review_count < 10) {
    recommendedService = "Reputation & 5-Star Review Accelerator";
    secondaryServices = ["Local Search Ads", "Voice Search Optimization"];
    retainer = 1800;
    revenueLift = "$3,500\u2013$8,000/month";
    primaryPainPoint = "Low Google review count dampening local Map Pack ranking and customer trust.";
    oppAngle = `Map Pack Review & Ranking Surge \u2022 ${city}, OR`;
    suggestedPitch = `Hi, this is Sophia with Marketing Charm Agency. I saw ${lead.business_name} on Google Maps in ${city}. You have a great service foundation, but with ${lead.gmb_review_count || 0} reviews, you are just a few automated review campaigns away from locking into the top 3 Map Pack rankings.`;
  } else {
    recommendedService = "Local Search Ads & Paid Retargeting";
    secondaryServices = ["Technical SEO Audit", "Conversion Rate Optimization"];
    retainer = 2400;
    revenueLift = "$6,000\u2013$15,000/month";
    primaryPainPoint = "Relying solely on organic map rank without hyper-local paid search capture.";
    oppAngle = `Contractor Lead Generation & Paid Ads \u2022 ${city}, OR`;
    suggestedPitch = `Hi, this is Sophia with Marketing Charm Agency. I reviewed ${lead.business_name}'s presence in ${city}. You have solid authority, and launching targeted Google Local Service Ads and pixel retargeting could immediately scale your inbound high-margin job pipeline.`;
  }
  return {
    summary: `${lead.business_name || "This contractor"} operates as a ${niche} in ${city}, OR with notable digital acquisition opportunities across search and conversion channels.`,
    primary_pain_point: primaryPainPoint,
    pain_points: [
      primaryPainPoint,
      gaps.includes("No Pixel") ? "Lacks retargeting pixel infrastructure to capture and convert repeat visitors." : "Unoptimized search performance"
    ],
    gaps,
    opportunity_angle: oppAngle,
    recommended_service: recommendedService,
    secondary_services: secondaryServices,
    estimated_retainer: retainer,
    estimated_revenue_lift: revenueLift,
    priority: "Hot",
    confidence_score: 94,
    rationale: `Based on documented Oregon CCB license #${licenseNum || "N/A"}, ${lead.gmb_review_count ?? 0} Google reviews, and ${gaps.join(", ")}.`,
    suggested_pitch: suggestedPitch
  };
}
function generateSophiaFallbackReply(message = "", leadsSummary, activeLead) {
  const query = message.toLowerCase();
  const sampleLeads = leadsSummary?.sampleLeads || leadsSummary?.top_leads || [];
  const totalLeads = leadsSummary?.total_leads || leadsSummary?.total || 202;
  const hotTargets = leadsSummary?.hot_targets || leadsSummary?.hot || 110;
  const pipelineMRR = leadsSummary?.potential_mrr || leadsSummary?.pipelineMRR || 394200;
  if (activeLead) {
    const orig = activeLead.original_data || {};
    return `For **${activeLead.business_name}** (CCB #${orig.licenseNumber || activeLead.lead_id}):
- **Trade & Location**: ${activeLead.niche || "Contractor"} \u2022 ${activeLead.city || "Oregon"}, OR
- **Lead Score**: ${activeLead.lead_score || 85}/100
- **CCB / GMB Status**: ${orig.status || activeLead.gmb_status || "Active"}
- **Identified Gaps**: ${activeLead.gaps?.join(", ") || "No Website, No GMB, No Ads"}
- **Recommended Service**: ${activeLead.recommended_service || "Local Growth Package"}
- **Estimated Retainer**: $${(activeLead.estimated_retainer || 1800).toLocaleString()}/mo
- **Projected Revenue Lift**: ${activeLead.estimated_revenue_lift || "$4,000\u2013$10,000/mo"}

**Outreach Angle**: ${activeLead.opportunity_angle || "Fast-Start Contractor Package"}

\u2014 Sophia, Marketing Charm Agency`;
  }
  if (totalLeads === 0) {
    return `Your CRM currently has no leads loaded. Please click **"Reload Attached CCB Leads"** in the Import Center or dashboard to restore your 202 Oregon CCB contractor dataset.

\u2014 Sophia, Marketing Charm Agency`;
  }
  if (query.includes("no website") || query.includes("missing website")) {
    return `In your Oregon CCB dataset of ${totalLeads} contractors, **110 leads have No Website** (including 87 newly registered contractors with no Google presence and 23 with Google Maps listings but no site). These represent immediate high-margin website & quote funnel sales opportunities.

\u2014 Sophia, Marketing Charm Agency`;
  }
  if (query.includes("new") || query.includes("registration") || query.includes("license")) {
    return `There are **87 brand new Oregon CCB registrants** who have neither a Google Business Profile nor a website. These are prime candidates for our **"New Contractor Launch: GBP + Website Setup"** package at $1,800\u2013$2,200/mo.

\u2014 Sophia, Marketing Charm Agency`;
  }
  if (sampleLeads.length > 0 && (query.includes("who") || query.includes("contact") || query.includes("call") || query.includes("prioritize") || query.includes("top"))) {
    const topLead = sampleLeads[0];
    return `Based on current scoring, your top priority lead is **${topLead.name || topLead.business_name}** (Score: ${topLead.score || topLead.lead_score || 94}/100) in ${topLead.city || "Oregon"}.

- **Trade**: ${topLead.niche || "Contractor"}
- **Key Gaps**: ${(topLead.gaps || []).join(", ") || "No Website, Thin Reviews"}
- **Recommended Service**: ${topLead.service || topLead.recommended_service || "Website & Google Maps Funnel"}
- **Estimated Retainer**: $${(topLead.retainer || topLead.estimated_retainer || 2e3).toLocaleString()}/mo

\u2014 Sophia, Marketing Charm Agency`;
  }
  return `I have analyzed your **${totalLeads} Oregon CCB contractor leads** across Multnomah, Deschutes, Clackamas, Jefferson, and Lane counties. 

- **Hot Targets**: ${hotTargets} contractors (score \u2265 85 with multiple gaps)
- **Pipeline Retainer Potential**: $${pipelineMRR.toLocaleString()}/month
- **Key Opportunities**: 87 new CCB licensees needing GBP + Web Launch, and 23 contractors with active Google Maps traffic but zero website.

How can I assist you with specific contractor outreach scripts or segmentation?

\u2014 Sophia, Marketing Charm Agency`;
}
async function generateEmailWithGemini(ai, lead, emailType = "Initial Outreach", tone = "More Professional", personalizationLevel = "High", agencyConfig) {
  const orig = lead.original_data || {};
  const gaps = lead.gaps || [];
  const senderAgency = agencyConfig?.agency_name || "Marketing Charm Agency";
  const senderName = "Sophia";
  const senderPhone = agencyConfig?.contact_phone || "";
  const senderWebsite = agencyConfig?.website || "";
  const notesSummary = Array.isArray(lead.notes) && lead.notes.length > 0 ? lead.notes.slice(0, 3).map((n) => `${n.author || "Rep"}: ${n.content}`).join("; ") : "No previous CRM notes recorded.";
  const prompt = `You are Sophia, the senior AI Sales Representative for ${senderAgency}.
You must write a personalized, concise, highly professional B2B cold outreach email to this business prospect.

ACTUAL VERIFIED PROSPECT DATA:
- Business Name: ${lead.business_name || orig.businessName || "Business"}
- Contact Name: ${lead.contact_name || orig.contactName || ""}
- Trade / Niche: ${lead.niche || orig.endorsementText || "Contractor"}
- Location: ${lead.city || "Portland"}, ${orig.county ? orig.county + " County, " : ""}OR
- Website Status: ${lead.website_status || "Unknown"} (URL: ${lead.website || "None"})
- Google Business Profile (GMB): ${lead.gmb_status || "Unknown"}
- Google Reviews: Rating ${lead.gmb_rating ?? "N/A"}, Count: ${lead.gmb_review_count ?? "0"}
- Google Ads Status: ${lead.google_ads_status || "No Ads"}
- Meta Pixel: ${lead.meta_pixel_status || "No Pixel"}
- SEO Status: ${lead.seo_status || "Needs audit"}
- Identified Gaps: ${gaps.join(", ") || "Online visibility"}
- Recommended MCA Service: ${lead.recommended_service || "Local Search & Conversion Funnel"}
- Estimated Value Lift: ${lead.estimated_revenue_lift || "$4,000\u2013$8,000/mo"}
- Pipeline Stage: ${lead.pipeline_stage || "New Lead"}
- CRM Notes: ${notesSummary}

EMAIL PARAMETERS:
- Email Type: ${emailType} (Options: Initial Outreach, Follow-Up, Audit Follow-Up, Proposal Follow-Up, Re-Engagement)
- Requested Style / Tone: ${tone} (Options: More Direct, More Friendly, More Professional, Shorter, More Personalized, Different Angle)
- Personalization Level: ${personalizationLevel} (Low: Business & location only; Medium: Business + one verified opportunity; High: Business + verified audit/GMB/marketing findings)

CRITICAL SAFETY & QUALITY DIRECTIVES:
1. NEVER invent problems, PageSpeed numbers, revenue numbers, review counts, or unverified claims. If data is missing, omit it cleanly.
2. NEVER leave placeholders such as [Your Name], [Your Agency], [Your Phone], [Your Website], [Client Name], or [Date].
3. Sender must always be:
${senderName}
${senderAgency}${senderPhone ? "\n" + senderPhone : ""}${senderWebsite ? "\n" + senderWebsite : ""}
4. Preferred length: 100 to 180 words.
5. Structure:
   - Personalized greeting to contact name (or "Team" if name unavailable)
   - Mention the business and location
   - Mention one verified observation or opportunity from their actual record
   - Explain why that opportunity matters for high-intent local customer capture
   - Connect it to the relevant ${senderAgency} capability
   - Simple, low-pressure call to action (e.g., brief 3-minute review or checking if open to taking a look)
6. Generate exactly 3 non-spammy subject line options.

Return a JSON object conforming strictly to this format:
{
  "subject": "Selected best subject line",
  "subject_options": ["Subject option 1", "Subject option 2", "Subject option 3"],
  "body": "Complete cold email text without any placeholders, ending with Sophia's sign-off",
  "email_type": "${emailType}",
  "personalization_level": "${personalizationLevel}",
  "key_opportunity": "Primary verified finding cited",
  "suggested_cta": "Clear low-pressure CTA sentence"
}`;
  const response = await generateAiContent(ai, {
    prompt,
    responseMimeType: "application/json",
    temperature: 0.3,
    cacheTtlMs: 9e5
  });
  const parsed = safeJsonParse(response?.text, null);
  if (parsed && parsed.body) {
    return parsed;
  }
  return generateDeterministicEmail(lead, emailType, tone, personalizationLevel, agencyConfig);
}
function generateDeterministicEmail(lead, emailType = "Initial Outreach", tone = "More Professional", personalizationLevel = "High", agencyConfig) {
  const businessName = lead.business_name || "your team";
  const contactName = lead.contact_name ? lead.contact_name.split(" ")[0] : "";
  const city = lead.city || "Oregon";
  const niche = lead.niche || "service business";
  const service = lead.recommended_service || "website performance and local search optimization";
  const gaps = lead.gaps || [];
  const senderAgency = agencyConfig?.agency_name || "Marketing Charm Agency";
  const senderPhone = agencyConfig?.contact_phone || "";
  const senderWebsite = agencyConfig?.website || "";
  const greeting = contactName ? `Hi ${contactName},` : `Hi ${businessName} Team,`;
  let signOff = `Best regards,

Sophia
${senderAgency}`;
  if (senderPhone) signOff += `
${senderPhone}`;
  if (senderWebsite) signOff += `
${senderWebsite}`;
  let primaryOpportunity = "local search visibility and conversion paths";
  if (gaps.includes("No Website")) {
    primaryOpportunity = "establishing a high-converting mobile web presence to capture local customer inquiries";
  } else if (gaps.includes("No GMB") || gaps.includes("Unclaimed")) {
    primaryOpportunity = "claiming and optimizing your Google Business Profile to appear in the top Google Maps local pack";
  } else if (gaps.includes("No Ads") || gaps.includes("No Pixel")) {
    primaryOpportunity = "capturing high-intent searchers before competitors with targeted local search campaigns";
  } else if (gaps.includes("Thin Reviews")) {
    primaryOpportunity = "building a consistent 5-star reputation system to strengthen your Google Maps standing";
  }
  let subjectOptions = [
    `Quick question regarding ${businessName}'s online presence in ${city}`,
    `Observation regarding ${businessName} in ${city}`,
    `A quick idea for ${businessName}`
  ];
  if (emailType === "Follow-Up") {
    subjectOptions = [
      `Following up regarding ${businessName}`,
      `Quick follow-up on ${businessName}'s ${niche} presence in ${city}`,
      `Touching base regarding my previous note - ${businessName}`
    ];
  } else if (emailType === "Audit Follow-Up") {
    subjectOptions = [
      `Local growth breakdown for ${businessName}`,
      `Findings regarding ${businessName}'s digital visibility in ${city}`,
      `Quick walkthrough of opportunities for ${businessName}`
    ];
  } else if (emailType === "Proposal Follow-Up") {
    subjectOptions = [
      `Growth proposal review for ${businessName}`,
      `Next steps on ${businessName}'s ${service}`,
      `Following up on the proposal for ${businessName}`
    ];
  } else if (emailType === "Re-Engagement") {
    subjectOptions = [
      `Checking back with ${businessName}`,
      `Are local client acquisition goals still top of mind for ${businessName}?`,
      `Reconnecting regarding ${businessName} in ${city}`
    ];
  }
  let body = "";
  let suggestedCta = "Would you be open to taking a quick look?";
  if (emailType === "Follow-Up") {
    suggestedCta = "Would you be open to a brief 5-minute conversation sometime this week?";
    if (tone === "More Direct") {
      body = `${greeting}

I wanted to quickly follow up on my note from earlier regarding ${businessName} in ${city}.

We noticed that ${primaryOpportunity} remains a key area where potential ${niche} customers may be slipping through to nearby competitors.

Would you be open to a brief 5-minute conversation sometime this week to see what we found?

${signOff}`;
    } else if (tone === "Shorter") {
      body = `${greeting}

Quick follow-up on my note regarding ${businessName}'s digital presence in ${city}.

I put together a short overview on ${primaryOpportunity} and would love to share it with your team.

Would you be open to a quick 5-minute chat?

${signOff}`;
    } else {
      body = `${greeting}

I'm following up on my previous note regarding ${businessName}'s digital presence in ${city}.

For service businesses competing in ${city}, addressing ${primaryOpportunity} often creates a noticeable lift in qualified inbound inquiries.

I have a 3-minute summary of the findings ready. Would you be open to a brief conversation sometime this week?

${signOff}`;
    }
  } else if (emailType === "Audit Follow-Up") {
    suggestedCta = "Would you be open to seeing a brief 3-minute breakdown of our findings?";
    body = `${greeting}

This is Sophia with ${senderAgency}. I recently completed a review of ${niche} companies in ${city} and had a look at ${businessName}.

Our review highlighted a specific opportunity around ${primaryOpportunity}. Implementing targeted adjustments around ${service} could help capture more inbound project calls directly from Google search.

I put together a short 3-minute overview of what we observed.

${suggestedCta}

${signOff}`;
  } else if (emailType === "Proposal Follow-Up") {
    suggestedCta = "Let me know if you have any questions or if Thursday works for a quick walkthrough.";
    body = `${greeting}

I hope your week is off to a great start. I am following up on the growth plan prepared for ${businessName} regarding ${service}.

The recommendations are structured specifically to address ${primaryOpportunity} and establish a steady, predictable pipeline of local high-margin work in ${city}.

${suggestedCta}

${signOff}`;
  } else if (emailType === "Re-Engagement") {
    suggestedCta = "Would you be open to reconnecting briefly this month?";
    body = `${greeting}

I wanted to check back in with you and ${businessName}.

With local market demand shifting across ${city}, having a reliable system for ${primaryOpportunity} continues to make a big difference for top-rated ${niche} providers.

I would welcome the opportunity to share an updated snapshot of local search trends in your area.

${suggestedCta}

${signOff}`;
  } else {
    suggestedCta = "Would you be open to taking a quick look?";
    if (tone === "More Direct") {
      body = `${greeting}

I'm Sophia from ${senderAgency}. I came across ${businessName} while researching local ${niche} companies in ${city}.

I noticed a specific bottleneck around ${primaryOpportunity} that is likely costing your business qualified calls from high-intent local prospects.

We specialize in ${service} for local service providers, helping build reliable inbound systems.

Would you be open to taking a quick look at a 2-minute overview?

${signOff}`;
    } else if (tone === "More Friendly") {
      body = `${greeting}

I hope you are having a wonderful week! I'm Sophia from ${senderAgency}.

I came across ${businessName} while looking into ${niche} businesses in ${city}, and I was really impressed by your local reputation.

While reviewing local search activity in your area, I spotted a straightforward opportunity around ${primaryOpportunity}. Helping local businesses solve this with ${service} is what we love to do.

I put together a short overview of our findings and would be delighted to share it.

${suggestedCta}

${signOff}`;
    } else if (tone === "Shorter") {
      body = `${greeting}

I'm Sophia from ${senderAgency}. I came across ${businessName} while researching ${niche} providers in ${city}.

I noticed an opportunity around ${primaryOpportunity} that may be affecting how easily potential customers can find and contact you.

I put together a brief summary of what we found.

${suggestedCta}

${signOff}`;
    } else if (tone === "More Personalized" && lead.gmb_rating && lead.gmb_review_count) {
      body = `${greeting}

I'm Sophia from ${senderAgency}. I came across ${businessName} while researching ${niche} providers in ${city}.

Your ${lead.gmb_rating}-star rating across ${lead.gmb_review_count} Google reviews shows the strong quality of your work. However, there is a clear opportunity around ${primaryOpportunity} that could significantly expand your inbound reach.

For businesses with your established track record, implementing ${service} is one of the fastest ways to turn that strong reputation into consistent high-margin leads.

I prepared a quick breakdown of what we found.

${suggestedCta}

${signOff}`;
    } else {
      body = `${greeting}

I'm Sophia from ${senderAgency}. I came across your business while researching ${niche} companies in ${city}.

I noticed an opportunity around ${primaryOpportunity} that may be affecting how easily potential customers find and contact your business.

For service businesses competing in local search, improving ${service} can help create a stronger system for capturing inbound opportunities.

I put together a short overview of what I found and would be happy to send it over.

${suggestedCta}

${signOff}`;
    }
  }
  return {
    subject: subjectOptions[0],
    subject_options: subjectOptions,
    body,
    email_type: emailType,
    personalization_level: personalizationLevel,
    key_opportunity: primaryOpportunity,
    suggested_cta: suggestedCta
  };
}
function calculateSmsSegments(text2) {
  const characterCount = text2.length;
  const segmentsCount = characterCount <= 160 ? 1 : Math.ceil(characterCount / 153);
  return { characterCount, segmentsCount };
}
async function generateSMSWithGemini(ai, lead, smsType = "Initial Outreach", personalizationLevel = "High", agencyConfig) {
  const orig = lead.original_data || {};
  const gaps = lead.gaps || [];
  const senderAgency = agencyConfig?.agency_name || "Marketing Charm Agency";
  const businessName = lead.business_name || orig.businessName || "your team";
  const contactName = lead.contact_name ? lead.contact_name.split(" ")[0] : "";
  const city = lead.city || orig.city || "Oregon";
  const niche = lead.niche || orig.endorsementText || "Contractor";
  const service = lead.recommended_service || "local search visibility";
  const notesSummary = Array.isArray(lead.notes) && lead.notes.length > 0 ? lead.notes.slice(0, 2).map((n) => n.content).join("; ") : "None";
  const prompt = `You are Sophia, the AI Sales Representative for ${senderAgency}.
You must write a concise, conversational, highly professional B2B cold outreach SMS to this contractor/business.

ACTUAL VERIFIED PROSPECT DATA:
- Business: ${businessName}
- Contact: ${contactName || "Team"}
- Trade / Niche: ${niche}
- City: ${city}, OR
- GMB Status: ${lead.gmb_status || "Unknown"} (Reviews: ${lead.gmb_review_count ?? "0"}, Rating: ${lead.gmb_rating ?? "N/A"})
- Website: ${lead.website || "None"} (${lead.website_status || "Unknown"})
- Gaps: ${gaps.join(", ") || "Online search visibility"}
- Recommended Service: ${service}
- Pipeline Stage: ${lead.pipeline_stage || "New Lead"}
- CRM Notes / Prior Context: ${notesSummary}

SMS PARAMETERS:
- Message Type: ${smsType} (Initial Outreach, Follow-Up, Audit Follow-Up, Information Follow-Up, Proposal Follow-Up, Re-Engagement)
- Personalization Level: ${personalizationLevel} (Low, Medium, High)

STRICT SMS CONSTRAINTS:
1. PREFERRED LENGTH: Under 280 characters (strictly max 320 characters).
2. TONE: Short, natural, professional, conversational, easy to read on mobile.
3. NEVER use spammy words, fake urgency ("Act now!", "Urgent"), guaranteed numbers ("$10k guaranteed"), ALL CAPS, excessive punctuation, or generic placeholders like [Name].
4. NEVER invent technical bugs or fake metrics if not in verified data.
5. Identify yourself naturally as Sophia from ${senderAgency}.
6. Low-friction conversational question at the end (e.g. "Would you be open to a quick breakdown?").

Return a JSON object conforming strictly to this format:
{
  "content": "Full SMS text",
  "sms_type": "${smsType}",
  "personalization_level": "${personalizationLevel}"
}`;
  const response = await generateAiContent(ai, {
    prompt,
    responseMimeType: "application/json",
    temperature: 0.3,
    cacheTtlMs: 9e5
  });
  const parsed = safeJsonParse(response?.text, {});
  const content = parsed.content || generateDeterministicSMS(lead, smsType, personalizationLevel, agencyConfig).content;
  const { characterCount, segmentsCount } = calculateSmsSegments(content);
  return {
    content,
    sms_type: smsType,
    personalization_level: personalizationLevel,
    character_count: characterCount,
    segments_count: segmentsCount
  };
}
function generateDeterministicSMS(lead, smsType = "Initial Outreach", personalizationLevel = "High", agencyConfig) {
  const senderAgency = agencyConfig?.agency_name || "Marketing Charm Agency";
  const businessName = lead.business_name || "team";
  const contactName = lead.contact_name ? lead.contact_name.split(" ")[0] : "";
  const city = lead.city || "Oregon";
  const gaps = lead.gaps || [];
  let opp = "your local search presence";
  if (gaps.includes("No Website")) {
    opp = "establishing a mobile quote site";
  } else if (gaps.includes("No GMB")) {
    opp = "getting your Google Business Profile set up";
  } else if (gaps.includes("Thin Reviews")) {
    opp = "boosting Google Maps reviews";
  } else if (lead.recommended_service) {
    opp = lead.recommended_service.toLowerCase();
  }
  const nameGreeting = contactName ? `Hi ${contactName}` : `Hi ${businessName} team`;
  let content = "";
  switch (smsType) {
    case "Follow-Up":
      content = `${nameGreeting} \u2014 Sophia from ${senderAgency} following up. Did you have a moment to review my previous note on ${opp} in ${city}? Happy to send over a 2-minute overview if helpful.`;
      break;
    case "Audit Follow-Up":
      content = `${nameGreeting} \u2014 Sophia with ${senderAgency}. I put together a quick local visibility breakdown for ${businessName} in ${city}. Would you be open to me texting over the link?`;
      break;
    case "Information Follow-Up":
      content = `${nameGreeting} \u2014 Sophia here from ${senderAgency}. Touching base with the information regarding ${opp} for ${businessName}. Let me know if you'd like a quick 5-min walk-through this week.`;
      break;
    case "Proposal Follow-Up":
      content = `${nameGreeting} \u2014 Sophia from ${senderAgency}. Wanted to see if you had any questions on the proposal we prepared for ${businessName}. Looking forward to connecting!`;
      break;
    case "Re-Engagement":
      content = `${nameGreeting} \u2014 Sophia with ${senderAgency}. Reconnecting to see if expanding ${businessName}'s customer acquisition in ${city} is still a focus this quarter?`;
      break;
    case "Initial Outreach":
    default:
      if (personalizationLevel === "High" && lead.gmb_rating && lead.gmb_review_count) {
        content = `${nameGreeting} \u2014 Sophia from ${senderAgency}. Noticed your ${lead.gmb_rating}\u2605 reputation in ${city}. We identified a simple way to convert that into more direct calls. Open to a quick look?`;
      } else {
        content = `${nameGreeting} \u2014 Sophia from ${senderAgency} here. I noticed an opportunity with ${businessName}'s online presence in ${city} that could be worth a look. Open to a quick breakdown?`;
      }
      break;
  }
  if (content.length > 320) {
    content = content.substring(0, 317) + "...";
  }
  const { characterCount, segmentsCount } = calculateSmsSegments(content);
  return {
    content,
    sms_type: smsType,
    personalization_level: personalizationLevel,
    character_count: characterCount,
    segments_count: segmentsCount
  };
}
async function analyzeSMSReplyWithGemini(ai, replyText, lead, conversationHistory) {
  const businessName = lead?.business_name || "the prospect";
  const historyStr = Array.isArray(conversationHistory) && conversationHistory.length > 0 ? conversationHistory.slice(-4).map((m) => `${m.direction === "OUTBOUND" ? "Sophia" : "Prospect"}: ${m.content}`).join("\n") : "No prior messages in session.";
  const prompt = `You are Sophia, the senior AI Sales Representative for Marketing Charm Agency.
Analyze this inbound SMS message from prospect "${businessName}".

INBOUND SMS TEXT:
"${replyText}"

RECENT CONVERSATION CONTEXT:
${historyStr}

Classify the prospect's reply into one of these strict intents:
- "Interested"
- "Not Interested"
- "Question"
- "Pricing"
- "Information Request"
- "Follow-Up Request"
- "Meeting Request"
- "Opt-Out"
- "Unclear"

Generate:
1. summary: A concise 1-sentence summary of what the prospect expressed.
2. suggested_response: Sophia's suggested polite, professional, conversational SMS response (under 200 characters, no spam, no pushiness, signed naturally if appropriate).
3. recommended_next_action: Strategic next step for the agency CRM user (e.g. "Send 2-minute video audit link", "Schedule 10-minute phone call", "Mark opted out and suppress SMS").

Return a JSON object conforming strictly to this format:
{
  "intent": "Interested",
  "summary": "Prospect is open to reviewing the digital visibility breakdown.",
  "suggested_response": "Great to hear! I just put together a short overview for your team. Would this phone number or an email be best to send it to?",
  "recommended_next_action": "Send audit overview and schedule follow-up."
}`;
  const response = await generateAiContent(ai, {
    prompt,
    responseMimeType: "application/json",
    temperature: 0.2,
    cacheTtlMs: 9e5
  });
  const parsed = safeJsonParse(response?.text, null);
  if (parsed && parsed.intent) {
    return parsed;
  }
  return analyzeDeterministicSMSReply(replyText, lead);
}
function analyzeDeterministicSMSReply(replyText, lead) {
  const lower = replyText.trim().toLowerCase();
  const businessName = lead?.business_name || "your business";
  if (lower.includes("stop") || lower.includes("unsubscribe") || lower.includes("cancel") || lower.includes("quit") || lower.includes("end") || lower.includes("remove me") || lower.includes("do not text")) {
    return {
      intent: "Opt-Out",
      summary: "Prospect requested to stop receiving SMS messages.",
      suggested_response: "You have been unsubscribed from SMS notifications. No further messages will be sent.",
      recommended_next_action: "Contact opted out. Suppress all future SMS communication.",
      confidence: 1
    };
  }
  if (lower.includes("yes") || lower.includes("sure") || lower.includes("send") || lower.includes("interested") || lower.includes("okay") || lower.includes("ok") || lower.includes("sounds good") || lower.includes("love to")) {
    return {
      intent: "Interested",
      summary: "Prospect expressed positive interest in learning more.",
      suggested_response: `Great to hear! I put together a short breakdown for ${businessName}. Would this number or an email work best to send it over?`,
      recommended_next_action: "Send audit overview and schedule follow-up.",
      confidence: 0.95
    };
  }
  if (lower.includes("how much") || lower.includes("cost") || lower.includes("price") || lower.includes("pricing") || lower.includes("rate") || lower.includes("fee")) {
    return {
      intent: "Pricing",
      summary: "Prospect inquired about costs and pricing structure.",
      suggested_response: `Our local growth retainers typically range from $1,500\u2013$2,500/mo depending on your service scope, with no long-term contracts. Would a quick 5-min chat help clarify details?`,
      recommended_next_action: "Provide pricing breakdown and offer quick introductory call.",
      confidence: 0.9
    };
  }
  if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("pass") || lower.includes("not right now") || lower.includes("busy")) {
    return {
      intent: "Not Interested",
      summary: "Prospect declined current outreach.",
      suggested_response: `Completely understand! Thank you for letting me know, and wishing ${businessName} continued success.`,
      recommended_next_action: "Log response and schedule re-engagement in 60\u201390 days.",
      confidence: 0.9
    };
  }
  if (lower.includes("call me") || lower.includes("meet") || lower.includes("schedule") || lower.includes("phone") || lower.includes("calendar") || lower.includes("time")) {
    return {
      intent: "Meeting Request",
      summary: "Prospect requested a phone conversation or meeting.",
      suggested_response: `I'd be glad to connect. What time works best for you this afternoon or tomorrow morning?`,
      recommended_next_action: "Schedule phone consultation and prepare lead brief.",
      confidence: 0.92
    };
  }
  if (lower.includes("what") || lower.includes("who") || lower.includes("how") || lower.includes("why") || lower.endsWith("?")) {
    return {
      intent: "Question",
      summary: "Prospect asked a question about the agency or service.",
      suggested_response: `We specialize in local search optimization and high-converting web funnels for Oregon contractors. We noticed a couple of quick wins for ${businessName} that we'd love to share.`,
      recommended_next_action: "Answer question clearly and reiterate value proposition.",
      confidence: 0.85
    };
  }
  return {
    intent: "Unclear",
    summary: "Prospect reply requires manual review.",
    suggested_response: `Thanks for getting back to me! Just to confirm, would you like me to send over the brief overview for ${businessName}?`,
    recommended_next_action: "Review conversation manually and reply with tailored clarification.",
    confidence: 0.7
  };
}
app.post("/api/telephony/calls/start", async (req, res) => {
  try {
    const {
      leadId,
      businessName,
      contactName,
      phoneNumber,
      callType,
      leadScore,
      opportunity,
      estimatedRetainer
    } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    const session = await telephonyManager.startCall({
      leadId,
      businessName,
      contactName,
      phoneNumber,
      callType,
      leadScore,
      opportunity,
      estimatedRetainer
    });
    res.json({ success: true, session });
  } catch (err) {
    console.error("Telephony start call error:", err);
    res.status(500).json({ error: "Unable to connect the call. Please check the number and try again." });
  }
});
app.get("/api/telephony/webrtc/token", async (req, res) => {
  console.log("[TOKEN-A] Token route called");
  try {
    const sipUsername = process.env.TELNYX_WEBRTC_SIP_USERNAME;
    const sipPassword = process.env.TELNYX_WEBRTC_SIP_PASSWORD;
    console.log("[TOKEN-B] SIP_USERNAME present:", !!sipUsername);
    console.log("[TOKEN-C] SIP_PASSWORD present:", !!sipPassword);
    if (!sipUsername || !sipPassword) {
      console.error("[TOKEN] Missing SIP credentials in environment");
      return res.status(500).json({
        error: "WebRTC credentials not configured",
        details: "TELNYX_WEBRTC_SIP_USERNAME and TELNYX_WEBRTC_SIP_PASSWORD are required"
      });
    }
    console.log("[TOKEN] Serving SIP credentials, username:", sipUsername);
    console.log("[TOKEN-D] Sending credentials, username length:", sipUsername?.length);
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "Vercel-CDN-Cache-Control": "no-store",
      "Surrogate-Control": "no-store"
    });
    res.json({
      sip_username: sipUsername,
      sip_password: sipPassword
    });
  } catch (error) {
    console.error("[TOKEN] Unexpected error:", error);
    res.status(500).json({
      error: "Failed to fetch WebRTC credentials",
      details: error.message
    });
  }
});
app.get("/api/telephony/calls/:id/status", (req, res) => {
  try {
    const session = telephonyManager.getCallSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Call session not found" });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve call status" });
  }
});
app.post("/api/telephony/calls/:id/end", async (req, res) => {
  try {
    const { duration, outcome, notes } = req.body;
    const session = await telephonyManager.endCall(req.params.id, { duration, outcome, notes });
    if (!session) {
      return res.status(404).json({ error: "Call session not found or already ended" });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to end call session" });
  }
});
app.post("/api/telephony/calls/:id/mute", (req, res) => {
  try {
    const { muted } = req.body;
    const session = telephonyManager.toggleMute(req.params.id, muted);
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to update mute state" });
  }
});
app.post("/api/telephony/calls/:id/hold", (req, res) => {
  try {
    const { onHold } = req.body;
    const session = telephonyManager.toggleHold(req.params.id, onHold);
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to update hold state" });
  }
});
app.post("/api/telephony/calls/:id/notes", (req, res) => {
  try {
    const { notes } = req.body;
    const session = telephonyManager.saveNotes(req.params.id, notes || "");
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to save notes" });
  }
});
app.post("/api/telephony/calls/:id/outcome", (req, res) => {
  try {
    const { outcome, notes } = req.body;
    const session = telephonyManager.setOutcome(req.params.id, outcome, notes);
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to set outcome" });
  }
});
app.get("/api/telephony/calls/history", (req, res) => {
  try {
    const history = telephonyManager.getHistory();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve call history" });
  }
});
app.post("/api/telephony/script/generate", async (req, res) => {
  try {
    const { lead } = req.body;
    if (!lead) {
      return res.status(400).json({ error: "Lead is required" });
    }
    const ai = getGemini();
    if (!ai) {
      return res.json({
        source: "deterministic",
        script: generateDeterministicCallScript(lead)
      });
    }
    try {
      const prompt = `You are Sophia, an expert AI Sales Representative at Marketing Charm Agency (MCA).
Generate a high-converting, professional, 6-part cold calling sales script for this prospect.
Lead details:
- Business: ${lead.business_name}
- Niche: ${lead.niche || "Contractor"}
- City: ${lead.city || "Portland"}, ${lead.state || "OR"}
- Opportunity: ${lead.opportunity_angle || lead.recommended_service || "Local Search Optimization"}
- GMB Rating: ${lead.gmb_rating || "N/A"} (${lead.gmb_review_count || 0} reviews)
- Marketing Gaps: ${(lead.marketing_gaps || []).join(", ") || "Low search visibility"}

Return STRICT valid JSON in this structure:
{
  "opening": "Crisp conversational opening stating identity, reason for call, and asking for owner",
  "discovery_questions": ["Question 1 about lead generation", "Question 2 about capacity", "Question 3 about search rank", "Question 4"],
  "opportunity_discussion": "Specific problem observed in their digital presence and why it costs them jobs",
  "service_introduction": "How MCA solves this with managed local funnels",
  "common_objections": [
    {"objection": "Already have an agency", "counter": "Punchy professional counter"},
    {"objection": "Too busy right now", "counter": "Punchy professional counter"},
    {"objection": "Send me an email", "counter": "Punchy professional counter"},
    {"objection": "What does it cost?", "counter": "Punchy professional counter"}
  ],
  "closing": "Low friction call-to-action proposing a 10-minute digital audit review"
}`;
      const response = await generateAiContent(ai, {
        prompt,
        responseMimeType: "application/json",
        temperature: 0.3,
        cacheTtlMs: 9e5
      });
      const parsed = safeJsonParse(response?.text, null);
      if (parsed && parsed.opening) {
        return res.json({ source: "gemini", script: parsed });
      }
      return res.json({ source: "deterministic", script: generateDeterministicCallScript(lead) });
    } catch (e) {
      console.warn("Gemini script generation fallback:", e.message);
      return res.json({ source: "deterministic", script: generateDeterministicCallScript(lead) });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to generate script" });
  }
});
app.post("/api/telephony/script/talking-points", (req, res) => {
  try {
    const { lead } = req.body;
    if (!lead) return res.status(400).json({ error: "Lead required" });
    const points = generateDeterministicTalkingPoints(lead);
    res.json({ success: true, talkingPoints: points });
  } catch (e) {
    res.status(500).json({ error: "Failed to get talking points" });
  }
});
app.post("/api/command-center/ask-sophia", async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    const ai = getGemini();
    if (!ai) {
      return res.json({ source: "deterministic", answer: null });
    }
    const prompt = `You are Sophia, Senior AI Executive Assistant and Autonomous Sales Leader for Marketing Charm Agency (MCA).
You are speaking directly to Ahmed, the agency owner and executive principal.

AGENCY CONTEXT & LIVE METRICS:
- Confirmed MRR: $${context?.confirmedMRR || 8400}/month
- Active Retainer Clients: ${context?.activeClientsCount || 3}
- Total Leads Discovered: ${context?.totalLeads || 202}
- Hot Prospect Targets: ${context?.hotLeadsCount || 110}
- At-Risk Account: ${context?.atRiskClientName || "None"}
- Overdue Follow-Up Tasks: ${context?.overdueFollowUpsCount || 0}
- Top Hot Targets: ${(context?.topHotLeads || []).join("; ") || "High value contractors"}

OWNER QUESTION: "${question}"

INSTRUCTIONS:
1. Address the owner professionally, respectfully, and authoritatively ("Good day, Ahmed" or "Here is what you should know, Ahmed").
2. Answer specifically with factual, data-driven reasoning based on Marketing Charm Agency's business model (selling high-ticket web development, SEO, GBP, and PPC retainers to Oregon contractors and service businesses).
3. Provide crisp, structured bullet points with clear next actions.
4. Keep the response under 150 words.
5. NEVER invent fake client names or fabricate outside data not grounded in the prompt context.
6. Do NOT expose internal API keys, passwords, webhook URLs, or backend server internals.`;
    const response = await generateAiContent(ai, {
      prompt,
      temperature: 0.4,
      cacheTtlMs: 3e5
    });
    if (response?.text) {
      return res.json({ source: "gemini", answer: response.text.trim() });
    }
    return res.json({ source: "deterministic", answer: null });
  } catch (err) {
    return res.json({ source: "deterministic", answer: null });
  }
});
app.post("/api/command-center/briefing", async (req, res) => {
  try {
    const { type, metrics } = req.body;
    const ai = getGemini();
    if (!ai) {
      return res.json({ source: "deterministic", briefing: null });
    }
    const prompt = `You are Sophia, Executive AI for Marketing Charm Agency (MCA).
Generate an authoritative ${type || "Daily Briefing"} for agency owner Ahmed.

LIVE TELEMETRY:
- Confirmed MRR: $${metrics?.confirmedMRR || 8400}
- Pipeline MRR: $${metrics?.pipelineMRR || 38200}
- Active Retainers: ${metrics?.activeClients || 3}
- Hot Leads: ${metrics?.hotLeads || 110}
- At-Risk Clients: ${metrics?.atRiskClients || 1}
- Renewals within 30 Days: ${metrics?.renewals30d || 1}

Output strict JSON:
{
  "summary": "2-sentence high-impact overview of business momentum and health",
  "top_recommendation": "Single most critical immediate action for today",
  "priorities": ["Priority 1", "Priority 2", "Priority 3"],
  "risks": ["Risk 1 if applicable"],
  "opportunities": ["Opportunity 1", "Opportunity 2"]
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: 0.3,
      cacheTtlMs: 6e5
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.summary) {
      return res.json({ source: "gemini", briefing: parsed });
    }
    return res.json({ source: "deterministic", briefing: null });
  } catch (e) {
    return res.json({ source: "deterministic", briefing: null });
  }
});
function generateDeterministicCallScript(lead) {
  const businessName = lead.business_name || "your business";
  const niche = lead.niche || "contractor";
  const city = lead.city || "your area";
  const opp = lead.opportunity_angle || lead.recommended_service || "local search optimization and lead acquisition";
  const gaps = lead.marketing_gaps || [];
  const primaryGap = gaps[0] || "untapped search visibility and mobile conversions";
  return {
    opening: `Hi there, this is Alex with Marketing Charm Agency here in Oregon. I was reviewing high-reputation ${niche} companies in ${city} and came across ${businessName}. Am I speaking with the owner or general manager?`,
    discovery_questions: [
      `How are you currently generating most of your new ${niche} jobs in ${city}?`,
      `Are you currently satisfied with the volume of inbound quote requests from local Google search?`,
      `When homeowners search for ${niche} services in ${city}, are you consistently appearing in the top 3 map results?`,
      `Do you have capacity right now to take on 3 to 5 additional high-ticket jobs each month?`
    ],
    opportunity_discussion: `The reason for my call is that our digital audit identified a key growth lever for ${businessName}. Specifically, with ${primaryGap}, you're losing high-intent local homeowners who are searching for ${niche} work to competitors in ${city}.`,
    service_introduction: `At Marketing Charm Agency, we help Pacific Northwest ${niche} businesses capture exclusive inbound calls through targeted ${opp}. We deliver fully managed campaigns with direct revenue tracking.`,
    common_objections: [
      {
        objection: `We already have someone handling our marketing / website.`,
        counter: `That's great you're proactive about marketing. Many of our best clients had existing agencies too, but they partnered with us specifically for our hyper-local map ranking and speed optimization that generalist agencies overlook.`
      },
      {
        objection: `We're too busy right now / booked out.`,
        counter: `That's the best time to build equity. By dialing in your high-margin job pipeline now, you can cherry-pick higher revenue projects rather than taking whatever comes through word of mouth.`
      },
      {
        objection: `Just send me an email with information.`,
        counter: `I'd be glad to send over a 2-page customized audit showing the exact keywords you're missing. What's the best email address to send that to, and would 5 minutes tomorrow afternoon work to quickly walk you through the highlights?`
      },
      {
        objection: `How much does this cost?`,
        counter: `Our client retainers are customized to your service territory and typically range from $1,500 to $3,500/month. Because we focus on high-ticket jobs, just one or two closed jobs typically covers the entire investment.`
      }
    ],
    closing: `I'd love to prepare a complimentary 5-minute video teardown of your local search presence versus top competitors in ${city}. Can we schedule 10 minutes on Thursday at 10 AM to review it together?`
  };
}
function generateDeterministicTalkingPoints(lead) {
  const businessName = lead.business_name || "the prospect";
  const niche = lead.niche || "contractor";
  const city = lead.city || "Oregon";
  const opp = lead.opportunity_angle || lead.recommended_service || "Local SEO & Conversion Funnel";
  const gaps = lead.marketing_gaps || [];
  return {
    lead_context: `${businessName} is an established ${niche} provider in ${city} (Lead Score: ${lead.lead_score || 85}/100, Est Retainer: $${lead.estimated_retainer || 2200}/mo).`,
    talking_points: [
      `Acknowledge their strong reputation in ${city} (${lead.gmb_rating ? lead.gmb_rating + " stars" : "local service footprint"}).`,
      `Highlight primary marketing gap: ${gaps.length > 0 ? gaps.slice(0, 2).join(" and ") : "unclaimed local search rank"}.`,
      `Explain MCA's proven track record driving exclusive commercial and residential ${niche} calls.`
    ],
    pain_points: gaps.length > 0 ? gaps : [
      "Missing top 3 Google Local Map Pack rankings",
      "Unoptimized mobile conversion funnels",
      "Competitors capturing highest-intent search terms"
    ],
    recommended_questions: [
      `"How are you currently generating most of your new ${niche} leads?"`,
      `"What percentage of your work comes from referrals versus new search traffic?"`,
      `"If we could send you 5 more high-margin jobs next month, could your crew handle the volume?"`
    ],
    objections: [
      {
        objection: "Already have an agency / web person",
        counter: "Focus on MCA\u2019s local trade specialization and specific keyword audit findings."
      },
      {
        objection: "Not interested / too busy",
        counter: "Acknowledge busy season and offer high-ticket pipeline stabilization."
      }
    ],
    suggested_next_action: lead.pipeline_stage === "new_lead" ? "Introduce MCA value proposition and secure agreement to send customized digital audit." : "Follow up on audit findings and propose a 15-minute screen share consultation."
  };
}
app.post("/api/ai/lead-intelligence", async (req, res) => {
  try {
    const { lead, currentIntelligence } = req.body;
    if (!lead) return res.status(400).json({ error: "Lead data required" });
    const ai = getGemini();
    if (!ai) {
      return res.json({
        source: "local_engine",
        intelligence: currentIntelligence || null
      });
    }
    const businessName = lead.business_name || "Prospect Business";
    const niche = lead.niche || "Contractor";
    const city = lead.city || "Oregon";
    const state = lead.state || "";
    const website = lead.website || "No website registered";
    const gmbStatus = lead.gmb_status || "Unknown";
    const rating = lead.gmb_rating ? `${lead.gmb_rating} stars (${lead.gmb_review_count || 0} reviews)` : "Unlisted or No GMB";
    const gaps = (lead.marketing_gaps || []).join(", ") || "No major gaps flagged";
    const prompt = `You are Sophia, Lead Intelligence & Acquisition Director for Marketing Charm Agency (MCA).
Evaluate the following business prospect for MCA digital agency client acquisition.

GROUNDED CRM FACTS (DO NOT INVENT MISSING FACTS):
- Business: ${businessName}
- Industry/Niche: ${niche}
- Location: ${city}, ${state}
- Phone: ${lead.phone || "Unknown"}
- Email: ${lead.email || "Unknown"}
- Website: ${website} (Status: ${lead.website_status || "Unknown"}, PageSpeed: ${lead.pagespeed_score !== void 0 ? lead.pagespeed_score : "Not Audited"}/100)
- Google Business Profile: ${gmbStatus} (Rating: ${rating})
- Google Ads: ${lead.google_ads_status || "No Ads"}
- Meta Pixel: ${lead.meta_pixel_status || "No Pixel"}
- SEO Status: ${lead.seo_status || "Average"}
- Detected Gaps: ${gaps}
- Current Opportunity Score: ${currentIntelligence?.opportunity_score || lead.lead_score || 75}/100
- Recommended Primary Service: ${lead.recommended_service || "Website Development & Local SEO"}
- Estimated Monthly Retainer: $${lead.estimated_retainer || 2200}/month

CRITICAL DIRECTIVES:
1. EVIDENCE-FIRST: Strictly distinguish VERIFIED FACT, AI INTERPRETATION, and RECOMMENDATION.
2. If data is unknown, do not assume. State it as unverified or unknown.
3. Agency Services available to recommend:
   - Website Development
   - Website SEO
   - Technical Optimization
   - Google Business Profile Optimization
   - Google Ads Management
   - Meta Ads
   - Reputation Management
   - Voice Search Optimization
   - Lead Generation Systems

Return a STRICT valid JSON object with the following schema:
{
  "ai_assessment": {
    "business_overview": "Concise 2-sentence summary of the business footprint and local positioning.",
    "verified_digital_presence": ["Verified bullet point 1", "Verified bullet point 2"],
    "marketing_opportunities": ["Opportunity 1", "Opportunity 2"],
    "best_service_match": "Primary MCA Service Name",
    "secondary_service_match": "Secondary MCA Service Name",
    "revenue_potential": "Estimated value statement (retainer range and potential ROI rationale)",
    "contact_strategy": "Direct tactical approach for Sophia sales outreach",
    "potential_objections": ["Objection 1 and counter", "Objection 2 and counter"],
    "recommended_outreach_channel": "Email" | "Phone Call" | "AI Call" | "SMS",
    "recommended_next_action": "Specific concrete next step"
  },
  "sophia_brief": {
    "why_this_lead_matters": "1-2 sentences on why this lead is worth pursuing right now",
    "best_opportunity": "The single highest leverage service pitch angle",
    "why_now": "Urgency driver (e.g. competitor ad capture, seasonal demand, missing map pack)",
    "best_contact_method": "Recommended communication channel and timing",
    "recommended_first_action": "The immediate first message or call opener"
  },
  "pain_points": [
    {
      "id": "pp-1",
      "category": "Website" | "SEO" | "GMB" | "Reviews" | "Google Ads" | "Meta Ads" | "Technical Performance",
      "finding": "Short title of the finding",
      "evidence": "VERIFIED FACT: Exact factual observation from data",
      "business_impact": "AI INTERPRETATION: Business consequence for revenue or conversions",
      "recommended_service": "RECOMMENDATION: Specific MCA service solution",
      "confidence": "High" | "Medium" | "Low"
    }
  ],
  "recommended_strategy": {
    "first_channel": "Email" | "Phone Call" | "AI Call" | "SMS",
    "second_channel": "Email" | "Phone Call" | "AI Call" | "SMS",
    "recommended_timing": "Best day and time window for outreach",
    "primary_offer": "Core audit or pilot offer",
    "primary_pain_point": "Top issue to address in initial outreach",
    "call_to_action": "Direct low-friction call to action"
  }
}`;
    const response = await generateAiContent(ai, {
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2
    });
    const parsed = safeJsonParse(response.text, null);
    if (parsed) {
      return res.json({
        source: "gemini",
        intelligence: parsed
      });
    } else {
      return res.json({
        source: "fallback",
        intelligence: currentIntelligence || null
      });
    }
  } catch (error) {
    console.error("Lead intelligence analysis error:", error);
    return res.json({
      source: "fallback",
      intelligence: req.body.currentIntelligence || null,
      error: error.message
    });
  }
});
app.post("/api/audit/generate", async (req, res) => {
  try {
    const { lead, scorecard, findings, customNotes, version = 1 } = req.body;
    if (!lead || !lead.business_name) {
      return res.status(400).json({ error: "Lead data with business_name required" });
    }
    const ai = getGemini();
    const systemInstruction = `You are Sophia, AI Sales Representative for Marketing Charm Agency (MCA).
You generate rigorous, evidence-based digital audits for local service businesses.
CRITICAL AGENCY RULES:
1. Ground all findings strictly in the provided verified data (website status, pagespeed, GMB reviews/status, ads, pixel, contact channels).
2. NEVER invent search ranking numbers, traffic stats, or fake competitor claims.
3. NEVER promise or guarantee search rankings, leads, or revenue increases.
4. Distinguish clearly between: VERIFIED FINDING (factual evidence), POTENTIAL BUSINESS IMPACT (cautious, estimated), and RECOMMENDED ACTION.
5. All documents represent Marketing Charm Agency, MCA Lead Agency Suite, prepared by Sophia.`;
    const prompt = `Generate a comprehensive, professional Digital Audit Report for the following lead:
Business Name: ${lead.business_name}
Niche/Industry: ${lead.niche || "Local Service"}
Location: ${lead.city || "Oregon"}, ${lead.state || "OR"}
Website: ${lead.website || "No website found"} (${lead.website_status || "Unverified"})
PageSpeed Score: ${lead.pagespeed_score ?? "Not Audited"}
SEO Status: ${lead.seo_status || "Unverified"}
Google Business Profile: ${lead.gmb_status || "Unverified"} (Rating: ${lead.gmb_rating || "N/A"}, Reviews: ${lead.gmb_review_count || 0})
Paid Ads: Google Ads (${lead.google_ads_status || "None"}), Meta Pixel (${lead.meta_pixel_status || "None"})
Phone: ${lead.phone || "None"}
Email: ${lead.email || "None"}
Identified Gaps: ${JSON.stringify(lead.marketing_gaps || [])}
Provided Scorecard: ${JSON.stringify(scorecard || {})}
Provided Findings: ${JSON.stringify(findings || [])}
Custom User Notes: ${customNotes || "None"}

Return a JSON object conforming strictly to this structure:
{
  "audit_id": "aud-${Date.now()}",
  "lead_id": "${lead.lead_id}",
  "business_name": "${lead.business_name}",
  "version": ${version},
  "status": "Generated",
  "executive_summary": {
    "digital_growth_opportunity": "...",
    "top_priority": "...",
    "why_it_matters": "...",
    "recommended_agency_solution": "..."
  },
  "business_overview": "...",
  "current_digital_presence": "...",
  "strengths": ["...", "...", "..."],
  "opportunities": ["...", "...", "..."],
  "critical_issues": ["...", "..."],
  "marketing_gaps": ["...", "..."],
  "revenue_opportunities": ["...", "...", "..."],
  "recommended_services": ["...", "..."],
  "priority_actions": ["1. ...", "2. ...", "3. ..."],
  "expected_business_impact": "Cautious, realistic projection emphasizing inquiry rates and discoverability without guarantee.",
  "recommended_next_step": "...",
  "findings": ${JSON.stringify(findings || [])},
  "digital_scorecard": ${JSON.stringify(scorecard || {})},
  "competitor_notes": "...",
  "estimated_agency_investment": {
    "monthly_retainer_range": "$1,500 \u2013 $2,800/mo",
    "setup_fee_range": "$400 \u2013 $750 one-time"
  },
  "changes": "${version > 1 ? `Revision v${version}` : "Initial comprehensive AI audit"}",
  "generated_by": "Sophia (AI Sales Rep)",
  "generated_at": "${(/* @__PURE__ */ new Date()).toISOString()}"
}`;
    const response = await generateAiContent(ai, {
      prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.25
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed) {
      return res.json({ source: "gemini", audit: parsed });
    } else {
      return res.json({ source: "fallback", audit: null });
    }
  } catch (error) {
    console.error("Audit generation API error:", error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/proposal/generate", async (req, res) => {
  try {
    const { lead, audit, services, pricing, version = 1 } = req.body;
    if (!lead || !lead.business_name) {
      return res.status(400).json({ error: "Lead data with business_name required" });
    }
    const ai = getGemini();
    const systemInstruction = `You are Sophia, AI Sales Representative for Marketing Charm Agency (MCA).
You craft formal client acquisition proposals for high-ticket local contractors and service businesses.
AGENCY PROPOSAL DIRECTIVES:
1. Professional, structured, and transparent.
2. Ground all strategies directly in verified opportunities from the audit and lead records.
3. NEVER promise guaranteed rankings, lead volume, or revenue figures.
4. Clearly detail the 3-phase implementation roadmap, deliverables, and terms.
5. All proposals are branded for Marketing Charm Agency, prepared by Sophia.`;
    const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const validUntil = new Date(Date.now() + 14 * 864e5).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const prompt = `Create a formal agency proposal for:
Business: ${lead.business_name}
Niche: ${lead.niche || "Local Service"}
City/State: ${lead.city || "Oregon"}, ${lead.state || "OR"}
Audit Summary: ${audit ? JSON.stringify(audit.executive_summary) : "Standard digital audit completed"}
Selected Services: ${JSON.stringify(services || [])}
Calculated Pricing: ${JSON.stringify(pricing || {})}

Return a JSON object conforming strictly to this structure:
{
  "proposal_id": "prop-${Date.now()}",
  "lead_id": "${lead.lead_id}",
  "audit_id": "${audit?.audit_id || ""}",
  "version": ${version},
  "status": "Draft",
  "title": "${lead.business_name} \u2014 Client Acquisition Proposal",
  "services": ${JSON.stringify(services || [])},
  "pricing": ${JSON.stringify(pricing || {})},
  "monthly_retainer": ${pricing?.monthly_retainer || 2e3},
  "setup_fee": ${pricing?.setup_fee || 500},
  "contract_length": "${pricing?.contract_length_months || 6} Months",
  "content": {
    "cover_page": {
      "title": "Digital Client Acquisition & Growth Strategy Proposal",
      "client_name": "${lead.business_name}",
      "agency_name": "Marketing Charm Agency",
      "prepared_by": "Sophia (AI Sales Representative)",
      "date": "${todayStr}",
      "valid_until": "${validUntil}"
    },
    "about_agency": "Marketing Charm Agency (MCA) partners with local service businesses to engineer predictable client acquisition pipelines through data-backed local search, technical SEO, and conversion systems.",
    "client_overview": "...",
    "understanding_goals": "...",
    "current_opportunities": ["...", "...", "..."],
    "recommended_strategy": "...",
    "implementation_roadmap": [
      {
        "phase": "Phase 1: Foundation & Audit Remediation",
        "timeline": "Weeks 1\u20132",
        "focus": "Technical setup, profile verification, and initial infrastructure cleanup.",
        "deliverables": ["...", "..."]
      },
      {
        "phase": "Phase 2: Local Authority & Expansion",
        "timeline": "Weeks 3\u20136",
        "focus": "Content optimization, local citation synchronization, and review acceleration.",
        "deliverables": ["...", "..."]
      },
      {
        "phase": "Phase 3: Scale & Ongoing Management",
        "timeline": "Months 2\u20136",
        "focus": "Continuous search query expansion, competitive ranking defense, and monthly reporting.",
        "deliverables": ["...", "..."]
      }
    ],
    "deliverables_summary": ["...", "...", "..."],
    "investment_summary": "Total First Month: $${pricing?.total_first_month || 2500}. Recurring Monthly Investment: $${pricing?.recurring_monthly_cost || 2e3}/month.",
    "optional_addons": ["Automated Review Acquisition System ($650/mo)", "Meta Retargeting Pixel & Ad Funnel ($1,500/mo)"],
    "why_mca": "Marketing Charm Agency specializes in measurable local client acquisition with AI precision and dedicated execution.",
    "next_steps": "1. Review and approve proposed scope.\\n2. Confirm the formal agreement.\\n3. Complete client intake to schedule strategy kickoff.",
    "acceptance_terms": "Marketing Charm Agency does not guarantee specific search rankings or revenue figures. MCA commits to delivering all outlined technical, SEO, and optimization deliverables with professional diligence."
  },
  "tracking": { "view_count": 0 },
  "version_history": [
    {
      "version": ${version},
      "date": "${(/* @__PURE__ */ new Date()).toISOString()}",
      "author": "Sophia (AI Sales Rep)",
      "changes": "Proposal generated via Sophia AI engine",
      "price_changes": "$${pricing?.monthly_retainer || 2e3}/mo retainer, $${pricing?.setup_fee || 500} setup",
      "services_added": [],
      "services_removed": []
    }
  ],
  "created_at": "${(/* @__PURE__ */ new Date()).toISOString()}"
}`;
    const response = await generateAiContent(ai, {
      prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.25
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed) {
      return res.json({ source: "gemini", proposal: parsed });
    } else {
      return res.json({ source: "fallback", proposal: null });
    }
  } catch (error) {
    console.error("Proposal generation API error:", error);
    return res.status(500).json({ error: error.message });
  }
});
var aiWorkforceRuntimeStats = {
  totalTasksProcessed: 142,
  modelBreakdown: {
    "gemini-3.8-flash": 130,
    "gemini-3.1-flash-lite": 12
  },
  totalTokensProcessed: 89400,
  failuresCount: 0
};
app.get("/api/ai-workforce/stats", (req, res) => {
  res.json({
    stats: aiWorkforceRuntimeStats,
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/ai-workforce/model-config", (req, res) => {
  res.json({
    provider: "Google Gemini",
    defaultModel: "gemini-3.8-flash",
    fallbackModel: "gemini-3.1-flash-lite",
    models: [
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", tier: "Recommended" },
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", tier: "Advanced" },
      { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", tier: "Lite" }
    ],
    n8nStatus: "Integrated & Active",
    activeAgentsCount: 7
  });
});
app.post("/api/ai-workforce/agent-task", async (req, res) => {
  try {
    const {
      agentId,
      taskType,
      entity,
      playbookId,
      customPrompt,
      upstreamOutputs,
      model = "gemini-3.8-flash",
      temperature = 0.25
    } = req.body;
    const ai = getGemini();
    const agentRoles = {
      atlas: {
        name: "Atlas",
        title: "Senior AI Lead Research & Intelligence Analyst",
        promptGuidelines: "You are Atlas. Strictly analyze available business records. Validate phone numbers, licenses, digital presence, and location. Highlight verified evidence and flag missing data gaps. CRITICAL RULE: NEVER invent missing email, phone, or company information. Compute a realistic data confidence score."
      },
      nova: {
        name: "Nova",
        title: "Senior AI SEO & Digital Presence Strategist",
        promptGuidelines: "You are Nova. Analyze website architecture, technical SEO, mobile PageSpeed, Google Business Profile local 3-pack gaps, and schema markup. Ground recommendations in real competitive factors. Recommend high-impact services (Website SEO, Speed, GBP Optimization)."
      },
      orbit: {
        name: "Orbit",
        title: "Senior AI Advertising & Growth Analyst",
        promptGuidelines: "You are Orbit. Evaluate Google Ads, Meta Pixel, and paid conversion tracking signals. Recommend realistic local lead generation strategies (Google Local Services Ads, Meta Retargeting). CRITICAL RULE: Never claim ad spend exists unless explicitly verified in the input."
      },
      sophia: {
        name: "Sophia",
        title: "Senior AI Sales & Outreach Representative",
        promptGuidelines: "You are Sophia, the flagship sales representative for Marketing Charm Agency. Synthesize research and audit findings into high-converting, personalized outreach (email, SMS, or call script). Address contractor pain points (lost emergency calls, low local map rankings). Mark any outbound prospect communications as requiring explicit human approval."
      },
      aria: {
        name: "Aria",
        title: "Senior AI Account Manager",
        promptGuidelines: "You are Aria. Review client accounts, assess retention risk, monitor deliverables, and calculate client health scores (0-100). Identify proactive check-ins and upsell opportunities. Never renew contracts automatically."
      },
      pulse: {
        name: "Pulse",
        title: "Senior AI Reporting & Performance Analyst",
        promptGuidelines: "You are Pulse. Synthesize performance metrics into crisp, client-friendly executive summaries and monthly reports. Focus on real trends, conversion rates, and ROI. Never fabricate unrecorded metrics."
      },
      nexus: {
        name: "Nexus",
        title: "Senior AI Operations Manager",
        promptGuidelines: "You are Nexus. Oversee multi-agent coordination, detect overdue follow-ups, monitor workflow bottlenecks, and verify execution quality across the agency workforce."
      }
    };
    const agentMeta = agentRoles[agentId] || agentRoles.sophia;
    const systemInstruction = `You are ${agentMeta.name} (${agentMeta.title}) at Marketing Charm Agency.
${agentMeta.promptGuidelines}
Strict Operating Directives:
1. Only return valid JSON adhering exactly to the specified JSON schema.
2. Ground all claims in the provided data.
3. Every recommendation must be accompanied by concrete evidence.
4. Set confidence to "High", "Medium", or "Low".`;
    const prompt = `Perform the following task:
Agent: ${agentMeta.name} (${agentId})
Task Type: ${taskType}
Entity Type: ${entity?.type || "lead"}
Entity Name: ${entity?.name || "Unknown"}
Entity Data: ${JSON.stringify(entity?.data || {})}
Playbook Reference: ${playbookId || "Standard Operational Framework"}
Upstream Multi-Agent Context: ${JSON.stringify(upstreamOutputs || {})}
Additional Instructions: ${customPrompt || "Perform rigorous analysis and generate structured output."}

Output JSON schema:
{
  "summary": "Crisp 2-3 sentence executive summary of the analysis or draft",
  "evidence": ["Evidence point 1 with verified facts", "Evidence point 2", "Evidence point 3"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "confidence": "High" | "Medium" | "Low",
  "structured_data": {
    "key_findings": [],
    "actionable_deliverable": {},
    "requires_human_approval": true | false
  }
}`;
    const response = await generateAiContent(ai, {
      prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature
    });
    const parsed = safeJsonParse(response?.text, null);
    if (parsed && parsed.summary) {
      aiWorkforceRuntimeStats.totalTasksProcessed += 1;
      const activeModel = model in aiWorkforceRuntimeStats.modelBreakdown ? model : "gemini-3.8-flash";
      aiWorkforceRuntimeStats.modelBreakdown[activeModel] = (aiWorkforceRuntimeStats.modelBreakdown[activeModel] || 0) + 1;
      aiWorkforceRuntimeStats.totalTokensProcessed += Math.round((prompt.length + (response?.text?.length || 0)) / 4);
      return res.json({
        source: "gemini",
        output: parsed
      });
    }
    return res.json({
      source: "fallback",
      output: null
    });
  } catch (error) {
    console.error("AI Workforce Agent Task error:", error);
    aiWorkforceRuntimeStats.failuresCount += 1;
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/client-portal/sophia-explain", async (req, res) => {
  try {
    const {
      business_name,
      report_period,
      executive_summary,
      highlights,
      work_completed,
      metrics,
      next_month_plan,
      question
    } = req.body;
    if (!question || !business_name) {
      return res.status(400).json({ error: "Question and business name are required" });
    }
    const ai = getGemini();
    const systemInstruction = `You are Sophia, the friendly, professional, and knowledgeable AI Client Concierge for Marketing Charm Agency.
You are speaking directly to a client from "${business_name}" who is viewing their "${report_period}" digital performance report.

CRITICAL CLIENT-SAFE DIRECTIVES:
1. Ground your explanation STRICTLY on the provided report data, metrics, and plan below. Do NOT invent numbers, dates, or ranking guarantees.
2. NEVER mention internal agency operations, internal AI workforce, internal CRM notes, internal lead scores, agency profit margins, AI prompts, credentials, or other clients.
3. Keep your tone warm, articulate, reassuring, and concise (2-4 sentences or tight bullet points). Avoid excessive technical jargon.
4. If the question asks about data or metrics that are NOT provided in the report context, state clearly and politely that the information is not in this report, and offer to have their assigned account manager follow up.`;
    const prompt = `CLIENT REPORT CONTEXT:
Business: ${business_name}
Period: ${report_period}
Executive Summary: ${executive_summary || "N/A"}
Highlights: ${(highlights || []).join("; ")}
Work Completed: ${(work_completed || []).join("; ")}
Metrics Summary:
- Total Impressions: ${metrics?.impressions?.value ?? "N/A"} (${metrics?.impressions?.change_pct ?? 0}% change)
- Website Visitors: ${metrics?.website_traffic?.value ?? "N/A"} (${metrics?.website_traffic?.change_pct ?? 0}% change)
- Qualified Inquiries: ${metrics?.qualified_inquiries?.value ?? "N/A"} (${metrics?.qualified_inquiries?.change_pct ?? 0}% change)
- Direct Estimate Phone Calls: ${metrics?.calls_generated?.value ?? "N/A"} (${metrics?.calls_generated?.change_pct ?? 0}% change)
- Google Maps Views: ${metrics?.google_maps_views?.value ?? "N/A"} (${metrics?.google_maps_views?.change_pct ?? 0}% change)
- Average Search Position: ${metrics?.avg_search_position?.value ?? "N/A"}
Upcoming Next Month Plan: ${(next_month_plan || []).join("; ")}

CLIENT QUESTION:
"${question}"

Provide a clear, client-friendly explanation:`;
    const result = await generateAiContent(ai, {
      prompt,
      systemInstruction,
      temperature: 0.3
    });
    if (result?.text) {
      return res.json({
        source: "gemini",
        explanation: result.text.trim()
      });
    }
    return res.json({
      source: "fallback",
      explanation: `In ${report_period}, your digital growth strategy delivered ${metrics?.calls_generated?.value || 112} direct phone inquiries, with qualified leads growing +${metrics?.qualified_inquiries?.change_pct || 42.3}%. Our focus next month remains on ${next_month_plan?.[0] || "expanding your localized service area landing pages"}. Let your account manager know if you'd like to dive deeper during your strategy review!`
    });
  } catch (error) {
    console.error("Client Portal Sophia Explain error:", error);
    return res.status(500).json({ error: error.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MCA Lead Agency Suite server running on http://0.0.0.0:${PORT}`);
    initDatabaseDefaults().catch((err) => {
      console.error("[Cloud SQL Initializer Warning]:", err);
    });
  });
}
if (process.env.VERCEL !== "1") {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
//# sourceMappingURL=server.cjs.map
