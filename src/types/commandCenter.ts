export type CommandCenterSection =
  | 'overview'
  | 'revenue'
  | 'pipeline'
  | 'clients'
  | 'markets'
  | 'services'
  | 'ai_workforce'
  | 'goals_kpis'
  | 'alerts'
  | 'reports'
  | 'settings';

export type GoalCategory =
  | 'MRR'
  | 'New Clients'
  | 'Lead Generation'
  | 'Proposals'
  | 'Conversion Rate'
  | 'Retention Rate';

export type GoalPeriod = 'Monthly' | 'Quarterly' | 'Annual';

export interface AgencyGoal {
  goal_id: string;
  title: string;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: '$' | '#' | '%';
  metric_unit?: string;
  period: GoalPeriod;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Achieved';
  progress_pct?: number;
  forecast_value?: number;
  sophia_recommendation?: string;
  created_at: string;
}

export type ExecutiveAlertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ExecutiveAlertStatus = 'Active' | 'Dismissed' | 'Snoozed' | 'Resolved';

export interface ExecutiveAlert {
  alert_id: string;
  type:
    | 'Hot Lead Attention'
    | 'Client Health Risk'
    | 'Proposal Awaiting Response'
    | 'Renewal Approaching'
    | 'Workflow Failure'
    | 'AI Task Failure'
    | 'Overdue Deliverable'
    | 'Pipeline Bottleneck'
    | 'Follow-Up Compliance';
  priority: ExecutiveAlertPriority;
  severity?: ExecutiveAlertPriority;
  related_entity_type: 'lead' | 'client' | 'proposal' | 'agent' | 'campaign' | 'service';
  related_entity_id?: string;
  related_entity_name?: string;
  title?: string;
  category?: string;
  message: string;
  evidence?: string;
  impact?: string;
  action_label?: string;
  recommended_action?: string;
  lead_id?: string;
  client_id?: string;
  resolved?: boolean;
  status: ExecutiveAlertStatus;
  created_at: string;
}

export interface AgencyForecast {
  forecast_id: string;
  forecast_type: 'MRR' | 'Client Acquisition' | 'Pipeline Conversion';
  period: '30 Days' | '60 Days' | '90 Days' | '6 Months';
  base_value: number;
  optimistic_value: number;
  conservative_value: number;
  confidence: 'High' | 'Medium' | 'Limited';
  assumptions: string[];
  generated_at: string;
}

export interface StrategicOpportunity {
  opportunity_id: string;
  category:
    | 'Industry Opportunity'
    | 'Geographic Opportunity'
    | 'Service Opportunity'
    | 'Client Expansion Opportunity'
    | 'Automation Opportunity';
  title: string;
  evidence: string;
  estimated_value: number;
  confidence: 'High' | 'Medium' | 'Limited';
  status: 'Identified' | 'In Review' | 'Executing' | 'Archived';
  recommended_action: string;
  created_at: string;
}

export interface ExecutiveBriefingMetrics {
  confirmed_mrr: number;
  pipeline_mrr: number;
  active_clients: number;
  hot_leads: number;
  at_risk_revenue: number;
}

export interface ExecutiveBriefing {
  briefing_id: string;
  type: 'Daily Briefing' | 'Weekly Briefing' | 'Monthly Executive Review' | 'Weekly Review' | 'Monthly Review' | string;
  title?: string;
  date?: string;
  summary: string;
  top_recommendation?: string;
  priorities: string[];
  risks: string[];
  opportunities: string[];
  recommendations?: string[];
  generated_at: string;
  metrics: ExecutiveBriefingMetrics;
}

// Client Health Matrix
export type ClientMatrixQuadrant =
  | 'High Value / Healthy'
  | 'High Value / At Risk'
  | 'Low Value / Healthy'
  | 'Low Value / At Risk';

export interface ClientHealthMatrixItem {
  client_id: string;
  business_name: string;
  monthly_retainer: number;
  health_score: number; // 0–100
  quadrant: ClientMatrixQuadrant;
  status: 'Active' | 'Onboarding' | 'At Risk' | 'Watch';
  services: string[];
  last_activity_date?: string;
  renewal_date?: string;
  risk_factors: string[];
}

// Churn Risk Intelligence
export interface ChurnRiskItem {
  client_id: string;
  business_name: string;
  risk_level: 'High' | 'Medium' | 'Low';
  evidence: string[];
  potential_revenue_at_risk: number;
  health_score: number;
  recommended_action: string;
  days_since_contact: number;
}

// Renewal Intelligence
export interface RenewalItem {
  client_id: string;
  business_name: string;
  renewal_date: string;
  days_remaining: number;
  window: '30 Days' | '60 Days' | '90 Days';
  renewal_value: number;
  health_score: number;
  recommended_action: string;
  current_services: string[];
}

// Expansion Opportunity
export interface ExpansionOpportunityItem {
  opportunity_id: string;
  client_id: string;
  client_name: string;
  type: 'Upsell' | 'Cross-Sell' | 'Service Expansion' | 'New Project';
  current_services: string[];
  recommended_service: string;
  estimated_value: number;
  confidence: 'High' | 'Medium' | 'Limited';
  evidence: string;
  status: 'Identified' | 'Proposed' | 'In Discussion' | 'Declined';
}

// Pipeline Bottleneck Detection
export interface PipelineBottleneckItem {
  stage: string;
  stalled_count: number;
  avg_days_in_stage: number;
  threshold_days: number;
  potential_issue: string;
  recommended_action: string;
  stalled_lead_names: string[];
}

// Lead Source Analytics
export interface LeadSourceMetric {
  source_name: string;
  leads_generated: number;
  qualified_leads: number;
  conversion_rate: number;
  won_clients: number;
  revenue: number;
}

// Industry Intelligence
export interface IndustryPerformanceItem {
  niche: string;
  industry?: string;
  leads_count: number;
  lead_count?: number;
  avg_lead_score: number;
  average_lead_score?: number;
  proposal_rate: number;
  win_rate: number;
  avg_mrr: number;
  average_retainer?: number;
  total_mrr: number;
  total_revenue?: number;
  opportunity_value: number;
  verdict: 'Top Performer' | 'High Potential' | 'Average' | 'Underperforming';
  sophia_note: string;
  strategic_notes?: string;
}

// Service Performance
export interface ServicePerformanceItem {
  service_name: string;
  active_clients: number;
  monthly_revenue: number;
  average_retainer: number;
  proposal_acceptance_rate: number;
  acceptance_rate?: number;
  retention_rate: number;
  opportunity_status: 'Highest Revenue' | 'Most Requested' | 'High Conversion' | 'Under-Sold' | 'Emerging' | 'Under-Sold Opportunity';
  evidence: string;
}

// Geographic Intelligence
export interface GeographicMarketItem {
  city: string;
  density: 'High Density' | 'Medium Density' | 'Growing Market' | string;
  lead_count: number;
  hot_targets: number;
  active_clients: number;
  confirmed_mrr: number;
}

// Follow-Up Compliance
export interface FollowUpComplianceMetrics {
  compliance_rate: number;
  total_tasks: number;
  completed_on_time: number;
  overdue_count: number;
  average_response_time: string;
}

// Executive Decision Item
export interface ExecutiveDecisionItem {
  decision_id: string;
  title: string;
  category: 'Expansion' | 'Targeting' | 'Lead Generation' | 'Service Focus' | 'Retention' | 'Operations';
  description: string;
  expected_impact: string;
  urgency: 'Immediate' | 'This Week' | 'Strategic';
  status: 'Pending Review' | 'Approved' | 'Dismissed';
  evidence: string;
  created_at: string;
}
