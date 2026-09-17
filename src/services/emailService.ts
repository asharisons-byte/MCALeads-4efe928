import {
  Lead,
  EmailDraft,
  EmailStatus,
  EmailType,
  PersonalizationLevel,
  EmailTone,
  ActivityEvent,
} from '../types';
import { getAgencyConfig } from './agencyConfig.js';
import { addActivity } from './leadService.js';
import { saveCommunication } from './communicationService.js';

const DRAFTS_KEY = 'mca_email_drafts_v1';

export interface GenerateEmailOptions {
  emailType?: EmailType;
  tone?: EmailTone;
  personalizationLevel?: PersonalizationLevel;
}

export interface GeneratedEmailResponse {
  subject: string;
  subject_options: string[];
  body: string;
  email_type: EmailType;
  personalization_level: PersonalizationLevel;
  key_opportunity?: string;
  suggested_cta?: string;
  source?: string;
}

/**
 * Detect appropriate email type based on pipeline stage and communication history
 */
export function detectEmailType(lead: Lead, activities?: ActivityEvent[]): EmailType {
  const stage = lead.pipeline_stage || 'New Lead';

  if (stage === 'Audit Sent') {
    return 'Audit Follow-Up';
  }
  if (stage === 'Proposal Sent') {
    return 'Proposal Follow-Up';
  }
  if (stage === 'Archived') {
    return 'Re-Engagement';
  }

  // Check if lead was already contacted in activities
  if (activities && activities.length > 0) {
    const hasPriorEmail = activities.some(
      (a) =>
        a.lead_id === lead.lead_id &&
        (a.channel === 'EMAIL' || a.type === 'email_sent' || a.type === 'email_prepared')
    );
    if (hasPriorEmail || stage === 'Contacted') {
      return 'Follow-Up';
    }
  }

  if ((lead.notes && lead.notes.length > 0) || stage === 'Contacted') {
    return 'Follow-Up';
  }

  return 'Initial Outreach';
}

/**
 * Detect highest safe personalization level without inventing data
 */
export function detectPersonalizationLevel(lead: Lead): PersonalizationLevel {
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
 * Call server AI endpoint to generate Sophia personalized email
 */
export async function generateSophiaEmail(
  lead: Lead,
  options: GenerateEmailOptions = {}
): Promise<GeneratedEmailResponse> {
  const agencyConfig = getAgencyConfig();
  const emailType = options.emailType || detectEmailType(lead);
  const tone = options.tone || 'More Professional';
  const personalizationLevel = options.personalizationLevel || detectPersonalizationLevel(lead);

  try {
    const response = await fetch('/api/ai/generate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead,
        emailType,
        tone,
        personalizationLevel,
        agencyConfig,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      subject: data.subject || `Quick question regarding ${lead.business_name}`,
      subject_options: Array.isArray(data.subject_options) && data.subject_options.length > 0
        ? data.subject_options
        : [
            data.subject,
            `Observation regarding ${lead.business_name} in ${lead.city || 'Oregon'}`,
            `A quick idea for ${lead.business_name}`,
          ],
      body: data.body,
      email_type: data.email_type || emailType,
      personalization_level: data.personalization_level || personalizationLevel,
      key_opportunity: data.key_opportunity,
      suggested_cta: data.suggested_cta,
      source: data.source,
    };
  } catch (error) {
    console.warn('Network call failed, falling back to local client generator', error);
    return generateClientFallbackEmail(lead, emailType, tone, personalizationLevel);
  }
}

/**
 * Client-side deterministic backup in case server is unreachable
 */
function generateClientFallbackEmail(
  lead: Lead,
  emailType: EmailType,
  tone: EmailTone,
  personalizationLevel: PersonalizationLevel
): GeneratedEmailResponse {
  const config = getAgencyConfig();
  const businessName = lead.business_name || 'your business';
  const contactName = lead.contact_name ? lead.contact_name.split(' ')[0] : '';
  const city = lead.city || 'Oregon';
  const niche = lead.niche || 'contractor';
  const service = lead.recommended_service || 'local search and website conversion';

  const greeting = contactName ? `Hi ${contactName},` : `Hi ${businessName} Team,`;

  let signOff = `Best regards,\n\nSophia\nMarketing Charm Agency`;
  if (config.contact_phone) signOff += `\n${config.contact_phone}`;
  if (config.website) signOff += `\n${config.website}`;

  let opportunity = 'local search visibility and inbound customer paths';
  if (lead.gaps?.includes('No Website')) {
    opportunity = 'establishing an online web presence to capture local customer search traffic';
  } else if (lead.gaps?.includes('No GMB') || lead.gaps?.includes('Unclaimed')) {
    opportunity = 'claiming and optimizing your Google Business Profile to appear in the top Google Maps local pack';
  }

  const subjectOptions = [
    `Quick question regarding ${businessName}'s online presence in ${city}`,
    `Observation regarding ${businessName} in ${city}`,
    `A quick idea for ${businessName}`,
  ];

  const body = `${greeting}

I'm Sophia from Marketing Charm Agency. I came across your business while researching ${niche} companies in ${city}.

I noticed an opportunity around ${opportunity} that may be affecting how easily potential local customers find and contact your business.

For service businesses competing in local search, improving ${service} helps create a stronger system for capturing inbound opportunities.

I put together a short overview of what I found and would be happy to send it over.

Would you be open to taking a quick look?

${signOff}`;

  return {
    subject: subjectOptions[0],
    subject_options: subjectOptions,
    body,
    email_type: emailType,
    personalization_level: personalizationLevel,
    key_opportunity: opportunity,
    suggested_cta: 'Would you be open to taking a quick look?',
    source: 'client_fallback',
  };
}

/**
 * Build standard Gmail Compose Web URL
 */
export function buildGmailComposeUrl(recipient: string, subject: string, body: string): string {
  const to = recipient.trim();
  const su = subject.trim();
  const b = body.trim();
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(
    su
  )}&body=${encodeURIComponent(b)}`;
}

/**
 * Retrieve all saved email drafts from localStorage
 */
export function getEmailDrafts(): EmailDraft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load email drafts', e);
  }
  return [];
}

/**
 * Save or update an email draft
 */
export function saveEmailDraft(draft: Partial<EmailDraft> & { lead_id: string; business_name: string }): EmailDraft {
  const current = getEmailDrafts();
  const now = new Date().toISOString();

  const id = draft.id || `draft-${draft.lead_id}-${Date.now()}`;
  const existingIndex = current.findIndex((d) => d.id === id || d.lead_id === draft.lead_id);

  const completeDraft: EmailDraft = {
    id,
    draft_id: id,
    lead_id: draft.lead_id,
    business_name: draft.business_name,
    contact_name: draft.contact_name,
    recipient: draft.recipient || '',
    subject: draft.subject || '',
    subject_options: draft.subject_options || [],
    body: draft.body || '',
    email_type: draft.email_type || 'Initial Outreach',
    personalization_level: draft.personalization_level || 'High',
    tone: draft.tone || 'More Professional',
    key_opportunity: draft.key_opportunity,
    suggested_cta: draft.suggested_cta,
    generated_by: draft.generated_by || 'Sophia (AI Sales Rep)',
    created_at: draft.created_at || now,
    updated_at: now,
    status: draft.status || 'DRAFT',
    lead_score: draft.lead_score,
    niche: draft.niche,
    city: draft.city,
    metadata: draft.metadata,
  };

  let updatedList: EmailDraft[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = { ...current[existingIndex], ...completeDraft, updated_at: now };
  } else {
    updatedList = [completeDraft, ...current];
  }

  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to persist draft', e);
  }

  return completeDraft;
}

/**
 * Get draft for a specific lead if one exists
 */
export function getDraftForLead(leadId: string): EmailDraft | undefined {
  const drafts = getEmailDrafts();
  return drafts.find((d) => d.lead_id === leadId);
}

/**
 * Delete an email draft
 */
export function deleteEmailDraft(draftId: string): boolean {
  const current = getEmailDrafts();
  const filtered = current.filter((d) => d.id !== draftId && d.draft_id !== draftId);
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete draft', e);
    return false;
  }
}

/**
 * Prepare an email for Gmail: marks status as PREPARED, records Activity, logs Communication
 */
export function markEmailPrepared(
  draft: EmailDraft,
  lead: Lead
): { activity: ActivityEvent; draft: EmailDraft } {
  const timestamp = new Date().toISOString();
  const updatedDraft = saveEmailDraft({
    ...draft,
    status: 'PREPARED',
    updated_at: timestamp,
  });

  // 1. Record Activity Timeline Event
  const activity: ActivityEvent = {
    id: `act-email-prep-${Date.now()}`,
    activity_id: `act-email-prep-${Date.now()}`,
    lead_id: lead.lead_id,
    lead_name: lead.business_name,
    timestamp,
    type: 'email_prepared',
    activity_type: 'email_prepared',
    channel: 'EMAIL',
    title: 'Sophia prepared an email',
    description: `Email prepared for Gmail dispatch.\nRecipient: ${draft.recipient || 'No verified address'}\nSubject: "${draft.subject}"`,
    author: 'Sophia (AI Sales Rep)',
    source: 'Sophia (AI)',
    metadata: {
      draft_id: draft.id,
      recipient: draft.recipient,
      subject: draft.subject,
      email_type: draft.email_type,
      personalization_level: draft.personalization_level,
      email_body: draft.body,
      status: 'PREPARED',
      provider: 'Gmail Web Compose',
      is_ai_generated: true,
    },
  };

  addActivity(activity);

  // 2. Log in Communication Service
  try {
    saveCommunication({
      lead_id: lead.lead_id,
      channel: 'EMAIL',
      direction: 'OUTBOUND',
      status: 'PREPARED',
      subject: draft.subject,
      content: draft.body,
      metadata: {
        recipient: draft.recipient,
        sender: 'Sophia (Marketing Charm Agency)',
        draft_id: draft.id,
        email_type: draft.email_type,
        personalization_level: draft.personalization_level,
        key_opportunity: draft.key_opportunity,
      },
    });
  } catch (e) {
    console.error('Failed to log email communication', e);
  }

  return { activity, draft: updatedDraft };
}
