export type AppRole =
  | 'AGENCY_DIRECTOR'
  | 'SALES_MANAGER'
  | 'SDR'
  | 'ACCOUNT_EXECUTIVE'
  | 'APPOINTMENT_SETTER'
  | 'OUTREACH_SPECIALIST'
  | 'CLIENT_SUCCESS'
  | 'OPERATIONS_ANALYST';

export const ROLE_DISPLAY_TITLES: Record<AppRole, string> = {
  AGENCY_DIRECTOR: 'Agency Director',
  SALES_MANAGER: 'Sales Manager',
  SDR: 'Sales Development Rep',
  ACCOUNT_EXECUTIVE: 'Account Executive',
  APPOINTMENT_SETTER: 'Appointment Setter',
  OUTREACH_SPECIALIST: 'Outreach Specialist',
  CLIENT_SUCCESS: 'Client Success Manager',
  OPERATIONS_ANALYST: 'Operations Analyst',
};
