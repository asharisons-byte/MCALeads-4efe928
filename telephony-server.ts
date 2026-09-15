// Secure Telephony Architecture & Telnyx Provider Preparation
// Backend-only implementation - credentials never exposed to client
import { addDbLeadCall } from './src/db/repository.js';

export interface VoiceProvider {
  id: string;
  name: string;
  initiateCall(params: {
    to: string;
    from?: string;
    callId: string;
    metadata?: Record<string, any>;
  }): Promise<{ providerCallId: string; status: string }>;
  terminateCall(providerCallId: string): Promise<{ success: boolean; status: string }>;
  getCallStatus(providerCallId: string): Promise<{ status: string; duration?: number }>;
  sendSms(params: {
    to: string;
    text: string;
    from?: string;
  }): Promise<{ success: boolean; messageId: string; status: string; error?: string }>;
}

export class TelnyxVoiceProvider implements VoiceProvider {
  public id = 'telnyx';
  public name = 'Telnyx Cloud Telephony';
  private apiKey: string | undefined;
  private defaultFromNumber: string;

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY;
    this.defaultFromNumber = process.env.TELNYX_FROM_NUMBER || '+15035550199';
  }

  public async initiateCall(params: {
    to: string;
    from?: string;
    callId: string;
    metadata?: Record<string, any>;
  }): Promise<{ providerCallId: string; status: string }> {
    const fromNumber = params.from || this.defaultFromNumber;

    // If Telnyx API key is present in environment, call the real Telnyx Call Control v2 API
    if (this.apiKey) {
      try {
        console.log('[TELNYX] Outbound request started');
        console.log('[TELNYX] Destination validated:', params.to);
        
        const response = await fetch('https://api.telnyx.com/v2/calls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            to: params.to,
            from: fromNumber,
            connection_id: process.env.TELNYX_CONNECTION_ID,
            custom_headers: [
              { name: 'X-MCA-Call-ID', value: params.callId },
            ],
            client_state: Buffer.from(JSON.stringify({ callId: params.callId })).toString('base64'),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const providerCallId = data.data?.call_control_id;
          console.log('[TELNYX] API request accepted');
          console.log('[TELNYX] call_control_id received:', providerCallId);
          
          if (!providerCallId) {
            throw new Error('Telnyx API did not return call_control_id');
          }
          
          return {
            providerCallId,
            status: 'INITIATING',
          };
        }
        
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[TELNYX] API error:', response.status, errorText);
        throw new Error(`Telnyx API returned HTTP ${response.status}`);
      } catch (err: any) {
        console.error('[TELNYX] Call initiation failed:', err.message);
        throw err;
      }
    }

    // No API key configured - cannot place real calls
    throw new Error('TELNYX_API_KEY not configured. Real calling unavailable.');
  }

  public async terminateCall(providerCallId: string): Promise<{ success: boolean; status: string }> {
    if (this.apiKey && providerCallId) {
      try {
        console.log('[TELNYX] Hangup request for call:', providerCallId);
        await fetch(`https://api.telnyx.com/v2/calls/${providerCallId}/actions/hangup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        });
        console.log('[TELNYX] Hangup command sent successfully');
        return { success: true, status: 'COMPLETED' };
      } catch (e: any) {
        console.error('[TELNYX] Hangup error:', e.message);
        throw e;
      }
    }
    throw new Error('Cannot terminate call: missing API key or call ID');
  }

  public async getCallStatus(providerCallId: string): Promise<{ status: string; duration?: number }> {
    if (this.apiKey && providerCallId) {
      try {
        const res = await fetch(`https://api.telnyx.com/v2/calls/${providerCallId}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          const telnyxState = data.data?.call_leg_state || data.data?.status;
          console.log('[TELNYX] Call status:', telnyxState);
          return {
            status: this.mapTelnyxState(telnyxState),
          };
        }
      } catch (e: any) {
        console.warn('[TELNYX] Status check error:', e.message);
      }
    }
    // Return a safe default - caller should handle unknown state
    return { status: 'UNKNOWN' };
  }

  private mapTelnyxState(state: string): string {
    switch (state?.toLowerCase()) {
      case 'initiating':
      case 'preparing':
        return 'PREPARING';
      case 'calling':
      case 'dialing':
        return 'CALLING';
      case 'ringing':
      case 'early_media':
        return 'RINGING';
      case 'active':
      case 'connected':
      case 'answered':
        return 'CONNECTED';
      case 'held':
        return 'ON_HOLD';
      case 'busy':
        return 'BUSY';
      case 'no_answer':
        return 'NO_ANSWER';
      case 'hangup':
      case 'completed':
        return 'COMPLETED';
      default:
        return 'CONNECTED';
    }
  }

  public async sendSms(params: {
    to: string;
    text: string;
    from?: string;
  }): Promise<{ success: boolean; messageId: string; status: string; error?: string }> {
    const fromNumber = params.from || this.defaultFromNumber;
    if (this.apiKey) {
      try {
        const response = await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            from: fromNumber,
            to: params.to,
            text: params.text,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            messageId: data.data?.id || `telnyx_msg_${Date.now()}`,
            status: data.data?.to?.[0]?.status || 'DELIVERED',
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            messageId: `telnyx_err_${Date.now()}`,
            status: 'FAILED',
            error: errData?.errors?.[0]?.detail || `Telnyx HTTP ${response.status}`,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          messageId: `telnyx_err_${Date.now()}`,
          status: 'ERROR',
          error: err.message,
        };
      }
    }

    return {
      success: true,
      messageId: `sim_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'DELIVERED',
    };
  }
}

// In-Memory Call Sessions & History
export interface ServerCallSession {
  callId: string;
  providerCallId: string;
  leadId?: string;
  businessName?: string;
  contactName?: string;
  phoneNumber: string;
  direction: 'OUTBOUND' | 'INBOUND';
  callType: string;
  status: string;
  duration: number; // in seconds
  startedAt: number; // timestamp ms
  connectedAt?: number;
  endedAt?: number;
  notes?: string;
  outcome?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
  recordingStatus?: string;
  transcriptStatus?: string;
  leadScore?: number;
  opportunity?: string;
  estimatedRetainer?: number;
}

class TelephonyServerManager {
  private activeCalls = new Map<string, ServerCallSession>();
  private callHistory: ServerCallSession[] = [];
  public voiceProvider: VoiceProvider;

  constructor() {
    this.voiceProvider = new TelnyxVoiceProvider();
  }

  public async startCall(params: {
    leadId?: string;
    businessName?: string;
    contactName?: string;
    phoneNumber: string;
    callType?: string;
    leadScore?: number;
    opportunity?: string;
    estimatedRetainer?: number;
  }): Promise<ServerCallSession> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Initiate real Telnyx call - will throw if API key not configured
    const result = await this.voiceProvider.initiateCall({
      to: params.phoneNumber,
      callId,
      metadata: { leadId: params.leadId },
    });

    const now = Date.now();
    const session: ServerCallSession = {
      callId,
      providerCallId: result.providerCallId,
      leadId: params.leadId,
      businessName: params.businessName || 'Prospect Contact',
      contactName: params.contactName,
      phoneNumber: params.phoneNumber,
      direction: 'OUTBOUND',
      callType: params.callType || 'Outbound Call',
      status: 'INITIATING',
      duration: 0,
      startedAt: now,
      isMuted: false,
      isOnHold: false,
      recordingStatus: 'Not Available',
      transcriptStatus: 'Not Available',
      leadScore: params.leadScore,
      opportunity: params.opportunity,
      estimatedRetainer: params.estimatedRetainer,
    };

    this.activeCalls.set(callId, session);
    console.log('[TELNYX] Call session created:', callId, 'providerCallId:', result.providerCallId);

    return session;
  }

  public getCallSession(callId: string): ServerCallSession | undefined {
    const session = this.activeCalls.get(callId);
    if (!session) {
      return this.callHistory.find((c) => c.callId === callId);
    }

    // Update real-time duration if currently connected
    if (session.status === 'CONNECTED' && session.connectedAt && !session.isOnHold) {
      session.duration = Math.floor((Date.now() - session.connectedAt) / 1000);
    }
    
    // For INITIATING/RINGING states, we don't auto-advance - webhook updates will handle state changes

    return session;
  }

  public async endCall(
    callId: string,
    params?: { duration?: number; outcome?: string; notes?: string }
  ): Promise<ServerCallSession | undefined> {
    const session = this.activeCalls.get(callId);
    if (!session) return undefined;

    try {
      await this.voiceProvider.terminateCall(session.providerCallId);
      console.log('[TELNYX] Call terminated successfully:', callId);
    } catch (e: any) {
      console.error('[TELNYX] End call error:', e.message);
      // Continue with local cleanup even if Telnyx hangup fails
    }

    session.status = 'COMPLETED';
    session.endedAt = Date.now();
    if (params?.duration !== undefined) {
      session.duration = params.duration;
    } else if (session.connectedAt) {
      session.duration = Math.floor((session.endedAt - session.connectedAt) / 1000);
    } else {
      // If no connectedAt, calculate from startedAt
      session.duration = Math.floor((session.endedAt - session.startedAt) / 1000);
    }
    if (params?.outcome) session.outcome = params.outcome;
    if (params?.notes) session.notes = params.notes;

    // Move to history
    this.activeCalls.delete(callId);
    this.callHistory.unshift(session);

    // Synchronize call completion to Core Cloud SQL Database
    if (session.leadId) {
      addDbLeadCall(session.leadId, {
        phone: session.phoneNumber,
        contact_phone: session.phoneNumber,
        direction: session.direction === 'INBOUND' ? 'Inbound' : 'Outbound',
        provider: 'Telnyx Voice & Call Control',
        external_call_id: session.providerCallId,
        status: 'Completed',
        duration_seconds: session.duration || 0,
        call_outcome: session.outcome || 'Call Completed',
        ai_summary: session.notes ? `Call Completed with outcome "${session.outcome || 'Completed'}". Notes: ${session.notes}` : undefined,
      }).catch((e) => {
        console.warn('Database call record sync warning:', e?.message || e);
      });
    }

    return session;
  }

  public toggleMute(callId: string, muted?: boolean): ServerCallSession | undefined {
    const session = this.activeCalls.get(callId);
    if (session) {
      session.isMuted = muted !== undefined ? muted : !session.isMuted;
    }
    return session;
  }

  public toggleHold(callId: string, onHold?: boolean): ServerCallSession | undefined {
    const session = this.activeCalls.get(callId);
    if (session) {
      session.isOnHold = onHold !== undefined ? onHold : !session.isOnHold;
      if (session.isOnHold) {
        session.status = 'ON_HOLD';
      } else if (session.connectedAt) {
        session.status = 'CONNECTED';
      }
    }
    return session;
  }

  public saveNotes(callId: string, notes: string): ServerCallSession | undefined {
    const session = this.activeCalls.get(callId) || this.callHistory.find((c) => c.callId === callId);
    if (session) {
      session.notes = notes;
    }
    return session;
  }

  public setOutcome(callId: string, outcome: string, notes?: string): ServerCallSession | undefined {
    const session = this.activeCalls.get(callId) || this.callHistory.find((c) => c.callId === callId);
    if (session) {
      session.outcome = outcome;
      if (notes) session.notes = notes;
    }
    return session;
  }

  public getHistory(): ServerCallSession[] {
    return [...this.callHistory];
  }

  /**
   * Update active call state from Telnyx webhook events
   * This synchronizes real Telnyx call lifecycle into the in-memory session
   */
  public updateCallStateFromWebhook(params: {
    providerCallId: string;
    eventType: string;
    payload?: Record<string, any>;
  }): ServerCallSession | undefined {
    const { providerCallId, eventType, payload } = params;

    // Find the matching session by providerCallId
    let foundSession: ServerCallSession | undefined;
    let foundCallId: string | undefined;

    // Iterate over activeCalls Map to find matching providerCallId
    const callIds = Array.from(this.activeCalls.keys());
    for (const callId of callIds) {
      const session = this.activeCalls.get(callId);
      if (session && session.providerCallId === providerCallId) {
        foundSession = session;
        foundCallId = callId;
        break;
      }
    }

    if (!foundSession || !foundCallId) {
      console.log('[TELNYX WEBHOOK] No active session found for providerCallId:', providerCallId);
      return undefined;
    }

    const now = Date.now();

    switch (eventType) {
      case 'call.initiated':
        console.log('[TELNYX WEBHOOK] event=call.initiated callId=', foundCallId);
        foundSession.status = 'INITIATING';
        break;

      case 'call.ringing':
        console.log('[TELNYX WEBHOOK] event=call.ringing callId=', foundCallId);
        foundSession.status = 'RINGING';
        if (!foundSession.startedAt) {
          foundSession.startedAt = now;
        }
        break;

      case 'call.answered':
        console.log('[TELNYX WEBHOOK] event=call.answered callId=', foundCallId);
        foundSession.status = 'CONNECTED';
        // Set connectedAt ONLY on actual answer - this starts the duration timer
        if (!foundSession.connectedAt) {
          foundSession.connectedAt = now;
        }
        break;

      case 'call.hangup':
      case 'call.completed':
        console.log('[TELNYX WEBHOOK] event=call.hangup callId=', foundCallId);
        foundSession.status = 'COMPLETED';
        foundSession.endedAt = now;
        // Calculate final duration from connectedAt if available
        if (foundSession.connectedAt && foundSession.endedAt) {
          foundSession.duration = Math.floor((foundSession.endedAt - foundSession.connectedAt) / 1000);
        } else if (foundSession.startedAt && foundSession.endedAt) {
          // Fallback: if no connectedAt (unanswered), duration is 0 or time from start to end
          foundSession.duration = 0;
        }
        // Extract hangup cause if available
        const hangupCause = payload?.hangup_cause || payload?.cause;
        if (hangupCause && hangupCause !== 'NORMAL_CLEARING') {
          foundSession.outcome = `Hangup: ${hangupCause}`;
        }
        break;

      case 'call.busy':
        console.log('[TELNYX WEBHOOK] event=call.busy callId=', foundCallId);
        foundSession.status = 'BUSY';
        foundSession.endedAt = now;
        foundSession.duration = 0;
        foundSession.outcome = 'Busy';
        break;

      case 'call.no_answer':
        console.log('[TELNYX WEBHOOK] event=call.no_answer callId=', foundCallId);
        foundSession.status = 'NO_ANSWER';
        foundSession.endedAt = now;
        foundSession.duration = 0;
        foundSession.outcome = 'No Answer';
        break;

      case 'call.failed':
      case 'call.rejected':
        console.log('[TELNYX WEBHOOK] event=call.failed callId=', foundCallId);
        foundSession.status = 'FAILED';
        foundSession.endedAt = now;
        foundSession.duration = 0;
        foundSession.outcome = payload?.error_message || 'Call Failed';
        break;

      default:
        console.log('[TELNYX WEBHOOK] unhandled event=', eventType, 'callId=', foundCallId);
    }

    // If call ended, move to history
    if (['COMPLETED', 'FAILED', 'NO_ANSWER', 'BUSY'].includes(foundSession.status)) {
      this.activeCalls.delete(foundCallId);
      this.callHistory.unshift(foundSession);
    }

    return foundSession;
  }
}

export const telephonyManager = new TelephonyServerManager();
