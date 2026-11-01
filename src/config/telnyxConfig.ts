/**
 * Authoritative Telnyx Configuration & Migration Source of Truth
 *
 * New Telnyx Account Identifiers:
 * - Phone Number: +18333130053 (Label: MCA SMS)
 * - Telnyx 10DLC Messaging Profile ID: 4001a17e-bedb-4ebf-95cc-285718f2789d
 * - WebRTC SIP Connection: MCA Webrtc (ID: 3083124305622468466)
 * - WebRTC SIP Username: mcasip
 * - Outbound Voice Profile: MCAVoice1
 * - Voice API Application: MCA AI Voice Outreach (ID: 3080171328876053986)
 */

export const TELNYX_CONSTANTS = {
  FROM_NUMBER: '+18333130053',
  FROM_NUMBER_FORMATTED: '(833) 313-0053',
  NUMBER_LABEL: 'MCA SMS',
  MESSAGING_PROFILE_ID: '4001a17e-bedb-4ebf-95cc-285718f2789d',
  SIP_CONNECTION_NAME: 'MCA Webrtc',
  SIP_CONNECTION_ID: '3083124305622468466',
  SIP_USERNAME: 'mcasip',
  OUTBOUND_VOICE_PROFILE: 'MCAVoice1',
  VOICE_API_APPLICATION_NAME: 'MCA AI Voice Outreach',
  VOICE_API_APPLICATION_ID: '3080171328876053986',
} as const;

export const DEPRECATED_TELNYX = {
  OLD_NUMBERS: [
    '+14052853816',
    '+15035550199',
    '14052853816',
    '15035550199',
    '(405) 285-3816',
    '(503) 555-0199',
    '503-555-0199',
    '405-285-3816',
  ],
  OLD_CONNECTIONS: ['3050571859167806808', '3080159476620199847'],
  OLD_SIP_USERNAMES: ['usermarketingcharmagency24446'],
} as const;

/**
 * Returns safe environment variable value across Node (process.env) and Browser (import.meta.env).
 */
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  try {
    const meta = (import.meta as any)?.env;
    if (meta && meta[key]) return meta[key];
  } catch (_) {
    // browser or bundler environment where import.meta might be unavailable
  }
  return undefined;
}

/**
 * Resolves the active Telnyx Caller ID / SMS From Number.
 * Automatically discards deprecated account numbers.
 */
export function getAuthoritativeFromNumber(): string {
  const envVal = getEnv('TELNYX_FROM_NUMBER') || getEnv('VITE_TELNYX_FROM_NUMBER');
  if (envVal && !DEPRECATED_TELNYX.OLD_NUMBERS.includes(envVal.trim() as any)) {
    return envVal.trim();
  }
  return TELNYX_CONSTANTS.FROM_NUMBER;
}

/**
 * Resolves the active Telnyx WebRTC SIP Connection ID.
 * Automatically discards deprecated connection IDs.
 */
export function getAuthoritativeConnectionId(): string {
  const envVal = getEnv('TELNYX_CONNECTION_ID');
  if (envVal && !DEPRECATED_TELNYX.OLD_CONNECTIONS.includes(envVal.trim() as any)) {
    return envVal.trim();
  }
  return TELNYX_CONSTANTS.SIP_CONNECTION_ID;
}

/**
 * Resolves the active WebRTC SIP Username.
 * Automatically discards deprecated usernames.
 */
export function getAuthoritativeSipUsername(): string {
  const envVal = getEnv('TELNYX_SIP_USERNAME') || getEnv('TELNYX_WEBRTC_SIP_USERNAME');
  if (envVal && !DEPRECATED_TELNYX.OLD_SIP_USERNAMES.includes(envVal.trim() as any)) {
    return envVal.trim();
  }
  return TELNYX_CONSTANTS.SIP_USERNAME;
}

/**
 * Resolves the active Telnyx 10DLC Messaging Profile ID.
 */
export function getAuthoritativeMessagingProfileId(): string {
  const envVal = getEnv('TELNYX_MESSAGING_PROFILE_ID');
  return envVal && envVal.trim() ? envVal.trim() : TELNYX_CONSTANTS.MESSAGING_PROFILE_ID;
}

/**
 * Resolves the active Telnyx Voice API Application ID.
 */
export function getAuthoritativeVoiceApiAppId(): string {
  const envVal = getEnv('TELNYX_VOICE_API_APPLICATION_ID');
  return envVal && envVal.trim() ? envVal.trim() : TELNYX_CONSTANTS.VOICE_API_APPLICATION_ID;
}

/**
 * Resolves the active Telnyx Outbound Voice Profile.
 */
export function getAuthoritativeOutboundVoiceProfile(): string {
  const envVal = getEnv('TELNYX_OUTBOUND_VOICE_PROFILE');
  return envVal && envVal.trim() ? envVal.trim() : TELNYX_CONSTANTS.OUTBOUND_VOICE_PROFILE;
}

/**
 * Resolves the active Telnyx WebRTC JWT Token (login_token).
 * Discards old connection IDs or invalid non-JWT tokens.
 */
export function getAuthoritativeWebRtcToken(): string | undefined {
  const envVal = getEnv('TELNYX_WEBRTC_TOKEN') || getEnv('TELNYX_LOGIN_TOKEN');
  if (!envVal) return undefined;
  const trimmed = envVal.trim();
  if (DEPRECATED_TELNYX.OLD_CONNECTIONS.includes(trimmed as any)) return undefined;
  if (trimmed === TELNYX_CONSTANTS.SIP_CONNECTION_ID) return undefined;
  if (trimmed.startsWith('eyJ') && trimmed.split('.').length === 3) {
    return trimmed;
  }
  return undefined;
}

