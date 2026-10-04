/**
 * bulkAICallService — places Sophia AI calls through the Python backend
 * (Telnyx + Kokoro TTS), one lead at a time, and waits until each call ends.
 *
 * This mirrors what SophiaAICallModal does for a single call:
 *   POST {API_BASE}/api/outbound/call          -> { callControlId }
 *   GET  {API_BASE}/api/call/{cid}/status      -> { status, ended?, outcome?, reason? }
 *   POST {API_BASE}/api/hangup                 -> { callControlId }
 *
 * The Python backend posts the finished call to the web app itself
 * (WEBAPP_CALLBACK_URL -> /api/call-webhook), so nothing is saved from here.
 */

import type { Lead } from '../types';

export const AI_BACKEND_URL: string =
  (import.meta as any).env?.VITE_AI_BACKEND_URL || 'http://localhost:8000';

const POLL_MS = 2000;
const MAX_CALL_MS = 10 * 60 * 1000;      // hard cap per call, then hang up
const MAX_POLL_ERRORS = 8;               // consecutive network errors before giving up
const MAX_NOT_FOUND = 3;                 // 404s in a row => backend forgot the call => ended
const HEALTH_TIMEOUT_MS = 6000;

// Same sets the single-call modal uses
const ENDED_STATUSES = new Set([
  'ended', 'completed', 'hangup', 'failed', 'no_answer', 'voicemail', 'busy', 'cancelled', 'canceled',
]);

export interface BulkCallResult {
  success: boolean;
  error?: string;
  outcome?: string;
  callControlId?: string;
  /** True only when a real person spoke (not voicemail / no answer / short ring-out). */
  connected?: boolean;
  voicemail?: boolean;
  /** Number of spoken turns from the prospect (voicemail greetings excluded). */
  prospectTurns?: number;
  durationSec?: number;
}

// Same detector the single-call modal uses for answering machines / voicemail greetings
const VOICEMAIL_RX =
  /you('| a)re trying to reach|you have reached|at the tone|after the (tone|beep)|record your message|leave (a|your) message|voice ?mail|mailbox|can'?t take your call|cannot take your call|unable to take your call|not been set up|hasn'?t been set up/i;

type RemoteTurn = { role: string; content: string };

/** Mirrors SophiaAICallModal.handleEndCall classification. */
function classify(turns: RemoteTurn[], outcome: string, reason: string, durationSec: number) {
  const hint = `${outcome} ${reason}`.toLowerCase();
  const prospect = turns.filter((t) => t.role !== 'assistant');
  const heardVoicemail =
    /voice ?mail|machine|answering/.test(hint) || prospect.some((t) => VOICEMAIL_RX.test(t.content || ''));
  const human = prospect.filter((t) => !VOICEMAIL_RX.test(t.content || ''));
  const connected = human.length > 0 && !/voice ?mail|machine/.test(hint);
  return { connected, voicemail: heardVoicemail && !connected, prospectTurns: human.length, durationSec };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Sleep that wakes early when the signal aborts. */
function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const t = setTimeout(done, ms);
    function done() {
      signal?.removeEventListener('abort', done);
      clearTimeout(t);
      resolve();
    }
    signal?.addEventListener('abort', done);
  });
}

/**
 * Fail fast, once, before the queue starts — instead of failing every lead the same way.
 * Any HTTP response (even 404) proves the server is reachable; only a network error fails.
 */
export async function checkAIBackend(): Promise<{ ok: boolean; error?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT_MS);
  try {
    await fetch(`${AI_BACKEND_URL}/health`, { signal: ctrl.signal });
    return { ok: true };
  } catch (e: any) {
    const isLocalDefault = AI_BACKEND_URL.includes('localhost') || AI_BACKEND_URL.includes('127.0.0.1');
    const hints: string[] = [];
    if (isLocalDefault) {
      hints.push('VITE_AI_BACKEND_URL is not set (defaulting to localhost:8000), so the browser is calling your own machine. Set it at build time to the Python server URL.');
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && AI_BACKEND_URL.startsWith('http:')) {
      hints.push('The app is on https but the Python server is http — the browser blocks this (mixed content).');
    }
    hints.push('Otherwise the server is down or CORS is not allowing this origin.');
    return {
      ok: false,
      error: `AI call server unreachable at ${AI_BACKEND_URL} (${e?.name === 'AbortError' ? 'timed out' : e?.message || 'network error'}). ${hints.join(' ')}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function hangup(callControlId: string): Promise<void> {
  try {
    await fetch(`${AI_BACKEND_URL}/api/hangup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callControlId }),
    });
  } catch {
    /* best effort */
  }
}

/** Place one AI call and block until it ends (or is cancelled / times out). */
export async function runAICall(lead: Lead, signal?: AbortSignal): Promise<BulkCallResult> {
  if (!lead.phone) return { success: false, error: 'No phone number' };
  if (signal?.aborted) return { success: false, error: 'Cancelled' };

  // ── 1. Place the call ────────────────────────────────────────────────
  let callControlId: string | undefined;
  try {
    const res = await fetch(`${AI_BACKEND_URL}/api/outbound/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        leadId: lead.lead_id,
        leadName: lead.business_name,
        leadPhone: lead.phone,
        agentName: 'Sophia',
        businessType: lead.niche || '',
        location: `${lead.city || ''}, ${lead.state || ''}`,
        retainer: `$${lead.estimated_retainer || 2400}/mo`,
        leadScore: lead.lead_score || 0,
        pipelineStage: lead.pipeline_stage || 'New Lead',
        callObjective: 'Qualify and book a discovery call',
        primaryCTA: 'Schedule 15-min discovery call',
        opportunity: lead.opportunity_angle || lead.recommended_service || '',
        painPoints: [],
        discoveryQuestions: [],
        objectionHandlers: {},
      }),
    });

    if (!res.ok) {
      // Surface the Python error body (FastAPI puts the reason in `detail`)
      const body = (await res.text().catch(() => '')).slice(0, 300);
      return { success: false, error: `Backend ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}` };
    }

    const data = await res.json().catch(() => ({} as any));
    callControlId = data.callControlId || data.call_control_id;
    if (!callControlId) {
      return { success: false, error: `Backend accepted the call but returned no callControlId: ${JSON.stringify(data).slice(0, 200)}` };
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return { success: false, error: 'Cancelled' };
    return { success: false, error: `Could not reach AI call server: ${e?.message || e}` };
  }

  // ── 2. Wait for it to end ────────────────────────────────────────────
  const startedAt = Date.now();
  let notFound = 0;
  let pollErrors = 0;
  let lastTurns: RemoteTurn[] = [];
  const finish = (base: BulkCallResult, reason = ''): BulkCallResult => ({
    ...base,
    ...classify(lastTurns, base.outcome || '', reason, Math.round((Date.now() - startedAt) / 1000)),
  });

  while (true) {
    if (signal?.aborted) {
      await hangup(callControlId);
      return { success: false, error: 'Cancelled', callControlId };
    }
    if (Date.now() - startedAt > MAX_CALL_MS) {
      await hangup(callControlId);
      return { success: false, error: 'Call exceeded max duration — hung up', callControlId };
    }

    await abortableSleep(POLL_MS, signal);
    if (signal?.aborted) continue; // loop top handles hangup

    try {
      const r = await fetch(`${AI_BACKEND_URL}/api/call/${callControlId}/status`, { signal });

      if (r.status === 404) {
        // Backend already cleaned the call up => it is over
        if (++notFound >= MAX_NOT_FOUND) return finish({ success: true, outcome: 'call_not_found', callControlId });
        continue;
      }
      notFound = 0;
      if (!r.ok) {
        if (++pollErrors >= MAX_POLL_ERRORS) {
          return { success: false, error: `Status endpoint kept returning ${r.status}`, callControlId };
        }
        continue;
      }
      pollErrors = 0;

      const d = await r.json();
      const status = String(d.status || '').toLowerCase();
      // Keep the freshest transcript (same rule as the modal: only overwrite when non-empty)
      if (Array.isArray(d.turns) && d.turns.length > 0) lastTurns = d.turns;
      if (ENDED_STATUSES.has(status) || d.ended === true) {
        const outcome = String(d.outcome || status);
        if (status === 'failed') {
          return { success: false, error: d.reason ? `Call failed: ${d.reason}` : 'Call failed', outcome, callControlId };
        }
        return finish({ success: true, outcome, callControlId }, d.reason ? String(d.reason) : '');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') continue;
      if (++pollErrors >= MAX_POLL_ERRORS) {
        return { success: false, error: `Lost contact with AI call server: ${e?.message || e}`, callControlId };
      }
    }
  }
}

/** Short pause between calls so the carrier/backend isn't hammered. */
export const INTER_CALL_PAUSE_MS = 3000;
export { sleep as bulkSleep };
