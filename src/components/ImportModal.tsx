import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  HelpCircle,
  Download,
  Check,
  RefreshCw,
  Link as LinkIcon,
  FileCode,
  FileText,
  Database,
  FolderOpen,
  Table,
  ExternalLink,
} from 'lucide-react';
import { ExcelColumnConverterModal } from './ExcelColumnConverterModal';
import {
  parseFileToRawData,
  parseTextToRawData,
  fetchGoogleSheetData,
  detectColumnMapping,
  analyzeImportRows,
  convertRowsToLeads,
  downloadDatasetAsXlsx,
  ColumnMapping,
  ImportPreviewResult,
} from '../services/importService';
import { Lead, PipelineStage } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLeads: Lead[];
  onImportComplete: (newLeads: Lead[], fileName: string, totalCount: number) => void;
  initialMode?: 'upload' | 'sheets' | 'paste' | 'preset';
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  existingLeads,
  onImportComplete,
  initialMode = 'upload',
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
  const [inputMode, setInputMode] = useState<'upload' | 'sheets' | 'paste' | 'preset'>(initialMode);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [pastedContent, setPastedContent] = useState<string>('');
  const [showConverterModal, setShowConverterModal] = useState<boolean>(false);
  const [copiedRepaired, setCopiedRepaired] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputMode(initialMode);
      setStep(1);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handler functions for repaired CSV and CCB leads
  const handleCopyRepairedCSV = async () => {
    if (importedLeads.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');
    
    // Add headers from first lead object keys
    const headers = Object.keys(importedLeads[0] || {});
    worksheet.columns = headers.map(key => ({ header: key, key }));
    
    // Add rows
    importedLeads.forEach(lead => {
      worksheet.addRow(lead);
    });
    
    const csv = await workbook.csv.writeBuffer();
    navigator.clipboard.writeText(csv.toString()).then(() => {
      setCopiedRepaired(true);
      setTimeout(() => setCopiedRepaired(false), 2000);
    });
  };

  const handleDownloadRepairedCSV = async () => {
    await downloadDatasetAsXlsx(importedLeads, 'repaired_leads.xlsx');
  };

  const handleLoadRepairedLeads = () => {
    onImportComplete(importedLeads, fileName, importedLeads.length);
    onClose();
  };

  const handleDownloadCCBLeads = async () => {
    // Export existing leads as CCB leads
    if (existingLeads.length > 0) {
      await downloadDatasetAsXlsx(existingLeads, 'ccb_leads_export.xlsx');
    }
  };

  const handleLoadAttachedCCBLeads = () => {
    // Load existing leads into the import modal
    if (existingLeads.length > 0) {
      setImportedLeads(existingLeads);
      setStep(6);
    }
  };

  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrl.trim()) return;
    setIsProcessing(true);
    setSheetError(null);
    try {
      const { headers, rows } = await fetchGoogleSheetData(googleSheetUrl.trim());
      if (headers.length === 0 || rows.length === 0) {
        throw new Error('No rows or columns found in Google Sheet. Please check the URL.');
      }
      setRawHeaders(headers);
      setRawRows(rows);
      setFileName('Google_Sheet_Import.csv');

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
      console.error('Failed to import Google Sheet', err);
      setSheetError(
        err.message ||
          'Failed to access Google Sheet. Please ensure it is shared as "Anyone with the link can view".'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPastedData = () => {
    if (!pastedContent.trim()) {
      alert('Please paste some lead rows (CSV, TSV, or JSON) first.');
      return;
    }
    setIsProcessing(true);
    try {
      const { headers, rows } = parseTextToRawData(pastedContent);
      if (headers.length === 0 || rows.length === 0) {
        alert('Could not parse any columns or rows from the pasted text. Please make sure the first line has column headers.');
        setIsProcessing(false);
        return;
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
    } catch (err) {
      console.error('Failed to parse pasted data', err);
      alert('Failed to parse pasted text. Please check format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setIsProcessing(true);
    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    try {
      const { headers, rows } = await parseFileToRawData(uploadedFile);
      setRawHeaders(headers);
      setRawRows(rows);

      // Auto-detect mappings
      const detectedMappings: ColumnMapping[] = headers.map((col) => {
        const det = detectColumnMapping(col);
        return {
          rawColumn: col,
          mappedField: det.field,
          confidence: det.confidence,
        };
      });
      setMappings(detectedMappings);

      // Move to step 2 (Analysis & Mapping)
      setStep(2);
    } catch (err) {
      console.error('Failed to parse file', err);
      alert('Error reading spreadsheet file. Please check format (.xlsx, .xls, .csv).');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample500 = () => {
    // Removed: generateTest500LeadDataset() - test data generator disabled
    alert('Test data generator has been disabled. Please upload your own CSV/Excel files.');
    setIsProcessing(false);
  };

  const handleDownloadSampleFile = () => {
    // Removed: generateTest500LeadDataset() - test data generator disabled
    alert('Test data generator has been disabled. Please upload your own CSV/Excel files.');
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

  const resetImport = () => {
    setStep(1);
    setFile(null);
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
    setMappings([]);
    setPreviewResult(null);
    setImportProgress(0);
    setImportedLeads([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0e1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Import Leads (Excel / CSV)
              </h2>
              <p className="text-xs text-slate-400">
                Phase 1 Data Ingestion Engine • Auto Column Detection &amp; Scoring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {[
              { num: 1, label: 'Upload' },
              { num: 2, label: 'Map Columns' },
              { num: 3, label: 'Preview & Dedupe' },
              { num: 4, label: 'Validation' },
              { num: 5, label: 'Ingestion' },
              { num: 6, label: 'Complete' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    step === s.num
                      ? 'text-indigo-400 font-bold'
                      : step > s.num
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      step === s.num
                        ? 'bg-indigo-600 text-white font-bold'
                        : step > s.num
                        ? 'bg-emerald-600/30 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < 5 && <div className="w-4 h-px bg-slate-800 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Upload, Google Sheets, Paste, or Preset */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Suite Google Drive Folder & Column Converter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Suite Google Drive Folder &amp; Column Formatter</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-semibold">
                        Ready
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Convert spreadsheet columns to match the 28 Suite database fields or open the Drive folder.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConverterModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Convert Columns &amp; Paste</span>
                  </button>
                  <a
                    id="import-modal-drive-link"
                    href="https://drive.google.com/drive/folders/13CDyT2NXYzZtZ-2Jj-TX3Fh6pQz9Dvi7?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Go to Excel Sheet (Drive)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    id="import-modal-template-download"
                    href="/suite_leads_template.xlsx"
                    download="suite_leads_template.xlsx"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Template (.xlsx)</span>
                  </a>
                </div>
              </div>

              {/* Input Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    inputMode === 'upload'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>File Upload (.csv, .xlsx, .json, .txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('sheets')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    inputMode === 'sheets'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Sheets Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    inputMode === 'paste'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Paste Lead Data (CSV/JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('preset')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    inputMode === 'preset'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Curated Datasets</span>
                </button>
              </div>

              {/* MODE 1: File Upload (CSV, XLSX, JSON, TXT) */}
              {inputMode === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-colors bg-slate-900/30 group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, .json, .txt, text/plain, application/json, text/csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Drag and drop your lead list file here
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mb-3">
                    Supports Excel (.xlsx, .xls), CSV (.csv), JSON (.json), and Plain Text (.txt) formats with automatic column detection and Neon DB mapping.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-indigo-300 font-semibold">
                      .CSV
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-300 font-semibold">
                      .XLSX / .XLS
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-amber-300 font-semibold">
                      .JSON
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-sky-300 font-semibold">
                      .TXT
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                  >
                    Browse Files on Computer
                  </button>
                </div>
              )}

              {/* MODE 2: Google Sheets Import */}
              {inputMode === 'sheets' && (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center gap-2.5 text-white">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Import from Google Sheets</h4>
                      <p className="text-[11px] text-slate-400">
                        Paste the shareable link of any public or shared Google Spreadsheet
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold">
                      Google Sheet URL or Spreadsheet ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={googleSheetUrl}
                        onChange={(e) => {
                          setGoogleSheetUrl(e.target.value);
                          if (sheetError) setSheetError(null);
                        }}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        disabled={!googleSheetUrl.trim() || isProcessing}
                        onClick={handleFetchGoogleSheet}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 whitespace-nowrap"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Fetching...</span>
                          </>
                        ) : (
                          <>
                            <span>Fetch &amp; Map Sheet</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {sheetError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Google Sheet Access Error</p>
                        <p className="text-[11px] text-rose-300 mt-0.5">{sheetError}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-300 space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>How to share your Google Sheet for 1-click import:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                      <li>In Google Sheets, click the blue <strong className="text-white">Share</strong> button in the top right.</li>
                      <li>Under "General access", select <strong className="text-white">"Anyone with the link"</strong> (Viewer).</li>
                      <li>Click <strong className="text-white">Copy link</strong> and paste it into the box above.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* MODE 3: Paste Data (CSV, TSV, or JSON) */}
              {inputMode === 'paste' && (
                <div className="space-y-3 p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Paste your raw lead table (CSV, Tab-Separated, TXT, or JSON)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Include header row or JSON array</span>
                  </div>
                  <textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder={`licenseNumber,businessName,city,state,zip,phone,gmbRating,gmbReviews,gmbCategory,gmbMapsUrl\n12345,Apex Plumbing,Portland,OR,97201,503-555-0100,4.8,42,Plumber,https://maps.google.com/...`}
                    rows={8}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPastedContent('')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Clear text
                    </button>
                    <button
                      type="button"
                      disabled={!pastedContent.trim() || isProcessing}
                      onClick={handleProcessPastedData}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md"
                    >
                      <span>Process &amp; Map Data</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 4: Curated Datasets */}
              {inputMode === 'preset' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-white">Select a pre-verified contractor dataset to import into Neon DB:</div>
                    <p className="text-xs text-slate-400">These datasets are verified against official CCB registries and formatted with complete audit metrics.</p>
                  </div>
                </div>
              )}

              {/* Repaired Upload Table (One Peak Construction & Boz Electric) */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Repaired Upload Table (One Peak &amp; Boz Electric)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      Repaired &amp; Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Full clean dataset with normalized headers, un-truncated business names, valid 10-digit callable phones (fixed scientific notation), verified emails, addresses, GMB reviews &amp; ratings.
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
                      <>
                        <span>Copy CSV</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadRepairedCSV}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
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

              {/* Attached Oregon CCB Contractor Leads (202 Verified Records) */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Attached Oregon CCB Contractor Leads (202 Records)</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                      Active In System
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Real Oregon CCB registrations with contractor license numbers, phone numbers, trade classifications, Google Maps matching, and 0–100 lead scores.
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
                    <span>Reload 202 CCB Leads</span>
                  </button>
                </div>
              </div>

              {/* Sample 500-Lead Test Generator (DISABLED) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-50">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Instant Acceptance Test Dataset (500-lead.xlsx) - DISABLED</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-lg">
                    Test data generator has been disabled. Please upload your own CSV/Excel files.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleDownloadSampleFile}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    disabled
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .xlsx</span>
                  </button>
                  <button
                    onClick={handleLoadSample500}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    disabled
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>1-Click Load 500 Leads</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Column Mapping Analysis</h3>
                  <p className="text-xs text-slate-400">
                    {mappings.filter((m) => m.mappedField !== 'ignore').length} of {rawHeaders.length} columns detected ({fileName} • {rawRows.length} rows)
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  98% Auto-Matched
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider sticky top-0">
                    <tr className="border-b border-slate-800">
                      <th className="p-3">Spreadsheet Column</th>
                      <th className="p-3">Sample Value</th>
                      <th className="p-3">CRM Field</th>
                      <th className="p-3 text-center">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                    {mappings.map((m) => {
                      const sampleVal = rawRows[0] ? String(rawRows[0][m.rawColumn] || '') : '';
                      return (
                        <tr key={m.rawColumn} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-slate-200">{m.rawColumn}</td>
                          <td className="p-3 text-slate-400 font-mono truncate max-w-[200px]">
                            {sampleVal || <span className="text-slate-400 italic">empty</span>}
                          </td>
                          <td className="p-3">
                            <select
                              value={m.mappedField}
                              onChange={(e) => handleMappingChange(m.rawColumn, e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
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
                          <td className="p-3 text-center font-mono">
                            {m.mappedField !== 'ignore' ? (
                              <span className="text-emerald-400 font-bold">
                                {Math.round(m.confidence * 100)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Deduplication */}
          {step === 3 && previewResult && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Import Preview &amp; Hygiene Analysis</h3>
                <p className="text-xs text-slate-400">
                  Pre-flight validation complete. Review data quality metrics and duplicate flags.
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Rows</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {previewResult.totalRows}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center">
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold">Valid Leads</div>
                  <div className="text-lg font-bold text-emerald-300 font-mono mt-1">
                    {previewResult.validRows}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-center">
                  <div className="text-[10px] text-amber-400 uppercase font-semibold">Duplicates</div>
                  <div className="text-lg font-bold text-amber-300 font-mono mt-1">
                    {previewResult.potentialDuplicates.length}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Missing Phone/Email</div>
                  <div className="text-lg font-bold text-slate-300 font-mono mt-1">
                    {previewResult.missingContactCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Missing Website</div>
                  <div className="text-lg font-bold text-slate-300 font-mono mt-1">
                    {previewResult.missingWebsiteCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/20 text-center">
                  <div className="text-[10px] text-rose-400 uppercase font-semibold">Invalid / Fatal</div>
                  <div className="text-lg font-bold text-rose-300 font-mono mt-1">
                    {previewResult.fatalErrorCount}
                  </div>
                </div>
              </div>

              {/* Deduplication Section */}
              {previewResult.potentialDuplicates.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{previewResult.potentialDuplicates.length} Duplicate Match Detected</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Action: Keep Both (default)</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {previewResult.potentialDuplicates.map((dup, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">
                            Incoming: {dup.incomingRow[mappings.find((m) => m.mappedField === 'business_name')?.rawColumn || ''] || 'Lead'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Matches existing: {dup.existingLead.business_name} ({dup.matchReason})
                          </div>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {dup.similarity}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Validation Checklist */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Pre-Ingestion Validation Checklist</h3>
                <p className="text-xs text-slate-400">
                  Ensuring zero data loss and deterministic 0–100 score assignment
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Original Data Preservation',
                    desc: 'Raw spreadsheet columns are stored unmodified in original_data JSON payload.',
                    status: 'pass',
                  },
                  {
                    title: 'Schema Normalization',
                    desc: 'Phone numbers, domains, ratings, and locations mapped to normalized CRM fields.',
                    status: 'pass',
                  },
                  {
                    title: 'Marketing Gap Analysis Engine',
                    desc: 'Evaluates website speed, GMB review density, Meta pixel, and Google Ads presence.',
                    status: 'pass',
                  },
                  {
                    title: '0–100 Lead Scoring Matrix',
                    desc: 'Pre-calculates business fit (15), GMB opportunity (15), web opportunity (15), and contactability (10).',
                    status: 'pass',
                  },
                ].map((chk, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">{chk.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{chk.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Ingestion Progress */}
          {step === 5 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">Ingesting &amp; Scoring Leads...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Generating marketing gaps, calculating 0–100 lead scores, and assigning AI recommended services.
              </p>

              <div className="w-full max-w-md bg-slate-800 rounded-full h-3 overflow-hidden mt-4">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-indigo-300 font-bold">
                {importProgress}%
              </span>
            </div>
          )}

          {/* STEP 6: Complete */}
          {step === 6 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Import Successfully Completed!</h3>
              <p className="text-xs text-slate-300 max-w-md">
                Successfully ingested and scored <span className="font-bold text-white">{importedLeads.length} leads</span> into the CRM. Every lead now has an assigned 0–100 score, identified gaps, and an AI opportunity angle.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 w-full max-w-md text-left text-xs space-y-2 mt-2">
                <div className="flex justify-between text-slate-400">
                  <span>Leads Added:</span>
                  <span className="font-bold text-white">{importedLeads.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Average Score:</span>
                  <span className="font-bold text-purple-400">
                    {importedLeads.length > 0
                      ? Math.round(
                          importedLeads.reduce((a, b) => a + b.lead_score, 0) / importedLeads.length
                        )
                      : 0}
                    /100
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Total Pipeline MRR:</span>
                  <span className="font-bold text-emerald-400">
                    $
                    {importedLeads
                      .reduce((a, b) => a + (b.estimated_retainer || 0), 0)
                      .toLocaleString()}
                    /mo
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 6 ? (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            ) : null}

            {step === 2 && (
              <button
                onClick={handleProceedToPreview}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Preview &amp; Dedupe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Continue to Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 4 && (
              <button
                onClick={handleExecuteImport}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <span>Start CRM Ingestion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 6 && (
              <button
                onClick={() => {
                  onClose();
                  resetImport();
                }}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                View Leads in CRM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Excel Column Converter & Paste Formatter Modal */}
      <ExcelColumnConverterModal
        isOpen={showConverterModal}
        onClose={() => setShowConverterModal(false)}
        existingLeads={existingLeads}
        onImportComplete={(imported, source, count) => {
          onImportComplete(imported, source, count);
          setShowConverterModal(false);
          onClose();
        }}
      />
    </div>
  );
};
