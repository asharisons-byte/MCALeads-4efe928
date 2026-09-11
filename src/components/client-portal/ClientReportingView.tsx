import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  PhoneCall,
  Users,
  Eye,
  Search,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  X,
} from 'lucide-react';
import { ClientPerformanceReport } from '../../types/clientPortal';
import { askSophiaAboutReport } from '../../services/clientPortalService';

interface ClientReportingViewProps {
  reports: ClientPerformanceReport[];
  businessName: string;
}

export const ClientReportingView: React.FC<ClientReportingViewProps> = ({
  reports,
  businessName,
}) => {
  const [selectedReport, setSelectedReport] = useState<ClientPerformanceReport>(
    reports[0] || null
  );
  const [showSophiaModal, setShowSophiaModal] = useState(false);
  const [sophiaQuestion, setSophiaQuestion] = useState('');
  const [sophiaAnswer, setSophiaAnswer] = useState<string | null>(null);
  const [isAskingSophia, setIsAskingSophia] = useState(false);

  if (!selectedReport) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Reports Published Yet
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Your agency team will publish your monthly performance digests here.
        </p>
      </div>
    );
  }

  const handleAskSophia = async (presetQuestion?: string) => {
    const q = presetQuestion || sophiaQuestion;
    if (!q.trim()) return;

    setIsAskingSophia(true);
    setSophiaAnswer(null);
    try {
      const answer = await askSophiaAboutReport(selectedReport, q, businessName);
      setSophiaAnswer(answer);
    } catch (e) {
      setSophiaAnswer(
        'Sophia is currently unavailable. Your assigned account manager can walk you through the details of this report.'
      );
    } finally {
      setIsAskingSophia(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 uppercase">
              {selectedReport.report_type}
            </span>
            <span className="text-xs text-slate-400">• Published {selectedReport.period}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {selectedReport.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official monthly digital growth audit prepared for {businessName}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Switch Report dropdown if multiple */}
          {reports.length > 1 && (
            <select
              value={selectedReport.report_id}
              onChange={(e) => {
                const found = reports.find((r) => r.report_id === e.target.value);
                if (found) setSelectedReport(found);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
            >
              {reports.map((r) => (
                <option key={r.report_id} value={r.report_id}>
                  {r.period} Report
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setShowSophiaModal(true);
              setSophiaAnswer(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Ask Sophia About This Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Calls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Direct Calls</span>
            <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {selectedReport.metrics.calls_generated.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{selectedReport.metrics.calls_generated.change_pct}%</span>
          </div>
        </div>

        {/* Metric 2: Qualified Inquiries */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Inquiries</span>
            <Users className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {selectedReport.metrics.qualified_inquiries.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{selectedReport.metrics.qualified_inquiries.change_pct}%</span>
          </div>
        </div>

        {/* Metric 3: Website Traffic */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Visitors</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {selectedReport.metrics.website_traffic.value.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{selectedReport.metrics.website_traffic.change_pct}%</span>
          </div>
        </div>

        {/* Metric 4: Maps Views */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Maps Views</span>
            <Eye className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {selectedReport.metrics.google_maps_views.value.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{selectedReport.metrics.google_maps_views.change_pct}%</span>
          </div>
        </div>

        {/* Metric 5: Impressions */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Impressions</span>
            <Search className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {selectedReport.metrics.impressions.value.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{selectedReport.metrics.impressions.change_pct}%</span>
          </div>
        </div>

        {/* Metric 6: Avg Search Position */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Avg Rank</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            #{selectedReport.metrics.avg_search_position.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Top 3 Maps</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Executive Performance Summary
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          {selectedReport.executive_summary}
        </p>
      </div>

      {/* Highlights & Work Completed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highlights */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Performance Highlights
          </h3>
          <ul className="space-y-2.5">
            {selectedReport.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Work Completed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Work Completed During Period
          </h3>
          <ul className="space-y-2.5">
            {selectedReport.work_completed.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                <span className="leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Insights, Challenges & Next Month Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insights */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Audited Insights
          </h4>
          <div className="space-y-2">
            {selectedReport.insights.map((ins, i) => (
              <p key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                • {ins}
              </p>
            ))}
          </div>
        </div>

        {/* Challenges & Mitigation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Market Challenges Addressed
          </h4>
          <div className="space-y-2">
            {selectedReport.challenges.map((ch, i) => (
              <p key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                • {ch}
              </p>
            ))}
          </div>
        </div>

        {/* Next Month Plan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Next Month Plan
          </h4>
          <div className="space-y-2">
            {selectedReport.next_month_plan.map((p, i) => (
              <div
                key={i}
                className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "Ask Sophia About This Report" Interactive Modal */}
      {showSophiaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ask Sophia About This Report
                  </h3>
                  <p className="text-xs text-slate-400">
                    Client AI Concierge explaining {selectedReport.period} performance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSophiaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Inquiry Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'What drove the +42.3% increase in qualified inquiries?',
                  'What are the upcoming priorities in next month’s plan?',
                  'Why did website traffic increase on mobile?',
                  'How did the Google Guaranteed badge impact call volume?',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSophiaQuestion(preset);
                      handleAskSophia(preset);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sophiaQuestion}
                  onChange={(e) => setSophiaQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskSophia();
                  }}
                  placeholder="Or type your specific question about this report..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAskSophia()}
                  disabled={!sophiaQuestion.trim() || isAskingSophia}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Ask
                </button>
              </div>
            </div>

            {/* AI Explanation Output */}
            {isAskingSophia && (
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center gap-3 text-xs text-purple-700 dark:text-purple-300 italic">
                <Sparkles className="w-4 h-4 animate-spin text-purple-500" />
                <span>Sophia is analyzing report metrics and preparing your explanation...</span>
              </div>
            )}

            {sophiaAnswer && !isAskingSophia && (
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Sophia's Explanation:</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {sophiaAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
