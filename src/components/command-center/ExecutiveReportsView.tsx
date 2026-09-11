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
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">Executive Report Generator</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Board-ready briefings for agency owner Ahmed with verified financials and strategic insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Report Type Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            {(['Daily Briefing', 'Weekly Review', 'Monthly Review'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setReportType(t);
                  setBriefing(generateExecutiveBriefing(t, { leads, clients, proposals, followUps }));
                }}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  reportType === t
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. PRINTABLE EXECUTIVE BRIEFING DOCUMENT */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              MARKETING CHARM AGENCY • CONFIDENTIAL EXECUTIVE INTELLIGENCE
            </span>
            <h2 className="text-2xl font-black text-slate-950 mt-1">{briefing.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prepared for Ahmed, Agency Principal • Date: {briefing.date}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audited Telemetry
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1.5 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Executive Overview</span>
          </div>
          <p className="text-slate-700">{briefing.summary}</p>
        </div>

        {/* Core Financials Grid */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Key Financial & Pipeline Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Confirmed MRR</span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                ${briefing.metrics.confirmed_mrr.toLocaleString()}/mo
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Pipeline MRR</span>
              <div className="text-xl font-black text-indigo-700 mt-1">
                ${briefing.metrics.pipeline_mrr.toLocaleString()}/mo
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Retainers</span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {briefing.metrics.active_clients}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Hot Targets</span>
              <div className="text-xl font-black text-amber-600 mt-1">
                {briefing.metrics.hot_leads}
              </div>
            </div>
          </div>
        </div>

        {/* Top Recommendation & Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Top Recommendation */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Single Top Recommendation
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {briefing.top_recommendation}
            </p>
          </div>

          {/* Strategic Priorities */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strategic Priorities
            </span>
            <ul className="space-y-1 text-slate-700">
              {briefing.priorities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risks & Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-rose-800 uppercase text-[10px] tracking-wider">
              Identified Operational Risks
            </h5>
            <div className="space-y-1.5">
              {briefing.risks.map((risk, idx) => (
                <div key={idx} className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-rose-900">
                  {risk}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-indigo-800 uppercase text-[10px] tracking-wider">
              High-Value Strategic Opportunities
            </h5>
            <div className="space-y-1.5">
              {briefing.opportunities.map((opp, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-indigo-900">
                  {opp}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <span>Marketing Charm Agency Executive Intelligence Suite</span>
          <span>Autonomous AI Engine Grounded in Oregon CRM Telemetry</span>
        </div>
      </div>
    </div>
  );
};
