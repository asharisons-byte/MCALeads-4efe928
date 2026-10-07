import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Mail,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { Lead, Client, Proposal, FollowUpTask } from '../../types';
import {
  ExecutiveBriefing,
  generateExecutiveBriefing,
} from '../../services/executiveIntelligenceService';

interface ExecutiveReportsViewProps {
  leads: Lead[];
  clients: Client[];
  proposals: Proposal[];
  followUps: FollowUpTask[];
}

export const ExecutiveReportsView: React.FC<ExecutiveReportsViewProps> = ({
  leads,
  clients,
  proposals,
  followUps,
}) => {
  const [reportType, setReportType] = useState<'Daily Briefing' | 'Weekly Review' | 'Monthly Review'>('Daily Briefing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<ExecutiveBriefing>(() =>
    generateExecutiveBriefing('Daily Briefing', { leads, clients, proposals, followUps })
  );

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateExecutiveBriefing(reportType, { leads, clients, proposals, followUps });
      setBriefing(generated);
      setIsGenerating(false);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Metric', 'Value'],
        ['Report Type', reportType],
        ['Confirmed MRR', `$${briefing.metrics.confirmed_mrr}`],
        ['Pipeline MRR', `$${briefing.metrics.pipeline_mrr}`],
        ['Active Clients', briefing.metrics.active_clients],
        ['Hot Leads', briefing.metrics.hot_leads],
        ['At-Risk Revenue', `$${briefing.metrics.at_risk_revenue}`],
        ['Generated Date', briefing.date],
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mca_${reportType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. REPORT CONTROL HEADER */}
      <div className="bg-mca-card rounded-xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-black text-white">Executive Report Generator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Board-ready briefings for agency owner Ahmed with verified financials and strategic insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Report Type Selector */}
          <div className="flex items-center gap-1 bg-mca-hover p-1 rounded-xl text-xs font-bold">
            {(['Daily Briefing', 'Weekly Review', 'Monthly Review'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setReportType(t);
                  setBriefing(generateExecutiveBriefing(t, { leads, clients, proposals, followUps }));
                }}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  reportType === t
                    ? 'bg-mca-card text-indigo-300'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-2.5 rounded-xl bg-mca-hover hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-white/10 hover:bg-mca-void/40 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-mca-hover hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. PRINTABLE EXECUTIVE BRIEFING DOCUMENT */}
      <div className="bg-mca-card rounded-xl p-8 border border-white/10 shadow-md space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              MARKETING CHARM AGENCY • CONFIDENTIAL EXECUTIVE INTELLIGENCE
            </span>
            <h2 className="text-2xl font-black text-slate-950 mt-1">{briefing.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prepared for Ahmed, Agency Principal • Date: {briefing.date}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
              Audited Telemetry
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 bg-indigo-950/50 rounded-xl border border-indigo-900/40 space-y-1.5 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-indigo-300">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Executive Overview</span>
          </div>
          <p className="text-slate-200">{briefing.summary}</p>
        </div>

        {/* Core Financials Grid */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            Key Financial & Pipeline Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-mca-void/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Confirmed MRR</span>
              <div className="text-xl font-black text-emerald-300 mt-1">
                ${briefing.metrics.confirmed_mrr.toLocaleString()}/mo
              </div>
            </div>
            <div className="p-3 bg-mca-void/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Pipeline MRR</span>
              <div className="text-xl font-black text-indigo-300 mt-1">
                ${briefing.metrics.pipeline_mrr.toLocaleString()}/mo
              </div>
            </div>
            <div className="p-3 bg-mca-void/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Retainers</span>
              <div className="text-xl font-black text-white mt-1">
                {briefing.metrics.active_clients}
              </div>
            </div>
            <div className="p-3 bg-mca-void/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Hot Targets</span>
              <div className="text-xl font-black text-amber-400 mt-1">
                {briefing.metrics.hot_leads}
              </div>
            </div>
          </div>
        </div>

        {/* Top Recommendation & Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Top Recommendation */}
          <div className="p-4 bg-mca-card rounded-xl border border-white/10 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Single Top Recommendation
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {briefing.top_recommendation}
            </p>
          </div>

          {/* Strategic Priorities */}
          <div className="p-4 bg-mca-card rounded-xl border border-white/10 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strategic Priorities
            </span>
            <ul className="space-y-1 text-slate-200">
              {briefing.priorities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risks & Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-rose-300 uppercase text-[10px] tracking-wider">
              Identified Operational Risks
            </h5>
            <div className="space-y-1.5">
              {briefing.risks.map((risk, idx) => (
                <div key={idx} className="p-3 bg-rose-950/50 rounded-xl border border-rose-800/50 text-rose-300">
                  {risk}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">
              High-Value Strategic Opportunities
            </h5>
            <div className="space-y-1.5">
              {briefing.opportunities.map((opp, idx) => (
                <div key={idx} className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-800/50 text-indigo-300">
                  {opp}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
          <span>Marketing Charm Agency Executive Intelligence Suite</span>
          <span>Autonomous AI Engine Grounded in Oregon CRM Telemetry</span>
        </div>
      </div>
    </div>
  );
};
