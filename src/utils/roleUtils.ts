import { AppRole, ROLE_DISPLAY_TITLES } from '../constants.js';
import { AccessLevel } from '../types.js';

// Access level hierarchy
export const ACCESS_LEVEL_WEIGHT: Record<AccessLevel, number> = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  ADMIN: 3,
};

// Feature access mapping
export const FEATURE_ACCESS: Record<string, Record<AppRole, AccessLevel>> = {
  'TeamManagement': {
    'AGENCY_DIRECTOR': 'ADMIN',
    'SALES_MANAGER': 'ADMIN',
    'SDR': 'NONE',
    'ACCOUNT_EXECUTIVE': 'NONE',
    'APPOINTMENT_SETTER': 'NONE',
    'OUTREACH_SPECIALIST': 'NONE',
    'CLIENT_SUCCESS': 'READ',
    'OPERATIONS_ANALYST': 'READ',
  },
  'LeadDeletion': {
    'AGENCY_DIRECTOR': 'ADMIN',
    'SALES_MANAGER': 'WRITE',
    'SDR': 'NONE',
    'ACCOUNT_EXECUTIVE': 'NONE',
    'APPOINTMENT_SETTER': 'NONE',
    'OUTREACH_SPECIALIST': 'NONE',
    'CLIENT_SUCCESS': 'NONE',
    'OPERATIONS_ANALYST': 'READ',
  },
};

/**
 * Check if user can access a feature with a required access level
 */
export function canAccess(role: AppRole, feature: string, requiredAccess: AccessLevel): boolean {
  const featureRoles = FEATURE_ACCESS[feature];
  if (!featureRoles) return false;
  
  const userAccess = featureRoles[role] || 'NONE';
  return ACCESS_LEVEL_WEIGHT[userAccess] >= ACCESS_LEVEL_WEIGHT[requiredAccess];
}

export function normalizeAppRole(role: string): AppRole | null {
  switch (role) {
    case 'Super Admin':
    case 'Agency Owner':
    case 'Admin':
      return 'AGENCY_DIRECTOR';
    
    case 'Manager':
      return 'SALES_MANAGER';
    
    case 'Sales':
      return 'SDR';
    
    case 'Account Manager':
      return 'CLIENT_SUCCESS';
    
    case 'AGENCY_DIRECTOR':
    case 'SALES_MANAGER':
    case 'SDR':
    case 'ACCOUNT_EXECUTIVE':
    case 'APPOINTMENT_SETTER':
    case 'OUTREACH_SPECIALIST':
    case 'CLIENT_SUCCESS':
    case 'OPERATIONS_ANALYST':
      return role as AppRole;
    
    default:
      return null;
  }
}

export function canAccessTeamManagement(role: string): boolean {
  const normalized = normalizeAppRole(role);
  return normalized ? ['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(normalized) : false;
}

export function canAssignSophia(role: string): boolean {
  const normalized = normalizeAppRole(role);
  return normalized ? !['SDR', 'ACCOUNT_EXECUTIVE'].includes(normalized) : false;
}

/**
 * Format owner display name
 */
export function formatOwnerDisplay(firstName: string, role: string): string {
  if (firstName === 'Sophia') {
    return 'Sophia (AI Sales Rep)';
  }
  
  const roleTitle = ROLE_DISPLAY_TITLES[role as AppRole] || role;
  return `${firstName} (${roleTitle})`;
}

export { ROLE_DISPLAY_TITLES };
