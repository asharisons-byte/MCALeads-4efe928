import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase';
import { Sidebar, NavigationItem } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickActionDock } from './components/QuickActionDock';
import { generateAgencyAlerts, getCampaigns } from './services/commandCenterService';
import { Dashboard } from './components/Dashboard';
import { LeadsPage } from './components/LeadsPage';
import { LeadsTable } from './components/LeadsTable';
import { LeadDetail } from './components/LeadDetail';
import { PipelineView } from './components/PipelineView';
import { ImportModal } from './components/ImportModal';
import { AddLeadModal } from './components/AddLeadModal';
import { SophiaModal } from './components/SophiaModal';
import { AgencySettings } from './components/AgencySettings';
import { IntegrationsView } from './components/IntegrationsView';
import TeamPage from './components/TeamPage';
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
import type { BulkProgress } from './services/bulkQueueService';
import { Lead, ActivityEvent, PipelineStage, CallRecord } from './types';
import { AppRole } from './constants.js';
import { normalizeAppRole } from './utils/roleUtils';
import AcceptInvitePage from './components/AcceptInvitePage.js';

export function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importInitialMode, setImportInitialMode] = useState<'upload' | 'sheets' | 'paste' | 'preset'>('upload');
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [sophiaModalOpen, setSophiaModalOpen] = useState(false);
  const [composerLead, setComposerLead] = useState<Lead | null>(null);
  const [smsComposerLead, setSmsComposerLead] = useState<Lead | null>(null);
  const [dialerModalOpen, setDialerModalOpen] = useState(false);
  const [dialerLead, setDialerLead] = useState<Lead | null>(null);
  const [dialerPhoneNumber, setDialerPhoneNumber] = useState<string>('');
  const [sophiaAICallLead, setSophiaAICallLead] = useState<Lead | null>(null);
  const [activeBulkProgress, setActiveBulkProgress] = useState<BulkProgress | null>(null);
  const [selectedCallRecord, setSelectedCallRecord] = useState<CallRecord | null>(null);
  const [clientPortalScreen, setClientPortalScreen] = useState<'none' | 'login' | 'portal'>('none');
  const [clientPortalActiveUser, setClientPortalActiveUser] = useState<ClientPortalUser | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [smsCount, setSmsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState<NavigationItem>('dashboard');
  const [currentPage, setCurrentPage] = useState(1);

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return (leads || []).filter(
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

  // Open agency action alerts (drives the footer dock badge)
  const agencyAlertsCount = useMemo(() => {
    try {
      return generateAgencyAlerts(leads || [], getFollowUpTasks(), getCampaigns()).length;
    } catch {
      return 0;
    }
  }, [leads]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Fetch role from your Neon DB
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUserRole(normalizeAppRole(data.role) || '');
          }
        } catch (e) {
          console.warn('Could not fetch user role', e);
        }
      } else {
        setCurrentUserRole('');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Outreach (SMS / email / call) can auto-advance a lead New Lead -> Contacted in the DB;
  // re-pull leads so the lead list, detail panel and dashboards show the new stage right away.
  useEffect(() => {
    const onStageChanged = async (e: Event) => {
      const leadId = (e as CustomEvent).detail?.leadId as string | undefined;
      const fresh = await getLeads();
      if (fresh.length > 0) {
        setLeads(fresh);
        if (leadId) {
          setSelectedLead((prev) => (prev && prev.lead_id === leadId ? fresh.find((l) => l.lead_id === leadId) || prev : prev));
        }
      }
    };
    window.addEventListener('lead-stage-changed', onStageChanged);
    return () => window.removeEventListener('lead-stage-changed', onStageChanged);
  }, []);

  // Data Loading Effect
  useEffect(() => {
    if (!firebaseUser) return;
    async function initData() {
      const loadedLeads = await getLeads();
      setLeads(loadedLeads);
      const loadedActivities = getActivities();
      setActivities(loadedActivities);
      const messages = await getSMSMessages();
      setSmsCount(messages.length);

      syncWithDatabase().then((dbLeads) => {
        if (dbLeads && dbLeads.length > 0) {
          setLeads(dbLeads);
        }
      });

      const activePortalSession = getCurrentClientPortalSession();
      if (activePortalSession && activePortalSession.user) {
        setClientPortalActiveUser(activePortalSession.user);
      }
    }
    initData();
  }, [firebaseUser]);



  // Early returns
  if (window.location.pathname === '/accept-invite') {
    return <AcceptInvitePage />;
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050608] text-slate-100">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-400 animate-pulse">Loading MCA Lead Suite…</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050608] text-slate-100">
        <div className="w-full max-w-sm bg-[#0d0f17] border border-white/10 border-t-2 border-t-emerald-400 p-8 text-center space-y-5">
          <div className="mx-auto w-12 h-12 border border-emerald-400/40 flex items-center justify-center font-mono font-bold text-emerald-400">
            MCA
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MCA Lead Agency Suite</h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400 mt-1">Sign in to continue</p>
          </div>
          <button
            onClick={() => signInWithPopup(auth, googleAuthProvider)}
            className="w-full px-6 py-3 bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:shadow-[0_0_14px_rgba(0,255,157,0.55)] transition-shadow"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Lead CRUD handlers
  const handleAddLead = async (newLead: Lead) => {
    const saved = await addLead(newLead);
    setLeads(await getLeads());
    setActivities(getActivities());
    setSelectedLead(saved);
    return saved;
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    // 1. Optimistic Update: Update React state immediately
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.lead_id === leadId ? { ...l, ...updates } : l))
    );
    
    // Also update selectedLead if it matches
    if (selectedLead && selectedLead.lead_id === leadId) {
      setSelectedLead((prev) => prev ? { ...prev, ...updates } : null);
    }

    try {
      // 2. Perform backend mutation with current state validation
      const currentLead = leads.find(l => l.lead_id === leadId);
      const updated = await updateLead(leadId, updates, currentLead);
      
      if (updated) {
        // 3. On success, ensure state matches backend
        setLeads((prevLeads) =>
          prevLeads.map((l) => (l.lead_id === leadId ? updated : l))
        );
        if (selectedLead && selectedLead.lead_id === leadId) {
          setSelectedLead(updated);
        }
        setActivities(getActivities()); // Optional: Refresh activities if needed
      } else {
        // 4. On failure, revert state
        console.error('Lead update returned null, reverting');
        setLeads(await getLeads());
        if (selectedLead && selectedLead.lead_id === leadId) {
          setSelectedLead(leads.find((l) => l.lead_id === leadId) || null);
        }
      }
    } catch (error) {
      // 4. On failure, revert state
      console.error('Update failed, reverting...', error);
      setLeads(await getLeads());
      if (selectedLead && selectedLead.lead_id === leadId) {
        setSelectedLead(leads.find((l) => l.lead_id === leadId) || null);
      }
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    await deleteLead(leadId);
    setLeads(await getLeads());
    setActivities(getActivities());
    if (selectedLead && selectedLead.lead_id === leadId) {
      setSelectedLead(null);
    }
  };

  const handleBulkUpdateStage = async (leadIds: string[], stage: PipelineStage) => {
    await bulkUpdateStage(leadIds, stage);
    setLeads(await getLeads());
    setActivities(getActivities());
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    await bulkDelete(leadIds);
    setLeads(await getLeads());
    setActivities(getActivities());
  };

  const handleAddNote = (
    leadId: string,
    content: string,
    activityType: any
  ) => {
    addNoteToLead(leadId, content, activityType);
    getLeads().then((fresh) => setLeads(fresh));
    setActivities(getActivities());
    // Refresh selected lead
    const current = leads.find((l) => l.lead_id === leadId);
    if (current) setSelectedLead(current);
  };

  const handleDeleteNote = async (leadId: string, noteId: string) => {
    await deleteNoteFromLead(leadId, noteId);
    const updatedLeads = await getLeads();
    setLeads(updatedLeads);
    const current = updatedLeads.find((l) => l.lead_id === leadId);
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
    getLeads().then((fresh) => setLeads(fresh));
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
      }

      if (confirmedLeads.length > 0) {
        const current = await getLeads();
        const confirmedIds = new Set(confirmedLeads.map((l) => l.lead_id));
        const remainingCurrent = current.filter((l) => !confirmedIds.has(l.lead_id));
        const combined = [...confirmedLeads, ...remainingCurrent];

        saveLeads(combined);
        setLeads(combined);
      }

      addImportHistory({
        id: `imp-${Date.now()}`,
        file_name: fileName,
        imported_date: new Date().toLocaleDateString(),
        rows_count: totalCount,
        valid_count: result.validCount !== undefined ? result.validCount : confirmedLeads.length,
        duplicates_count: result.duplicatesCount !== undefined ? result.duplicatesCount : 0,
        rejected_count: result.failedCount !== undefined ? result.failedCount : Math.max(0, totalCount - confirmedLeads.length),
        imported_by: 'Sophia (AI Sales Rep)',
        status: result.failedCount > 0 && confirmedLeads.length === 0 ? 'Failed' : 'Completed',
      });
    } catch (err) {
      console.error('[Batch Import Sync Error]:', err);
      addImportHistory({
        id: `imp-${Date.now()}`,
        file_name: fileName,
        imported_date: new Date().toLocaleDateString(),
        rows_count: totalCount,
        valid_count: 0,
        duplicates_count: 0,
        rejected_count: totalCount,
        imported_by: 'Sophia (AI Sales Rep)',
        status: 'Failed',
      });
    }

    setActivities(getActivities());
    setCurrentTab('leads');
  };

  const handleClearAllLeads = async () => {
    if (!window.confirm('Are you absolutely sure you want to PERMANENTLY delete all leads from the database? This cannot be undone.')) {
      return;
    }
    try {
      await clearAllLeads();
      setLeads([]);
      setActivities([]);
      setSelectedLead(null);
      alert('All leads have been deleted.');
      // Force re-fetch from Neon to ensure UI reflects database state
      setTimeout(() => {
        getLeads().then((freshLeads) => setLeads(freshLeads));
      }, 500);
    } catch (e: any) {
      console.error('Failed to clear leads:', e);
      alert('Failed to delete all leads: ' + (e?.message || 'Unknown error'));
    }
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
    <div id="mca-app-root" className="flex h-screen text-slate-300 antialiased overflow-hidden font-sans selection:bg-mca-neonGreen selection:text-black">
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
        smsCount={smsCount}
        callsCount={getStoredCallRecords().length}
        followUpsCount={getFollowUpTasks().filter((f) => f.status === 'Pending').length}
        approvalsCount={getAIApprovals().filter((a) => a.status === 'Pending').length}
        currentUserRole={currentUserRole}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-mca-bg">
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSophia={() => setSophiaModalOpen(true)}
          searchResults={searchResults}
          onSelectLead={(lead) => {
            setSelectedLead(lead);
            setSearchQuery('');
          }}
          notificationsCount={activities.length}
        />

        {/* View Routing */}
        <main className="hud-main-content flex-1 overflow-y-auto">
          {selectedLead ? (
            <LeadDetail
              lead={selectedLead}
              leads={leads}
              onBack={() => setSelectedLead(null)}
              onUpdateLead={handleUpdateLead}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          ) : currentTab === 'command_center' ? (
            <div className="p-5">
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
                  const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole;
                  const blockedRoles = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'];
                  if (blockedRoles.includes(normalizedRole as string)) {
                    alert('AI calling is not available for your role. Please use the manual dialer.');
                    return;
                  }
                  const targetLead = leads.find((l) => l.lead_id === leadId);
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
                  getLeads().then((fresh) => setLeads(fresh));
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
              onOpenAICall={(lead) => {
                const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole;
                const blockedRoles = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'];
                if (blockedRoles.includes(normalizedRole as string)) {
                  alert('AI calling is not available for your role. Please use the manual dialer.');
                  return;
                }
                setSophiaAICallLead(lead);
              }}
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
              onOpenAICall={(lead) => {
                const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole;
                const blockedRoles = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'];
                if (blockedRoles.includes(normalizedRole as string)) {
                  alert('AI calling is not available for your role. Please use the manual dialer.');
                  return;
                }
                setSophiaAICallLead(lead);
              }}
            />
          ) : currentTab === 'ai_workforce' || currentTab === 'ai_approvals' ? (
            <div className="p-5">
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
              onOpenSophia={() => setSophiaModalOpen(true)}
              onNavigateToLeads={() => setCurrentTab('leads')}
              onNavigateToPipeline={() => setCurrentTab('pipeline')}
              onNavigateTab={(t) => setCurrentTab(t === 'leads' ? 'leads' : t === 'revenue' ? 'revenue' : t === 'ai_workforce' ? 'ai_workforce' : 'command_center')}
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
                const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole;
                const blockedRoles = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'];
                if (blockedRoles.includes(normalizedRole as string)) {
                  alert('AI calling is not available for your role. Please use the manual dialer.');
                  return;
                }
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
            currentTab === 'import_leads' ||
            currentTab === 'ai_analysis' ||
            currentTab === 'lead_scoring' ||
            currentTab === 'opportunities' ? (
            <LeadsPage
              leads={leads}
              selectedLeadIds={selectedLeadIds}
              onSelectionChange={setSelectedLeadIds}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenImport={(mode) => {
                setImportInitialMode(mode || 'upload');
                setImportModalOpen(true);
              }}
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
                const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole;
                const blockedRoles = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'];
                if (blockedRoles.includes(normalizedRole as string)) {
                  alert('AI calling is not available for your role. Please use the manual dialer.');
                  return;
                }
                setSophiaAICallLead(lead);
              }}
              activeBulkProgress={activeBulkProgress}
              setActiveBulkProgress={setActiveBulkProgress}
              onImportComplete={handleImportComplete}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          ) : currentTab === 'pipeline' ? (
            <PipelineView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onUpdateStage={(leadId, stage) => handleUpdateLead(leadId, { pipeline_stage: stage })}
            />
          ) : currentTab === 'audits_proposals' ? (
            <div className="p-5">
              <AuditsProposalsView
                leads={leads}
                onSelectLead={(lead) => setSelectedLead(lead)}
                onRefreshLeads={() => {
                  getLeads().then((fresh) => setLeads(fresh));
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
              onRefreshLeads={async () => setLeads(await getLeads())}
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
              onRefreshLeads={async () => setLeads(await getLeads())}
            />
          ) : currentTab === 'analytics' || currentTab === 'revenue' ? (
            <AnalyticsView leads={leads} />
          ) : currentTab === 'agency_settings' ? (
            <AgencySettings />
          ) : currentTab === 'integrations' ? (
            <IntegrationsView />
          ) : currentTab === 'team' ? (
            <TeamPage currentUserRole={currentUserRole as AppRole} />
          ) : (
            <LeadsTable
              leads={leads}
              selectedLeadIds={selectedLeadIds}
              onSelectionChange={setSelectedLeadIds}
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

        {/* Quick Action Dock (Stitch footer) */}
        <QuickActionDock
          alertsCount={agencyAlertsCount}
          onNewLead={() => setAddLeadModalOpen(true)}
          onSophiaCall={() => {
            const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole;
            if (['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'].includes(normalizedRole as string)) {
              alert('AI calling is not available for your role. Please use the manual dialer.');
              return;
            }
            const target = selectedLead || leads.find((l) => l.is_hot_target) || leads[0];
            if (target) setSophiaAICallLead(target);
            else setAddLeadModalOpen(true);
          }}
          onOpenDialer={() => {
            setDialerLead(selectedLead || null);
            setDialerPhoneNumber(selectedLead?.phone || '');
            setDialerModalOpen(true);
          }}
          onEmail={() => {
            const target = selectedLead || leads[0];
            if (target) setComposerLead(target);
          }}
          onSMS={() => {
            const target = selectedLead || leads[0];
            if (target) setSmsComposerLead(target);
          }}
          onDataQuality={() => {
            setSelectedLead(null);
            setCurrentTab('command_center');
          }}
          onExport={() => {
            setSelectedLead(null);
            setCurrentTab('leads');
          }}
          onSearchCRM={() => document.getElementById('global-search-input')?.focus()}
          onAlerts={() => {
            setSelectedLead(null);
            setCurrentTab('command_center');
          }}
        />
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        initialMode={importInitialMode}
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
            getLeads().then((fresh) => setLeads(fresh));
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
          onOpenAICall={(lead) => {
            setDialerModalOpen(false);
            setSophiaAICallLead(lead);
          }}
          onClose={async () => {
            setDialerModalOpen(false);
            setDialerLead(null);
            setDialerPhoneNumber('');
            setCurrentTab('leads');
            setLeads(await getLeads());
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
            getLeads().then((fresh) => setLeads(fresh));
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
            getLeads().then((fresh) => setLeads(fresh));
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
