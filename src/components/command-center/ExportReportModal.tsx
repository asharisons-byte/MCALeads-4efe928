import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
} from 'lucide-react';
import {
  ReportType,
  exportReportData,
} from '../../services/commandCenterService';
import {
  Lead,
  ActivityEvent,
  CallRecord,
  Campaign,
  FollowUpTask,
} from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    leads: Lead[];
    activities: ActivityEvent[];
    calls: CallRecord[];
    campaigns: Campaign[];
    followUps: FollowUpTask[];
  };
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [reportType, setReportType] = useState<ReportType>('pipeline_summary');
  const [format, setFormat] = useState<'CSV' | 'Excel' | 'PDF'>('CSV');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const reportOptions: { id: ReportType; title: string; desc: string }[] = [
    {
      id: 'pipeline_summary',
      title: 'Pipeline & Revenue Intelligence',
      desc: 'Estimated MRR, Confirmed Won MRR, conversion rates, and funnel health',
    },
    {
      id: 'lead_performance',
      title: 'Lead Performance & Scores',
      desc: 'All verified contractor records, fit scores, stages, and marketing angles',
    },
    {
      id: 'campaign_performance',
      title: 'Campaign Sequence Performance',
      desc: 'Enrolled contractor leads, replies, meetings, pipeline, and won values',
    },
    {
      id: 'call_intelligence',
      title: 'Call Intelligence & Transcripts',
      desc: 'Sophia AI and manual call records, duration, sentiment, and outcomes',
    },
    {
      id: 'revenue_intelligence',
      title: 'Revenue by Agency Service',
      desc: 'MRR breakdown across Web, SEO, Speed, GBP, and Ads offerings',
    },
    {
      id: 'follow_up_performance',
      title: 'Follow-Up Performance Queue',
      desc: 'Task status, due dates, commitments, and channel distribution',
    },
  ];

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportReportData(reportType, format, data);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 600);
    } catch (e) {
      console.error('Export error:', e);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mca-hover/50 backdrop-blur-xs p-4">
      <div className="bg-mca-card rounded-xl max-w-lg w-full p-6 shadow-xl border border-white/10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Export Executive Report
              </h3>
              <p className="text-xs text-slate-400">
                Generate downloadable reports grounded in verified CRM activity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-mca-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Report Dataset
          </label>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {reportOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setReportType(opt.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  reportType === opt.id
                    ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-950'
                    : 'bg-mca-card border-white/10 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{opt.title}</span>
                  {reportType === opt.id && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('CSV')}
              className={`p-3 rounded-xl border text-center transition-all ${
                format === 'CSV'
                  ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-300 font-bold'
                  : 'bg-mca-card border-white/10 hover:bg-mca-void/40 text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 mx-auto mb-1 text-slate-300" />
              <span className="text-xs">CSV</span>
            </button>
            <button
              onClick={() => setFormat('Excel')}
              className={`p-3 rounded-xl border text-center transition-all ${
                format === 'Excel'
                  ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-300 font-bold'
                  : 'bg-mca-card border-white/10 hover:bg-mca-void/40 text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
              <span className="text-xs">Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => setFormat('PDF')}
              className={`p-3 rounded-xl border text-center transition-all ${
                format === 'PDF'
                  ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-300 font-bold'
                  : 'bg-mca-card border-white/10 hover:bg-mca-void/40 text-slate-200'
              }`}
            >
              <Printer className="w-5 h-5 mx-auto mb-1 text-purple-400" />
              <span className="text-xs">Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-mca-void/40 text-slate-200 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating...' : `Export ${format}`}
          </button>
        </div>
      </div>
    </div>
  );
};
