import { TelnyxRTC } from '@telnyx/webrtc';

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
  ringbackCtx:          null as AudioContext | null,

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
      // SDK v2 exposes the stream on multiple possible properties
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
        .then(() => console.log('[MCA-AUDIO] Remote audio playing successfully'))
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

  // ── Token fetch ──────────────────────────────────────────────────────────
  async getValidToken() {
    const bufferMs = 30_000;
    if (Date.now() > this.tokenExpiry - bufferMs) {
      console.log('[MCA-A] Fetching SIP credentials from server...');

      const response = await fetch(`/api/telephony/webrtc/token?t=${Date.now()}`, {
        method: 'GET',
        cache:  'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      });

      console.log('[MCA-B] Token response:', response.status, response.ok);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        this.diagnosticCallback?.({ tokenStatus: 'failed' });
        throw new Error(`Credentials fetch failed: ${err.details || response.statusText}`);
      }

      const data = await response.json();
      console.log('[MCA-C] Token keys:', Object.keys(data || {}));
      console.log('[MCA-D] sip_username:', !!data.sip_username, ' sip_password:', !!data.sip_password);

      if (!data.sip_username || !data.sip_password) {
        this.diagnosticCallback?.({ tokenStatus: 'failed' });
        throw new Error(`Empty SIP credentials. Keys received: ${Object.keys(data).join(', ')}`);
      }

      this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

      console.log('[MCA-E] SIP credentials OK for:', data.sip_username);
      this.diagnosticCallback?.({
        tokenStatus:  'fresh',
        tokenFetched: new Date().toLocaleTimeString(),
        tokenExpires: new Date(this.tokenExpiry).toLocaleTimeString(),
      });

      return { sip_username: data.sip_username, sip_password: data.sip_password };
    }
    return null; // still within valid window
  },

  // ── Client initialisation ────────────────────────────────────────────────
  async init(audioRef?: HTMLAudioElement) {
    if (audioRef) this.audioRef = audioRef;

    const creds = await this.getValidToken();
    if (!creds) return this.client; // credentials still valid, reuse existing client

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

      this.client = new TelnyxRTC({
        login:    creds.sip_username,
        password: creds.sip_password,
        logLevel: 'warn',
      } as any);

      // ── Socket events ──────────────────────────────────────────────────
      this.client.on('telnyx.socket.open', () => {
        console.log('[MCA-H] WebSocket opened');
        this.diagnosticCallback?.({ wssStatus: 'connected' });
      });

      this.client.on('telnyx.socket.error', (error: any) => {
        console.error('[MCA-TELNYX] Socket error:', JSON.stringify(error));
        this.diagnosticCallback?.({ wssStatus: 'failed' });
        if (this.rejectReady) {
          this.rejectReady(new Error('WebSocket error: ' + JSON.stringify(error)));
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
        this.diagnosticCallback?.({ sipRegistered: 'yes' });
        if (this.resolveReady) {
          this.resolveReady();
          this.resolveReady = null;
        }
      });

      this.client.on('telnyx.error', (error: any) => {
        console.error('[MCA-TELNYX] SDK error:', error);
        this.diagnosticCallback?.({ wssStatus: 'failed', sipRegistered: 'failed' });
        if (this.rejectReady) {
          this.rejectReady(error);
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
          // Call answered — stop ringback and attach remote audio
          this.stopRingback();
          this.attachRemoteStream(notification.call);
          if (this.stateChangeCallback) this.stateChangeCallback('active');

        } else if (ringingStates.includes(state)) {
          // Remote phone ringing — play ringback tone
          if (state === 'ringing' || state === 'requesting') {
            this.startRingback();
          }
          if (this.stateChangeCallback) this.stateChangeCallback(state);

        } else if (terminalStates.includes(state)) {
          // Call ended — clean up everything
          this.stopRingback();
          if (this.audioRef) {
            this.audioRef.srcObject = null;
            this.audioRef.pause();
          }

          const cause     = notification.call?.cause;
          const causeCode = notification.call?.causeCode;
          const sipCode   = notification.call?.sipCode || notification.call?.sip_code;
          const sipReason = notification.call?.sipReason || notification.call?.sip_reason;

          console.error('[MCA-HANGUP]', { state, cause, causeCode, sipCode, sipReason });

          this.diagnosticCallback?.({
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
      await this.client.connect();
      return this.client;

    } catch (error) {
      console.error('[MCA-TELNYX] Init error:', error);
      this.isInitialized = false;
      throw error;
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
    console.log('[MCA-K] makeCall(), dest prefix:', destinationNumber?.substring(0, 6));

    if (!this.client) await this.init(audioRef);

    // Wait for SIP registration before placing the call
    if (this.readyPromise) {
      console.log('[MCA-TELNYX] Awaiting telnyx.ready...');
      await Promise.race([
        this.readyPromise,
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Registration timed out')), 30_000)
        ),
      ]);
    }

    this.stateChangeCallback = onStateChange;

    console.log('[MCA-NEWCALL] params:', {
      destinationNumber,
      destE164:   destinationNumber?.startsWith('+'),
      callerNumber,
      callerE164: callerNumber?.startsWith('+'),
    });

    this.currentCall = await this.client!.newCall({
      destinationNumber,
      callerNumber,
    });

    console.log('[MCA-NEWCALL] call object returned:', !!this.currentCall);
    return this.currentCall;
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
      try { await this.currentCall.hangup(); } catch (_) {}
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
