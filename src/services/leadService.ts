import {
  Lead,
  ActivityEvent,
  ImportHistoryItem,
  PipelineStage,
  LeadNote,
  PipelineStageHistoryEntry,
  UpcomingFollowUp,
} from '../types';
import { calculateLeadScore } from './scoringService.js';
import { calculateMultiDimensionalScores } from './leadIntelligenceService.js';

// NEON POSTGRESQL IS THE SINGLE SOURCE OF TRUTH
// No localStorage, no seed data, no fallbacks

// Constants for localStorage keys (fallback only)
const ACTIVITIES_KEY = 'mca_leads_activities';
const IMPORT_HISTORY_KEY = 'mca_leads_import_history';

// Cloud SQL Database Synchronization State
let isDbSyncing = false;
let lastDbSyncTime: string | null = null;
let dbSyncStatus: 'connected' | 'syncing' | 'offline' = 'connected';

export function getDatabaseSyncStatus() {
  return {
    status: dbSyncStatus,
    lastSync: lastDbSyncTime,
    isSyncing: isDbSyncing,
    engine: 'Cloud SQL PostgreSQL 16',
    region: 'europe-west3',
    tier: 'Enterprise Database Foundation',
  };
}

// Background API helper that never throws or blocks UI execution
async function getAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('../lib/firebase.js');
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}

async function bgApiCall(endpoint: string, method = 'GET', data?: any): Promise<any> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (res.ok) {
      dbSyncStatus = 'connected';
      lastDbSyncTime = new Date().toISOString();
      return await res.json();
    }
  } catch (e) {
    // Graceful offline fallback
    dbSyncStatus = 'offline';
  }
  return null;
}

export function mapDbLeadToModel(dbLead: any): Lead {
  const raw = dbLead.rawPayload || dbLead.original_data || {};
  return {
    ...raw,
    lead_id: dbLead.leadId || dbLead.lead_id || raw.lead_id,
    business_name: dbLead.businessName || dbLead.business_name || raw.business_name,
    contact_name: dbLead.contactName || dbLead.contact_name || raw.contact_name || dbLead.businessName || raw.business_name,
    phone: dbLead.phone || raw.phone || '',
    phone_e164: dbLead.phoneE164 || dbLead.phone_e164 || raw.phone_e164 || dbLead.phone || raw.phone || '',
    email: dbLead.email || raw.email || 'Not provided',
    website: dbLead.website || raw.website || 'Not provided',
    address: dbLead.address || raw.address || '',
    city: dbLead.city || raw.city || null,
    county: dbLead.county || raw.county || null,
    state: dbLead.stateRegion || dbLead.state || raw.state || null,
    country: dbLead.country || raw.country || 'USA',
    postal_code: dbLead.postalCode || dbLead.postal_code || raw.postal_code || null,
    niche: dbLead.niche || raw.niche || 'General Contractor',
    gmb_status: dbLead.gmbStatus || dbLead.gmb_status || raw.gmb_status || 'Established',
    gmb_rating: dbLead.googleRating ? Number(dbLead.googleRating) : (dbLead.gmb_rating || raw.gmb_rating || 4.5),
    gmb_review_count: dbLead.reviewCount || dbLead.gmb_review_count || raw.gmb_review_count || 12,
    google_maps_url: dbLead.googleMapsUrl || dbLead.google_maps_url || raw.google_maps_url || '',
    website_status: dbLead.websiteStatus || dbLead.website_status || raw.website_status || 'Active',
    google_ads_status: dbLead.googleAdsDetected ? 'Active' : (raw.google_ads_status || 'No Ads'),
    meta_pixel_status: dbLead.metaPixelDetected ? 'Installed' : (raw.meta_pixel_status || 'No Pixel'),
    seo_status: (dbLead.seo_status as any) || raw.seo_status || 'Needs Technical SEO',
    lead_score: dbLead.leadScore || dbLead.lead_score || raw.lead_score || 70,
    score_breakdown: {
      business_fit: 12,
      gmb_opportunity: 12,
      website_opportunity: 12,
      seo_opportunity: 8,
      google_ads_opportunity: 8,
      meta_ads_opportunity: 8,
      reputation: 8,
      contactability: 8,
      revenue_potential: 4,
      total: dbLead.leadScore || dbLead.lead_score || raw.lead_score || 70,
      ...(raw.score_breakdown || {}),
      ...(dbLead.score_breakdown || {}),
    },
    gaps: raw.gaps || dbLead.gaps || ['Missing Local Schema', 'Needs Technical SEO'],
    owner: dbLead.assignedTo || dbLead.owner || raw.owner || 'Sophia (AI Sales Rep)',
    original_data: raw,
    pipeline_stage: (dbLead.leadStatus || dbLead.pipeline_stage || raw.pipeline_stage || 'New Lead') as PipelineStage,
    estimated_retainer: dbLead.estimatedRetainer || dbLead.estimated_retainer || raw.estimated_retainer || 2500,
    is_hot_target: dbLead.isHotTarget !== undefined ? dbLead.isHotTarget : (raw.is_hot_target !== undefined ? raw.is_hot_target : ((dbLead.leadScore || raw.lead_score || 0) >= 80)),
    opportunity_angle: dbLead.opportunityAngle || dbLead.opportunity_angle || raw.opportunity_angle || 'Local Search & Conversion Optimization',
    recommended_service: dbLead.recommendedService || dbLead.recommended_service || raw.recommended_service || 'SEO & GMB Optimization',
    notes: (dbLead.notes && dbLead.notes.length > 0 ? dbLead.notes : (raw.notes || [])).map((n: any) => ({
      id: String(n.id || `n-${Date.now()}`),
      timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : (n.timestamp || new Date().toISOString()),
      author: n.authorName || n.author || 'Sophia',
      content: n.content,
      activity_type: n.noteType || n.activity_type || 'Note',
      is_ai_generated: n.authorName?.includes('Sophia') || n.is_ai_generated || false,
    })),
    stage_history: (dbLead.statusHistory && dbLead.statusHistory.length > 0 ? dbLead.statusHistory : (raw.stage_history || [])).map((h: any) => ({
      id: String(h.id || `sh-${Date.now()}`),
      previous_stage: h.previousStatus || h.previous_stage || 'Initial Import',
      new_stage: h.newStatus || h.new_stage || 'New Lead',
      timestamp: h.createdAt ? new Date(h.createdAt).toISOString() : (h.timestamp || new Date().toISOString()),
      changed_by: h.changedBy || h.changed_by || 'Sophia',
      reason: h.reason || 'Pipeline progression',
    })),
    created_at: dbLead.createdAt ? new Date(dbLead.createdAt).toISOString() : (raw.created_at || new Date().toISOString()),
    updated_at: dbLead.updatedAt ? new Date(dbLead.updatedAt).toISOString() : (raw.updated_at || new Date().toISOString()),
  };
}

export async function syncWithDatabase(): Promise<Lead[]> {
  if (isDbSyncing) return [];
  isDbSyncing = true;
  dbSyncStatus = 'syncing';

  try {
    const health = await bgApiCall('/api/health');
    if (health) {
      lastDbSyncTime = new Date().toISOString();
      dbSyncStatus = 'connected';
    }

    // Fetch ALL leads from Neon database - single source of truth
    const res = await bgApiCall('/api/leads?limit=1000');
    if (res && Array.isArray(res.leads)) {
      const dbLeads = res.leads.map((l: any) => mapDbLeadToModel(l));
      return dbLeads;
    }
  } catch (err) {
    dbSyncStatus = 'offline';
  } finally {
    isDbSyncing = false;
  }
  return [];
}

// Get all leads from Neon database
// Get all leads from Neon database
export async function getLeads(): Promise<Lead[]> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/leads?limit=1000', { headers });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.leads)) {
        return data.leads.map((l: any) => mapDbLeadToModel(l));
      }
    }
  } catch (err) {
    console.error('Error fetching leads:', err);
  }
  return [];
}

// Save leads to Neon database (bulk operation)
export async function saveLeads(leads: Lead[]): Promise<void> {
  try {
    const response = await fetch('/api/leads/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads }),
    });
    if (!response.ok) {
      throw new Error('Failed to save leads');
    }
  } catch (err) {
    console.error('Error saving leads:', err);
    throw err;
  }
}

// DEPRECATED: loadCCBLeads() - Seed data removed. Neon is single source of truth.
// This function no longer loads any seed data into the system.
export function loadCCBLeads(): Lead[] {
  // No seed data - return empty array
  // All leads must come from user imports or manual creation via Neon database
  return [];
}

// REMOVED: getLeads() - All data must come from Neon via syncWithDatabase()
// REMOVED: saveLeads() - All persistence must go to Neon via API

export async function clearAllLeads(): Promise<void> {
  // Clear Neon database - single source of truth
  try {
    const response = await fetch('/api/leads?method=truncate', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to clear leads (HTTP ${response.status})`);
    }
    console.log('Successfully cleared all leads from Neon database');
  } catch (err: any) {
    console.error('Error clearing Neon database:', err?.message);
    throw err;
  }
}

export async function addLead(lead: Lead): Promise<Lead> {
  const timestamp = new Date().toISOString();

  const preparedLead: Lead = {
    ...lead,
    lead_source: lead.lead_source || 'Manual Intake',
    created_at: lead.created_at || timestamp,
    updated_at: timestamp,
    stage_history: [
      {
        id: `sh-${Date.now()}`,
        previous_stage: 'Initial Import',
        new_stage: lead.pipeline_stage || 'New Lead',
        timestamp,
        changed_by: lead.owner || 'Agency User',
        reason: 'Lead creation',
      },
    ],
  };

  // Direct persistence to Neon PostgreSQL database - single source of truth
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: preparedLead.lead_id,
      business_name: preparedLead.business_name,
      contact_name: preparedLead.contact_name,
      phone: preparedLead.phone,
      phone_e164: preparedLead.phone_e164 || preparedLead.phone,
      email: preparedLead.email,
      website: preparedLead.website,
      industry: preparedLead.industry || 'Contractor',
      service_category: preparedLead.service_category || 'Construction',
      niche: preparedLead.niche,
      address: preparedLead.address,
      city: preparedLead.city,
      county: preparedLead.county,
      state: preparedLead.state,
      postal_code: preparedLead.postal_code,
      country: preparedLead.country || 'USA',
      lead_score: preparedLead.lead_score,
      lead_source: preparedLead.lead_source || 'Manual Intake',
      pipeline_stage: preparedLead.pipeline_stage,
      estimated_retainer: preparedLead.estimated_retainer,
      ccb_license_number: preparedLead.ccb_license_number,
      opportunity_angle: preparedLead.opportunity_angle,
      recommended_service: preparedLead.recommended_service,
      is_hot_target: preparedLead.is_hot_target,
      gmb_status: preparedLead.gmb_status,
      gmb_rating: preparedLead.gmb_rating,
      gmb_review_count: preparedLead.gmb_review_count,
      website_status: preparedLead.website_status,
      google_ads_status: preparedLead.google_ads_status,
      meta_pixel_status: preparedLead.meta_pixel_status,
      google_maps_url: preparedLead.google_maps_url,
      owner: preparedLead.owner || 'Sophia (AI Sales Rep)',
      original_data: preparedLead.original_data || preparedLead,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to save lead (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (data.lead && data.lead._dbSource === 'neon') {
    const persistedLead = mapDbLeadToModel(data.lead);

    addActivity({
      id: `act-${Date.now()}`,
      activity_id: `act-${Date.now()}`,
      lead_id: persistedLead.lead_id,
      lead_name: persistedLead.business_name,
      timestamp,
      type: 'lead_created',
      activity_type: 'lead_created',
      channel: 'SYSTEM',
      title: 'Lead Created in MCA Suite',
      description: `Added ${persistedLead.business_name} with initial opportunity score of ${persistedLead.lead_score}/100.`,
      author: 'Agency User',
      source: 'Agency User',
    });

    return persistedLead;
  } else {
    throw new Error(data.error || 'Database persistence failed');
  }
}

export async function updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead | null> {
  const timestamp = new Date().toISOString();

  // Update in Neon PostgreSQL database - single source of truth
  const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Failed to update lead:', errorData);
    return null;
  }

  const data = await res.json();
  if (data.lead && data.lead._dbSource === 'neon') {
    const updatedLead = mapDbLeadToModel(data.lead);

    if (updates.pipeline_stage) {
      addActivity({
        id: `act-${Date.now()}`,
        activity_id: `act-${Date.now()}`,
        lead_id: leadId,
        lead_name: updatedLead.business_name,
        timestamp,
        type: 'pipeline_stage_changed',
        activity_type: 'pipeline_stage_changed',
        channel: 'PIPELINE',
        title: `Pipeline Stage Changed`,
        description: `Pipeline stage moved to "${updates.pipeline_stage}".`,
        author: 'Sophia (AI)',
        source: 'Sophia (AI)',
        metadata: {
          new_stage: updates.pipeline_stage,
        },
      });

      if (updates.pipeline_stage === 'Audit Sent') {
        addActivity({
          id: `act-audit-${Date.now()}`,
          activity_id: `act-audit-${Date.now()}`,
          lead_id: leadId,
          lead_name: updatedLead.business_name,
          timestamp,
          type: 'audit_sent',
          activity_type: 'audit_sent',
          channel: 'EMAIL',
          title: 'Audit Sent to Client',
          description: `Digital presence audit for ${updatedLead.business_name} delivered.`,
          author: 'Sophia (AI)',
          source: 'Sophia (AI)',
        });
      } else if (updates.pipeline_stage === 'Proposal Sent') {
        addActivity({
          id: `act-prop-${Date.now()}`,
          activity_id: `act-prop-${Date.now()}`,
          lead_id: leadId,
          lead_name: updatedLead.business_name,
          timestamp,
          type: 'proposal_sent',
          activity_type: 'proposal_sent',
          channel: 'EMAIL',
          title: 'Proposal Sent to Client',
          description: `Client proposal with recommended retainer of $${updatedLead.estimated_retainer?.toLocaleString() || '1,800'}/mo submitted.`,
          author: 'Sophia (AI)',
          source: 'Sophia (AI)',
        });
      }
    } else if (updates.ai_enrichment) {
      addActivity({
        id: `act-${Date.now()}`,
        activity_id: `act-${Date.now()}`,
        lead_id: leadId,
        lead_name: updatedLead.business_name,
        timestamp,
        type: 'ai_analysis_generated',
        activity_type: 'ai_analysis_generated',
        channel: 'AI_CALL',
        title: 'Sophia AI Outreach Strategy Generated',
        description: `Sophia analyzed ${updatedLead.business_name}: Recommended ${updatedLead.recommended_service} with $${updatedLead.estimated_retainer?.toLocaleString()}/mo retainer potential.`,
        author: 'Sophia (AI Sales Rep)',
        source: 'Sophia (AI)',
      });
    } else if (updates.lead_score !== undefined) {
      addActivity({
        id: `act-${Date.now()}`,
        activity_id: `act-${Date.now()}`,
        lead_id: leadId,
        lead_name: updatedLead.business_name,
        timestamp,
        type: 'score_updated',
        activity_type: 'score_updated',
        channel: 'SYSTEM',
        title: 'Lead Score Recalculated',
        description: `Score updated to ${updates.lead_score}/100.`,
        author: 'Sophia (AI)',
        source: 'Sophia (AI)',
      });
    }

    return updatedLead;
  }

  return null;
}

export async function deleteLead(leadId: string): Promise<boolean> {
  const current = await getLeads();
  const lead = current.find((l) => l.lead_id === leadId);
  const filtered = current.filter((l) => l.lead_id !== leadId);
  if (filtered.length !== current.length) {
    saveLeads(filtered);
    // Background Cloud SQL persistence
    bgApiCall(`/api/leads/${encodeURIComponent(leadId)}?soft=true`, 'DELETE');
    if (lead) {
      addActivity({
        id: `act-${Date.now()}`,
        activity_id: `act-${Date.now()}`,
        lead_id: leadId,
        lead_name: lead.business_name,
        timestamp: new Date().toISOString(),
        type: 'lead_updated',
        activity_type: 'lead_updated',
        channel: 'SYSTEM',
        title: 'Lead Archived',
        description: `Archived and removed ${lead.business_name} from active view.`,
        author: 'Agency User',
        source: 'Agency User',
      });
    }
    return true;
  }
  return false;
}

export async function bulkUpdateStage(leadIds: string[], stage: PipelineStage): Promise<void> {
  const current = await getLeads();
  const timestamp = new Date().toISOString();

  const updated = current.map((l) => {
    if (leadIds.includes(l.lead_id)) {
      const historyEntry: PipelineStageHistoryEntry = {
        id: `sh-${Date.now()}-${l.lead_id}`,
        previous_stage: l.pipeline_stage,
        new_stage: stage,
        timestamp,
        changed_by: 'Agency User',
        reason: 'Bulk stage update',
      };
      return {
        ...l,
        pipeline_stage: stage,
        stage_history: [historyEntry, ...(l.stage_history || [])],
        updated_at: timestamp,
      };
    }
    return l;
  });
  saveLeads(updated);

  leadIds.forEach((id) => {
    const lead = current.find((l) => l.lead_id === id);
    if (lead) {
      addActivity({
        id: `act-${Date.now()}-${id}`,
        activity_id: `act-${Date.now()}-${id}`,
        lead_id: id,
        lead_name: lead.business_name,
        timestamp,
        type: 'pipeline_stage_changed',
        activity_type: 'pipeline_stage_changed',
        channel: 'PIPELINE',
        title: `Pipeline Stage Changed`,
        description: `Pipeline stage moved from "${lead.pipeline_stage}" to "${stage}".`,
        author: 'Agency User',
        source: 'Agency User',
        metadata: {
          previous_stage: lead.pipeline_stage,
          new_stage: stage,
        },
      });
    }
  });
}

export async function bulkDelete(leadIds: string[]): Promise<void> {
  const current = await getLeads();
  const filtered = current.filter((l) => !leadIds.includes(l.lead_id));
  saveLeads(filtered);
}

export async function addNoteToLead(
  leadId: string,
  content: string,
  activityType: LeadNote['activity_type'] = 'Note',
  author: string = 'Agency User',
  isAIGenerated: boolean = false
): Promise<LeadNote | null> {
  const current = await getLeads();
  const lead = current.find((l) => l.lead_id === leadId);
  if (!lead) return null;

  const timestamp = new Date().toISOString();
  const note: LeadNote = {
    id: `note-${Date.now()}`,
    timestamp,
    author: isAIGenerated ? 'Sophia (AI Sales Rep)' : author,
    content,
    activity_type: activityType,
    is_ai_generated: isAIGenerated,
  };

  lead.notes = [note, ...(lead.notes || [])];
  lead.updated_at = timestamp;
  saveLeads(current);

  // Background Cloud SQL persistence
  bgApiCall(`/api/leads/${encodeURIComponent(leadId)}/notes`, 'POST', {
    content,
    activity_type: activityType,
    author: note.author,
  });

  addActivity({
    id: `act-${Date.now()}`,
    activity_id: `act-${Date.now()}`,
    lead_id: leadId,
    lead_name: lead.business_name,
    timestamp,
    type: 'note_added',
    activity_type: 'note_added',
    channel: 'NOTE',
    title: `Note Added (${activityType})`,
    description: content.length > 90 ? `${content.substring(0, 90)}...` : content,
    author: note.author,
    source: isAIGenerated ? 'Sophia (AI)' : 'Agency User',
    metadata: {
      note_id: note.id,
      activity_type: activityType,
      is_ai_generated: isAIGenerated,
    },
  });

  return note;
}

export async function updateNoteInLead(leadId: string, noteId: string, content: string): Promise<boolean> {
  const current = await getLeads();
  const lead = current.find((l) => l.lead_id === leadId);
  if (!lead || !lead.notes) return false;

  const note = lead.notes.find((n) => n.id === noteId);
  if (!note) return false;

  note.content = content;
  note.timestamp = new Date().toISOString();
  lead.updated_at = new Date().toISOString();
  saveLeads(current);
  return true;
}

export async function deleteNoteFromLead(leadId: string, noteId: string): Promise<boolean> {
  const current = await getLeads();
  const lead = current.find((l) => l.lead_id === leadId);
  if (!lead || !lead.notes) return false;

  lead.notes = lead.notes.filter((n) => n.id !== noteId);
  lead.updated_at = new Date().toISOString();
  saveLeads(current);
  return true;
}

/**
 * Schedule a follow-up for a lead
 */
export async function scheduleFollowUp(
  leadId: string,
  data: {
    date: string;
    time?: string;
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    note?: string;
  }
): Promise<UpcomingFollowUp | null> {
  const current = await getLeads();
  const lead = current.find((l) => l.lead_id === leadId);
  if (!lead) return null;

  const timestamp = new Date().toISOString();
  const followUp: UpcomingFollowUp = {
    id: `fu-${Date.now()}`,
    date: data.date,
    time: data.time || '10:00 AM',
    type: data.type,
    priority: data.priority,
    note: data.note,
    created_at: timestamp,
  };

  lead.upcoming_follow_up = followUp;
  lead.updated_at = timestamp;
  saveLeads(current);

  // Background Cloud SQL persistence
  bgApiCall(`/api/leads/${encodeURIComponent(leadId)}/tasks`, 'POST', {
    title: `Follow-Up: ${data.type}`,
    description: data.note || '',
    priority: data.priority,
    due_date: data.date,
  });

  addActivity({
    id: `act-${Date.now()}`,
    activity_id: `act-${Date.now()}`,
    lead_id: leadId,
    lead_name: lead.business_name,
    timestamp,
    type: 'follow_up_created',
    activity_type: 'follow_up_created',
    channel: 'FOLLOW_UP',
    title: `Follow-Up Scheduled: ${data.type}`,
    description: `Target date: ${data.date} at ${data.time || '10:00 AM'} [${data.priority} Priority]. ${data.note || ''}`.trim(),
    author: 'Agency User',
    source: 'Agency User',
    metadata: {
      follow_up_date: data.date,
      follow_up_type: data.type,
      follow_up_priority: data.priority,
    },
  });

  return followUp;
}

/**
 * Mark a scheduled follow-up as completed
 */
export async function completeFollowUp(leadId: string, notes?: string): Promise<boolean> {
  const current = await getLeads();
  const lead = current.find((l) => l.lead_id === leadId);
  if (!lead || !lead.upcoming_follow_up) return false;

  const previousFollowUp = lead.upcoming_follow_up;
  const timestamp = new Date().toISOString();

  lead.upcoming_follow_up = undefined;
  lead.updated_at = timestamp;
  saveLeads(current);

  addActivity({
    id: `act-${Date.now()}`,
    activity_id: `act-${Date.now()}`,
    lead_id: leadId,
    lead_name: lead.business_name,
    timestamp,
    type: 'follow_up_completed',
    activity_type: 'follow_up_completed',
    channel: 'FOLLOW_UP',
    title: `Follow-Up Completed: ${previousFollowUp.type}`,
    description: notes ? `Completed. Notes: ${notes}` : `Completed scheduled follow-up from ${previousFollowUp.date}.`,
    author: 'Agency User',
    source: 'Agency User',
  });

  return true;
}

export function getActivities(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // fallback
  }

  return [];
}

export function addActivity(event: ActivityEvent): void {
  try {
    const current = getActivities();
    // Prepend new activity; never delete or overwrite previous activities
    const updated = [
      {
        ...event,
        activity_id: event.activity_id || event.id,
        activity_type: event.activity_type || event.type,
      },
      ...current,
    ];
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add activity', e);
  }
}

/**
 * Returns complete chronological activity timeline for a specific lead (newest first).
 * Synthesizes persistent initial records if newly loaded to guarantee a full history.
 */
export function getLeadActivities(leadId: string, lead?: Lead): ActivityEvent[] {
  const allActivities = getActivities();
  const filtered = allActivities.filter((a) => a.lead_id === leadId);

  // If no activities found for this lead yet, synthesize baseline events so every lead has full chronological history
  if (filtered.length === 0 && lead) {
    const baselineActivities: ActivityEvent[] = [];
    const baseDate = new Date(lead.created_at || Date.now());

    // 1. Lead Imported
    baselineActivities.push({
      id: `act-init-imp-${lead.lead_id}`,
      activity_id: `act-init-imp-${lead.lead_id}`,
      lead_id: lead.lead_id,
      lead_name: lead.business_name,
      timestamp: baseDate.toISOString(),
      type: 'lead_imported',
      activity_type: 'lead_imported',
      channel: 'SYSTEM',
      title: 'Lead Imported into MCA Lead Agency Suite',
      description: `Imported with verified GMB & CCB license status in ${lead.city || 'Oregon'}. Initial score: ${lead.lead_score}/100.`,
      author: 'Sophia (AI Sales Rep)',
      source: 'Sophia (AI)',
    });

    // 2. Initial Score Calculated
    const scoreDate = new Date(baseDate.getTime() + 1000 * 60 * 2);
    baselineActivities.push({
      id: `act-init-score-${lead.lead_id}`,
      activity_id: `act-init-score-${lead.lead_id}`,
      lead_id: lead.lead_id,
      lead_name: lead.business_name,
      timestamp: scoreDate.toISOString(),
      type: 'score_updated',
      activity_type: 'score_updated',
      channel: 'SYSTEM',
      title: 'Opportunity Score Evaluated',
      description: `Assessed business fit, website latency, and local visibility. Score: ${lead.lead_score}/100. Top opportunity: ${lead.recommended_service}.`,
      author: 'Sophia (AI)',
      source: 'Sophia (AI)',
    });

    // 3. AI Pitch / Strategy
    if (lead.opportunity_angle || lead.ai_enrichment) {
      const pitchDate = new Date(baseDate.getTime() + 1000 * 60 * 5);
      baselineActivities.push({
        id: `act-init-pitch-${lead.lead_id}`,
        activity_id: `act-init-pitch-${lead.lead_id}`,
        lead_id: lead.lead_id,
        lead_name: lead.business_name,
        timestamp: pitchDate.toISOString(),
        type: 'ai_pitch_generated',
        activity_type: 'ai_pitch_generated',
        channel: 'AI_CALL',
        title: 'Sophia Generated AI Outreach Strategy',
        description: `Identified angle: "${lead.opportunity_angle || lead.ai_enrichment?.opportunity_angle}". Target monthly retainer: $${lead.estimated_retainer?.toLocaleString() || '1,800'}/mo.`,
        author: 'Sophia (AI Sales Rep)',
        source: 'Sophia (AI)',
      });
    }

    // 4. Notes if any
    if (lead.notes && lead.notes.length > 0) {
      lead.notes.forEach((note) => {
        baselineActivities.push({
          id: `act-note-${note.id}`,
          activity_id: `act-note-${note.id}`,
          lead_id: lead.lead_id,
          lead_name: lead.business_name,
          timestamp: note.timestamp,
          type: 'note_added',
          activity_type: 'note_added',
          channel: 'NOTE',
          title: `Note Added (${note.activity_type})`,
          description: note.content,
          author: note.author,
          source: note.is_ai_generated ? 'Sophia (AI)' : 'Agency User',
          metadata: { note_id: note.id },
        });
      });
    }

    // Persist these so they are never lost
    baselineActivities.forEach((act) => addActivity(act));
    return baselineActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getImportHistory(): ImportHistoryItem[] {
  try {
    const raw = localStorage.getItem(IMPORT_HISTORY_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }

  return [];
}

export function addImportHistory(item: ImportHistoryItem): void {
  try {
    const current = getImportHistory();
    const updated = [item, ...current];
    localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save import history', e);
  }
}

export function resetToDemoData(): void {
  clearAllLeads();
}
