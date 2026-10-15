import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LeadsTable } from './LeadsTable';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { BulkTagModal } from './BulkTagModal';
import { BulkProgressOverlay } from './BulkProgressOverlay';
import { BulkQueueController, BulkProgress } from '../services/bulkQueueService';
import { Lead, ActivityEvent, PipelineStage } from '../types';
import { sendOutboundSMS, generateSophiaSMS } from '../services/messagingService';
import { generateSophiaEmail, markEmailPrepared, saveEmailDraft, buildGmailComposeUrl } from '../services/emailService';
import { checkAIBackend, runAICall, INTER_CALL_PAUSE_MS, bulkSleep } from '../services/bulkAICallService';
import { updateLead, addActivity } from '../services/leadService';
import { Filter, X } from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────────────────────

interface LeadsPageProps {
  leads: Lead[];
  activities: ActivityEvent[];
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

const ALL_STAGES: PipelineStage[] = ['New Lead', 'Contacted', 'Audit Sent', 'Proposal Sent', 'Won', 'Retainer', 'Archived'];

const OUTREACH_GAP_MS = 5 * 60 * 1000; // 5 minutes between each SMS or Email

const STAGE_ORDER: string[] = [
  'New Lead', 'Contacted', 'Audit Sent', 'Proposal Sent', 'Won', 'Retainer', 'Archived',
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
  const { leads, activities, selectedLeadIds, activeBulkProgress, setActiveBulkProgress } = props;

  const [selectedStages, setSelectedStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('leads_stage_filter');
    if (saved) {
      setSelectedStages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('leads_stage_filter', JSON.stringify(selectedStages));
  }, [selectedStages]);

  const filteredLeads = selectedStages.length === 0 
    ? leads 
    : leads.filter(l => selectedStages.includes(l.pipeline_stage as PipelineStage));

  const [showTagModal, setShowTagModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
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

        // CRM update rule (same as the single-call modal):
        //   real conversation  -> log activity + New Lead -> Contacted
        //   voicemail / no answer / failed / cancelled -> leave the lead untouched
        if (result.success && result.connected) {
          try {
            const now = Date.now();
            addActivity({
              id: `act-ai-call-${now}-${lead.lead_id}`,
              activity_id: `act-ai-call-${now}-${lead.lead_id}`,
              lead_id: lead.lead_id,
              lead_name: lead.business_name,
              timestamp: new Date().toISOString(),
              type: 'call_completed',
              activity_type: 'call_completed',
              channel: 'AI_CALL',
              title: `Sophia AI Call Completed (${result.durationSec ?? 0}s)`,
              description: `Bulk AI call connected — prospect spoke (${result.prospectTurns ?? 0} responses).`,
              author: 'Sophia (AI Sales Rep)',
              source: 'Sophia (AI)',
              metadata: {
                direction: 'OUTBOUND',
                status: 'COMPLETED',
                call_id: result.callControlId,
                bulk: true,
              },
            } as any);

            const latest = leadsRef.current.find((l) => l.lead_id === lead.lead_id) || lead;
            const stage = String(latest.pipeline_stage || '').toLowerCase().replace('_', ' ');
            if (!stage || stage === 'new lead') {
              await props.onBulkUpdateStage([lead.lead_id], 'Contacted');
            }
          } catch (e) {
            console.error('[Bulk AI_CALL] CRM update failed for', lead.lead_id, e);
          }
        }

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
  }, [onProgress, props.onBulkUpdateStage]);

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
      <div className="flex items-center gap-4 mb-3">
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
          onBulkArchive={() => props.onBulkUpdateStage(Array.from(selectedLeadIds), 'Archived')}
          onBulkChangeStage={handleBulkMoveStage}
          onBulkAddToCampaign={() => console.log('Add to Campaign')}
        />

        <div className="relative">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-md text-xs text-[var(--on-surface-variant)] hover:text-white"
          >
            <Filter className="w-3 h-3" />
            {selectedStages.length > 0 ? `${selectedStages.length} selected` : 'Filter Stages'}
          </button>
          {showFilter && (
            <div className="absolute top-full left-0 z-10 w-48 bg-indigo-950 border border-indigo-700 rounded-md shadow-lg p-2">
              {ALL_STAGES.map(stage => (
                <label key={stage} className="flex items-center gap-2 p-1 text-xs text-white hover:bg-indigo-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStages.includes(stage)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedStages([...selectedStages, stage]);
                      else setSelectedStages(selectedStages.filter(s => s !== stage));
                    }}
                  />
                  {stage}
                </label>
              ))}
              <button 
                className="w-full mt-2 text-[var(--secondary)] text-xs underline"
                onClick={() => setSelectedStages([])}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

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

      <div className="flex-1 flex flex-col min-h-0">
        <LeadsTable {...props} leads={filteredLeads} activities={activities} />
      </div>
    </div>
  );
};
