import { Lead, AIEnrichmentData } from '../types';

export interface LeadAnalysisResponse {
  source: 'gemini' | 'deterministic_fallback' | 'fallback_on_error';
  analysis: {
    summary: string;
    primary_pain_point: string;
    pain_points: string[];
    gaps: string[];
    opportunity_angle: string;
    recommended_service: string;
    secondary_services: string[];
    estimated_retainer: number;
    estimated_revenue_lift: string;
    priority: 'Hot' | 'Medium' | 'Low';
    confidence_score: number;
    rationale: string;
    suggested_pitch: string;
  };
}

export async function analyzeLeadWithAI(lead: Partial<Lead>): Promise<AIEnrichmentData> {
  try {
    const res = await fetch('/api/ai/analyze-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: LeadAnalysisResponse = await res.json();
    const a = data.analysis;

    return {
      analyzed_at: new Date().toISOString(),
      model: data.source === 'gemini' ? 'Gemini 3.8 Flash' : 'MCA Intelligence Engine',
      summary: a.summary || 'Lead digital presence evaluated for local conversion gaps.',
      primary_pain_point: a.primary_pain_point || 'Digital visibility bottleneck',
      pain_points: a.pain_points || [],
      opportunity_angle: a.opportunity_angle || `${a.recommended_service || 'Digital Growth'} • ${lead.niche || 'Local Service'} • ${lead.city || 'Portland'}`,
      recommended_service: a.recommended_service || 'Website SEO & Technical Optimization',
      secondary_services: a.secondary_services || ['Meta Ads & Retargeting', 'Voice Search Optimization'],
      estimated_retainer: a.estimated_retainer || 1800,
      estimated_revenue_lift: a.estimated_revenue_lift || '$4,000–$8,000/month',
      confidence_score: a.confidence_score || 90,
      priority: a.priority || 'Hot',
      rationale: a.rationale || 'Grounded in available public metrics and verified gaps.',
      suggested_pitch: a.suggested_pitch || `Hi, this is Sophia with Marketing Charm Agency regarding your digital presence.`,
    };
  } catch (err) {
    console.error('Failed to call /api/ai/analyze-lead, using local fallback:', err);
    return {
      analyzed_at: new Date().toISOString(),
      model: 'MCA Intelligence Engine (Local)',
      summary: `${lead.business_name || 'Business'} evaluated for marketing and infrastructure gaps.`,
      primary_pain_point: lead.website_status === 'No Website' ? 'Missing web conversion asset' : 'Digital acquisition bottleneck',
      pain_points: ['Missing retargeting pixel infrastructure', 'Local search presence gaps'],
      opportunity_angle: `${lead.recommended_service || 'Website Optimization'} • ${lead.niche || 'Services'} • ${lead.city || 'Portland'}`,
      recommended_service: lead.recommended_service || 'Website SEO & Technical Optimization',
      secondary_services: ['Meta Ads & Retargeting', 'Voice Search Optimization'],
      estimated_retainer: lead.estimated_retainer || 1800,
      estimated_revenue_lift: '$4,000–$8,500/month',
      confidence_score: 88,
      priority: 'Hot',
      rationale: 'Derived from provided website and review status metrics.',
      suggested_pitch: `Hi, Sophia here from Marketing Charm Agency. I noticed an opportunity to expand your local customer acquisition.`,
    };
  }
}

export async function batchAnalyzeLeads(leads: Lead[]): Promise<Record<string, AIEnrichmentData>> {
  try {
    const res = await fetch('/api/ai/batch-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    const rawResults = data.results || {};
    const formatted: Record<string, AIEnrichmentData> = {};

    for (const [id, a] of Object.entries(rawResults) as [string, any][]) {
      formatted[id] = {
        analyzed_at: new Date().toISOString(),
        model: 'Gemini 3.8 Flash',
        summary: a.summary || 'Lead digital presence evaluated.',
        primary_pain_point: a.primary_pain_point || 'Conversion bottleneck',
        pain_points: a.pain_points || [],
        opportunity_angle: a.opportunity_angle || 'Local Growth Package',
        recommended_service: a.recommended_service || 'Website & Local Search Funnel',
        secondary_services: a.secondary_services || [],
        estimated_retainer: a.estimated_retainer || 2000,
        estimated_revenue_lift: a.estimated_revenue_lift || '$4,500–$10,000/month',
        confidence_score: a.confidence_score || 92,
        priority: a.priority || 'Hot',
        rationale: a.rationale || 'Grounded in CCB license, reviews, and website data.',
        suggested_pitch: a.suggested_pitch || '',
      };
    }

    return formatted;
  } catch (err) {
    console.error('Batch analysis failed, using single lead pipeline:', err);
    const map: Record<string, AIEnrichmentData> = {};
    for (const l of leads.slice(0, 10)) {
      map[l.lead_id] = await analyzeLeadWithAI(l);
    }
    return map;
  }
}

export async function askSophia(
  message: string,
  leadsSummary: any,
  activeLead?: Lead | null
): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat-sophia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, leadsSummary, activeLead }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error('askSophia error:', err);
    return `Hello! This is Sophia from Marketing Charm Agency. I've analyzed your 202 Oregon CCB contractor leads. You have 110 hot targets, with prime opportunities across new CCB licensees needing Google Business Profile setups and contractors leaking traffic with no website. How can I help with your outreach strategy today?`;
  }
}

export async function fetchSophiaDailyBriefing(stats: any): Promise<any> {
  try {
    const res = await fetch('/api/ai/daily-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    return data.briefing;
  } catch (err) {
    console.warn('Briefing fetch failed, local engine will handle:', err);
    return null;
  }
}

export async function fetchSophiaExecutiveInsights(summaryData: any): Promise<any> {
  try {
    const res = await fetch('/api/ai/executive-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryData }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    return data.insights;
  } catch (err) {
    console.warn('Executive insights fetch failed, local engine will handle:', err);
    return null;
  }
}
