import Telnyx from 'telnyx';

const apiKey = process.env.TELNYX_API_KEY || '';
const telnyx = apiKey ? new Telnyx({ apiKey }) : null;

export const TelnyxProvider = {
  isConfigured: () => !!telnyx,
  
  async sendSms(params: { to: string; content: string; messagingProfileId: string }) {
    if (!telnyx) throw new Error('TELNYX_API_KEY is not configured');
    
    return await telnyx.messages.sendNumberPool({
      to: params.to,
      text: params.content,
      messaging_profile_id: params.messagingProfileId,
    });
  },

  async startCall(params: { to: string; connectionId: string; clientState: string }) {
    if (!telnyx) throw new Error('TELNYX_API_KEY is not configured');
    
    return await telnyx.calls.dial({
      connection_id: params.connectionId,
      to: params.to,
      from: process.env.TELNYX_FROM_NUMBER,
      client_state: params.clientState,
    });
  },

  async hangupCall(callControlId: string) {
    if (!telnyx) throw new Error('TELNYX_API_KEY is not configured');
    
    return await telnyx.calls.actions.hangup(callControlId, {});
  },
};
