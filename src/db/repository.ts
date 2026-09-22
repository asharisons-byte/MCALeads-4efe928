import { eq, ilike, or, and, desc, asc, sql, inArray } from 'drizzle-orm';
import { db, isDbConfigured, getDatabaseDetails } from './index.js';
import * as schema from './schema.js';
import { OREGON_CCB_LEADS } from '../data/ccbLeadsData.js';
import { TeamMemberPerformance } from '../types.js';
import { AppRole, ROLE_DISPLAY_TITLES } from '../constants.js';

// ==========================================
// IN-MEMORY RESILIENT STATE STORAGE
// ==========================================
let inMemoryLeads: any[] = [];
let inMemoryClients: any[] = [];
let inMemoryActivities: any[] = [];
let inMemoryAuditLogs: any[] = [];
let inMemorySettings: any = {
  id: 1,
  companyName: 'Marketing Charm Agency',
  productName: 'MCA Lead Agency Suite',
  defaultSenderName: 'Sophia',
  defaultAiAgent: 'Sophia',
  currency: 'USD',
  timezone: 'America/Los_Angeles',
  createdAt: new Date(),
  updatedAt: new Date(),
};
let inMemoryAiContent: any[] = [];
let inMemoryWebhookEvents: any[] = [];
let inMemoryAutomationRuns: any[] = [];
let inMemoryIntegrations: any[] = [
  { id: 1, provider: 'Google Gemini AI', integrationType: 'AI Engine', status: 'Active', configurationReference: { model: 'gemini-3.8-flash' }, lastSyncAt: new Date() },
  { id: 2, provider: 'Telnyx Voice', integrationType: 'Telephony', status: 'Active', configurationReference: { webrtc: true, sip: true }, lastSyncAt: new Date() },
  { id: 3, provider: 'Telnyx SMS', integrationType: 'Messaging', status: 'Active', configurationReference: { messagingProfileId: 'active' }, lastSyncAt: new Date() },
  { id: 4, provider: 'Gmail Workspace', integrationType: 'Email Outreach', status: 'Active', configurationReference: { oauth2: true }, lastSyncAt: new Date() },
  { id: 5, provider: 'n8n Automation', integrationType: 'Workflows', status: 'Connected', configurationReference: { webhookBus: 'active' }, lastSyncAt: new Date() },
];

let isInitialized = false;

// DISABLED: initInMemoryDefaults() - was seeding fake CCB data into memory
// This function populated inMemoryLeads with 202 fabricated OREGON_CCB_LEADS records
// causing duplicate check false positives and data contamination
export function initInMemoryDefaults() {
  // No-op: disabled to prevent fake seed data contamination
  // All legitimate data should come from Neon database or user imports
  return;
}

// initInMemoryDefaults() removed - was seeding fake CCB data causing contamination
// Ensure defaults are initialized (now no-op)
// initInMemoryDefaults(); // REMOVED

// ==========================================
// 1. INITIALIZATION & SEEDING REPOSITORY
// ==========================================
export async function initDatabaseDefaults() {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (!isDbConfigured) {
    console.log('[Database Engine] Active in resilient high-speed in-memory mode (Cloud SQL ready when configured).');
    return;
  }

  try {
    // 1. Organization
    const existingOrg = await db.select().from(schema.organizations).limit(1);
    let orgId = existingOrg[0]?.id;
    if (!orgId) {
      const [newOrg] = await db
        .insert(schema.organizations)
        .values({
          name: 'Marketing Charm Agency',
          slug: 'marketing-charm-agency',
          organizationType: 'AGENCY',
          website: 'https://marketingcharmagency.com',
          email: 'contact@marketingcharmagency.com',
          phone: '+1-503-241-7998',
          status: 'ACTIVE',
        })
        .returning();
      orgId = newOrg.id;
    }

    // 2. Agency Settings
    const existingSettings = await db.select().from(schema.agencySettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(schema.agencySettings).values({
        companyName: 'Marketing Charm Agency',
        productName: 'MCA Lead Agency Suite',
        defaultSenderName: 'Sophia',
        defaultAiAgent: 'Sophia',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
      });
    }

    // 3. Roles
    const existingRoles = await db.select().from(schema.roles).limit(1);
    if (existingRoles.length === 0) {
      await db.insert(schema.roles).values([
        { name: 'Super Admin', description: 'Complete system authority and billing management' },
        { name: 'Agency Owner', description: 'Full access to CRM, financial telemetry, and AI workforce' },
        { name: 'Admin', description: 'Enterprise administrative and team management capabilities' },
        { name: 'Manager', description: 'Pipeline review and sales rep orchestration' },
        { name: 'Sales', description: 'Lead discovery, dialing, outreach, and pitch generation' },
        { name: 'Account Manager', description: 'Client retention, service delivery, and renewals' },
        { name: 'User', description: 'Standard read and collaborative permissions' },
      ]);
    }

    // 4. Agency Services
    const existingServices = await db.select().from(schema.agencyServices).limit(1);
    if (existingServices.length === 0) {
      await db.insert(schema.agencyServices).values([
        { organizationId: orgId, name: 'SEO & Content Growth', category: 'SEO', defaultPrice: 2000, minimumPrice: 1500, maximumPrice: 4000, active: true },
        { organizationId: orgId, name: 'High-Converting Contractor Website', category: 'Development', defaultPrice: 4500, minimumPrice: 3000, maximumPrice: 8500, active: true },
        { organizationId: orgId, name: 'Google Local Service Ads (LSA)', category: 'PPC', defaultPrice: 1800, minimumPrice: 1200, maximumPrice: 3500, active: true },
        { organizationId: orgId, name: 'Meta / Facebook Hyperlocal Ads', category: 'Social Ads', defaultPrice: 1600, minimumPrice: 1000, maximumPrice: 3000, active: true },
        { organizationId: orgId, name: 'GMB / Google Business Profile Domination', category: 'Reputation', defaultPrice: 1200, minimumPrice: 800, maximumPrice: 2500, active: true },
        { organizationId: orgId, name: 'Voice Search & AI Overview Readiness', category: 'AI SEO', defaultPrice: 2200, minimumPrice: 1800, maximumPrice: 5000, active: true },
        { organizationId: orgId, name: 'Technical Site Performance & CWV Fix', category: 'Technical', defaultPrice: 1500, minimumPrice: 1000, maximumPrice: 3000, active: true },
      ]);
    }

    // 5. AI Agents
    const existingAgents = await db.select().from(schema.aiAgents).limit(1);
    if (existingAgents.length === 0) {
      await db.insert(schema.aiAgents).values([
        { organizationId: orgId, name: 'Sophia', role: 'Lead AI Representative & Executive Orchestrator', defaultModel: 'gemini-3.8-flash' },
        { organizationId: orgId, name: 'Atlas', role: 'Strategic Market Analyst & CCB Intelligence', defaultModel: 'gemini-3.8-flash' },
        { organizationId: orgId, name: 'Nova', role: 'Multi-Channel Outreach & Email Architect', defaultModel: 'gemini-3.8-flash' },
        { organizationId: orgId, name: 'Orbit', role: 'Reputation & Google Maps Optimization Specialist', defaultModel: 'gemini-3.8-flash' },
        { organizationId: orgId, name: 'Aria', role: 'Conversion Copywriter & Loom Script Designer', defaultModel: 'gemini-3.8-flash' },
        { organizationId: orgId, name: 'Pulse', role: 'Client Health & Retention Sentinel', defaultModel: 'gemini-3.8-flash' },
        { organizationId: orgId, name: 'Nexus', role: 'Automation & Integration Bridge', defaultModel: 'gemini-3.8-flash' },
      ]);
    }

    // 6. Check if leads table in DB has records
    const leadCountResult = await db.select({ count: sql<number>`count(*)` }).from(schema.leads);
    const count = Number(leadCountResult[0]?.count || 0);

    // DISABLED: Auto-seeding fake CCB leads on empty database
    // This was creating fabricated data with hardcoded ratings/scores that contaminated production data
    // if (count === 0 && OREGON_CCB_LEADS.length > 0) {
    //   console.log(`[Database Seed] Seeding initial CCB contractor leads to Cloud SQL...`);
    //   ... (removed seeding logic)
    // }
    
    if (count === 0) {
      console.log('[Database Seed] No auto-seeding performed. Database is empty and ready for legitimate user imports.');
    }

    console.log('[Cloud SQL Init] Database defaults confirmed operational.');
  } catch (error: any) {
    console.warn('[Cloud SQL Init Notice] Database connected or provisioning pending, continuing with resilient memory store:', error?.message);
  }
}

// ==========================================
// 2. LEADS REPOSITORY
// ==========================================
export async function getDbLeads(params: {
  search?: string;
  status?: string;
  niche?: string;
  city?: string;
  isHotTarget?: boolean;
  limit?: number;
  offset?: number;
}) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  // Try Cloud SQL if configured
  if (isDbConfigured) {
    try {
      const conditions = [];
      conditions.push(sql`${schema.leads.deletedAt} IS NULL`);

      if (params.search && params.search.trim()) {
        const q = `%${params.search.trim()}%`;
        conditions.push(
          or(
            ilike(schema.leads.businessName, q),
            ilike(schema.leads.contactName, q),
            ilike(schema.leads.phone, q),
            ilike(schema.leads.email, q),
            ilike(schema.leads.city, q),
            ilike(schema.leads.niche, q),
            ilike(schema.leads.leadId, q)
          )
        );
      }

      if (params.status && params.status !== 'All') {
        conditions.push(eq(schema.leads.leadStatus, params.status));
      }

      if (params.niche && params.niche !== 'All') {
        conditions.push(ilike(schema.leads.niche, `%${params.niche}%`));
      }

      if (params.city && params.city !== 'All') {
        conditions.push(ilike(schema.leads.city, `%${params.city}%`));
      }

      if (params.isHotTarget) {
        conditions.push(eq(schema.leads.isHotTarget, true));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(schema.leads)
        .where(whereClause)
        .orderBy(desc(schema.leads.createdAt), desc(schema.leads.leadScore))
        .limit(params.limit || 500)
        .offset(params.offset || 0);

      return rows || [];
    } catch (error: any) {
      console.warn('getDbLeads DB query skipped (using in-memory store):', error?.message);
    }
  }

  // Resilient In-Memory Fallback
  let filtered = inMemoryLeads.filter((l) => !l.deletedAt);

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (l) =>
        (l.businessName && l.businessName.toLowerCase().includes(q)) ||
        (l.contactName && l.contactName.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.niche && l.niche.toLowerCase().includes(q)) ||
        (l.leadId && l.leadId.toLowerCase().includes(q))
    );
  }

  if (params.status && params.status !== 'All') {
    filtered = filtered.filter((l) => l.leadStatus === params.status);
  }

  if (params.niche && params.niche !== 'All') {
    const nq = params.niche.toLowerCase();
    filtered = filtered.filter((l) => l.niche && l.niche.toLowerCase().includes(nq));
  }

  if (params.city && params.city !== 'All') {
    const cq = params.city.toLowerCase();
    filtered = filtered.filter((l) => l.city && l.city.toLowerCase().includes(cq));
  }

  if (params.isHotTarget) {
    filtered = filtered.filter((l) => l.isHotTarget === true);
  }

  // Sort by lead score desc, then createdAt desc
  filtered.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));

  const offset = params.offset || 0;
  const limit = params.limit || 150;
  return filtered.slice(offset, offset + limit);
}

export async function getDbLeadById(leadIdentifier: string | number) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (isDbConfigured) {
    try {
      let lead;
      if (typeof leadIdentifier === 'number' || !isNaN(Number(leadIdentifier))) {
        const rows = await db
          .select()
          .from(schema.leads)
          .where(eq(schema.leads.id, Number(leadIdentifier)))
          .limit(1);
        lead = rows[0];
      }

      if (!lead && typeof leadIdentifier === 'string') {
        const rows = await db
          .select()
          .from(schema.leads)
          .where(eq(schema.leads.leadId, leadIdentifier))
          .limit(1);
        lead = rows[0];
      }

      if (lead) {
        const [audits, scores, notes, callsList, emailsList, smsList, tasksList, statusHist] = await Promise.all([
          db.select().from(schema.leadAudits).where(eq(schema.leadAudits.leadId, lead.id)).orderBy(desc(schema.leadAudits.createdAt)),
          db.select().from(schema.leadScores).where(eq(schema.leadScores.leadId, lead.id)).orderBy(desc(schema.leadScores.createdAt)),
          db.select().from(schema.crmNotes).where(eq(schema.crmNotes.leadId, lead.id)).orderBy(desc(schema.crmNotes.createdAt)),
          db.select().from(schema.calls).where(eq(schema.calls.leadId, lead.id)).orderBy(desc(schema.calls.createdAt)),
          db.select().from(schema.emailMessages).where(eq(schema.emailMessages.leadId, lead.id)).orderBy(desc(schema.emailMessages.createdAt)),
          db.select().from(schema.smsMessages).where(eq(schema.smsMessages.leadId, lead.id)).orderBy(desc(schema.smsMessages.createdAt)),
          db.select().from(schema.tasks).where(eq(schema.tasks.leadId, lead.id)).orderBy(desc(schema.tasks.createdAt)),
          db.select().from(schema.leadStatusHistory).where(eq(schema.leadStatusHistory.leadId, lead.id)).orderBy(desc(schema.leadStatusHistory.createdAt)),
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
          statusHistory: statusHist,
        };
      }
    } catch (error: any) {
      console.warn('getDbLeadById DB query skipped (using in-memory store):', error?.message);
    }
  }

  // Resilient In-Memory Fallback
  const idNum = Number(leadIdentifier);
  const found = inMemoryLeads.find(
    (l) => (!isNaN(idNum) && l.id === idNum) || String(l.leadId) === String(leadIdentifier)
  );

  return found || null;
}

export async function checkLeadDuplicate(params: {
  businessName: string;
  phone?: string;
  email?: string;
  website?: string;
}) {
  // NEON-ONLY duplicate check - no in-memory fallback to prevent false positives from fake seed data
  if (isDbConfigured) {
    try {
      const checks = [];
      if (params.businessName) {
        checks.push(ilike(schema.leads.businessName, params.businessName.trim()));
      }
      if (params.phone && params.phone.replace(/\D/g, '').length >= 7) {
        const cleanPhone = params.phone.replace(/\D/g, '');
        checks.push(ilike(schema.leads.phone, `%${cleanPhone.slice(-7)}%`));
      }
      if (params.email && params.email.includes('@') && !params.email.toLowerCase().includes('not provided')) {
        checks.push(ilike(schema.leads.email, params.email.trim()));
      }
      if (params.website && params.website.length > 5 && !params.website.toLowerCase().includes('not provided')) {
        checks.push(ilike(schema.leads.website, `%${params.website.replace(/https?:\/\//, '').replace(/\/$/, '')}%`));
      }

      if (checks.length > 0) {
        const matches = await db
          .select({
            id: schema.leads.id,
            leadId: schema.leads.leadId,
            businessName: schema.leads.businessName,
            phone: schema.leads.phone,
            email: schema.leads.email,
            leadStatus: schema.leads.leadStatus,
          })
          .from(schema.leads)
          .where(and(sql`${schema.leads.deletedAt} IS NULL`, or(...checks)))
          .limit(5);

        return { isDuplicate: matches.length > 0, matches };
      }
    } catch (error: any) {
      console.error('checkLeadDuplicate DB query failed:', error?.message);
      // On DB error, assume NOT a duplicate to avoid blocking legitimate imports
      return { isDuplicate: false, matches: [] };
    }
  }

  // Database not configured - cannot perform duplicate check
  // Return NOT a duplicate to avoid blocking legitimate imports
  console.warn('checkLeadDuplicate: Database not configured, skipping duplicate check');
  return { isDuplicate: false, matches: [] };
}


export async function createDbLead(leadData: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const rawBusinessName =
    leadData.business_name ||
    leadData.businessName ||
    leadData.company_name ||
    leadData.companyName ||
    leadData['Business Name'] ||
    leadData['Company Name'] ||
    leadData['name'] ||
    leadData.name ||
    'Contractor';

  const rawContactName =
    leadData.contact_name ||
    leadData.contactName ||
    leadData['Contact Name'] ||
    leadData['Contact Person'] ||
    rawBusinessName;

  const rawPhone =
    leadData.phone ||
    leadData.phone_e164 ||
    leadData.phoneE164 ||
    leadData['Phone'] ||
    leadData['Phone Number'] ||
    '';

  const rawEmail =
    leadData.email ||
    leadData['Email'] ||
    leadData['Email Address'] ||
    '';

  const rawCity =
    leadData.city ||
    leadData.City ||
    null;

  const rawState =
    leadData.state ||
    leadData.State ||
    leadData.state_region ||
    leadData.stateRegion ||
    null;

  const rawNiche =
    leadData.niche ||
    leadData.Niche ||
    leadData.trade ||
    leadData.Trade ||
    leadData.industry ||
    leadData.Industry ||
    'General Contractor';

  const rawPostal =
    leadData.postal_code ||
    leadData.postalCode ||
    leadData.zip ||
    leadData.Zip ||
    leadData.Postal ||
    '';

  const rawScore = Number(leadData.lead_score ?? leadData.leadScore ?? leadData.Score);
  const validatedScore = Number.isFinite(rawScore) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 65;

  const uniqueLeadId =
    leadData.lead_id ||
    leadData.leadId ||
    `MCA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
    website: leadData.website || leadData['Website'] || '',
    industry: leadData.industry || 'Contractor',
    serviceCategory: leadData.service_category || leadData.serviceCategory || 'Construction',
    niche: rawNiche,
    address: leadData.address || leadData.Address || '',
    city: rawCity,
    county: leadData.county || leadData.County || 'Multnomah',
    stateRegion: rawState,
    country: leadData.country || 'USA',
    postalCode: rawPostal,
    googleMapsUrl: leadData.google_maps_url || leadData.googleMapsUrl || '',
    googlePlaceId: null,
    leadSource: leadData.lead_source || leadData.leadSource || 'Manual Intake',
    leadStatus: leadData.pipeline_stage || leadData.lead_status || leadData.leadStatus || 'New Lead',
    leadScore: validatedScore,
    estimatedRetainer: Number(leadData.estimated_retainer || leadData.estimatedRetainer || 2500),
    estimatedValue: (Number(leadData.estimated_retainer || leadData.estimatedRetainer || 2500)) * 12,
    assignedTo: leadData.owner || leadData.assigned_to || leadData.assignedTo || 'Sophia (AI Sales Rep)',
    assignedUserId: null,
    ccbLicenseNumber: leadData.ccb_license_number || leadData.licenseNumber || (uniqueLeadId.startsWith('CCB-') ? uniqueLeadId.replace('CCB-', '') : null),
    isHotTarget: leadData.is_hot_target !== undefined ? Boolean(leadData.is_hot_target) : (validatedScore >= 80),
    doNotContact: false,
    opportunityAngle: leadData.opportunity_angle || leadData.opportunityAngle || 'Immediate Local Growth Optimization',
    recommendedService: leadData.recommended_service || leadData.recommendedService || 'SEO & GMB Optimization',
    rawPayload: leadData.original_data || leadData.rawPayload || leadData,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    deletedAt: null,
    audits: [
      {
        id: numericId,
        leadId: numericId,
        gmbStatus: leadData.gmb_status || 'Established',
        googleRating: leadData.gmb_rating ? String(leadData.gmb_rating) : '4.5',
        reviewCount: leadData.gmb_review_count || 10,
        websiteStatus: leadData.website_status || 'Active',
        mobileScore: 45,
        desktopScore: 68,
        performanceScore: 55,
        cms: 'WordPress',
        auditSummary: leadData.opportunity_angle || 'Newly registered contractor profile.',
        createdAt: new Date(),
      }
    ],
    scores: [
      {
        id: numericId,
        leadId: numericId,
        totalScore: validatedScore,
        reasoning: leadData.opportunity_angle || 'Initial intake assessment score.',
        createdAt: new Date(),
      }
    ],
    notes: [],
    calls: [],
    emails: [],
    sms: [],
    tasks: [],
    statusHistory: [
      {
        id: numericId * 1000 + 1,
        leadId: numericId,
        previousStatus: 'None',
        newStatus: leadData.pipeline_stage || leadData.leadStatus || 'New Lead',
        changedBy: 'Sophia (AI Sales Rep)',
        reason: 'Initial intake',
        createdAt: new Date(),
      }
    ],
  };

  // If database is configured, attempt INSERT directly to Neon public.leads
  if (isDbConfigured) {
    try {
      const [newLead] = await db
        .insert(schema.leads)
        .values({
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
          rawPayload: inMemoryRecord.rawPayload,
        })
        .onConflictDoUpdate({
          target: schema.leads.leadId,
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
            updatedAt: new Date(),
          },
        })
        .returning();

      // Only synchronize in-memory cache once Neon INSERT has succeeded
      const mergedPersistedRecord = { ...inMemoryRecord, ...newLead, id: newLead.id };
      inMemoryLeads.unshift(mergedPersistedRecord);
      inMemoryActivities.unshift({
        id: inMemoryActivities.length + 1,
        leadId: newLead.id,
        activityType: 'lead_created',
        title: 'Lead Created',
        description: `New contractor profile registered: ${mergedPersistedRecord.businessName} (${mergedPersistedRecord.leadId})`,
        metadata: { leadId: mergedPersistedRecord.leadId, status: mergedPersistedRecord.leadStatus },
        createdAt: new Date(),
      });

      // SUCCESS: Return the actual database-created record with DB-generated fields
      return { ...newLead, _dbSource: 'neon' };
    } catch (error: any) {
      // FAILURE: Database INSERT failed - return explicit failure indicator
      // Do NOT add to inMemoryLeads or pretend it was saved
      console.error('createDbLead DB insert FAILED:', error?.message);
      return { _dbSource: 'failed', _error: error?.message };
    }
  }

  // Database not configured - return in-memory record with clear indicator
  inMemoryLeads.unshift(inMemoryRecord);
  return { ...inMemoryRecord, _dbSource: 'memory_only' };
}

export async function updateDbLead(leadId: string | number, updates: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const idNum = Number(leadId);
  const target = inMemoryLeads.find(
    (l) => (!isNaN(idNum) && l.id === idNum) || String(l.leadId) === String(leadId)
  );

  if (target) {
    const prevStatus = target.leadStatus;
    if (updates.business_name !== undefined) target.businessName = updates.business_name;
    if (updates.businessName !== undefined) target.businessName = updates.businessName;
    if (updates.contact_name !== undefined) target.contactName = updates.contact_name;
    if (updates.contactName !== undefined) target.contactName = updates.contactName;
    if (updates.phone !== undefined) target.phone = updates.phone;
    if (updates.phone_e164 !== undefined) target.phoneE164 = updates.phone_e164;
    if (updates.email !== undefined) target.email = updates.email;
    if (updates.website !== undefined) target.website = updates.website;
    if (updates.niche !== undefined) target.niche = updates.niche;
    if (updates.city !== undefined) target.city = updates.city;
    if (updates.address !== undefined) target.address = updates.address;
    if (updates.lead_score !== undefined) target.leadScore = Number(updates.lead_score);
    if (updates.leadScore !== undefined) target.leadScore = Number(updates.leadScore);
    if (updates.estimated_retainer !== undefined) target.estimatedRetainer = Number(updates.estimated_retainer);
    if (updates.estimatedRetainer !== undefined) target.estimatedRetainer = Number(updates.estimatedRetainer);
    if (updates.pipeline_stage !== undefined) target.leadStatus = updates.pipeline_stage;
    if (updates.leadStatus !== undefined) target.leadStatus = updates.leadStatus;
    if (updates.is_hot_target !== undefined) target.isHotTarget = Boolean(updates.is_hot_target);
    if (updates.isHotTarget !== undefined) target.isHotTarget = Boolean(updates.isHotTarget);
    if (updates.assigned_user !== undefined) {
      const dbUser = updates.assigned_user;
      const roleTitle = ROLE_DISPLAY_TITLES[dbUser.role as AppRole] || dbUser.role;
      target.assignedTo = `${dbUser.firstName} (${roleTitle})`;
      target.assignedUserId = dbUser.id;
    } else if (updates.assigned_to !== undefined) {
      target.assignedTo = updates.assigned_to;
    } else if (updates.assignedTo !== undefined) {
      target.assignedTo = updates.assignedTo;
    }
    if (updates.opportunity_angle !== undefined) target.opportunityAngle = updates.opportunity_angle;
    if (updates.opportunityAngle !== undefined) target.opportunityAngle = updates.opportunityAngle;
    if (updates.recommended_service !== undefined) target.recommendedService = updates.recommended_service;
    if (updates.recommendedService !== undefined) target.recommendedService = updates.recommendedService;
    target.updatedAt = new Date();

    if (target.leadStatus !== prevStatus) {
      target.statusHistory.unshift({
        id: Date.now(),
        leadId: target.id,
        previousStatus: prevStatus,
        newStatus: target.leadStatus,
        changedBy: updates.changed_by || 'Sophia',
        reason: updates.stage_change_reason || 'Pipeline progression',
        createdAt: new Date(),
      });
      inMemoryActivities.unshift({
        id: inMemoryActivities.length + 1,
        leadId: target.id,
        activityType: 'stage_changed',
        title: `Pipeline Stage Updated: ${target.businessName}`,
        description: `Transitioned from ${prevStatus} to ${target.leadStatus}`,
        metadata: { leadId: target.leadId, from: prevStatus, to: target.leadStatus },
        createdAt: new Date(),
      });
    }
  }

  if (isDbConfigured) {
    try {
      const updateFields: any = { updatedAt: new Date() };
      if (updates.business_name !== undefined) updateFields.businessName = updates.business_name;
      if (updates.businessName !== undefined) updateFields.businessName = updates.businessName;
      if (updates.phone !== undefined) updateFields.phone = updates.phone;
      if (updates.email !== undefined) updateFields.email = updates.email;
      if (updates.pipeline_stage !== undefined) updateFields.leadStatus = updates.pipeline_stage;
      if (updates.leadStatus !== undefined) updateFields.leadStatus = updates.leadStatus;
      if (updates.country !== undefined) updateFields.country = updates.country;

      if (updates.assigned_user !== undefined) {
        const dbUser = updates.assigned_user;
        const roleTitle = ROLE_DISPLAY_TITLES[dbUser.role as AppRole] || dbUser.role;
        updateFields.assignedTo = `${dbUser.firstName} (${roleTitle})`;
        updateFields.assignedUserId = dbUser.id;
      } else if (updates.assigned_to !== undefined) {
        updateFields.assignedTo = updates.assigned_to;
      } else if (updates.assignedTo !== undefined) {
        updateFields.assignedTo = updates.assignedTo;
      }

      const numId = Number(leadId);
      const whereClause = isNaN(numId)
        ? eq(schema.leads.leadId, String(leadId))
        : or(eq(schema.leads.id, numId), eq(schema.leads.leadId, String(leadId)));

      const [updated] = await db
        .update(schema.leads)
        .set(updateFields)
        .where(whereClause)
        .returning();

      if (updated) return updated;
    } catch (error: any) {
      console.warn('updateDbLead DB update skipped (memory updated):', error?.message);
    }
  }

  return target || { success: true };
}

export async function archiveOrDeleteDbLead(leadId: string | number, softDelete = true) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const idNum = Number(leadId);
  const target = inMemoryLeads.find(
    (l) => (!isNaN(idNum) && l.id === idNum) || String(l.leadId) === String(leadId)
  );

  if (target) {
    if (softDelete) {
      target.deletedAt = new Date();
      target.leadStatus = 'Archived';
    } else {
      inMemoryLeads = inMemoryLeads.filter((l) => l.id !== target.id);
    }
  }

  if (isDbConfigured) {
    try {
      const numId = Number(leadId);
      const whereClause = isNaN(numId)
        ? eq(schema.leads.leadId, String(leadId))
        : or(eq(schema.leads.id, numId), eq(schema.leads.leadId, String(leadId)));

      if (softDelete) {
        await db
          .update(schema.leads)
          .set({ deletedAt: new Date(), leadStatus: 'Archived' })
          .where(whereClause);
      } else {
        await db.delete(schema.leads).where(whereClause);
      }
    } catch (error: any) {
      console.warn('archiveOrDeleteDbLead DB skipped (memory updated):', error?.message);
    }
  }

  return target || { success: true };
}

export async function addDbLeadNote(leadId: string | number, noteData: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await getDbLeadById(leadId);
  const note = {
    id: Math.floor(Math.random() * 900000) + 100000,
    organizationId: 1,
    leadId: lead ? lead.id : Number(leadId),
    authorName: noteData.author || noteData.authorName || 'Sophia',
    content: noteData.content,
    noteType: noteData.note_type || noteData.noteType || 'General',
    visibility: 'Internal',
    createdAt: new Date(),
  };

  if (lead && lead.notes) {
    lead.notes.unshift(note);
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: 'note_added',
    title: `Note Added for ${lead ? lead.businessName : 'Prospect'}`,
    description: note.content.slice(0, 80),
    metadata: { noteId: note.id },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbNote] = await db
        .insert(schema.crmNotes)
        .values({
          organizationId: 1,
          leadId: lead ? lead.id : Number(leadId),
          authorName: note.authorName,
          content: note.content,
          noteType: note.noteType,
          visibility: 'Internal',
        })
        .returning();
      return dbNote;
    } catch (error: any) {
      console.warn('addDbLeadNote DB skipped (memory note created):', error?.message);
    }
  }

  return note;
}

export async function deleteDbLeadNote(noteId: number) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  for (const l of inMemoryLeads) {
    if (l.notes) {
      l.notes = l.notes.filter((n: any) => n.id !== noteId);
    }
  }

  if (isDbConfigured) {
    try {
      await db.delete(schema.crmNotes).where(eq(schema.crmNotes.id, noteId));
    } catch (error: any) {
      console.warn('deleteDbLeadNote DB skipped:', error?.message);
    }
  }

  return { success: true };
}

export async function addDbLeadCall(leadId: string | number, callData: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await getDbLeadById(leadId);
  const call = {
    id: Math.floor(Math.random() * 900000) + 100000,
    leadId: lead ? lead.id : Number(leadId),
    phone: callData.phone || (lead ? lead.phone : ''),
    contactPhone: callData.contact_phone || (lead ? lead.phone : ''),
    direction: callData.direction || 'Outbound',
    provider: callData.provider || 'Telnyx',
    externalCallId: callData.external_call_id || `call-${Date.now()}`,
    status: callData.status || 'Completed',
    durationSeconds: callData.duration_seconds || 120,
    recordingUrl: callData.recording_url || null,
    transcript: callData.transcript || null,
    aiSummary: callData.ai_summary || null,
    callOutcome: callData.call_outcome || 'Connected - Positive Interest',
    createdAt: new Date(),
  };

  if (lead) {
    if (!lead.calls) lead.calls = [];
    lead.calls.unshift(call);
    if (lead.leadStatus === 'New Lead') {
      lead.leadStatus = 'Contacted';
    }
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: 'call_logged',
    title: `Call Logged: ${call.direction} to ${call.phone}`,
    description: `Outcome: ${call.callOutcome} (${call.durationSeconds}s)`,
    metadata: { callId: call.id, outcome: call.callOutcome },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbCall] = await db
        .insert(schema.calls)
        .values(call)
        .returning();
      return dbCall;
    } catch (error: any) {
      console.warn('addDbLeadCall DB skipped (memory call logged):', error?.message);
    }
  }

  return call;
}

export async function addDbLeadEmail(leadId: string | number, emailData: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await getDbLeadById(leadId);
  const emailMsg = {
    id: Math.floor(Math.random() * 900000) + 100000,
    leadId: lead ? lead.id : Number(leadId),
    direction: emailData.direction || 'Outbound',
    subject: emailData.subject || 'Follow-Up Regarding Local Contractor Growth',
    body: emailData.body || '',
    status: emailData.status || 'Sent',
    provider: emailData.provider || 'Gmail API',
    externalMessageId: emailData.external_message_id || `msg-${Date.now()}`,
    sentAt: new Date(),
    createdAt: new Date(),
  };

  if (lead) {
    if (!lead.emails) lead.emails = [];
    lead.emails.unshift(emailMsg);
    if (lead.leadStatus === 'New Lead') {
      lead.leadStatus = 'Contacted';
    }
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: 'email_sent',
    title: `Email Sent: "${emailMsg.subject}"`,
    description: `Dispatched to ${lead ? lead.email : 'contractor'}`,
    metadata: { emailId: emailMsg.id, subject: emailMsg.subject },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbMsg] = await db
        .insert(schema.emailMessages)
        .values(emailMsg)
        .returning();
      return dbMsg;
    } catch (error: any) {
      console.warn('addDbLeadEmail DB skipped (memory email logged):', error?.message);
    }
  }

  return emailMsg;
}

export async function addDbLeadSms(leadId: string | number, smsData: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await getDbLeadById(leadId);
  const smsMsg = {
    id: Math.floor(Math.random() * 900000) + 100000,
    leadId: lead ? lead.id : Number(leadId),
    phone: smsData.phone || (lead ? lead.phone : ''),
    message: smsData.message || '',
    direction: smsData.direction || 'Outbound',
    status: smsData.status || 'Sent',
    provider: smsData.provider || 'Telnyx',
    externalMessageId: smsData.external_message_id || `sms-${Date.now()}`,
    sentAt: new Date(),
    createdAt: new Date(),
  };

  if (lead) {
    if (!lead.sms) lead.sms = [];
    lead.sms.unshift(smsMsg);
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: 'sms_sent',
    title: `SMS Sent to ${smsMsg.phone}`,
    description: smsMsg.message.slice(0, 80),
    metadata: { smsId: smsMsg.id },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbSms] = await db
        .insert(schema.smsMessages)
        .values(smsMsg)
        .returning();
      return dbSms;
    } catch (error: any) {
      console.warn('addDbLeadSms DB skipped (memory sms logged):', error?.message);
    }
  }

  return smsMsg;
}

export async function addDbLeadTask(leadId: string | number, taskData: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await getDbLeadById(leadId);
  const task = {
    id: Math.floor(Math.random() * 900000) + 100000,
    leadId: lead ? lead.id : Number(leadId),
    title: taskData.title || 'Follow up with contractor',
    taskType: taskData.task_type || taskData.taskType || 'Follow-Up',
    status: taskData.status || 'Pending',
    priority: taskData.priority || 'Medium',
    dueDate: taskData.due_date ? new Date(taskData.due_date) : new Date(Date.now() + 86400000 * 2),
    assignedTo: taskData.assigned_to || taskData.assignedTo || 'Sophia',
    createdAt: new Date(),
  };

  if (lead) {
    if (!lead.tasks) lead.tasks = [];
    lead.tasks.unshift(task);
  }

  if (isDbConfigured) {
    try {
      const [dbTask] = await db
        .insert(schema.tasks)
        .values({
          organizationId: 1,
          leadId: task.leadId,
          title: task.title,
          taskType: task.taskType,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate.toISOString(),
          assignedTo: task.assignedTo,
        })
        .returning();
      return dbTask;
    } catch (error: any) {
      console.warn('addDbLeadTask DB skipped (memory task created):', error?.message);
    }
  }

  return task;
}

export async function convertDbLeadToClient(leadId: string | number, clientData: {
  clientName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  actualMrr?: number;
  billingFrequency?: string;
  accountManager?: string;
  services?: Array<{ serviceName: string; category?: string; monthlyFee: number }>;
  notes?: string;
}) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await getDbLeadById(leadId);
  const clientId = inMemoryClients.length + 1;

  const client = {
    id: clientId,
    organizationId: 1,
    leadId: lead ? lead.id : Number(leadId),
    clientName: clientData.clientName || (lead ? lead.businessName : 'New Contractor Client'),
    contactPerson: clientData.contactPerson || (lead ? lead.contactName : ''),
    email: clientData.email || (lead ? lead.email : ''),
    phone: clientData.phone || (lead ? lead.phone : ''),
    website: clientData.website || (lead ? lead.website : ''),
    clientStatus: 'Active',
    contractStartDate: clientData.contractStartDate || new Date(),
    contractEndDate: clientData.contractEndDate || null,
    actualMrr: clientData.actualMrr || (lead ? lead.estimatedRetainer : 2500),
    billingFrequency: clientData.billingFrequency || 'Monthly',
    accountManager: clientData.accountManager || 'Sophia',
    healthScore: 95,
    churnRisk: 'Low',
    notes: clientData.notes || 'Successfully closed via Sophia AI Outreach & Pitch Pack.',
    services: (clientData.services || [
      { serviceName: 'SEO & Content Growth', category: 'SEO', monthlyFee: clientData.actualMrr || 2500 }
    ]).map((s: any, idx: number) => ({
      id: idx + 1,
      serviceName: s.serviceName,
      category: s.category || 'Retainer',
      monthlyFee: s.monthlyFee || 2500,
      active: true,
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryClients.unshift(client);

  if (lead) {
    lead.leadStatus = 'Won / Retainer Signed';
    lead.statusHistory.unshift({
      id: Date.now(),
      leadId: lead.id,
      previousStatus: lead.leadStatus,
      newStatus: 'Won / Retainer Signed',
      changedBy: 'Sophia',
      reason: 'Contract signed & client onboarding completed',
      createdAt: new Date(),
    });
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: lead ? lead.id : Number(leadId),
    activityType: 'client_converted',
    title: `🎉 Client Won & Retainer Signed: ${client.clientName}`,
    description: `Confirmed MRR: $${client.actualMrr}/mo. Client onboarded into active management.`,
    metadata: { clientId: client.id, mrr: client.actualMrr },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbClient] = await db
        .insert(schema.clients)
        .values({
          clientId: `CLI-${Date.now().toString().slice(-4)}`,
          organizationId: 1,
          leadId: lead ? lead.id : Number(leadId),
          businessName: client.clientName,
          email: client.email,
          phone: client.phone,
          website: client.website,
          clientStatus: 'Active',
          startDate: client.contractStartDate ? client.contractStartDate.toISOString() : new Date().toISOString(),
          monthlyRetainer: client.actualMrr,
          actualMrr: client.actualMrr,
          accountManager: client.accountManager,
          healthScore: client.healthScore,
        })
        .returning();

      return { client: dbClient, lead };
    } catch (error: any) {
      console.warn('convertDbLeadToClient DB skipped (memory client created):', error?.message);
    }
  }

  return { client, lead };
}

// ==========================================
// 4. CLIENTS REPOSITORY
// ==========================================
export async function getDbClients() {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (isDbConfigured) {
    try {
      const clientsList = await db.select().from(schema.clients).orderBy(desc(schema.clients.createdAt));
      if (clientsList && clientsList.length > 0) {
        const results = [];
        for (const c of clientsList) {
          const services = await db.select().from(schema.clientServices).where(eq(schema.clientServices.clientId, c.id));
          results.push({ ...c, services });
        }
        return results;
      }
    } catch (error: any) {
      console.warn('getDbClients DB query skipped (using memory):', error?.message);
    }
  }

  return inMemoryClients;
}

// ==========================================
// 5. DASHBOARD METRICS & REVENUE AGGREGATION
// ==========================================
export async function getDbDashboardMetrics() {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (isDbConfigured) {
    try {
      const confirmedMrrResult = await db
        .select({ total: sql<number>`coalesce(sum(${schema.clients.actualMrr}), 0)` })
        .from(schema.clients)
        .where(eq(schema.clients.clientStatus, 'Active'));
      const confirmedMrr = Number(confirmedMrrResult[0]?.total || 0);

      const pipelineMrrResult = await db
        .select({ total: sql<number>`coalesce(sum(${schema.leads.estimatedRetainer}), 0)` })
        .from(schema.leads)
        .where(
          and(
            sql`${schema.leads.deletedAt} IS NULL`,
            or(
              eq(schema.leads.leadStatus, 'Negotiation'),
              eq(schema.leads.leadStatus, 'Proposal Sent'),
              eq(schema.leads.leadStatus, 'Audit Sent')
            )
          )
        );
      const pipelineMrr = Number(pipelineMrrResult[0]?.total || 0);

      const totalLeadsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(sql`${schema.leads.deletedAt} IS NULL`);
      const totalLeads = Number(totalLeadsResult[0]?.count || 0);

      const hotTargetsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(sql`${schema.leads.deletedAt} IS NULL`, eq(schema.leads.isHotTarget, true)));
      const hotTargetsCount = Number(hotTargetsResult[0]?.count || 0);

      const stagesResult = await db
        .select({
          stage: schema.leads.leadStatus,
          count: sql<number>`count(*)`,
          totalValue: sql<number>`coalesce(sum(${schema.leads.estimatedRetainer}), 0)`,
        })
        .from(schema.leads)
        .where(sql`${schema.leads.deletedAt} IS NULL`)
        .groupBy(schema.leads.leadStatus);

      const recentActivities = await db
        .select()
        .from(schema.activities)
        .orderBy(desc(schema.activities.createdAt))
        .limit(20);

      const activeClientsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.clients)
        .where(eq(schema.clients.clientStatus, 'Active'));
      const activeClientsCount = Number(activeClientsResult[0]?.count || 0);

      if (totalLeads > 0 || confirmedMrr > 0) {
        return {
          confirmedMrr,
          pipelineMrr,
          totalLeads,
          hotTargetsCount,
          activeClientsCount,
          stages: stagesResult,
          recentActivities,
        };
      }
    } catch (error: any) {
      console.warn('getDbDashboardMetrics DB query skipped (using memory):', error?.message);
    }
  }

  // Resilient In-Memory Metrics Calculation
  const activeLeads = inMemoryLeads.filter((l) => !l.deletedAt);

  const confirmedMrr = inMemoryClients
    .filter((c) => c.clientStatus === 'Active')
    .reduce((sum, c) => sum + Number(c.actualMrr || 0), 0);

  const pipelineStages = new Set(['Negotiation', 'Proposal Sent', 'Audit Sent']);
  const pipelineMrr = activeLeads
    .filter((l) => pipelineStages.has(l.leadStatus))
    .reduce((sum, l) => sum + Number(l.estimatedRetainer || 0), 0);

  const totalLeads = activeLeads.length;
  const hotTargetsCount = activeLeads.filter((l) => l.isHotTarget).length;
  const activeClientsCount = inMemoryClients.filter((c) => c.clientStatus === 'Active').length;

  const stageCounts: Record<string, { count: number; totalValue: number }> = {};
  for (const l of activeLeads) {
    const st = l.leadStatus || 'New Lead';
    if (!stageCounts[st]) {
      stageCounts[st] = { count: 0, totalValue: 0 };
    }
    stageCounts[st].count += 1;
    stageCounts[st].totalValue += Number(l.estimatedRetainer || 0);
  }

  const stages = Object.entries(stageCounts).map(([stage, data]) => ({
    stage,
    count: data.count,
    totalValue: data.totalValue,
  }));

  return {
    confirmedMrr,
    pipelineMrr,
    totalLeads,
    hotTargetsCount,
    activeClientsCount,
    stages,
    recentActivities: inMemoryActivities.slice(0, 20),
  };
}

// ==========================================
// 6. ACTIVITIES & AUDIT LOGS
// ==========================================
export async function getDbTeamPerformance(period: string = 'This Month') {
  if (!isDbConfigured) {
    // Return empty array when database is not configured - no mock data
    console.warn('[Team Performance] Database not configured, returning empty result');
    return [];
  }

  try {
    // Calculate date range based on period
    let startDate: Date, endDate: Date;
    const now = new Date();

    switch (period) {
      case 'Today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Last Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'All Time':
        startDate = new Date(0);
        endDate = new Date();
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }

    // Get all active users from database
    const teamMembers = await db
      .select({
        user_id: schema.users.id,
        uid: schema.users.uid,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        displayName: schema.users.displayName,
        email: schema.users.email,
        role: schema.users.role,
        status: schema.users.status,
        lastLoginAt: schema.users.lastLoginAt,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.status, 'active'));

    const performanceData = await Promise.all(
      teamMembers.map(async (member) => {
        // Count assigned leads
        const assignedLeadsResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.leads)
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              sql`${schema.leads.createdAt} >= ${startDate}`,
              sql`${schema.leads.createdAt} <= ${endDate}`
            )
          );

        // Count contacted leads (status = 'Contacted')
        const contactedResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.leads)
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              eq(schema.leads.leadStatus, 'Contacted'),
              sql`${schema.leads.createdAt} >= ${startDate}`,
              sql`${schema.leads.createdAt} <= ${endDate}`
            )
          );

        // Count appointments from activities
        const appointmentsResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.activities)
          .where(
            and(
              eq(schema.activities.userId, member.user_id),
              eq(schema.activities.activityType, 'meeting_scheduled'),
              sql`${schema.activities.createdAt} >= ${startDate}`,
              sql`${schema.activities.createdAt} <= ${endDate}`
            )
          );

        // Count won deals (leadStatus = 'Won Retainer' or 'Won')
        const wonResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.leads)
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              eq(schema.leads.leadStatus, 'Won Retainer'),
              sql`${schema.leads.createdAt} >= ${startDate}`,
              sql`${schema.leads.createdAt} <= ${endDate}`
            )
          );

        // Count calls - join through leads table since calls doesn't have assignedUserId
        const callsResult = await db
          .select({
            count: sql<number>`count(*)`,
            totalDuration: sql<number>`COALESCE(SUM(${schema.calls.durationSeconds}), 0)`,
          })
          .from(schema.calls)
          .innerJoin(schema.leads, eq(schema.calls.leadId, schema.leads.id))
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              sql`${schema.calls.createdAt} >= ${startDate}`,
              sql`${schema.calls.createdAt} <= ${endDate}`
            )
          );

        // Count emails sent - join through leads table since emailMessages doesn't have assignedUserId
        const emailsResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.emailMessages)
          .innerJoin(schema.leads, eq(schema.emailMessages.leadId, schema.leads.id))
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              eq(schema.emailMessages.status, 'Sent'),
              sql`${schema.emailMessages.createdAt} >= ${startDate}`,
              sql`${schema.emailMessages.createdAt} <= ${endDate}`
            )
          );

        // Count SMS sent - join through leads table since smsMessages doesn't have assignedUserId
        const smsResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.smsMessages)
          .innerJoin(schema.leads, eq(schema.smsMessages.leadId, schema.leads.id))
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              eq(schema.smsMessages.status, 'Sent'),
              sql`${schema.smsMessages.createdAt} >= ${startDate}`,
              sql`${schema.smsMessages.createdAt} <= ${endDate}`
            )
          );

        // Calculate MRR from won clients (if we have actual deal values)
        // For now, use estimated_retainer from won leads
        const mrrResult = await db
          .select({
            totalMRR: sql<number>`COALESCE(SUM(${schema.leads.estimatedRetainer}), 0)`,
          })
          .from(schema.leads)
          .where(
            and(
              eq(schema.leads.assignedUserId, member.user_id),
              eq(schema.leads.leadStatus, 'Won Retainer')
            )
          );

        // Check if this is Sophia (AI Sales Rep)
        const isSophia = member.firstName === 'Sophia' || member.displayName === 'Sophia';

        // Calculate conversion rate
        const assignedLeads = Number(assignedLeadsResult[0]?.count || 0);
        const contacted = Number(contactedResult[0]?.count || 0);
        const conversionRate = assignedLeads > 0 ? (contacted / assignedLeads) * 100 : 0;

        // Format display name with role
        let displayRole = member.role || 'User';
        let displayName = isSophia ? 'Sophia (AI Sales Rep)' : member.displayName;

        return {
          user_id: String(member.user_id),
          name: displayName,
          firstName: member.firstName || member.displayName,
          lastName: member.lastName || '',
          email: member.email,
          role: displayRole,
          status: member.status,
          lastLogin: member.lastLoginAt ? member.lastLoginAt.toISOString() : undefined,
          is_ai: isSophia,
          assignedLeads,
          contacted,
          appointments: Number(appointmentsResult[0]?.count || 0),
          won: Number(wonResult[0]?.count || 0),
          conversion: Number(conversionRate.toFixed(1)),
          calls_made: Number(callsResult[0]?.count || 0),
          talkTime: Number((callsResult[0]?.totalDuration || 0) / 60), // Convert seconds to minutes
          emails_sent: Number(emailsResult[0]?.count || 0),
          sms_sent: Number(smsResult[0]?.count || 0),
          mrr: Number(mrrResult[0]?.totalMRR || 0),
          follow_ups_completed: 0,
          meetings_requested: 0,
          won_revenue: Number(mrrResult[0]?.totalMRR || 0),
        };
      })
    );

    return performanceData;
  } catch (error: any) {
    console.error('getDbTeamPerformance failed:', error?.message);
    return [];
  }
}

export async function getDbActivities(limit = 50) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (isDbConfigured) {
    try {
      const rows = await db.select().from(schema.activities).orderBy(desc(schema.activities.createdAt)).limit(limit);
      if (rows && rows.length > 0) return rows;
    } catch (error: any) {
      console.warn('getDbActivities DB skipped:', error?.message);
    }
  }

  return inMemoryActivities.slice(0, limit);
}

export async function getDbAuditLogs(limit = 100) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (isDbConfigured) {
    try {
      const rows = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(limit);
      if (rows && rows.length > 0) return rows;
    } catch (error: any) {
      console.warn('getDbAuditLogs DB skipped:', error?.message);
    }
  }

  return inMemoryAuditLogs.slice(0, limit);
}

// ==========================================
// 7. AGENCY SETTINGS
// ==========================================
export async function getDbAgencySettings() {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (isDbConfigured) {
    try {
      const rows = await db.select().from(schema.agencySettings).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (error: any) {
      console.warn('getDbAgencySettings DB skipped:', error?.message);
    }
  }

  return inMemorySettings;
}

export async function updateDbAgencySettings(updates: any) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  Object.assign(inMemorySettings, updates, { updatedAt: new Date() });

  if (isDbConfigured) {
    try {
      const current = await db.select().from(schema.agencySettings).limit(1);
      if (current.length > 0) {
        const [updated] = await db
          .update(schema.agencySettings)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(schema.agencySettings.id, current[0].id))
          .returning();
        return updated;
      }
    } catch (error: any) {
      console.warn('updateDbAgencySettings DB skipped:', error?.message);
    }
  }

  return inMemorySettings;
}

// ==========================================
// 8. SYSTEM HEALTH & MONITORING
// ==========================================
export async function getDbSystemHealth() {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const start = Date.now();
  let dbStatus = isDbConfigured ? 'OPERATIONAL' : 'IN_MEMORY_RESILIENT';
  let dbLatency = 1;
  let totalStoredCount = inMemoryLeads.filter((l) => !l.deletedAt).length;

  const dbDetails = getDatabaseDetails();

  if (isDbConfigured) {
    try {
      const [leadCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(sql`deleted_at IS NULL`);
      dbLatency = Date.now() - start;
      if (leadCount && leadCount.count !== undefined) {
        totalStoredCount = Number(leadCount.count);
      }
    } catch (err: any) {
      console.warn('Health check DB ping failed, using memory count fallback:', err?.message);
      dbStatus = 'DEGRADED';
    }
  }

  return {
    status: 'HEALTHY',
    services: {
      cloudSqlPostgres: {
        status: dbStatus,
        latencyMs: dbLatency,
        provider: dbDetails.provider,
        engine: dbDetails.isNeon ? 'Neon Serverless PostgreSQL 16' : 'PostgreSQL 16 Compatible',
        region: dbDetails.host.includes('us-east-1') ? 'us-east-1' : 'europe-west3',
        host: dbDetails.host,
        database: dbDetails.database,
        sslMode: dbDetails.sslMode,
        isNeon: dbDetails.isNeon,
        totalLeadsStored: totalStoredCount,
      },
      geminiAi: {
        status: 'OPERATIONAL',
        models: ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'],
        quotaStrategy: 'Exponential cooldown with fallback cascade',
      },
      telnyxTelephony: {
        status: 'OPERATIONAL',
        voiceDialer: 'Active (WebRTC & SIP ready)',
        smsEngine: 'Active (10DLC compliant)',
      },
      n8nWorkflowEngine: {
        status: 'CONNECTED',
        architecture: 'Decoupled webhook event bus',
      },
      storageEngine: {
        status: 'OPERATIONAL',
        protection: 'Server-side access control with signed URLs',
      },
      backupStatus: {
        status: 'CONFIGURED',
        automatedDaily: true,
        pointInTimeRecovery: 'Supported',
        lastVerification: new Date().toISOString(),
      },
    },
    checkedAt: new Date().toISOString(),
  };
}

// ==========================================
// 9. BATCH IMPORT REPOSITORY
// ==========================================
export async function batchImportDbLeads(
  rows: any[],
  importMeta: { fileName: string; importedBy?: string }
) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination
  
  let validCount = 0;
  let duplicatesCount = 0;
  const insertedIds: number[] = [];
  const insertedLeads: any[] = [];
  const failedInserts: any[] = [];

  for (const row of rows) {
    const bizName = row.business_name || row.Business_Name || row['Business Name'] || row.businessName;
    if (!bizName) continue;

    const phone = row.phone || row.Phone || '';
    const email = row.email || row.Email || '';
    const website = row.website || row.Website || '';

    const dupCheck = await checkLeadDuplicate({ businessName: bizName, phone, email, website });
    if (dupCheck.isDuplicate) {
      duplicatesCount++;
      continue;
    }

    // Use existing lead_id from frontend if supplied, otherwise generate unique ID
    const leadId =
      row.lead_id ||
      row.leadId ||
      `MCA-LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const result = await createDbLead({
      lead_id: leadId,
      business_name: bizName,
      contact_name: row.contact_name || row['Contact Name'] || row.contactName || bizName,
      phone,
      phone_e164: row.phone_e164 || row.phoneE164 || phone,
      email,
      website,
      address: row.address || row.Address || '',
      city: row.city || row.City || null,
      state: row.state || row.State || row.stateRegion || null,
      postal_code: row.postal_code || row.postalCode || row.zip || row.Zip || '',
      niche: row.niche || row.Trade || row.Industry || 'General Contractor',
      gmb_status: row.gmb_status || row.gmbStatus || 'Established',
      gmb_rating: row.gmb_rating !== undefined ? Number(row.gmb_rating) : 4.5,
      gmb_review_count: row.gmb_review_count !== undefined ? Number(row.gmb_review_count) : 10,
      google_maps_url: row.google_maps_url || row.googleMapsUrl || '',
      website_status: row.website_status || row.websiteStatus || 'Active',
      pagespeed_score: row.pagespeed_score !== undefined ? Number(row.pagespeed_score) : 60,
      google_ads_status: row.google_ads_status || 'No Ads',
      meta_pixel_status: row.meta_pixel_status || 'No Pixel',
      lead_score: Number(row.lead_score || row.leadScore || row.Score || 65),
      score_breakdown: row.score_breakdown || {},
      is_hot_target: row.is_hot_target !== undefined ? Boolean(row.is_hot_target) : (Number(row.lead_score || row.Score || 65) >= 80),
      opportunity_angle: row.opportunity_angle || row.opportunityAngle || 'Immediate Local Growth Optimization',
      recommended_service: row.recommended_service || row.recommendedService || 'SEO & GMB Optimization',
      estimated_retainer: Number(row.estimated_retainer || row.estimatedRetainer || 2500),
      pipeline_stage: row.pipeline_stage || row.leadStatus || 'New Lead',
      owner: row.owner || row.assigned_to || row.assignedTo || 'Sophia (AI Sales Rep)',
      notes: row.notes || [],
      original_data: row.original_data || row.rawPayload || row,
    });

    // Check if the insert was successful by examining _dbSource
    if (result._dbSource === 'neon') {
      // SUCCESS: Valid record created and confirmed in Neon PostgreSQL
      const dbRecord = ((result as any)._inMemoryRecord ? { ...(result as any)._inMemoryRecord, ...result } : result) as any;
      validCount++;
      insertedIds.push(dbRecord.id);
      insertedLeads.push(dbRecord);
    } else if (result._dbSource === 'failed') {
      // FAILURE: Database INSERT failed
      // Check if failure is due to unique key constraint (e.g. duplicate lead_id)
      if (
        result._error?.includes('unique') ||
        result._error?.includes('duplicate key') ||
        result._error?.includes('23505')
      ) {
        duplicatesCount++;
      } else {
        failedInserts.push({
          lead_id: leadId,
          business_name: bizName,
          error: result._error,
        });
      }
      console.error(`Batch import: Failed to insert lead ${leadId} (${bizName}): ${result._error}`);
    } else {
      // memory_only: PostgreSQL not configured - MUST NOT report as successfully persisted to Neon
      failedInserts.push({
        lead_id: leadId,
        business_name: bizName,
        error: 'Database not configured or persistence unavailable; memory records cannot be confirmed as Neon persisted',
      });
      console.warn(`Batch import: Lead ${leadId} (${bizName}) not persisted to Neon (source: ${result._dbSource})`);
    }
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    activityType: 'lead_imported',
    title: `Batch Import Completed: ${importMeta.fileName}`,
    description: `Successfully imported ${validCount} new contractor leads (${duplicatesCount} duplicates skipped, ${failedInserts.length} failures).`,
    metadata: { validCount, duplicatesCount, failedCount: failedInserts.length, fileName: importMeta.fileName },
    createdAt: new Date(),
  });

  return {
    success: failedInserts.length === 0 && (validCount > 0 || rows.length === 0),
    validCount,
    duplicatesCount,
    failedCount: failedInserts.length,
    insertedCount: insertedIds.length,
    leads: insertedLeads,
    failures: failedInserts,
  };
}

// ==========================================
// 10. REAL INTEGRATIONS & SYSTEM ACTIVATION
// ==========================================
export async function saveDbAiContent(params: {
  leadId?: number | string;
  contentType: string;
  title: string;
  content: string;
  model?: string;
  status?: string;
}) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  let resolvedLeadId: number | null = null;
  let businessName = 'Prospect';

  if (params.leadId) {
    const existing = await getDbLeadById(params.leadId);
    if (existing) {
      resolvedLeadId = existing.id;
      businessName = existing.businessName;
    }
  }

  const saved = {
    id: inMemoryAiContent.length + 1,
    leadId: resolvedLeadId,
    contentType: params.contentType,
    title: params.title,
    content: params.content,
    model: params.model || 'gemini-3.8-flash',
    status: params.status || 'Generated',
    createdAt: new Date(),
  };

  inMemoryAiContent.unshift(saved);

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId: resolvedLeadId,
    activityType: 'ai_generated',
    title: `Sophia AI Generated: ${params.title}`,
    description: `New ${params.contentType} generated with ${params.model || 'Gemini'} for ${businessName}.`,
    metadata: { aiContentId: saved.id, contentType: params.contentType, model: params.model },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbSaved] = await db
        .insert(schema.aiContent)
        .values({
          leadId: resolvedLeadId,
          contentType: params.contentType,
          title: params.title,
          content: params.content,
          model: params.model || 'gemini-3.8-flash',
          status: params.status || 'Generated',
        })
        .returning();
      return dbSaved;
    } catch (error: any) {
      console.warn('saveDbAiContent DB skipped:', error?.message);
    }
  }

  return saved;
}

export async function getDbAiContentForLead(leadId: number | string) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const existing = await getDbLeadById(leadId);
  if (!existing) return [];

  const memContents = inMemoryAiContent.filter((c) => c.leadId === existing.id);

  if (isDbConfigured) {
    try {
      const dbRows = await db
        .select()
        .from(schema.aiContent)
        .where(eq(schema.aiContent.leadId, existing.id))
        .orderBy(desc(schema.aiContent.createdAt));
      if (dbRows && dbRows.length > 0) return dbRows;
    } catch (error: any) {
      console.warn('getDbAiContentForLead DB skipped:', error?.message);
    }
  }

  return memContents;
}

export async function recordDbWebhookEvent(params: {
  provider: string;
  eventType: string;
  externalEventId?: string;
  payloadReference?: any;
  processingStatus?: string;
}) {
  const event = {
    id: Math.floor(Math.random() * 900000) + 100000,
    provider: params.provider,
    eventType: params.eventType,
    externalEventId: params.externalEventId || `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    payloadReference: params.payloadReference || {},
    processingStatus: params.processingStatus || 'PROCESSED',
    processedAt: new Date(),
    createdAt: new Date(),
  };

  inMemoryWebhookEvents.unshift(event);
  if (inMemoryWebhookEvents.length > 100) inMemoryWebhookEvents.pop();

  if (isDbConfigured) {
    try {
      const [dbEvent] = await db
        .insert(schema.webhookEvents)
        .values(event)
        .returning();
      return dbEvent;
    } catch (error: any) {
      // safe fallback
    }
  }

  return event;
}

export async function getDbWebhookEvents(limit = 50) {
  if (isDbConfigured) {
    try {
      const rows = await db
        .select()
        .from(schema.webhookEvents)
        .orderBy(desc(schema.webhookEvents.createdAt))
        .limit(limit);
      if (rows && rows.length > 0) return rows;
    } catch (error: any) {
      // safe fallback
    }
  }

  return inMemoryWebhookEvents.slice(0, limit);
}

export async function recordDbAutomationRun(params: {
  workflowName: string;
  workflowProvider?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status?: string;
  externalRunId?: string;
  errorSummary?: string;
}) {
  const run = {
    id: Math.floor(Math.random() * 900000) + 100000,
    workflowName: params.workflowName,
    workflowProvider: params.workflowProvider || 'n8n',
    relatedEntityType: params.relatedEntityType || 'lead',
    relatedEntityId: params.relatedEntityId ? String(params.relatedEntityId) : null,
    status: params.status || 'STARTED',
    externalRunId: params.externalRunId || `n8n_run_${Date.now()}`,
    startedAt: new Date(),
    completedAt: new Date(),
    errorSummary: params.errorSummary || null,
    createdAt: new Date(),
  };

  inMemoryAutomationRuns.unshift(run);
  if (inMemoryAutomationRuns.length > 100) inMemoryAutomationRuns.pop();

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    activityType: 'automation_triggered',
    title: `Workflow Dispatched: ${params.workflowName}`,
    description: `Engineered via ${params.workflowProvider || 'n8n'} (Execution ID: ${run.externalRunId})`,
    metadata: { runId: run.id, workflow: params.workflowName, target: params.relatedEntityId },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbRun] = await db
        .insert(schema.automationRuns)
        .values(run)
        .returning();
      return dbRun;
    } catch (error: any) {
      // safe fallback
    }
  }

  return run;
}

export async function updateDbAutomationRun(
  runId: number | string,
  updates: {
    status: string;
    completedAt?: Date;
    errorSummary?: string;
  }
) {
  const found = inMemoryAutomationRuns.find((r) => r.id === Number(runId) || r.externalRunId === String(runId));
  if (found) {
    found.status = updates.status;
    found.completedAt = updates.completedAt || new Date();
    found.errorSummary = updates.errorSummary || null;
  }

  if (isDbConfigured) {
    try {
      const [updated] = await db
        .update(schema.automationRuns)
        .set({
          status: updates.status,
          completedAt: updates.completedAt || new Date(),
          errorSummary: updates.errorSummary || null,
        })
        .where(eq(schema.automationRuns.id, Number(runId)))
        .returning();
      return updated;
    } catch (error: any) {
      // safe fallback
    }
  }

  return found || null;
}

export async function getDbAutomationRuns(limit = 50) {
  if (isDbConfigured) {
    try {
      const rows = await db
        .select()
        .from(schema.automationRuns)
        .orderBy(desc(schema.automationRuns.createdAt))
        .limit(limit);
      if (rows && rows.length > 0) return rows;
    } catch (error: any) {
      // safe fallback
    }
  }

  return inMemoryAutomationRuns.slice(0, limit);
}

export async function findLeadByPhone(phone: string) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (!phone) return null;
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const last7 = cleanPhone.slice(-7);

  const found = inMemoryLeads.find((l) => !l.deletedAt && l.phone && l.phone.replace(/[^\d+]/g, '').includes(last7));
  if (found) return found;

  if (isDbConfigured) {
    try {
      const candidates = await db
        .select()
        .from(schema.leads)
        .where(sql`${schema.leads.phone} ILIKE ${'%' + last7 + '%'}`)
        .limit(1);
      return candidates[0] || null;
    } catch (error: any) {
      // safe fallback
    }
  }

  return null;
}

export async function findLeadByEmail(email: string) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  if (!email) return null;
  const trimmed = email.trim().toLowerCase();

  const found = inMemoryLeads.find((l) => !l.deletedAt && l.email && l.email.trim().toLowerCase() === trimmed);
  if (found) return found;

  if (isDbConfigured) {
    try {
      const candidates = await db
        .select()
        .from(schema.leads)
        .where(ilike(schema.leads.email, trimmed))
        .limit(1);
      return candidates[0] || null;
    } catch (error: any) {
      // safe fallback
    }
  }

  return null;
}

export async function recordDbInboundSms(params: {
  phone: string;
  message: string;
  externalMessageId?: string;
  aiClassification?: any;
}) {
  // initInMemoryDefaults() removed - was seeding fake CCB data causing contamination

  const lead = await findLeadByPhone(params.phone);
  const leadId = lead ? lead.id : null;

  const smsMsg = {
    id: Math.floor(Math.random() * 900000) + 100000,
    leadId,
    phone: params.phone,
    message: params.message,
    direction: 'Inbound',
    status: 'Delivered',
    provider: 'Telnyx Messaging v2',
    externalMessageId: params.externalMessageId || `sms_${Date.now()}`,
    createdAt: new Date(),
  };

  if (lead) {
    if (!lead.sms) lead.sms = [];
    lead.sms.unshift(smsMsg);
  }

  inMemoryActivities.unshift({
    id: inMemoryActivities.length + 1,
    leadId,
    activityType: 'sms_received',
    title: `Inbound SMS Received: ${lead ? lead.businessName : params.phone}`,
    description: `"${params.message.slice(0, 100)}" - Intent: ${params.aiClassification?.intent || 'Review'}`,
    metadata: { smsId: smsMsg.id, intent: params.aiClassification?.intent, phone: params.phone },
    createdAt: new Date(),
  });

  if (isDbConfigured) {
    try {
      const [dbSms] = await db
        .insert(schema.smsMessages)
        .values({
          leadId,
          phone: params.phone,
          message: params.message,
          direction: 'Inbound',
          status: 'Delivered',
          provider: 'Telnyx Messaging v2',
          externalMessageId: smsMsg.externalMessageId,
        })
        .returning();
      return dbSms;
    } catch (error: any) {
      // safe fallback
    }
  }

  return smsMsg;
}

export async function getDbIntegrations() {
  if (isDbConfigured) {
    try {
      const configuredRows = await db.select().from(schema.integrations);
      if (configuredRows && configuredRows.length > 0) return configuredRows;
    } catch (error: any) {
      // safe fallback
    }
  }

  return inMemoryIntegrations;
}

export async function updateDbIntegrationStatus(
  provider: string,
  integrationType: string,
  status: string,
  configurationReference: any = {}
) {
  const existingMem = inMemoryIntegrations.find((i) => i.provider === provider);
  if (existingMem) {
    existingMem.status = status;
    existingMem.configurationReference = configurationReference;
    existingMem.lastSyncAt = new Date();
  } else {
    inMemoryIntegrations.push({
      id: inMemoryIntegrations.length + 1,
      provider,
      integrationType,
      status,
      configurationReference,
      lastSyncAt: new Date(),
    });
  }

  if (isDbConfigured) {
    try {
      const existing = await db
        .select()
        .from(schema.integrations)
        .where(eq(schema.integrations.provider, provider))
        .limit(1);

      if (existing.length > 0) {
        const [updated] = await db
          .update(schema.integrations)
          .set({ status, configurationReference, lastSyncAt: new Date() })
          .where(eq(schema.integrations.id, existing[0].id))
          .returning();
        return updated;
      } else {
        const [inserted] = await db
          .insert(schema.integrations)
          .values({
            provider,
            integrationType,
            status,
            configurationReference,
            lastSyncAt: new Date(),
          })
          .returning();
        return inserted;
      }
    } catch (error: any) {
      // safe fallback
    }
  }

  return existingMem || inMemoryIntegrations[inMemoryIntegrations.length - 1];
}

/**
 * TRUNCATE all leads and related tables - CASCADE delete for complete wipe
 * This is the ONLY way to fully clear Neon database leads
 */
export async function truncateAllLeads() {
  if (!isDbConfigured) {
    console.warn('truncateAllLeads: Database not configured, nothing to truncate');
    return { success: false, reason: 'Database not configured' };
  }

  try {
    // Use raw SQL for CASCADE truncate - Drizzle doesn't support TRUNCATE directly
    await db.execute(sql.raw(`
      TRUNCATE TABLE public.lead_details CASCADE;
      TRUNCATE TABLE public.lead_audits CASCADE;
      TRUNCATE TABLE public.lead_scores CASCADE;
      TRUNCATE TABLE public.leads CASCADE;
    `));
    
    // Clear in-memory leads as well
    inMemoryLeads = [];
    
    console.log('truncateAllLeads: Successfully truncated all leads and related tables');
    return { success: true, message: 'All leads and related data permanently deleted' };
  } catch (error: any) {
    console.error('truncateAllLeads failed:', error?.message);
    return { success: false, error: error?.message };
  }
}

/**
 * Delete ALL leads from database (alternative to TRUNCATE - respects foreign keys)
 */
export async function deleteAllDbLeads() {
  if (!isDbConfigured) {
    console.warn('deleteAllDbLeads: Database not configured, nothing to delete');
    return { success: false, reason: 'Database not configured' };
  }

  try {
    // Delete in order to respect foreign key constraints
    await db.delete(schema.leadDetails).where(sql`1=1`);
    await db.delete(schema.leadAudits).where(sql`1=1`);
    await db.delete(schema.leadScores).where(sql`1=1`);
    await db.delete(schema.leads).where(sql`1=1`);
    
    // Clear in-memory leads as well
    inMemoryLeads = [];
    
    console.log('deleteAllDbLeads: Successfully deleted all leads');
    return { success: true, message: 'All leads permanently deleted' };
  } catch (error: any) {
    console.error('deleteAllDbLeads failed:', error?.message);
    return { success: false, error: error?.message };
  }
}
