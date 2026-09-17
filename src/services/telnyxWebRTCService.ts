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

      this.client.on('socket.open', () => console.log('[MCA WEBRTC SIGNAL] socket.open'));
      this.client.on('socket.close', (data: any) => console.log('[MCA WEBRTC SIGNAL] socket.close', { code: data.code, reason: data.reason, wasClean: data.wasClean, timestamp: Date.now() }));
      this.client.on('socket.error', (error: any) => console.error('[MCA WEBRTC SIGNAL] socket.error', { name: error.name, message: error.message }));
      this.client.on('telnyx.ready', () => console.log('[MCA WEBRTC SIGNAL] telnyx.ready'));
      this.client.on('telnyx.error', (error: any) => console.error('[MCA WEBRTC SIGNAL] telnyx.error', { name: error.name, message: error.message, code: error.code }));
      this.client.on('telnyx.notification', (notification: any) => console.log('[MCA WEBRTC SIGNAL] telnyx.notification', { type: notification.type, timestamp: Date.now() }));

      console.log('[MCA WEBRTC SIGNAL] connect.start');
      const start = performance.now();
      try {
        await this.client.connect();
        console.log(`[MCA WEBRTC SIGNAL] connect.resolved (elapsed: ${performance.now() - start}ms)`);
      } catch (error: any) {
        console.error(`[MCA WEBRTC SIGNAL] connect.rejected (elapsed: ${performance.now() - start}ms)`, { name: error.name, message: error.message });
        throw error;
      }
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
