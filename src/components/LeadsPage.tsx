/**
 * LeadsPage — hosts LeadsTable + all Bulk Actions, fully wired end-to-end.
 *
 * Bulk Action strategy:
 *  AI Call      → places each call through the Python backend (/api/outbound/call, same as
 *                 SophiaAICallModal) and waits for it to end before dialing the next lead.
 *                 Cancel hangs up the call in progress.
 *  Manual Call  → opens props.onOpenDialer(lead), user clicks "Next Lead" in overlay to advance
 *  SMS          → generateSophiaSMS() + sendOutboundSMS(), 5-min BST gap between each send
 *  Email        → generateSophiaEmail() + markEmailPrepared() + Gmail compose, 5-min BST gap
 *  Bulk Tag     → updateLead(id, { tags: [tag] }) for all selected
 *  Assign       → onBulkUpdateStage(ids, 'Contacted')
 *  Advance Stage → advances each lead one stage forward
 *  Enrich AI    → delegates to parent onTriggerAIEnrichment
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
import { checkAIBackend, runAICall, INTER_CALL_PAUSE_MS, bulkSleep } from '../services/bulkAICallService';
import { updateLead } from '../services/leadService';

// ── Props ─────────────────────────────────────────────────────────────────────

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
  activeBulkProgress: BulkProgress | null;
  setActiveBulkProgress: (progress: BulkProgress | null) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OUTREACH_GAP_MS = 5 * 60 * 1000; // 5 minutes between each SMS or Email

const STAGE_ORDER: string[] = [
  'New Lead', 'Contacted', 'Audit Sent', 'Proposal Sent', 'Won', 'Archived',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSelectedLeads(allLeads: Lead[], ids: Set<string>): Lead[] {
  return allLeads.filter((l) => ids.has(l.lead_id));
}

function nextStage(current?: string): string {
  const idx = STAGE_ORDER.indexOf(current || 'New Lead');
  return idx >= 0 && idx < STAGE_ORDER.length - 1
    ? STAGE_ORDER[idx + 1]
    : current || 'New Lead';
}

// ── Component ─────────────────────────────────────────────────────────────────

export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
  const { leads, selectedLeadIds, activeBulkProgress, setActiveBulkProgress } = props;

  const [showTagModal, setShowTagModal] = useState(false);
  const activeControllerRef = useRef<BulkQueueController | null>(null);
  const leadsRef = useRef(leads);
  leadsRef.current = leads;
  // Always-fresh selection so bulk handlers never act on a stale snapshot
  const selectedIdsRef = useRef(selectedLeadIds);
  selectedIdsRef.current = selectedLeadIds;
  // Aborts the in-flight AI call (and hangs it up) on cancel / close
  const aiCallAbortRef = useRef<AbortController | null>(null);

  // ── Progress callback ─────────────────────────────────────────────────────
  const onProgress = useCallback((p: BulkProgress) => {
    setActiveBulkProgress({ ...p });
  }, [setActiveBulkProgress]);

  const handleCancel = useCallback(() => {
    aiCallAbortRef.current?.abort();
    activeControllerRef.current?.cancel();
    activeControllerRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    aiCallAbortRef.current?.abort();
    activeControllerRef.current = null;
    setActiveBulkProgress(null);
  }, [setActiveBulkProgress]);

  // ── BULK AI CALL ──────────────────────────────────────────────────────────
  const handleBulkAICall = useCallback(async () => {
    const selected = getSelectedLeads(leadsRef.current, selectedIdsRef.current);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();
    aiCallAbortRef.current?.abort();

    // One up-front check so a bad VITE_AI_BACKEND_URL / down server shows ONE clear
    // message instead of N identical per-lead failures.
    const health = await checkAIBackend();
    if (!health.ok) {
      alert(`Bulk AI Call can't start.\n\n${health.error}`);
      return;
    }

    const abort = new AbortController();
    aiCallAbortRef.current = abort;

    const controller = new BulkQueueController({
      opType: 'AI_CALL',
      gapMs: 0,
      onProgress,
      executor: async (item) => {
        if (abort.signal.aborted) return { success: false, error: 'Cancelled' };
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };
        if (!lead.phone) return { success: false, error: 'No phone number' };

        const result = await runAICall(lead, abort.signal);
        if (!abort.signal.aborted) await bulkSleep(INTER_CALL_PAUSE_MS);
        return result.success
          ? { success: true }
          : { success: false, error: result.error || 'Call failed' };
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(
      selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id }))
    );
    controller.start();
  }, [onProgress]);

  // ── BULK MANUAL CALL ──────────────────────────────────────────────────────
  const handleBulkManualCall = useCallback(async () => {
    const selected = getSelectedLeads(leadsRef.current, selectedIdsRef.current);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'MANUAL_CALL',
      gapMs: 0,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };
        props.onOpenDialer(lead);
        // Manual call waits for advanceManualCall signal from overlay
        return { success: true };
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(
      selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id }))
    );
    controller.start();
  }, [onProgress, props.onOpenDialer]);

  const handleAdvanceManualCall = useCallback(async () => {
    await activeControllerRef.current?.advanceManualCall();
  }, []);

  // ── BULK ENRICH ──────────────────────────────────────────────────────────
  const handleBulkEnrich = useCallback(async () => {
    const selected = getSelectedLeads(leadsRef.current, selectedIdsRef.current);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'AI_CALL', // Reusing AI_CALL type as placeholder for enrichment
      gapMs: 0,
      onProgress,
      executor: async (item) => {
        try {
          await props.onTriggerAIEnrichment([item.leadId]);
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Enrichment failed' };
        }
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(
      selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id }))
    );
    controller.start();
  }, [onProgress, props.onTriggerAIEnrichment]);

  // ── BULK SMS — BST queue, 5-min gap ──────────────────────────────────────
  const handleBulkSMS = useCallback(async () => {
    const selected = getSelectedLeads(leads, selectedLeadIds);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'SMS',
      gapMs: OUTREACH_GAP_MS,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };
        if (!lead.phone) return { success: false, error: 'No phone number — skipped' };

        try {
          const generated = await generateSophiaSMS(lead);
          await sendOutboundSMS({
            lead,
            content: generated.content,
            smsType: generated.sms_type,
            personalizationLevel: generated.personalization_level,
          });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'SMS send failed' };
        }
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(
      selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id }))
    );
    controller.start();
  }, [leads, selectedLeadIds, onProgress]);

  // ── BULK EMAIL — BST queue, 5-min gap ────────────────────────────────────
  const handleBulkEmail = useCallback(async () => {
    const selected = getSelectedLeads(leads, selectedLeadIds);
    if (!selected.length) return;

    activeControllerRef.current?.cancel();

    const controller = new BulkQueueController({
      opType: 'EMAIL',
      gapMs: OUTREACH_GAP_MS,
      onProgress,
      executor: async (item) => {
        const lead = leadsRef.current.find((l) => l.lead_id === item.leadId);
        if (!lead) return { success: false, error: 'Lead not found' };

        const recipientEmail = lead.email;
        if (!recipientEmail) return { success: false, error: 'No email address — skipped' };

        try {
          const generated = await generateSophiaEmail(lead);

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

          markEmailPrepared(draft, lead);

          // Open Gmail compose in a background tab
          const gmailUrl = buildGmailComposeUrl(
            recipientEmail,
            generated.subject,
            generated.body
          );
          window.open(gmailUrl, '_blank', 'noopener,noreferrer');

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Email preparation failed' };
        }
      },
    });

    activeControllerRef.current = controller;
    controller.enqueue(
      selected.map((l) => ({ leadId: l.lead_id, leadName: l.business_name || l.lead_id }))
    );
    controller.start();
  }, [leads, selectedLeadIds, onProgress]);

  // ── BULK TAG ──────────────────────────────────────────────────────────────
  const handleBulkTagConfirm = useCallback(async (tag: string) => {
    const ids = Array.from(selectedLeadIds);
    // tags is string[] on the Lead type — wrap the single tag in an array
    await Promise.all(ids.map((id) => updateLead(id, { tags: [tag] })));
    setShowTagModal(false);
  }, [selectedLeadIds]);

  // ── BULK ASSIGN ───────────────────────────────────────────────────────────
  const handleBulkAssign = useCallback(() => {
    props.onBulkUpdateStage(Array.from(selectedLeadIds), 'Contacted');
  }, [selectedLeadIds, props.onBulkUpdateStage]);

  // ── ADVANCE STAGE ─────────────────────────────────────────────────────────
  const handleBulkMoveStage = useCallback(() => {
    const ids = Array.from(selectedLeadIds);
    ids.forEach((id) => {
      const lead = leads.find((l) => l.lead_id === id);
      const next = nextStage(lead?.pipeline_stage);
      props.onBulkUpdateStage([id], next);
    });
  }, [leads, selectedLeadIds, props.onBulkUpdateStage]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full px-4 py-4 gap-0">
      <BulkActionsToolbar
        selectedCount={selectedLeadIds.size}
        onBulkEnrich={handleBulkEnrich}
        onBulkDelete={() => props.onBulkDelete(Array.from(selectedLeadIds))}
        onBulkAICall={handleBulkAICall}
        onBulkManualCall={handleBulkManualCall}
        onBulkSMS={handleBulkSMS}
        onBulkEmail={handleBulkEmail}
        onBulkTag={() => setShowTagModal(true)}
        onBulkAssign={handleBulkAssign}
        onBulkMoveStage={handleBulkMoveStage}
      />

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
