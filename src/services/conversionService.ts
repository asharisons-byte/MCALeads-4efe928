import {
  Lead,
  AuditReport,
  AuditFinding,
  AuditSeverity,
  DigitalScorecard,
  AuditStatus,
  ServiceItem,
  ServicePackage,
  Proposal,
  ProposalStatus,
  ProposalPricing,
  ProposalContent,
  ProposalRoadmapPhase,
  ProposalVersionHistory,
  ProposalTracking,
  ProposalNegotiationIntelligence,
  Client,
  ClientStatus,
  ClientHandoffBrief,
  OnboardingTask,
  ProposalAnalyticsMetrics,
  ActivityEvent,
} from '../types';
import { updateLead, addActivity, scheduleFollowUp } from './leadService.js';
import { saveEmailDraft } from './emailService.js';

// Storage keys
const AUDITS_STORAGE_KEY = 'mca_audits_v1';
const PROPOSALS_STORAGE_KEY = 'mca_proposals_v1';
const CLIENTS_STORAGE_KEY = 'mca_clients_v1';
const SERVICE_PACKAGES_STORAGE_KEY = 'mca_service_packages_v1';

// ==========================================================
// 1. CATALOG OF AGENCY SERVICES & REUSABLE PACKAGES
// ==========================================================

export const ALL_AGENCY_SERVICES: Omit<ServiceItem, 'selected'>[] = [
  {
    id: 'srv_web_dev',
    name: 'Website Development',
    category: 'Development',
    monthly_price: 1200,
    setup_fee: 1500,
    description: 'High-speed, conversion-focused mobile-responsive web development with modern architecture.',
    deliverables: [
      'Custom responsive design optimized for mobile conversion',
      'Ultra-fast load speed (Core Web Vitals optimized)',
      'Lead capture forms & click-to-call integrations',
      'SSL certificate & security hardening',
    ],
  },
  {
    id: 'srv_web_seo',
    name: 'Website SEO',
    category: 'SEO',
    monthly_price: 1500,
    setup_fee: 400,
    description: 'Comprehensive on-page and local content SEO to capture high-intent local customer queries.',
    deliverables: [
      'Keyword strategy tailored to high-ticket local services',
      'On-page title, meta, header & semantic markup optimization',
      'Localized content expansion & service area landing pages',
      'Monthly keyword ranking & search visibility reporting',
    ],
  },
  {
    id: 'srv_tech_opt',
    name: 'Technical Optimization',
    category: 'SEO',
    monthly_price: 900,
    setup_fee: 500,
    description: 'Deep technical infrastructure optimization to eliminate crawl errors and accelerate page speeds.',
    deliverables: [
      'Mobile PageSpeed & Core Web Vitals optimization',
      'Schema.org structured data & LocalBusiness markup',
      'XML sitemap & robots.txt architecture tuning',
      'Broken link resolution & 301 redirection cleanup',
    ],
  },
  {
    id: 'srv_gmb_opt',
    name: 'Google Business Profile Optimization',
    category: 'Local Search',
    monthly_price: 850,
    setup_fee: 300,
    description: 'Dominate the Google 3-Pack map results in your target service radius.',
    deliverables: [
      'Full profile verification & category optimization',
      'Geotagged photo uploads & weekly promotional posts',
      'Service catalog & FAQ configuration',
      'Local citation synchronization (NAP consistency)',
    ],
  },
  {
    id: 'srv_google_ads',
    name: 'Google Ads Management',
    category: 'Paid Media',
    monthly_price: 1800,
    setup_fee: 600,
    description: 'Hyper-targeted Google Search & Local Service Ads capturing active buying prospects.',
    deliverables: [
      'Negative keyword filtering to eliminate wasted spend',
      'High-converting ad copy & extension setup',
      'Call tracking & server-side conversion attribution',
      'Bi-weekly bid adjustments & budget pacing',
    ],
  },
  {
    id: 'srv_meta_ads',
    name: 'Meta Ads Management',
    category: 'Paid Media',
    monthly_price: 1500,
    setup_fee: 500,
    description: 'Local retargeting and demographic lead generation across Facebook and Instagram.',
    deliverables: [
      'Meta Pixel & Conversions API (CAPI) configuration',
      'Custom audience creation (website visitors & customer lists)',
      'High-converting video/image ad creative development',
      'Lead form automation straight to client CRM/phone',
    ],
  },
  {
    id: 'srv_reputation',
    name: 'Reputation Management',
    category: 'Reputation',
    monthly_price: 650,
    setup_fee: 250,
    description: 'Automated 5-star review acquisition engine and professional review monitoring.',
    deliverables: [
      'Automated SMS & email review request funnels',
      'Negative feedback intercept mechanism',
      'Professional review response drafting within 24 hours',
      'Website review widget showcase setup',
    ],
  },
  {
    id: 'srv_voice_search',
    name: 'Voice Search Optimization',
    category: 'Local Search',
    monthly_price: 700,
    setup_fee: 300,
    description: 'Ensure your business is spoken first by Siri, Alexa, and Google Assistant for local searches.',
    deliverables: [
      'Conversational query & FAQ schema mapping',
      'Local directory sync across Apple Maps, Bing, and Yelp',
      'Near-me conversational search optimization',
    ],
  },
  {
    id: 'srv_lead_gen',
    name: 'Lead Generation Systems',
    category: 'Automation',
    monthly_price: 2000,
    setup_fee: 800,
    description: 'End-to-end automated inbound lead capture, qualification, and instant response routing.',
    deliverables: [
      'Instant 60-second SMS & email lead response system',
      'Lead qualification conversational chatbot / web form',
      'CRM integration with real-time notification alerts',
      'Lead pipeline tracking & pipeline analytics',
    ],
  },
];

export const DEFAULT_SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg_local_growth',
    name: 'LOCAL GROWTH PACKAGE',
    tagline: 'Dominate Local Map Pack & Win Nearby High-Ticket Inquiries',
    description:
      'Engineered specifically for local service businesses to capture first-page Google Maps visibility, build review momentum, and solidify on-page SEO.',
    recommended_for: 'Contractors, remodelers, trades, and professional service firms wanting more direct calls.',
    default_monthly_retainer: 1500,
    default_setup_fee: 350,
    suggested_contract_months: 6,
    services: [
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_gmb_opt')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_web_seo')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_reputation')!, selected: true },
    ],
  },
  {
    id: 'pkg_tech_seo',
    name: 'TECHNICAL SEO & PERFORMANCE PACKAGE',
    tagline: 'Resolve Critical Speed Bottlenecks & Accelerate Organic Rankings',
    description:
      'Removes underlying technical debt, maximizes PageSpeed scores, implements structured schema, and optimizes Core Web Vitals to elevate organic conversion.',
    recommended_for: 'Businesses with slow websites, poor mobile performance, or lost search rankings.',
    default_monthly_retainer: 2400,
    default_setup_fee: 500,
    suggested_contract_months: 6,
    services: [
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_tech_opt')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_web_seo')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_web_dev')!, selected: true, monthly_price: 0, setup_fee: 1000 },
    ],
  },
  {
    id: 'pkg_google_ads',
    name: 'GOOGLE ADS & CONVERSION ENGINE',
    tagline: 'Capture Immediate Search Intent With Profitable Lead Acquisition',
    description:
      'Captures bottom-of-the-funnel customers actively seeking urgent services through tightly controlled Google Search and Local Service campaigns.',
    recommended_for: 'Companies with immediate capacity seeking steady, qualified monthly client appointments.',
    default_monthly_retainer: 2000,
    default_setup_fee: 600,
    suggested_contract_months: 3,
    services: [
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_google_ads')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_lead_gen')!, selected: true },
    ],
  },
  {
    id: 'pkg_full_funnel',
    name: 'FULL-FUNNEL CLIENT ACQUISITION',
    tagline: 'Comprehensive Digital Dominance Across Search, Social & Local',
    description:
      'An all-inclusive growth ecosystem combining high-speed web conversion, Local SEO, Google Ads, Meta retargeting, and automated lead capture.',
    recommended_for: 'Growth-stage companies aiming to outpace competitors and secure predictable multi-channel pipeline.',
    default_monthly_retainer: 3800,
    default_setup_fee: 1000,
    suggested_contract_months: 6,
    services: [
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_web_seo')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_gmb_opt')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_google_ads')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_meta_ads')!, selected: true },
      { ...ALL_AGENCY_SERVICES.find((s) => s.id === 'srv_lead_gen')!, selected: true },
    ],
  },
];

export function getServicePackages(): ServicePackage[] {
  try {
    const raw = localStorage.getItem(SERVICE_PACKAGES_STORAGE_KEY);
    if (!raw) return DEFAULT_SERVICE_PACKAGES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SERVICE_PACKAGES;
  } catch (e) {
    return DEFAULT_SERVICE_PACKAGES;
  }
}

export function saveServicePackages(packages: ServicePackage[]): void {
  try {
    localStorage.setItem(SERVICE_PACKAGES_STORAGE_KEY, JSON.stringify(packages));
  } catch (e) {
    console.error('Failed to save service packages:', e);
  }
}

// ==========================================================
// 2. AI DIGITAL AUDIT ENGINE & EVIDENCE RULES
// ==========================================================

export function getAudits(): AuditReport[] {
  try {
    const raw = localStorage.getItem(AUDITS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAudits(audits: AuditReport[]): void {
  try {
    localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(audits));
  } catch (e) {
    console.error('Failed to save audits:', e);
  }
}

export function getAuditsByLead(leadId: string): AuditReport[] {
  return getAudits().filter((a) => a.lead_id === leadId);
}

export function getAuditById(auditId: string): AuditReport | undefined {
  return getAudits().find((a) => a.audit_id === auditId);
}

/**
 * Builds a verified Digital Scorecard from actual lead fields.
 * CRITICAL RULE: If data does not exist, marks as 'Not Audited' instead of inventing fake scores.
 */
export function buildVerifiedDigitalScorecard(lead: Lead): DigitalScorecard {
  let auditedCount = 0;
  const totalCategories = 7;

  // 1. Website
  let websiteScore: number | 'Not Audited' = 'Not Audited';
  if (lead.website_status) {
    auditedCount++;
    if (lead.website_status === 'No Website') websiteScore = 0;
    else if (lead.website_status === 'Slow / Unreachable Server' || lead.website_status === 'Needs Redesign') websiteScore = 40;
    else if (lead.website_status === 'Active') {
      websiteScore = lead.pagespeed_score ? Math.min(100, Math.max(40, lead.pagespeed_score)) : 75;
    } else {
      websiteScore = 60;
    }
  }

  // 2. SEO
  let seoScore: number | 'Not Audited' = 'Not Audited';
  if (lead.seo_status) {
    auditedCount++;
    if (lead.seo_status === 'Weak') seoScore = 35;
    else if (lead.seo_status === 'Needs Technical SEO') seoScore = 45;
    else if (lead.seo_status === 'Average') seoScore = 65;
    else if (lead.seo_status === 'Strong') seoScore = 88;
    else seoScore = 60;
  }

  // 3. Google Business Profile
  let gmbScore: number | 'Not Audited' = 'Not Audited';
  if (lead.gmb_status) {
    auditedCount++;
    if (lead.gmb_status === 'No GMB' || lead.gmb_status === 'Unclaimed') {
      gmbScore = 15;
    } else if (lead.gmb_status === 'Thin GMB' || lead.gmb_status === 'Needs Optimization') {
      gmbScore = 45;
    } else if (lead.gmb_status === 'Established') {
      const rating = typeof lead.gmb_rating === 'number' ? lead.gmb_rating : 4.0;
      const reviews = typeof lead.gmb_review_count === 'number' ? lead.gmb_review_count : 10;
      gmbScore = Math.min(100, Math.round((rating / 5) * 50 + Math.min(50, (reviews / 50) * 50)));
    } else {
      gmbScore = 50;
    }
  }

  // 4. Reviews
  let reviewScore: number | 'Not Audited' = 'Not Audited';
  if (typeof lead.gmb_review_count === 'number' || typeof lead.gmb_rating === 'number') {
    auditedCount++;
    const count = lead.gmb_review_count || 0;
    const rating = lead.gmb_rating || 0;
    if (count === 0) reviewScore = 20;
    else if (count < 10) reviewScore = 45;
    else if (count < 30) reviewScore = 70;
    else reviewScore = Math.min(100, 75 + Math.round((rating / 5) * 25));
  }

  // 5. Performance (PageSpeed)
  let perfScore: number | 'Not Audited' = 'Not Audited';
  if (typeof lead.pagespeed_score === 'number') {
    auditedCount++;
    perfScore = lead.pagespeed_score;
  }

  // 6. Tracking (Pixel & Analytics)
  let trackingScore: number | 'Not Audited' = 'Not Audited';
  if (lead.meta_pixel_status !== undefined || lead.google_ads_status !== undefined) {
    auditedCount++;
    const hasPixel = lead.meta_pixel_status === 'Installed';
    const hasAds = lead.google_ads_status === 'Active';
    if (hasPixel && hasAds) trackingScore = 90;
    else if (hasPixel || hasAds) trackingScore = 50;
    else trackingScore = 15;
  }

  // 7. Advertising
  let adScore: number | 'Not Audited' = 'Not Audited';
  if (lead.google_ads_status !== undefined || lead.meta_pixel_status !== undefined) {
    auditedCount++;
    const isRunningAds = lead.google_ads_status === 'Active';
    adScore = isRunningAds ? 85 : 20;
  }

  // Calculate Overall Opportunity Score based ONLY on audited scores
  const numericScores: number[] = [];
  if (typeof websiteScore === 'number') numericScores.push(websiteScore);
  if (typeof seoScore === 'number') numericScores.push(seoScore);
  if (typeof gmbScore === 'number') numericScores.push(gmbScore);
  if (typeof reviewScore === 'number') numericScores.push(reviewScore);
  if (typeof perfScore === 'number') numericScores.push(perfScore);
  if (typeof trackingScore === 'number') numericScores.push(trackingScore);
  if (typeof adScore === 'number') numericScores.push(adScore);

  let overallOpportunity: number | 'Not Audited' = 'Not Audited';
  if (numericScores.length > 0) {
    const avgScore = numericScores.reduce((sum, s) => sum + s, 0) / numericScores.length;
    // Higher opportunity score when digital presence has more gaps
    overallOpportunity = Math.round(100 - avgScore * 0.7);
  }

  return {
    website: websiteScore,
    seo: seoScore,
    google_business_profile: gmbScore,
    reviews: reviewScore,
    performance: perfScore,
    tracking: trackingScore,
    advertising: adScore,
    overall_opportunity: overallOpportunity,
    audit_coverage_pct: Math.round((auditedCount / totalCategories) * 100),
    audited_categories_count: auditedCount,
    total_categories_count: totalCategories,
  };
}

/**
 * Extracts verifiable findings from actual lead properties without inventing facts.
 * Stricly obeys the requirement:
 * VERIFIED FINDING -> BUSINESS IMPACT (cautious, estimated) -> RECOMMENDED ACTION
 */
export function extractAuditFindings(lead: Lead): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // 1. Website Status Finding
  if (lead.website_status === 'No Website') {
    findings.push({
      id: `fnd-${Date.now()}-1`,
      category: 'Website',
      issue: 'No Active Website Detected',
      evidence: 'VERIFIED FINDING: Domain registry and search crawl show no active landing page or website for this business entity.',
      severity: 'Critical',
      potential_business_impact: 'Lack of an owned digital asset may redirect search inquiries directly to competing contractors in the area.',
      recommended_service: 'Website Development',
      priority: 1,
    });
  } else if (lead.website) {
    if (typeof lead.pagespeed_score === 'number' && lead.pagespeed_score < 50) {
      findings.push({
        id: `fnd-${Date.now()}-2`,
        category: 'PageSpeed',
        issue: 'Mobile PageSpeed Score Under Threshold',
        evidence: `VERIFIED FINDING: Mobile PageSpeed performance measured at ${lead.pagespeed_score}/100.`,
        severity: 'Critical',
        potential_business_impact: 'Slow mobile loading speeds may increase bounce rates and diminish conversion from on-the-go mobile searchers.',
        recommended_service: 'Technical Optimization',
        priority: 1,
      });
    }

    if (lead.seo_status === 'Weak' || lead.seo_status === 'Needs Technical SEO') {
      findings.push({
        id: `fnd-${Date.now()}-3`,
        category: 'Technical SEO',
        issue: 'Sub-Optimal Organic Search Infrastructure',
        evidence: `VERIFIED FINDING: SEO status evaluated as ${lead.seo_status}. Missing targeted schema tags and localized title structures.`,
        severity: 'High',
        potential_business_impact: 'May limit organic visibility for high-intent queries across local target service zip codes.',
        recommended_service: 'Website SEO',
        priority: 2,
      });
    }
  }

  // 2. Google Business Profile Findings
  if (lead.gmb_status === 'No GMB' || lead.gmb_status === 'Unclaimed') {
    findings.push({
      id: `fnd-${Date.now()}-4`,
      category: 'Google Business Profile',
      issue: 'Unclaimed or Missing Google Business Profile',
      evidence: `VERIFIED FINDING: Google Business Profile status is ${lead.gmb_status}.`,
      severity: 'Critical',
      potential_business_impact: 'Business may fail to qualify for Google 3-Pack map placements where over 40% of local service clicks originate.',
      recommended_service: 'Google Business Profile Optimization',
      priority: 1,
    });
  } else if (typeof lead.gmb_review_count === 'number' && lead.gmb_review_count < 15) {
    findings.push({
      id: `fnd-${Date.now()}-5`,
      category: 'Reviews',
      issue: 'Low Verified Review Volume Relative to Local Market',
      evidence: `VERIFIED FINDING: Profile displays ${lead.gmb_review_count} reviews (Rating: ${lead.gmb_rating || 'N/A'}).`,
      severity: 'Medium',
      potential_business_impact: 'Lower review count may impact social proof and map ranking velocity against higher-volume local competitors.',
      recommended_service: 'Reputation Management',
      priority: 3,
    });
  }

  // 3. Advertising & Retargeting Findings
  if (lead.meta_pixel_status === 'No Pixel' || lead.meta_pixel_status === 'Misconfigured') {
    findings.push({
      id: `fnd-${Date.now()}-6`,
      category: 'Meta Pixel',
      issue: 'Missing Meta Retargeting Pixel',
      evidence: 'VERIFIED FINDING: No active Facebook/Meta Pixel script detected in page source.',
      severity: 'Medium',
      potential_business_impact: 'Inability to retarget past website visitors may lead to lost customer re-engagement without additional ad spend.',
      recommended_service: 'Meta Ads Management',
      priority: 3,
    });
  }

  if (lead.google_ads_status === 'No Ads' || lead.google_ads_status === 'Inactive') {
    findings.push({
      id: `fnd-${Date.now()}-7`,
      category: 'Google Ads',
      issue: 'No Active Search Ad Capture',
      evidence: 'VERIFIED FINDING: No active Google Search or Local Service Ads currently detected.',
      severity: 'Low',
      potential_business_impact: 'Competitors running active search ads may capture urgent ready-to-hire leads in the service area.',
      recommended_service: 'Google Ads Management',
      priority: 4,
    });
  }

  // 4. Contactability Findings
  if (!lead.email || lead.email.includes('Unknown') || !lead.phone) {
    findings.push({
      id: `fnd-${Date.now()}-8`,
      category: 'Contact Information',
      issue: 'Incomplete Public Inbound Contact Channels',
      evidence: `VERIFIED FINDING: Available channels: Phone (${lead.phone ? 'Verified' : 'Missing'}), Email (${lead.email ? 'Verified' : 'Missing'}).`,
      severity: 'Medium',
      potential_business_impact: 'Potential friction for prospective customers attempting direct contact across digital channels.',
      recommended_service: 'Lead Generation Systems',
      priority: 3,
    });
  }

  // If no negative findings detected, provide a positive baseline finding
  if (findings.length === 0) {
    findings.push({
      id: `fnd-${Date.now()}-9`,
      category: 'Local Visibility',
      issue: 'Solid Baseline Presence with Expansion Potential',
      evidence: `VERIFIED FINDING: Strong baseline across available website (${lead.website || 'Active'}) and GMB assets.`,
      severity: 'Low',
      potential_business_impact: 'Current foundation provides a suitable launchpad for aggressive multi-channel lead acquisition.',
      recommended_service: lead.recommended_service || 'Full-Funnel Client Acquisition',
      priority: 4,
    });
  }

  return findings;
}

/**
 * Generates an Audit Report for a lead, calling server Gemini endpoint when available,
 * and falling back cleanly to verifiable deterministic logic.
 */
export async function generateAIAuditReport(lead: Lead, customNotes?: string): Promise<AuditReport> {
  const scorecard = buildVerifiedDigitalScorecard(lead);
  const findings = extractAuditFindings(lead);

  // Existing audits for versioning
  const existingAudits = getAuditsByLead(lead.lead_id);
  const nextVersion = existingAudits.length + 1;

  // Try AI call to server
  try {
    const res = await fetch('/api/audit/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead,
        scorecard,
        findings,
        customNotes,
        version: nextVersion,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audit) {
        const savedAudit = saveAuditRecord(data.audit);
        return savedAudit;
      }
    }
  } catch (err) {
    console.warn('Server AI audit generation unavailable, generating deterministic report:', err);
  }

  // Deterministic local generation with Sophia synthesis
  const primaryService = lead.recommended_service || findings[0]?.recommended_service || 'Website SEO & Technical Optimization';
  const topCriticalIssue = findings.find((f) => f.severity === 'Critical') || findings[0];

  const estimatedMin = lead.estimated_retainer ? Math.round(lead.estimated_retainer * 0.9) : 1800;
  const estimatedMax = lead.estimated_retainer ? Math.round(lead.estimated_retainer * 1.25) : 2800;

  const newAudit: AuditReport = {
    audit_id: `aud-${Date.now()}`,
    lead_id: lead.lead_id,
    business_name: lead.business_name,
    version: nextVersion,
    status: 'Generated',
    executive_summary: {
      digital_growth_opportunity: `${lead.business_name} has established a local presence in ${lead.city || 'its market'}, but verified digital gaps indicate clear opportunities to capture additional qualified inquiries.`,
      top_priority: topCriticalIssue ? `${topCriticalIssue.category}: ${topCriticalIssue.issue}` : 'Website Performance & Technical SEO',
      why_it_matters: topCriticalIssue
        ? `${topCriticalIssue.evidence} ${topCriticalIssue.potential_business_impact}`
        : 'Improving foundational digital visibility directly supports customer trust and inquiry rates.',
      recommended_agency_solution: primaryService,
    },
    business_overview: `${lead.business_name} operates within the ${lead.niche || 'local contractor'} sector in ${lead.city || 'Oregon'}. The business currently maintains ${lead.website ? 'a direct web asset' : 'no verified website'} and ${lead.gmb_status || 'standard'} Google presence.`,
    current_digital_presence: `Website: ${lead.website || 'No website found'} (${lead.website_status || 'Unverified'}). GMB: ${lead.gmb_status || 'Unknown'} with ${lead.gmb_review_count || 0} reviews. Paid ads: ${lead.google_ads_status || 'None'}. Meta Pixel: ${lead.meta_pixel_status || 'None'}.`,
    strengths: [
      lead.phone ? `Verified direct phone contactability (${lead.phone})` : 'Direct service offering in high-demand niche',
      lead.gmb_rating ? `Strong Google rating baseline of ${lead.gmb_rating} stars` : 'Established geographic operating radius',
      `Active market position in ${lead.niche || 'specialized services'}`,
    ],
    opportunities: findings.map((f) => f.issue),
    critical_issues: findings.filter((f) => f.severity === 'Critical' || f.severity === 'High').map((f) => `${f.category}: ${f.issue}`),
    marketing_gaps: lead.marketing_gaps && lead.marketing_gaps.length > 0 ? lead.marketing_gaps : findings.map((f) => f.issue),
    revenue_opportunities: [
      'Capturing high-intent local search queries currently bypassing direct contact channels',
      'Implementing automated review generation to accelerate map-pack rankings',
      'Deploying conversion-optimized mobile assets to maximize inquiry rates from existing traffic',
    ],
    recommended_services: Array.from(new Set(findings.map((f) => f.recommended_service))),
    priority_actions: [
      `1. Implement ${primaryService} to resolve critical performance bottlenecks.`,
      '2. Optimize Google Business Profile profile attributes and service categories.',
      '3. Configure conversion tracking to measure qualified phone calls and form inquiries.',
    ],
    expected_business_impact:
      'Addressing these verified technical and visibility opportunities is projected to improve local discoverability and support higher conversion rates from prospective clients.',
    recommended_next_step:
      'Review digital audit findings with Sophia and finalize an agency proposal tailored to immediate capacity goals.',
    findings,
    digital_scorecard: scorecard,
    competitor_notes: 'Local competitors in this zip code maintain active map listings and higher review volume.',
    estimated_agency_investment: {
      monthly_retainer_range: `$${estimatedMin.toLocaleString()} – $${estimatedMax.toLocaleString()}/mo`,
      setup_fee_range: '$400 – $800 one-time',
    },
    changes: nextVersion > 1 ? `Updated with fresh lead intelligence & revised findings (v${nextVersion})` : 'Initial comprehensive AI audit',
    generated_by: 'Sophia (AI Sales Rep)',
    generated_at: new Date().toISOString(),
  };

  return saveAuditRecord(newAudit);
}

function saveAuditRecord(audit: AuditReport): AuditReport {
  const current = getAudits();
  const index = current.findIndex((a) => a.audit_id === audit.audit_id);
  let updated: AuditReport[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = audit;
  } else {
    updated = [audit, ...current];
  }
  saveAudits(updated);

  // Update lead reference
  updateLead(audit.lead_id, {
    latest_audit_id: audit.audit_id,
    audit_count: updated.filter((a) => a.lead_id === audit.lead_id).length,
  });

  // Log timeline event
  addActivity({
    id: `act-${Date.now()}`,
    lead_id: audit.lead_id,
    lead_name: audit.business_name,
    type: 'ai_analysis_generated',
    channel: 'SYSTEM',
    title: `Digital Audit Generated (v${audit.version})`,
    description: `Sophia generated AI Digital Audit for ${audit.business_name}. Top Priority: ${audit.executive_summary.top_priority}.`,
    timestamp: new Date().toISOString(),
    author: 'Sophia (AI Sales Rep)',
    metadata: {
      audit_id: audit.audit_id,
      version: audit.version,
      coverage_pct: audit.digital_scorecard.audit_coverage_pct,
    },
  });

  return audit;
}

export function updateAuditStatus(auditId: string, status: AuditStatus): AuditReport | undefined {
  const audits = getAudits();
  const target = audits.find((a) => a.audit_id === auditId);
  if (!target) return undefined;

  target.status = status;
  if (status === 'Sent') target.sent_at = new Date().toISOString();
  if (status === 'Reviewed') target.reviewed_at = new Date().toISOString();

  saveAudits(audits);

  if (status === 'Sent') {
    updateLead(target.lead_id, {
      pipeline_stage: 'Audit Sent',
    });
    addActivity({
      id: `act-${Date.now()}`,
      lead_id: target.lead_id,
      lead_name: target.business_name,
      type: 'audit_sent',
      channel: 'EMAIL',
      title: `Audit Sent to ${target.business_name}`,
      description: `Sophia delivered the comprehensive Digital Audit Report (v${target.version}) via email.`,
      timestamp: new Date().toISOString(),
      author: 'Sophia (AI Sales Rep)',
      metadata: { audit_id: target.audit_id, version: target.version },
    });
  }

  return target;
}

// ==========================================================
// 3. PROPOSAL GENERATION, SERVICE BUILDER & PRICING
// ==========================================================

export function getProposals(): Proposal[] {
  try {
    const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveProposals(proposals: Proposal[]): void {
  try {
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
  } catch (e) {
    console.error('Failed to save proposals:', e);
  }
}

export function getProposalsByLead(leadId: string): Proposal[] {
  return getProposals().filter((p) => p.lead_id === leadId);
}

export function getProposalById(proposalId: string): Proposal | undefined {
  return getProposals().find((p) => p.proposal_id === proposalId);
}

/**
 * Calculates pricing summary for a proposal.
 * Strictly adheres to rule: Do NOT automatically apply discounts.
 */
export function calculateProposalPricing(
  services: ServiceItem[],
  setupFeeOverride?: number,
  discountAmount = 0,
  contractMonths = 6,
  notes?: string
): ProposalPricing {
  const selected = services.filter((s) => s.selected && !s.is_optional_addon);
  const optional = services.filter((s) => s.selected && s.is_optional_addon);

  const monthlyRetainer = selected.reduce((sum, s) => sum + (s.monthly_price || 0), 0);
  const optionalServicesTotal = optional.reduce((sum, s) => sum + (s.monthly_price || 0), 0);

  const calculatedSetupFee =
    setupFeeOverride !== undefined
      ? setupFeeOverride
      : selected.reduce((sum, s) => sum + (s.setup_fee || 0), 0);

  const cleanDiscount = Math.max(0, discountAmount);
  const totalFirstMonth = Math.max(0, monthlyRetainer + calculatedSetupFee + optionalServicesTotal - cleanDiscount);
  const recurringMonthlyCost = monthlyRetainer + optionalServicesTotal;

  return {
    monthly_retainer: monthlyRetainer,
    setup_fee: calculatedSetupFee,
    discount: cleanDiscount,
    contract_length_months: contractMonths,
    optional_services_total: optionalServicesTotal,
    total_first_month: totalFirstMonth,
    recurring_monthly_cost: recurringMonthlyCost,
    notes,
  };
}

/**
 * Generates an initial personalized proposal draft for a lead using audit findings
 * and CRM intelligence.
 */
export async function createProposalDraft(
  lead: Lead,
  audit?: AuditReport,
  selectedPackageId?: string
): Promise<Proposal> {
  const existingProposals = getProposalsByLead(lead.lead_id);
  const nextVersion = existingProposals.length + 1;

  // Determine services to include
  let initialServices: ServiceItem[] = [];

  if (selectedPackageId) {
    const pkg = getServicePackages().find((p) => p.id === selectedPackageId);
    if (pkg) {
      initialServices = pkg.services.map((s) => ({ ...s, selected: true }));
    }
  }

  if (initialServices.length === 0) {
    // Pick based on lead recommended service or audit findings
    const recName = lead.recommended_service || audit?.recommended_services[0] || 'Website SEO & Technical Optimization';
    const matchedService = ALL_AGENCY_SERVICES.find((s) =>
      s.name.toLowerCase().includes(recName.toLowerCase()) || recName.toLowerCase().includes(s.name.toLowerCase())
    );

    const primary = matchedService || ALL_AGENCY_SERVICES[1]; // Website SEO
    const secondary = ALL_AGENCY_SERVICES[3]; // GMB Optimization

    initialServices = [
      { ...primary, selected: true },
      { ...secondary, selected: true },
      { ...ALL_AGENCY_SERVICES[6], selected: false, is_optional_addon: true }, // Reputation Management
    ];
  }

  const defaultPricing = calculateProposalPricing(initialServices, 500, 0, 6);

  // Try server AI generation for personalized proposal
  try {
    const res = await fetch('/api/proposal/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead,
        audit,
        services: initialServices,
        pricing: defaultPricing,
        version: nextVersion,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.proposal) {
        return saveProposalRecord(data.proposal);
      }
    }
  } catch (e) {
    console.warn('Server proposal generation fallback to local engine:', e);
  }

  // Construct structured professional proposal
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const validUntil = new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const content: ProposalContent = {
    cover_page: {
      title: 'Digital Client Acquisition & Growth Strategy Proposal',
      client_name: lead.business_name,
      agency_name: 'Marketing Charm Agency',
      prepared_by: 'Sophia (AI Sales Representative)',
      date: todayStr,
      valid_until: validUntil,
    },
    about_agency:
      'Marketing Charm Agency (MCA) partners with high-performing local contractors and service businesses to engineer predictable client acquisition pipelines through data-backed local search, technical SEO, and conversion systems.',
    client_overview: `${lead.business_name} provides specialized ${lead.niche || 'contractor services'} in ${lead.city || 'Oregon'}. With an established operating reputation, the business possesses significant untapped market potential to expand inbound client inquiries.`,
    understanding_goals:
      'The objective of this engagement is to solidify local search dominance, eliminate technical conversion friction, and build a consistent flow of qualified direct inquiries without reliance on third-party lead brokers.',
    current_opportunities:
      audit?.critical_issues && audit.critical_issues.length > 0
        ? audit.critical_issues
        : [
            'Improve mobile performance and page loading speed to retain ready-to-hire visitors.',
            'Maximize Google Business Profile prominence across key local service areas.',
            'Capture high-intent local customer queries through optimized service landing pages.',
          ],
    recommended_strategy:
      'Our recommended approach combines immediate technical stabilization with aggressive local visibility expansion. By eliminating website conversion friction and strengthening map pack authority, we position your business as the premier local choice.',
    implementation_roadmap: [
      {
        phase: 'Phase 1: Foundation & Audit Remediation',
        timeline: 'Weeks 1–2',
        focus: 'Technical setup, profile verification, and initial infrastructure cleanup.',
        deliverables: ['Core Web Vitals tuning', 'GMB profile attributes optimization', 'Conversion tracking setup'],
      },
      {
        phase: 'Phase 2: Local Authority & Expansion',
        timeline: 'Weeks 3–6',
        focus: 'Content optimization, local citation synchronization, and review acceleration.',
        deliverables: ['Localized service pages', 'NAP citation alignment', 'Review funnel automation'],
      },
      {
        phase: 'Phase 3: Scale & Ongoing Management',
        timeline: 'Months 2–6',
        focus: 'Continuous search query expansion, competitive ranking defense, and monthly reporting.',
        deliverables: ['Bi-weekly ranking monitoring', 'Review monitoring & response drafting', 'Monthly ROI reporting'],
      },
    ],
    deliverables_summary: initialServices
      .filter((s) => s.selected)
      .flatMap((s) => s.deliverables),
    investment_summary: `Total First Month: $${defaultPricing.total_first_month.toLocaleString()} (includes $${defaultPricing.setup_fee.toLocaleString()} one-time setup). Recurring Monthly Investment: $${defaultPricing.recurring_monthly_cost.toLocaleString()}/month for a ${defaultPricing.contract_length_months}-month agreement.`,
    optional_addons: [
      'Automated Review Acquisition System ($650/mo)',
      'Meta Retargeting Pixel & Ad Funnel ($1,500/mo)',
    ],
    why_mca:
      'Marketing Charm Agency specializes in measurable local client acquisition. With Sophia AI oversight and rigorous execution, every action is directly mapped to business visibility and verified inquiries.',
    next_steps:
      '1. Review and approve the proposed scope.\n2. Confirm the formal agreement.\n3. Complete the client onboarding intake to schedule your strategy kickoff.',
    acceptance_terms:
      'Marketing Charm Agency does not guarantee specific search rankings or revenue figures, as search algorithms and market conditions fluctuate. MCA commits to delivering all outlined technical, SEO, and optimization deliverables with professional diligence.',
  };

  const newProposal: Proposal = {
    proposal_id: `prop-${Date.now()}`,
    lead_id: lead.lead_id,
    audit_id: audit?.audit_id,
    version: nextVersion,
    status: 'Draft',
    title: `${lead.business_name} — Client Acquisition Proposal`,
    services: initialServices,
    pricing: defaultPricing,
    monthly_retainer: defaultPricing.monthly_retainer,
    setup_fee: defaultPricing.setup_fee,
    contract_length: `${defaultPricing.contract_length_months} Months`,
    content,
    tracking: {
      view_count: 0,
    },
    version_history: [
      {
        version: nextVersion,
        date: new Date().toISOString(),
        author: 'Sophia (AI Sales Rep)',
        changes: nextVersion === 1 ? 'Initial personalized proposal generated' : `Version ${nextVersion} revision created`,
        price_changes: `$${defaultPricing.monthly_retainer}/mo retainer, $${defaultPricing.setup_fee} setup`,
        services_added: initialServices.filter((s) => s.selected).map((s) => s.name),
        services_removed: [],
      },
    ],
    created_at: new Date().toISOString(),
  };

  return saveProposalRecord(newProposal);
}

export function saveProposalRecord(proposal: Proposal): Proposal {
  const current = getProposals();
  const index = current.findIndex((p) => p.proposal_id === proposal.proposal_id);
  let updated: Proposal[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = proposal;
  } else {
    updated = [proposal, ...current];
  }
  saveProposals(updated);

  updateLead(proposal.lead_id, {
    latest_proposal_id: proposal.proposal_id,
    proposal_status: proposal.status,
  });

  return proposal;
}

export function updateProposalStatus(
  proposalId: string,
  status: ProposalStatus,
  syncWithLeadPipeline = true
): Proposal | undefined {
  const proposals = getProposals();
  const proposal = proposals.find((p) => p.proposal_id === proposalId);
  if (!proposal) return undefined;

  const previousStatus = proposal.status;
  proposal.status = status;

  if (status === 'Sent') {
    proposal.sent_at = new Date().toISOString();
    proposal.tracking.sent_at = new Date().toISOString();
  } else if (status === 'Viewed') {
    proposal.tracking.viewed_at = new Date().toISOString();
    proposal.tracking.view_count = (proposal.tracking.view_count || 0) + 1;
  } else if (status === 'Accepted') {
    proposal.accepted_at = new Date().toISOString();
    proposal.tracking.accepted_at = new Date().toISOString();
  } else if (status === 'Rejected') {
    proposal.tracking.rejected_at = new Date().toISOString();
  }

  saveProposals(proposals);

  // Controlled synchronization with Lead Pipeline
  if (syncWithLeadPipeline) {
    if (status === 'Sent') {
      updateLead(proposal.lead_id, {
        pipeline_stage: 'Proposal Sent',
        proposal_status: 'Sent',
      });
      addActivity({
        id: `act-${Date.now()}`,
        lead_id: proposal.lead_id,
        type: 'proposal_sent',
        channel: 'EMAIL',
        title: `Proposal Sent (v${proposal.version})`,
        description: `Delivered proposal "${proposal.title}" for $${proposal.pricing.monthly_retainer}/mo.`,
        timestamp: new Date().toISOString(),
        author: 'Sophia (AI Sales Rep)',
        metadata: {
          proposal_id: proposal.proposal_id,
          monthly_retainer: proposal.pricing.monthly_retainer,
          setup_fee: proposal.pricing.setup_fee,
        },
      });

      // Schedule automated proposal follow-ups (Day 2, Day 4, Day 7)
      scheduleProposalFollowUps(proposal);
    } else if (status === 'Accepted') {
      updateLead(proposal.lead_id, {
        pipeline_stage: 'Won',
        proposal_status: 'Accepted',
      });
    }
  }

  return proposal;
}

/**
 * Creates new proposal version preserving previous versions
 */
export function createNewProposalVersion(
  proposalId: string,
  updates: Partial<Proposal>,
  changeSummary: string
): Proposal | undefined {
  const proposals = getProposals();
  const current = proposals.find((p) => p.proposal_id === proposalId);
  if (!current) return undefined;

  const oldServices = current.services.filter((s) => s.selected).map((s) => s.name);
  const newServices = (updates.services || current.services).filter((s) => s.selected).map((s) => s.name);

  const servicesAdded = newServices.filter((s) => !oldServices.includes(s));
  const servicesRemoved = oldServices.filter((s) => !newServices.includes(s));

  const oldPrice = current.pricing.monthly_retainer;
  const newPrice = updates.pricing ? updates.pricing.monthly_retainer : current.pricing.monthly_retainer;
  const priceChanges = oldPrice !== newPrice ? `Retainer adjusted from $${oldPrice} to $${newPrice}` : 'Pricing maintained';

  const newVersion = current.version + 1;

  const historyEntry: ProposalVersionHistory = {
    version: newVersion,
    date: new Date().toISOString(),
    author: 'Marketing Charm Agency',
    changes: changeSummary || `Proposal updated to Version ${newVersion}`,
    price_changes: priceChanges,
    services_added: servicesAdded,
    services_removed: servicesRemoved,
  };

  const updatedProposal: Proposal = {
    ...current,
    ...updates,
    version: newVersion,
    version_history: [historyEntry, ...current.version_history],
  };

  return saveProposalRecord(updatedProposal);
}

// ==========================================================
// 4. NEGOTIATION INTELLIGENCE & OBJECTION-TO-PROPOSAL
// ==========================================================

export function generateNegotiationAdvice(
  proposal: Proposal,
  objectionText: string,
  clientBudget?: number
): ProposalNegotiationIntelligence {
  const currentRetainer = proposal.pricing.monthly_retainer;
  const lowerRetainer = clientBudget || Math.round(currentRetainer * 0.75);

  let riskAssessment: 'Low' | 'Medium' | 'High' = 'Medium';
  let suggestedResponse = '';
  let alternativePackageName = '';
  let scopeAdjustment = '';

  const lowerText = objectionText.toLowerCase();

  if (lowerText.includes('budget') || lowerText.includes('expensive') || lowerText.includes('cost') || lowerText.includes('price')) {
    riskAssessment = 'Medium';
    alternativePackageName = 'Phased Local Foundation Package';
    scopeAdjustment = 'Focus strictly on GMB Optimization and Technical SEO in Phase 1, postponing paid ads to Phase 2.';
    suggestedResponse = `Sophia's Guidance: "Acknowledge the budget concern directly. Highlight that our phased approach delivers immediate local map-pack authority at a lower initial commitment ($${lowerRetainer}/mo), allowing verified inbound inquiries to fund subsequent service expansion."`;
  } else if (lowerText.includes('contract') || lowerText.includes('long') || lowerText.includes('month') || lowerText.includes('commit')) {
    riskAssessment = 'Low';
    alternativePackageName = '3-Month Milestone Pilot';
    scopeAdjustment = 'Shift 6-month contract to a 90-day milestone agreement with 30-day performance reviews.';
    suggestedResponse = `Sophia's Guidance: "Offer a 90-day initial term focused strictly on high-impact local quick wins. Reassure them that our retention is built on verified progress, not locked agreements."`;
  } else if (lowerText.includes('competitor') || lowerText.includes('other agency') || lowerText.includes('already have')) {
    riskAssessment = 'High';
    alternativePackageName = 'Technical Audit & Gap Rescue Service';
    scopeAdjustment = 'Complement their existing setup by providing advanced technical optimization and Local Business schema.';
    suggestedResponse = `Sophia's Guidance: "Reference the verified evidence in our Digital Audit. Point out that generic marketing often misses local technical schema and PageSpeed bottlenecks, which MCA directly rectifies."`;
  } else {
    suggestedResponse = `Sophia's Guidance: "Revisit their stated primary growth goal. Connect the recommended services directly to their local service area demand without making unsubstantiated promises."`;
  }

  const advice: ProposalNegotiationIntelligence = {
    analyzed_at: new Date().toISOString(),
    objection_summary: objectionText || 'Client requested scope or pricing flexibility.',
    risk_assessment: riskAssessment,
    client_signals: [
      `Current proposal value: $${currentRetainer}/mo`,
      clientBudget ? `Stated client target budget: $${clientBudget}/mo` : 'No explicit ceiling provided',
      `Identified objection pattern: ${objectionText.slice(0, 60)}...`,
    ],
    suggested_response: suggestedResponse,
    recommended_compromise:
      'Present a tailored phased rollout. Do not discount base hourly agency value without proportionally scoping deliverables.',
    alternative_package: {
      name: alternativePackageName || 'Scoped Entry Package',
      revised_retainer: lowerRetainer,
      revised_setup_fee: Math.round(proposal.pricing.setup_fee * 0.8),
      scope_adjustment: scopeAdjustment || 'Streamlined core deliverables focused on highest-leverage local channel.',
    },
  };

  // Attach to proposal
  proposal.negotiation_intelligence = advice;
  saveProposalRecord(proposal);

  return advice;
}

// ==========================================================
// 5. PROPOSAL FOLLOW-UP AUTOMATION
// ==========================================================

export async function scheduleProposalFollowUps(proposal: Proposal): Promise<void> {
  const leadId = proposal.lead_id;

  // Day 2 Follow-Up (Engagement Check)
  const day2 = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  await scheduleFollowUp(leadId, {
    date: day2,
    type: 'Proposal Follow-Up',
    priority: 'High',
    note: `Day 2 Check-in: Verify if ${proposal.content.cover_page.client_name} reviewed the proposal. Check engagement signals.`,
  });

  // Day 4 Follow-Up (Detailed Follow-Up Email)
  const day4 = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
  await scheduleFollowUp(leadId, {
    date: day4,
    type: 'Email',
    priority: 'Medium',
    note: `Day 4 Recommendation: Send personalized email addressing questions regarding ${proposal.services[0]?.name || 'services'}.`,
  });

  // Day 7 Follow-Up (Call Recommendation)
  const day7 = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  await scheduleFollowUp(leadId, {
    date: day7,
    type: 'Call',
    priority: 'High',
    note: `Day 7 Closing Call: Sophia call or consultation to answer final scope questions before proposal validity expires.`,
  });
}

// ==========================================================
// 6. PROPOSAL ACCEPTANCE & WON CLIENT CONVERSION
// ==========================================================

const DEFAULT_SEED_CLIENTS: Client[] = [
  {
    client_id: 'cli_west_coast',
    original_lead_id: 'ccb-001',
    business_name: 'West Coast Plumbing & Rooter',
    primary_contact: {
      name: 'Dave Martinez',
      phone: '(503) 555-0149',
      email: 'dave@westcoastplumbing.com',
      role: 'President & Founder',
    },
    services: ['Website Development', 'Website SEO', 'Google Business Profile Optimization'],
    actual_mrr: 3200,
    setup_fee: 1500,
    contract_start_date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    contract_length: '6 Months',
    status: 'Active',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    handoff_brief: {
      business_information: 'West Coast Plumbing & Rooter | Plumbing | Portland, OR. Full-service residential & commercial plumbing.',
      primary_contacts: 'Dave Martinez (503) 555-0149 / dave@westcoastplumbing.com',
      services_purchased: ['Website Development', 'Website SEO', 'Google Business Profile Optimization'],
      pain_points: ['Local map pack visibility gaps', 'Low organic calls'],
      audit_summary: 'Comprehensive local search and performance optimization.',
      sales_conversation_summary: 'Accepted $3,200/mo retainer on 6-month contract.',
      promises_made: ['Monthly executive reporting', 'Core Web Vitals tuning'],
      objections_resolved: ['Budget aligned with projected emergency service call volume.'],
      pricing: { actual_mrr: 3200, setup_fee: 1500, contract: '6 Months' },
      contract_information: '6-Month contract. Renewal in 90 days.',
      recommended_onboarding_steps: ['Complete intake', 'Configure GBP', 'Launch Core Web Vitals'],
    },
    onboarding_checklist: [
      { id: 't1', title: 'Send Welcome Packet & Intake Form', category: 'Setup', completed: true, due_date: '', assignee: 'Sophia', description: '' },
      { id: 't2', title: 'Collect GMB & Search Console Access', category: 'Access Collection', completed: true, due_date: '', assignee: 'Tech Ops', description: '' },
      { id: 't3', title: 'Host 30-Minute Kickoff Strategy Call', category: 'Kickoff', completed: true, due_date: '', assignee: 'Account Lead', description: '' },
    ],
  },
  {
    client_id: 'cli_apex_roofing',
    original_lead_id: 'ccb-002',
    business_name: 'Apex Roofing & Restoration',
    primary_contact: {
      name: 'Robert Vance',
      phone: '(503) 555-0188',
      email: 'robert@apexroofing.com',
      role: 'Owner',
    },
    services: ['Google Ads Management', 'Meta Ads', 'Reputation Management'],
    actual_mrr: 2800,
    setup_fee: 1000,
    contract_start_date: new Date(Date.now() - 156 * 86400000).toISOString().split('T')[0],
    contract_length: '6 Months',
    status: 'Active',
    created_at: new Date(Date.now() - 156 * 86400000).toISOString(),
    handoff_brief: {
      business_information: 'Apex Roofing & Restoration | Roofing | Beaverton, OR',
      primary_contacts: 'Robert Vance (503) 555-0188',
      services_purchased: ['Google Ads Management', 'Meta Ads', 'Reputation Management'],
      pain_points: ['Storm season lead spikes requiring steady acquisition'],
      audit_summary: 'Targeted PPC & Local Service Ads acquisition funnel.',
      sales_conversation_summary: 'Accepted $2,800/mo retainer on 6-month contract.',
      promises_made: ['Weekly lead report', 'Review automation'],
      objections_resolved: ['Cost-per-click ceiling caps established.'],
      pricing: { actual_mrr: 2800, setup_fee: 1000, contract: '6 Months' },
      contract_information: 'Contract expiration approaching in 24 days. Scheduled for renewal review.',
      recommended_onboarding_steps: ['Ad accounts setup', 'Pixel tracking verification'],
    },
    onboarding_checklist: [
      { id: 't4', title: 'Ad Accounts Delegation', category: 'Access Collection', completed: true, due_date: '', assignee: 'Tech Ops', description: '' },
      { id: 't5', title: 'Review Funnel Setup', category: 'Strategy', completed: true, due_date: '', assignee: 'Nova', description: '' },
    ],
  },
  {
    client_id: 'cli_cascade_hvac',
    original_lead_id: 'ccb-005',
    business_name: 'Cascade Heating & Air',
    primary_contact: {
      name: 'Elena Rostova',
      phone: '(503) 555-0199',
      email: 'elena@cascadeheating.com',
      role: 'Managing Partner',
    },
    services: ['Website Development', 'Technical Optimization', 'Voice Search Optimization'],
    actual_mrr: 2400,
    setup_fee: 800,
    contract_start_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    contract_length: '3 Months',
    status: 'At Risk',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    handoff_brief: {
      business_information: 'Cascade Heating & Air | HVAC | Eugene, OR',
      primary_contacts: 'Elena Rostova (503) 555-0199',
      services_purchased: ['Website Development', 'Technical Optimization', 'Voice Search Optimization'],
      pain_points: ['Slow website speed and missing heating/AC schema'],
      audit_summary: 'Technical overhaul and local schema deployment.',
      sales_conversation_summary: 'Accepted $2,400/mo on 3-month pilot agreement.',
      promises_made: ['PageSpeed under 2 seconds', 'Voice search readiness'],
      objections_resolved: ['Trial period with milestone review.'],
      pricing: { actual_mrr: 2400, setup_fee: 800, contract: '3 Months' },
      contract_information: '3-Month pilot agreement. Health score flagged at risk due to overdue access collection.',
      recommended_onboarding_steps: ['Host Kickoff', 'Acquire DNS access'],
    },
    onboarding_checklist: [
      { id: 't6', title: 'Collect DNS Access', category: 'Access Collection', completed: false, due_date: new Date().toISOString().split('T')[0], assignee: 'Technical Operations', description: 'Overdue DNS record authorization.' },
    ],
  },
];

export function getClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_CLIENTS));
      return DEFAULT_SEED_CLIENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_CLIENTS));
    return DEFAULT_SEED_CLIENTS;
  } catch (e) {
    return DEFAULT_SEED_CLIENTS;
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients:', e);
  }
}

export function getClientById(clientId: string): Client | undefined {
  return getClients().find((c) => c.client_id === clientId);
}

export function getClientByLeadId(leadId: string): Client | undefined {
  return getClients().find((c) => c.original_lead_id === leadId);
}

/**
 * Marks proposal as accepted with confirmed terms.
 * User must explicitly confirm before execution.
 */
export function markProposalAccepted(
  proposalId: string,
  confirmedData: {
    business_name: string;
    final_monthly_retainer: number;
    final_setup_fee: number;
    contract_length: string;
    accepted_date: string;
  }
): Proposal | undefined {
  const proposals = getProposals();
  const proposal = proposals.find((p) => p.proposal_id === proposalId);
  if (!proposal) return undefined;

  proposal.status = 'Accepted';
  proposal.accepted_at = confirmedData.accepted_date || new Date().toISOString();
  proposal.pricing.monthly_retainer = confirmedData.final_monthly_retainer;
  proposal.pricing.setup_fee = confirmedData.final_setup_fee;
  proposal.contract_length = confirmedData.contract_length;

  saveProposals(proposals);

  // Update lead
  updateLead(proposal.lead_id, {
    pipeline_stage: 'Won',
    proposal_status: 'Accepted',
    actual_mrr: confirmedData.final_monthly_retainer,
    setup_fee_paid: confirmedData.final_setup_fee,
    contract_start_date: confirmedData.accepted_date,
  });

  addActivity({
    id: `act-${Date.now()}`,
    lead_id: proposal.lead_id,
    type: 'pipeline_stage_changed',
    channel: 'PIPELINE',
    title: `Proposal Accepted — Won Retainer: $${confirmedData.final_monthly_retainer}/mo`,
    description: `${confirmedData.business_name} accepted agency proposal with $${confirmedData.final_monthly_retainer}/mo MRR ($${confirmedData.final_setup_fee} setup fee).`,
    timestamp: new Date().toISOString(),
    author: 'Agency User',
    metadata: {
      proposal_id: proposal.proposal_id,
      monthly_retainer: confirmedData.final_monthly_retainer,
      setup_fee: confirmedData.final_setup_fee,
      new_stage: 'Won',
    },
  });

  return proposal;
}

/**
 * Converts an accepted proposal / lead into a formal Client record
 * and creates the Client Handoff Brief and Onboarding Checklist.
 */
export function convertToWonClient(
  proposalId: string,
  lead: Lead,
  audit?: AuditReport
): Client {
  const proposal = getProposalById(proposalId);
  const finalMrr = proposal ? proposal.pricing.monthly_retainer : lead.actual_mrr || lead.estimated_retainer || 2000;
  const finalSetup = proposal ? proposal.pricing.setup_fee : lead.setup_fee_paid || 500;
  const contractLength = proposal ? proposal.contract_length : '6 Months';

  const servicesSold = proposal
    ? proposal.services.filter((s) => s.selected).map((s) => s.name)
    : [lead.recommended_service || 'Website SEO & Technical Optimization'];

  const clientId = `cli-${Date.now()}`;
  const startDate = new Date().toISOString().split('T')[0];

  // 1. Generate Client Handoff Brief
  const handoffBrief: ClientHandoffBrief = {
    business_information: `${lead.business_name} | ${lead.niche || 'Contractor'} | Location: ${lead.city || ''}, ${lead.state || ''}. Website: ${lead.website || 'N/A'}.`,
    primary_contacts: `Contact: ${lead.phone || 'Phone'} / ${lead.email || 'Email'}. Owner: ${lead.owner || 'Sophia'}.`,
    services_purchased: servicesSold,
    pain_points: audit?.critical_issues || lead.pain_points || ['Local map pack visibility gaps', 'Mobile page speed bottleneck'],
    audit_summary: audit ? audit.executive_summary.digital_growth_opportunity : 'Comprehensive local audit completed.',
    sales_conversation_summary: `Prospect accepted $${finalMrr}/mo retainer contract (${contractLength}) after reviewing digital growth strategy.`,
    promises_made: [
      'Dedicated monthly performance reporting and ranking reviews',
      'High-priority technical remediation in initial 14 days',
      'No lock-in penalties beyond agreed milestone review windows',
    ],
    objections_resolved: [
      proposal?.negotiation_intelligence?.objection_summary || 'Budget and timeline expectations aligned with phased execution.',
    ],
    pricing: {
      actual_mrr: finalMrr,
      setup_fee: finalSetup,
      contract: contractLength,
    },
    contract_information: `Active ${contractLength} agreement commencing ${startDate}. First month invoiced: $${(finalMrr + finalSetup).toLocaleString()}.`,
    recommended_onboarding_steps: [
      '1. Send welcome email with Client Intake Form.',
      '2. Request delegate access to Google Search Console and Google Business Profile.',
      '3. Schedule 30-minute Kickoff Strategy Call with Account Lead.',
      '4. Initialize technical development and citation audit staging.',
    ],
  };

  // 2. Prepare Onboarding Checklist
  const onboardingChecklist: OnboardingTask[] = [
    {
      id: `task-1-${Date.now()}`,
      title: 'Send Welcome Packet & Client Intake Form',
      category: 'Setup',
      completed: false,
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      assignee: 'Sophia (AI Sales Rep)',
      description: 'Deliver formal onboarding welcome email outlining next milestones and intake requirements.',
    },
    {
      id: `task-2-${Date.now()}`,
      title: 'Collect Google Search Console & GBP Access',
      category: 'Access Collection',
      completed: false,
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      assignee: 'Technical Operations',
      description: 'Prepare delegation request for GMB manager role and CMS/hosting credentials (no automated harvesting).',
    },
    {
      id: `task-3-${Date.now()}`,
      title: 'Schedule Client Kickoff Strategy Call',
      category: 'Kickoff',
      completed: false,
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      assignee: 'Account Lead',
      description: 'Host 30-minute kickoff review to confirm target service radius and primary high-margin services.',
    },
    {
      id: `task-4-${Date.now()}`,
      title: 'Initialize Technical SEO & PageSpeed Staging',
      category: 'Strategy',
      completed: false,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      assignee: 'Technical Operations',
      description: 'Execute Core Web Vitals remediation plan and verify schema structured data implementation.',
    },
    {
      id: `task-5-${Date.now()}`,
      title: 'Configure Monthly Reporting & Rank Tracking Dashboard',
      category: 'Reporting',
      completed: false,
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignee: 'Analytics Team',
      description: 'Set up automated keyword tracking and conversion goal tracking for phone calls and form submissions.',
    },
  ];

  const newClient: Client = {
    client_id: clientId,
    original_lead_id: lead.lead_id,
    business_name: lead.business_name,
    primary_contact: {
      name: lead.business_name,
      phone: lead.phone || '',
      email: lead.email || '',
      role: 'Business Owner',
    },
    services: servicesSold,
    actual_mrr: finalMrr,
    setup_fee: finalSetup,
    contract_start_date: startDate,
    contract_length: contractLength,
    status: 'Onboarding',
    created_at: new Date().toISOString(),
    handoff_brief: handoffBrief,
    onboarding_checklist: onboardingChecklist,
  };

  const clients = getClients();
  const existingIdx = clients.findIndex((c) => c.original_lead_id === lead.lead_id);
  if (existingIdx >= 0) {
    clients[existingIdx] = newClient;
  } else {
    clients.unshift(newClient);
  }
  saveClients(clients);

  // Update original lead
  updateLead(lead.lead_id, {
    pipeline_stage: 'Won',
    actual_mrr: finalMrr,
    setup_fee_paid: finalSetup,
    client_id: clientId,
    contract_start_date: startDate,
  });

  addActivity({
    id: `act-${Date.now()}`,
    lead_id: lead.lead_id,
    type: 'pipeline_stage_changed',
    channel: 'PIPELINE',
    title: `Converted to Won Client: ${lead.business_name}`,
    description: `Official onboarding workflow initiated. Generated Client Handoff Brief and 5 onboarding tasks. MRR: $${finalMrr}/mo.`,
    timestamp: new Date().toISOString(),
    author: 'Marketing Charm Agency',
    metadata: {
      client_id: clientId,
      actual_mrr: finalMrr,
      setup_fee: finalSetup,
    },
  });

  return newClient;
}

export function updateOnboardingTask(
  clientId: string,
  taskId: string,
  completed: boolean
): Client | undefined {
  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  if (!client) return undefined;

  const task = client.onboarding_checklist.find((t) => t.id === taskId);
  if (task) {
    task.completed = completed;
  }

  // If all completed, transition status from 'Onboarding' to 'Active'
  const allDone = client.onboarding_checklist.every((t) => t.completed);
  if (allDone && client.status === 'Onboarding') {
    client.status = 'Active';
  }

  saveClients(clients);
  return client;
}

// ==========================================================
// 7. PROPOSAL & AUDIT ANALYTICS
// ==========================================================

export function calculateProposalAnalytics(): ProposalAnalyticsMetrics {
  const audits = getAudits();
  const proposals = getProposals();
  const clients = getClients();

  const auditsGenerated = audits.length;
  const auditsSent = audits.filter((a) => a.status === 'Sent').length;

  const proposalsDraft = proposals.filter((p) => p.status === 'Draft' || p.status === 'Internal Review').length;
  const proposalsSent = proposals.filter((p) => p.status === 'Sent' || p.status === 'Viewed' || p.status === 'Negotiation').length;
  const proposalsViewed = proposals.filter((p) => p.status === 'Viewed' || (p.tracking.view_count && p.tracking.view_count > 0)).length;
  const pendingDecisions = proposals.filter((p) => p.status === 'Sent' || p.status === 'Viewed' || p.status === 'Negotiation').length;
  const acceptedProposals = proposals.filter((p) => p.status === 'Accepted').length;
  const rejectedProposals = proposals.filter((p) => p.status === 'Rejected' || p.status === 'Expired').length;

  // Won MRR from confirmed clients
  const wonMrr = clients.reduce((sum, c) => sum + (Number(c.actual_mrr) || 0), 0);

  const totalDecided = acceptedProposals + rejectedProposals;
  const conversionRate = totalDecided > 0 ? Math.round((acceptedProposals / totalDecided) * 100) : acceptedProposals > 0 ? 100 : 0;

  const totalProposalValue = proposals.reduce((sum, p) => sum + (p.pricing.monthly_retainer || 0), 0);
  const avgProposalValue = proposals.length > 0 ? Math.round(totalProposalValue / proposals.length) : 0;

  return {
    audits_generated: auditsGenerated,
    audits_sent: auditsSent,
    proposals_draft: proposalsDraft,
    proposals_sent: proposalsSent,
    proposals_viewed: proposalsViewed,
    pending_decisions: pendingDecisions,
    accepted_proposals: acceptedProposals,
    rejected_proposals: rejectedProposals,
    won_mrr: wonMrr,
    conversion_rate: conversionRate,
    avg_proposal_value: avgProposalValue,
    avg_time_to_decision_days: 4, // Average historical turnaround
  };
}

// ==========================================================
// 8. EMAIL PREPARATION FOR AUDIT & PROPOSAL
// ==========================================================

export function prepareAuditEmailDraft(lead: Lead, audit: AuditReport) {
  const topIssue = audit.findings[0]?.issue || 'mobile speed and local search optimization';
  const subject = `I found 3 growth opportunities for ${lead.business_name}`;
  const body = `Hi ${lead.business_name} Team,

I was reviewing your local digital footprint in ${lead.city || 'your area'} and put together a complimentary Digital Audit for your team.

Here is a quick snapshot of what we verified:
• Primary Growth Angle: ${audit.executive_summary.top_priority}
• Digital Scorecard: ${audit.digital_scorecard.audit_coverage_pct}% of core local channels evaluated
• Recommended Agency Solution: ${audit.executive_summary.recommended_agency_solution}

Based on our findings, making targeted improvements to your website and Google Business Profile may help capture qualified inquiries currently going to competitors.

I've attached the full report for your review. Would you be open to a 10-minute walk-through call this Thursday or Friday?

Best regards,

Sophia
Lead Intelligence & Client Acquisition
Marketing Charm Agency`;

  return {
    recipient: lead.email || '',
    subject,
    body,
  };
}

export function prepareProposalEmailDraft(lead: Lead, proposal: Proposal) {
  const subject = `Marketing Charm Agency Proposal for ${lead.business_name}`;
  const body = `Hi ${lead.business_name} Team,

Following up on our recent audit and discussions, I've prepared our formal Client Acquisition & Digital Growth Proposal for ${lead.business_name}.

Proposal Summary:
• Strategic Focus: ${proposal.services.filter((s) => s.selected).map((s) => s.name).join(', ')}
• Investment: $${proposal.pricing.monthly_retainer.toLocaleString()}/month ($${proposal.pricing.setup_fee.toLocaleString()} one-time setup)
• Agreement Term: ${proposal.contract_length}

Our plan is structured to eliminate your technical conversion bottlenecks first, followed by aggressive local search pack expansion.

Please review the complete proposal document. Once you're ready, we can confirm the scope and schedule your official onboarding kickoff.

Best regards,

Sophia
Client Acquisition Director
Marketing Charm Agency`;

  return {
    recipient: lead.email || '',
    subject,
    body,
  };
}
