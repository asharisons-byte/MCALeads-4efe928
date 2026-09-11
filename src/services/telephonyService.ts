import {
  CallRecord,
  CallState,
  CallOutcome,
  CallType,
  CallQueueItem,
  CallScript,
  SophiaTalkingPoints,
  Lead,
  PipelineStage,
  MediaStatus,
} from '../types';
import { addActivity } from './leadService';
import { saveCommunication } from './communicationService';
import { recordOptOut } from './messagingService';

const CALLS_STORAGE_KEY = 'mca_call_records_v1';
const CALL_QUEUE_STORAGE_KEY = 'mca_call_queue_v1';

/**
 * Format duration in seconds to MM:SS string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clean & format phone numbers for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Retrieve all persistent call records from localStorage
 */
export function getStoredCallRecords(): CallRecord[] {
  try {
    const raw = localStorage.getItem(CALLS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read call records from storage:', e);
    return [];
  }
}

/**
 * Save a single call record to localStorage
 */
export function saveCallRecord(record: CallRecord): void {
  try {
    const all = getStoredCallRecords();
    const existingIndex = all.findIndex((c) => c.call_id === record.call_id);
    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...record };
    } else {
      all.unshift(record);
    }
    localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to persist call record:', e);
  }
}

/**
 * Client-Side TelephonyService Abstraction Layer
 * Interfaces securely with backend telephony routes.
 */
export const TelephonyService = {
  /**
   * Initiate an outbound call
   */
  async startCall(params: {
    lead?: Lead | null;
    phoneNumber: string;
    callType?: CallType;
  }): Promise<{ success: boolean; session: any; callRecord: CallRecord }> {
    const { lead, phoneNumber, callType = 'Outbound Call' } = params;

    let backendSession: any = null;
    try {
      const res = await fetch('/api/telephony/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.lead_id,
          businessName: lead?.business_name || 'Prospect Contact',
          contactName: lead?.contact_name,
          phoneNumber,
          callType,
          leadScore: lead?.lead_score,
          opportunity: lead?.opportunity_angle || lead?.recommended_service,
          estimatedRetainer: lead?.estimated_retainer,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        backendSession = data.session;
      }
    } catch (err) {
      console.warn('Backend call start request failed, maintaining client session:', err);
    }

    const callId = backendSession?.callId || `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const callRecord: CallRecord = {
      call_id: callId,
      lead_id: lead?.lead_id,
      business_name: lead?.business_name || 'Manual Dial',
      contact_name: lead?.contact_name,
      phone_number: phoneNumber,
      direction: 'OUTBOUND',
      call_type: callType,
      status: 'PREPARING',
      duration: 0,
      started_at: now,
      created_at: now,
      provider_call_id: backendSession?.providerCallId || `prov_${Date.now()}`,
      recording_status: 'Not Available',
      transcript_status: 'Not Available',
      lead_score: lead?.lead_score,
      pipeline_stage: lead?.pipeline_stage,
      opportunity: lead?.opportunity_angle || lead?.recommended_service,
      estimated_retainer: lead?.estimated_retainer,
    };

    saveCallRecord(callRecord);

    // If attached to a lead, log call started in activity timeline
    if (lead?.lead_id) {
      addActivity({
        id: `act-${Date.now()}`,
        activity_id: `act-${Date.now()}`,
        lead_id: lead.lead_id,
        lead_name: lead.business_name,
        timestamp: now,
        type: 'call_started',
        activity_type: 'call_started',
        channel: 'CALL',
        title: `Outbound Call Initiated`,
        description: `Calling ${formatPhoneNumber(phoneNumber)} through secure telephony service.`,
        author: 'Alex (Agency Rep)',
        source: 'Professional CRM Dialer',
        metadata: {
          call_id: callId,
          phone_number: phoneNumber,
          call_type: callType,
        },
      });
    }

    return {
      success: true,
      session: backendSession || { callId, status: 'PREPARING' },
      callRecord,
    };
  },

  /**
   * Poll or fetch current status of a call
   */
  async getCallStatus(callId: string): Promise<{ status: CallState; duration?: number }> {
    try {
      const res = await fetch(`/api/telephony/calls/${callId}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          return {
            status: data.session.status as CallState,
            duration: data.session.duration,
          };
        }
      }
    } catch (e) {
      // ignore
    }

    const local = getStoredCallRecords().find((c) => c.call_id === callId);
    return { status: local?.status || 'CONNECTED', duration: local?.duration };
  },

  /**
   * Terminate an active call
   */
  async endCall(
    callId: string,
    params?: { duration?: number; outcome?: CallOutcome; notes?: string }
  ): Promise<{ success: boolean; callRecord: CallRecord }> {
    try {
      await fetch(`/api/telephony/calls/${callId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      });
    } catch (e) {
      console.warn('Backend end call error:', e);
    }

    const all = getStoredCallRecords();
    const existing = all.find((c) => c.call_id === callId);
    const updated: CallRecord = {
      ...(existing || {
        call_id: callId,
        phone_number: '',
        direction: 'OUTBOUND',
        call_type: 'Outbound Call',
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }),
      status: 'COMPLETED',
      duration: params?.duration !== undefined ? params.duration : existing?.duration || 0,
      outcome: params?.outcome || existing?.outcome,
      notes: params?.notes !== undefined ? params.notes : existing?.notes,
      ended_at: new Date().toISOString(),
    };

    saveCallRecord(updated);

    return { success: true, callRecord: updated };
  },

  /**
   * Toggle mute on an active call
   */
  async muteCall(callId: string, muted: boolean): Promise<boolean> {
    try {
      await fetch(`/api/telephony/calls/${callId}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ muted }),
      });
    } catch (e) {
      // ignore
    }
    const all = getStoredCallRecords();
    const existing = all.find((c) => c.call_id === callId);
    if (existing) {
      existing.is_muted = muted;
      saveCallRecord(existing);
    }
    return true;
  },

  /**
   * Toggle hold on an active call
   */
  async holdCall(callId: string, onHold: boolean): Promise<boolean> {
    try {
      await fetch(`/api/telephony/calls/${callId}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onHold }),
      });
    } catch (e) {
      // ignore
    }
    const all = getStoredCallRecords();
    const existing = all.find((c) => c.call_id === callId);
    if (existing) {
      existing.is_on_hold = onHold;
      existing.status = onHold ? 'ON_HOLD' : 'CONNECTED';
      saveCallRecord(existing);
    }
    return true;
  },

  /**
   * Save live notes during or after a call
   */
  async saveCallNotes(callId: string, notes: string): Promise<boolean> {
    try {
      fetch(`/api/telephony/calls/${callId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch (e) {
      // ignore
    }
    const all = getStoredCallRecords();
    const existing = all.find((c) => c.call_id === callId);
    if (existing) {
      existing.notes = notes;
      saveCallRecord(existing);
    }
    return true;
  },

  /**
   * Complete call with Outcome and persist in CRM Timeline + Communications
   * Enforces Conservative Pipeline Automation:
   * If Current Stage = New Lead AND Call was Connected -> New Lead -> Contacted.
   */
  async setCallOutcome(params: {
    callRecord: CallRecord;
    outcome: CallOutcome;
    notes?: string;
    duration?: number;
    lead?: Lead | null;
    onLeadUpdate?: (leadId: string, updates: Partial<Lead>) => void;
  }): Promise<CallRecord> {
    const { callRecord, outcome, notes, duration, lead, onLeadUpdate } = params;
    const finalDuration = duration !== undefined ? duration : callRecord.duration;

    const updatedRecord: CallRecord = {
      ...callRecord,
      outcome,
      notes: notes !== undefined ? notes : callRecord.notes,
      duration: finalDuration,
      status: 'COMPLETED',
      ended_at: new Date().toISOString(),
    };

    saveCallRecord(updatedRecord);

    // Synchronize to backend
    try {
      fetch(`/api/telephony/calls/${callRecord.call_id}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, notes }),
      });
    } catch (e) {
      // ignore
    }

    // Save to CRM Communications entity
    if (lead?.lead_id) {
      saveCommunication({
        lead_id: lead.lead_id,
        channel: 'CALL',
        direction: 'OUTBOUND',
        status: 'COMPLETED',
        subject: `Outbound Call (${outcome})`,
        content: notes || `Call completed with outcome: ${outcome}. Duration: ${formatDuration(finalDuration)}`,
        provider_id: callRecord.provider_call_id,
        metadata: {
          call_id: callRecord.call_id,
          duration_seconds: finalDuration,
          outcome,
          phone_number: callRecord.phone_number,
        },
      });

      // Save to Activity Timeline
      addActivity({
        id: `act-${Date.now()}`,
        activity_id: `act-${Date.now()}`,
        lead_id: lead.lead_id,
        lead_name: lead.business_name,
        timestamp: new Date().toISOString(),
        type: 'call_completed',
        activity_type: 'call_completed',
        channel: 'CALL',
        title: `Call Completed: ${outcome} (${formatDuration(finalDuration)})`,
        description: notes || `Outbound phone conversation completed with outcome: ${outcome}.`,
        author: 'Alex (Agency Rep)',
        source: 'Professional CRM Dialer',
        metadata: {
          call_id: callRecord.call_id,
          duration_seconds: finalDuration,
          call_outcome: outcome,
          phone_number: callRecord.phone_number,
        },
      });

      // If user took live notes, also record call_note_added
      if (notes && notes.trim()) {
        addActivity({
          id: `act-${Date.now() + 1}`,
          activity_id: `act-${Date.now() + 1}`,
          lead_id: lead.lead_id,
          lead_name: lead.business_name,
          timestamp: new Date().toISOString(),
          type: 'call_note_added',
          activity_type: 'call_note_added',
          channel: 'NOTE',
          title: `Call Notes Added`,
          description: notes,
          author: 'Alex (Agency Rep)',
          source: 'Professional CRM Dialer',
          metadata: {
            call_id: callRecord.call_id,
          },
        });
      }

      // Conservative Pipeline Automation:
      // If Current Stage = New Lead AND Call was successfully connected -> New Lead -> Contacted.
      // Unanswered, No Answer, Busy, Failed, Wrong Number DO NOT change stage.
      const isConnectedOutcome =
        outcome === 'Interested' ||
        outcome === 'Not Interested' ||
        outcome === 'Follow Up' ||
        outcome === 'Send Information' ||
        outcome === 'Send Audit' ||
        outcome === 'Meeting Requested' ||
        outcome === 'Proposal Requested';

      const isNewLead =
        lead.pipeline_stage === 'New Lead' ||
        (lead.pipeline_stage as string)?.toLowerCase() === 'new lead' ||
        (lead.pipeline_stage as string)?.toLowerCase() === 'new_lead';

      if (isNewLead && isConnectedOutcome && onLeadUpdate) {
        onLeadUpdate(lead.lead_id, {
          pipeline_stage: 'Contacted',
        });

        addActivity({
          id: `act-${Date.now() + 2}`,
          activity_id: `act-${Date.now() + 2}`,
          lead_id: lead.lead_id,
          lead_name: lead.business_name,
          timestamp: new Date().toISOString(),
          type: 'pipeline_stage_changed',
          activity_type: 'pipeline_stage_changed',
          channel: 'PIPELINE',
          title: 'Stage Changed to Contacted',
          description: `Automatically advanced from New Lead to Contacted following a successful phone connection.`,
          author: 'CRM Automation',
          source: 'Telephony Automation',
          metadata: {
            previous_stage: 'New Lead',
            new_stage: 'Contacted',
            reason: `Call connected with outcome: ${outcome}`,
          },
        });
      }

      // If Do Not Contact is selected
      if (outcome === 'Do Not Contact') {
        recordOptOut(
          lead.lead_id,
          callRecord.phone_number,
          'Lead requested Do Not Contact during CRM call',
          'Lead requested Do Not Contact during CRM call'
        );
        if (onLeadUpdate) {
          onLeadUpdate(lead.lead_id, {
            status: 'Do Not Contact',
            do_not_contact: true,
            sms_opt_out: true,
            sms_eligibility: 'OPTED_OUT',
          });
        }
        addActivity({
          id: `act-${Date.now() + 3}`,
          activity_id: `act-${Date.now() + 3}`,
          lead_id: lead.lead_id,
          lead_name: lead.business_name,
          timestamp: new Date().toISOString(),
          type: 'contact_do_not_contact',
          activity_type: 'contact_do_not_contact',
          channel: 'SYSTEM',
          title: 'Contact Marked Do Not Contact',
          description: `Phone ${formatPhoneNumber(callRecord.phone_number)} placed on strict suppression registry. All future automated outreach blocked.`,
          author: 'Alex (Agency Rep)',
          source: 'Professional CRM Dialer',
        });
      }
    }

    return updatedRecord;
  },

  /**
   * Retrieve call history (optionally filtered by lead)
   */
  getCallHistory(leadId?: string): CallRecord[] {
    const all = getStoredCallRecords();
    if (leadId) {
      return all.filter((c) => c.lead_id === leadId);
    }
    return all;
  },

  /**
   * Check recording availability
   */
  getRecording(callId: string): { status: MediaStatus; url?: string } {
    const record = getStoredCallRecords().find((c) => c.call_id === callId);
    return {
      status: record?.recording_status || 'Not Available',
      url: record?.recording_url,
    };
  },

  /**
   * Check transcript availability
   */
  getTranscript(callId: string): { status: MediaStatus; transcript?: string } {
    const record = getStoredCallRecords().find((c) => c.call_id === callId);
    return {
      status: record?.transcript_status || 'Not Available',
      transcript: record?.transcript,
    };
  },

  /**
   * Call Queue Management
   */
  getCallQueue(): CallQueueItem[] {
    try {
      const raw = localStorage.getItem(CALL_QUEUE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  addToCallQueue(lead: Lead): CallQueueItem {
    const queue = this.getCallQueue();
    const existing = queue.find((q) => q.lead_id === lead.lead_id);
    if (existing) return existing;

    const newItem: CallQueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lead_id: lead.lead_id,
      business_name: lead.business_name,
      contact_name: lead.contact_name,
      phone_number: lead.phone || '',
      lead_score: lead.lead_score || 75,
      priority: (lead.lead_score && lead.lead_score >= 85) || lead.is_hot_target ? 'High' : 'Medium',
      recommended_service: lead.recommended_service || lead.opportunity_angle,
      opportunity: lead.opportunity_angle,
      added_at: new Date().toISOString(),
      status: 'pending',
    };

    queue.push(newItem);
    localStorage.setItem(CALL_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return newItem;
  },

  removeFromCallQueue(itemId: string): void {
    const queue = this.getCallQueue().filter((q) => q.id !== itemId && q.lead_id !== itemId);
    localStorage.setItem(CALL_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  },

  reorderCallQueue(items: CallQueueItem[]): void {
    localStorage.setItem(CALL_QUEUE_STORAGE_KEY, JSON.stringify(items));
  },

  skipCallQueueItem(itemId: string): void {
    const queue = this.getCallQueue();
    const item = queue.find((q) => q.id === itemId);
    if (item) {
      item.status = 'skipped';
      localStorage.setItem(CALL_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  },

  clearCallQueue(): void {
    localStorage.removeItem(CALL_QUEUE_STORAGE_KEY);
  },

  /**
   * Generate tailored 6-part call script using backend AI
   */
  async generateCallScript(lead: Lead): Promise<CallScript> {
    try {
      const res = await fetch('/api/telephony/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.script) return data.script;
      }
    } catch (e) {
      console.warn('Backend call script generate failed, using local fallback:', e);
    }

    // Default fallback script
    const niche = lead.niche || 'contractor';
    const city = lead.city || 'Oregon';
    const bName = lead.business_name;

    return {
      opening: `Hi there, this is Alex with Marketing Charm Agency here in Oregon. I was reviewing top ${niche} providers in ${city} and came across ${bName}. Am I speaking with the owner or general manager?`,
      discovery_questions: [
        `How are you currently generating most of your new ${niche} jobs in ${city}?`,
        `Are you currently satisfied with the volume of inbound quote requests from local Google search?`,
        `When homeowners search for ${niche} services in ${city}, are you consistently appearing in the top 3 map results?`,
        `Do you have capacity right now to take on 3 to 5 additional high-ticket jobs each month?`,
      ],
      opportunity_discussion: `The reason for my call is that our digital audit identified a significant opportunity for ${bName}. Right now, competitor rankings in ${city} are capturing the highest-margin service calls.`,
      service_introduction: `At MCA, we specialize in high-converting local map ranking and speed-optimized funnels built specifically for Pacific Northwest trade contractors.`,
      common_objections: [
        {
          objection: `We already have someone handling our marketing.`,
          counter: `That's great! Many of our clients do too, but they partner with us specifically for trade-specific local search rankings that generalist web designers miss.`,
        },
        {
          objection: `We're too busy right now.`,
          counter: `That's the best time to build equity so you can cherry-pick higher-margin jobs instead of relying on slow season word of mouth.`,
        },
        {
          objection: `Just send me an email.`,
          counter: `I'd love to send our 2-page competitive keyword audit. What's the best email address, and could we take 5 minutes tomorrow to walk through the highlights?`,
        },
      ],
      closing: `I'd be glad to put together a 5-minute video breakdown of your local search presence versus your top 2 competitors in ${city}. Can we schedule 10 minutes on Thursday at 10 AM to review it together?`,
    };
  },

  /**
   * Generate Sophia talking points & objection handling
   */
  async getSophiaTalkingPoints(lead: Lead): Promise<SophiaTalkingPoints> {
    try {
      const res = await fetch('/api/telephony/script/talking-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.talkingPoints) return data.talkingPoints;
      }
    } catch (e) {
      console.warn('Backend talking points fetch failed:', e);
    }

    const niche = lead.niche || 'contractor';
    const city = lead.city || 'Oregon';
    const gaps = lead.marketing_gaps || [];

    return {
      lead_context: `${lead.business_name} is an established ${niche} company in ${city} (Lead Score: ${lead.lead_score || 80}/100, Est Retainer: $${lead.estimated_retainer || 2400}/mo).`,
      talking_points: [
        `Acknowledge their strong reputation in ${city} (${lead.gmb_rating ? lead.gmb_rating + ' stars' : 'local presence'}).`,
        `Highlight primary marketing gap: ${gaps[0] || 'untapped Google map pack rankings'}.`,
        `Emphasize MCA’s localized trade focus and direct ROI attribution.`,
      ],
      pain_points: gaps.length > 0 ? gaps : [
        'Missing top 3 Google Local Map Pack rankings',
        'Unoptimized mobile conversion funnels',
        'Competitors capturing highest-intent search terms',
      ],
      recommended_questions: [
        `"How are you currently generating most of your new ${niche} leads?"`,
        `"What percentage of your work comes from referrals versus new search traffic?"`,
        `"If we could send you 5 more high-margin jobs next month, could your crew handle the volume?"`,
      ],
      objections: [
        {
          objection: 'Already have an agency / web person',
          counter: 'Focus on MCA’s local trade specialization and specific keyword audit findings.',
        },
        {
          objection: 'Not interested / too busy',
          counter: 'Acknowledge busy season and offer high-ticket pipeline stabilization.',
        },
      ],
      suggested_next_action:
        lead.pipeline_stage === 'New Lead'
          ? 'Introduce MCA value proposition and secure agreement to send customized digital audit.'
          : 'Follow up on audit findings and propose a 15-minute screen share consultation.',
    };
  },
};
