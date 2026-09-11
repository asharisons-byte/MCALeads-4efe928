// ============================================================================
// PHASE 4A — MCA AGENCY AI WORKFORCE & MULTI-AGENT AUTOMATION TYPES
// ============================================================================

export type AIAgentId =
  | 'sophia'
  | 'atlas'
  | 'nova'
  | 'orbit'
  | 'aria'
  | 'pulse'
  | 'nexus';

export type AIAgentStatus =
  | 'Active'
  | 'Working'
  | 'Waiting'
  | 'Paused'
  | 'Error'
  | 'Offline';

export type AITaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type AITaskStatus =
  | 'Queued'
  | 'Processing'
  | 'Waiting for Data'
  | 'Waiting for Approval'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export type AITaskType =
  | 'Lead Research'
  | 'Lead Scoring'
  | 'Website Analysis'
  | 'SEO Analysis'
  | 'Advertising Analysis'
  | 'Outreach Generation'
  | 'Call Analysis'
  | 'Follow-Up Intelligence'
  | 'Proposal Generation'
  | 'Client Health Analysis'
  | 'Report Generation'
  | 'Operations Monitoring';

export type AIApprovalActionType =
  | 'Email Ready to Send'
  | 'SMS Ready to Send'
  | 'AI Call Ready'
  | 'Proposal Ready'
  | 'Campaign Change Recommended'
  | 'Client Report Ready'
  | 'Pricing Recommendation'
  | 'Contract Modification';

export type AIApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Modified';

export interface AIAgentPermissions {
  can_auto_execute: string[];
  requires_approval: string[];
  forbidden: string[];
}

export interface AIAgent {
  agent_id: AIAgentId;
  id?: string;
  name: string;
  role: string;
  title: string;
  description?: string;
  avatar_color: string;
  accent_gradient: string;
  status: AIAgentStatus | 'active' | 'idle';
  capabilities: string[];
  permissions: AIAgentPermissions;
  requiresApproval?: boolean;
  default_model: string;
  current_task?: string;
  tasks_in_progress: number;
  tasks_completed_count: number;
  failed_tasks_count: number;
  success_rate: number;
  approval_rate: number;
  avg_processing_time_ms: number;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface AITaskOutput {
  summary: string;
  evidence: string[];
  recommendations: string[];
  confidence: 'High' | 'Medium' | 'Low';
  structured_data?: Record<string, any>;
  error_summary?: string;
}

export interface AITask {
  task_id: string;
  agent_id: AIAgentId;
  task_type: AITaskType;
  related_entity_type: 'lead' | 'client' | 'campaign' | 'audit' | 'proposal' | 'call' | 'agency';
  related_entity_id: string;
  related_entity_name: string;
  priority: AITaskPriority;
  status: AITaskStatus;
  input_reference?: Record<string, any>;
  output_reference?: AITaskOutput;
  retry_count: number;
  max_retries: number;
  requires_approval: boolean;
  approval_id?: string;
  playbook_id?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface AIApproval {
  approval_id: string;
  task_id: string;
  agent_id: AIAgentId;
  action_type: AIApprovalActionType;
  status: AIApprovalStatus;
  related_entity_type: 'lead' | 'client' | 'campaign' | 'audit' | 'proposal' | 'call' | 'agency';
  related_entity_id: string;
  related_entity_name: string;
  title: string;
  description: string;
  proposed_content: Record<string, any>;
  current_content?: Record<string, any>;
  evidence_summary: string[];
  confidence: 'High' | 'Medium' | 'Low';
  rules_triggered: string[];
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  feedback_notes?: string;
  final_action?: string;
}

export interface AIActivity {
  activity_id: string;
  agent_id: AIAgentId;
  task_id?: string;
  activity_type: string;
  related_entity_id?: string;
  related_entity_name?: string;
  summary: string;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AIPlaybook {
  id: string;
  name: string;
  industry:
    | 'All'
    | 'Plumbing'
    | 'HVAC'
    | 'Roofing'
    | 'Dental'
    | 'Legal'
    | 'Real Estate'
    | 'Restaurant'
    | 'Custom';
  target_agent: AIAgentId;
  objective: string;
  required_inputs: string[];
  expected_output: string;
  rules: string[];
  approval_requirements: string[];
  active: boolean;
}

export interface AIFeedback {
  feedback_id: string;
  approval_id?: string;
  task_id: string;
  agent_id: AIAgentId;
  user_action: 'approved' | 'rejected' | 'edited';
  original_draft: string;
  edited_draft?: string;
  user_notes?: string;
  rating?: number;
  timestamp: string;
}

export interface AIOutputVersion {
  version_id: string;
  task_id: string;
  agent_id: AIAgentId;
  model: string;
  version_type: 'Original AI Draft' | 'User Edited Draft' | 'Final Approved Version';
  content: Record<string, any>;
  timestamp: string;
  author: string;
  changes_summary?: string;
}

export interface AIOperationsBriefing {
  id: string;
  generated_at: string;
  period: 'Daily' | 'Weekly';
  agent_id: 'nexus';
  headline: string;
  executive_summary: string;
  metrics: {
    new_leads_reviewed: number;
    hot_leads_identified: number;
    overdue_followups: number;
    active_campaigns_monitored: number;
    at_risk_clients: number;
    approvals_pending: number;
    tasks_automated_today: number;
  };
  agent_contributions: {
    agent_id: AIAgentId;
    agent_name: string;
    key_insight: string;
    priority_level: AITaskPriority;
    action_items: string[];
  }[];
  risk_alerts: {
    title: string;
    severity: 'critical' | 'high' | 'medium';
    entity: string;
    recommended_action: string;
  }[];
  recommended_priorities: string[];
}

export interface AIWorkforceSettings {
  automation_enabled: boolean;
  max_tasks_per_lead: number;
  max_retry_attempts: number;
  max_concurrent_tasks: number;
  daily_task_limit: number;
  default_model: string;
  fallback_model: string;
  task_models: Record<string, string>;
  temperature: number;
  n8n_integration_enabled: boolean;
  n8n_webhook_configured: boolean;
  strict_human_approval: boolean;
}

export interface MultiAgentPipelineStep {
  agent_id: AIAgentId;
  agent_name: string;
  task_type: AITaskType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: AITaskOutput;
  started_at?: string;
  completed_at?: string;
}

export interface MultiAgentPipelineRun {
  run_id: string;
  lead_id: string;
  lead_name: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_approval';
  current_step_index: number;
  steps: MultiAgentPipelineStep[];
  created_at: string;
  completed_at?: string;
}
