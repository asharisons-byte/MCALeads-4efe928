import {
  ClientPortalUser,
  ClientUserRole,
  ClientRequest,
  ClientApproval,
  SharedDocument,
  ClientPortalActivity,
  ClientServiceProgress,
  ClientDeliverable,
  ClientPerformanceReport,
  ClientMessage,
  ClientOnboardingProgress,
  ClientAccessRequest,
  ClientMeeting,
  ClientBillingInfo,
  ClientInvitation,
  ClientPortalNotification,
  ClientPortalSession,
  ClientPortalAnalytics,
  ApprovalHistoryEntry,
  DeliverableComment,
} from '../types/clientPortal';
import { getClients, saveClients } from './conversionService';
import { addActivity } from './leadService';

// Storage Keys
const USERS_KEY = 'mca_client_portal_users_v1';
const REQUESTS_KEY = 'mca_client_portal_requests_v1';
const APPROVALS_KEY = 'mca_client_portal_approvals_v1';
const DOCUMENTS_KEY = 'mca_client_portal_documents_v1';
const ACTIVITIES_KEY = 'mca_client_portal_activities_v1';
const SERVICES_KEY = 'mca_client_portal_services_v1';
const DELIVERABLES_KEY = 'mca_client_portal_deliverables_v1';
const REPORTS_KEY = 'mca_client_portal_reports_v1';
const MESSAGES_KEY = 'mca_client_portal_messages_v1';
const ONBOARDING_KEY = 'mca_client_portal_onboarding_v1';
const ACCESS_KEY = 'mca_client_portal_access_v1';
const MEETINGS_KEY = 'mca_client_portal_meetings_v1';
const BILLING_KEY = 'mca_client_portal_billing_v1';
const INVITATIONS_KEY = 'mca_client_portal_invitations_v1';
const NOTIFICATIONS_KEY = 'mca_client_portal_notifications_v1';
const SESSION_KEY = 'mca_client_portal_session_v1';

// Helper storage functions
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to store ${key}:`, e);
  }
}

// ==========================================================
// 1. DATA SEEDING & INITIALIZATION
// ==========================================================

export function getClientOrganizationName(clientId: string): string {
  const clients = getClients();
  const found = clients.find((c) => c.client_id === clientId);
  if (found) return found.business_name;
  if (clientId === 'cli_west_coast' || clientId === 'west_coast_plumbing') return 'West Coast Plumbing & Rooter';
  if (clientId === 'cli_apex_roofing' || clientId === 'apex_roofing') return 'Apex Roofing & Restoration';
  if (clientId === 'cli_cascade_hvac' || clientId === 'cascade_hvac') return 'Cascade Heating & Air';
  return 'West Coast Plumbing & Rooter';
}

export const seedClientPortalData = initClientPortalData;

export function initClientPortalData(): void {
  const users = getStored<ClientPortalUser[]>(USERS_KEY, []);
  if (users.length > 0) return; // already initialized

  // Synchronize with existing clients or create defaults
  const existingClients = getClients();
  const primaryClientId = existingClients[0]?.client_id || 'cli_west_coast';
  const primaryBizName = existingClients[0]?.business_name || 'West Coast Plumbing & Rooter';

  // Seed Users
  const defaultUsers: ClientPortalUser[] = [
    {
      user_id: 'usr_dave_01',
      client_id: primaryClientId,
      name: 'Dave Martinez',
      email: 'dave@westcoastplumbing.com',
      role: 'Client Owner',
      status: 'Active',
      title: 'President & Founder',
      phone: '(503) 555-0149',
      last_login: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      notification_preferences: {
        email_notifications: true,
        portal_notifications: true,
        report_notifications: true,
        approval_notifications: true,
        service_updates: true,
      },
    },
    {
      user_id: 'usr_sarah_02',
      client_id: primaryClientId,
      name: 'Sarah Jenkins',
      email: 'sarah@westcoastplumbing.com',
      role: 'Client Admin',
      status: 'Active',
      title: 'Operations Director',
      phone: '(503) 555-0150',
      last_login: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      notification_preferences: {
        email_notifications: true,
        portal_notifications: true,
        report_notifications: true,
        approval_notifications: true,
        service_updates: false,
      },
    },
    {
      user_id: 'usr_mike_03',
      client_id: primaryClientId,
      name: 'Mike Ross',
      email: 'operations@westcoastplumbing.com',
      role: 'Client Member',
      status: 'Active',
      title: 'Dispatch Lead',
      phone: '(503) 555-0151',
      last_login: new Date(Date.now() - 3 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      notification_preferences: {
        email_notifications: false,
        portal_notifications: true,
        report_notifications: false,
        approval_notifications: false,
        service_updates: false,
      },
    },
    // Second organization user
    {
      user_id: 'usr_robert_04',
      client_id: 'cli_apex_roofing',
      name: 'Robert Vance',
      email: 'robert@apexroofingsolar.com',
      role: 'Client Owner',
      status: 'Active',
      title: 'Managing Partner',
      phone: '(503) 555-0199',
      last_login: new Date(Date.now() - 2 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      notification_preferences: {
        email_notifications: true,
        portal_notifications: true,
        report_notifications: true,
        approval_notifications: true,
        service_updates: true,
      },
    },
  ];
  setStored(USERS_KEY, defaultUsers);

  // Seed Active Services Progress (Client-Friendly only)
  const defaultServices: ClientServiceProgress[] = [
    {
      service_id: 'srv_prog_01',
      client_id: primaryClientId,
      service_name: 'Website SEO & Technical Optimization',
      category: 'Organic Search & Speed',
      status: 'Active',
      current_stage: 'Local Keyword Dominance & Schema Expansion',
      progress_pct: 75,
      completed_milestones: [
        {
          title: 'Technical Infrastructure Audit & Speed Remediation',
          completed: true,
          date: '2026-07-28',
          description: 'Resolved mobile latency and achieved green Core Web Vitals on high-intent service landing pages.',
        },
        {
          title: 'Google Business Profile Optimization & Citation Sync',
          completed: true,
          date: '2026-08-10',
          description: 'Updated primary categories, uploaded verified geo-tagged work photos, and synchronized 40+ local business directories.',
        },
      ],
      upcoming_milestones: [
        {
          title: 'Sub-Service Landing Pages Launch (Beaverton & Hillsboro)',
          completed: false,
          date: '2026-09-18',
          description: 'Publishing dedicated localized pages for emergency water line repair and trenchless piping.',
        },
        {
          title: 'Quarterly Search Engine Authority & Backlink Review',
          completed: false,
          date: '2026-09-30',
          description: 'Auditing high-authority trade associations and regional contractor directories.',
        },
      ],
      latest_update: 'Organic search inquiries increased +34% month-over-month. Top 3 Google Map Pack achieved for emergency plumbing queries.',
      agency_notes_for_client: 'All primary technical blockers are resolved. Our focus this month is expanding localized coverage to capture evening and weekend calls.',
      updated_at: new Date().toISOString(),
    },
    {
      service_id: 'srv_prog_02',
      client_id: primaryClientId,
      service_name: 'Google Local Services Ads (LSA) & Paid Search',
      category: 'Paid Acquisition',
      status: 'Active',
      current_stage: 'High-Ticket Job Bidding & Negative Keyword Filtering',
      progress_pct: 85,
      completed_milestones: [
        {
          title: 'Google Guaranteed Verification & License Review',
          completed: true,
          date: '2026-08-02',
          description: 'Verified active CCB contractor license and background verification for Google Guaranteed badge.',
        },
        {
          title: 'Negative Keyword Shielding',
          completed: true,
          date: '2026-08-15',
          description: 'Filtered low-intent and DIY search queries to preserve ad budget strictly for emergency repiping and water heaters.',
        },
      ],
      upcoming_milestones: [
        {
          title: 'Call Tracking & Dispute Optimization',
          completed: false,
          date: '2026-09-22',
          description: 'Auditing recorded inbound calls to dispute unqualified inquiries with Google support for credit.',
        },
      ],
      latest_update: 'Delivered 38 direct inbound estimate calls in August at an average cost per qualified lead of $48.20.',
      agency_notes_for_client: 'Ad spend is pacing efficiently. The emergency callout extension is capturing prime evening conversions.',
      updated_at: new Date().toISOString(),
    },
    {
      service_id: 'srv_prog_03',
      client_id: primaryClientId,
      service_name: 'Reputation & Automated Review Acquisition',
      category: 'Reputation & Trust',
      status: 'Active',
      current_stage: 'Automated Post-Job SMS Review Sequences',
      progress_pct: 90,
      completed_milestones: [
        {
          title: 'Instant Post-Service Review Request SMS Engine',
          completed: true,
          date: '2026-08-05',
          description: 'Integrated direct 5-star review link sending triggered when technicians complete job estimates.',
        },
        {
          title: 'Negative Feedback Intercept Mechanism',
          completed: true,
          date: '2026-08-18',
          description: 'Routes any feedback below 4 stars directly to management before public posting.',
        },
      ],
      upcoming_milestones: [
        {
          title: 'Review Showcase Widget on Website Homepage',
          completed: false,
          date: '2026-09-25',
          description: 'Embedding verified live Google Reviews directly on the quote request page.',
        },
      ],
      latest_update: 'Acquired 19 new 5-star Google Reviews this month, bringing overall business rating to 4.9 stars across 142 reviews.',
      agency_notes_for_client: 'Your review momentum is outperforming 3 nearest competitors, which directly reinforces Google Map Pack rankings.',
      updated_at: new Date().toISOString(),
    },
  ];
  setStored(SERVICES_KEY, defaultServices);

  // Seed Deliverables
  const defaultDeliverables: ClientDeliverable[] = [
    {
      deliverable_id: 'del_01',
      client_id: primaryClientId,
      title: 'Q3 Technical SEO Audit & Core Web Vitals Report',
      service_name: 'Website SEO',
      status: 'Approved',
      date: '2026-08-12',
      file_type: 'PDF Document',
      file_size: '3.8 MB',
      file_url: '#',
      summary: 'Detailed performance breakdown highlighting speed improvements and schema markup enhancements applied to your site.',
      comments: [
        {
          id: 'c1',
          author_name: 'Sophia (Marketing Charm Agency)',
          author_role: 'Agency',
          message: 'All mobile speed fixes have been confirmed live in Google Search Console.',
          timestamp: '2026-08-12T14:30:00Z',
        },
        {
          id: 'c2',
          author_name: 'Dave Martinez',
          author_role: 'Client',
          message: 'Page speed is noticeably faster on mobile phones. Approved.',
          timestamp: '2026-08-13T09:15:00Z',
        },
      ],
    },
    {
      deliverable_id: 'del_02',
      client_id: primaryClientId,
      title: 'Localized Landing Pages Blueprint & Conversion Wireframes',
      service_name: 'Website SEO',
      status: 'Ready for Review',
      date: '2026-09-04',
      file_type: 'Design Blueprint',
      file_size: '5.2 MB',
      file_url: '#',
      summary: 'Wireframes and copy drafts for dedicated service area pages targeting Beaverton, Hillsboro, and Lake Oswego.',
      comments: [
        {
          id: 'c3',
          author_name: 'Account Lead (Marketing Charm Agency)',
          author_role: 'Agency',
          message: 'Please review the proposed copy and confirm the list of local emergency zip codes we should feature.',
          timestamp: '2026-09-04T16:00:00Z',
        },
      ],
    },
    {
      deliverable_id: 'del_03',
      client_id: primaryClientId,
      title: 'Google Map Pack Geogrid Baseline Ranking Report',
      service_name: 'Local Search & GMB',
      status: 'Delivered',
      date: '2026-08-20',
      file_type: 'Interactive Map PDF',
      file_size: '4.1 MB',
      file_url: '#',
      summary: 'Heatmap visualization showing your Google Maps rankings for "emergency plumber" across a 15-mile service radius.',
      comments: [],
    },
    {
      deliverable_id: 'del_04',
      client_id: primaryClientId,
      title: 'Autumn Emergency Freeze Prevention Ad Creatives',
      service_name: 'Google Ads & Meta',
      status: 'In Progress',
      date: '2026-09-15',
      file_type: 'Creative Assets Bundle',
      file_size: '12.4 MB',
      file_url: '#',
      summary: 'Ad copy and banner variations prepared for seasonal pipe burst and winter prep campaigns.',
      comments: [],
    },
  ];
  setStored(DELIVERABLES_KEY, defaultDeliverables);

  // Seed Performance Reports
  const defaultReports: ClientPerformanceReport[] = [
    {
      report_id: 'rep_august_2026',
      client_id: primaryClientId,
      title: 'August 2026 Comprehensive Digital Growth Report',
      report_type: 'Monthly Report',
      period: 'August 2026',
      created_at: '2026-09-01T08:00:00Z',
      status: 'Published',
      executive_summary:
        'August was a standout month for West Coast Plumbing & Rooter. Organic Google Maps visibility expanded by +26.5%, driving a 42.3% surge in qualified inbound estimate inquiries. Technical PageSpeed remediation resolved mobile drop-offs, cutting bounce rates by nearly half.',
      highlights: [
        'Total Inbound Calls Generated: 112 direct telephone estimates (up from 81 in July)',
        'Captured Rank #2 on Google Maps for "emergency plumber near me" in core service radius',
        'Acquired 19 verified 5-star Google Reviews with zero negative escalations',
        'Website mobile loading speed improved from 4.8s down to 1.4s',
      ],
      work_completed: [
        'Implemented custom LocalBusiness Schema markup across all service pages',
        'Optimized Google Business Profile categories, service radius, and photo assets',
        'Launched automated SMS review collection sequences for completed service calls',
        'Refined Google Local Services Ads bid strategy and negative keyword filters',
      ],
      metrics: {
        impressions: { value: 42850, change_pct: 28.4 },
        website_traffic: { value: 3420, change_pct: 34.1 },
        qualified_inquiries: { value: 148, change_pct: 42.3 },
        calls_generated: { value: 112, change_pct: 38.2 },
        google_maps_views: { value: 18900, change_pct: 26.5 },
        avg_search_position: { value: 3.2, change_pct: -1.8 },
      },
      insights: [
        'Evening searches (between 5 PM and 9 PM) generated 32% of all emergency inquiries, validating the need for extended 24/7 call forwarding.',
        'Sewer line replacement and trenchless repiping showed the highest inquiry-to-closed estimate ratio ($4,200 avg ticket).',
      ],
      challenges: [
        'Competition in neighboring Hillsboro increased ad cost per click by 6% on broad keywords, which we mitigated using exact-match emergency terms.',
      ],
      recommendations: [
        'Launch dedicated service area landing pages for Beaverton and Hillsboro to increase organic lead volume without raising paid ad spend.',
        'Implement an on-site financing calculator for high-ticket repiping and sewer replacements.',
      ],
      next_month_plan: [
        'Publish Beaverton & Hillsboro localized landing pages',
        'Deploy review showcase widget on website header',
        'Launch Autumn pipe freeze campaign creatives ahead of cold weather',
      ],
    },
    {
      report_id: 'rep_july_2026',
      client_id: primaryClientId,
      title: 'July 2026 Performance & Foundation Review',
      report_type: 'Monthly Report',
      period: 'July 2026',
      created_at: '2026-08-01T08:00:00Z',
      status: 'Published',
      executive_summary:
        'July established the digital foundation for West Coast Plumbing & Rooter. We initiated technical optimization, claimed local citation profiles, and restructured Google Ads campaigns for maximum local relevancy.',
      highlights: [
        'Initial technical audit completed and mobile latency bottlenecks resolved',
        '81 direct estimate phone calls tracked across channels',
        'Google Guaranteed LSA badge approved and activated',
      ],
      work_completed: [
        'Core Web Vitals remediation',
        'Directory citation cleanup and address synchronization',
        'Google LSA setup and license verification',
      ],
      metrics: {
        impressions: { value: 33370, change_pct: 15.2 },
        website_traffic: { value: 2550, change_pct: 18.0 },
        qualified_inquiries: { value: 104, change_pct: 21.0 },
        calls_generated: { value: 81, change_pct: 19.5 },
        google_maps_views: { value: 14920, change_pct: 14.8 },
        avg_search_position: { value: 5.0, change_pct: -0.6 },
      },
      insights: ['Mobile searchers represent 78% of all emergency repair inquiries.'],
      challenges: ['Previous agency left fragmented directory listings under duplicate addresses.'],
      recommendations: ['Accelerate review collection to match top 3 local competitors.'],
      next_month_plan: ['Launch automated post-job review request system.'],
    },
  ];
  setStored(REPORTS_KEY, defaultReports);

  // Seed Approvals
  const defaultApprovals: ClientApproval[] = [
    {
      approval_id: 'appr_01',
      client_id: primaryClientId,
      title: 'Approve Localized Landing Pages Blueprint & Beaverton Service Radius',
      category: 'Website Changes',
      description:
        'We have designed high-converting service area landing pages targeting Beaverton and Hillsboro homeowners. These pages highlight emergency water line repairs and trenchless sewer replacements.',
      supporting_info: 'Deliverable Blueprint #DEL-02 attached. Estimated turnaround upon approval: 4 business days.',
      status: 'Pending',
      requested_at: new Date(Date.now() - 86400000).toISOString(),
      history: [
        {
          action: 'Requested',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          user_name: 'Sophia (Marketing Charm Agency)',
          user_role: 'Agency Lead',
          note: 'Submitted for client review following technical wireframe completion.',
        },
      ],
    },
    {
      approval_id: 'appr_02',
      client_id: primaryClientId,
      title: 'Seasonal Budget Allocation Adjustment for Autumn Freeze Campaign',
      category: 'Budget Recommendations',
      description:
        'Recommendation to shift $300 of monthly ad spend from general drain cleaning into emergency freeze prevention and pipe insulation ahead of temperature drops.',
      supporting_info: 'Total monthly retainer and overall advertising spend remains unchanged; this optimizes keyword allocation only.',
      status: 'Pending',
      requested_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      history: [
        {
          action: 'Requested',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          user_name: 'Aria (Paid Ads Specialist)',
          user_role: 'Agency Strategist',
          note: 'Seasonal optimization recommendation submitted.',
        },
      ],
    },
    {
      approval_id: 'appr_03',
      client_id: primaryClientId,
      title: 'Deploy Automated Post-Service SMS Review Request Funnel',
      category: 'Marketing Strategy',
      description:
        'Automation that dispatches a polite 5-star Google Review invite via text message 30 minutes after dispatch marks an estimate complete.',
      supporting_info: 'Includes 1-click Google Maps review link with automatic negative feedback intercept.',
      status: 'Approved',
      requested_at: '2026-08-03T10:00:00Z',
      responded_at: '2026-08-04T11:20:00Z',
      responded_by: {
        user_id: 'usr_dave_01',
        name: 'Dave Martinez',
        email: 'dave@westcoastplumbing.com',
      },
      client_feedback: 'Looks good. Let us roll this out to all field technicians.',
      history: [
        {
          action: 'Requested',
          timestamp: '2026-08-03T10:00:00Z',
          user_name: 'Sophia (Marketing Charm Agency)',
          user_role: 'Agency Lead',
        },
        {
          action: 'Viewed',
          timestamp: '2026-08-04T09:12:00Z',
          user_name: 'Dave Martinez',
          user_role: 'Client Owner',
        },
        {
          action: 'Approved',
          timestamp: '2026-08-04T11:20:00Z',
          user_name: 'Dave Martinez',
          user_role: 'Client Owner',
          note: 'Approved for field deployment.',
        },
      ],
    },
  ];
  setStored(APPROVALS_KEY, defaultApprovals);

  // Seed Client Requests
  const defaultRequests: ClientRequest[] = [
    {
      request_id: 'req_01',
      client_id: primaryClientId,
      submitted_by: {
        user_id: 'usr_sarah_02',
        name: 'Sarah Jenkins',
        email: 'sarah@westcoastplumbing.com',
        role: 'Operations Director',
      },
      category: 'Website Change',
      subject: 'Update Weekend Emergency Callout Phone Number',
      description:
        'We have shifted our weekend emergency call routing to a dedicated answering service line at (503) 555-0199. Please update the click-to-call buttons across the website.',
      priority: 'High',
      status: 'In Progress',
      internal_task_id: 'task_op_081',
      agency_response: 'Update is currently staged on staging server. Testing click-to-call tracking before pushing live today.',
      response_date: new Date(Date.now() - 12 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      request_id: 'req_02',
      client_id: primaryClientId,
      submitted_by: {
        user_id: 'usr_dave_01',
        name: 'Dave Martinez',
        email: 'dave@westcoastplumbing.com',
        role: 'Client Owner',
      },
      category: 'Marketing Request',
      subject: 'Request Water Heater Financing Banner on Homepage',
      description:
        'We partnered with Synchrony for 0% 12-month financing on tankless water heater installations. Can we feature this prominently on the home page hero?',
      priority: 'Medium',
      status: 'Under Review',
      internal_task_id: 'task_op_082',
      agency_response: 'Wireframing a modern badge and banner for the homepage hero section that matches your brand colors.',
      response_date: new Date(Date.now() - 4 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ];
  setStored(REQUESTS_KEY, defaultRequests);

  // Seed Shared Documents
  const defaultDocuments: SharedDocument[] = [
    {
      document_id: 'doc_01',
      client_id: primaryClientId,
      title: 'August 2026 Executive Performance Report.pdf',
      category: 'Reports',
      visibility: 'Share with Client',
      file_type: 'pdf',
      file_size: '2.6 MB',
      file_url: '#',
      description: 'Official monthly performance digest with Google Maps and organic rank audit.',
      shared_at: '2026-09-01T09:00:00Z',
      shared_by: 'Sophia (AI Sales & Client Rep)',
      download_count: 3,
      last_viewed_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      document_id: 'doc_02',
      client_id: primaryClientId,
      title: 'Technical Infrastructure & Schema Architecture Audit.pdf',
      category: 'Audit Documents',
      visibility: 'Share with Client',
      file_type: 'pdf',
      file_size: '4.1 MB',
      file_url: '#',
      description: 'Full technical diagnostic documenting Core Web Vitals remediation and schema validation.',
      shared_at: '2026-07-30T14:00:00Z',
      shared_by: 'MCA Technical Operations',
      download_count: 5,
      last_viewed_at: '2026-08-15T11:00:00Z',
    },
    {
      document_id: 'doc_03',
      client_id: primaryClientId,
      title: 'Marketing Charm Agency Client Retainer Agreement.pdf',
      category: 'Contracts',
      visibility: 'Share with Client',
      file_type: 'pdf',
      file_size: '1.2 MB',
      file_url: '#',
      description: 'Signed digital growth agreement and service level terms.',
      shared_at: '2026-07-15T10:00:00Z',
      shared_by: 'Marketing Charm Agency Legal',
      download_count: 2,
    },
    {
      document_id: 'doc_04',
      client_id: primaryClientId,
      title: 'Q4 Local Domination & Multi-Channel Strategy Blueprint.pdf',
      category: 'Strategy Documents',
      visibility: 'Share with Client',
      file_type: 'pdf',
      file_size: '5.8 MB',
      file_url: '#',
      description: 'Strategic roadmap for service area expansion and winter emergency campaign rollout.',
      shared_at: '2026-08-25T16:00:00Z',
      shared_by: 'Sophia (AI Strategy Director)',
      download_count: 4,
      last_viewed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
  setStored(DOCUMENTS_KEY, defaultDocuments);

  // Seed Client Messages (Strictly separate from internal notes!)
  const defaultMessages: ClientMessage[] = [
    {
      message_id: 'msg_01',
      client_id: primaryClientId,
      sender_type: 'agency',
      sender_name: 'Sophia (Marketing Charm Agency)',
      sender_email: 'sophia@marketingcharmagency.com',
      sender_role: 'AI Client Concierge & Acquisition Lead',
      category: 'General',
      subject: 'Welcome to your MCA Client Portal!',
      content:
        'Hi Dave and Sarah, welcome to your dedicated Marketing Charm Agency Client Portal! Here you can monitor live service milestones, download monthly performance reports, submit change requests, and review pending creative approvals.',
      read_by_client: true,
      read_by_agency: true,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      message_id: 'msg_02',
      client_id: primaryClientId,
      sender_type: 'client',
      sender_name: 'Dave Martinez',
      sender_email: 'dave@westcoastplumbing.com',
      sender_role: 'Client Owner',
      category: 'Service Question',
      subject: 'Question on call volume spike',
      content:
        'Hey Sophia, we noticed a sharp increase in emergency water heater inquiries over the weekend. Are those coming primarily from the Google Maps listing or the new Local Services Ads?',
      read_by_client: true,
      read_by_agency: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      message_id: 'msg_03',
      client_id: primaryClientId,
      sender_type: 'agency',
      sender_name: 'Sophia (Marketing Charm Agency)',
      sender_email: 'sophia@marketingcharmagency.com',
      sender_role: 'AI Client Concierge & Acquisition Lead',
      category: 'Service Question',
      subject: 'Re: Question on call volume spike',
      content:
        'Great observation Dave! 68% of the weekend calls were driven directly by your Google Business Profile, which ranked #2 for "emergency water heater repair Portland". The remaining 32% came through your Google Guaranteed LSA placement. Both channels are converting at peak efficiency.',
      read_by_client: true,
      read_by_agency: true,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
  setStored(MESSAGES_KEY, defaultMessages);

  // Seed Onboarding Progress
  const defaultOnboarding: ClientOnboardingProgress = {
    client_id: primaryClientId,
    current_step: 4,
    total_steps: 6,
    steps: [
      {
        id: 'onb_01',
        title: 'Complete Business Information',
        description: 'Verify primary business address, licensing details, and operating hours.',
        completed: true,
        action_label: 'Verified',
        category: 'Business Profile',
      },
      {
        id: 'onb_02',
        title: 'Confirm Primary Communication Contacts',
        description: 'Establish dispatch and billing notification recipients.',
        completed: true,
        action_label: 'Confirmed',
        category: 'Contacts',
      },
      {
        id: 'onb_03',
        title: 'Provide Brand Assets & High-Res Work Photos',
        description: 'Upload logo files, truck wrap photos, and team imagery for local ads.',
        completed: true,
        action_label: 'Assets Received',
        category: 'Brand',
      },
      {
        id: 'onb_04',
        title: 'Review Service Details & Priority Offerings',
        description: 'Target margin analysis for water heaters, trenchless sewer, and repiping.',
        completed: true,
        action_label: 'Target Scope Confirmed',
        category: 'Strategy',
      },
      {
        id: 'onb_05',
        title: 'Review Access Requirements (GBP, Analytics, Ads)',
        description: 'Grant delegated manager access following safe access instructions (no password sharing).',
        completed: false,
        action_label: 'Access In Progress',
        category: 'Technical Access',
      },
      {
        id: 'onb_06',
        title: 'Schedule Official Strategy Kickoff Call',
        description: 'Join your 30-minute growth kickoff with your dedicated account lead.',
        completed: false,
        action_label: 'Schedule Session',
        category: 'Kickoff',
      },
    ],
  };
  setStored(ONBOARDING_KEY, defaultOnboarding);

  // Seed Access Requests (Never asks for client passwords!)
  const defaultAccess: ClientAccessRequest[] = [
    {
      access_id: 'acc_01',
      client_id: primaryClientId,
      platform: 'Google Business Profile',
      required: true,
      why_needed: 'Enables our team to update service hours, upload verified work photos, and optimize local map categories.',
      instructions: [
        'Open business.google.com and sign in with your primary Google account.',
        'Navigate to "Business Profile Settings" → "Managers" → "Add Manager".',
        'Enter our agency delegate email: access@marketingcharmagency.com.',
        'Select the role: "Manager" (You remain the Primary Owner). Click Invite.',
      ],
      status: 'Granted & Verified',
      verified_at: '2026-07-26T15:00:00Z',
    },
    {
      access_id: 'acc_02',
      client_id: primaryClientId,
      platform: 'Google Search Console',
      required: true,
      why_needed: 'Allows monitoring of organic search impressions, keyword queries, and technical crawl health.',
      instructions: [
        'Open search.google.com/search-console.',
        'Select your domain property.',
        'Go to "Settings" → "Users and Permissions" → "Add User".',
        'Enter: access@marketingcharmagency.com and set permission to "Full".',
      ],
      status: 'Granted & Verified',
      verified_at: '2026-07-27T11:00:00Z',
    },
    {
      access_id: 'acc_03',
      client_id: primaryClientId,
      platform: 'Google Analytics',
      required: true,
      why_needed: 'Required to measure website traffic, conversion funnels, and phone call attribution.',
      instructions: [
        'Open analytics.google.com and go to Admin (bottom left gear icon).',
        'Click "Property Access Management" → "+" → "Add Users".',
        'Add: access@marketingcharmagency.com with "Editor" permissions.',
      ],
      status: 'Granted & Verified',
      verified_at: '2026-07-27T11:30:00Z',
    },
    {
      access_id: 'acc_04',
      client_id: primaryClientId,
      platform: 'Website CMS',
      required: true,
      why_needed: 'Necessary to publish localized landing pages, optimize page load speed, and add schema tags.',
      instructions: [
        'Log in to your WordPress or Webflow administration dashboard.',
        'Go to "Users" → "Add New".',
        'Create a dedicated account for webmaster@marketingcharmagency.com with "Administrator" role.',
        'Do NOT email us your personal password; use the automated invite generator.',
      ],
      status: 'Pending Client Access',
    },
    {
      access_id: 'acc_05',
      client_id: primaryClientId,
      platform: 'Google Ads',
      required: true,
      why_needed: 'Allows us to link your account to our Agency Manager (MCC) for Local Services Ads.',
      instructions: [
        'Provide your 10-digit Google Ads Customer ID (shown in top right of ads.google.com).',
        'Our team will send a link request from Marketing Charm Agency MCC.',
        'Accept the link request under "Tools & Settings" → "Access and Security" → "Managers".',
      ],
      status: 'Granted & Verified',
      verified_at: '2026-08-01T09:00:00Z',
    },
  ];
  setStored(ACCESS_KEY, defaultAccess);

  // Seed Meetings
  const defaultMeetings: ClientMeeting[] = [
    {
      meeting_id: 'meet_01',
      client_id: primaryClientId,
      title: 'September Digital Growth Review & Campaign Strategy',
      meeting_type: 'Monthly Strategy Review',
      scheduled_for: new Date(Date.now() + 24 * 3600000).toISOString(),
      duration_minutes: 30,
      status: 'Upcoming',
      host_name: 'Sophia & Agency Account Lead',
      attendees: ['Dave Martinez', 'Sarah Jenkins', 'Sophia (AI Rep)', 'Marcus Vance (Senior Strategist)'],
      meeting_link: 'https://meet.google.com/mca-growth-westcoast',
      meeting_notes: 'Agenda: 1. August Performance Review. 2. Beaverton & Hillsboro landing pages approval. 3. Autumn emergency pipe burst campaign preparation.',
      action_items: [
        'Review localized landing page blueprints prior to call',
        'Confirm weekend emergency call forwarding number',
      ],
    },
    {
      meeting_id: 'meet_02',
      client_id: primaryClientId,
      title: 'Official Client Onboarding & Technical Scoping',
      meeting_type: 'Kickoff Session',
      scheduled_for: '2026-07-25T17:00:00Z',
      duration_minutes: 45,
      status: 'Completed',
      host_name: 'Agency Account Lead',
      attendees: ['Dave Martinez', 'Sarah Jenkins'],
      meeting_notes: 'Kickoff confirmed. Target focus established on high-ticket sewer and water heater jobs.',
      action_items: ['Complete access delegation for Google Business Profile', 'Deliver brand logo assets'],
    },
  ];
  setStored(MEETINGS_KEY, defaultMeetings);

  // Seed Billing Info (Client-Safe: No internal profit margins!)
  const defaultBilling: ClientBillingInfo = {
    client_id: primaryClientId,
    current_plan: 'Full-Funnel Local Domination Retainer',
    monthly_retainer: 2400,
    payment_status: 'Current - In Good Standing',
    next_billing_date: '2026-10-01',
    invoices: [
      {
        invoice_number: 'INV-2026-0822',
        date: '2026-09-01',
        amount: 2400,
        status: 'Paid',
        service_period: 'September 1, 2026 - September 30, 2026',
        download_label: 'Download Invoice PDF',
      },
      {
        invoice_number: 'INV-2026-0711',
        date: '2026-08-01',
        amount: 2400,
        status: 'Paid',
        service_period: 'August 1, 2026 - August 31, 2026',
        download_label: 'Download Invoice PDF',
      },
      {
        invoice_number: 'INV-2026-0601',
        date: '2026-07-15',
        amount: 2900, // Retainer + Setup
        status: 'Paid',
        service_period: 'July 15, 2026 - August 14, 2026 (Includes Onboarding Setup)',
        download_label: 'Download Invoice PDF',
      },
    ],
  };
  setStored(BILLING_KEY, defaultBilling);

  // Seed Notifications
  const defaultNotifications: ClientPortalNotification[] = [
    {
      notification_id: 'notif_01',
      client_id: primaryClientId,
      title: 'August Growth Report Ready',
      message: 'Your August 2026 performance report is published. Inbound inquiries increased +42.3%!',
      type: 'report',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      link_tab: 'reports',
    },
    {
      notification_id: 'notif_02',
      client_id: primaryClientId,
      title: 'Approval Required: Landing Pages Blueprint',
      message: 'New localized Beaverton & Hillsboro landing pages require client approval before deployment.',
      type: 'approval',
      read: false,
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      link_tab: 'approvals',
    },
    {
      notification_id: 'notif_03',
      client_id: primaryClientId,
      title: 'Upcoming Strategy Review Tomorrow',
      message: 'Monthly Strategy Review with Sophia and account team scheduled for tomorrow at 2:00 PM.',
      type: 'meeting',
      read: true,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      link_tab: 'meetings',
    },
  ];
  setStored(NOTIFICATIONS_KEY, defaultNotifications);

  // Seed initial invitations
  const defaultInvitations: ClientInvitation[] = [
    {
      invitation_id: 'inv_01',
      client_id: primaryClientId,
      client_business_name: primaryBizName,
      email: 'accounting@westcoastplumbing.com',
      name: 'Jessica Vance',
      role: 'Client Admin',
      token: 'tok_mca_inv_782910',
      status: 'Pending',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    },
  ];
  setStored(INVITATIONS_KEY, defaultInvitations);
}

// Automatically ensure seed data exists on load
if (typeof window !== 'undefined') {
  initClientPortalData();
}

// ==========================================================
// 2. AUTHENTICATION & SESSION MANAGEMENT
// ==========================================================

export function getClientPortalSession(): ClientPortalSession | null {
  return getStored<ClientPortalSession | null>(SESSION_KEY, null);
}

export function setClientPortalSession(session: ClientPortalSession | null): void {
  setStored(SESSION_KEY, session);
}

export function loginClientPortal(
  email: string,
  _password?: string
): { success: boolean; session?: ClientPortalSession; error?: string } {
  initClientPortalData();
  const users = getStored<ClientPortalUser[]>(USERS_KEY, []);
  const cleanEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return {
      success: false,
      error: 'No client portal account found with this email address. Please check your credentials or request an invitation.',
    };
  }

  if (user.status === 'Suspended') {
    return {
      success: false,
      error: 'This client account access has been suspended. Please contact Marketing Charm Agency support.',
    };
  }

  // Update last login
  user.last_login = new Date().toISOString();
  setStored(USERS_KEY, users);

  // Log activity
  logClientPortalActivity({
    client_id: user.client_id,
    user_id: user.user_id,
    user_name: user.name,
    activity_type: 'Login',
    resource_type: 'auth',
    resource_id: user.user_id,
    details: `Signed in to MCA Client Portal from web browser.`,
  });

  const clients = getClients();
  const client = clients.find((c) => c.client_id === user.client_id);
  const clientBizName = client?.business_name || 'West Coast Plumbing & Rooter';

  const session: ClientPortalSession = {
    token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user,
    client_business_name: clientBizName,
    is_agency_preview: false,
  };

  setClientPortalSession(session);
  return { success: true, session };
}

export function loginAsAgencyPreview(clientId: string): ClientPortalSession {
  initClientPortalData();
  const users = getStored<ClientPortalUser[]>(USERS_KEY, []);
  let user = users.find((u) => u.client_id === clientId && u.role === 'Client Owner');

  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  const clientBizName = client?.business_name || 'Client Business';

  if (!user) {
    // Generate simulated owner session
    user = {
      user_id: `usr_preview_${clientId}`,
      client_id: clientId,
      name: client?.primary_contact?.name || 'Client Executive',
      email: client?.primary_contact?.email || 'owner@clientdomain.com',
      role: 'Client Owner',
      status: 'Active',
      title: 'Authorized Executive',
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      notification_preferences: {
        email_notifications: true,
        portal_notifications: true,
        report_notifications: true,
        approval_notifications: true,
        service_updates: true,
      },
    };
  }

  const session: ClientPortalSession = {
    token: `preview_${Date.now()}`,
    user,
    client_business_name: clientBizName,
    is_agency_preview: true,
  };

  setClientPortalSession(session);
  return session;
}

export function logoutClientPortal(): void {
  setClientPortalSession(null);
}

// ==========================================================
// 3. ORGANIZATION DATA ISOLATION QUERIES
// ==========================================================

export function getClientUsers(clientId: string): ClientPortalUser[] {
  const users = getStored<ClientPortalUser[]>(USERS_KEY, []);
  return users.filter((u) => u.client_id === clientId);
}

export function getClientServices(clientId: string): ClientServiceProgress[] {
  const services = getStored<ClientServiceProgress[]>(SERVICES_KEY, []);
  const filtered = services.filter((s) => s.client_id === clientId);
  if (filtered.length > 0) return filtered;

  // Fallback to active services derived from Client record
  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  if (client) {
    return client.services.map((name, i) => ({
      service_id: `srv_${clientId}_${i}`,
      client_id: clientId,
      service_name: name,
      category: 'Agency Retainer Service',
      status: 'Active',
      current_stage: 'Active Execution & Quality Assurance',
      progress_pct: 70 + (i * 5) % 25,
      completed_milestones: [
        {
          title: 'Initial Scoping & Strategy Blueprint',
          completed: true,
          date: client.contract_start_date || '2026-08-01',
          description: 'Confirmed primary target inquiries and established baseline metrics.',
        },
      ],
      upcoming_milestones: [
        {
          title: 'Monthly Performance Review & Optimization Sweep',
          completed: false,
          date: '2026-09-30',
          description: 'Quarterly review of conversion metrics and local authority rankings.',
        },
      ],
      latest_update: `Service actively generating measurable inquiries. Performance pacing on target.`,
      agency_notes_for_client: 'Everything running smoothly with dedicated agency oversight.',
      updated_at: new Date().toISOString(),
    }));
  }
  return [];
}

export function getClientDeliverables(clientId: string): ClientDeliverable[] {
  const items = getStored<ClientDeliverable[]>(DELIVERABLES_KEY, []);
  return items.filter((d) => d.client_id === clientId);
}

export function getClientReports(clientId: string): ClientPerformanceReport[] {
  const items = getStored<ClientPerformanceReport[]>(REPORTS_KEY, []);
  return items.filter((r) => r.client_id === clientId);
}

export function getClientApprovals(clientId: string): ClientApproval[] {
  const items = getStored<ClientApproval[]>(APPROVALS_KEY, []);
  return items.filter((a) => a.client_id === clientId);
}

export function getClientRequests(clientId: string): ClientRequest[] {
  const items = getStored<ClientRequest[]>(REQUESTS_KEY, []);
  return items.filter((r) => r.client_id === clientId);
}

export function getClientDocuments(clientId: string): SharedDocument[] {
  const items = getStored<SharedDocument[]>(DOCUMENTS_KEY, []);
  // Only show documents explicitly marked as 'Share with Client' or 'Shared with Specific Client User'
  return items.filter((d) => d.client_id === clientId && d.visibility !== 'Internal Only');
}

export function getAllClientDocumentsForAgency(clientId: string): SharedDocument[] {
  const items = getStored<SharedDocument[]>(DOCUMENTS_KEY, []);
  return items.filter((d) => d.client_id === clientId);
}

export function getClientMessages(clientId: string): ClientMessage[] {
  const items = getStored<ClientMessage[]>(MESSAGES_KEY, []);
  return items.filter((m) => m.client_id === clientId);
}

export function getClientOnboarding(clientId: string): ClientOnboardingProgress {
  const progressList = getStored<ClientOnboardingProgress[]>(ONBOARDING_KEY, []);
  const found = progressList.find((o) => o.client_id === clientId);
  if (found) return found;

  // Derive from existing client if not present
  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  const steps = (client?.onboarding_checklist || []).map((t, idx) => ({
    id: t.id || `onb_${idx}`,
    title: t.title,
    description: t.description,
    completed: t.completed,
    action_label: t.completed ? 'Completed' : 'Pending',
    category: t.category,
    due_date: t.due_date,
  }));

  return {
    client_id: clientId,
    current_step: steps.filter((s) => s.completed).length,
    total_steps: steps.length || 6,
    steps: steps.length > 0 ? steps : [],
  };
}

export function getClientAccessRequests(clientId: string): ClientAccessRequest[] {
  const items = getStored<ClientAccessRequest[]>(ACCESS_KEY, []);
  return items.filter((a) => a.client_id === clientId);
}

export function getClientMeetings(clientId: string): ClientMeeting[] {
  const items = getStored<ClientMeeting[]>(MEETINGS_KEY, []);
  return items.filter((m) => m.client_id === clientId);
}

export function getClientBilling(clientId: string): ClientBillingInfo {
  const items = getStored<ClientBillingInfo[]>(BILLING_KEY, []);
  const found = items.find((b) => b.client_id === clientId);
  if (found) return found;

  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  const mrr = client?.actual_mrr || 2400;

  return {
    client_id: clientId,
    current_plan: 'Full-Funnel Local Growth Package',
    monthly_retainer: mrr,
    payment_status: 'Current - In Good Standing',
    next_billing_date: '2026-10-01',
    invoices: [
      {
        invoice_number: `INV-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().slice(0, 10),
        amount: mrr,
        status: 'Paid',
        service_period: 'Current Monthly Retainer Cycle',
        download_label: 'Download Invoice PDF',
      },
    ],
  };
}

export function getClientNotifications(clientId: string): ClientPortalNotification[] {
  const items = getStored<ClientPortalNotification[]>(NOTIFICATIONS_KEY, []);
  return items.filter((n) => n.client_id === clientId);
}

// ==========================================================
// 4. CLIENT MUTATIONS & WORKFLOW AUTOMATION
// ==========================================================

export function submitClientRequest(
  clientId: string,
  data: {
    category: ClientRequest['category'];
    subject: string;
    description: string;
    priority: ClientRequest['priority'];
    attachments?: Array<{ id: string; name: string; size: string }>;
  },
  user: ClientPortalUser
): ClientRequest {
  const allRequests = getStored<ClientRequest[]>(REQUESTS_KEY, []);
  const newReq: ClientRequest = {
    request_id: `req_${Date.now()}`,
    client_id: clientId,
    submitted_by: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    category: data.category,
    subject: data.subject,
    description: data.description,
    priority: data.priority,
    status: 'Submitted',
    attachments: data.attachments || [],
    internal_task_id: `task_agency_${Date.now().toString().slice(-4)}`,
    agency_response: 'Request received and routed to your account operations team.',
    response_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allRequests.unshift(newReq);
  setStored(REQUESTS_KEY, allRequests);

  // AUTOMATIC ROUTING: Create Internal Activity / Operational Task
  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  if (client?.original_lead_id) {
    addActivity({
      id: `act_${Date.now()}`,
      lead_id: client.original_lead_id,
      type: 'note_added',
      activity_type: 'note_added',
      channel: 'NOTE',
      title: `Client Request Submitted: ${data.subject}`,
      description: `Client ${user.name} (${user.role}) submitted a ${data.priority} priority ${data.category}: "${data.description}". Created internal task #${newReq.internal_task_id}.`,
      timestamp: new Date().toISOString(),
      author: user.name,
    });
  }

  // Log activity
  logClientPortalActivity({
    client_id: clientId,
    user_id: user.user_id,
    user_name: user.name,
    activity_type: 'Request Created',
    resource_type: 'request',
    resource_id: newReq.request_id,
    details: `Submitted ${data.category}: "${data.subject}"`,
  });

  // Create notification
  createPortalNotification({
    client_id: clientId,
    title: 'Request Submitted to Agency',
    message: `Your request "${data.subject}" has been assigned to operations for review.`,
    type: 'request',
    link_tab: 'requests',
  });

  return newReq;
}

export function respondToClientApproval(
  approvalId: string,
  action: 'Approve' | 'Request Changes' | 'Reject',
  user: ClientPortalUser,
  feedbackNote?: string
): ClientApproval | undefined {
  const allApprovals = getStored<ClientApproval[]>(APPROVALS_KEY, []);
  const index = allApprovals.findIndex((a) => a.approval_id === approvalId);
  if (index < 0) return undefined;

  const current = allApprovals[index];
  const newStatus =
    action === 'Approve'
      ? 'Approved'
      : action === 'Request Changes'
      ? 'Changes Requested'
      : 'Rejected';

  const historyEntry: ApprovalHistoryEntry = {
    action: action === 'Approve' ? 'Approved' : action === 'Request Changes' ? 'Changes Requested' : 'Rejected',
    timestamp: new Date().toISOString(),
    user_name: user.name,
    user_role: user.role,
    note: feedbackNote || `Client ${action.toLowerCase()}d this item.`,
  };

  const updated: ClientApproval = {
    ...current,
    status: newStatus,
    responded_at: new Date().toISOString(),
    responded_by: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    },
    client_feedback: feedbackNote || current.client_feedback,
    history: [historyEntry, ...current.history],
  };

  allApprovals[index] = updated;
  setStored(APPROVALS_KEY, allApprovals);

  // Log activity
  logClientPortalActivity({
    client_id: current.client_id,
    user_id: user.user_id,
    user_name: user.name,
    activity_type: 'Approval Submitted',
    resource_type: 'approval',
    resource_id: approvalId,
    details: `${action}d: "${current.title}". Note: ${feedbackNote || 'None'}`,
  });

  // Notify agency in Lead timeline
  const clients = getClients();
  const client = clients.find((c) => c.client_id === current.client_id);
  if (client?.original_lead_id) {
    addActivity({
      id: `act_${Date.now()}`,
      lead_id: client.original_lead_id,
      type: 'note_added',
      activity_type: 'note_added',
      channel: 'NOTE',
      title: `Client Approval ${newStatus}: ${current.title}`,
      description: `${user.name} has ${action.toLowerCase()}d "${current.title}". Feedback: ${feedbackNote || 'No feedback notes provided.'}`,
      timestamp: new Date().toISOString(),
      author: user.name,
    });
  }

  return updated;
}

export function sendClientMessage(
  clientId: string,
  user: ClientPortalUser,
  data: {
    category: ClientMessage['category'];
    content: string;
    subject?: string;
  }
): ClientMessage {
  const allMessages = getStored<ClientMessage[]>(MESSAGES_KEY, []);
  const newMsg: ClientMessage = {
    message_id: `msg_${Date.now()}`,
    client_id: clientId,
    sender_type: 'client',
    sender_name: user.name,
    sender_email: user.email,
    sender_role: user.role,
    category: data.category,
    subject: data.subject || 'Message from Client',
    content: data.content,
    read_by_client: true,
    read_by_agency: false,
    created_at: new Date().toISOString(),
  };

  allMessages.push(newMsg);
  setStored(MESSAGES_KEY, allMessages);

  // Log activity
  logClientPortalActivity({
    client_id: clientId,
    user_id: user.user_id,
    user_name: user.name,
    activity_type: 'Message Sent',
    resource_type: 'message',
    resource_id: newMsg.message_id,
    details: `Sent ${data.category} message: "${data.content.slice(0, 80)}..."`,
  });

  // Simulate automated friendly Sophia receipt if during normal hours
  setTimeout(() => {
    const freshMessages = getStored<ClientMessage[]>(MESSAGES_KEY, []);
    freshMessages.push({
      message_id: `msg_rep_${Date.now()}`,
      client_id: clientId,
      sender_type: 'agency',
      sender_name: 'Sophia (Marketing Charm Agency)',
      sender_email: 'sophia@marketingcharmagency.com',
      sender_role: 'AI Client Concierge',
      category: data.category,
      subject: `Re: ${data.subject || 'Your message'}`,
      content: `Hi ${user.name}, thank you for your message regarding ${data.category.toLowerCase()}. I have logged this with our account and operations team. We are actively reviewing it and will follow up shortly!`,
      read_by_client: false,
      read_by_agency: true,
      created_at: new Date().toISOString(),
    });
    setStored(MESSAGES_KEY, freshMessages);

    createPortalNotification({
      client_id: clientId,
      title: 'New Agency Reply from Sophia',
      message: `Sophia replied to your ${data.category.toLowerCase()} inquiry.`,
      type: 'message',
      link_tab: 'messages',
    });
  }, 2500);

  return newMsg;
}

export function addDeliverableComment(
  deliverableId: string,
  user: ClientPortalUser,
  message: string
): ClientDeliverable | undefined {
  const allDeliverables = getStored<ClientDeliverable[]>(DELIVERABLES_KEY, []);
  const item = allDeliverables.find((d) => d.deliverable_id === deliverableId);
  if (!item) return undefined;

  const newComment: DeliverableComment = {
    id: `com_${Date.now()}`,
    author_name: user.name,
    author_role: 'Client',
    message,
    timestamp: new Date().toISOString(),
  };

  item.comments.push(newComment);
  setStored(DELIVERABLES_KEY, allDeliverables);
  return item;
}

export function updateDeliverableStatus(
  deliverableId: string,
  newStatus: ClientDeliverable['status'],
  user: ClientPortalUser
): ClientDeliverable | undefined {
  const allDeliverables = getStored<ClientDeliverable[]>(DELIVERABLES_KEY, []);
  const item = allDeliverables.find((d) => d.deliverable_id === deliverableId);
  if (!item) return undefined;

  item.status = newStatus;
  setStored(DELIVERABLES_KEY, allDeliverables);

  logClientPortalActivity({
    client_id: item.client_id,
    user_id: user.user_id,
    user_name: user.name,
    activity_type: 'Approval Submitted',
    resource_type: 'deliverable' as any,
    resource_id: deliverableId,
    details: `Changed status to "${newStatus}" for ${item.title}`,
  });

  return item;
}

export function toggleOnboardingStep(
  clientId: string,
  stepId: string
): ClientOnboardingProgress | undefined {
  const allProgress = getStored<ClientOnboardingProgress[]>(ONBOARDING_KEY, []);
  let prog = allProgress.find((p) => p.client_id === clientId);
  if (!prog) {
    prog = getClientOnboarding(clientId);
    allProgress.push(prog);
  }

  const step = prog.steps.find((s) => s.id === stepId);
  if (step) {
    step.completed = !step.completed;
    step.action_label = step.completed ? 'Completed' : 'Pending';
  }

  prog.current_step = prog.steps.filter((s) => s.completed).length;
  setStored(ONBOARDING_KEY, allProgress);
  return prog;
}

export function logClientPortalActivity(activity: Omit<ClientPortalActivity, 'activity_id' | 'created_at'>): void {
  const activities = getStored<ClientPortalActivity[]>(ACTIVITIES_KEY, []);
  const newActivity: ClientPortalActivity = {
    ...activity,
    activity_id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  activities.unshift(newActivity);
  // Keep last 300 activities
  if (activities.length > 300) activities.length = 300;
  setStored(ACTIVITIES_KEY, activities);
}

export function getClientPortalActivities(clientId?: string): ClientPortalActivity[] {
  const activities = getStored<ClientPortalActivity[]>(ACTIVITIES_KEY, []);
  if (!clientId) return activities;
  return activities.filter((a) => a.client_id === clientId);
}

export function createPortalNotification(notification: Omit<ClientPortalNotification, 'notification_id' | 'read' | 'created_at'>): void {
  const notifications = getStored<ClientPortalNotification[]>(NOTIFICATIONS_KEY, []);
  const newNotif: ClientPortalNotification = {
    ...notification,
    notification_id: `notif_${Date.now()}`,
    read: false,
    created_at: new Date().toISOString(),
  };
  notifications.unshift(newNotif);
  setStored(NOTIFICATIONS_KEY, notifications);
}

export function markNotificationRead(notificationId: string): void {
  const notifications = getStored<ClientPortalNotification[]>(NOTIFICATIONS_KEY, []);
  const notif = notifications.find((n) => n.notification_id === notificationId);
  if (notif) {
    notif.read = true;
    setStored(NOTIFICATIONS_KEY, notifications);
  }
}

export function markAllNotificationsRead(clientId: string): void {
  const notifications = getStored<ClientPortalNotification[]>(NOTIFICATIONS_KEY, []);
  notifications.forEach((n) => {
    if (n.client_id === clientId) n.read = true;
  });
  setStored(NOTIFICATIONS_KEY, notifications);
}

// ==========================================================
// 5. INVITATIONS & TEAM MANAGEMENT
// ==========================================================

export function createClientInvitation(
  clientId: string,
  businessName: string,
  name: string,
  email: string,
  role: ClientUserRole
): ClientInvitation {
  const invitations = getStored<ClientInvitation[]>(INVITATIONS_KEY, []);
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const newInv: ClientInvitation = {
    invitation_id: `inv_${Date.now()}`,
    client_id: clientId,
    client_business_name: businessName,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    token,
    status: 'Pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  };

  invitations.unshift(newInv);
  setStored(INVITATIONS_KEY, invitations);
  return newInv;
}

export function getClientInvitations(clientId: string): ClientInvitation[] {
  const invitations = getStored<ClientInvitation[]>(INVITATIONS_KEY, []);
  return invitations.filter((i) => i.client_id === clientId);
}

export function revokeInvitation(invitationId: string): void {
  const invitations = getStored<ClientInvitation[]>(INVITATIONS_KEY, []);
  const inv = invitations.find((i) => i.invitation_id === invitationId);
  if (inv) {
    inv.status = 'Revoked';
    setStored(INVITATIONS_KEY, invitations);
  }
}

export function addClientUser(user: Omit<ClientPortalUser, 'user_id' | 'created_at'>): ClientPortalUser {
  const users = getStored<ClientPortalUser[]>(USERS_KEY, []);
  const newUser: ClientPortalUser = {
    ...user,
    user_id: `usr_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  setStored(USERS_KEY, users);
  return newUser;
}

export function removeClientUser(userId: string): void {
  const users = getStored<ClientPortalUser[]>(USERS_KEY, []);
  const filtered = users.filter((u) => u.user_id !== userId);
  setStored(USERS_KEY, filtered);
}

// ==========================================================
// 6. CONTENT SHARING CONTROL (INTERNAL vs CLIENT)
// ==========================================================

export function updateDocumentSharing(
  documentId: string,
  visibility: SharedDocument['visibility']
): SharedDocument | undefined {
  const docs = getStored<SharedDocument[]>(DOCUMENTS_KEY, []);
  const doc = docs.find((d) => d.document_id === documentId);
  if (doc) {
    doc.visibility = visibility;
    setStored(DOCUMENTS_KEY, docs);
  }
  return doc;
}

export function addSharedDocument(doc: Omit<SharedDocument, 'document_id' | 'download_count' | 'shared_at'>): SharedDocument {
  const docs = getStored<SharedDocument[]>(DOCUMENTS_KEY, []);
  const newDoc: SharedDocument = {
    ...doc,
    document_id: `doc_${Date.now()}`,
    download_count: 0,
    shared_at: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  setStored(DOCUMENTS_KEY, docs);
  return newDoc;
}

// ==========================================================
// 7. CLIENT PORTAL ANALYTICS FOR INTERNAL AGENCY
// ==========================================================

export function getClientPortalAnalytics(clientId: string): ClientPortalAnalytics {
  const clients = getClients();
  const client = clients.find((c) => c.client_id === clientId);
  const activities = getClientPortalActivities(clientId);
  const users = getClientUsers(clientId);
  const requests = getClientRequests(clientId);
  const approvals = getClientApprovals(clientId);

  const totalLogins = activities.filter((a) => a.activity_type === 'Login').length;
  const reportsViewed = activities.filter((a) => a.activity_type === 'Report Viewed').length;
  const docsDownloaded = activities.filter((a) => a.activity_type === 'File Downloaded' || a.activity_type === 'Document Viewed').length;
  const openRequests = requests.filter((r) => r.status !== 'Completed' && r.status !== 'Closed').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending').length;

  const lastLogin = users.reduce((latest, u) => {
    if (!u.last_login) return latest;
    if (!latest || new Date(u.last_login) > new Date(latest)) return u.last_login;
    return latest;
  }, undefined as string | undefined);

  let engagement: 'High' | 'Moderate' | 'Low' = 'Moderate';
  if (totalLogins > 8 || reportsViewed > 3) engagement = 'High';
  else if (totalLogins === 0) engagement = 'Low';

  return {
    client_id: clientId,
    business_name: client?.business_name || 'Client',
    total_logins: totalLogins,
    last_login_at: lastLogin,
    reports_viewed_count: reportsViewed,
    documents_downloaded_count: docsDownloaded,
    open_requests_count: openRequests,
    pending_approvals_count: pendingApprovals,
    engagement_level: engagement,
  };
}

// ==========================================================
// 8. AI REPORT EXPLANATION (CLIENT-SAFE CONTEXT)
// ==========================================================

export async function askSophiaAboutReport(
  report: ClientPerformanceReport,
  question: string,
  businessName: string
): Promise<string> {
  try {
    const response = await fetch('/api/client-portal/sophia-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: businessName,
        report_period: report.period,
        executive_summary: report.executive_summary,
        highlights: report.highlights,
        work_completed: report.work_completed,
        metrics: report.metrics,
        next_month_plan: report.next_month_plan,
        question,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.explanation) {
        return data.explanation;
      }
    }
  } catch (e) {
    console.warn('Backend Sophia explanation endpoint unavailable, using high-fidelity client-safe fallback.');
  }

  // Client-Safe Deterministic Heuristic Fallback (Strictly No Internal Leaks!)
  const q = question.toLowerCase();
  if (q.includes('improve') || q.includes('better') || q.includes('grow')) {
    return `In ${report.period}, qualified inbound inquiries grew by +${report.metrics.qualified_inquiries.change_pct}%, with direct phone calls increasing to ${report.metrics.calls_generated.value}. This improvement was primarily driven by ranking advancements on Google Maps and our technical speed optimization, which reduced mobile loading latency.`;
  }
  if (q.includes('traffic') || q.includes('visitors') || q.includes('click')) {
    return `Website traffic reached ${report.metrics.website_traffic.value.toLocaleString()} visitors (+${report.metrics.website_traffic.change_pct}% increase). The highest volume came from mobile users searching for emergency plumbing services in your primary service radius.`;
  }
  if (q.includes('next') || q.includes('working on') || q.includes('future') || q.includes('plan')) {
    return `Our priority for next month includes: ${report.next_month_plan.join('; ')}. This will expand your coverage across neighboring zip codes while maintaining high Google Maps visibility.`;
  }
  if (q.includes('challenge') || q.includes('issue') || q.includes('drop')) {
    return `The main challenge noted for ${report.period} was: "${report.challenges[0] || 'Increased competitor bidding on broad terms'}". We responded by tightening search term filters to focus your investment strictly on high-intent, emergency calls.`;
  }

  return `Based on your ${report.period} report, your digital presence generated ${report.metrics.calls_generated.value} direct inquiries with overall impressions rising +${report.metrics.impressions.change_pct}%. Our ongoing plan is focused on ${report.next_month_plan[0] || 'expanding local service pages'}. If you need any adjustments or deeper analysis, your account manager is available for your upcoming strategy session!`;
}

// ==========================================================
// 9. INTERNAL AGENCY PORTAL ADMINISTRATION CONTROLS
// ==========================================================

const ACCESS_DISABLED_KEY = 'mca_client_portal_disabled_clients_v1';

export function isClientPortalAccessDisabled(clientId: string): boolean {
  const disabledList = getStored<string[]>(ACCESS_DISABLED_KEY, []);
  return disabledList.includes(clientId);
}

export function toggleClientPortalAccess(clientId: string, disabled: boolean): boolean {
  const disabledList = getStored<string[]>(ACCESS_DISABLED_KEY, []);
  let updatedList: string[];
  if (disabled) {
    updatedList = Array.from(new Set([...disabledList, clientId]));
  } else {
    updatedList = disabledList.filter((id) => id !== clientId);
  }
  setStored(ACCESS_DISABLED_KEY, updatedList);

  logClientPortalActivity({
    client_id: clientId,
    user_id: 'agency_admin',
    user_name: 'Agency Operations Admin',
    activity_type: 'Approval Submitted',
    resource_type: 'auth',
    resource_id: clientId,
    details: disabled ? 'Portal access was disabled by agency operations' : 'Portal access was enabled by agency operations',
  });

  return disabled;
}

export function updateClientRequestStatus(
  requestId: string,
  newStatus: ClientRequest['status'],
  agencyResponse?: string,
  internalTaskId?: string
): ClientRequest | undefined {
  const allRequests = getStored<ClientRequest[]>(REQUESTS_KEY, []);
  const req = allRequests.find((r) => r.request_id === requestId);
  if (!req) return undefined;

  req.status = newStatus;
  req.updated_at = new Date().toISOString();
  if (agencyResponse) {
    req.agency_response = agencyResponse;
    req.response_date = new Date().toISOString();
  }
  if (internalTaskId) {
    req.internal_task_id = internalTaskId;
  }

  setStored(REQUESTS_KEY, allRequests);

  createPortalNotification({
    client_id: req.client_id,
    title: `Request Status: ${newStatus}`,
    message: `Your request "${req.subject}" has been updated to "${newStatus}".`,
    type: 'request',
    link_tab: 'requests',
  });

  logClientPortalActivity({
    client_id: req.client_id,
    user_id: 'agency_admin',
    user_name: 'Agency Operations Lead',
    activity_type: 'Request Created',
    resource_type: 'request',
    resource_id: requestId,
    details: `Agency marked request as "${newStatus}". Response: ${agencyResponse || 'None'}`,
  });

  return req;
}

export function createAgencyClientApproval(
  clientId: string,
  data: {
    title: string;
    category: ClientApproval['category'];
    description: string;
    supporting_links?: string[];
    deadline?: string;
  }
): ClientApproval {
  const allApprovals = getStored<ClientApproval[]>(APPROVALS_KEY, []);
  const newApproval: ClientApproval = {
    approval_id: `appr_${Date.now()}`,
    client_id: clientId,
    title: data.title,
    category: data.category,
    description: data.description,
    status: 'Pending',
    requested_at: new Date().toISOString(),
    supporting_info: data.supporting_links?.join(', '),
    history: [
      {
        action: 'Requested',
        timestamp: new Date().toISOString(),
        user_name: 'Marketing Charm Agency Operations',
        user_role: 'Agency Project Lead',
        note: 'Submitted item for client review and sign-off.',
      },
    ],
  };

  allApprovals.unshift(newApproval);
  setStored(APPROVALS_KEY, allApprovals);

  createPortalNotification({
    client_id: clientId,
    title: `New Approval Required: ${data.title}`,
    message: `Your sign-off is requested on "${data.title}".`,
    type: 'approval',
    link_tab: 'approvals',
  });

  logClientPortalActivity({
    client_id: clientId,
    user_id: 'agency_admin',
    user_name: 'Agency Lead',
    activity_type: 'Approval Submitted',
    resource_type: 'approval',
    resource_id: newApproval.approval_id,
    details: `Agency created approval item: "${data.title}" (${data.category})`,
  });

  return newApproval;
}

export function getAllClientRequests(): ClientRequest[] {
  return getStored<ClientRequest[]>(REQUESTS_KEY, []);
}

export function getAllClientApprovals(): ClientApproval[] {
  return getStored<ClientApproval[]>(APPROVALS_KEY, []);
}

export function getAllPortalActivities(): ClientPortalActivity[] {
  return getStored<ClientPortalActivity[]>(ACTIVITIES_KEY, []);
}

// ==========================================================
// 10. CLIENT PORTAL SESSION MANAGEMENT
// ==========================================================

const CURRENT_SESSION_KEY = 'mca_client_portal_current_session_v1';

export function createClientPortalSession(
  user: ClientPortalUser,
  isAgencyPreview: boolean = false
): ClientPortalSession {
  const bizName = getClientOrganizationName(user.client_id);
  const session: ClientPortalSession = {
    token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user,
    client_business_name: bizName,
    is_agency_preview: isAgencyPreview,
  };
  setStored(CURRENT_SESSION_KEY, session);

  // Update user last login
  const allUsers = getStored<ClientPortalUser[]>(USERS_KEY, []);
  const u = allUsers.find((item) => item.user_id === user.user_id);
  if (u) {
    u.last_login = new Date().toISOString();
    setStored(USERS_KEY, allUsers);
  }

  // Record login activity
  logClientPortalActivity({
    client_id: user.client_id,
    user_id: user.user_id,
    user_name: user.name,
    activity_type: 'Login',
    resource_type: 'auth',
    resource_id: session.token,
    details: `${user.name} logged into Client Experience Portal (${isAgencyPreview ? 'Agency Preview Mode' : 'Direct Client Access'})`,
  });

  return session;
}

export function getCurrentClientPortalSession(): ClientPortalSession | null {
  return getStored<ClientPortalSession | null>(CURRENT_SESSION_KEY, null);
}

export function clearCurrentClientPortalSession(): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear portal session:', e);
  }
}

