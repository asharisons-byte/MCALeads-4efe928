import { Lead, SophiaCallStrategy, SophiaCallTurn, SophiaCallAnalysis } from '../types';
import { getAIModelConfig } from './aiConfig.js';

export interface AIServiceProvider {
  name: string;
  generateCallStrategy(lead: Lead): Promise<SophiaCallStrategy>;
  generateSystemPrompt(lead: Lead, strategy: SophiaCallStrategy): string;
  generateConversationTurn(params: {
    lead: Lead;
    systemPrompt: string;
    turns: SophiaCallTurn[];
    userUtterance?: string;
  }): Promise<{ reply: string; intent?: string; event_note?: string }>;
  analyzeCompletedCall(params: {
    lead: Lead;
    duration: number;
    turns: SophiaCallTurn[];
    strategy?: SophiaCallStrategy;
  }): Promise<SophiaCallAnalysis>;
}

export class GeminiProvider implements AIServiceProvider {
  public name = 'Google Gemini';

  public async generateCallStrategy(lead: Lead): Promise<SophiaCallStrategy> {
    const config = getAIModelConfig();
    try {
      const res = await fetch('/api/ai/call-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          model: config.modelId,
          temperature: config.temperature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.strategy) {
          return data.strategy;
        }
      }
    } catch (err) {
      console.warn('Backend call-strategy error, using deterministic strategy:', err);
    }

    return buildDeterministicCallStrategy(lead);
  }

  public generateSystemPrompt(lead: Lead, strategy: SophiaCallStrategy): string {
    const verified = strategy.verified_context;
    const gapsStr = verified.known_gaps.length > 0 ? verified.known_gaps.join(', ') : 'None documented';
    const ratingStr = verified.rating ? `${verified.rating} stars (${verified.reviews || 0} reviews)` : 'Unlisted rating';

    const recentComms = (lead.notes || [])
      .slice(-3)
      .map((n) => `[${n.author}]: ${n.content}`)
      .join('\n') || 'None recorded yet';

    return `COMPANY CONTEXT
Business: ${verified.business_name}
Contact: ${verified.contact_name || 'Owner / Principal'}
Industry: ${verified.industry}
Location: ${verified.location}
Website: ${lead.website || 'No website available'}

GOOGLE BUSINESS PROFILE
Status: ${verified.gmb_status}
Rating: ${ratingStr}

VERIFIED OPPORTUNITIES
${gapsStr}

RECOMMENDED SERVICE
${verified.recommended_service}

SECONDARY SERVICE
${lead.ai_enrichment?.secondary_services?.join(', ') || 'Local Citation & Reputation Booster'}

AGENCY VALUE PROPOSITION
Marketing Charm Agency helps local businesses improve their digital visibility, lead generation, local search presence, website performance, paid advertising, and customer acquisition systems.

CALL OBJECTIVE
${strategy.objective}

PIPELINE CONTEXT
Current Stage: ${lead.pipeline_stage || 'New Lead'}
Previous Communication:
${recentComms}

KNOWN OBJECTIONS
${strategy.known_objections.map((o) => `- ${o.objection} -> Counter: ${o.counter}`).join('\n')}

INSTRUCTIONS FOR SOPHIA
* Introduce yourself as Sophia calling from Marketing Charm Agency.
* If directly asked "Are you an AI?", honestly answer that you are an AI assistant calling on behalf of Marketing Charm Agency. Never impersonate a real human or lie about identity.
* Be conversational, polite, and professional.
* Keep responses concise (under 2–3 sentences per turn for natural telephony cadence).
* Listen before pitching.
* Ask relevant discovery questions.
* Never invent facts or metrics not in the verified CRM data.
* Never guarantee rankings, revenue, or specific timelines.
* Never pressure the prospect.
* Adapt based on the prospect's intent and sentiment.
* Focus on understanding the business before offering services.
* Respect requests to end the call or callbacks immediately.
* If the prospect says "Do Not Contact" or asks to be removed, immediately comply politely and terminate the conversation.`;
  }

  public async generateConversationTurn(params: {
    lead: Lead;
    systemPrompt: string;
    turns: SophiaCallTurn[];
    userUtterance?: string;
  }): Promise<{ reply: string; intent?: string; event_note?: string }> {
    const config = getAIModelConfig();
    try {
      const res = await fetch('/api/ai/call-conversation-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: params.lead,
          systemPrompt: params.systemPrompt,
          turns: params.turns,
          userUtterance: params.userUtterance,
          model: config.modelId,
          temperature: config.temperature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          return {
            reply: data.reply,
            intent: data.intent || 'Interested',
            event_note: data.event_note,
          };
        }
      }
    } catch (err) {
      console.warn('Conversation turn API failed, using intelligent simulation fallback:', err);
    }

    return generateSimulatedConversationTurn(params.lead, params.turns, params.userUtterance);
  }

  public async analyzeCompletedCall(params: {
    lead: Lead;
    duration: number;
    turns: SophiaCallTurn[];
    strategy?: SophiaCallStrategy;
  }): Promise<SophiaCallAnalysis> {
    const config = getAIModelConfig();
    try {
      const res = await fetch('/api/ai/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: params.lead,
          duration: params.duration,
          turns: params.turns,
          strategy: params.strategy,
          model: config.modelId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          return data.analysis;
        }
      }
    } catch (err) {
      console.warn('Call analysis API failed, using deterministic post-call analysis:', err);
    }

    return generateDeterministicCallAnalysis(params.lead, params.turns, params.duration);
  }
}

// Deterministic Strategy Builder for Guaranteed Resilience & Offline Support
export function buildDeterministicCallStrategy(lead: Lead): SophiaCallStrategy {
  const businessName = lead.business_name || 'Local Business';
  const niche = lead.niche || 'Contractor';
  const city = lead.city || 'Portland';
  const gaps = lead.marketing_gaps || [];
  const primaryService = lead.recommended_service || 'Local Search & Website Optimization';

  let objective = `Introduce Marketing Charm Agency and explore whether ${businessName} is interested in improving local search visibility and lead acquisition in ${city}.`;
  let primaryOpp = 'Local Map Pack visibility and high-converting lead funnel';
  const painPoints: string[] = [];

  if (gaps.includes('No Website') || lead.website_status === 'No Website') {
    objective = `Highlight how lack of an owned conversion website is causing ${businessName} to leak 60%+ of potential high-intent searchers to competitors in ${city}.`;
    primaryOpp = 'High-converting mobile website & quote capture funnel';
    painPoints.push('Zero owned digital asset to capture and convert Google Maps search traffic');
    painPoints.push('Competitors taking high-margin quote requests with direct online booking');
  } else if (gaps.includes('No GMB') || lead.gmb_status === 'No GMB') {
    objective = `Introduce MCA's Fast-Start Local Verification package to claim and establish ${businessName}'s Google Business Profile before competitors dominate the service radius.`;
    primaryOpp = 'Google Business Profile launch & initial 5-star citation setup';
    painPoints.push('Invisible on Google Maps and Local Pack for searches in ' + city);
    painPoints.push('Unclaimed reputation and review opportunities in territory');
  } else {
    painPoints.push('Opportunity to climb into top 3 Google Map Pack spots for commercial and residential searches');
    painPoints.push('Missing retargeting pixel to capture repeat visitors and estimate requests');
  }

  painPoints.push('Need for predictable, high-ticket inbound job flow without relying entirely on word-of-mouth');

  const discoveryQuestions = [
    `How are you currently generating most of your new ${niche} jobs in ${city}?`,
    `Are you actively investing in local SEO or Google Ads to drive inbound calls?`,
    `Who currently manages your website and online marketing footprint?`,
    `If you could add 3 to 5 additional high-margin projects each month, does your crew have the capacity?`,
  ];

  const knownObjections = [
    {
      objection: 'We already have someone doing our marketing.',
      counter: "That makes sense. I'm not looking to disrupt something that's working. Out of curiosity, are you completely satisfied with the number of exclusive inbound calls you're getting from local search, or is there still room for improvement?",
    },
    {
      objection: "We're too busy right now / booked out.",
      counter: "That's honestly the best time to establish your brand. By dialing in your search presence now, you get to cherry-pick higher-margin commercial and residential projects instead of taking whatever comes in.",
    },
    {
      objection: 'Send me an email with information.',
      counter: "I'd be glad to send over a concise 2-minute digital audit showing the exact keywords you're missing in " + city + ". Would this phone number or your primary email be best to send that to?",
    },
    {
      objection: 'How much does this cost?',
      counter: `Our local growth retainers are tailored to your territory and typically range around $${lead.estimated_retainer || 2000}/month with no long-term lock-in. Just one or two closed ${niche} jobs typically covers the entire investment.`,
    },
    {
      objection: 'Are you an AI?',
      counter: 'Yes, I am Sophia, an AI sales representative calling on behalf of Marketing Charm Agency. I was reviewing local search rankings in ' + city + ' and noticed an opportunity for ' + businessName + '.',
    },
  ];

  return {
    objective,
    primary_opportunity: primaryOpp,
    pain_points: painPoints.slice(0, 4),
    discovery_questions: discoveryQuestions,
    value_angle: `Marketing Charm Agency provides turn-key digital visibility, Google Map Pack rank acceleration, and high-converting quote funnels for ${city} ${niche} businesses.`,
    call_to_action: 'Arrange a 10-minute digital audit review or send a customized 2-page competitive teardown via email.',
    known_objections: knownObjections,
    target_goal: 'Agreement to receive a tailored digital audit via email or schedule a 15-minute consultation.',
    verified_context: {
      business_name: businessName,
      contact_name: lead.contact_name,
      industry: niche,
      location: `${city}, ${lead.state || 'OR'}`,
      gmb_status: lead.gmb_status || 'Unverified',
      rating: lead.gmb_rating,
      reviews: lead.gmb_review_count,
      recommended_service: primaryService,
      estimated_retainer: lead.estimated_retainer || 2000,
      known_gaps: gaps,
    },
  };
}

// Fallback dynamic turn simulator
function generateSimulatedConversationTurn(
  lead: Lead,
  turns: SophiaCallTurn[],
  userUtterance?: string
): { reply: string; intent?: string; event_note?: string } {
  const businessName = lead.business_name || 'your company';
  const niche = lead.niche || 'contractor';
  const city = lead.city || 'Portland';
  const u = (userUtterance || '').toLowerCase();

  // If prospect asks "Are you an AI?"
  if (u.includes('ai') || u.includes('robot') || u.includes('automated') || u.includes('bot') || u.includes('computer')) {
    return {
      reply: `Yes, I am an AI sales representative calling on behalf of Marketing Charm Agency. I'm reaching out because we conducted an audit of ${niche} businesses in ${city} and noticed an opportunity to expand your local search visibility. Did I catch you at an okay time for a brief 60-second chat?`,
      intent: 'Question',
      event_note: 'Prospect asked if Sophia is AI; Sophia answered honestly and confirmed agency identity.',
    };
  }

  // Do not contact / stop
  if (u.includes('do not call') || u.includes('remove') || u.includes('stop calling') || u.includes('not interested') && u.includes('ever')) {
    return {
      reply: `Understood completely. I will update our records right now so you won't receive any further outreach from us. Thank you for your time, and have a great rest of your day.`,
      intent: 'Do Not Contact',
      event_note: 'Prospect requested Do Not Contact. Sophia acknowledged and concluded politely.',
    };
  }

  // Objections
  if (u.includes('already have') || u.includes('another agency') || u.includes('someone handling')) {
    return {
      reply: `That makes sense, and it's great that you're proactive. We aren't looking to disrupt anything working well. Out of curiosity, are you completely satisfied with the volume of exclusive calls you get from Google Maps, or is there room to capture more high-margin jobs?`,
      intent: 'Already Has Agency',
      event_note: 'Sophia acknowledged existing agency without arguing and probed for local search satisfaction.',
    };
  }

  if (u.includes('too busy') || u.includes('booked out') || u.includes('no time')) {
    return {
      reply: `I completely respect that you're in the field. That's why I'll keep this under a minute. Would it be easier if I simply sent you a short 2-minute video audit of ${businessName}'s Google visibility so you can review it on your own time?`,
      intent: 'Busy',
      event_note: 'Prospect indicated they are busy. Sophia pivoted to a low-friction asynchronous audit.',
    };
  }

  if (u.includes('send') && (u.includes('email') || u.includes('info') || u.includes('audit'))) {
    return {
      reply: `I'd be glad to send that over. What is the best email address to send the audit to, and who should I mark it attention to?`,
      intent: 'Wants Follow-Up',
      event_note: 'Prospect requested information via email. Sophia asked for preferred recipient details.',
    };
  }

  if (u.includes('cost') || u.includes('price') || u.includes('pricing') || u.includes('how much')) {
    return {
      reply: `Our client retainers for ${niche} companies in Oregon typically range around $${lead.estimated_retainer || 2000} a month with no long-term lock-in. Just one or two closed jobs usually covers the entire fee. Would you be open to taking a look at our keyword audit first?`,
      intent: 'Price Concern',
      event_note: 'Prospect asked about pricing. Sophia quoted verified estimate and tied it to job ROI.',
    };
  }

  if (turns.length <= 1) {
    return {
      reply: `Hi, this is Sophia calling from Marketing Charm Agency. I'll keep this very brief — did I catch you at an okay time?`,
      intent: 'Neutral',
      event_note: 'Sophia introduced herself and requested permission to speak briefly.',
    };
  }

  return {
    reply: `I was reviewing ${niche} providers in ${city} and noticed ${businessName} has strong potential to capture top-3 Google Map Pack positions. How are you currently generating most of your new customer inquiries?`,
    intent: 'Interested',
    event_note: 'Sophia shared relevance based on verified data and asked a discovery question.',
  };
}

// Fallback post-call analysis
function generateDeterministicCallAnalysis(
  lead: Lead,
  turns: SophiaCallTurn[],
  duration: number
): SophiaCallAnalysis {
  const businessName = lead.business_name || 'Business';
  const text = turns.map((t) => t.message.toLowerCase()).join(' ');

  let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
  let interest_level: 'Hot' | 'Warm' | 'Cold' = 'Warm';
  let primary_objection: string | undefined = undefined;

  if (text.includes('stop') || text.includes('do not call') || text.includes('not interested')) {
    sentiment = 'Negative';
    interest_level = 'Cold';
    primary_objection = text.includes('do not call') ? 'Requested Do Not Contact' : 'Not interested in marketing services';
  } else if (text.includes('send') || text.includes('sure') || text.includes('sounds good') || text.includes('yes') || text.includes('email')) {
    sentiment = 'Positive';
    interest_level = 'Hot';
  }

  if (text.includes('already have') || text.includes('agency')) {
    primary_objection = 'Already working with another agency';
  } else if (text.includes('too busy') || text.includes('booked')) {
    primary_objection = 'Currently at capacity / busy in the field';
  } else if (text.includes('cost') || text.includes('price')) {
    primary_objection = 'Inquired about cost / budget sensitivity';
  }

  const keyInsights: string[] = [
    `Spoke regarding ${lead.niche || 'contractor'} digital presence in ${lead.city || 'Oregon'}.`,
    duration > 30 ? `Call lasted ${Math.round(duration)} seconds with active engagement.` : `Brief contact attempt.`,
  ];

  if (interest_level === 'Hot') {
    keyInsights.push('Prospect expressed willingness to review digital audit materials.');
  }

  const crmNotes = `AI Call Summary (Generated by Sophia AI):
Spoke with ${businessName} regarding ${lead.recommended_service || 'local search and website optimization'}.
Duration: ${Math.round(duration)}s.
Prospect Sentiment: ${sentiment}. Interest Level: ${interest_level}.
${primary_objection ? 'Key Objection/Context: ' + primary_objection : 'No major objections raised.'}
Recommended Follow-up: Send personalized digital audit and verify receipt.`;

  return {
    summary: `Conducted outbound AI call to ${businessName}. Prospect showed ${sentiment.toLowerCase()} engagement regarding local visibility opportunities.`,
    sentiment,
    interest_level,
    primary_objection,
    key_insights: keyInsights,
    promised_follow_up: interest_level === 'Hot' ? 'Send personalized website and local search audit via email.' : undefined,
    recommended_next_action: {
      action: interest_level === 'Cold' && primary_objection?.includes('Do Not Contact')
        ? 'Mark opted out and suppress future communications'
        : 'Send personalized digital audit via email within 24 hours',
      priority: interest_level === 'Hot' ? 'High' : 'Medium',
      suggested_channel: 'Email',
      suggested_timing: 'Within 24 hours',
    },
    crm_notes: crmNotes,
    pipeline_stage_recommendation: interest_level === 'Hot' ? 'Contacted' : undefined,
  };
}

// Export singleton instance of AIService
export const AIService: AIServiceProvider = new GeminiProvider();
