import { TelnyxRTC } from '@telnyx/webrtc';

export const TelnyxWebRTCService = {
  client: null as TelnyxRTC | null,
  currentCall: null as any | null,

  async init() {
    if (this.client) return this.client;

    try {
      const response = await fetch('/api/telephony/webrtc/token');
      if (!response.ok) throw new Error('Failed to fetch WebRTC credentials');
      const { sipUsername, sipPassword, connectionId } = await response.json();

      this.client = new TelnyxRTC({
        sip_user: sipUsername,
        password: sipPassword,
        connection_id: connectionId,
      });

      await this.client.connect();
      console.log('[Telnyx WebRTC] Client connected and registered');
      return this.client;
    } catch (error) {
      console.error('[Telnyx WebRTC] Initialization failed:', error);
      throw error;
    }
  },

  async makeCall(destinationNumber: string, callerNumber: string, onStateChange: (state: string) => void, audioRef: HTMLAudioElement) {
    if (!this.client) await this.init();
    
    // @ts-ignore - SDK API
    this.currentCall = await this.client.newCall({
      destinationNumber,
      callerNumber,
    });

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
