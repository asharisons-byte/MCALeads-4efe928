import { TelnyxRTC } from '@telnyx/webrtc';

export const TelnyxWebRTCService = {
  client: null as TelnyxRTC | null,
  currentCall: null as any | null,
  stateChangeCallback: null as ((state: string) => void) | null,
  previousState: null as string | null,
  isInitialized: false,
  readyPromise: null as Promise<void> | null,
  resolveReady: null as (() => void) | null,
  rejectReady: null as ((e: any) => void) | null,  // ADD — was missing, caused silent crash
  tokenExpiry: 0,
  audioRef: null as HTMLAudioElement | null,        // ADD — needed for remoteElement at init
  diagnosticCallback: null as ((update: any) => void) | null,

  setDiagnosticCallback(cb: (update: any) => void) {
      this.diagnosticCallback = cb;
  },

  async getValidToken() {
    const bufferMs = 30_000;
    if (Date.now() > this.tokenExpiry - bufferMs) {
      console.log('[MCA-TELNYX] Fetching SIP credentials from server...');
      console.log('[MCA-A] getValidToken() entered, tokenExpiry:', new Date(this.tokenExpiry).toISOString());
  
      const response = await fetch(`/api/telephony/webrtc/token?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
  
      console.log('[MCA-B] Token fetch response status:', response.status, response.ok);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.diagnosticCallback?.({ tokenStatus: 'failed' });
        console.error('[MCA-CATCH] getValidToken', `Credentials fetch failed: ${errorData.details || response.statusText}`);
        throw new Error(`Credentials fetch failed: ${errorData.details || response.statusText}`);
      }
  
      const data = await response.json();
      console.log('[MCA-C] Token data keys received:', Object.keys(data || {}));
      console.log('[MCA-D] sip_username present:', !!data.sip_username, 'sip_password present:', !!data.sip_password);
  
      if (!data.sip_username || !data.sip_password) {
        this.diagnosticCallback?.({ tokenStatus: 'failed' });
        throw new Error(`Server returned empty SIP credentials. Keys received: ${Object.keys(data).join(', ')}`);
      }
  
      // SIP credentials are static — refresh every 23 hours
      this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  
      console.log('[MCA-TELNYX] SIP credentials received, username:', data.sip_username);
  
      this.diagnosticCallback?.({
        tokenStatus: 'fresh',
        tokenFetched: new Date().toLocaleTimeString(),
        tokenExpires: new Date(this.tokenExpiry).toLocaleTimeString(),
      });
      console.log('[MCA-E] Token diagnostic callback fired');
  
      return { sip_username: data.sip_username, sip_password: data.sip_password };
    }
    return null;
  },

  async init(audioRef?: HTMLAudioElement) {
    if (audioRef) this.audioRef = audioRef;
  
    const creds = await this.getValidToken();
    if (!creds) return this.client;
  
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  
    this.isInitialized = true;
    this.readyPromise = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;   // now properly assigned
    });
  
    try {
      console.log('[MCA-TELNYX] Creating TelnyxRTC client...');
  
      this.client = new TelnyxRTC({
        login: creds.sip_username,
        password: creds.sip_password,
        remoteElement: this.audioRef || undefined,
        ringtoneFile: undefined,
        ringbackFile: undefined,
        logLevel: 'debug',
      } as any);

      this.client.on('telnyx.ready', () => {
          console.log('[MCA-TELNYX] Client ready/registered - SIP registration complete');
          this.diagnosticCallback?.({ sipRegistered: 'yes' });
          if (this.resolveReady) {
              this.resolveReady();
              this.resolveReady = null;
          }
      });
      
      this.client.on('telnyx.error', (error) => {
          console.error('[MCA-TELNYX] SDK Error:', error);
          this.diagnosticCallback?.({ wssStatus: 'failed', sipRegistered: 'failed' });
          if (this.rejectReady) {
              this.rejectReady(error);
              this.rejectReady = null;
          }
      });

      this.client.on('telnyx.socket.open', () => {
          console.log('[MCA-TELNYX] WebSocket opened');
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
        console.warn('[MCA-TELNYX] Socket closed unexpectedly');
        this.diagnosticCallback?.({ wssStatus: 'closed' });
      });

      this.client.on('telnyx.notification', (notification: any) => {
        console.log('[MCA-TELNYX] Notification received:', {
          type: notification?.type,
          callState: notification?.call?.state,
          callId: notification?.call?.id,
          hasCall: !!notification?.call
        });
      
        if (!notification) return;
      
        if (notification.type === 'callUpdate' && notification.call) {
          const state = notification.call.state;
          this.currentCall = notification.call;
      
          console.log(`[MCA DIALER TRACE] webrtc:state:${state} (prev: ${this.previousState})`);
      
          // Map SDK states to internal states before passing to UI
          const terminalStates = ['hangup', 'destroy', 'purge'];
          const activeStates = ['active', 'answering', 'early'];
          const ringingStates = ['new', 'requesting', 'ringing', 'recovering'];
      
          if (activeStates.includes(state)) {
            if (this.stateChangeCallback) this.stateChangeCallback('active');
          } else if (ringingStates.includes(state)) {
            if (this.stateChangeCallback) this.stateChangeCallback(state);
          } else if (terminalStates.includes(state)) {
            // Extract Telnyx rejection details
            const cause = notification.call?.cause;
            const causeCode = notification.call?.causeCode;
            const sipCode = notification.call?.sipCode || notification.call?.sip_code;
            const sipReason = notification.call?.sipReason || notification.call?.sip_reason;

            console.error('[MCA-HANGUP] Call terminated:', {
              state,
              cause,
              causeCode,
              sipCode,
              sipReason,
              callId: notification.call?.id,
            });

            // Surface the rejection reason to diagnostic panel
            this.diagnosticCallback?.({
              hangupCause: cause || 'unknown',
              hangupCode: sipCode ? String(sipCode) : causeCode ? String(causeCode) : 'N/A',
              hangupReason: sipReason || cause || 'No reason provided',
            });

            if (this.stateChangeCallback) this.stateChangeCallback('hangup');
          } else {
            if (this.stateChangeCallback) this.stateChangeCallback(state);
          }
      
          this.previousState = state;
        }
      });

      console.log('[MCA-TELNYX] connect() called');
      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('[MCA-TELNYX] Error in call path:', error);
      this.isInitialized = false;
      throw error;
    }
  },

  async makeCall(destinationNumber: string, callerNumber: string, onStateChange: (state: string) => void, audioRef: HTMLAudioElement) {
    this.audioRef = audioRef;  // store BEFORE init() so init can pass it to constructor
    console.log('[MCA-K] Calling newCall() with destination:', destinationNumber?.substring(0, 6) + '***');
  
    if (!this.client) await this.init(audioRef);
    
    // Wait for registration
    if (this.readyPromise) {
        console.log('[MCA-TELNYX] Waiting for webrtc:ready...');
        await Promise.race([
            this.readyPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Registration timed out')), 30000))
        ]);
    }
    
    this.stateChangeCallback = onStateChange;
    
    // ... rest of makeCall
    this.currentCall = await this.client!.newCall({
      destinationNumber,
      callerNumber,
    });
    console.log('[MCA-NEWCALL] Initiating call with params:', {
      destinationNumber,
      callerNumber,
      destinationLength: destinationNumber?.length,
      callerLength: callerNumber?.length,
      destFormat: destinationNumber?.startsWith('+') ? 'E164' : 'NON-E164',
      callerFormat: callerNumber?.startsWith('+') ? 'E164' : 'NON-E164',
    });
    console.log('[MCA-TELNYX] newCall() returned:', {
        callObject: !!this.currentCall,
        callType: typeof this.currentCall
    });
    
    return this.currentCall;
  },

  async mute() {
    if (this.currentCall) await this.currentCall.muteAudio();
  },

  async unmute() {
    if (this.currentCall) await this.currentCall.unmuteAudio();
  },

  async disconnect() {
    if (this.currentCall) await this.currentCall.hangup();
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
};
