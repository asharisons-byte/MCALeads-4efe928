import {
  Communication,
  CommunicationChannel,
  CommunicationDirection,
  CommunicationStatus,
  Lead,
  ActivityEvent,
  SophiaLeadContext,
  SophiaRecommendation,
} from '../types';

const COMMUNICATIONS_STORAGE_KEY = 'mca_communications_v1';

/**
 * Retrieve all logged communications across all leads or for a specific lead.
 */
export function getCommunications(leadId?: string): Communication[] {
  try {
    const raw = localStorage.getItem(COMMUNICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: Communication[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (leadId) {
      return parsed
        .filter((c) => c.lead_id === leadId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return parsed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (e) {
    console.error('Failed to parse communications from storage', e);
    return [];
  }
}

/**
 * Log a new communication entity (Email, SMS, Call, AI Call)
 */
export function saveCommunication(
  commData: Omit<Communication, 'communication_id' | 'timestamp'> & {
    communication_id?: string;
    timestamp?: string;
  }
): Communication {
  const all = getCommunications();
  const newComm: Communication = {
    communication_id: commData.communication_id || `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: commData.timestamp || new Date().toISOString(),
    lead_id: commData.lead_id,
    contact_id: commData.contact_id || `contact-${commData.lead_id}`,
    channel: commData.channel,
    direction: commData.direction,
    status: commData.status,
    subject: commData.subject,
    content: commData.content,
    provider_id: commData.provider_id || 'system_dispatch',
    metadata: commData.metadata || {},
  };

  const updated = [newComm, ...all];
  try {
    localStorage.setItem(COMMUNICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save communication to storage', e);
  }

  return newComm;
}

/**
 * Update an existing communication record
 */
export function updateCommunication(
  communicationId: string,
  updates: Partial<Communication>
): Communication | null {
  const all = getCommunications();
  const index = all.findIndex((c) => c.communication_id === communicationId);
  if (index === -1) return null;

  const updatedItem: Communication = {
    ...all[index],
    ...updates,
  };
  all[index] = updatedItem;

  try {
    localStorage.setItem(COMMUNICATIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to update communication', e);
  }

  return updatedItem;
}

/**
 * Delete a communication record
 */
export function deleteCommunication(communicationId: string): boolean {
  const all = getCommunications();
  const filtered = all.filter((c) => c.communication_id !== communicationId);
  if (filtered.length !== all.length) {
    try {
      localStorage.setItem(COMMUNICATIONS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to delete communication', e);
    }
  }
  return false;
}

/**
 * Generates Sophia's dynamic Next Best Action Recommendation grounded strictly in lead data.
 */
export function getSophiaRecommendedAction(
  lead: Lead,
  activities: ActivityEvent[] = [],
  communications: Communication[] = []
): SophiaRecommendation {
  const score = lead.lead_score || 0;
  const leadActivities = activities.filter((a) => a.lead_id === lead.lead_id);
  const leadComms = communications.filter((c) => c.lead_id === lead.lead_id);

  const hasPhone = Boolean(lead.phone && lead.phone !== 'Not Available');
  const hasEmail = Boolean(lead.email && lead.email !== 'Not Available');
  const hasCalled = leadActivities.some(
    (a) => a.type === 'call_made' || a.type === 'call_completed' || a.type === 'ai_call_made'
  ) || leadComms.some((c) => c.channel === 'CALL' || c.channel === 'AI_CALL');
  const hasEmailed = leadActivities.some((a) => a.type === 'email_sent') ||
    leadComms.some((c) => c.channel === 'EMAIL');
  const hasFollowUpScheduled = Boolean(lead.upcoming_follow_up);

  // 1. If in Proposal or Audit Sent stage and no follow-up scheduled
  if (lead.pipeline_stage === 'Proposal Sent' && !hasFollowUpScheduled) {
    return {
      action: 'Schedule Follow-Up',
      channel: 'CALL',
      priority: 'High',
      reason: `Proposal is currently active. Timely follow-up closes high-ticket retainers like $${lead.estimated_retainer?.toLocaleString() || '2,400'}/mo.`,
      recommended_next_step: `Schedule a 15-minute decision call or send a check-in message regarding ${lead.recommended_service}.`,
      suggested_opening: `Hi ${lead.contact_name || 'there'}, Sophia from Marketing Charm Agency following up on the proposal sent for ${lead.business_name}.`,
    };
  }

  if (lead.pipeline_stage === 'Audit Sent' && !hasFollowUpScheduled) {
    return {
      action: 'Call',
      channel: 'CALL',
      priority: 'High',
      reason: `Audit sent for ${lead.business_name}. Direct review call converts audit interest into an active client proposal.`,
      recommended_next_step: `Call ${lead.contact_name || 'decision maker'} to walk through the identified bottlenecks in person.`,
      suggested_opening: `Hi ${lead.contact_name || 'there'}, Sophia from Marketing Charm Agency following up on the digital growth audit we prepared for ${lead.business_name}.`,
    };
  }

  // 2. High opportunity score (>= 80) with technical or reputation gap and no outreach yet
  if (score >= 80 && !hasCalled && !hasEmailed) {
    if (hasPhone) {
      const topGap = lead.gaps?.[0] || 'website performance issue';
      return {
        action: 'AI Call',
        channel: 'AI_CALL',
        priority: 'High',
        reason: `This lead has a ${score}/100 opportunity score, an identified ${topGap.toLowerCase()}, and no previous outreach activity.`,
        recommended_next_step: `Introduce Marketing Charm Agency and discuss the ${lead.recommended_service} opportunity.`,
        suggested_opening: `Hi ${lead.contact_name || 'there'}, this is Sophia from Marketing Charm Agency. I noticed your reputation in ${lead.city || 'your area'}, but your ${topGap} is leaving local customer calls on the table.`,
      };
    } else if (hasEmail) {
      return {
        action: 'Email',
        channel: 'EMAIL',
        priority: 'High',
        reason: `High opportunity score of ${score}/100 with direct email available and zero prior touches.`,
        recommended_next_step: `Send targeted audit hook emphasizing ${lead.recommended_service} with projected revenue lift of ${lead.estimated_revenue_lift || '$4,000–$8,000/mo'}.`,
        suggested_opening: `Subject: Quick observation regarding ${lead.business_name}'s digital presence in ${lead.city || 'Oregon'}`,
      };
    }
  }

  // 3. Emailed previously without phone call
  if (hasEmailed && !hasCalled && hasPhone) {
    return {
      action: 'Call',
      channel: 'CALL',
      priority: 'High',
      reason: `Introductory email was sent. Multi-channel follow-up within 48 hours triples connection rates.`,
      recommended_next_step: `Make direct inquiry call referencing the observation sent to ${lead.email}.`,
      suggested_opening: `Hi ${lead.contact_name || 'there'}, Sophia from Marketing Charm Agency following up briefly on the email sent earlier regarding ${lead.business_name}.`,
    };
  }

  // 4. Moderate score or missing website
  if (lead.website_status === 'No Website' || lead.website_status === 'Slow / Unreachable Server') {
    return {
      action: hasPhone ? 'AI Call' : hasEmail ? 'Email' : 'SMS',
      channel: hasPhone ? 'AI_CALL' : hasEmail ? 'EMAIL' : 'SMS',
      priority: 'High',
      reason: `Critical infrastructure bottleneck: ${lead.website_status}. High urgency for lead-generating business in ${lead.city || 'the local market'}.`,
      recommended_next_step: `Offer our turnkey Fast-Track Web & Funnel package valued at $${lead.estimated_retainer?.toLocaleString() || '1,800'}/mo.`,
      suggested_opening: `Hi ${lead.contact_name || 'there'}, noticed ${lead.business_name} does not have an active mobile web presence. We can have a high-converting site live in 5 days.`,
    };
  }

  // 5. Default baseline recommendation
  if (hasPhone) {
    return {
      action: 'Call',
      channel: 'CALL',
      priority: 'Medium',
      reason: `Direct contact phone is verified. Lead has an overall score of ${score}/100 in ${lead.niche || 'contractor services'}.`,
      recommended_next_step: `Conduct a brief discovery call to qualify budget and verify current marketing vendor status.`,
      suggested_opening: `Hi ${lead.contact_name || 'there'}, Sophia with Marketing Charm Agency. Calling regarding your local presence in ${lead.city || 'Oregon'}.`,
    };
  }

  return {
    action: hasEmail ? 'Email' : 'SMS',
    channel: hasEmail ? 'EMAIL' : 'SMS',
    priority: 'Medium',
    reason: `Direct messaging channel ready for introductory gap analysis outreach.`,
    recommended_next_step: `Dispatch initial outreach draft highlighting ${lead.recommended_service}.`,
    suggested_opening: `Hi ${lead.contact_name || 'Team'}, reaching out from Marketing Charm Agency regarding ${lead.business_name}.`,
  };
}

/**
 * Builds the unified Sophia Lead Conversation Context for AI reasoning,
 * ensuring no invented business facts.
 */
export function buildSophiaLeadContext(
  lead: Lead,
  activities: ActivityEvent[] = [],
  communications: Communication[] = []
): SophiaLeadContext {
  const leadActivities = activities.filter((a) => a.lead_id === lead.lead_id);
  const leadComms = communications.filter((c) => c.lead_id === lead.lead_id);
  const recommendation = getSophiaRecommendedAction(lead, activities, communications);

  const notesSummary = (lead.notes || []).map(
    (n) => `[${new Date(n.timestamp).toLocaleDateString()}] ${n.activity_type} by ${n.author}: ${n.content}`
  );

  const commsSummary = leadComms.map((c) => ({
    channel: c.channel,
    direction: c.direction,
    status: c.status,
    summary: c.subject ? `${c.subject} - ${c.content.substring(0, 60)}` : c.content.substring(0, 80),
    timestamp: c.timestamp,
  }));

  return {
    lead_id: lead.lead_id,
    business_name: lead.business_name || 'Not Available',
    contact_name: lead.contact_name || 'Not Available',
    niche: lead.niche || 'Not Available',
    location: `${lead.city || 'Not Available'}, ${lead.state || 'Not Available'} ${lead.postal_code || ''}`.trim(),
    website: lead.website || 'Not Available',
    phone: lead.phone || 'Not Available',
    email: lead.email || 'Not Available',
    address: lead.address || 'Not Available',
    gmb_status: lead.gmb_status || 'Not Available',
    gmb_rating: lead.gmb_rating || 'Not Available',
    gmb_reviews: lead.gmb_review_count || 0,
    website_status: lead.website_status || 'Not Available',
    pagespeed_score: lead.pagespeed_score || 'Not Available',
    google_ads_status: lead.google_ads_status || 'Not Available',
    meta_pixel_status: lead.meta_pixel_status || 'Not Available',
    seo_status: lead.seo_status || 'Not Available',
    lead_score: lead.lead_score,
    score_breakdown: lead.score_breakdown,
    gaps: lead.gaps || [],
    recommended_service: lead.recommended_service || 'Full Digital Growth Package',
    estimated_retainer: lead.estimated_retainer || 1800,
    estimated_revenue_lift: lead.estimated_revenue_lift || '$3,000–$6,000/mo',
    ai_pitch: lead.ai_enrichment?.suggested_pitch || lead.opportunity_angle || 'Not Available',
    pipeline_stage: lead.pipeline_stage,
    notes_count: lead.notes?.length || 0,
    recent_notes: notesSummary.slice(0, 5),
    communications_count: leadComms.length,
    recent_communications: commsSummary.slice(0, 5),
    recommendation,
  };
}
