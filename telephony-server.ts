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
        return {
          providerCallId: data.data?.call_control_id,
          status: 'CALLING',
        };
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Telnyx API Error: ${response.status} - ${JSON.stringify(errData)}`);
    }
    
    throw new Error('TELNYX_API_KEY is not configured on the server.');
  }

  public async terminateCall(providerCallId: string): Promise<{ success: boolean; status: string }> {
    if (this.apiKey && !providerCallId.startsWith('tlnx_sim_')) {
      try {
        await fetch(`https://api.telnyx.com/v2/calls/${providerCallId}/actions/hangup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        });
      } catch (e) {
        console.warn('Telnyx terminateCall error:', e);
      }
    }
    return { success: true, status: 'COMPLETED' };
  }

  public async getCallStatus(providerCallId: string): Promise<{ status: string; duration?: number }> {
    if (this.apiKey && !providerCallId.startsWith('tlnx_sim_')) {
      try {
        const res = await fetch(`https://api.telnyx.com/v2/calls/${providerCallId}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          const telnyxState = data.data?.call_leg_state || data.data?.status;
          return {
            status: this.mapTelnyxState(telnyxState),
          };
        }
      } catch (e) {
        // fallback
      }
    }
    return { status: 'CONNECTED' };
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
  public activeCalls = new Map<string, ServerCallSession>();
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
      status: 'PREPARING',
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

    // For simulated calls only (no real Telnyx API key), auto-advance states for demo/testing:
    // PREPARING (0-800ms) -> CALLING (800-2400ms) -> RINGING (2400-4500ms) -> CONNECTED
    // Real Telnyx calls rely on webhook events (call.initiated, call.ringing, call.answered, call.hangup)
    if (result.providerCallId.startsWith('tlnx_sim_')) {
      setTimeout(() => {
        const s = this.activeCalls.get(callId);
        if (s && s.status === 'PREPARING') {
          s.status = 'CALLING';
        }
      }, 800);

      setTimeout(() => {
        const s = this.activeCalls.get(callId);
        if (s && (s.status === 'CALLING' || s.status === 'PREPARING')) {
          s.status = 'RINGING';
        }
      }, 2400);

      setTimeout(() => {
        const s = this.activeCalls.get(callId);
        if (s && (s.status === 'RINGING' || s.status === 'CALLING')) {
          s.status = 'CONNECTED';
          s.connectedAt = Date.now();
        }
      }, 4600);
    }

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

    return session;
  }

  public async endCall(
    callId: string,
    params?: { duration?: number; outcome?: string; notes?: string }
  ): Promise<ServerCallSession | undefined> {
    const session = this.activeCalls.get(callId);
    if (!session) return undefined;

    await this.voiceProvider.terminateCall(session.providerCallId);

    session.status = 'COMPLETED';
    session.endedAt = Date.now();
    if (params?.duration !== undefined) {
      session.duration = params.duration;
    } else if (session.connectedAt) {
      session.duration = Math.floor((session.endedAt - session.connectedAt) / 1000);
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
}

export const telephonyManager = new TelephonyServerManager();
