import { TelnyxRTC } from '@telnyx/webrtc';

export const TelnyxWebRTCService = {
  client: null as TelnyxRTC | null,
  currentCall: null as any | null,
  stateChangeCallback: null as ((state: string) => void) | null,

  async init() {
    if (this.client) return this.client;

    try {
      const response = await fetch('/api/telephony/webrtc/token');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch WebRTC credentials: ${errorData.details || response.statusText}`);
      }
      const { sipUsername, sipPassword } = await response.json();

      this.client = new TelnyxRTC({
        login: sipUsername,
        password: sipPassword,
      });

      this.client.on('telnyx.notification', (notification: any) => {
        console.log('[MCA DIALER TRACE] webrtc:notification', {
          type: notification.type,
          callState: notification.call?.state,
          timestamp: Date.now()
        });

        if (notification.type === 'callUpdate' && this.stateChangeCallback) {
          const state = notification.call?.state;
          this.currentCall = notification.call;
          console.log(`[MCA DIALER TRACE] webrtc:state:${state}`);
          
          if (state === 'active') {
            this.stateChangeCallback('CONNECTED');
          } else if (state === 'ringing') {
            this.stateChangeCallback('RINGING');
          } else if (state === 'ended') {
            this.stateChangeCallback('ENDED');
          } else {
            this.stateChangeCallback(state);
          }
        }
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('[MCA WebRTC ERROR] stage=initialization', error);
      throw error;
    }
  },

  async makeCall(destinationNumber: string, callerNumber: string, onStateChange: (state: string) => void, audioRef: HTMLAudioElement) {
    if (!this.client) await this.init();
    
    this.stateChangeCallback = onStateChange;
    this.client!.remoteElement = audioRef;
    
    console.log(`[MCA DIALER TRACE] webrtc:newCall to ${destinationNumber}`);
    
    // @ts-ignore - SDK API
    this.currentCall = await this.client!.newCall({
      destinationNumber,
      callerNumber,
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
