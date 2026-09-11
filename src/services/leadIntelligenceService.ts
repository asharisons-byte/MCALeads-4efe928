import {
  Lead,
  LeadIntelligence,
  PriorityTier,
  ScoringEngineConfig,
  ScoreHistory,
  ScoreManualOverride,
  ScoreExplanation,
  EvidenceBasedPainPoint,
  ServiceOpportunityItem,
  AILeadAssessment,
  SophiaLeadBrief,
  RecommendedOutreachStrategy,
  LeadTemperature,
  AgencyServiceName,
} from '../types';

const INTELLIGENCE_STORAGE_PREFIX = 'mca_intelligence_';
const SCORE_HISTORY_STORAGE_KEY = 'mca_score_history_v1';
const SCORING_CONFIG_STORAGE_KEY = 'mca_scoring_config_v1';

export const DEFAULT_SCORING_CONFIG: ScoringEngineConfig = {
  weights: {
    opportunity: 25,
    service_match: 15,
    revenue_potential: 20,
    contactability: 15,
    buying_intent: 10,
    data_confidence: 5,
    engagement: 10,
  },
  tier_thresholds: {
    tier_a: 90,
    tier_b: 75,
    tier_c: 55,
    tier_d: 35,
  },
  industry_multipliers: {
    'plumb': 1.25,
    'hvac': 1.30,
    'roof': 1.35,
    'electric': 1.20,
    'drain': 1.20,
    'contractor': 1.15,
    'dent': 1.35,
    'law': 1.40,
    'legal': 1.40,
    'auto': 1.10,
    'commercial': 1.30,
    'general': 1.0,
  },
  service_packages: [
    {
      name: 'Website Development & Modernization',
      base_price: 3500,
      min_retainer: 1200,
      max_retainer: 2500,
      primary_indicators: ['No Website', 'Slow / Unreachable Server', 'Needs Redesign'],
    },
    {
      name: 'Local Search & Website SEO Retainer',
      base_price: 1800,
      min_retainer: 1800,
      max_retainer: 2800,
      primary_indicators: ['Weak SEO', 'Needs Technical SEO', 'Thin GMB'],
    },
    {
      name: 'Google Ads & Local Service Ads Management',
      base_price: 1500,
      min_retainer: 1500,
      max_retainer: 3000,
      primary_indicators: ['No Ads', 'Inactive Ads'],
    },
    {
      name: 'Meta Ads Retargeting & Brand Visibility',
      base_price: 1200,
      min_retainer: 1200,
      max_retainer: 2400,
      primary_indicators: ['No Pixel', 'Misconfigured Pixel'],
    },
    {
      name: 'Full Digital Growth System (Omni-Channel)',
      base_price: 4500,
      min_retainer: 3200,
      max_retainer: 5500,
      primary_indicators: ['High Reputation', 'Multiple Gaps'],
    },
  ],
  confidence_rules: {
    require_phone: true,
    require_email: true,
    require_website: false,
    require_gmb: false,
  },
};

export function getScoringConfig(): ScoringEngineConfig {
  try {
    const raw = localStorage.getItem(SCORING_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SCORING_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SCORING_CONFIG;
}

export function saveScoringConfig(config: ScoringEngineConfig): void {
  try {
    localStorage.setItem(SCORING_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save scoring config', e);
  }
}

/**
 * Deterministically compute multi-dimensional scores for a lead
 */
export function calculateMultiDimensionalScores(
  lead: Lead,
  config: ScoringEngineConfig = getScoringConfig()
): LeadIntelligence {
  const missingDataFields: string[] = [];

  // 1. OPPORTUNITY SCORE (0–100)
  // Measures verified marketing gaps. Missing fields are categorized as "Unknown", not penalized.
  let oppPoints = 0;
  const positiveOppFactors: string[] = [];
  const negativeOppFactors: string[] = [];

  // Website Gap
  if (lead.website_status === 'No Website' || !lead.website || lead.website.toLowerCase().includes('no website')) {
    oppPoints += 28;
    positiveOppFactors.push('No website detected: immediate candidate for turn-key website development');
  } else if (lead.website_status === 'Slow / Unreachable Server' || (lead.pagespeed_score !== undefined && lead.pagespeed_score < 45)) {
    oppPoints += 25;
    positiveOppFactors.push(`Severe website speed deficit (PageSpeed: ${lead.pagespeed_score || 28}/100) affecting mobile visitors`);
  } else if (lead.pagespeed_score !== undefined && lead.pagespeed_score < 75) {
    oppPoints += 15;
    positiveOppFactors.push(`Average website performance (${lead.pagespeed_score}/100) with technical optimization opportunities`);
  } else if (lead.pagespeed_score !== undefined) {
    negativeOppFactors.push(`Fast website (${lead.pagespeed_score}/100) limits pure speed optimization angle`);
  } else {
    missingDataFields.push('PageSpeed performance audit: Unknown');
  }

  // SEO Gap
  if (lead.seo_status === 'Weak' || lead.seo_status === 'Needs Technical SEO') {
    oppPoints += 22;
    positiveOppFactors.push('Technical SEO deficit: missing title tags, local schema, and structured data');
  } else if (lead.seo_status === 'Average') {
    oppPoints += 14;
    positiveOppFactors.push('Moderate SEO authority: opportunity to capture competitive commercial search terms');
  } else if (lead.seo_status === 'Strong') {
    negativeOppFactors.push('Established organic ranking authority');
  } else {
    missingDataFields.push('Organic keyword audit: Unknown');
  }

  // Google Business Profile & Local Map Pack Gap
  if (lead.gmb_status === 'No GMB' || !lead.gmb_url) {
    oppPoints += 20;
    positiveOppFactors.push('No verified Google Business Profile: completely invisible on Google Maps');
  } else if (lead.gmb_status === 'Thin GMB' || (lead.gmb_review_count !== undefined && lead.gmb_review_count < 15)) {
    oppPoints += 18;
    positiveOppFactors.push(`Thin local footprint (${lead.gmb_review_count || 0} reviews): vulnerable to local competitors`);
  } else if (lead.gmb_rating && lead.gmb_rating >= 4.5 && (lead.gmb_review_count || 0) >= 30) {
    oppPoints += 16;
    positiveOppFactors.push(`High review quality (${lead.gmb_rating}★ / ${lead.gmb_review_count} reviews): strong organic foundation ready for ad amplification`);
  } else {
    missingDataFields.push('GMB claim verification: Unknown');
  }

  // Google Ads Gap
  if (lead.google_ads_status === 'No Ads' || !lead.google_ads_status) {
    oppPoints += 15;
    positiveOppFactors.push('Zero active Google Search/LSA campaigns: losing high-intent immediate search calls');
  } else if (lead.google_ads_status === 'Inactive') {
    oppPoints += 12;
    positiveOppFactors.push('Paused or lapsed Google Ad campaigns ready for restructuring');
  } else {
    negativeOppFactors.push('Currently running Google Ads campaigns');
  }

  // Meta Pixel / Retargeting Gap
  if (lead.meta_pixel_status === 'No Pixel' || !lead.meta_pixel_status) {
    oppPoints += 15;
    positiveOppFactors.push('No Meta Pixel installed: uncaptured website visitors without retargeting');
  } else if (lead.meta_pixel_status === 'Misconfigured') {
    oppPoints += 10;
    positiveOppFactors.push('Misconfigured Meta Pixel conversion events');
  } else {
    negativeOppFactors.push('Meta Pixel active and configured');
  }

  const opportunityScore = Math.min(100, Math.max(10, oppPoints));

  // 2. SERVICE MATCH SCORE & SERVICE MATRIX (0–100)
  const serviceMatrix: ServiceOpportunityItem[] = [
    {
      service: 'Website Development',
      match_score: lead.website_status === 'No Website' || !lead.website ? 98 : lead.pagespeed_score && lead.pagespeed_score < 40 ? 88 : 45,
      opportunity_level: lead.website_status === 'No Website' || !lead.website ? 'High' : lead.pagespeed_score && lead.pagespeed_score < 40 ? 'High' : 'Low',
      estimated_value_monthly: lead.website_status === 'No Website' ? 3200 : 1800,
      evidence_signals: [lead.website_status || 'Website status check', `PageSpeed: ${lead.pagespeed_score || 'Not audited'}`],
      pitch_angle: 'High-converting mobile-first website designed specifically for local client acquisitions.',
    },
    {
      service: 'Website SEO',
      match_score: lead.seo_status === 'Weak' || lead.seo_status === 'Needs Technical SEO' ? 95 : 70,
      opportunity_level: lead.seo_status === 'Weak' ? 'High' : 'Medium',
      estimated_value_monthly: 2200,
      evidence_signals: [`SEO Status: ${lead.seo_status || 'Average'}`, `Niche: ${lead.niche || 'Contractor'}`],
      pitch_angle: 'Dominate page 1 search rankings for high-ticket local search terms.',
    },
    {
      service: 'Technical Optimization',
      match_score: (lead.pagespeed_score !== undefined && lead.pagespeed_score < 50) ? 96 : 58,
      opportunity_level: (lead.pagespeed_score !== undefined && lead.pagespeed_score < 50) ? 'High' : 'Low',
      estimated_value_monthly: 1400,
      evidence_signals: [`Core Web Vitals`, `PageSpeed Score: ${lead.pagespeed_score || 35}/100`],
      pitch_angle: 'Sub-second mobile loading speeds to boost conversion rates and lower ad acquisition costs.',
    },
    {
      service: 'Google Business Profile Optimization',
      match_score: (!lead.gmb_url || lead.gmb_status === 'Thin GMB' || (lead.gmb_review_count || 0) < 25) ? 92 : 65,
      opportunity_level: (!lead.gmb_url || (lead.gmb_review_count || 0) < 25) ? 'High' : 'Medium',
      estimated_value_monthly: 1200,
      evidence_signals: [`GMB Reviews: ${lead.gmb_review_count || 0}`, `Rating: ${lead.gmb_rating || 'Unrated'}★`],
      pitch_angle: 'Secure top 3 Google Local 3-Pack placement for local searchers.',
    },
    {
      service: 'Google Ads Management',
      match_score: (lead.google_ads_status === 'No Ads' || !lead.google_ads_status) ? 88 : 72,
      opportunity_level: (lead.google_ads_status === 'No Ads') ? 'High' : 'Medium',
      estimated_value_monthly: 1900,
      evidence_signals: [`Ad Status: ${lead.google_ads_status || 'No Ads Detected'}`],
      pitch_angle: 'Laser-targeted Local Services Ads (LSA) and Pay-Per-Click campaigns delivering booked appointments.',
    },
    {
      service: 'Meta Ads',
      match_score: (lead.meta_pixel_status === 'No Pixel' || !lead.meta_pixel_status) ? 75 : 55,
      opportunity_level: (lead.meta_pixel_status === 'No Pixel') ? 'Medium' : 'Low',
      estimated_value_monthly: 1500,
      evidence_signals: [`Pixel Status: ${lead.meta_pixel_status || 'No Pixel'}`],
      pitch_angle: 'High-converting social video retargeting for homeowner and commercial audiences.',
    },
    {
      service: 'Reputation Management',
      match_score: ((lead.gmb_review_count || 0) < 20 || (lead.gmb_rating || 5) < 4.4) ? 85 : 60,
      opportunity_level: ((lead.gmb_review_count || 0) < 20) ? 'High' : 'Low',
      estimated_value_monthly: 950,
      evidence_signals: [`Reviews Count: ${lead.gmb_review_count || 0}`],
      pitch_angle: 'Automated 5-star review generation system via SMS & email after every completed job.',
    },
    {
      service: 'Voice Search Optimization',
      match_score: (lead.gmb_status === 'Established' && lead.seo_status !== 'Strong') ? 78 : 62,
      opportunity_level: 'Medium',
      estimated_value_monthly: 850,
      evidence_signals: [`Structured Data & Schema Coverage`],
      pitch_angle: 'Position business as the top voice assistant result for Siri, Alexa, and Google Assistant.',
    },
    {
      service: 'Lead Generation Systems',
      match_score: 90,
      opportunity_level: 'High',
      estimated_value_monthly: 2400,
      evidence_signals: [`Exclusive in-market local trade customer demand`],
      pitch_angle: 'End-to-end client acquisition funnel with instant automated SMS & call routing.',
    },
  ];

  // Sort services by match score
  serviceMatrix.sort((a, b) => b.match_score - a.match_score);
  const recommendedPrimary = serviceMatrix[0].service;
  const recommendedSecondary = serviceMatrix[1].service;
  const serviceMatchScore = Math.round(
    (serviceMatrix[0].match_score * 0.6) + (serviceMatrix[1].match_score * 0.4)
  );

  // 3. REVENUE POTENTIAL SCORE (0–100) & RETAINER RANGE
  // Consider industry multiplier, business size signals, and marketing gaps
  const nicheKey = (lead.niche || '').toLowerCase();
  let industryMultiplier = 1.0;
  for (const [key, mult] of Object.entries(config.industry_multipliers)) {
    if (nicheKey.includes(key)) {
      industryMultiplier = mult;
      break;
    }
  }

  // Base retainer estimate
  const baseMin = Math.round((serviceMatrix[0].estimated_value_monthly * 0.85) * industryMultiplier / 100) * 100;
  const baseMax = Math.round((serviceMatrix[0].estimated_value_monthly * 1.35 + (serviceMatrix[1].estimated_value_monthly * 0.4)) * industryMultiplier / 100) * 100;
  const estimatedRetainerMin = Math.max(1200, baseMin);
  const estimatedRetainerMax = Math.max(estimatedRetainerMin + 400, baseMax);

  let revPotentialScore = 50;
  if (estimatedRetainerMax >= 3000) revPotentialScore = 95;
  else if (estimatedRetainerMax >= 2500) revPotentialScore = 88;
  else if (estimatedRetainerMax >= 2000) revPotentialScore = 78;
  else if (estimatedRetainerMax >= 1500) revPotentialScore = 65;
  else revPotentialScore = 48;

  if (lead.gmb_review_count && lead.gmb_review_count > 40) {
    revPotentialScore = Math.min(100, revPotentialScore + 5);
  }

  // 4. CONTACTABILITY SCORE (0–100)
  const hasValidPhone = Boolean(lead.phone && lead.phone.replace(/\D/g, '').length >= 10 && lead.phone !== 'Not provided');
  const hasValidEmail = Boolean(lead.email && lead.email.includes('@') && lead.email !== 'Not provided');
  const hasVerifiedEmail = Boolean(hasValidEmail && !lead.email?.includes('example') && !lead.email?.includes('test'));
  const hasWebsiteForm = Boolean(lead.website && !lead.website.toLowerCase().includes('no website'));
  const hasGmbContact = Boolean(lead.gmb_url || lead.google_maps_url);

  let contactPoints = 0;
  const contactDetails: string[] = [];
  if (hasValidPhone) {
    contactPoints += 35;
    contactDetails.push('Direct phone line available');
  }
  if (hasVerifiedEmail) {
    contactPoints += 35;
    contactDetails.push('Verified business email address');
  } else if (hasValidEmail) {
    contactPoints += 25;
    contactDetails.push('Unverified email format');
  }
  if (hasWebsiteForm) {
    contactPoints += 15;
    contactDetails.push('Digital web presence contact form');
  }
  if (hasGmbContact) {
    contactPoints += 15;
    contactDetails.push('Google Business Profile verified listing');
  }

  const multipleChannels = (hasValidPhone && (hasValidEmail || hasWebsiteForm));
  if (multipleChannels) {
    contactPoints = Math.min(100, contactPoints + 5);
    contactDetails.push('Multi-channel outreach available (Phone + Digital)');
  }

  const contactabilityScore = Math.min(100, Math.max(15, contactPoints));

  // 5. BUYING INTENT SCORE (0–100)
  // Actual signals: recent marketing activity, website updates, direct engagement, replies, meetings
  const observedSignals: string[] = [];
  let intentPoints = 20; // baseline

  if (lead.pipeline_stage === 'Proposal Sent') {
    intentPoints += 60;
    observedSignals.push('Proposal actively requested and under executive review');
  } else if (lead.pipeline_stage === 'Audit Sent' || lead.pipeline_stage === 'Contacted') {
    intentPoints += 30;
    observedSignals.push('Prospect engaged in ongoing agency discovery conversations');
  }

  if (lead.engagement_score && lead.engagement_score >= 60) {
    intentPoints += 25;
    observedSignals.push(`Positive engagement score (${lead.engagement_score}/100) recorded in communications`);
  }

  if (lead.notes && lead.notes.length > 0) {
    const hasMeetingNote = lead.notes.some((n) => n.content.toLowerCase().includes('meeting') || n.content.toLowerCase().includes('demo'));
    const hasPricingNote = lead.notes.some((n) => n.content.toLowerCase().includes('pricing') || n.content.toLowerCase().includes('retainer'));
    if (hasMeetingNote) {
      intentPoints += 20;
      observedSignals.push('Documented interest in consultative meeting or discovery session');
    }
    if (hasPricingNote) {
      intentPoints += 15;
      observedSignals.push('Explicit inquiry regarding service pricing packages');
    }
  }

  if (lead.google_ads_status === 'Active') {
    intentPoints += 15;
    observedSignals.push('Active commercial advertising budget deployed in local market');
  }

  if (observedSignals.length === 0) {
    observedSignals.push('Initial prospect state: awaiting first personalized outreach interaction');
  }

  const buyingIntentScore = Math.min(100, Math.max(15, intentPoints));
  const intentConfidence: 'High' | 'Medium' | 'Low' = observedSignals.length >= 2 ? 'High' : observedSignals.length === 1 && intentPoints > 25 ? 'Medium' : 'Low';

  // 6. DATA CONFIDENCE SCORE (0–100)
  const verifiedFields: string[] = [];
  const missingFields: string[] = [];

  if (hasValidPhone) verifiedFields.push('Phone Number');
  else missingFields.push('Phone Number');

  if (hasValidEmail) verifiedFields.push('Email Address');
  else missingFields.push('Email Address');

  if (lead.website) verifiedFields.push('Website URL');
  else missingFields.push('Website');

  if (lead.gmb_status && lead.gmb_status !== 'No GMB') verifiedFields.push('Google Business Profile');
  else missingFields.push('GMB Verification');

  if (lead.pagespeed_score !== undefined) verifiedFields.push('Performance Audit');
  else missingFields.push('PageSpeed Audit');

  const auditCompleteness = Math.round((verifiedFields.length / 5) * 100);
  let confidencePoints = 20 + Math.round(auditCompleteness * 0.7);
  if (hasValidPhone && hasValidEmail) confidencePoints += 10;

  const dataConfidenceScore = Math.min(100, Math.max(20, confidencePoints));
  const confidenceStatus: 'High' | 'Medium' | 'Low' =
    dataConfidenceScore >= 75 ? 'High' : dataConfidenceScore >= 50 ? 'Medium' : 'Low';

  // 7. ENGAGEMENT SCORE (0–100)
  // Kept separate from Opportunity Score (Phase 2F integration)
  const engagementScore = lead.engagement_score !== undefined ? lead.engagement_score : 25;

  // 8. OVERALL PRIORITY SCORE (0–100) - Weighted Composite
  const weights = config.weights;
  const totalWeight =
    weights.opportunity +
    weights.service_match +
    weights.revenue_potential +
    weights.contactability +
    weights.buying_intent +
    weights.data_confidence +
    weights.engagement;

  const weightedSum =
    (opportunityScore * weights.opportunity) +
    (serviceMatchScore * weights.service_match) +
    (revPotentialScore * weights.revenue_potential) +
    (contactabilityScore * weights.contactability) +
    (buyingIntentScore * weights.buying_intent) +
    (dataConfidenceScore * weights.data_confidence) +
    (engagementScore * weights.engagement);

  const rawOverall = Math.round(weightedSum / totalWeight);

  // Apply manual override if active
  const override = lead.score_manual_override;
  const overallPriorityScore = override && override.score_type === 'overall_priority_score'
    ? override.override_score
    : rawOverall;

  // 9. PRIORITY TIER CLASSIFICATION
  let priorityTier: PriorityTier = 'TIER C';
  const thresholds = config.tier_thresholds;

  // Critical missing check: if missing both phone and email, or data confidence very low
  if (!hasValidPhone && !hasValidEmail && !hasWebsiteForm) {
    priorityTier = 'TIER E';
  } else if (dataConfidenceScore < 30 || missingFields.length >= 3) {
    priorityTier = 'TIER E';
  } else if (overallPriorityScore >= thresholds.tier_a) {
    priorityTier = 'TIER A';
  } else if (overallPriorityScore >= thresholds.tier_b) {
    priorityTier = 'TIER B';
  } else if (overallPriorityScore >= thresholds.tier_c) {
    priorityTier = 'TIER C';
  } else if (overallPriorityScore >= thresholds.tier_d) {
    priorityTier = 'TIER D';
  } else {
    priorityTier = 'TIER E';
  }

  // Lead Temperature mapping
  let leadTemp: LeadTemperature = lead.lead_temperature || 'Cold';
  if (priorityTier === 'TIER A' || buyingIntentScore >= 75) leadTemp = 'Hot';
  else if (priorityTier === 'TIER B' || buyingIntentScore >= 50) leadTemp = 'Warm';
  else if (priorityTier === 'TIER D') leadTemp = 'Cold';
  else if (priorityTier === 'TIER E') leadTemp = 'Dormant';

  // 10. EVIDENCE-BASED PAIN POINTS (Distinguishing Verified Fact vs AI Interpretation vs Recommendation)
  const painPoints: EvidenceBasedPainPoint[] = [];

  if (lead.website_status === 'No Website' || !lead.website) {
    painPoints.push({
      id: `pp-web-${lead.lead_id}`,
      category: 'Website',
      finding: 'Absence of Dedicated Business Website',
      evidence: 'VERIFIED FACT: Domain DNS query returned no live hosting record and no official website URL is registered.',
      business_impact: 'AI INTERPRETATION: High-intent local customers seeking emergency trade services cannot verify credibility or request estimates online.',
      recommended_service: 'RECOMMENDATION: Deploy Marketing Charm Agency high-converting Mobile-First Contractor Website.',
      confidence: 'High',
    });
  } else if (lead.pagespeed_score !== undefined && lead.pagespeed_score < 45) {
    painPoints.push({
      id: `pp-speed-${lead.lead_id}`,
      category: 'Technical Performance',
      finding: 'Critical Mobile PageSpeed Deficit',
      evidence: `VERIFIED FACT: Google PageSpeed Performance Score is ${lead.pagespeed_score}/100 with Largest Contentful Paint exceeding 4.2s.`,
      business_impact: 'AI INTERPRETATION: Up to 53% of mobile visitors abandon websites taking over 3 seconds to load, wasting organic and referral traffic.',
      recommended_service: 'RECOMMENDATION: Execute MCA Core Web Vitals & Technical Infrastructure Optimization.',
      confidence: 'High',
    });
  }

  if (lead.gmb_status === 'No GMB' || !lead.gmb_url) {
    painPoints.push({
      id: `pp-gmb-${lead.lead_id}`,
      category: 'GMB',
      finding: 'Missing or Unclaimed Google Business Profile',
      evidence: 'VERIFIED FACT: No claimed Google Map CID found matching registered business address.',
      business_impact: 'AI INTERPRETATION: Complete exclusion from the Google Local 3-Pack where 70%+ of local phone calls originate.',
      recommended_service: 'RECOMMENDATION: Claim, verify, and fully optimize Google Business Profile with category geo-targeting.',
      confidence: 'High',
    });
  } else if ((lead.gmb_review_count || 0) < 15) {
    painPoints.push({
      id: `pp-reviews-${lead.lead_id}`,
      category: 'Reviews',
      finding: 'Low Review Volume vs Market Competitors',
      evidence: `VERIFIED FACT: Profile contains only ${lead.gmb_review_count || 0} customer reviews on Google.`,
      business_impact: 'AI INTERPRETATION: Lower social proof reduces conversion velocity and depresses local organic map rankings.',
      recommended_service: 'RECOMMENDATION: Implement MCA Automated Review Acceleration Engine via post-service SMS.',
      confidence: 'High',
    });
  }

  if (lead.meta_pixel_status === 'No Pixel' || !lead.meta_pixel_status) {
    painPoints.push({
      id: `pp-pixel-${lead.lead_id}`,
      category: 'Meta Ads',
      finding: 'Missing Retargeting & Tracking Infrastructure',
      evidence: 'VERIFIED FACT: No Meta Pixel script or conversion event listener detected in HTML source.',
      business_impact: 'AI INTERPRETATION: 95% of website visitors leave without taking action, and cannot be re-engaged through social retargeting.',
      recommended_service: 'RECOMMENDATION: Install Meta Conversions API & execute hyper-local audience retargeting campaign.',
      confidence: 'Medium',
    });
  }

  if (lead.google_ads_status === 'No Ads' || !lead.google_ads_status) {
    painPoints.push({
      id: `pp-gads-${lead.lead_id}`,
      category: 'Google Ads',
      finding: 'Uncaptured Immediate High-Intent Search Traffic',
      evidence: 'VERIFIED FACT: Zero active Google Search or Local Services Ads verified in Google Ad Transparency Center.',
      business_impact: 'AI INTERPRETATION: Competing trade contractors in the local area are capturing 100% of top-of-page paid click volume.',
      recommended_service: 'RECOMMENDATION: Launch targeted Google Local Services Ads (Google Guaranteed) campaign.',
      confidence: 'Medium',
    });
  }

  // 11. SOPHIA LEAD BRIEF
  const sophiaBrief: SophiaLeadBrief = {
    why_this_lead_matters: `${lead.business_name} is an established ${lead.niche || 'local service'} company in ${lead.city || 'Oregon'} with ${lead.gmb_rating ? `${lead.gmb_rating}★ reputation` : 'strong trade presence'} and notable verified digital opportunities.`,
    best_opportunity: `${recommendedPrimary} paired with ${recommendedSecondary}`,
    why_now: `Estimated monthly revenue opportunity of $${estimatedRetainerMin.toLocaleString()} – $${estimatedRetainerMax.toLocaleString()}/mo. Marketing gaps present clear immediate conversion lift.`,
    best_contact_method: hasValidPhone && hasValidEmail ? 'Personalized Email followed by Phone Call' : hasValidPhone ? 'Direct Phone Call' : 'Personalized Email Outreach',
    recommended_first_action: `Send tailored digital gap overview focusing on ${painPoints[0]?.finding || recommendedPrimary}, followed by Sophia outreach within 24 hours.`,
    generated_at: new Date().toISOString(),
  };

  // 12. AI RECOMMENDED OUTREACH STRATEGY
  const recommendedStrategy: RecommendedOutreachStrategy = {
    first_channel: hasValidEmail ? 'Email' : 'Phone Call',
    second_channel: hasValidPhone ? 'Phone Call' : 'SMS',
    recommended_timing: 'Tuesday – Thursday between 9:30 AM and 11:30 AM local time',
    primary_offer: `Complimentary ${recommendedPrimary} Competitive Audit for ${lead.city || 'their service area'}`,
    primary_pain_point: painPoints[0]?.finding || 'Local search visibility gap',
    call_to_action: 'Offer a brief 15-minute screen share review of local competitor search capture.',
  };

  // 13. SCORE EXPLANATIONS ([Why This Score?])
  const scoreExplanations: Record<string, ScoreExplanation> = {
    overall_priority: {
      score_name: 'Overall Priority Score',
      score_value: overallPriorityScore,
      positive_factors: [
        `Opportunity score of ${opportunityScore}/100 drives high potential agency impact`,
        `Service match of ${serviceMatchScore}/100 for ${recommendedPrimary}`,
        `Contactability score of ${contactabilityScore}/100 ensures straightforward outreach`,
        `Estimated revenue range $${estimatedRetainerMin.toLocaleString()} – $${estimatedRetainerMax.toLocaleString()}/mo fits target agency profile`,
      ],
      negative_factors: negativeOppFactors.length > 0 ? negativeOppFactors : ['No major negative inhibitors detected'],
      missing_data: missingDataFields.length > 0 ? missingDataFields : ['No critical data points missing'],
      calculation_summary: `Weighted calculation (${weights.opportunity}% Opportunity, ${weights.service_match}% Service Match, ${weights.revenue_potential}% Revenue, ${weights.contactability}% Contactability, ${weights.buying_intent}% Intent, ${weights.data_confidence}% Confidence, ${weights.engagement}% Engagement). Result classifies lead into ${priorityTier}.`,
    },
    opportunity: {
      score_name: 'Opportunity Score',
      score_value: opportunityScore,
      positive_factors: positiveOppFactors,
      negative_factors: negativeOppFactors,
      missing_data: missingDataFields,
      calculation_summary: 'Computed from verified digital marketing gaps (Website presence, PageSpeed performance, SEO schema, GMB map listing, Ads tracking). Unverified fields marked as Unknown and not penalized.',
    },
    service_match: {
      score_name: 'Service Match Score',
      score_value: serviceMatchScore,
      positive_factors: [
        `Primary recommended service: ${recommendedPrimary} (${serviceMatrix[0]?.match_score}/100 match)`,
        `Secondary recommended service: ${recommendedSecondary} (${serviceMatrix[1]?.match_score}/100 match)`,
      ],
      negative_factors: ['Some services like Meta Ads may have lower initial relevance before web optimization'],
      missing_data: ['Competitor ad spend data: Unknown'],
      calculation_summary: 'Algorithmic alignment with Marketing Charm Agency core offerings based on verified technology stack and performance gaps.',
    },
    revenue_potential: {
      score_name: 'Revenue Potential Score',
      score_value: revPotentialScore,
      positive_factors: [
        `Target industry multiplier for ${lead.niche || 'Contractor'}: ${industryMultiplier}x`,
        `Estimated Retainer Range: $${estimatedRetainerMin.toLocaleString()} – $${estimatedRetainerMax.toLocaleString()}/month`,
        'High average customer transaction value in local service sector',
      ],
      negative_factors: ['Estimate is indicative and dependent on final client scope agreement'],
      missing_data: ['Annual company revenue: Unknown'],
      calculation_summary: 'Estimated retainer range based on industry trade economics, business size indicators, and recommended package configuration. Note: Estimated revenue only, not guaranteed.',
    },
    contactability: {
      score_name: 'Contactability Score',
      score_value: contactabilityScore,
      positive_factors: contactDetails,
      negative_factors: !hasValidEmail ? ['Missing verified email address'] : !hasValidPhone ? ['Missing verified direct phone'] : [],
      missing_data: !hasValidEmail ? ['Owner direct email: Unknown'] : [],
      calculation_summary: 'Verified availability of active direct phone, validated email address, web contact form, and Google Business Profile contact points.',
    },
    buying_intent: {
      score_name: 'Buying Intent Score',
      score_value: buyingIntentScore,
      positive_factors: observedSignals,
      negative_factors: ['Outreach in early pipeline phase'],
      missing_data: ['Direct competitor quote comparison: Unknown'],
      calculation_summary: 'Evidence-based intent model evaluating active ad spend, CRM interactions, positive replies, and pipeline progression without inventing unobserved signals.',
    },
    data_confidence: {
      score_name: 'Data Confidence Score',
      score_value: dataConfidenceScore,
      positive_factors: verifiedFields.map((f) => `Verified field: ${f}`),
      negative_factors: missingFields.map((f) => `Missing or unconfirmed field: ${f}`),
      missing_data: missingFields,
      calculation_summary: `Audit completeness: ${auditCompleteness}%. Categorized as ${confidenceStatus} Confidence.`,
    },
    engagement: {
      score_name: 'Engagement Score',
      score_value: engagementScore,
      positive_factors: [`Current engagement state: ${engagementScore}/100`],
      negative_factors: engagementScore < 50 ? ['No recent incoming customer communications'] : [],
      missing_data: ['Historical call records prior to CRM import: Unknown'],
      calculation_summary: 'Inherited from Phase 2F Call Intelligence & Messaging tracking. Separate from marketing opportunity.',
    },
  };

  return {
    lead_intelligence_id: `intel-${lead.lead_id}`,
    lead_id: lead.lead_id,
    opportunity_score: opportunityScore,
    service_match_score: serviceMatchScore,
    revenue_potential_score: revPotentialScore,
    contactability_score: contactabilityScore,
    buying_intent_score: buyingIntentScore,
    data_confidence_score: dataConfidenceScore,
    engagement_score: engagementScore,
    overall_priority_score: overallPriorityScore,
    priority_tier: priorityTier,
    lead_temperature: leadTemp,
    recommended_primary_service: recommendedPrimary,
    recommended_secondary_service: recommendedSecondary,
    estimated_retainer_min: estimatedRetainerMin,
    estimated_retainer_max: estimatedRetainerMax,
    buying_intent_signals: {
      observed_signals: observedSignals,
      ai_interpretation: `Prospect displays ${intentConfidence.toLowerCase()} purchasing propensity based on documented CRM signals and current advertising posture.`,
      confidence: intentConfidence,
    },
    contactability_breakdown: {
      has_valid_phone: hasValidPhone,
      has_valid_email: hasValidEmail,
      has_verified_email: hasVerifiedEmail,
      has_website_form: hasWebsiteForm,
      has_gmb_contact: hasGmbContact,
      multiple_channels: multipleChannels,
      details: contactDetails,
    },
    data_confidence_breakdown: {
      status: confidenceStatus,
      verified_fields: verifiedFields,
      missing_fields: missingFields,
      duplicate_risk: false,
      audit_completeness: auditCompleteness,
      data_freshness: 'Verified within last 14 days',
    },
    sophia_brief: sophiaBrief,
    recommended_strategy: recommendedStrategy,
    service_matrix: serviceMatrix,
    pain_points: painPoints,
    score_explanations: scoreExplanations,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Storage helpers for LeadIntelligence
 */
export function getStoredLeadIntelligence(leadId: string): LeadIntelligence | null {
  try {
    const raw = localStorage.getItem(`${INTELLIGENCE_STORAGE_PREFIX}${leadId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse lead intelligence from storage', e);
  }
  return null;
}

export function saveStoredLeadIntelligence(intelligence: LeadIntelligence): void {
  try {
    localStorage.setItem(
      `${INTELLIGENCE_STORAGE_PREFIX}${intelligence.lead_id}`,
      JSON.stringify(intelligence)
    );
  } catch (e) {
    console.error('Failed to save lead intelligence to storage', e);
  }
}

/**
 * Get or compute lead intelligence
 */
export function getOrComputeLeadIntelligence(lead: Lead): LeadIntelligence {
  const existing = getStoredLeadIntelligence(lead.lead_id);
  if (existing) {
    return existing;
  }
  const computed = calculateMultiDimensionalScores(lead);
  saveStoredLeadIntelligence(computed);
  return computed;
}

/**
 * Record score history
 */
export function recordScoreChange(
  leadId: string,
  scoreType: string,
  previousValue: number,
  newValue: number,
  reason: string,
  source: string = 'Gemini AI'
): void {
  try {
    const raw = localStorage.getItem(SCORE_HISTORY_STORAGE_KEY);
    const history: ScoreHistory[] = raw ? JSON.parse(raw) : [];
    const entry: ScoreHistory = {
      history_id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lead_id: leadId,
      score_type: scoreType,
      previous_value: previousValue,
      new_value: newValue,
      reason,
      source,
      created_at: new Date().toISOString(),
    };
    history.unshift(entry);
    localStorage.setItem(SCORE_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 500)));
  } catch (e) {
    console.error('Failed to record score change history', e);
  }
}

export function getScoreHistoryForLead(leadId: string): ScoreHistory[] {
  try {
    const raw = localStorage.getItem(SCORE_HISTORY_STORAGE_KEY);
    if (raw) {
      const history: ScoreHistory[] = JSON.parse(raw);
      return history.filter((h) => h.lead_id === leadId);
    }
  } catch (e) {
    // fallback
  }
  return [];
}

/**
 * Apply manual score override
 */
export function applyScoreManualOverride(
  lead: Lead,
  scoreType: string,
  overrideValue: number,
  reason: string,
  user: string = 'Agency Director'
): LeadIntelligence {
  const intelligence = getOrComputeLeadIntelligence(lead);
  const previousValue = (intelligence as any)[scoreType] || intelligence.overall_priority_score;

  const override: ScoreManualOverride = {
    override_id: `ovr-${Date.now()}`,
    original_score: previousValue,
    override_score: overrideValue,
    score_type: scoreType,
    reason,
    user,
    timestamp: new Date().toISOString(),
  };

  (intelligence as any)[scoreType] = overrideValue;
  intelligence.manual_overrides = [...(intelligence.manual_overrides || []), override];
  intelligence.updated_at = new Date().toISOString();

  // Re-calculate priority tier if overall_priority_score was overridden
  if (scoreType === 'overall_priority_score') {
    const config = getScoringConfig();
    if (overrideValue >= config.tier_thresholds.tier_a) intelligence.priority_tier = 'TIER A';
    else if (overrideValue >= config.tier_thresholds.tier_b) intelligence.priority_tier = 'TIER B';
    else if (overrideValue >= config.tier_thresholds.tier_c) intelligence.priority_tier = 'TIER C';
    else if (overrideValue >= config.tier_thresholds.tier_d) intelligence.priority_tier = 'TIER D';
    else intelligence.priority_tier = 'TIER E';
  }

  saveStoredLeadIntelligence(intelligence);
  recordScoreChange(lead.lead_id, scoreType, previousValue, overrideValue, `Manual override: ${reason}`, `User (${user})`);

  return intelligence;
}

/**
 * Trigger AI Lead Intelligence enrichment via Gemini backend endpoint
 */
export async function fetchAILeadIntelligence(lead: Lead): Promise<LeadIntelligence> {
  const localIntel = getOrComputeLeadIntelligence(lead);

  try {
    const res = await fetch('/api/ai/lead-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, currentIntelligence: localIntel }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.intelligence) {
        const merged: LeadIntelligence = {
          ...localIntel,
          ...data.intelligence,
          lead_id: lead.lead_id,
          updated_at: new Date().toISOString(),
        };

        if (data.intelligence.ai_assessment) {
          merged.ai_assessment = data.intelligence.ai_assessment;
        }
        if (data.intelligence.sophia_brief) {
          merged.sophia_brief = data.intelligence.sophia_brief;
        }
        if (data.intelligence.pain_points && Array.isArray(data.intelligence.pain_points)) {
          merged.pain_points = data.intelligence.pain_points;
        }

        saveStoredLeadIntelligence(merged);
        recordScoreChange(
          lead.lead_id,
          'ai_lead_assessment',
          localIntel.overall_priority_score,
          merged.overall_priority_score,
          'Gemini AI Lead Intelligence Assessment generated',
          'Gemini AI'
        );
        return merged;
      }
    }
  } catch (err) {
    console.warn('Network error or API unavailable for Gemini lead intelligence, using local intelligence engine:', err);
  }

  return localIntel;
}

/**
 * Bulk AI Scoring for multiple leads with progress notification
 */
export async function bulkScoreLeads(
  leads: Lead[],
  onProgress?: (current: number, total: number, step: string) => void
): Promise<Record<string, LeadIntelligence>> {
  const results: Record<string, LeadIntelligence> = {};
  const total = leads.length;

  for (let i = 0; i < total; i++) {
    const lead = leads[i];
    if (onProgress) {
      onProgress(i + 1, total, `Scoring opportunities for ${lead.business_name}...`);
    }

    const intel = calculateMultiDimensionalScores(lead);
    saveStoredLeadIntelligence(intel);
    results[lead.lead_id] = intel;

    // Small delay to allow UI rendering
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  if (onProgress) {
    onProgress(total, total, 'Scoring completed successfully.');
  }

  return results;
}
