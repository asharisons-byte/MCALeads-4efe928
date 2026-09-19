export type ClientUserRole = 'Client Owner' | 'Client Admin' | 'Client Member';

export type ClientUserStatus = 'Active' | 'Invited' | 'Suspended';

export interface ClientPortalUser {
  user_id: string;
  client_id: string;
  name: string;
  email: string;
  role: ClientUserRole;
  status: ClientUserStatus;
  title?: string;
  phone?: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  notification_preferences: {
    email_notifications: boolean;
    portal_notifications: boolean;
    report_notifications: boolean;
    approval_notifications: boolean;
    service_updates: boolean;
  };
}

export type ClientRequestCategory =
  | 'Website Change'
  | 'Marketing Request'
  | 'New Campaign'
  | 'Support Request'
  | 'Question'
  | 'General Request';

export type ClientRequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ClientRequestStatus =
  | 'Submitted'
  | 'Received'
  | 'Under Review'
  | 'In Progress'
  | 'Waiting for Client'
  | 'Completed'
  | 'Closed';

export interface ClientRequestAttachment {
  id: string;
  name: string;
  size: string;
  type?: string;
  url?: string;
}

export interface ClientRequest {
  request_id: string;
  client_id: string;
  submitted_by: {
    user_id: string;
    name: string;
    email: string;
    role?: string;
  };
  category: ClientRequestCategory;
  subject: string;
  description: string;
  priority: ClientRequestPriority;
  status: ClientRequestStatus;
  attachments?: ClientRequestAttachment[];
  internal_task_id?: string;
  agency_response?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
}

export type ClientApprovalCategory =
  | 'Marketing Strategy'
  | 'Campaign Changes'
  | 'Creative Concepts'
  | 'Budget Recommendations'
  | 'Website Changes'
  | 'Documents'
  | 'Other Client Decisions';

export type ClientApprovalStatus = 'Pending' | 'Approved' | 'Changes Requested' | 'Rejected';

export interface ApprovalHistoryEntry {
  action: 'Requested' | 'Viewed' | 'Approved' | 'Rejected' | 'Changes Requested';
  timestamp: string;
  user_name: string;
  user_role?: string;
  note?: string;
}

export interface ClientApproval {
  approval_id: string;
  client_id: string;
  title: string;
  category: ClientApprovalCategory;
  description: string;
  supporting_info?: string;
  deliverable_ref_id?: string;
  status: ClientApprovalStatus;
  requested_at: string;
  responded_at?: string;
  responded_by?: {
    user_id: string;
    name: string;
    email: string;
  };
  client_feedback?: string;
  history: ApprovalHistoryEntry[];
}

export type DocumentCategory =
  | 'Reports'
  | 'Audit Documents'
  | 'Proposals'
  | 'Contracts'
  | 'Strategy Documents'
  | 'Deliverables'
  | 'Shared Files';

export type DocumentVisibility = 'Internal Only' | 'Share with Client' | 'Shared with Specific Client User';

export interface SharedDocument {
  document_id: string;
  client_id: string;
  title: string;
  category: DocumentCategory;
  visibility: DocumentVisibility;
  file_type: 'pdf' | 'doc' | 'sheet' | 'image' | 'link';
  file_size: string;
  file_url?: string;
  description?: string;
  shared_at: string;
  shared_by: string; // Agency contact
  download_count: number;
  last_viewed_at?: string;
}

export type ClientPortalActivityType =
  | 'Login'
  | 'Document Viewed'
  | 'Report Viewed'
  | 'Approval Submitted'
  | 'Request Created'
  | 'Message Sent'
  | 'File Downloaded'
  | 'Service Progress Viewed';

export interface ClientPortalActivity {
  activity_id: string;
  client_id: string;
  user_id: string;
  user_name: string;
  activity_type: ClientPortalActivityType;
  resource_type: 'document' | 'report' | 'approval' | 'request' | 'message' | 'service' | 'auth';
  resource_id: string;
  details?: string;
  created_at: string;
}

export interface ClientMilestone {
  title: string;
  completed: boolean;
  date: string;
  description?: string;
}

export interface ClientServiceProgress {
  service_id: string;
  client_id: string;
  service_name: string;
  category: string;
  status: 'Active' | 'Onboarding' | 'Completed' | 'Paused';
  current_stage: string;
  progress_pct: number;
  completed_milestones: ClientMilestone[];
  upcoming_milestones: ClientMilestone[];
  latest_update: string;
  agency_notes_for_client: string; // Sanitized client-friendly notes
  updated_at: string;
}

export type DeliverableStatus =
  | 'In Progress'
  | 'Ready for Review'
  | 'Delivered'
  | 'Revision Requested'
  | 'Approved';

export interface DeliverableComment {
  id: string;
  author_name: string;
  author_role: 'Client' | 'Agency';
  message: string;
  timestamp: string;
}

export interface ClientDeliverable {
  deliverable_id: string;
  client_id: string;
  title: string;
  service_name: string;
  status: DeliverableStatus;
  date: string;
  file_url?: string;
  file_type: string;
  file_size: string;
  summary: string;
  comments: DeliverableComment[];
}

export interface ClientPerformanceReport {
  report_id: string;
  client_id: string;
  title: string;
  report_type: 'Monthly Report' | 'SEO Report' | 'Website Report' | 'Google Ads Report' | 'Meta Ads Report' | 'Custom Report';
  period: string;
  created_at: string;
  status: 'Published';
  executive_summary: string;
  highlights: string[];
  work_completed: string[];
  metrics: {
    impressions: { value: number; change_pct: number };
    website_traffic: { value: number; change_pct: number };
    qualified_inquiries: { value: number; change_pct: number };
    calls_generated: { value: number; change_pct: number };
    google_maps_views: { value: number; change_pct: number };
    avg_search_position: { value: number; change_pct: number };
  };
  insights: string[];
  challenges: string[];
  recommendations: string[];
  next_month_plan: string[];
}

export type MessageCategory =
  | 'General'
  | 'Service Question'
  | 'Support'
  | 'Strategy'
  | 'Billing'
  | 'Urgent';

export interface ClientMessage {
  message_id: string;
  client_id: string;
  sender_type: 'client' | 'agency';
  sender_name: string;
  sender_email?: string;
  sender_role: string;
  category: MessageCategory;
  subject?: string;
  content: string;
  attachments?: Array<{ name: string; size: string; url?: string }>;
  read_by_client: boolean;
  read_by_agency: boolean;
  created_at: string;
}

export interface ClientOnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action_label?: string;
  category: string;
  due_date?: string;
}

export interface ClientOnboardingProgress {
  client_id: string;
  current_step: number;
  total_steps: number;
  steps: ClientOnboardingStep[];
}

export type AccessPlatform =
  | 'Google Business Profile'
  | 'Google Ads'
  | 'Google Analytics'
  | 'Meta Business'
  | 'Website CMS'
  | 'Google Search Console';

export type AccessStatus = 'Pending Client Access' | 'Granted & Verified' | 'Not Required';

export interface ClientAccessRequest {
  access_id: string;
  client_id: string;
  platform: AccessPlatform;
  required: boolean;
  why_needed: string;
  instructions: string[];
  status: AccessStatus;
  verified_at?: string;
}

export type MeetingType =
  | 'Monthly Strategy Review'
  | 'Kickoff Session'
  | 'Technical Walkthrough'
  | 'Quarterly Growth Planning';

export type MeetingStatus = 'Upcoming' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface ClientMeeting {
  meeting_id: string;
  client_id: string;
  title: string;
  meeting_type: MeetingType;
  scheduled_for: string;
  duration_minutes: number;
  status: MeetingStatus;
  host_name: string;
  attendees: string[];
  meeting_link?: string;
  meeting_notes?: string;
  action_items?: string[];
}

export interface InvoiceItem {
  invoice_number: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
  service_period: string;
  download_label: string;
}

export interface ClientBillingInfo {
  client_id: string;
  current_plan: string;
  monthly_retainer: number;
  payment_status: 'Current - In Good Standing' | 'Payment Processing' | 'Invoice Pending';
  next_billing_date: string;
  invoices: InvoiceItem[];
}

export interface ClientInvitation {
  invitation_id: string;
  client_id: string;
  client_business_name: string;
  email: string;
  name: string;
  role: ClientUserRole;
  token: string;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Revoked';
  created_at: string;
  expires_at: string;
}

export interface ClientPortalNotification {
  notification_id: string;
  client_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'report' | 'deliverable' | 'approval' | 'message' | 'request' | 'meeting' | 'document';
  read: boolean;
  created_at: string;
  link_tab?: string;
}

export interface ClientPortalSession {
  token: string;
  user: ClientPortalUser;
  client_business_name: string;
  is_agency_preview?: boolean; // When agency admin previews as client
}

export interface ClientPortalAnalytics {
  client_id: string;
  business_name: string;
  total_logins: number;
  last_login_at?: string;
  reports_viewed_count: number;
  documents_downloaded_count: number;
  open_requests_count: number;
  pending_approvals_count: number;
  engagement_level: 'High' | 'Moderate' | 'Low';
}
