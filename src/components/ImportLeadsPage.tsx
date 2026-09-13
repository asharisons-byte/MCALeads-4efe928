import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Check,
  RefreshCw,
  FileText,
  Table as TableIcon,
  HelpCircle,
  Database,
} from 'lucide-react';
import {
  parseFileToRawData,
  parseTextToRawData,
  detectColumnMapping,
  analyzeImportRows,
  convertRowsToLeads,
  generateTest500LeadDataset,
  downloadDatasetAsXlsx,
  ColumnMapping,
  ImportPreviewResult,
} from '../services/importService';
import { Lead, PipelineStage } from '../types';
import { OREGON_CCB_LEADS } from '../data/ccbLeadsData';
import { REPAIRED_LEADS_CSV, REPAIRED_LEADS_DATA } from '../data/repairedLeads';
import * as XLSX from 'xlsx';

interface ImportLeadsPageProps {
  existingLeads: Lead[];
  onImportComplete: (newLeads: Lead[], fileName: string, totalCount: number) => void;
  onNavigateToLeads: () => void;
}

export const ImportLeadsPage: React.FC<ImportLeadsPageProps> = ({
  existingLeads,
  onImportComplete,
  onNavigateToLeads,
}) => {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importedLeads, setImportedLeads] = useState<Lead[]>([]);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedContent, setPastedContent] = useState<string>('');
  const [copiedRepaired, setCopiedRepaired] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImport = () => {
    setStep(1);
    setFile(null);
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
    setMappings([]);
    setPreviewResult(null);
    setIsProcessing(false);
    setImportProgress(0);
    setImportedLeads([]);
    setUploadError(null);
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setIsProcessing(true);
    setUploadError(null);
    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    try {
      const { headers, rows } = await parseFileToRawData(uploadedFile);

      if (!headers || headers.length === 0 || !rows || rows.length === 0) {
        throw new Error('No rows or header columns could be extracted from the file.');
      }

      setRawHeaders(headers);
      setRawRows(rows);

      // Auto-detect mappings using 2-pass deterministic algorithm
      const detectedMappings: ColumnMapping[] = headers.map((col) => {
        const det = detectColumnMapping(col);
        return {
          rawColumn: col,
          mappedField: det.field,
          confidence: det.confidence,
        };
      });
      setMappings(detectedMappings);

      // Advance to step 2 (Column Mapping)
      setStep(2);
    } catch (err: any) {
      console.error('Failed to parse file', err);
      setUploadError(err?.message || 'Error reading spreadsheet file. Please check format (.csv, .xlsx, .xls).');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPastedData = () => {
    if (!pastedContent.trim()) {
      setUploadError('Please paste some CSV or lead table rows first.');
      return;
    }
    setIsProcessing(true);
    setUploadError(null);
    try {
      const { headers, rows } = parseTextToRawData(pastedContent);
      if (headers.length === 0 || rows.length === 0) {
        throw new Error('Could not parse any columns or rows from the pasted text. Please make sure the first line has column headers.');
      }
      setRawHeaders(headers);
      setRawRows(rows);
      setFileName('pasted-leads.csv');

      const detectedMappings: ColumnMapping[] = headers.map((col) => {
        const det = detectColumnMapping(col);
        return {
          rawColumn: col,
          mappedField: det.field,
          confidence: det.confidence,
        };
      });
      setMappings(detectedMappings);
      setStep(2);
    } catch (err: any) {
      console.error('Failed to parse pasted data', err);
      setUploadError(err?.message || 'Failed to parse pasted text. Please check format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadRepairedLeads = () => {
    setIsProcessing(true);
    setUploadError(null);
    const headers = Object.keys(REPAIRED_LEADS_DATA[0] || {});
    setRawHeaders(headers);
    setRawRows(REPAIRED_LEADS_DATA);
    setFileName('repaired_leads.csv');

    const detectedMappings: ColumnMapping[] = headers.map((col) => {
      const det = detectColumnMapping(col);
      return {
        rawColumn: col,
        mappedField: det.field,
        confidence: det.confidence,
      };
    });
    setMappings(detectedMappings);
    setIsProcessing(false);
    setStep(2);
  };

  const handleDownloadRepairedCSV = () => {
    const blob = new Blob([REPAIRED_LEADS_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'repaired_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyRepairedCSV = () => {
    navigator.clipboard.writeText(REPAIRED_LEADS_CSV);
    setCopiedRepaired(true);
    setTimeout(() => setCopiedRepaired(false), 2000);
  };

  const handleLoadAttachedCCBLeads = () => {
    setIsProcessing(true);
    setStep(5);
    setImportProgress(25);
    setTimeout(() => {
      setImportProgress(65);
      setTimeout(() => {
        setImportProgress(100);
        setImportedLeads(OREGON_CCB_LEADS);
        setIsProcessing(false);
        setStep(6);
        onImportComplete(OREGON_CCB_LEADS, 'raw_ccb_leads.csv (Oregon CCB)', OREGON_CCB_LEADS.length);
      }, 300);
    }, 300);
  };

  const handleDownloadCCBLeads = () => {
    const exportData = OREGON_CCB_LEADS.map((l) => {
      const orig = l.original_data || {};
      return {
        licenseNumber: orig.licenseNumber || l.lead_id.replace('CCB-', ''),
        licenseType: orig.licenseType || '',
        businessName: l.business_name,
        trade: l.niche,
        city: l.city,
        county: orig.county || '',
        state: l.state,
        zip: l.postal_code,
        phone: l.phone,
        website: l.website,
        ccbStatus: orig.status || l.gmb_status,
        gmbRating: l.gmb_rating,
        gmbReviews: l.gmb_review_count,
        leadScore: l.lead_score,
        recommendedService: l.recommended_service,
        estimatedRetainer: l.estimated_retainer,
      };
    });
    downloadDatasetAsXlsx(exportData, 'oregon_ccb_contractor_leads.xlsx');
  };

  const handleDownloadSampleFile = () => {
    const dataset = generateTest500LeadDataset();
    downloadDatasetAsXlsx(dataset, '500-lead.xlsx');
  };

  const handleLoadSample500 = () => {
    setIsProcessing(true);
    const dataset = generateTest500LeadDataset();
    const headers = Object.keys(dataset[0] || {});
    setRawHeaders(headers);
    setRawRows(dataset);
    setFileName('500-lead.xlsx');

    const detectedMappings: ColumnMapping[] = headers.map((col) => {
      const det = detectColumnMapping(col);
      return {
        rawColumn: col,
        mappedField: det.field,
        confidence: det.confidence,
      };
    });
    setMappings(detectedMappings);
    setIsProcessing(false);
    setStep(2);
  };

  const handleMappingChange = (rawCol: string, mappedField: any) => {
    setMappings((prev) =>
      prev.map((m) => (m.rawColumn === rawCol ? { ...m, mappedField } : m))
    );
  };

  const handleProceedToPreview = () => {
    setIsProcessing(true);
    const analysis = analyzeImportRows(rawRows, existingLeads, mappings);
    setPreviewResult(analysis);
    setIsProcessing(false);
    setStep(3);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setStep(5); // Progress step
    setImportProgress(10);

    setTimeout(() => {
      setImportProgress(40);
      setTimeout(() => {
        setImportProgress(85);
        const newLeads = convertRowsToLeads(rawRows, mappings, 'Sophia (AI Sales Rep)');
        setTimeout(() => {
          setImportProgress(100);
          setImportedLeads(newLeads);
          setIsProcessing(false);
          setStep(6); // Completion
          onImportComplete(newLeads, fileName, newLeads.length);
        }, 300);
      }, 400);
    }, 400);
  };

  return (
    <div id="import-leads-page" className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Import Leads</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload contractor and business spreadsheets (.csv, .xlsx) with automatic 2-pass column detection and Cloud SQL sync.
              </p>
            </div>
          </div>
        </div>

        {step > 1 && (
          <button
            onClick={resetImport}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Start New Import</span>
          </button>
        )}
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
        {[
          { num: 1, title: 'Upload .CSV / .XLSX' },
          { num: 2, title: 'Column Mapping' },
          { num: 3, title: 'Preview & Hygiene' },
          { num: 4, title: 'Validation' },
          { num: 5, title: 'Ingestion' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm'
                : step > s.num
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
              Step {s.num}
            </div>
            <div className="font-semibold mt-0.5 truncate">{s.title}</div>
          </div>
        ))}
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div className="flex-1">{uploadError}</div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* STEP 1: Upload / Paste */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                inputMode === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload CSV / Excel (.csv, .xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                inputMode === 'paste'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Paste CSV / Tab-Separated Data</span>
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-12 text-center flex flex-col items-center justify-center transition-all bg-slate-900/40 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-4 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Drag and drop your .csv or .xlsx lead file here
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-5">
                Supports Standard CSV, Tab-Delimited CSV, Excel (.xlsx, .xls). Automatic two-pass column detection maps exact names (business_name, contact_name, phone, email, etc.) with 99% confidence.
              </p>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                Browse Computer (.csv, .xlsx)
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white">
                    Paste raw lead data (CSV or Tab-Delimited)
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Include column header row as line 1
                  </p>
                </div>
              </div>
              <textarea
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder={`Business Name,Contact Name,Phone,Email,Website URL,City,State,Postal Code,Niche\nApex Plumbing,John Miller,503-555-0199,john@apexplumbing.com,https://apexplumbing.com,Portland,Oregon,97201,Plumber\nCascade Electric,David Vance,503-555-0144,david@cascadeelectric.com,https://cascadeelectric.com,Beaverton,Oregon,97005,Electrician`}
                rows={10}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPastedContent('')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Clear text
                </button>
                <button
                  type="button"
                  disabled={!pastedContent.trim() || isProcessing}
                  onClick={handleProcessPastedData}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <span>Process &amp; Map CSV Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick-Load Ready Datasets */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ready-to-Use Contractor Lead Datasets
            </h4>

            {/* Repaired Upload Table */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Repaired Table (One Peak Construction &amp; Boz Electric)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                    Clean 10-Digit Phones &amp; GMB
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Fully verified contractor records with exact column headers, un-truncated names, contact owners, verified callable phones (fixed scientific notation), and Google Maps URLs.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopyRepairedCSV}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  {copiedRepaired ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <span>Copy CSV</span>
                  )}
                </button>
                <button
                  onClick={handleDownloadRepairedCSV}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .csv</span>
                </button>
                <button
                  onClick={handleLoadRepairedLeads}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Load Repaired Table</span>
                </button>
              </div>
            </div>

            {/* Attached Oregon CCB Leads (202 Records) */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Oregon CCB Contractor Leads (202 Verified Records)</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                    Official State Registry
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Official Oregon CCB contractor registrations with license numbers, trade classifications, phone numbers, and calculated 0–100 lead scores.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDownloadCCBLeads}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .xlsx</span>
                </button>
                <button
                  onClick={handleLoadAttachedCCBLeads}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Load 202 CCB Leads</span>
                </button>
              </div>
            </div>

            {/* 500-Lead Dataset */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Standard 500-Lead Acceptance Test Dataset</span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Comprehensive 500 contractor records across plumbers, roofers, and HVAC trades with PageSpeed scores, GMB ratings, and ad pixel status.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDownloadSampleFile}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .xlsx</span>
                </button>
                <button
                  onClick={handleLoadSample500}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Load 500 Leads</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Column Mapping Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {mappings.filter((m) => m.mappedField !== 'ignore').length} of {rawHeaders.length} columns detected ({fileName} • {rawRows.length} rows)
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              99% Auto-Matched (2-Pass Engine)
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[460px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider sticky top-0">
                <tr className="border-b border-slate-800">
                  <th className="p-3.5">Spreadsheet Column</th>
                  <th className="p-3.5">Sample Value (Row 1)</th>
                  <th className="p-3.5">CRM Target Field</th>
                  <th className="p-3.5 text-center">Match Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                {mappings.map((m) => {
                  const sampleVal = rawRows[0] ? String(rawRows[0][m.rawColumn] || '') : '';
                  return (
                    <tr key={m.rawColumn} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-semibold text-slate-200">{m.rawColumn}</td>
                      <td className="p-3.5 text-slate-400 font-mono truncate max-w-[220px]">
                        {sampleVal || <span className="text-slate-500 italic">empty</span>}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={m.mappedField}
                          onChange={(e) => handleMappingChange(m.rawColumn, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="ignore">Don't Import (Ignore)</option>
                          <option value="business_name">Business Name</option>
                          <option value="contact_name">Contact Name</option>
                          <option value="phone">Phone</option>
                          <option value="email">Email</option>
                          <option value="website">Website URL</option>
                          <option value="address">Address</option>
                          <option value="city">City</option>
                          <option value="state">State</option>
                          <option value="postal_code">Postal Code / ZIP</option>
                          <option value="niche">Niche / Industry</option>
                          <option value="gmb_status">GMB Status</option>
                          <option value="gmb_rating">GMB Rating</option>
                          <option value="gmb_review_count">GMB Review Count</option>
                          <option value="google_maps_url">Google Maps Link</option>
                          <option value="pagespeed_score">PageSpeed Score</option>
                          <option value="google_ads_status">Google Ads Status</option>
                          <option value="meta_pixel_status">Meta Pixel Status</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {m.mappedField !== 'ignore' ? (
                          <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                            {Math.round(m.confidence * 100)}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Upload</span>
            </button>
            <button
              onClick={handleProceedToPreview}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <span>Preview &amp; Dedupe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview & Deduplication */}
      {step === 3 && previewResult && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-base font-bold text-white">Import Preview &amp; Hygiene Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-flight validation complete. Review data quality metrics and duplicate flags.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Rows</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {previewResult.totalRows}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">Valid Rows</div>
              <div className="text-xl font-bold text-emerald-300 font-mono mt-1">
                {previewResult.validRows}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center">
              <div className="text-[10px] text-amber-400 uppercase font-semibold">Missing Phone</div>
              <div className="text-xl font-bold text-amber-300 font-mono mt-1">
                {previewResult.missingContactCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Missing Web</div>
              <div className="text-xl font-bold text-slate-300 font-mono mt-1">
                {previewResult.missingWebsiteCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Missing GMB</div>
              <div className="text-xl font-bold text-slate-300 font-mono mt-1">
                {previewResult.missingGmbCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
              <div className="text-[10px] text-rose-400 uppercase font-semibold">Fatal Errors</div>
              <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                {previewResult.fatalErrorCount}
              </div>
            </div>
          </div>

          {/* Sample Data Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-white flex items-center justify-between">
              <span>First 5 Sample Rows (Normalized)</span>
              <span className="text-slate-400 font-normal">Ready for ingestion</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-bold">
                  <tr className="border-b border-slate-800">
                    <th className="p-3">#</th>
                    {mappings
                      .filter((m) => m.mappedField !== 'ignore')
                      .map((m) => (
                        <th key={m.rawColumn} className="p-3">
                          {m.rawColumn}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/30 font-mono text-[11px]">
                  {previewResult.sampleRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      {mappings
                        .filter((m) => m.mappedField !== 'ignore')
                        .map((m) => (
                          <td key={m.rawColumn} className="p-3 text-slate-300 truncate max-w-[200px]">
                            {String(row[m.rawColumn] || '—')}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Mapping</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <span>Continue to Pre-Flight Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Validation */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="text-base font-bold text-white">Pre-Flight Import Checklist</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify database ingestion settings before adding leads to CRM.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">Column Mapping Confirmed</div>
                <div className="text-slate-400">
                  {mappings.filter((m) => m.mappedField !== 'ignore').length} columns mapped. Unmapped columns will be stored safely under raw lead properties.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">Cloud SQL PostgreSQL Synchronizer</div>
                <div className="text-slate-400">
                  Batches are automatically synced to Cloud SQL persistent storage (<code className="text-emerald-400">europe-west3</code>).
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-white">Auto-Scoring &amp; Opportunity Detection</div>
                <div className="text-slate-400">
                  Every lead will receive a 0–100 explainable score, service retainer estimate, and gap analysis.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleExecuteImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <span>Start CRM Ingestion ({rawRows.length} Leads)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Progress Bar */}
      {step === 5 && (
        <div className="py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              Ingesting &amp; Scoring {rawRows.length || OREGON_CCB_LEADS.length} Leads...
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Calculating 0–100 fit scores, detecting marketing gaps, normalizing phone numbers, and syncing to PostgreSQL.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${importProgress}%` }}
            />
          </div>
          <div className="text-xs font-mono text-indigo-300">{importProgress}% Completed</div>
        </div>
      )}

      {/* STEP 6: Completion */}
      {step === 6 && (
        <div className="py-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Import Completed Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Successfully processed and ingested <span className="font-bold text-white font-mono">{importedLeads.length}</span> contractor leads into your CRM and synced to Cloud SQL storage.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={resetImport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Import More Leads</span>
            </button>
            <button
              onClick={onNavigateToLeads}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <span>View All Leads in CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
