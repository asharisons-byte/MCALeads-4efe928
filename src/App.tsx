import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, NavigationItem } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LeadsTable } from './components/LeadsTable';
import { LeadDetail } from './components/LeadDetail';
import { PipelineView } from './components/PipelineView';
import { ImportModal } from './components/ImportModal';
import { AddLeadModal } from './components/AddLeadModal';
import { SophiaModal } from './components/SophiaModal';
import { AgencySettings } from './components/AgencySettings';
import { IntegrationsView } from './components/IntegrationsView';
import { LeadListsView } from './components/LeadListsView';
import { AnalyticsView } from './components/AnalyticsView';
import { EmailOutreachView } from './components/EmailOutreachView';
import { SMSOutreachView } from './components/SMSOutreachView';
import { CallsView } from './components/CallsView';
import { DialerModal } from './components/DialerModal';
import { SophiaAICallModal } from './components/SophiaAICallModal';
import { EmailComposerModal } from './components/EmailComposerModal';
import { SMSComposerModal } from './components/SMSComposerModal';
import { CallDetailModal } from './components/CallDetailModal';
import { CommandCenter } from './components/command-center/CommandCenter';
import { CallIntelligenceDashboard } from './components/CallIntelligenceDashboard';
import { FollowUpQueueView } from './components/FollowUpQueueView';
import { LeadIntelligenceView } from './components/LeadIntelligenceView';
import { AuditsProposalsView } from './components/AuditsProposalsView';
import { AIWorkforceCenter } from './components/ai-workforce/AIWorkforceCenter';
import { ClientPortalUser } from './types/clientPortal';
import {
  createClientPortalSession,
  clearCurrentClientPortalSession,
  getCurrentClientPortalSession,
} from './services/clientPortalService';
import { ClientPortalAgencyHub } from './components/client-portal/ClientPortalAgencyHub';
import { ClientPortalLayout } from './components/client-portal/ClientPortalLayout';
import { ClientLoginView } from './components/client-portal/ClientLoginView';
import { getEmailDrafts } from './services/emailService';
import { getSMSMessages } from './services/messagingService';
import { getStoredCallRecords } from './services/telephonyService';
import { getFollowUpTasks } from './services/callIntelligenceService';
import { getAIApprovals } from './services/aiWorkforceService';
import {
  getLeads,
  saveLeads,
  clearAllLeads,
  addLead,
  updateLead,
  deleteLead,
  bulkUpdateStage,
  bulkDelete,
  addNoteToLead,
  deleteNoteFromLead,
  getActivities,
  addImportHistory,
  syncWithDatabase,
  mapDbLeadToModel,
} from './services/leadService';
import { analyzeLeadWithAI, batchAnalyzeLeads } from './services/geminiService';
import { Lead, ActivityEvent, PipelineStage, CallRecord } from './types';

export function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [currentTab, setCurrentTab] = useState<NavigationItem>('command_center');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [sophiaModalOpen, setSophiaModalOpen] = useState(false);
  const [composerLead, setComposerLead] = useState<Lead | null>(null);
  const [smsComposerLead, setSmsComposerLead] = useState<Lead | null>(null);
  const [dialerModalOpen, setDialerModalOpen] = useState(false);
  const [dialerLead, setDialerLead] = useState<Lead | null>(null);
  const [dialerPhoneNumber, setDialerPhoneNumber] = useState<string>('');
  const [sophiaAICallLead, setSophiaAICallLead] = useState<Lead | null>(null);
  const [selectedCallRecord, setSelectedCallRecord] = useState<CallRecord | null>(null);

  // Client Portal States (Phase 4B)
  const [clientPortalScreen, setClientPortalScreen] = useState<'none' | 'login' | 'portal'>('none');
  const [clientPortalActiveUser, setClientPortalActiveUser] = useState<ClientPortalUser | null>(null);

  // Load initial data from localStorage and sync with Cloud SQL PostgreSQL
  useEffect(() => {
    const loadedLeads = getLeads();
    setLeads(loadedLeads);
    const loadedActivities = getActivities();
    setActivities(loadedActivities);

    // Synchronize state with Cloud SQL PostgreSQL
    syncWithDatabase().then((dbLeads) => {
      if (dbLeads && dbLeads.length > 0) {
        setLeads(dbLeads);
      }
    });

    // Restore active client portal session if one exists
    const activePortalSession = getCurrentClientPortalSession();
    if (activePortalSession && activePortalSession.user) {
      setClientPortalActiveUser(activePortalSession.user);
    }
  }, []);

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.business_name.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.niche?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.lead_id?.toLowerCase().includes(q) ||
        l.opportunity_angle?.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  // Lead CRUD handlers
  const handleAddLead = (newLead: Lead) => {
    const saved = addLead(newLead);
    setLeads(getLeads());
    setActivities(getActivities());
    setSelectedLead(saved);
  };

  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    const updated = updateLead(leadId, updates);
    if (updated) {
      setLeads(getLeads());
      setActivities(getActivities());
      if (selectedLead && selectedLead.lead_id === leadId) {
        setSelectedLead(updated);
      }
    }
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLead(leadId);
    setLeads(getLeads());
    setActivities(getActivities());
    if (selectedLead && selectedLead.lead_id === leadId) {
      setSelectedLead(null);
    }
  };

  const handleBulkUpdateStage = (leadIds: string[], stage: PipelineStage) => {
    bulkUpdateStage(leadIds, stage);
    setLeads(getLeads());
    setActivities(getActivities());
  };

  const handleBulkDelete = (leadIds: string[]) => {
    bulkDelete(leadIds);
    setLeads(getLeads());
    setActivities(getActivities());
  };

  const handleAddNote = (
    leadId: string,
    content: string,
    activityType: any
  ) => {
    addNoteToLead(leadId, content, activityType);
    setLeads(getLeads());
    setActivities(getActivities());
    // Refresh selected lead
    const current = getLeads().find((l) => l.lead_id === leadId);
    if (current) setSelectedLead(current);
  };

  const handleDeleteNote = (leadId: string, noteId: string) => {
    deleteNoteFromLead(leadId, noteId);
    setLeads(getLeads());
    const current = getLeads().find((l) => l.lead_id === leadId);
    if (current) setSelectedLead(current);
  };

  // Trigger Gemini enrichment on selected leads
  const handleTriggerAIEnrichment = async (leadIds: string[]) => {
    const targetLeads = leads.filter((l) => leadIds.includes(l.lead_id));
    if (targetLeads.length === 0) return;

    try {
      const results = await batchAnalyzeLeads(targetLeads);
      for (const [id, enrichment] of Object.entries(results)) {
        updateLead(id, {
          ai_enrichment: enrichment,
          opportunity_angle: enrichment.opportunity_angle,
          recommended_service: enrichment.recommended_service,
          estimated_retainer: enrichment.estimated_retainer,
          estimated_revenue_lift: enrichment.estimated_revenue_lift,
        });
      }
    } catch (e) {
      console.error('Batch enrichment failed, trying single leads:', e);
      for (const target of targetLeads) {
        try {
          const enrichment = await analyzeLeadWithAI(target);
          updateLead(target.lead_id, {
            ai_enrichment: enrichment,
            opportunity_angle: enrichment.opportunity_angle,
            recommended_service: enrichment.recommended_service,
            estimated_retainer: enrichment.estimated_retainer,
            estimated_revenue_lift: enrichment.estimated_revenue_lift,
          });
        } catch (err) {
          console.error('Enrichment failed for lead', target.lead_id, err);
        }
      }
    }
    setLeads(getLeads());
    setActivities(getActivities());
  };

  // Handle successful import
  const handleImportComplete = async (
    newLeads: Lead[],
    fileName: string,
    totalCount: number
  ) => {
    try {
      // Persist batch import to Neon / Cloud SQL PostgreSQL
      const response = await fetch('/api/leads/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: newLeads,
          meta: {
            fileName,
            rowsCount: totalCount,
            source: 'Excel / CSV Import Engine',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch import failed with HTTP status ${response.status}`);
      }

      const result = await response.json();

      // Read confirmed inserted records returned by the server
      let confirmedLeads: Lead[] = [];
      if (result && Array.isArray(result.leads) && result.leads.length > 0) {
        confirmedLeads = result.leads.map((record: any) => mapDbLeadToModel(record));
      } else {
        confirmedLeads = newLeads;
      }

      const current = getLeads();
      const existingIds = new Set(current.map((l) => l.lead_id));
      const newConfirmed = confirmedLeads.filter((l) => !existingIds.has(l.lead_id));
      const combined = [...newConfirmed, ...current];

      saveLeads(combined);
      setLeads(combined);

      addImportHistory({
        id: `imp-${Date.now()}`,
        file_name: fileName,
        imported_date: new Date().toLocaleDateString(),
        rows_count: totalCount,
        valid_count: result.validCount !== undefined ? result.validCount : newConfirmed.length,
        duplicates_count: result.duplicatesCount !== undefined ? result.duplicatesCount : 0,
        rejected_count: totalCount - (result.validCount !== undefined ? result.validCount : newConfirmed.length),
        imported_by: 'Sophia (AI Sales Rep)',
        status: 'Completed',
      });
    } catch (err) {
      console.warn('[Batch Import Sync Fallback Notice]:', err);
      const current = getLeads();
      const existingIds = new Set(current.map((l) => l.lead_id));
      const newOnly = newLeads.filter((l) => !existingIds.has(l.lead_id));
      const combined = [...newOnly, ...current];
      saveLeads(combined);
      setLeads(combined);

      addImportHistory({
        id: `imp-${Date.now()}`,
        file_name: fileName,
        imported_date: new Date().toLocaleDateString(),
        rows_count: totalCount,
        valid_count: newOnly.length,
        duplicates_count: 0,
        rejected_count: 0,
        imported_by: 'Sophia (AI Sales Rep)',
        status: 'Completed',
      });
    }

    setActivities(getActivities());
    setCurrentTab('leads');
  };

  const handleClearAllLeads = () => {
    clearAllLeads();
    setLeads([]);
    setActivities([]);
    setSelectedLead(null);
  };

  // Full-Screen Client Portal Override (Strict Multi-Tenant Isolation from Agency Suite)
  if (clientPortalScreen === 'portal' && clientPortalActiveUser) {
    return (
      <ClientPortalLayout
        currentUser={clientPortalActiveUser}
        onLogout={() => {
          clearCurrentClientPortalSession();
          setClientPortalActiveUser(null);
          setClientPortalScreen('login');
        }}
        onExitToAgencySuite={() => {
          setClientPortalScreen('none');
          setCurrentTab('client_portal');
        }}
      />
    );
  }

  if (clientPortalScreen === 'login') {
    return (
      <ClientLoginView
        onLoginSuccess={(user) => {
          setClientPortalActiveUser(user);
          setClientPortalScreen('portal');
        }}
        onExitToAgencySuite={() => {
          setClientPortalScreen('none');
          setCurrentTab('client_portal');
        }}
      />
    );
  }

  return (
    <div id="mca-app-root" className="flex h-screen bg-[#090d16] text-slate-100 antialiased overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setSelectedLead(null);
          setCurrentTab(tab);
        }}
        onOpenImport={() => setImportModalOpen(true)}
        leadsCount={leads.length}
        hotCount={leads.filter((l) => l.is_hot_target).length}
        draftsCount={getEmailDrafts().length}
        smsCount={getSMSMessages().length}
        callsCount={getStoredCallRecords().length}
        followUpsCount={getFollowUpTasks().filter((f) => f.status === 'Pending').length}
        approvalsCount={getAIApprovals().filter((a) => a.status === 'Pending').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenImport={() => setImportModalOpen(true)}
          onOpenAddLead={() => setAddLeadModalOpen(true)}
          onOpenSophia={() => setSophiaModalOpen(true)}
          searchResults={searchResults}
          onSelectLead={(lead) => {
            setSelectedLead(lead);
            setSearchQuery('');
          }}
          notificationsCount={activities.length}
        />

        {/* View Routing */}
        <main className="flex-1 overflow-y-auto bg-[#090d16]">
          {selectedLead ? (
            <LeadDetail
              lead={selectedLead}
              onBack={() => setSelectedLead(null)}
              onUpdateLead={handleUpdateLead}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          ) : currentTab === 'command_center' ? (
            <div className="p-6 max-w-7xl mx-auto">
              <CommandCenter
                leads={leads}
                activities={activities}
                onOpenLead={(leadId) => {
                  if (leadId) {
                    const found = leads.find((l) => l.lead_id === leadId);
                    if (found) setSelectedLead(found);
                  } else {
                    setAddLeadModalOpen(true);
                  }
                }}
                onOpenDialer={(leadId) => {
                  const targetLead = leadId ? leads.find((l) => l.lead_id === leadId) : null;
                  setDialerLead(targetLead || null);
                  setDialerPhoneNumber(targetLead?.phone || '');
                  setDialerModalOpen(true);
                }}
                onStartAICall={(leadId) => {
                  const targetLead = leads.find((l) => l.lead_id === leadId) || leads[0];
                  if (targetLead) setSophiaAICallLead(targetLead);
                }}
                onOpenEmailModal={(leadId) => {
                  const targetLead = leadId ? leads.find((l) => l.lead_id === leadId) : leads[0];
                  if (targetLead) setComposerLead(targetLead);
                }}
                onOpenSMSModal={(leadId) => {
                  const targetLead = leadId ? leads.find((l) => l.lead_id === leadId) : leads[0];
                  if (targetLead) setSmsComposerLead(targetLead);
                }}
                onViewPipeline={() => setCurrentTab('pipeline')}
                onViewFollowUps={() => setCurrentTab('follow_ups')}
                onViewCampaigns={() => setCurrentTab('email_outreach')}
                onViewCallIntelligence={() => setCurrentTab('call_intelligence')}
                onFilterByStage={(stage) => {
                  setCurrentTab('pipeline');
                }}
                onRefreshData={() => {
                  setLeads(getLeads());
                  setActivities(getActivities());
                }}
              />
            </div>
          ) : currentTab === 'call_intelligence' ? (
            <CallIntelligenceDashboard
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenCallDetail={(call) => setSelectedCallRecord(call)}
              onOpenDialer={(lead, phone) => {
                setDialerLead(lead || null);
                setDialerPhoneNumber(phone || lead?.phone || '');
                setDialerModalOpen(true);
              }}
              onOpenAICall={(lead) => setSophiaAICallLead(lead)}
            />
          ) : currentTab === 'follow_ups' ? (
            <FollowUpQueueView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenEmail={(lead) => setComposerLead(lead)}
              onOpenSMS={(lead) => setSmsComposerLead(lead)}
              onOpenDialer={(lead, phone) => {
                setDialerLead(lead || null);
                setDialerPhoneNumber(phone || lead?.phone || '');
                setDialerModalOpen(true);
              }}
              onOpenAICall={(lead) => setSophiaAICallLead(lead)}
            />
          ) : currentTab === 'ai_workforce' || currentTab === 'ai_approvals' ? (
            <div className="p-6 max-w-7xl mx-auto">
              <AIWorkforceCenter
                leads={leads}
                onOpenEmailComposer={(lead) => setComposerLead(lead)}
                onOpenSMSComposer={(lead) => setSmsComposerLead(lead)}
                onNavigateToLeads={() => setCurrentTab('leads')}
                onNavigateToFollowUps={() => setCurrentTab('follow_ups')}
              />
            </div>
          ) : currentTab === 'dashboard' ? (
            <Dashboard
              leads={leads}
              activities={activities}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenImport={() => setImportModalOpen(true)}
              onOpenSophia={() => setSophiaModalOpen(true)}
              onNavigateToLeads={() => setCurrentTab('leads')}
              onNavigateToPipeline={() => setCurrentTab('pipeline')}
            />
          ) : currentTab === 'lead_intelligence' ? (
            <LeadIntelligenceView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onUpdateLead={handleUpdateLead}
              onOpenCall={(lead) => {
                setDialerLead(lead);
                setDialerPhoneNumber(lead.phone || '');
                setDialerModalOpen(true);
              }}
              onOpenAICall={(lead) => {
                setSophiaAICallLead(lead);
              }}
              onOpenEmail={(lead) => {
                setComposerLead(lead);
              }}
              onOpenSMS={(lead) => {
                setSmsComposerLead(lead);
              }}
            />
          ) : currentTab === 'leads' ||
            currentTab === 'ai_analysis' ||
            currentTab === 'lead_scoring' ||
            currentTab === 'opportunities' ? (
            <LeadsTable
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenImport={() => setImportModalOpen(true)}
              onOpenAddLead={() => setAddLeadModalOpen(true)}
              onBulkUpdateStage={handleBulkUpdateStage}
              onBulkDelete={handleBulkDelete}
              onTriggerAIEnrichment={handleTriggerAIEnrichment}
              onClearAllLeads={handleClearAllLeads}
              onOpenDialer={(lead) => {
                setDialerLead(lead);
                setDialerPhoneNumber(lead.phone || '');
                setDialerModalOpen(true);
              }}
              onOpenAICall={(lead) => {
                setSophiaAICallLead(lead);
              }}
            />
          ) : currentTab === 'pipeline' ? (
            <PipelineView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onUpdateStage={(leadId, stage) => handleUpdateLead(leadId, { pipeline_stage: stage })}
              onOpenAddLead={() => setAddLeadModalOpen(true)}
            />
          ) : currentTab === 'audits_proposals' ? (
            <div className="p-6 max-w-7xl mx-auto">
              <AuditsProposalsView
                leads={leads}
                onSelectLead={(lead) => setSelectedLead(lead)}
                onRefreshLeads={() => {
                  setLeads(getLeads());
                  setActivities(getActivities());
                }}
                onLaunchClientPortal={(user) => {
                  createClientPortalSession(user, true);
                  setClientPortalActiveUser(user);
                  setClientPortalScreen('portal');
                }}
              />
            </div>
          ) : currentTab === 'client_portal' ? (
            <ClientPortalAgencyHub
              onLaunchPortalAsUser={(user) => {
                createClientPortalSession(user, true);
                setClientPortalActiveUser(user);
                setClientPortalScreen('portal');
              }}
              onOpenDirectLogin={() => {
                setClientPortalScreen('login');
              }}
              onNavigateTab={(tab) => setCurrentTab(tab as NavigationItem)}
            />
          ) : currentTab === 'lead_lists' ? (
            <LeadListsView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onNavigateToLeads={() => setCurrentTab('leads')}
            />
          ) : currentTab === 'email_outreach' ? (
            <EmailOutreachView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenEmailComposer={(lead) => setComposerLead(lead)}
            />
          ) : currentTab === 'sms' ? (
            <SMSOutreachView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onRefreshLeads={() => setLeads(getLeads())}
            />
          ) : currentTab === 'calls' ? (
            <CallsView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenDialer={(lead, phoneNumber) => {
                setDialerLead(lead || null);
                setDialerPhoneNumber(phoneNumber || lead?.phone || '');
                setDialerModalOpen(true);
              }}
              onRefreshLeads={() => setLeads(getLeads())}
            />
          ) : currentTab === 'analytics' || currentTab === 'revenue' ? (
            <AnalyticsView leads={leads} />
          ) : currentTab === 'agency_settings' ? (
            <AgencySettings />
          ) : currentTab === 'integrations' ? (
            <IntegrationsView />
          ) : (
            <LeadsTable
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenImport={() => setImportModalOpen(true)}
              onOpenAddLead={() => setAddLeadModalOpen(true)}
              onBulkUpdateStage={handleBulkUpdateStage}
              onBulkDelete={handleBulkDelete}
              onTriggerAIEnrichment={handleTriggerAIEnrichment}
              onClearAllLeads={handleClearAllLeads}
              onOpenDialer={(lead) => {
                setDialerLead(lead);
                setDialerPhoneNumber(lead.phone || '');
                setDialerModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        existingLeads={leads}
        onImportComplete={handleImportComplete}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={addLeadModalOpen}
        onClose={() => setAddLeadModalOpen(false)}
        onAddLead={handleAddLead}
      />

      {/* Sophia AI Assistant Modal */}
      <SophiaModal
        isOpen={sophiaModalOpen}
        onClose={() => setSophiaModalOpen(false)}
        leads={leads}
        activeLead={selectedLead}
        onSelectLead={(lead) => setSelectedLead(lead)}
      />

      {/* Global Email Outreach Composer Modal */}
      {composerLead && (
        <EmailComposerModal
          lead={composerLead}
          isOpen={Boolean(composerLead)}
          activities={activities}
          onClose={() => setComposerLead(null)}
          onEmailPrepared={() => {
            setActivities(getActivities());
            setLeads(getLeads());
          }}
          onDraftSaved={() => {
            setActivities(getActivities());
          }}
        />
      )}

      {/* PHASE 2D: Global Professional CRM Dialer Modal */}
      {dialerModalOpen && (
        <DialerModal
          isOpen={dialerModalOpen}
          initialLead={dialerLead}
          initialPhoneNumber={dialerPhoneNumber}
          allLeads={leads}
          onClose={() => {
            setDialerModalOpen(false);
            setDialerLead(null);
            setDialerPhoneNumber('');
            setLeads(getLeads());
            setActivities(getActivities());
          }}
          onLeadUpdated={handleUpdateLead}
        />
      )}

      {/* PHASE 2E: Sophia AI Voice Calling Agent Modal */}
      {sophiaAICallLead && (
        <SophiaAICallModal
          isOpen={Boolean(sophiaAICallLead)}
          lead={sophiaAICallLead}
          onClose={() => {
            setSophiaAICallLead(null);
            setLeads(getLeads());
            setActivities(getActivities());
          }}
          onLeadUpdated={(leadId, updates) => {
            handleUpdateLead(leadId, updates);
          }}
          onOpenEmailComposer={() => {
            setComposerLead(sophiaAICallLead);
          }}
        />
      )}

      {/* Global SMS Composer Modal */}
      {smsComposerLead && (
        <SMSComposerModal
          lead={smsComposerLead}
          isOpen={Boolean(smsComposerLead)}
          onClose={() => setSmsComposerLead(null)}
          onSMSSent={() => {
            setActivities(getActivities());
            setLeads(getLeads());
          }}
        />
      )}

      {/* PHASE 2F: Call Intelligence Detail Modal */}
      {selectedCallRecord && (
        <CallDetailModal
          isOpen={Boolean(selectedCallRecord)}
          call={selectedCallRecord}
          onClose={() => setSelectedCallRecord(null)}
          onSelectLead={(lead) => {
            setSelectedCallRecord(null);
            setSelectedLead(lead);
          }}
          onOpenDialer={(lead, phone) => {
            setSelectedCallRecord(null);
            setDialerLead(lead || null);
            setDialerPhoneNumber(phone || lead?.phone || '');
            setDialerModalOpen(true);
          }}
          onOpenAICall={(lead) => {
            setSelectedCallRecord(null);
            setSophiaAICallLead(lead);
          }}
          matchedLead={leads.find((l) => l.lead_id === selectedCallRecord.lead_id)}
        />
      )}
    </div>
  );
}

export default App;
