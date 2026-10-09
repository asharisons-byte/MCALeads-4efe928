import type { Lead } from '../types';

/**
 * Verified research facts sent to Sophia (voice agent). Sophia may ONLY make claims that map to
 * these fields; with `verified: false` she uses a generic, claim-free observation instead.
 * `verified` is true only when the CRM actually holds a GMB/website status for the lead
 * (i.e. an enrichment/import step produced it) — never because an LLM guessed it.
 */
export interface CallResearch {
  verified: boolean;
  website?: string;
  websiteStatus?: string;
  gmbStatus?: string;
  gmbReviewCount?: number;
  gmbRating?: number;
  seoStatus?: string;
  source: 'crm_lead_record';
}

export function buildCallResearch(lead: Lead): CallResearch {
  const gmbStatus = lead.gmb_status || undefined;
  const websiteStatus = lead.website_status || undefined;
  return {
    verified: Boolean(gmbStatus || websiteStatus),
    website: lead.website || '',
    websiteStatus,
    gmbStatus,
    gmbReviewCount: typeof lead.gmb_review_count === 'number' ? lead.gmb_review_count : undefined,
    gmbRating: typeof lead.gmb_rating === 'number' ? lead.gmb_rating : undefined,
    seoStatus: (lead as any).seo_status || undefined,
    source: 'crm_lead_record',
  };
}
