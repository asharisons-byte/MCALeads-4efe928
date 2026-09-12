CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"user_id" integer,
	"lead_id" integer,
	"client_id" integer,
	"activity_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "advertising_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"google_ads_detected" boolean DEFAULT false,
	"meta_pixel_detected" boolean DEFAULT false,
	"conversion_tracking_detected" boolean DEFAULT false,
	"google_tag_manager_detected" boolean DEFAULT false,
	"advertising_opportunity" text,
	"confidence" numeric(4, 2) DEFAULT '0.85',
	"evidence" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agency_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"default_price" integer NOT NULL,
	"minimum_price" integer NOT NULL,
	"maximum_price" integer NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agency_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'Marketing Charm Agency' NOT NULL,
	"product_name" text DEFAULT 'MCA Lead Agency Suite' NOT NULL,
	"company_logo" text,
	"default_sender_name" text DEFAULT 'Sophia' NOT NULL,
	"default_ai_agent" text DEFAULT 'Sophia' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'America/Los_Angeles' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'ACTIVE',
	"provider" text DEFAULT 'Google Gemini',
	"default_model" text DEFAULT 'gemini-2.5-pro',
	"configuration_reference" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"action_type" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"requested_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"final_output_reference" text
);
--> statement-breakpoint
CREATE TABLE "ai_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"model" text DEFAULT 'gemini-2.5-pro',
	"status" text DEFAULT 'Approved',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"ai_output_id" integer,
	"user_id" integer,
	"feedback_type" text NOT NULL,
	"original_output" text,
	"edited_output" text,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"agent_id" integer,
	"model" text DEFAULT 'gemini-2.5-pro',
	"output_type" text NOT NULL,
	"content" text NOT NULL,
	"structured_data" jsonb,
	"confidence" numeric(4, 2) DEFAULT '0.95',
	"version" integer DEFAULT 1,
	"status" text DEFAULT 'APPROVED',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_pitches" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"agent_id" text DEFAULT 'sophia',
	"opportunity_angle" text,
	"primary_service" text,
	"secondary_services" jsonb,
	"revenue_lift_estimate" text,
	"confidence" numeric(4, 2) DEFAULT '0.92',
	"pitch_content" text NOT NULL,
	"model" text DEFAULT 'gemini-2.5-pro',
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer,
	"organization_id" integer,
	"task_type" text NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"priority" text DEFAULT 'NORMAL',
	"status" text DEFAULT 'PENDING',
	"input_reference" jsonb,
	"output_reference" jsonb,
	"error_summary" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"user_id" integer,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"previous_data_reference" jsonb,
	"new_data_reference" jsonb,
	"ip_reference" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automation_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_name" text NOT NULL,
	"workflow_provider" text DEFAULT 'n8n',
	"related_entity_type" text,
	"related_entity_id" text,
	"status" text DEFAULT 'SUCCESS',
	"external_run_id" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"error_summary" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_type" text NOT NULL,
	"payload_reference" jsonb,
	"status" text DEFAULT 'PENDING',
	"priority" text DEFAULT 'NORMAL',
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"scheduled_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"failed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "call_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" integer NOT NULL,
	"agent_id" text DEFAULT 'sophia',
	"summary" text NOT NULL,
	"outcome" text NOT NULL,
	"sentiment" text DEFAULT 'POSITIVE',
	"objections" jsonb,
	"next_steps" text,
	"follow_up_date" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_transcripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" integer NOT NULL,
	"speaker" text NOT NULL,
	"text" text NOT NULL,
	"timestamp_seconds" numeric(8, 2),
	"confidence" numeric(4, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"phone" text NOT NULL,
	"contact_phone" text,
	"direction" text DEFAULT 'Outbound',
	"provider" text DEFAULT 'Telnyx',
	"external_call_id" text,
	"status" text DEFAULT 'Completed',
	"duration_seconds" integer DEFAULT 0,
	"recording_url" text,
	"transcript" text,
	"transcript_status" text DEFAULT 'COMPLETED',
	"ai_summary" text,
	"call_outcome" text DEFAULT 'Connected - Positive Interest',
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'PENDING',
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"responded_by" text
);
--> statement-breakpoint
CREATE TABLE "client_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"title" text NOT NULL,
	"contract_value" integer NOT NULL,
	"billing_frequency" text DEFAULT 'MONTHLY',
	"start_date" text,
	"end_date" text,
	"renewal_date" text,
	"status" text DEFAULT 'ACTIVE',
	"document_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_health_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"health_score" integer NOT NULL,
	"communication_score" integer DEFAULT 85,
	"delivery_score" integer DEFAULT 90,
	"engagement_score" integer DEFAULT 80,
	"payment_score" integer DEFAULT 95,
	"risk_level" text DEFAULT 'LOW',
	"evidence" text,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_portal_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"user_id" integer,
	"role" text DEFAULT 'Client Member',
	"status" text DEFAULT 'ACTIVE',
	"invited_at" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	"last_login_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "client_renewals" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"contract_id" integer,
	"renewal_date" text NOT NULL,
	"estimated_value" integer NOT NULL,
	"status" text DEFAULT 'PENDING',
	"risk_level" text DEFAULT 'LOW',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"submitted_by" text NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"priority" text DEFAULT 'NORMAL',
	"status" text DEFAULT 'NEW',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"service_name" text NOT NULL,
	"service_category" text,
	"monthly_price" integer DEFAULT 1500 NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"start_date" text,
	"renewal_date" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"organization_id" integer,
	"lead_id" integer,
	"business_name" text NOT NULL,
	"website" text,
	"email" text,
	"phone" text,
	"industry" text,
	"address" text,
	"city" text,
	"state_region" text DEFAULT 'OR',
	"country" text DEFAULT 'USA',
	"postal_code" text,
	"monthly_retainer" integer DEFAULT 2800 NOT NULL,
	"actual_mrr" integer DEFAULT 2800 NOT NULL,
	"client_status" text DEFAULT 'Active' NOT NULL,
	"account_manager" text DEFAULT 'Sophia',
	"account_manager_id" integer,
	"start_date" text,
	"renewal_date" text,
	"health_score" integer DEFAULT 85,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "clients_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "crm_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"lead_id" integer NOT NULL,
	"client_id" integer,
	"author_user_id" integer,
	"author_name" text DEFAULT 'Sophia (AI Sales Rep)',
	"content" text NOT NULL,
	"note_type" text DEFAULT 'General' NOT NULL,
	"visibility" text DEFAULT 'Internal' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"client_id" integer,
	"lead_id" integer,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"file_name" text NOT NULL,
	"storage_reference" text NOT NULL,
	"mime_type" text DEFAULT 'application/pdf',
	"file_size" integer,
	"visibility" text DEFAULT 'Internal',
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"campaign_id" text,
	"direction" text DEFAULT 'Outbound' NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'Draft' NOT NULL,
	"provider" text DEFAULT 'Gmail API',
	"external_message_id" text,
	"sent_at" timestamp,
	"opened_at" timestamp,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"provider_thread_id" text,
	"subject" text NOT NULL,
	"last_message_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'OPEN',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "google_business_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"place_id" text,
	"business_name" text NOT NULL,
	"rating" numeric(3, 1),
	"review_count" integer,
	"profile_status" text DEFAULT 'VERIFIED',
	"category" text,
	"address" text,
	"phone" text,
	"website" text,
	"maps_url" text,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"last_verified_at" timestamp DEFAULT now(),
	"data_source" text DEFAULT 'Google Maps Places API',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"provider" text NOT NULL,
	"integration_type" text NOT NULL,
	"status" text DEFAULT 'CONNECTED' NOT NULL,
	"configuration_reference" jsonb,
	"last_sync_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"gmb_status" text DEFAULT 'Established',
	"google_rating" numeric(3, 1) DEFAULT '4.5',
	"review_count" integer DEFAULT 12,
	"website_status" text DEFAULT 'Active',
	"mobile_score" integer DEFAULT 45,
	"desktop_score" integer DEFAULT 68,
	"performance_score" integer DEFAULT 52,
	"seo_score" integer DEFAULT 55,
	"cms" text DEFAULT 'WordPress',
	"meta_pixel_detected" boolean DEFAULT false,
	"google_ads_detected" boolean DEFAULT false,
	"technical_issues" jsonb,
	"audit_summary" text,
	"last_audited_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"description" text,
	"business_hours" text,
	"year_established" integer,
	"employee_size" text,
	"service_area" text,
	"website_status" text DEFAULT 'Active',
	"notes" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "lead_details_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
CREATE TABLE "lead_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"service" text NOT NULL,
	"opportunity_type" text NOT NULL,
	"priority" text DEFAULT 'HIGH',
	"estimated_monthly_value" integer DEFAULT 2500,
	"confidence" numeric(4, 2) DEFAULT '0.90',
	"evidence" text,
	"status" text DEFAULT 'IDENTIFIED',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_score_factors" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_score_id" integer NOT NULL,
	"factor_name" text NOT NULL,
	"factor_value" text NOT NULL,
	"weight" integer NOT NULL,
	"points" integer NOT NULL,
	"evidence" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"total_score" integer NOT NULL,
	"gmb_score" integer DEFAULT 10,
	"website_score" integer DEFAULT 10,
	"technical_score" integer DEFAULT 10,
	"ads_score" integer DEFAULT 10,
	"opportunity_score" integer DEFAULT 20,
	"contact_score" integer DEFAULT 10,
	"confidence" numeric(4, 2) DEFAULT '0.95',
	"reasoning" text,
	"scoring_version" text DEFAULT 'v2-sophia',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"previous_status" text NOT NULL,
	"new_status" text NOT NULL,
	"changed_by" text DEFAULT 'Sophia (AI)',
	"change_source" text DEFAULT 'AI',
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"organization_id" integer,
	"business_name" text NOT NULL,
	"contact_name" text,
	"phone" text,
	"phone_e164" text,
	"email" text,
	"website" text,
	"industry" text DEFAULT 'Contractor',
	"service_category" text,
	"niche" text,
	"address" text,
	"city" text,
	"county" text,
	"state_region" text DEFAULT 'OR',
	"country" text DEFAULT 'USA',
	"postal_code" text,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"google_maps_url" text,
	"google_place_id" text,
	"lead_source" text DEFAULT 'Oregon CCB License Database',
	"lead_status" text DEFAULT 'New Lead' NOT NULL,
	"lead_score" integer DEFAULT 50 NOT NULL,
	"estimated_retainer" integer DEFAULT 2500,
	"estimated_value" integer DEFAULT 30000,
	"assigned_to" text DEFAULT 'Sophia (AI Sales Rep)',
	"assigned_user_id" integer,
	"ccb_license_number" text,
	"is_hot_target" boolean DEFAULT false,
	"do_not_contact" boolean DEFAULT false,
	"opportunity_angle" text,
	"recommended_service" text,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"archived_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "leads_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"user_id" integer,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" text DEFAULT 'NORMAL',
	"read_at" timestamp,
	"related_entity_type" text,
	"related_entity_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"setting_key" text NOT NULL,
	"setting_value" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Marketing Charm Agency' NOT NULL,
	"slug" text DEFAULT 'marketing-charm-agency' NOT NULL,
	"organization_type" text DEFAULT 'AGENCY' NOT NULL,
	"logo_url" text,
	"website" text DEFAULT 'https://marketingcharmagency.com',
	"email" text DEFAULT 'contact@marketingcharmagency.com',
	"phone" text DEFAULT '+1-503-241-7998',
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" text NOT NULL,
	"action" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"client_id" integer,
	"title" text NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'SENT',
	"sent_at" timestamp,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"client_id" integer,
	"service_id" integer,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"revenue_type" text DEFAULT 'Confirmed' NOT NULL,
	"period_start" text,
	"period_end" text,
	"status" text DEFAULT 'PAID',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"scope" text DEFAULT 'AGENCY' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sms_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"direction" text DEFAULT 'Outbound' NOT NULL,
	"status" text DEFAULT 'Sent' NOT NULL,
	"provider" text DEFAULT 'Telnyx',
	"external_message_id" text,
	"sent_at" timestamp DEFAULT now(),
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" text NOT NULL,
	"module" text NOT NULL,
	"severity" text DEFAULT 'ERROR' NOT NULL,
	"error_code" text,
	"friendly_message" text NOT NULL,
	"technical_reference" text,
	"status" text DEFAULT 'OPEN',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"lead_id" integer,
	"related_client_id" integer,
	"title" text NOT NULL,
	"description" text,
	"task_type" text DEFAULT 'Follow-Up',
	"priority" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'Open' NOT NULL,
	"assigned_to" text DEFAULT 'Sophia (AI Sales Rep)',
	"assigned_user_id" integer,
	"due_date" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technology_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"technology_name" text NOT NULL,
	"technology_category" text,
	"detected" boolean DEFAULT true,
	"confidence" numeric(4, 2) DEFAULT '0.90',
	"evidence" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"organization_id" integer,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"organization_id" integer,
	"first_name" text,
	"last_name" text,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'Admin' NOT NULL,
	"avatar_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_type" text NOT NULL,
	"external_event_id" text,
	"payload_reference" jsonb,
	"processing_status" text DEFAULT 'PROCESSED',
	"processed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "webhook_events_external_event_id_unique" UNIQUE("external_event_id")
);
--> statement-breakpoint
CREATE TABLE "website_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"url" text NOT NULL,
	"status" text DEFAULT 'COMPLETED',
	"cms" text,
	"mobile_score" integer,
	"desktop_score" integer,
	"performance_score" integer,
	"seo_score" integer,
	"accessibility_score" integer,
	"best_practices_score" integer,
	"load_time" numeric(6, 2),
	"server_status" text DEFAULT 'ONLINE',
	"ssl_status" text DEFAULT 'VALID',
	"last_audited_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertising_audits" ADD CONSTRAINT "advertising_audits_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_services" ADD CONSTRAINT "agency_services_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_approvals" ADD CONSTRAINT "ai_approvals_task_id_ai_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."ai_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content" ADD CONSTRAINT "ai_content_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_ai_output_id_ai_outputs_id_fk" FOREIGN KEY ("ai_output_id") REFERENCES "public"."ai_outputs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_outputs" ADD CONSTRAINT "ai_outputs_task_id_ai_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."ai_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_outputs" ADD CONSTRAINT "ai_outputs_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_pitches" ADD CONSTRAINT "ai_pitches_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_summaries" ADD CONSTRAINT "call_summaries_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_transcripts" ADD CONSTRAINT "call_transcripts_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_approvals" ADD CONSTRAINT "client_approvals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contracts" ADD CONSTRAINT "client_contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_health_scores" ADD CONSTRAINT "client_health_scores_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_portal_users" ADD CONSTRAINT "client_portal_users_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_portal_users" ADD CONSTRAINT "client_portal_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_renewals" ADD CONSTRAINT "client_renewals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_renewals" ADD CONSTRAINT "client_renewals_contract_id_client_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."client_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_requests" ADD CONSTRAINT "client_requests_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_manager_id_users_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_business_profiles" ADD CONSTRAINT "google_business_profiles_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_audits" ADD CONSTRAINT "lead_audits_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_details" ADD CONSTRAINT "lead_details_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_opportunities" ADD CONSTRAINT "lead_opportunities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_score_factors" ADD CONSTRAINT "lead_score_factors_lead_score_id_lead_scores_id_fk" FOREIGN KEY ("lead_score_id") REFERENCES "public"."lead_scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_scores" ADD CONSTRAINT "lead_scores_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_records" ADD CONSTRAINT "revenue_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_records" ADD CONSTRAINT "revenue_records_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_records" ADD CONSTRAINT "revenue_records_service_id_client_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."client_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_audits" ADD CONSTRAINT "technology_audits_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_audits" ADD CONSTRAINT "website_audits_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;