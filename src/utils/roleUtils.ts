import { AppRole } from '../constants.js';
import { Role, AccessLevel } from '../types.js';

// Access level hierarchy
export const ACCESS_LEVEL_WEIGHT: Record<AccessLevel, number> = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  ADMIN: 3,
};

// Feature access mapping
export const FEATURE_ACCESS: Record<string, Record<Role, AccessLevel>> = {
  'TeamManagement': {
    'AGENCY_DIRECTOR': 'ADMIN',
    'SALES_MANAGER': 'ADMIN',
    'SDR': 'NONE',
    'ACCOUNT_EXECUTIVE': 'NONE',
    'APPOINTMENT_SETTER': 'NONE',
    'OUTREACH_SPECIALIST': 'NONE',
    'CLIENT_SUCCESS': 'READ',
    'OPERATIONS_ANALYST': 'READ',
    'USER': 'NONE',
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
    'USER': 'NONE',
  },
};

/**
 * Check if user can access a feature with a required access level
 */
export function canAccess(role: string, feature: string, requiredAccess: AccessLevel): boolean {
  const canonicalRole = getCanonicalRole(role) as Role;
  const featureRoles = FEATURE_ACCESS[feature];
  
  if (!featureRoles) return false;
  
  const userAccess = featureRoles[canonicalRole] || 'NONE';
  
  return ACCESS_LEVEL_WEIGHT[userAccess] >= ACCESS_LEVEL_WEIGHT[requiredAccess];
}
export const ROLE_DISPLAY_TITLES: Record<string, string> = {
  AGENCY_DIRECTOR: 'Agency Director',
  SALES_MANAGER: 'Sales Manager',
  SDR: 'Sales Development Rep',
  ACCOUNT_EXECUTIVE: 'Account Executive',
  APPOINTMENT_SETTER: 'Appointment Setter',
  OUTREACH_SPECIALIST: 'Outreach Specialist',
  CLIENT_SUCCESS: 'Client Success Manager',
  OPERATIONS_ANALYST: 'Operations Analyst',
  // Legacy role mappings for display
  'Super Admin': 'Agency Director',
  'Agency Owner': 'Agency Director',
  Admin: 'Agency Director',
  Manager: 'Sales Manager',
  Sales: 'Sales Development Rep',
  'Account Manager': 'Client Success Manager',
  User: 'User',
};

/**
 * Normalize legacy role values to canonical AppRole
 */
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
      // For unknown roles, return null - caller should handle
      return null;
  }
}

/**
 * Get canonical role for authorization checks
 */
export function getCanonicalRole(role: string): string {
  const normalized = normalizeAppRole(role);
  return normalized || role;
}

/**
 * Check if user can access Team Management
 * Only AGENCY_DIRECTOR has full team access
 */
export function canAccessTeamManagement(role: string): boolean {
  const canonical = getCanonicalRole(role);
  return ['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(canonical);
}

/**
 * Check if user can assign Sophia as lead owner
 * Sophia is NOT available to SDR or ACCOUNT_EXECUTIVE
 */
export function canAssignSophia(role: string): boolean {
  const canonical = getCanonicalRole(role);
  return !['SDR', 'ACCOUNT_EXECUTIVE'].includes(canonical);
}

/**
 * Format owner display name
 * Human owners: "FirstName (Role Title)"
 * Sophia: "Sophia (AI Sales Rep)"
 */
export function formatOwnerDisplay(firstName: string, role: string): string {
  // Special case for Sophia - AI Sales Rep
  if (firstName === 'Sophia') {
    return 'Sophia (AI Sales Rep)';
  }
  
  const roleTitle = ROLE_DISPLAY_TITLES[role] || role;
  return `${firstName} (${roleTitle})`;
}

/**
 * Get display title for a role
 */
export function getRoleDisplayTitle(role: string): string {
  return ROLE_DISPLAY_TITLES[role] || role;
}
