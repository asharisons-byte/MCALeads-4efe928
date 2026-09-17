import { TelnyxRTC } from '@telnyx/webrtc';

export const TelnyxWebRTCService = {
  client: null as TelnyxRTC | null,
  currentCall: null as any | null,

  async init() {
    if (this.client) return this.client;

    try {
      console.log('[MCA WebRTC] Requesting token...');
      const response = await fetch('/api/telephony/webrtc/token');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch WebRTC credentials: ${errorData.details || response.statusText}`);
      }
      const { sipUsername, sipPassword, connectionId } = await response.json();
      console.log('[MCA WebRTC] Received credentials. Connecting...');

      this.client = new TelnyxRTC({
        login: sipUsername,
        password: sipPassword,
      });

      await this.client.connect();
      console.log('[MCA WebRTC] Client registered');
      return this.client;
    } catch (error) {
      console.error('[MCA WebRTC ERROR] stage=initialization', error);
      throw error;
    }
  },

  async makeCall(destinationNumber: string, callerNumber: string, onStateChange: (state: string) => void, audioRef: HTMLAudioElement) {
    if (!this.client) await this.init();
    
    console.log(`[MCA WebRTC] Originating call to ${destinationNumber}`);
    // @ts-ignore - SDK API
    this.currentCall = await this.client.newCall({
      destinationNumber,
      callerNumber,
    });
    console.log('[MCA WebRTC] Call object created');

    this.currentCall.on('ringing', () => onStateChange('RINGING'));
    this.currentCall.on('answered', () => onStateChange('CONNECTED'));
    this.currentCall.on('ended', () => {
      onStateChange('ENDED');
      this.currentCall = null;
    });

    this.currentCall.on('remoteStream', (stream: MediaStream) => {
        audioRef.srcObject = stream;
        audioRef.play().catch(e => console.error('Auto-play blocked:', e));
    });

    return this.currentCall;
  },

  async mute() {
    if (this.currentCall) await this.currentCall.mute();
  },

  async unmute() {
    if (this.currentCall) await this.currentCall.unmute();
  },

  async disconnect() {
    if (this.currentCall) await this.currentCall.hangup();
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
};
