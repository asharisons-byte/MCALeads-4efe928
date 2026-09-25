import { AgencyConfig } from '../types';

export const DEFAULT_AGENCY_CONFIG: AgencyConfig = {
  agency_name: 'Marketing Charm Agency',
  sender_name: 'Sophia',
  product_name: 'MCA Lead Agency Suite',
  contact_email: 'sophia@marketingcharmagency.com',
  contact_phone: '+1 (503) 893-2481',
  website: 'https://marketingcharmagency.com',
  app_title: 'MCA Lead Agency Suite',
  ai_representative_name: 'Sophia',
  ai_representative_role: 'Lead AI Sales Rep & Executive Assistant',
  scoring_weights: {
    business_fit: 15,
    gmb_opportunity: 15,
    website_opportunity: 15,
    contactability: 10,
    seo_opportunity: 10,
    google_ads_opportunity: 10,
    meta_ads_opportunity: 10,
    reputation: 10,
    revenue_potential: 5,
  },
  round_robin_enabled: false,
};

export function getAgencyConfig(): AgencyConfig {
  try {
    const saved = localStorage.getItem('mca_agency_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_AGENCY_CONFIG,
        ...parsed,
        scoring_weights: {
          ...DEFAULT_AGENCY_CONFIG.scoring_weights!,
          ...(parsed?.scoring_weights || {}),
        },
      };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_AGENCY_CONFIG;
}

export function saveAgencyConfig(config: Partial<AgencyConfig>): AgencyConfig {
  const current = getAgencyConfig();
  const updated: AgencyConfig = {
    ...current,
    ...config,
    scoring_weights: {
      ...(current.scoring_weights || DEFAULT_AGENCY_CONFIG.scoring_weights!),
      ...(config.scoring_weights || {}),
    },
  };
  try {
    localStorage.setItem('mca_agency_config', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save agency config', e);
  }
  return updated;
}
