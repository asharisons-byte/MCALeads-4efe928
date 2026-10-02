import { Lead } from '../types';

export const logGmbStatus = (lead: Lead) => {
  console.log(`[GMB Diagnostic] Lead: ${lead.business_name}`, {
    gmb_name: lead.business_name, // Assuming business_name acts as gmb_name based on context
    google_maps_url: lead.google_maps_url,
    gmb_status: lead.gmb_status,
    // Note: place_id does not seem to be a top-level field in the Lead interface
    // It might be nested in original_data
    place_id: lead.original_data?.place_id || 'Not found in original_data',
    raw_data_snapshot: {
      gmb_status_raw: lead.gmb_status,
    }
  });
};
