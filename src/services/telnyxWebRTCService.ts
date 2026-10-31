import { TelnyxRTC } from '@telnyx/webrtc';
import { getAuthoritativeFromNumber, TELNYX_CONSTANTS } from '../config/telnyxConfig';

function extractTelnyxError(error: any): { message: string; code: string } {
  if (!error) {
    return { message: 'WebRTC connection failed', code: 'N/A' };
  }
  if (typeof error === 'string') {
    return { message: error, code: 'N/A' };
  }

  const code = String(
    error.code ||
    error.error?.code ||
    error.causeCode ||
    error.error?.causeCode ||
    error.sipCode ||
    error.sip_code ||
    'N/A'
  );

  const rawMsg =
    error.error?.message ||
    error.error?.detail ||
    error.error?.reason ||
    error.message ||
    error.detail ||
    error.reason ||
    (typeof error.error === 'string' ? error.error : null);

  const message = rawMsg || (code !== 'N/A' ? `WebRTC error (code: ${code})` : 'Telnyx WebRTC authentication or signaling error');

  return { message, code };
}

export const TelnyxWebRTCService = {
  // ── State ────────────────────────────────────────────────────────────────
  client:               null as TelnyxRTC | null,
  currentCall:          null as any | null,
  stateChangeCallback:  null as ((state: string) => void) | null,
  previousState:        null as string | null,
  isInitialized:        false,
  readyPromise:         null as Promise<void> | null,
  resolveReady:         null as (() => void) | null,
  rejectReady:          null as ((e: any) => void) | null,
  tokenExpiry:          0,
  audioRef:             null as HTMLAudioElement | null,
  diagnosticCallback:   null as ((update: any) => void) | null,
  ringbackInterval:     null as ReturnType<typeof setInterval> | null,
  ringbackCtx:          null as any,
  cachedCallerNumber:   null as string | null,
  cachedConnectionId:   null as string | null,
  cachedCredentials:    null as any | null,
  cachedLoginToken:     null as string | null,

  // ── Diagnostic callback ──────────────────────────────────────────────────
  setDiagnosticCallback(cb: (update: any) => void) {
    this.diagnosticCallback = cb;
  },

  // ── Ringback tone (plays while remote phone is ringing) ──────────────────
  startRingback() {
    try {
      if (this.ringbackCtx) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.ringbackCtx = ctx;
      const playBeep = () => {
        try {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 440;
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch (_) {}
      };
      playBeep();
      this.ringbackInterval = setInterval(playBeep, 3000);
    } catch (e) {
      console.warn('[MCA-TELNYX] Ringback audio failed:', e);
    }
  },

  stopRingback() {
    if (this.ringbackInterval) {
      clearInterval(this.ringbackInterval);
      this.ringbackInterval = null;
    }
    if (this.ringbackCtx) {
      this.ringbackCtx.close().catch(() => {});
      this.ringbackCtx = null;
    }
  },

  // ── Attach remote audio stream to <audio> element ───────────────────────
  attachRemoteStream(call: any) {
    try {
      const stream: MediaStream | undefined =
        call.remoteStream ??
        call.options?.remoteStream ??
        call.streams?.[0] ??
        undefined;

      if (!stream) {
        console.warn('[MCA-AUDIO] No remoteStream found on call object. Keys:', Object.keys(call));
        return;
      }

      if (!this.audioRef) {
        console.warn('[MCA-AUDIO] No audioRef to attach stream to');
        return;
      }

      const tracks = stream.getTracks().map(t => `${t.kind}:${t.readyState}`);
      console.log('[MCA-AUDIO] Attaching remoteStream, tracks:', tracks);

      this.audioRef.srcObject = stream;
      this.audioRef.volume    = 1.0;

      this.audioRef.play()
        .then(() => {
          console.log('[MCA-AUDIO] Remote audio playing successfully');
          this.diagnosticCallback?.({ stage: 'call:media-connected' });
        })
        .catch((e) => {
          console.warn('[MCA-AUDIO] play() blocked by autoplay policy, will retry on next click:', e.message);
          const retry = () => {
            this.audioRef?.play().catch(() => {});
            document.removeEventListener('click', retry);
          };
          document.addEventListener('click', retry, { once: true });
        });
    } catch (e) {
      console.error('[MCA-AUDIO] attachRemoteStream error:', e);
    }
  },

  // ── Token fetch & validation ─────────────────────────────────────────────
  async getValidToken() {
    const bufferMs = 60_000;
    if (this.cachedCredentials && Date.now() < this.tokenExpiry - bufferMs) {
      return this.cachedCredentials;
    }

    console.log('[MCA-A] Fetching WebRTC SIP credentials / login token from server...');
    this.diagnosticCallback?.({
      stage: 'token:requested',
      tokenStatus: 'fetching',
    });

    const response = await fetch(`/api/telephony/webrtc/token?t=${Date.now()}`, {
      method: 'GET',
      cache:  'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    });

    console.log('[MCA-B] Token response:', response.status, response.ok);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const errMsg = err.details || err.error || response.statusText || 'Failed to fetch WebRTC credentials';
      this.diagnosticCallback?.({
        stage: 'token:failed',
        tokenStatus: 'failed',
        error: errMsg,
        code: String(response.status),
      });
      throw new Error(`Credentials fetch failed: ${errMsg}`);
    }

    const data = await response.json();
    console.log('[MCA-C] Token payload keys:', Object.keys(data || {}));

    this.diagnosticCallback?.({
      stage: 'token:received',
      tokenStatus: 'received',
    });

    const hasToken = Boolean(data.login_token);
    const hasSip = Boolean(data.sip_username && data.sip_password);

    if (!hasToken && !hasSip) {
      const errMsg = `Empty credentials. Keys received: ${Object.keys(data).join(', ')}`;
      this.diagnosticCallback?.({
        stage: 'token:failed',
        tokenStatus: 'failed',
        error: errMsg,
        code: 'EMPTY_CREDS',
      });
      throw new Error(errMsg);
    }

    // Parse token expiry if JWT is provided
    let calculatedExpiry = Date.now() + 23 * 60 * 60 * 1000;
    if (data.login_token) {
      try {
        const parts = data.login_token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload.exp && typeof payload.exp === 'number') {
            calculatedExpiry = payload.exp * 1000;
          }
        }
      } catch (_) {}
    }
    this.tokenExpiry = calculatedExpiry;

    if (data.caller_number) {
      this.cachedCallerNumber = data.caller_number;
    }
    if (data.connection_id) {
      this.cachedConnectionId = data.connection_id;
    }

    const fetchDate = new Date();
    const expDate = new Date(this.tokenExpiry);
    const hoursRemaining = Math.max(0, Math.round((this.tokenExpiry - Date.now()) / (3600 * 1000)));
    const tokenFetchedStr = `${fetchDate.toLocaleTimeString()} (${fetchDate.toUTCString().slice(17, 22)} UTC)`;
    const tokenExpiresStr = `${expDate.toLocaleTimeString()} (${hoursRemaining}h valid until ${expDate.toLocaleDateString()})`;

    this.diagnosticCallback?.({
      stage: 'token:validated',
      tokenStatus: 'fresh',
      tokenFetched: tokenFetchedStr,
      tokenExpires: tokenExpiresStr,
    });

    const creds = {
      login_token: data.login_token,
      sip_username: data.sip_username,
      sip_password: data.sip_password,
      caller_number: data.caller_number,
      connection_id: data.connection_id,
    };
    this.cachedCredentials = creds;
    this.cachedLoginToken = data.login_token || null;

    console.log('[MCA-E] WebRTC credentials validated OK for:', creds.sip_username || 'JWT token', 'caller:', creds.caller_number);
    return creds;
  },

  // ── Client initialisation ────────────────────────────────────────────────
  async init(audioRef?: HTMLAudioElement) {
    if (audioRef) this.audioRef = audioRef;

    const creds = await this.getValidToken();

    // Tear down any stale client
    if (this.client) {
      try { await this.client.disconnect(); } catch (_) {}
      this.client = null;
    }

    this.isInitialized = true;
    this.readyPromise   = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady  = reject;
    });

    try {
      console.log('[MCA-F] Creating TelnyxRTC client, audioRef present:', !!this.audioRef);
      this.diagnosticCallback?.({
        stage: 'webrtc:client-initialized',
      });

      const rtcOptions: any = { logLevel: 'warn' };
      if (creds.login_token) {
        rtcOptions.login_token = creds.login_token;
      } else {
        rtcOptions.login = creds.sip_username;
        rtcOptions.password = creds.sip_password;
      }

      this.client = new TelnyxRTC(rtcOptions);

      // ── Socket events ──────────────────────────────────────────────────
      this.client.on('telnyx.socket.open', () => {
        console.log('[MCA-H] WebSocket opened');
        this.diagnosticCallback?.({
          stage: 'webrtc:wss:connected',
          wssStatus: 'connected',
        });
        this.diagnosticCallback?.({
          stage: 'sip:registering',
        });
      });

      this.client.on('telnyx.socket.error', (error: any) => {
        const { message, code } = extractTelnyxError(error);
        console.error('[MCA-TELNYX] Socket error:', message, code);
        this.diagnosticCallback?.({
          stage: 'webrtc:wss:failed',
          wssStatus: 'failed',
          error: message,
          code,
        });
        if (this.rejectReady) {
          const err = new Error(`WebSocket error: ${message}`);
          (err as any).code = code;
          this.rejectReady(err);
          this.rejectReady = null;
        }
      });

      this.client.on('telnyx.socket.close', () => {
        console.warn('[MCA-TELNYX] Socket closed');
        this.diagnosticCallback?.({ wssStatus: 'closed' });
      });

      // ── Registration events ────────────────────────────────────────────
      this.client.on('telnyx.ready', () => {
        console.log('[MCA-I] SIP registration complete — telnyx.ready fired');
        this.diagnosticCallback?.({
          stage: 'sip:registered',
          sipRegistered: 'yes',
          error: '',
          code: 'N/A',
        });
        if (this.resolveReady) {
          this.resolveReady();
          this.resolveReady = null;
        }
      });

      this.client.on('telnyx.error', (error: any) => {
        const { message, code } = extractTelnyxError(error);
        console.error('[MCA-TELNYX] SDK error:', message, code);
        this.diagnosticCallback?.({
          stage: 'sip:registration-failed',
          wssStatus: 'failed',
          sipRegistered: 'failed',
          error: message,
          code,
        });
        if (this.rejectReady) {
          const err = new Error(message);
          (err as any).code = code;
          this.rejectReady(err);
          this.rejectReady = null;
        }
      });

      // ── Call notification handler ──────────────────────────────────────
      this.client.on('telnyx.notification', (notification: any) => {
        if (!notification) return;

        console.log('[MCA-NOTIFY]', {
          type:   notification.type,
          state:  notification.call?.state,
          callId: notification.call?.id,
        });

        if (notification.type !== 'callUpdate' || !notification.call) return;

        const state: string     = notification.call.state;
        this.currentCall        = notification.call;

        console.log(`[MCA-STATE] ${state} (was: ${this.previousState})`);

        const terminalStates = ['hangup', 'destroy', 'purge'];
        const activeStates   = ['active', 'answering', 'early'];
        const ringingStates  = ['new', 'requesting', 'ringing', 'recovering'];

        if (activeStates.includes(state)) {
          this.stopRingback();
          this.attachRemoteStream(notification.call);
          this.diagnosticCallback?.({ stage: 'call:answered' });
          this.diagnosticCallback?.({ stage: 'call:media-connected' });
          if (this.stateChangeCallback) this.stateChangeCallback('active');

        } else if (ringingStates.includes(state)) {
          if (state === 'ringing' || state === 'requesting') {
            this.startRingback();
            this.diagnosticCallback?.({ stage: 'call:ringing' });
          }
          if (this.stateChangeCallback) this.stateChangeCallback(state);

        } else if (terminalStates.includes(state)) {
          this.stopRingback();
          if (this.audioRef) {
            this.audioRef.srcObject = null;
            this.audioRef.pause();
          }

          const cause     = notification.call?.cause;
          const causeCode = notification.call?.causeCode;
          const sipCode   = notification.call?.sipCode || notification.call?.sip_code;
          const sipReason = notification.call?.sipReason || notification.call?.sip_reason;

          console.log('[MCA-HANGUP]', { state, cause, causeCode, sipCode, sipReason });

          this.diagnosticCallback?.({
            stage:        'call:completed',
            hangupCause:  cause     || 'unknown',
            hangupCode:   sipCode   ? String(sipCode) : causeCode ? String(causeCode) : 'N/A',
            hangupReason: sipReason || cause || 'No reason provided',
          });

          if (this.stateChangeCallback) this.stateChangeCallback('hangup');

        } else {
          if (this.stateChangeCallback) this.stateChangeCallback(state);
        }

        this.previousState = state;
      });

      console.log('[MCA-G] Calling client.connect()');
      this.diagnosticCallback?.({ stage: 'webrtc:wss:connecting' });
      await this.client.connect();
      return this.client;

    } catch (error: any) {
      const { message, code } = extractTelnyxError(error);
      console.error('[MCA-TELNYX] Init error:', message, code);
      this.diagnosticCallback?.({
        stage: 'webrtc:wss:failed',
        wssStatus: 'failed',
        sipRegistered: 'failed',
        error: message,
        code,
      });
      this.isInitialized = false;
      const err = new Error(message);
      (err as any).code = code;
      throw err;
    }
  },

  // ── Make outbound call ───────────────────────────────────────────────────
  async makeCall(
    destinationNumber: string,
    callerNumber:      string,
    onStateChange:     (state: string) => void,
    audioRef:          HTMLAudioElement,
  ) {
    this.audioRef = audioRef;

    // Sanitize and normalize destination number
    const rawDest = (destinationNumber || '')
      .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
      .trim();
    const destDigits = rawDest.replace(/\D/g, '');

    let normalizedDest = rawDest;
    if (rawDest.startsWith('+')) {
      normalizedDest = `+${destDigits}`;
    } else if (destDigits.length === 10) {
      normalizedDest = `+1${destDigits}`;
    } else if (destDigits.length === 11 && destDigits.startsWith('1')) {
      normalizedDest = `+${destDigits}`;
    } else if (destDigits.length >= 7 && destDigits.length <= 15) {
      normalizedDest = `+${destDigits}`;
    }

    if (!/^\+[1-9]\d{6,14}$/.test(normalizedDest)) {
      const err = `Invalid destination number "${destinationNumber}". Expected valid E.164 format (e.g. ${TELNYX_CONSTANTS.FROM_NUMBER}).`;
      console.error('[MCA-TELNYX] ' + err);
      this.diagnosticCallback?.({
        stage: 'call:failed',
        error: err,
        code: 'INVALID_NUMBER',
      });
      throw new Error(err);
    }

    // Sanitize and normalize caller number
    const defaultCaller = getAuthoritativeFromNumber();
    const rawCaller = (callerNumber || this.cachedCallerNumber || defaultCaller)
      .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
      .trim();
    const callerDigits = rawCaller.replace(/\D/g, '');
    let normalizedCaller = rawCaller;
    if (rawCaller.startsWith('+')) {
      normalizedCaller = `+${callerDigits}`;
    } else if (callerDigits.length === 10) {
      normalizedCaller = `+1${callerDigits}`;
    } else if (callerDigits.length === 11 && callerDigits.startsWith('1')) {
      normalizedCaller = `+${callerDigits}`;
    } else if (callerDigits.length >= 7 && callerDigits.length <= 15) {
      normalizedCaller = `+${callerDigits}`;
    }

    console.log('[MCA-K] makeCall(), sanitized dest:', normalizedDest, 'caller:', normalizedCaller);
    this.diagnosticCallback?.({ stage: 'call:initiating' });

    if (!this.client) await this.init(audioRef);

    // Wait for SIP registration before placing the call
    if (this.readyPromise) {
      console.log('[MCA-TELNYX] Awaiting telnyx.ready...');
      try {
        await Promise.race([
          this.readyPromise,
          new Promise<void>((_, reject) =>
            setTimeout(() => {
              const err = new Error('Registration timed out (30s)');
              (err as any).code = 'REGISTRATION_TIMEOUT';
              reject(err);
            }, 30_000)
          ),
        ]);
      } catch (regErr: any) {
        const { message, code } = extractTelnyxError(regErr);
        this.diagnosticCallback?.({
          stage: 'sip:registration-failed',
          sipRegistered: 'failed',
          error: message,
          code,
        });
        throw regErr;
      }
    }

    this.stateChangeCallback = onStateChange;

    console.log('[MCA-NEWCALL] placing call with:', {
      destinationNumber: normalizedDest,
      callerNumber: normalizedCaller,
    });

    try {
      this.currentCall = await this.client!.newCall({
        destinationNumber: normalizedDest,
        callerNumber: normalizedCaller,
      });

      console.log('[MCA-NEWCALL] call object returned:', !!this.currentCall);
      return this.currentCall;
    } catch (callErr: any) {
      const { message, code } = extractTelnyxError(callErr);
      console.error('[MCA-NEWCALL] Failed to create call:', message, code);
      this.diagnosticCallback?.({
        stage: 'call:failed',
        error: message,
        code,
      });
      throw callErr;
    }
  },

  // ── Call controls ────────────────────────────────────────────────────────
  async mute()   { if (this.currentCall) await this.currentCall.muteAudio();  },
  async unmute() { if (this.currentCall) await this.currentCall.unmuteAudio(); },
  async hold()   { if (this.currentCall) await this.currentCall.hold?.();     },
  async unhold() { if (this.currentCall) await this.currentCall.unhold?.();   },

  // ── Full disconnect and cleanup ──────────────────────────────────────────
  async disconnect() {
    this.stopRingback();

    if (this.audioRef) {
      this.audioRef.srcObject = null;
      this.audioRef.pause();
    }

    if (this.currentCall) {
      try { 
        if (this.currentCall.state !== 'hangup' && this.currentCall.state !== 'destroy') {
          await this.currentCall.hangup(); 
        }
      } catch (e: any) {
        console.warn('[MCA-TELNYX] Non-fatal hangup error:', e.message);
      }
      this.currentCall = null;
    }

    if (this.client) {
      try { await this.client.disconnect(); } catch (_) {}
      this.client = null;
    }

    this.isInitialized = false;
    this.readyPromise  = null;
    this.resolveReady  = null;
    this.rejectReady   = null;
    this.tokenExpiry   = 0;
  },
};
