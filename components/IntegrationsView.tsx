import React, { useState, useEffect } from 'react';
import {
  Puzzle,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  PhoneCall,
  MessageSquare,
  Mail,
  Workflow,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Play,
  Send,
  Radio,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import {
  fetchIntegrationsStatus,
  testIntegrationConnection,
  fetchWebhookEvents,
  fetchAutomationRuns,
  triggerN8nWorkflow,
  simulateInboundSmsWebhook,
  simulateVoiceWebhook,
  IntegrationItem,
  WebhookEventRecord,
  AutomationRunRecord,
  IntegrationTestResult,
} from '../services/integrationService';

export const IntegrationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'testing' | 'webhooks' | 'automations'>('status');
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [statusData, setStatusData] = useState<Record<string, IntegrationItem>>({});
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, IntegrationTestResult>>({});
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventRecord[]>([]);
  const [automationRuns, setAutomationRuns] = useState<AutomationRunRecord[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Simulation Studio State
  const [simPhone, setSimPhone] = useState<string>('+15035550144');
  const [simSmsText, setSimSmsText] = useState<string>('Yes, we are interested in getting more commercial roofing leads. Can Sophia give us a call?');
  const [simLeadId, setSimLeadId] = useState<string>('1');
  const [simulatingSms, setSimulatingSms] = useState<boolean>(false);
  const [simSmsResult, setSimSmsResult] = useState<any>(null);

  const [simCallOutcome, setSimCallOutcome] = useState<'call.answered' | 'call.hangup' | 'call.transcription.saved'>('call.transcription.saved');
  const [simCallTranscript, setSimCallTranscript] = useState<string>(
    'Sophia: "Hi, this is Sophia with Marketing Charm Agency calling regarding your local Google Maps ranking in Portland." Prospect: "Yes, we have been losing jobs to competitors lately and want to rank higher. What does your package cost?" Sophia: "We offer comprehensive digital growth starting with a free audit."'
  );
  const [simulatingCall, setSimulatingCall] = useState<boolean>(false);
  const [simCallResult, setSimCallResult] = useState<any>(null);

  const [simWorkflowName, setSimWorkflowName] = useState<string>('Contractor High-Score Lead Enrichment');
  const [triggeringWorkflow, setTriggeringWorkflow] = useState<boolean>(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);

  const loadAll = async () => {
    setRefreshing(true);
    try {
      const [statusRes, webhooks, runs] = await Promise.all([
        fetchIntegrationsStatus(),
        fetchWebhookEvents(),
        fetchAutomationRuns(),
      ]);
      setStatusData(statusRes.integrations);
      setWebhookEvents(webhooks);
      setAutomationRuns(runs);
    } catch (e) {
      console.error('Error refreshing integrations:', e);
    } finally {
      setLoadingStatus(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleTestService = async (serviceKey: string) => {
    setTestingService(serviceKey);
    try {
      const res = await testIntegrationConnection(serviceKey);
      setTestResults((prev) => ({ ...prev, [serviceKey]: res }));
      // Refresh status after test probe
      const statusRes = await fetchIntegrationsStatus();
      setStatusData(statusRes.integrations);
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [serviceKey]: { success: false, service: serviceKey, message: err.message },
      }));
    } finally {
      setTestingService(null);
    }
  };

  const handleSimulateInboundSms = async () => {
    if (!simPhone || !simSmsText) return;
    setSimulatingSms(true);
    setSimSmsResult(null);
    try {
      const res = await simulateInboundSmsWebhook({
        fromPhone: simPhone,
        messageText: simSmsText,
        leadId: simLeadId,
      });
      setSimSmsResult(res);
      // Reload webhooks
      const updated = await fetchWebhookEvents();
      setWebhookEvents(updated);
    } catch (e: any) {
      setSimSmsResult({ error: e.message });
    } finally {
      setSimulatingSms(false);
    }
  };

  const handleSimulateCallWebhook = async () => {
    setSimulatingCall(true);
    setSimCallResult(null);
    try {
      const res = await simulateVoiceWebhook({
        eventType: simCallOutcome,
        leadId: simLeadId,
        phone: simPhone,
        durationSeconds: 94,
        transcript: simCallTranscript,
      });
      setSimCallResult(res);
      const updated = await fetchWebhookEvents();
      setWebhookEvents(updated);
    } catch (e: any) {
      setSimCallResult({ error: e.message });
    } finally {
      setSimulatingCall(false);
    }
  };

  const handleTriggerWorkflow = async () => {
    setTriggeringWorkflow(true);
    setWorkflowResult(null);
    try {
      const res = await triggerN8nWorkflow({
        workflowName: simWorkflowName,
        leadId: simLeadId,
        payload: { triggered_by: 'Sophia AI Integration Suite', timestamp: new Date().toISOString() },
      });
      setWorkflowResult(res);
      const updated = await fetchAutomationRuns();
      setAutomationRuns(updated);
    } catch (e: any) {
      setWorkflowResult({ error: e.message });
    } finally {
      setTriggeringWorkflow(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </span>
        );
      case 'READY_WITH_DEMO_KEY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Ready (Demo Mode)
          </span>
        );
      case 'CONFIGURING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Test Mode / Configuring
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            Degraded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {status || 'Standby'}
          </span>
        );
    }
  };

  const serviceIcons: Record<string, React.ReactNode> = {
    gemini: <Sparkles className="w-5 h-5 text-purple-400" />,
    cloudSql: <Database className="w-5 h-5 text-emerald-400" />,
    telnyxVoice: <PhoneCall className="w-5 h-5 text-indigo-400" />,
    telnyxSms: <MessageSquare className="w-5 h-5 text-teal-400" />,
    gmail: <Mail className="w-5 h-5 text-blue-400" />,
    n8n: <Workflow className="w-5 h-5 text-amber-400" />,
    googleMaps: <MapPin className="w-5 h-5 text-rose-400" />,
  };

  const serviceProbeKeys: Record<string, string> = {
    gemini: 'gemini',
    cloudSql: 'database',
    telnyxVoice: 'telnyx-voice',
    telnyxSms: 'telnyx-sms',
    gmail: 'gmail',
    n8n: 'n8n',
  };

  return (
    <div id="mca-integrations" className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase">
              Phase 5C Activated
            </span>
            <span className="text-xs text-slate-500">Live External Integrations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Integrations &amp; System Activation
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Real connections with Google Gemini AI, Telnyx Voice &amp; SMS, Gmail, n8n Automation, and Google Cloud SQL.
            All communications and AI outputs continuously sync to the central database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-refresh-integrations"
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{refreshing ? 'Polling...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {/* ARCHITECTURE PIPELINE OVERVIEW */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Central Architecture Synchronizer</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Active</span>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              MCA CRM → Server APIs → External Services → Webhook Handlers → Cloud SQL Database Update → Live Timeline Refresh
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Webhook Ingress: Active</span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'status'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Integration Status Panel (7)</span>
        </button>

        <button
          onClick={() => setActiveTab('testing')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'testing'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Simulation &amp; Dispatch Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'webhooks'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Webhook Events Log ({webhookEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('automations')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'automations'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>n8n Workflow Runs ({automationRuns.length})</span>
        </button>
      </div>

      {/* TAB 1: INTEGRATION STATUS PANEL */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(statusData).map(([key, itemRaw]) => {
              const item = itemRaw as IntegrationItem;
              const probeKey = serviceProbeKeys[key];
              const isTesting = testingService === probeKey;
              const probeResult = probeKey ? testResults[probeKey] : null;

              return (
                <div
                  key={key}
                  className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 shadow-lg shadow-black/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                        {serviceIcons[key] || <Puzzle className="w-5 h-5 text-indigo-400" />}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <p className="text-[11px] font-medium text-slate-400">{item.category}</p>
                    </div>

                    {/* Metadata attributes */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      {item.latencyMs !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Ping / Latency:</span>
                          <span className="font-mono text-emerald-400 font-semibold">{item.latencyMs}ms</span>
                        </div>
                      )}
                      {item.engine && (
                        <div className="flex items-center justify-between">
                          <span>Database Engine:</span>
                          <span className="font-mono text-slate-300">{item.engine}</span>
                        </div>
                      )}
                      {item.fromNumber && (
                        <div className="flex items-center justify-between">
                          <span>Sender Number:</span>
                          <span className="font-mono text-slate-300">{item.fromNumber}</span>
                        </div>
                      )}
                      {item.models && (
                        <div className="flex items-center justify-between">
                          <span>Primary Model:</span>
                          <span className="font-mono text-purple-300">{item.models[0]}</span>
                        </div>
                      )}
                      {item.mode && (
                        <div className="flex items-center justify-between">
                          <span>API Mode:</span>
                          <span className="font-mono text-slate-300">{item.mode}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Central Database Sync:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Enabled
                        </span>
                      </div>
                    </div>

                    {/* Test probe result banner if executed */}
                    {probeResult && (
                      <div
                        className={`p-2.5 rounded-xl text-[11px] leading-tight ${
                          probeResult.success
                            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1">
                          {probeResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{probeResult.success ? 'Operational Response' : 'Diagnostic Notice'}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-300">{probeResult.message}</p>
                        {probeResult.latencyMs && (
                          <div className="mt-1 font-mono text-[10px] text-slate-400">Roundtrip: {probeResult.latencyMs}ms</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {probeKey ? (
                      <button
                        onClick={() => handleTestService(probeKey)}
                        disabled={isTesting}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all disabled:opacity-50"
                      >
                        <Play className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Self-managed Client API</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SENSITIVE CREDENTIALS & ENVIRONMENT GUIDE */}
          <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Key Isolation &amp; Environment Variables</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In accordance with AI Studio security standards, secret API keys (such as Telnyx and Gmail) are managed exclusively
              server-side via environment variables and never leaked to the browser. To connect live credentials, configure them in your
              environment or AI Studio Secrets panel.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-slate-500 text-[10px]">AI ENGINE</div>
                GEMINI_API_KEY
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-slate-500 text-[10px]">VOICE &amp; SMS</div>
                TELNYX_API_KEY
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-slate-500 text-[10px]">OUTREACH EMAIL</div>
                GMAIL_REFRESH_TOKEN
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <div className="text-slate-500 text-[10px]">WORKFLOW WEBHOOK</div>
                N8N_WEBHOOK_URL
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIMULATION & DISPATCH STUDIO */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Telnyx Inbound SMS Webhook Simulator */}
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Inbound Telnyx SMS Webhook</h3>
                  <p className="text-[11px] text-slate-400">Simulate incoming contractor reply to test Sophia intent analysis</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contractor Phone</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Incoming Message Body</label>
                  <textarea
                    rows={3}
                    value={simSmsText}
                    onChange={(e) => setSimSmsText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <button
                  onClick={handleSimulateInboundSms}
                  disabled={simulatingSms}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${simulatingSms ? 'animate-spin' : ''}`} />
                  <span>{simulatingSms ? 'Triggering Webhook...' : 'Simulate Inbound SMS'}</span>
                </button>

                {simSmsResult && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <div className="font-bold text-teal-300">Webhook Response:</div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(simSmsResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Telnyx Call Event Webhook Simulator */}
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <PhoneCall className="w-4 h-4 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Telnyx Voice Event Webhook</h3>
                  <p className="text-[11px] text-slate-400">Trigger call event to test transcript processing &amp; CRM update</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Event Type</label>
                  <select
                    value={simCallOutcome}
                    onChange={(e) => setSimCallOutcome(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="call.transcription.saved">call.transcription.saved (AI Summary)</option>
                    <option value="call.answered">call.answered (In-Progress)</option>
                    <option value="call.hangup">call.hangup (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Simulated Transcript</label>
                  <textarea
                    rows={3}
                    value={simCallTranscript}
                    onChange={(e) => setSimCallTranscript(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <button
                  onClick={handleSimulateCallWebhook}
                  disabled={simulatingCall}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${simulatingCall ? 'animate-spin' : ''}`} />
                  <span>{simulatingCall ? 'Dispatching...' : 'Dispatch Call Webhook'}</span>
                </button>

                {simCallResult && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <div className="font-bold text-indigo-300">Webhook Response:</div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(simCallResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 3. n8n Workflow Trigger Simulator */}
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <Workflow className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">n8n Workflow Dispatcher</h3>
                  <p className="text-[11px] text-slate-400">Emit event to n8n automation canvas webhook</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Workflow Event</label>
                  <input
                    type="text"
                    value={simWorkflowName}
                    onChange={(e) => setSimWorkflowName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Lead ID</label>
                  <input
                    type="text"
                    value={simLeadId}
                    onChange={(e) => setSimLeadId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleTriggerWorkflow}
                  disabled={triggeringWorkflow}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${triggeringWorkflow ? 'animate-spin' : ''}`} />
                  <span>{triggeringWorkflow ? 'Dispatching to n8n...' : 'Trigger n8n Workflow'}</span>
                </button>

                {workflowResult && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <div className="font-bold text-amber-300">n8n Dispatch Output:</div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(workflowResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK EVENTS LOG */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Live log of all incoming HTTP callbacks from Telnyx Voice, Telnyx SMS, and n8n stored in Google Cloud SQL.
            </span>
            <button
              onClick={async () => {
                const w = await fetchWebhookEvents();
                setWebhookEvents(w);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Logs
            </button>
          </div>

          {webhookEvents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0d121f] border border-slate-800 text-center space-y-2">
              <Terminal className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No Webhook Events Recorded Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Incoming webhook events from Telnyx Voice, SMS, and n8n will be logged here in real-time. Use the Simulation Studio to test!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Received At</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {webhookEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-900/40 transition-colors font-mono">
                      <td className="p-3 text-slate-500">#{evt.id}</td>
                      <td className="p-3 font-sans font-semibold text-white">{evt.provider}</td>
                      <td className="p-3 text-indigo-300">{evt.eventType}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          {evt.processingStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] text-slate-500 font-sans">Stored in Cloud SQL</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUTOMATIONS RUNS */}
      {activeTab === 'automations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Dispatched workflow runs and callbacks from n8n Automation Engine.
            </span>
            <button
              onClick={async () => {
                const a = await fetchAutomationRuns();
                setAutomationRuns(a);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Runs
            </button>
          </div>

          {automationRuns.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0d121f] border border-slate-800 text-center space-y-2">
              <Workflow className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-300">No Automation Runs Recorded</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Workflows triggered for lead enrichment, outreach cadences, or proposal delivery will display here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-3">Run ID</th>
                    <th className="p-3">Workflow Name</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Target Lead</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {automationRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-900/40 transition-colors font-mono">
                      <td className="p-3 text-slate-500">#{run.id}</td>
                      <td className="p-3 font-sans font-semibold text-white">{run.workflowName}</td>
                      <td className="p-3 text-slate-400 font-sans">{run.workflowProvider}</td>
                      <td className="p-3 text-indigo-300">Lead #{run.relatedEntityId || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            run.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(run.startedAt || run.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
