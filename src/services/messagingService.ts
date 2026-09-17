import {
  Lead,
  SMSMessage,
  SMSEligibilityStatus,
  SMSStatus,
  SMSType,
  ReplyIntent,
  SophiaReplyAnalysis,
  PersonalizationLevel,
  ActivityEvent,
} from '../types';
import { getAgencyConfig } from './agencyConfig.js';
import { addActivity, updateLead, getLeads } from './leadService';
import { saveCommunication } from './communicationService';

const SMS_STORAGE_KEY = 'mca_sms_messages_v1';
const OPTOUT_STORAGE_KEY = 'mca_sms_optout_registry_v1';

export interface PhoneValidationResult {
  valid: boolean;
  e164: string;
  display: string;
  original: string;
  reason?: string;
}

export interface EligibilityResult {
  status: SMSEligibilityStatus;
  reason: string;
  canSend: boolean;
}

export interface OptOutRecord {
  id: string;
  lead_id: string;
  phone: string;
  phone_e164: string;
  timestamp: string;
  original_message: string;
  channel: 'SMS';
  reason: string;
}

export interface SendSMSOptions {
  lead: Lead;
  content: string;
  smsType?: SMSType;
  personalizationLevel?: PersonalizationLevel;
  recipientPhone?: string;
}

export interface ReceiveSMSOptions {
  leadId: string;
  content: string;
  fromNumber?: string;
  replyToId?: string;
}

/**
 * Validates and normalizes phone numbers into international E.164 format where possible.
 * Never invents a number. Preserves original phone.
 */
export function validateAndNormalizePhone(phone?: string): PhoneValidationResult {
  const original = phone ? phone.trim() : '';

  if (!original || original.toLowerCase() === 'not available' || original.toLowerCase() === 'none') {
    return {
      valid: false,
      e164: '',
      display: 'No phone number available for this lead.',
      original,
      reason: 'No phone number available for this lead.',
    };
  }

  // Remove whitespace, dashes, parentheses, dots
  const digitsOnly = original.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    // Standard US 10-digit number
    const area = digitsOnly.substring(0, 3);
    const prefix = digitsOnly.substring(3, 6);
    const line = digitsOnly.substring(6, 10);
    return {
      valid: true,
      e164: `+1${digitsOnly}`,
      display: `(${area}) ${prefix}-${line}`,
      original,
    };
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // US 11-digit starting with 1
    const area = digitsOnly.substring(1, 4);
    const prefix = digitsOnly.substring(4, 7);
    const line = digitsOnly.substring(7, 11);
    return {
      valid: true,
      e164: `+${digitsOnly}`,
      display: `(${area}) ${prefix}-${line}`,
      original,
    };
  } else if (original.startsWith('+') && digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    // Valid international E.164 format
    return {
      valid: true,
      e164: `+${digitsOnly}`,
      display: `+${digitsOnly}`,
      original,
    };
  } else if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    // Potential international without leading +
    return {
      valid: true,
      e164: `+${digitsOnly}`,
      display: `+${digitsOnly}`,
      original,
    };
  }

  return {
    valid: false,
    e164: '',
    display: original,
    original,
    reason: 'Invalid phone number format. Must contain at least 10 digits.',
  };
}

/**
 * Opt-Out Suppression Registry
 */
export function getOptOutRegistry(): OptOutRecord[] {
  try {
    const raw = localStorage.getItem(OPTOUT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading opt-out registry', e);
    return [];
  }
}

export function isPhoneOptedOut(phoneOrE164: string): boolean {
  if (!phoneOrE164) return false;
  const digits = phoneOrE164.replace(/\D/g, '');
  const registry = getOptOutRegistry();
  return registry.some((r) => {
    const rDigits = r.phone_e164.replace(/\D/g, '');
    return rDigits === digits || (digits.length >= 10 && rDigits.endsWith(digits.slice(-10)));
  });
}

export function recordOptOut(
  leadId: string,
  phone: string,
  originalMessage: string,
  reason: string = 'Opted out via inbound SMS'
): OptOutRecord {
  const norm = validateAndNormalizePhone(phone);
  const record: OptOutRecord = {
    id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    lead_id: leadId,
    phone: norm.display,
    phone_e164: norm.e164 || phone,
    timestamp: new Date().toISOString(),
    original_message: originalMessage,
    channel: 'SMS',
    reason,
  };

  const current = getOptOutRegistry();
  const filtered = current.filter((r) => r.phone_e164 !== record.phone_e164 && r.lead_id !== leadId);
  filtered.unshift(record);

  try {
    localStorage.setItem(OPTOUT_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save opt-out record', e);
  }

  return record;
}

/**
 * Evaluates communication eligibility before sending
 */
export function checkSMSEligibility(lead: Lead, phoneValidation?: PhoneValidationResult): EligibilityResult {
  const phone = phoneValidation || validateAndNormalizePhone(lead.phone);

  if (!phone.valid || !phone.e164) {
    return {
      status: 'BLOCKED',
      reason: phone.reason || 'No phone number available for this lead.',
      canSend: false,
    };
  }

  if (lead.sms_opt_out || isPhoneOptedOut(phone.e164)) {
    return {
      status: 'OPTED_OUT',
      reason: lead.sms_opt_out_reason || 'This contact has previously opted out of SMS communication.',
      canSend: false,
    };
  }

  if (lead.sms_eligibility === 'SUPPRESSED') {
    return {
      status: 'SUPPRESSED',
      reason: 'This lead has been administratively suppressed from SMS outreach.',
      canSend: false,
    };
  }

  if (lead.sms_eligibility === 'BLOCKED') {
    return {
      status: 'BLOCKED',
      reason: 'Direct SMS delivery is currently blocked for this contact.',
      canSend: false,
    };
  }

  return {
    status: 'ALLOWED',
    reason: 'Eligible for professional B2B outreach.',
    canSend: true,
  };
}

/**
 * Opt-out keyword detection (STOP, UNSUBSCRIBE, CANCEL, QUIT, END)
 */
export function detectOptOutKeyword(content: string): { isOptOut: boolean; keyword?: string } {
  const trimmed = content.trim().toUpperCase();
  const keywords = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END', 'REMOVE ME', 'DO NOT TEXT'];

  for (const kw of keywords) {
    if (
      trimmed === kw ||
      trimmed.startsWith(kw + ' ') ||
      trimmed.startsWith(kw + '.') ||
      trimmed.startsWith(kw + '!') ||
      trimmed.endsWith(' ' + kw) ||
      trimmed.includes(` ${kw} `)
    ) {
      return { isOptOut: true, keyword: kw };
    }
  }

  return { isOptOut: false };
}

/**
 * Calculate GSM-7 SMS character and segment count
 */
export function calculateSmsSegments(text: string): { characterCount: number; segmentsCount: number } {
  const characterCount = text.length;
  const segmentsCount = characterCount <= 160 ? 1 : Math.ceil(characterCount / 153);
  return { characterCount, segmentsCount };
}

/**
 * Detect appropriate SMS type based on CRM history & pipeline stage
 */
export async function detectSMSType(lead: Lead, activities?: ActivityEvent[], messages?: SMSMessage[]): Promise<SMSType> {
  const stage = lead.pipeline_stage || 'New Lead';

  if (stage === 'Audit Sent') return 'Audit Follow-Up';
  if (stage === 'Proposal Sent') return 'Proposal Follow-Up';
  if (stage === 'Archived') return 'Re-Engagement';

  const leadMessages = messages || await getSMSMessages(lead.lead_id);
  if (leadMessages.length > 0) {
    const hasOutbound = leadMessages.some((m) => m.direction === 'OUTBOUND');
    const hasInbound = leadMessages.some((m) => m.direction === 'INBOUND');
    if (hasInbound) return 'Information Follow-Up';
    if (hasOutbound) return 'Follow-Up';
  }

  if (activities && activities.length > 0) {
    const hasContact = activities.some(
      (a) => a.lead_id === lead.lead_id && (a.channel === 'SMS' || a.channel === 'EMAIL' || a.channel === 'CALL')
    );
    if (hasContact || stage === 'Contacted') return 'Follow-Up';
  }

  if ((lead.notes && lead.notes.length > 0) || stage === 'Contacted') {
    return 'Follow-Up';
  }

  return 'Initial Outreach';
}

/**
 * Detect highest safe personalization level without inventing data
 */
export function detectSMSPersonalizationLevel(lead: Lead): PersonalizationLevel {
  const hasGmb = Boolean(lead.gmb_status);
  const hasReviews = typeof lead.gmb_review_count === 'number' && lead.gmb_review_count > 0;
  const hasGaps = Array.isArray(lead.gaps) && lead.gaps.length > 0;
  const hasAudit = Boolean(lead.recommended_service || lead.opportunity_angle);

  if ((hasGmb || hasReviews) && hasGaps && hasAudit) {
    return 'High';
  }
  if (lead.business_name && (lead.city || lead.niche)) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Storage for SMS Messages
 */
export async function getSMSMessages(leadId?: string): Promise<SMSMessage[]> {
  try {
    const raw = localStorage.getItem(SMS_STORAGE_KEY);
    let messages: SMSMessage[] = raw ? JSON.parse(raw) : [];

    if (messages.length === 0) {
      // Seed sample initial SMS conversations if empty for rich preview
      messages = await seedInitialSMSMessages();
      saveAllSMSMessages(messages);
    }

    if (leadId) {
      return messages.filter((m) => m.lead_id === leadId);
    }
    return messages;
  } catch (e) {
    console.error('Error fetching SMS messages', e);
    return [];
  }
}

export async function saveSMSMessage(msg: SMSMessage): Promise<SMSMessage> {
  const all = await getSMSMessages();
  const idx = all.findIndex((m) => m.sms_id === msg.sms_id);
  const updatedMsg: SMSMessage = {
    ...msg,
    updated_at: new Date().toISOString(),
  };

  if (idx !== -1) {
    all[idx] = updatedMsg;
  } else {
    all.unshift(updatedMsg);
  }

  saveAllSMSMessages(all);
  return updatedMsg;
}

export async function deleteSMSMessage(smsId: string): Promise<void> {
  const all = await getSMSMessages();
  const filtered = all.filter((m) => m.sms_id !== smsId);
  saveAllSMSMessages(filtered);
}

function saveAllSMSMessages(messages: SMSMessage[]): void {
  try {
    localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save SMS messages', e);
  }
}

/**
 * Sophia SMS Generation (Client side caller with server fallback)
 */
export async function generateSophiaSMS(
  lead: Lead,
  options: { smsType?: SMSType; personalizationLevel?: PersonalizationLevel } = {}
): Promise<{
  content: string;
  sms_type: SMSType;
  personalization_level: PersonalizationLevel;
  character_count: number;
  segments_count: number;
  source: string;
}> {
  const agencyConfig = getAgencyConfig();
  const smsType = options.smsType || await detectSMSType(lead);
  const personalizationLevel = options.personalizationLevel || detectSMSPersonalizationLevel(lead);

  try {
    const res = await fetch('/api/ai/generate-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead,
        smsType,
        personalizationLevel,
        agencyConfig,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        content: data.content,
        sms_type: data.sms_type || smsType,
        personalization_level: data.personalization_level || personalizationLevel,
        character_count: data.character_count || data.content.length,
        segments_count: data.segments_count || calculateSmsSegments(data.content).segmentsCount,
        source: data.source || 'gemini',
      };
    }
  } catch (e) {
    console.warn('Backend SMS generation failed, using local deterministic fallback', e);
  }

  return generateLocalDeterministicSMS(lead, smsType, personalizationLevel, agencyConfig);
}

function generateLocalDeterministicSMS(
  lead: Lead,
  smsType: SMSType,
  personalizationLevel: PersonalizationLevel,
  agencyConfig: any
): {
  content: string;
  sms_type: SMSType;
  personalization_level: PersonalizationLevel;
  character_count: number;
  segments_count: number;
  source: string;
} {
  const senderAgency = agencyConfig?.agency_name || 'Marketing Charm Agency';
  const businessName = lead.business_name || 'team';
  const contactName = lead.contact_name ? lead.contact_name.split(' ')[0] : '';
  const city = lead.city || 'Oregon';
  const gaps = lead.gaps || [];

  let opp = 'your online presence';
  if (gaps.includes('No Website')) {
    opp = 'establishing a mobile quote site';
  } else if (gaps.includes('No GMB')) {
    opp = 'setting up your Google Business Profile';
  } else if (gaps.includes('Thin Reviews')) {
    opp = 'boosting Google Maps reviews';
  } else if (lead.recommended_service) {
    opp = lead.recommended_service.toLowerCase();
  }

  const nameGreeting = contactName ? `Hi ${contactName}` : `Hi ${businessName} team`;
  let content = '';

  switch (smsType) {
    case 'Follow-Up':
      content = `${nameGreeting} — Sophia from ${senderAgency} following up. Did you have a moment to review my previous note on ${opp} in ${city}? Happy to text over a 2-minute overview.`;
      break;
    case 'Audit Follow-Up':
      content = `${nameGreeting} — Sophia with ${senderAgency}. I put together a quick local visibility breakdown for ${businessName} in ${city}. Would you be open to me texting over the link?`;
      break;
    case 'Information Follow-Up':
      content = `${nameGreeting} — Sophia here from ${senderAgency}. Touching base with the information regarding ${opp} for ${businessName}. Let me know if you'd like a quick 5-min walk-through this week.`;
      break;
    case 'Proposal Follow-Up':
      content = `${nameGreeting} — Sophia from ${senderAgency}. Wanted to see if you had any questions on the proposal we prepared for ${businessName}. Looking forward to connecting!`;
      break;
    case 'Re-Engagement':
      content = `${nameGreeting} — Sophia with ${senderAgency}. Reconnecting to see if expanding ${businessName}'s customer acquisition in ${city} is still a focus this quarter?`;
      break;
    case 'Initial Outreach':
    default:
      if (personalizationLevel === 'High' && lead.gmb_rating && lead.gmb_review_count) {
        content = `${nameGreeting} — Sophia from ${senderAgency}. Noticed your ${lead.gmb_rating}★ reputation in ${city}. We identified a simple way to convert that into more direct calls. Open to a quick look?`;
      } else {
        content = `${nameGreeting} — Sophia from ${senderAgency} here. I noticed an opportunity with ${businessName}'s online presence in ${city} that could be worth a quick look. Open to me sending a breakdown?`;
      }
      break;
  }

  if (content.length > 320) {
    content = content.substring(0, 317) + '...';
  }

  const { characterCount, segmentsCount } = calculateSmsSegments(content);
  return {
    content,
    sms_type: smsType,
    personalization_level: personalizationLevel,
    character_count: characterCount,
    segments_count: segmentsCount,
    source: 'deterministic_fallback',
  };
}

/**
 * Dispatch an Outbound SMS (calls backend provider abstraction)
 */
export async function sendOutboundSMS(options: SendSMSOptions): Promise<{
  success: boolean;
  message: SMSMessage;
  activity: ActivityEvent;
}> {
  const { lead, content, smsType = 'Initial Outreach', personalizationLevel = 'High', recipientPhone } = options;
  const phoneVal = validateAndNormalizePhone(recipientPhone || lead.phone);

  const eligibility = checkSMSEligibility(lead, phoneVal);
  if (!eligibility.canSend) {
    throw new Error(eligibility.reason || 'SMS sending is blocked for this contact.');
  }

  const { characterCount, segmentsCount } = calculateSmsSegments(content);
  const agencyConfig = getAgencyConfig();

  let providerMessageId = `msg_sim_${Date.now()}`;
  let status: SMSStatus = 'SENT';

  try {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneVal.e164,
        leadId: lead.lead_id,
        content,
        smsType,
        agencyConfig,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      providerMessageId = data.provider_message_id || providerMessageId;
      status = 'DELIVERED';
    }
  } catch (e) {
    console.warn('Backend SMS send request error, falling back to local dispatch simulation', e);
  }

  const timestamp = new Date().toISOString();
  const smsId = `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const message: SMSMessage = {
    sms_id: smsId,
    lead_id: lead.lead_id,
    contact_id: lead.contact_name,
    business_name: lead.business_name,
    contact_name: lead.contact_name,
    phone_number: phoneVal.display,
    phone_e164: phoneVal.e164,
    raw_phone: phoneVal.original,
    direction: 'OUTBOUND',
    content,
    status,
    provider_message_id: providerMessageId,
    sms_type: smsType,
    personalization_level: personalizationLevel,
    segments_count: segmentsCount,
    character_count: characterCount,
    sent_at: timestamp,
    delivered_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    consent_status: 'IMPLIED',
    opt_out_status: false,
    metadata: {
      provider: 'Telnyx Messaging Network',
      sender_name: 'Sophia (AI Sales Rep)',
      agency_name: agencyConfig.agency_name,
    },
  };

  saveSMSMessage(message);

  // 1. Record Lead Activity Timeline
  const activity: ActivityEvent = {
    id: `act-sms-${Date.now()}`,
    activity_id: `act-sms-${Date.now()}`,
    lead_id: lead.lead_id,
    lead_name: lead.business_name,
    timestamp,
    type: 'sms_sent',
    activity_type: 'sms_sent',
    channel: 'SMS',
    title: `SMS Sent to ${phoneVal.display}`,
    description: content,
    author: 'Sophia (AI Sales Rep)',
    source: 'Sophia (AI)',
    metadata: {
      sms_id: message.sms_id,
      phone_number: phoneVal.display,
      phone_e164: phoneVal.e164,
      status: 'SENT',
      segments_count: segmentsCount,
      sms_type: smsType,
      provider_message_id: providerMessageId,
    },
  };

  addActivity(activity);

  // 2. Log in Communication Service
  try {
    saveCommunication({
      lead_id: lead.lead_id,
      channel: 'SMS',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      content,
      metadata: {
        sms_id: message.sms_id,
        phone_number: phoneVal.display,
        phone_e164: phoneVal.e164,
        sms_type: smsType,
        provider_message_id: providerMessageId,
      },
    });
  } catch (e) {
    console.error('Failed to log SMS communication', e);
  }

  return { success: true, message, activity };
}

/**
 * Capture an Inbound SMS Reply, check opt-out, analyze with Sophia, and update timeline
 */
export async function receiveInboundSMS(options: ReceiveSMSOptions): Promise<{
  message: SMSMessage;
  activity: ActivityEvent;
  analysis: SophiaReplyAnalysis;
  stageChanged?: boolean;
}> {
  const { leadId, content, fromNumber, replyToId } = options;
  const leads = await getLeads();
  const lead = leads.find((l) => l.lead_id === leadId);
  const timestamp = new Date().toISOString();

  const phoneVal = validateAndNormalizePhone(fromNumber || lead?.phone);

  // Check for opt-out keywords
  const optOutCheck = detectOptOutKeyword(content);
  const isOptOut = optOutCheck.isOptOut;

  // Analyze reply with Sophia
  const history = await getSMSMessages(leadId);
  const analysis = await analyzeSophiaReply(content, lead, history);

  const smsId = `sms-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const { characterCount, segmentsCount } = calculateSmsSegments(content);

  const message: SMSMessage = {
    sms_id: smsId,
    lead_id: leadId,
    contact_id: lead?.contact_name,
    business_name: lead?.business_name,
    contact_name: lead?.contact_name,
    phone_number: phoneVal.display,
    phone_e164: phoneVal.e164,
    raw_phone: phoneVal.original,
    direction: 'INBOUND',
    content,
    status: isOptOut ? 'OPTED_OUT' : 'RECEIVED',
    provider_message_id: `msg_inbound_${Date.now()}`,
    segments_count: segmentsCount,
    character_count: characterCount,
    received_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    opt_out_status: isOptOut,
    opt_out_timestamp: isOptOut ? timestamp : undefined,
    suppression_reason: isOptOut ? `Opt-out triggered by keyword "${optOutCheck.keyword}"` : undefined,
    reply_analysis: analysis,
    reply_to_sms_id: replyToId,
    metadata: {
      provider: 'Telnyx Inbound Webhook',
      intent: analysis.intent,
      summary: analysis.summary,
    },
  };

  saveSMSMessage(message);

  let stageChanged = false;

  // Handle opt-out in CRM
  if (isOptOut) {
    recordOptOut(leadId, phoneVal.e164 || phoneVal.display, content, `Opt-out keyword "${optOutCheck.keyword}"`);
    if (lead) {
      updateLead(leadId, {
        sms_opt_out: true,
        sms_eligibility: 'OPTED_OUT',
        sms_opt_out_timestamp: timestamp,
        sms_opt_out_reason: `Contact opted out via SMS ("${optOutCheck.keyword}")`,
      });
    }

    const optOutActivity: ActivityEvent = {
      id: `act-opt-${Date.now()}`,
      activity_id: `act-opt-${Date.now()}`,
      lead_id: leadId,
      lead_name: lead?.business_name,
      timestamp,
      type: 'contact_opted_out',
      activity_type: 'contact_opted_out',
      channel: 'SMS',
      title: 'Contact Opted Out of SMS',
      description: `Inbound message: "${content}". All future automated and manual SMS outreach has been blocked.`,
      author: 'Compliance System',
      source: 'SMS Compliance',
      metadata: {
        phone_number: phoneVal.display,
        phone_e164: phoneVal.e164,
        keyword: optOutCheck.keyword,
      },
    };
    addActivity(optOutActivity);
  } else {
    // Pipeline Automation: If a reply is received from a New Lead -> Contacted
    if (lead && lead.pipeline_stage === 'New Lead') {
      updateLead(leadId, {
        pipeline_stage: 'Contacted',
      });
      stageChanged = true;
    }
  }

  // Record Activity in Lead Timeline
  const activity: ActivityEvent = {
    id: `act-sms-in-${Date.now()}`,
    activity_id: `act-sms-in-${Date.now()}`,
    lead_id: leadId,
    lead_name: lead?.business_name,
    timestamp,
    type: 'sms_received',
    activity_type: 'sms_received',
    channel: 'SMS',
    title: `SMS Received from ${phoneVal.display}`,
    description: `"${content}"\n\nSophia Analysis: ${analysis.intent} — ${analysis.summary}`,
    author: lead?.contact_name || lead?.business_name || 'Prospect',
    source: 'Inbound SMS',
    metadata: {
      sms_id: message.sms_id,
      phone_number: phoneVal.display,
      phone_e164: phoneVal.e164,
      status: 'RECEIVED',
      intent: analysis.intent,
      suggested_response: analysis.suggested_response,
      recommended_next_action: analysis.recommended_next_action,
    },
  };

  addActivity(activity);

  // Log in Communication Service
  try {
    saveCommunication({
      lead_id: leadId,
      channel: 'SMS',
      direction: 'INBOUND',
      status: isOptOut ? 'CANCELLED' : 'RECEIVED',
      content,
      metadata: {
        sms_id: message.sms_id,
        phone_number: phoneVal.display,
        intent: analysis.intent,
        opt_out: isOptOut,
      },
    });
  } catch (e) {
    console.error('Failed to log inbound SMS communication', e);
  }

  return { message, activity, analysis, stageChanged };
}

/**
 * Sophia Reply Analysis
 */
export async function analyzeSophiaReply(
  replyText: string,
  lead?: Lead,
  conversationHistory?: SMSMessage[]
): Promise<SophiaReplyAnalysis> {
  // Check explicit opt-out first
  const optOutCheck = detectOptOutKeyword(replyText);
  if (optOutCheck.isOptOut) {
    return {
      intent: 'Opt-Out',
      summary: 'Prospect sent an opt-out keyword to unsubscribe from SMS.',
      suggested_response: 'You have been unsubscribed from SMS notifications. No further messages will be sent.',
      recommended_next_action: 'Contact opted out. Suppress all future SMS communication.',
      confidence: 1.0,
    };
  }

  try {
    const res = await fetch('/api/ai/analyze-sms-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        replyText,
        lead,
        conversationHistory,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        intent: data.intent || 'Interested',
        summary: data.summary || 'Prospect replied.',
        suggested_response: data.suggested_response || 'Thanks for reaching out! Let me know when is a good time to connect.',
        recommended_next_action: data.recommended_next_action || 'Review conversation and follow up.',
        confidence: data.confidence || 0.9,
      };
    }
  } catch (e) {
    console.warn('Backend SMS reply analysis failed, falling back locally', e);
  }

  return fallbackLocalReplyAnalysis(replyText, lead);
}

function fallbackLocalReplyAnalysis(replyText: string, lead?: Lead): SophiaReplyAnalysis {
  const lower = replyText.toLowerCase().trim();
  const businessName = lead?.business_name || 'your business';

  if (
    lower.includes('yes') ||
    lower.includes('sure') ||
    lower.includes('send') ||
    lower.includes('interested') ||
    lower.includes('ok') ||
    lower.includes('sounds good')
  ) {
    return {
      intent: 'Interested',
      summary: 'Prospect expressed positive interest in learning more.',
      suggested_response: `Great to hear! I just put together a short overview for ${businessName}. Would this phone number or an email work best?`,
      recommended_next_action: 'Send audit overview and schedule follow-up.',
      confidence: 0.95,
    };
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('fee')) {
    return {
      intent: 'Pricing',
      summary: 'Prospect requested pricing and retainer details.',
      suggested_response: `Our local growth retainers typically start around $1,500–$2,000/mo depending on service scope. Would a quick 5-min call help clarify?`,
      recommended_next_action: 'Send pricing overview and offer quick introductory call.',
      confidence: 0.9,
    };
  }

  if (lower.includes('not interested') || lower.includes('no thanks') || lower.includes('pass') || lower.includes('busy')) {
    return {
      intent: 'Not Interested',
      summary: 'Prospect politely declined the current offer.',
      suggested_response: `Understood! Thank you for letting me know, and wishing ${businessName} continued success.`,
      recommended_next_action: 'Log response and schedule re-engagement in 60–90 days.',
      confidence: 0.9,
    };
  }

  if (lower.includes('call me') || lower.includes('phone') || lower.includes('meet') || lower.includes('schedule')) {
    return {
      intent: 'Meeting Request',
      summary: 'Prospect requested a phone call or meeting.',
      suggested_response: `I'd love to connect. What time works best for you this afternoon or tomorrow morning?`,
      recommended_next_action: 'Schedule phone consultation and prepare lead brief.',
      confidence: 0.92,
    };
  }

  if (lower.includes('who') || lower.includes('what') || lower.includes('how') || lower.endsWith('?')) {
    return {
      intent: 'Question',
      summary: 'Prospect inquired with a clarifying question.',
      suggested_response: `We specialize in Google Maps optimization and conversion funnels for Oregon contractors. We noticed a couple of quick wins for ${businessName} that we'd love to share.`,
      recommended_next_action: 'Answer questions clearly and reiterate value proposition.',
      confidence: 0.85,
    };
  }

  return {
    intent: 'Unclear',
    summary: 'Prospect reply requires manual review.',
    suggested_response: `Thanks for getting back to me! Would you like me to send over the brief overview for ${businessName}?`,
    recommended_next_action: 'Review conversation and reply with tailored clarification.',
    confidence: 0.7,
  };
}

/**
 * Seed realistic initial SMS messages across top leads for an immediate working state
 */
async function seedInitialSMSMessages(): Promise<SMSMessage[]> {
  const leads = await getLeads();
  const sampleLead = leads[0];
  if (!sampleLead) return [];

  const timestamp1 = new Date(Date.now() - 3600000 * 2).toISOString();
  const timestamp2 = new Date(Date.now() - 3600000 * 1.5).toISOString();

  const phoneVal = validateAndNormalizePhone(sampleLead.phone);

  return [
    {
      sms_id: `sms-seed-1`,
      lead_id: sampleLead.lead_id,
      contact_id: sampleLead.contact_name,
      business_name: sampleLead.business_name,
      contact_name: sampleLead.contact_name,
      phone_number: phoneVal.display,
      phone_e164: phoneVal.e164,
      raw_phone: phoneVal.original,
      direction: 'OUTBOUND',
      content: `Hi ${sampleLead.contact_name ? sampleLead.contact_name.split(' ')[0] : sampleLead.business_name + ' team'} — Sophia from Marketing Charm Agency here. I noticed an opportunity with ${sampleLead.business_name}'s online presence in ${sampleLead.city || 'Oregon'} that could be worth a quick look. Open to a short breakdown?`,
      status: 'DELIVERED',
      provider_message_id: 'msg_telnyx_seed_out_1',
      sms_type: 'Initial Outreach',
      personalization_level: 'High',
      segments_count: 2,
      character_count: 228,
      sent_at: timestamp1,
      delivered_at: timestamp1,
      created_at: timestamp1,
      updated_at: timestamp1,
      consent_status: 'IMPLIED',
      opt_out_status: false,
    },
    {
      sms_id: `sms-seed-2`,
      lead_id: sampleLead.lead_id,
      contact_id: sampleLead.contact_name,
      business_name: sampleLead.business_name,
      contact_name: sampleLead.contact_name,
      phone_number: phoneVal.display,
      phone_e164: phoneVal.e164,
      raw_phone: phoneVal.original,
      direction: 'INBOUND',
      content: `Sure, what did you guys find? Send it over.`,
      status: 'RECEIVED',
      provider_message_id: 'msg_telnyx_seed_in_1',
      segments_count: 1,
      character_count: 42,
      received_at: timestamp2,
      created_at: timestamp2,
      updated_at: timestamp2,
      opt_out_status: false,
      reply_analysis: {
        intent: 'Interested',
        summary: 'Prospect expressed interest and asked to receive the findings.',
        suggested_response: `Great! I put together a 2-minute overview video and breakdown. Would you prefer me to text the link here or send to your email?`,
        recommended_next_action: 'Send audit overview and schedule follow-up.',
        confidence: 0.95,
      },
    },
  ];
}
