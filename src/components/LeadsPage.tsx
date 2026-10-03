/**
 * LeadsPage — hosts the LeadsTable, BulkActionsToolbar, BulkProgressOverlay,
 * and the BulkTagModal.
 *
 * All six bulk actions are fully connected end-to-end:
 *  - AI Call      → TelephonyService.startCall() per lead, sequential, no delay
 *  - Manual Call  → opens Dialer for each lead; user advances queue via "Next Lead" button
 *  - SMS          → generateSophiaSMS() + sendOutboundSMS(), 5-min gap (BST queue)
 *  - Email        → generateSophiaEmail() + markEmailPrepared() + Gmail compose, 5-min gap (BST queue)
 *  - Bulk Tag     → updateLead() for each selected lead
 *  - Enrich AI    → delegated to parent handler
 */

import React, { useState, useRef, useCallback } from 'react';
import { LeadsTable } from './LeadsTable';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { BulkTagModal } from './BulkTagModal';
import { BulkProgressOverlay } from './BulkProgressOverlay';
import { BulkQueueController, BulkProgress } from '../services/bulkQueueService';
import { Lead } from '../types';
import { sendOutboundSMS, generateSophiaSMS } from '../services/messagingService';
import { generateSophiaEmail, markEmailPrepared, saveEmailDraft, buildGmailComposeUrl } from '../services/emailService';
import { TelephonyService } from '../services/telephonyService';
import { updateLead } from '../services/leadService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeadsPageProps {
  leads: Lead[];
  selectedLeadIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenImport: (mode?: 'upload' | 'sheets' | 'paste' | 'preset') => void;
  onOpenAddLead: () => void;
  onBulkUpdateStage: (leadIds: string[], stage: string) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
  onTriggerAIEnrichment: (leadIds: string[]) => Promise<void>;
  onClearAllLeads: () => Promise<void>;
  onOpenDialer: (lead: Lead) => void;
  onOpenAICall: (lead: Lead) => void;
  onImportComplete: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLeadsFromIds(allLeads: Lead[], ids: Set<string>): Lead[] {
  return allLeads.filter((l) => ids.has(l.lead_id));
}

// 5-minute gap in ms
const OUTREACH_GAP_MS = 5 * 60 * 1000;

// ── Component ─────────────────────────────────────────────────────────────────

export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
  const { leads, selectedLeadIds } = props;

  const [activeBulkProgress, setActiveBulkProgress] = useState<BulkProgress | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const activeControllerRef = useRef<BulkQueueController | null>(null);

  // Keep the latest leads ref so executor closures see fresh data
  const leadsRef = useRef(leads);
  leadsRef.current = leads;

  // ── Cancel helper ─────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    activeControllerRef.current?.cancel();
    activeControllerRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    activeControllerRef.current = null;
    setActiveBulkProgress(null);
  }, []);

  // ── Progress update ───────────────────────────────────────────────────────
  const onProgress = useCallback((p: BulkProgress) => {
    setActiveBulkProgress({ ...p });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // BULK AI CALL
  // Sequential calls via TelephonyService — each starts after the previous
  // resolves (no time delay needed; we await startCall per lead).
  // ─────────────────────────────────────────────────────────────────────────
  const handleBulkAICall = useCallback(async () => {
    const selected = getLeadsFromIds(leads, selectedLeadIds);
    if (!selected.length) return;

    // Cancel any running operation
    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'AI_CALL',
      gapMs: 0,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead || !lead.phone) {
          return { success: false, error: 'No phone number' };
        }
        try {
          const result = await TelephonyService.startCall({
            lead,
            phoneNumber: lead.phone,
            callType: 'AI Call',
          });
          return { success: result.success };
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Call failed' };
        }
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id })));
    controller.start();
  }, [leads, selectedLeadIds, onProgress]);

  // ─────────────────────────────────────────────────────────────────────────
  // BULK MANUAL CALL
  // Opens the dialer for each lead one at a time.
  // After the user finishes a call they click "Call Ended — Next Lead" in the overlay.
  // ─────────────────────────────────────────────────────────────────────────
  const handleBulkManualCall = useCallback(async () => {
    const selected = getLeadsFromIds(leads, selectedLeadIds);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'MANUAL_CALL',
      gapMs: 0,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };
        // Open the dialer for this lead via parent handler
        props.onOpenDialer(lead);
        return { success: true };
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id })));
    controller.start();
  }, [leads, selectedLeadIds, onProgress, props.onOpenDialer]);

  const handleAdvanceManualCall = useCallback(async () => {
    const ctrl = activeControllerRef.current;
    if (!ctrl) return;
    await ctrl.advanceManualCall();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // BULK SMS — BST queue with 5-min gap
  // For each lead: auto-generate Sophia SMS → sendOutboundSMS().
  // ─────────────────────────────────────────────────────────────────────────
  const handleBulkSMS = useCallback(async () => {
    const selected = getLeadsFromIds(leads, selectedLeadIds);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'SMS',
      gapMs: OUTREACH_GAP_MS,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };
        if (!lead.phone) return { success: false, error: 'No phone number' };

        try {
          // 1. AI-generate SMS content
          const generated = await generateSophiaSMS(lead);

          // 2. Send via Telnyx
          await sendOutboundSMS({
            lead,
            content: generated.content,
            smsType: generated.sms_type,
            personalizationLevel: generated.personalization_level,
          });

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'SMS failed' };
        }
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id })));
    controller.start();
  }, [leads, selectedLeadIds, onProgress]);

  // ─────────────────────────────────────────────────────────────────────────
  // BULK EMAIL — BST queue with 5-min gap
  // For each lead: generate Sophia email → save draft → markEmailPrepared()
  // → open Gmail compose in a new tab.
  // ─────────────────────────────────────────────────────────────────────────
  const handleBulkEmail = useCallback(async () => {
    const selected = getLeadsFromIds(leads, selectedLeadIds);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'EMAIL',
      gapMs: OUTREACH_GAP_MS,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };

        const recipientEmail = lead.email || (lead as any).contact_email || '';
        if (!recipientEmail) return { success: false, error: 'No email address' };

        try {
          // 1. Generate email via Sophia AI
          const generated = await generateSophiaEmail(lead);

          // 2. Save draft
          const draft = saveEmailDraft({
            lead_id: lead.lead_id,
            business_name: lead.business_name || '',
            contact_name: lead.contact_name,
            recipient: recipientEmail,
            subject: generated.subject,
            subject_options: generated.subject_options,
            body: generated.body,
            email_type: generated.email_type,
            personalization_level: generated.personalization_level,
            key_opportunity: generated.key_opportunity,
            suggested_cta: generated.suggested_cta,
            generated_by: 'Sophia (AI Sales Rep)',
            status: 'DRAFT',
          });

          // 3. Mark as prepared + log activity
          markEmailPrepared(draft, lead);

          // 4. Open Gmail compose (non-blocking; opens in background tab)
          const gmailUrl = buildGmailComposeUrl(recipientEmail, generated.subject, generated.body);
          window.open(gmailUrl, '_blank', 'noopener,noreferrer');

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Email failed' };
        }
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id })));
    controller.start();
  }, [leads, selectedLeadIds, onProgress]);

  // ─────────────────────────────────────────────────────────────────────────
  // BULK TAG
  // ─────────────────────────────────────────────────────────────────────────
  const handleBulkTagConfirm = useCallback(async (tag: string) => {
    const ids = Array.from(selectedLeadIds);
    await Promise.all(
      ids.map((id) => updateLead(id, { tags: tag } as any))
    );
    setShowTagModal(false);
  }, [selectedLeadIds]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full h-full px-4 py-4 gap-0">
      <BulkActionsToolbar
        selectedCount={selectedLeadIds.size}
        onBulkAssign={() => {
          // Move selected leads to 'Contacted' stage as a quick assign action
          props.onBulkUpdateStage(Array.from(selectedLeadIds), 'Contacted');
        }}
        onBulkMoveStage={() => {
          // Advance each selected lead one stage forward
          const nextStageMap: Record<string, string> = {
            'New Lead':      'Contacted',
            'Contacted':     'Audit Sent',
            'Audit Sent':    'Proposal Sent',
            'Proposal Sent': 'Won',
            'Won':           'Archived',
          };
          const ids = Array.from(selectedLeadIds);
          const stageUpdates = ids.map((id) => {
            const lead = leads.find((l) => l.lead_id === id);
            const current = lead?.pipeline_stage || 'New Lead';
            return { id, stage: nextStageMap[current] || current };
          });
          Promise.all(
            stageUpdates.map(({ id, stage }) =>
              props.onBulkUpdateStage([id], stage)
            )
          );
        }}
        onBulkEnrich={() => props.onTriggerAIEnrichment(Array.from(selectedLeadIds))}
        onBulkDelete={() => props.onBulkDelete(Array.from(selectedLeadIds))}
        onBulkAICall={handleBulkAICall}
        onBulkManualCall={handleBulkManualCall}
        onBulkSMS={handleBulkSMS}
        onBulkEmail={handleBulkEmail}
        onBulkTag={() => setShowTagModal(true)}
      />

      {/* Bulk progress overlay — only shown when a queue is active */}
      {activeBulkProgress && (
        <BulkProgressOverlay
          progress={activeBulkProgress}
          onClose={handleClose}
          onCancel={handleCancel}
          onAdvanceManualCall={
            activeBulkProgress.opType === 'MANUAL_CALL' ? handleAdvanceManualCall : undefined
          }
        />
      )}

      <BulkTagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onConfirm={handleBulkTagConfirm}
        selectedCount={selectedLeadIds.size}
      />

      <LeadsTable {...props} />
    </div>
  );
};
