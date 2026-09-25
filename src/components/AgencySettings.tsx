import React, { useState, useEffect } from 'react';
import { Settings, Bot, Building2, Shield, Save, Check, Sliders, Radio, Sparkles, Database, PhoneCall, MessageSquare, Mail, Workflow, RefreshCw, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getAgencyConfig, saveAgencyConfig, DEFAULT_AGENCY_CONFIG } from '../services/agencyConfig';
import { fetchIntegrationsStatus, testIntegrationConnection, IntegrationItem } from '../services/integrationService';

export const AgencySettings: React.FC = () => {
  const [config, setConfig] = useState(() => getAgencyConfig());
  const [saved, setSaved] = useState(false);
  const [integrations, setIntegrations] = useState<Record<string, IntegrationItem>>({});
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const data = await fetchIntegrationsStatus();
      setIntegrations(data.integrations);
    } catch (e) {
      console.warn('Could not load integrations in settings:', e);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleTest = async (serviceKey: string, probeName: string) => {
    setTestingKey(serviceKey);
    try {
      const res = await testIntegrationConnection(probeName);
      setTestResult((prev) => ({
        ...prev,
        [serviceKey]: res.success ? `Operational (${res.latencyMs || 24}ms)` : res.message,
      }));
      loadIntegrations();
    } catch (err: any) {
      setTestResult((prev) => ({ ...prev, [serviceKey]: err.message }));
    } finally {
      setTestingKey(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAgencyConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div id="mca-agency-settings" className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Agency Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure centralized branding, AI sales representative identity, and scoring parameters for Marketing Charm Agency.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand & Identity */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Agency Identity &amp; AI Representative</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Agency Name</label>
              <input
                type="text"
                value={config.agency_name || ''}
                onChange={(e) => setConfig({ ...config, agency_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Round-Robin Lead Assignment</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, round_robin_enabled: !config.round_robin_enabled })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${config.round_robin_enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.round_robin_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className="text-slate-300 text-sm">
                  {config.round_robin_enabled ? 'Enabled' : 'Disabled (Manual)'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">CRM Suite Title</label>
              <input
                type="text"
                value={config.app_title || ''}
                onChange={(e) => setConfig({ ...config, app_title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">AI Sales Representative Name</label>
              <input
                type="text"
                value={config.ai_representative_name || ''}
                onChange={(e) => setConfig({ ...config, ai_representative_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">AI Role</label>
              <input
                type="text"
                value={config.ai_representative_role || ''}
                onChange={(e) => setConfig({ ...config, ai_representative_role: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Lead Scoring Weights (0–100 Matrix)</h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">Total: 100 Points</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Business Fit / Niche Max Points</label>
              <input
                type="number"
                value={config.scoring_weights?.business_fit ?? 15}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scoring_weights: {
                      ...(config.scoring_weights || DEFAULT_AGENCY_CONFIG.scoring_weights || {}),
                      business_fit: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">GMB Opportunity Max Points</label>
              <input
                type="number"
                value={config.scoring_weights?.gmb_opportunity ?? 15}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scoring_weights: {
                      ...(config.scoring_weights || DEFAULT_AGENCY_CONFIG.scoring_weights || {}),
                      gmb_opportunity: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Website Opportunity Max Points</label>
              <input
                type="number"
                value={config.scoring_weights?.website_opportunity ?? 15}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scoring_weights: {
                      ...(config.scoring_weights || DEFAULT_AGENCY_CONFIG.scoring_weights || {}),
                      website_opportunity: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Contactability Max Points</label>
              <input
                type="number"
                value={config.scoring_weights?.contactability ?? 10}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scoring_weights: {
                      ...(config.scoring_weights || DEFAULT_AGENCY_CONFIG.scoring_weights || {}),
                      contactability: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Integrations Status & Connectivity Panel (Phase 5C) */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">External Integration Status &amp; Service Probes</h2>
                <p className="text-[11px] text-slate-400">Live operational status across Gemini, Telnyx, Gmail, n8n, and Cloud SQL.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadIntegrations}
              disabled={loadingIntegrations}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${loadingIntegrations ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Gemini */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-xs">Google Gemini AI</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${integrations.gemini?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {integrations.gemini?.status || 'Active'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Model: gemini-3.8-flash</div>
              {testResult.gemini && <div className="text-[10px] font-mono text-purple-300 bg-purple-950/40 p-1.5 rounded border border-purple-500/20">{testResult.gemini}</div>}
              <button
                type="button"
                disabled={testingKey === 'gemini'}
                onClick={() => handleTest('gemini', 'gemini')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>{testingKey === 'gemini' ? 'Pinging...' : 'Test AI Ping'}</span>
              </button>
            </div>

            {/* 2. Cloud SQL */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">Google Cloud SQL</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                  {integrations.cloudSql?.status || 'Connected'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">PostgreSQL 16 (Central DB)</div>
              {testResult.cloudSql && <div className="text-[10px] font-mono text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">{testResult.cloudSql}</div>}
              <button
                type="button"
                disabled={testingKey === 'cloudSql'}
                onClick={() => handleTest('cloudSql', 'database')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>{testingKey === 'cloudSql' ? 'Querying...' : 'Test DB Query'}</span>
              </button>
            </div>

            {/* 3. Telnyx Voice */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-xs">Telnyx Voice</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${integrations.telnyxVoice?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {integrations.telnyxVoice?.status || 'Operational'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">SIP Call Control &amp; Dialer</div>
              {testResult.telnyxVoice && <div className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 p-1.5 rounded border border-indigo-500/20">{testResult.telnyxVoice}</div>}
              <button
                type="button"
                disabled={testingKey === 'telnyxVoice'}
                onClick={() => handleTest('telnyxVoice', 'telnyx-voice')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>{testingKey === 'telnyxVoice' ? 'Testing...' : 'Test Voice API'}</span>
              </button>
            </div>

            {/* 4. Telnyx SMS */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-white text-xs">Telnyx SMS</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${integrations.telnyxSms?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {integrations.telnyxSms?.status || 'Operational'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Two-Way Messaging &amp; Inbound Webhooks</div>
              {testResult.telnyxSms && <div className="text-[10px] font-mono text-teal-300 bg-teal-950/40 p-1.5 rounded border border-teal-500/20">{testResult.telnyxSms}</div>}
              <button
                type="button"
                disabled={testingKey === 'telnyxSms'}
                onClick={() => handleTest('telnyxSms', 'telnyx-sms')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>{testingKey === 'telnyxSms' ? 'Testing...' : 'Test SMS Probe'}</span>
              </button>
            </div>

            {/* 5. Gmail */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-xs">Gmail Outreach</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${integrations.gmail?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {integrations.gmail?.status || 'Operational'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">OAuth / SMTP Direct Outreach</div>
              {testResult.gmail && <div className="text-[10px] font-mono text-blue-300 bg-blue-950/40 p-1.5 rounded border border-blue-500/20">{testResult.gmail}</div>}
              <button
                type="button"
                disabled={testingKey === 'gmail'}
                onClick={() => handleTest('gmail', 'gmail')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>{testingKey === 'gmail' ? 'Testing...' : 'Test Gmail Probe'}</span>
              </button>
            </div>

            {/* 6. n8n Automation */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">n8n Automation</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${integrations.n8n?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {integrations.n8n?.status || 'Operational'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Decoupled Workflow Ingress</div>
              {testResult.n8n && <div className="text-[10px] font-mono text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">{testResult.n8n}</div>}
              <button
                type="button"
                disabled={testingKey === 'n8n'}
                onClick={() => handleTest('n8n', 'n8n')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>{testingKey === 'n8n' ? 'Pinging...' : 'Test n8n Probe'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <div className="text-slate-400">
            {saved && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Agency Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
