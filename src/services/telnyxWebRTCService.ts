import { TelnyxRTC } from '@telnyx/webrtc';

export const TelnyxWebRTCService = {
  client: null as TelnyxRTC | null,
  currentCall: null as any | null,
  stateChangeCallback: null as ((state: string) => void) | null,
  previousState: null as string | null,
  isInitialized: false,
  readyPromise: null as Promise<void> | null,
  resolveReady: null as (() => void) | null,
  tokenExpiry: 0,

  async getValidToken() {
      // Refresh 30s before expiry (arbitrary 1 hour for static credentials)
      const bufferMs = 30_000;
      if (Date.now() > this.tokenExpiry - bufferMs) {
          console.log('[MCA-TELNYX] Fetching fresh credentials...');
          const response = await fetch(`/api/telephony/webrtc/token?t=${Date.now()}`, {
              method: 'GET',
              cache: 'no-store',
              headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
              },
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to fetch WebRTC credentials: ${errorData.details || response.statusText}`);
          }
          const { sipUsername, sipPassword, connectionId } = await response.json();
          this.tokenExpiry = Date.now() + 3600000; // Assume 1 hour for static credentials
          return { sipUsername, sipPassword, connectionId };
      }
      return null; // Should not happen with current logic
  },

  async init() {
    const creds = await this.getValidToken();
    if (!creds) return this.client; // Already initialized

    // If client exists, disconnect it before re-initializing with new credentials
    if (this.client) {
        await this.client.disconnect();
        this.client = null;
    }

    this.isInitialized = true;
    this.readyPromise = new Promise((resolve) => {
        this.resolveReady = resolve;
    });

    try {
      console.log('[MCA-TELNYX] Client creating...');
      const { sipUsername, sipPassword } = creds;
      
      console.log('[MCA-TELNYX] Token fetch result:', {
          hasToken: !!sipPassword,
          tokenLength: sipPassword?.length,
          tokenPrefix: sipPassword?.substring(0, 10)
      });

      this.client = new TelnyxRTC({
        login_token: sipPassword,
      });

      this.client.on('telnyx.ready', () => {
          console.log('[MCA-TELNYX] Client ready/registered - SIP registration complete');
          if (this.resolveReady) {
              this.resolveReady();
              this.resolveReady = null;
          }
      });

      this.client.on('telnyx.notification', (notification: any) => {
        console.log('[MCA-TELNYX] Notification received:', {
          type: notification?.type,
          callState: notification?.call?.state,
          callId: notification?.call?.id,
          hasCall: !!notification?.call
        });

        if (notification.type === 'callUpdate' && notification.call) {
          const state = notification.call.state;
          this.currentCall = notification.call;
          console.log(`[MCA DIALER TRACE] webrtc:state:${state} (prev: ${this.previousState})`);
          
          if (this.stateChangeCallback) {
              this.stateChangeCallback(state);
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
    if (!this.client) await this.init();
    
    // Wait for registration
    if (this.readyPromise) {
        console.log('[MCA-TELNYX] Waiting for webrtc:ready...');
        await Promise.race([
            this.readyPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Registration timed out')), 10000))
        ]);
    }
    
    this.stateChangeCallback = onStateChange;
    this.client!.remoteElement = audioRef;
    
    console.log('[MCA-TELNYX] Attempting newCall() with params:', {
      destinationNumber,
      callerNumber,
      hasClient: !!this.client,
      isRegistered: true // Tracked by readyPromise
    });
    
    // @ts-ignore - SDK API
    this.currentCall = await this.client!.newCall({
      destinationNumber,
      callerNumber,
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
