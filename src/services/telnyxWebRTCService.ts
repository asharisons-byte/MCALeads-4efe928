import { TelnyxRTC } from '@telnyx/webrtc';

export const TelnyxWebRTCService = {
  client: null as TelnyxRTC | null,

  async init() {
    if (this.client) return this.client;

    try {
      const response = await fetch('/api/telephony/webrtc/token');
      if (!response.ok) throw new Error('Failed to fetch WebRTC credentials');
      const { sipUsername, sipPassword, connectionId } = await response.json();

      this.client = new TelnyxRTC({
        sipUsername: sipUsername,
        sipPassword: sipPassword,
        connection_id: connectionId,
        // TelnyxRTC SDK handles ICE/STUN/TURN automatically by default
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('[Telnyx WebRTC] Initialization failed:', error);
      throw error;
    }
  },

  async makeCall(destinationNumber: string, callerNumber: string, audioRef: HTMLAudioElement) {
    if (!this.client) await this.init();
    
    // @ts-ignore - SDK API
    const call = await this.client.newCall({
      destinationNumber,
      callerNumber,
    });

    call.on('remoteStream', (stream: MediaStream) => {
        audioRef.srcObject = stream;
        audioRef.play();
    });

    return call;
  },

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
};
