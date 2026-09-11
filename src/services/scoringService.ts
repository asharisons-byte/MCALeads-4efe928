import { Lead, ScoreBreakdown, ScoreWeights } from '../types';

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  business_fit: 15,
  gmb_opportunity: 15,
  website_opportunity: 15,
  seo_opportunity: 10,
  google_ads_opportunity: 10,
  meta_ads_opportunity: 10,
  reputation: 10,
  contactability: 10,
  revenue_potential: 5,
};

export function getScoreWeights(): ScoreWeights {
  try {
    const saved = localStorage.getItem('mca_score_weights');
    if (saved) {
      return { ...DEFAULT_SCORE_WEIGHTS, ...JSON.parse(saved) };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SCORE_WEIGHTS;
}

export function saveScoreWeights(weights: ScoreWeights): void {
  try {
    localStorage.setItem('mca_score_weights', JSON.stringify(weights));
  } catch (e) {
    console.error('Failed to save score weights', e);
  }
}

/**
 * Deterministically calculate explainable 0–100 lead score based on actual available data
 */
export function calculateLeadScore(
  lead: Partial<Lead>,
  weights: ScoreWeights = getScoreWeights()
): { score: number; breakdown: ScoreBreakdown; isHot: boolean } {
  const safeWeights: ScoreWeights = {
    ...DEFAULT_SCORE_WEIGHTS,
    ...(weights || {}),
  };

  // 1. Business Fit (Max 15)
  // High-ticket local service niches (Plumbers, Electricians, HVAC, Roofing, Dental, Legal) = high fit
  let businessFit = 0;
  const niche = (lead?.niche || '').toLowerCase();
  const highTicketNiches = ['plumb', 'electric', 'hvac', 'roof', 'drain', 'contractor', 'dent', 'law', 'legal', 'auto repair'];
  if (highTicketNiches.some((n) => niche.includes(n))) {
    businessFit = safeWeights.business_fit;
  } else if (niche) {
    businessFit = Math.round(safeWeights.business_fit * 0.8);
  } else {
    businessFit = Math.round(safeWeights.business_fit * 0.5);
  }

  // 2. GMB Opportunity (Max 15)
  // Thin GMB, missing GMB, or low reviews = huge opportunity to sell GBP/reputation services
  // Established GMB with high rating but other gaps still indicates a paying business
  let gmbOpp = 0;
  if (lead?.gmb_status === 'No GMB' || !lead?.gmb_url) {
    gmbOpp = safeWeights.gmb_opportunity; // Maximum gap to sell GBP setup
  } else if (lead?.gmb_status === 'Thin GMB' || (lead?.gmb_review_count !== undefined && lead.gmb_review_count < 10)) {
    gmbOpp = Math.round(safeWeights.gmb_opportunity * 0.93); // Review booster opportunity
  } else if (lead?.gmb_rating && lead.gmb_rating >= 4.5 && (lead?.gmb_review_count || 0) > 50) {
    // High reputation business means high ability to pay, strong brand readiness
    gmbOpp = Math.round(safeWeights.gmb_opportunity * 0.93);
  } else {
    gmbOpp = Math.round(safeWeights.gmb_opportunity * 0.7);
  }

  // 3. Website Opportunity (Max 15)
  // No website or Slow / low pagespeed = prime candidate for web dev / redesign
  let webOpp = 0;
  if (lead?.website_status === 'No Website' || !lead?.website || lead.website.toLowerCase().includes('no website')) {
    webOpp = safeWeights.website_opportunity;
  } else if (lead?.website_status === 'Slow / Unreachable Server' || (lead?.pagespeed_score !== undefined && lead.pagespeed_score < 40)) {
    webOpp = safeWeights.website_opportunity;
  } else if (lead?.pagespeed_score !== undefined && lead.pagespeed_score < 75) {
    webOpp = Math.round(safeWeights.website_opportunity * 0.75);
  } else {
    webOpp = Math.round(safeWeights.website_opportunity * 0.4);
  }

  // 4. SEO Opportunity (Max 10)
  let seoOpp = 0;
  if (lead?.seo_status === 'Weak' || lead?.seo_status === 'Needs Technical SEO') {
    seoOpp = safeWeights.seo_opportunity;
  } else if (lead?.website_status === 'Slow / Unreachable Server') {
    seoOpp = Math.round(safeWeights.seo_opportunity * 0.9);
  } else if (lead?.seo_status === 'Average') {
    seoOpp = Math.round(safeWeights.seo_opportunity * 0.7);
  } else {
    seoOpp = Math.round(safeWeights.seo_opportunity * 0.5);
  }

  // 5. Google Ads Opportunity (Max 10)
  // If not running Google Ads, agency can pitch local service ads & search campaigns
  let googleAdsOpp = 0;
  if (lead?.google_ads_status === 'No Ads' || !lead?.google_ads_status) {
    googleAdsOpp = safeWeights.google_ads_opportunity;
  } else if (lead?.google_ads_status === 'Inactive') {
    googleAdsOpp = Math.round(safeWeights.google_ads_opportunity * 0.8);
  } else {
    googleAdsOpp = Math.round(safeWeights.google_ads_opportunity * 0.3); // optimization opportunity
  }

  // 6. Meta Ads Opportunity (Max 10)
  let metaAdsOpp = 0;
  if (lead?.meta_pixel_status === 'No Pixel' || !lead?.meta_pixel_status) {
    metaAdsOpp = safeWeights.meta_ads_opportunity;
  } else if (lead?.meta_pixel_status === 'Misconfigured') {
    metaAdsOpp = Math.round(safeWeights.meta_ads_opportunity * 0.8);
  } else {
    metaAdsOpp = Math.round(safeWeights.meta_ads_opportunity * 0.3);
  }

  // 7. Reputation (Max 10)
  // Business with strong reviews converts better, or thin reviews need booster
  let reputation = 0;
  if (lead?.gmb_rating && lead.gmb_rating >= 4.7 && (lead?.gmb_review_count || 0) >= 20) {
    reputation = Math.round(safeWeights.reputation * 0.9);
  } else if (lead?.gmb_rating && lead.gmb_rating >= 4.0) {
    reputation = Math.round(safeWeights.reputation * 0.8);
  } else {
    reputation = Math.round(safeWeights.reputation * 0.6);
  }

  // 8. Contactability (Max 10)
  let contactability = 0;
  const hasPhone = !!lead?.phone && lead.phone !== 'Not provided';
  const hasEmail = !!lead?.email && lead.email !== 'Not provided';
  if (hasPhone && hasEmail) {
    contactability = safeWeights.contactability;
  } else if (hasPhone || hasEmail) {
    contactability = Math.round(safeWeights.contactability * 0.7);
  } else {
    contactability = Math.round(safeWeights.contactability * 0.2);
  }

  // 9. Revenue Potential (Max 5)
  let revPot = 0;
  if ((lead?.estimated_retainer || 0) >= 2400) {
    revPot = safeWeights.revenue_potential;
  } else if ((lead?.estimated_retainer || 0) >= 1800) {
    revPot = Math.round(safeWeights.revenue_potential * 0.6);
  } else {
    revPot = 0;
  }

  const breakdown: ScoreBreakdown = {
    business_fit: Math.min(safeWeights.business_fit, businessFit),
    gmb_opportunity: Math.min(safeWeights.gmb_opportunity, gmbOpp),
    website_opportunity: Math.min(safeWeights.website_opportunity, webOpp),
    seo_opportunity: Math.min(safeWeights.seo_opportunity, seoOpp),
    google_ads_opportunity: Math.min(safeWeights.google_ads_opportunity, googleAdsOpp),
    meta_ads_opportunity: Math.min(safeWeights.meta_ads_opportunity, metaAdsOpp),
    reputation: Math.min(safeWeights.reputation, reputation),
    contactability: Math.min(safeWeights.contactability, contactability),
    revenue_potential: Math.min(safeWeights.revenue_potential, revPot),
    total: 0,
  };

  const total = Object.entries(breakdown).reduce((acc, [key, val]) => {
    if (key === 'total') return acc;
    return acc + (typeof val === 'number' ? val : 0);
  }, 0);

  breakdown.total = Math.min(100, Math.max(0, total));

  // Hot Target criteria:
  // Lead score >= 85, at least one clear contact method, and multiple marketing gaps
  const gapCount = (lead.gaps || []).length;
  const isHot = breakdown.total >= 85 && (hasPhone || hasEmail) && (gapCount >= 2 || (lead.estimated_retainer || 0) >= 1800);

  return {
    score: breakdown.total,
    breakdown,
    isHot,
  };
}
