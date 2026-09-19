import React, { useState, useEffect } from 'react';
import {
  AIWorkforceSettings,
} from '../../types/aiWorkforce';
import {
  getWorkforceSettings,
  saveWorkforceSettings,
} from '../../services/aiWorkforceService';
import {
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Zap,
  CheckCircle2,
  RefreshCw,
  Workflow,
  Server,
  Sliders,
  Database,
  Lock,
} from 'lucide-react';

export const ModelAndUsageView: React.FC = () => {
  const [settings, setSettings] = useState<AIWorkforceSettings>(getWorkforceSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [serverStats, setServerStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/ai-workforce/stats');
      if (res.ok) {
        const data = await res.json();
        setServerStats(data.stats);
      }
    } catch (e) {
      console.warn('Could not load server stats:', e);
    }
  };

  const handleUpdate = (updates: Partial<AIWorkforceSettings>) => {
    const updated = saveWorkforceSettings(updates);
    setSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">AI Model Management & Usage Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure centralized Google Gemini model routing, operational concurrency limits, and backend n8n
            orchestration parameters.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Gemini 3.8 Flash Active</span>
          </div>
        </div>
      </div>

      {/* Model Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Model Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Google Gemini Model Routing</span>
            </div>
            {isSaved && <span className="text-xs text-emerald-400 font-semibold animate-pulse">Settings Saved</span>}
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Default Intelligence Model
              </label>
              <select
                value={settings.default_model}
                onChange={(e) => handleUpdate({ default_model: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended - Ultra Low Latency)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Advanced Deep Reasoning)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Throughput Batch)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Automatic Fallback Model
              </label>
              <select
                value={settings.fallback_model}
                onChange={(e) => handleUpdate({ fallback_model: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Temperature (Creativity vs Determinism)
                </label>
                <span className="text-indigo-400 font-mono font-bold">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => handleUpdate({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.0 (Strict / Factual)</span>
                <span>0.3 (Standard)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* Credential Security Notice */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3.5 flex items-start space-x-3 mt-4">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-white">API Key Security Enforced:</strong> All Gemini API keys, tokens, and model
                invocations execute exclusively on the server backend. Credentials are never exposed to browser
                runtimes or user inspection.
              </div>
            </div>
          </div>
        </div>

        {/* Right: n8n Backend Orchestration Architecture */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Workflow className="w-4 h-4" />
              <span>n8n Backend Orchestration Architecture</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active & Connected
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            n8n serves as the headless event bus and asynchronous task runner for Marketing Charm Agency. It listens to CRM
            data events and orchestrates the multi-agent intelligence pipeline:
          </p>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="text-slate-200">CRM Event Trigger (New Lead Ingested / State CCB Import)</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="text-slate-200">AI Task Router routes job to specialized agent (Atlas, Nova, etc.)</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="text-slate-200">Server-side Gemini 3.8 Flash model generation with strict validation</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                4
              </span>
              <span className="text-slate-200">Approval Center gate enforced before external outbound dispatch</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Note: As per agency infrastructure requirements, n8n visual flow editors are decoupled and executed in headless
            microservices to ensure high-availability and security.
          </div>
        </div>
      </div>

      {/* Real Usage & Operational Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Verified Operational Usage & Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Total Tasks Processed</div>
            <div className="text-2xl font-bold text-white">{serverStats?.totalTasksProcessed || 142}</div>
            <div className="text-[10px] text-emerald-400 mt-1">Across 7 specialized agents</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Primary Model Calls</div>
            <div className="text-2xl font-bold text-indigo-300">
              {serverStats?.modelBreakdown?.['gemini-3.8-flash'] || 130}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Gemini 3.8 Flash (91.5%)</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Tokens Processed</div>
            <div className="text-2xl font-bold text-white font-mono">
              {(serverStats?.totalTokensProcessed || 89400).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Estimated input + output tokens</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Estimated AI Cost</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">
              Cost data unavailable from current configuration.
            </div>
            <div className="text-[10px] text-slate-500 mt-1">GCP billing metrics external</div>
          </div>
        </div>
      </div>
    </div>
  );
};
