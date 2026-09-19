import React, { useState, useMemo } from 'react';
import {
  Table,
  ExternalLink,
  Download,
  Copy,
  Check,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  Upload,
  X,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Database,
  ArrowUpRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Lead, PipelineStage } from '../types';
import {
  parseTextToRawData,
  detectColumnMapping,
  convertRowsToLeads,
  ColumnMapping,
} from '../services/importService';

interface ExcelColumnConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (leads: Lead[], source: string, count: number) => void;
  existingLeads?: Lead[];
}

const SUITE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/13CDyT2NXYzZtZ-2Jj-TX3Fh6pQz9Dvi7?usp=sharing';

// Canonical database columns for the Suite
export const SUITE_DATABASE_FIELDS: {
  field: keyof Lead;
  label: string;
  required: boolean;
  type: string;
  dbColumn: string;
  description: string;
  sample: string;
}[] = [
  { field: 'business_name', label: 'Business Name', required: true, type: 'Text', dbColumn: 'business_name', description: 'Trade name or contractor company name', sample: 'Cascade Summit Roofing LLC' },
  { field: 'contact_name', label: 'Contact Name', required: false, type: 'Text', dbColumn: 'contact_name', description: 'Owner, principal, or decision maker', sample: 'Mark H. Davis (Owner)' },
  { field: 'phone', label: 'Direct Phone', required: false, type: 'Text', dbColumn: 'phone / phone_e164', description: 'Telephone or mobile number', sample: '(503) 555-0142' },
  { field: 'email', label: 'Email Address', required: false, type: 'Text', dbColumn: 'email', description: 'Primary business email', sample: 'info@cascadesummit.com' },
  { field: 'website', label: 'Website URL', required: false, type: 'URL', dbColumn: 'website', description: 'Company homepage or web domain', sample: 'https://cascadesummit.com' },
  { field: 'address', label: 'Street Address', required: false, type: 'Text', dbColumn: 'address', description: 'Physical street address', sample: '1420 SE Powell Blvd' },
  { field: 'city', label: 'City', required: false, type: 'Text', dbColumn: 'city', description: 'City or municipality', sample: 'Portland' },
  { field: 'state', label: 'State', required: false, type: 'Text', dbColumn: 'state_region', description: '2-letter state code or name', sample: 'OR' },
  { field: 'postal_code', label: 'Postal Code', required: false, type: 'Text', dbColumn: 'postal_code', description: 'ZIP or postal code', sample: '97202' },
  { field: 'county', label: 'County', required: false, type: 'Text', dbColumn: 'county', description: 'County name', sample: 'Multnomah' },
  { field: 'niche', label: 'Niche / Specialty', required: false, type: 'Text', dbColumn: 'niche', description: 'Specific trade or specialty focus', sample: 'Roofing & Gutters' },
  { field: 'industry', label: 'Industry Category', required: false, type: 'Text', dbColumn: 'industry', description: 'Broad industry or CCB classification', sample: 'Residential Specialty Contractor' },
  { field: 'ccb_license_number', label: 'CCB License Number', required: false, type: 'Text / Number', dbColumn: 'ccb_license_number', description: 'State contractor licensing board number', sample: '249810' },
  { field: 'gmb_status', label: 'GMB Status', required: false, type: 'Select', dbColumn: 'gmb_status', description: 'Established | Thin GMB | Needs Optimization | No GMB', sample: 'Established' },
  { field: 'gmb_rating', label: 'GMB Rating', required: false, type: 'Number (0-5)', dbColumn: 'google_rating', description: 'Google Maps star rating', sample: '4.8' },
  { field: 'gmb_review_count', label: 'GMB Review Count', required: false, type: 'Integer', dbColumn: 'review_count', description: 'Total public Google reviews', sample: '34' },
  { field: 'google_maps_url', label: 'Google Maps URL', required: false, type: 'URL', dbColumn: 'google_maps_url', description: 'Direct link to Google Maps profile', sample: 'https://maps.google.com/...' },
  { field: 'website_status', label: 'Website Status', required: false, type: 'Select', dbColumn: 'website_status', description: 'Active | No Website | Slow / Unreachable Server', sample: 'Active' },
  { field: 'pagespeed_score', label: 'PageSpeed Score', required: false, type: 'Number (0-100)', dbColumn: 'performance_score', description: 'Lighthouse mobile performance score', sample: '68' },
  { field: 'google_ads_status', label: 'Google Ads Status', required: false, type: 'Select', dbColumn: 'google_ads_detected', description: 'Active | No Ads | Inactive', sample: 'No Ads' },
  { field: 'meta_pixel_status', label: 'Meta Pixel Status', required: false, type: 'Select', dbColumn: 'meta_pixel_detected', description: 'Installed | No Pixel | Misconfigured', sample: 'No Pixel' },
  { field: 'pipeline_stage', label: 'Pipeline Stage', required: false, type: 'Select', dbColumn: 'lead_status', description: 'New Lead | Contacted | Audit Sent | Proposal Sent | Won', sample: 'New Lead' },
  { field: 'lead_score', label: 'Lead Score', required: false, type: 'Number (0-100)', dbColumn: 'lead_score', description: 'Priority opportunity score', sample: '84' },
  { field: 'estimated_retainer', label: 'Estimated Retainer ($)', required: false, type: 'Number', dbColumn: 'estimated_retainer', description: 'Estimated monthly retainer potential', sample: '2800' },
  { field: 'opportunity_angle', label: 'Opportunity Angle', required: false, type: 'Text', dbColumn: 'opportunity_angle', description: 'Sales hook or key marketing weakness', sample: 'Strong reviews, no paid ads' },
  { field: 'recommended_service', label: 'Recommended Service', required: false, type: 'Text', dbColumn: 'recommended_service', description: 'Suggested marketing package to pitch', sample: 'Local Service Ads + Meta Retargeting' },
];

const SAMPLE_RAW_DATA = `Company Name\tContact Person\tPhone Number\tEmail Address\tWebsite\tCity\tState\tPostal\tCategory\tLicense #\tRating\tReviews\tNotes
Apex Pacific Roofing\tDavid Miller\t(503) 555-8821\tdavid@apexpacificroof.com\thttps://apexpacificroof.com\tPortland\tOR\t97214\tRoofing\t248901\t4.9\t42\tTop rated contractor, no ads running
Columbia Basin Electric\tSarah Jenkins\t(541) 555-4432\tinfo@columbiabasinelec.com\t\tThe Dalles\tOR\t97058\tElectrical\t252119\t4.3\t8\tNo website, needs Google profile boost
High Desert HVAC Pros\tCarlos Ramirez\t(541) 555-9011\tcarlos@highdeserthvac.com\thttps://highdeserthvac.com\tBend\tOR\t97702\tHVAC\t250442\t4.6\t19\tMobile speed 38, high opportunity`;

export const ExcelColumnConverterModal: React.FC<ExcelColumnConverterModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  existingLeads = [],
}) => {
  const [activeTab, setActiveTab] = useState<'converter' | 'specs' | 'drive'>('converter');
  const [pastedText, setPastedText] = useState<string>('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseData = (text: string) => {
    setPastedText(text);
    if (!text.trim()) {
      setRawHeaders([]);
      setRawRows([]);
      setMappings([]);
      return;
    }

    const { headers, rows } = parseTextToRawData(text);
    setRawHeaders(headers);
    setRawRows(rows);

    const autoMappings: ColumnMapping[] = headers.map((col) => {
      const det = detectColumnMapping(col);
      return {
        rawColumn: col,
        mappedField: det.field,
        confidence: det.confidence,
      };
    });
    setMappings(autoMappings);
  };

  const handleUpdateMapping = (rawCol: string, targetField: keyof Lead | 'ignore') => {
    setMappings((prev) =>
      prev.map((m) => (m.rawColumn === rawCol ? { ...m, mappedField: targetField, confidence: 1.0 } : m))
    );
  };

  const convertedLeads = useMemo(() => {
    if (rawRows.length === 0 || mappings.length === 0) return [];
    return convertRowsToLeads(rawRows, mappings);
  }, [rawRows, mappings]);

  // Generate tab-delimited text for copying directly into Excel / Google Sheets
  const handleCopyConvertedForExcel = () => {
    if (convertedLeads.length === 0) return;

    // Headers in database order
    const orderedCols = SUITE_DATABASE_FIELDS.map((f) => f.label);
    const rowsText: string[] = [];

    // Header row
    rowsText.push(orderedCols.join('\t'));

    // Value rows
    convertedLeads.forEach((lead) => {
      const rowValues = SUITE_DATABASE_FIELDS.map((col) => {
        let val = (lead as any)[col.field];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
      });
      rowsText.push(rowValues.join('\t'));
    });

    const fullTsv = rowsText.join('\n');
    navigator.clipboard.writeText(fullTsv).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  // Download converted leads as .xlsx file
  const handleDownloadXlsx = () => {
    if (convertedLeads.length === 0) return;

    const exportRows = convertedLeads.map((lead) => {
      const row: Record<string, any> = {};
      SUITE_DATABASE_FIELDS.forEach((col) => {
        row[col.label] = (lead as any)[col.field] ?? '';
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = SUITE_DATABASE_FIELDS.map((c) => ({ wch: Math.max(c.label.length + 3, 16) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Suite Formatted Leads');
    XLSX.writeFile(wb, `converted_suite_leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Direct persistence into PostgreSQL database
  const handleSaveToDatabase = async () => {
    if (convertedLeads.length === 0) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch('/api/leads/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: convertedLeads,
          meta: {
            fileName: 'excel_column_converter.xlsx',
            importedBy: 'Excel Column Converter',
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccessMsg(`Successfully saved ${data.validCount || convertedLeads.length} leads to Neon database!`);
        if (onImportComplete) {
          onImportComplete(convertedLeads, 'Excel Column Converter', data.validCount || convertedLeads.length);
        }
      } else {
        alert(data.error || 'Failed to save leads to database');
      }
    } catch (err: any) {
      alert(`Database error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="excel-column-converter-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="excel-column-converter-modal"
        className="relative w-full max-w-5xl bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Excel Column Converter & Paste Formatter</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Database Schema Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Format and convert contractor columns for the Suite database and Leads page
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="converter-open-drive-top"
              href={SUITE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Go to Excel Sheet (Drive)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              id="converter-modal-close"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800 bg-[#0d1220]">
          <div className="flex items-center gap-1">
            <button
              id="converter-tab-convert"
              onClick={() => setActiveTab('converter')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'converter'
                  ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paste & Convert Columns</span>
              {rawRows.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">
                  {rawRows.length}
                </span>
              )}
            </button>
            <button
              id="converter-tab-specs"
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Column Specs (28 Fields)</span>
            </button>
            <button
              id="converter-tab-drive"
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'drive'
                  ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Google Drive Folder & Templates</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <a
              id="converter-download-template-link"
              href="/suite_leads_template.xlsx"
              download="suite_leads_template.xlsx"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Suite Template (.xlsx)</span>
            </a>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CONVERTER */}
          {activeTab === 'converter' && (
            <div className="space-y-6">
              {/* Quick Drive Folder Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-emerald-950/30 border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Google Drive Folder: "Lead for Suite"</div>
                    <div className="text-[11px] text-slate-400">
                      Paste columns here to convert them, copy them back into your sheet, or save straight to Neon database.
                    </div>
                  </div>
                </div>
                <a
                  id="converter-banner-drive-link"
                  href={SUITE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Open Folder in Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Paste Input Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>1. Paste Raw Excel / Google Sheets Columns & Data</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Accepts tab-separated copy-paste directly from Excel, CSV, or TSV)
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      id="converter-load-sample-btn"
                      type="button"
                      onClick={() => handleParseData(SAMPLE_RAW_DATA)}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Load Sample Contractor Columns</span>
                    </button>
                    {pastedText && (
                      <button
                        id="converter-clear-btn"
                        type="button"
                        onClick={() => handleParseData('')}
                        className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="converter-paste-textarea"
                  rows={5}
                  value={pastedText}
                  onChange={(e) => handleParseData(e.target.value)}
                  placeholder={`Paste your Excel or Google Sheets columns here...\nExample:\nCompany Name\tContact Person\tPhone Number\tWebsite\tCity\tCategory\nApex Pacific Roofing\tDavid Miller\t(503) 555-8821\thttps://apexroof.com\tPortland\tRoofing`}
                  className="w-full font-mono text-xs p-3.5 bg-[#070b14] border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Column Mapping Matrix */}
              {rawHeaders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>2. Column Conversion & Field Mapping</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                          {rawHeaders.length} Columns Detected • {rawRows.length} Rows
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        We automatically matched your Excel headers to the Suite database. Adjust any mappings below:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                    {mappings.map((m) => {
                      const isMapped = m.mappedField !== 'ignore';
                      const targetMeta = SUITE_DATABASE_FIELDS.find((f) => f.field === m.mappedField);

                      return (
                        <div
                          key={m.rawColumn}
                          className={`p-2.5 rounded-lg border text-xs transition-colors flex flex-col justify-between ${
                            isMapped
                              ? 'bg-slate-900 border-slate-700/80'
                              : 'bg-slate-950/60 border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[11px] font-bold text-slate-200 truncate max-w-[140px]" title={m.rawColumn}>
                              "{m.rawColumn}"
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 font-semibold rounded ${
                                isMapped
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isMapped ? 'Mapped' : 'Ignored'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                            <select
                              value={m.mappedField}
                              onChange={(e) => handleUpdateMapping(m.rawColumn, e.target.value as any)}
                              className="w-full bg-[#070b14] border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="ignore">❌ Ignore this column</option>
                              <optgroup label="Suite Database Fields">
                                {SUITE_DATABASE_FIELDS.map((f) => (
                                  <option key={f.field} value={f.field}>
                                    {f.label} {f.required ? '★ (Required)' : ''}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Converted Data Preview Table */}
              {convertedLeads.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>3. Converted Suite Data Preview</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                          {convertedLeads.length} Converted Records Ready
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        This data is formatted exactly according to the Suite database schema:
                      </p>
                    </div>

                    {/* Output Actions Toolbar */}
                    <div className="flex items-center gap-2">
                      <button
                        id="converter-copy-clipboard-btn"
                        onClick={handleCopyConvertedForExcel}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Copy converted columns in standard format to paste directly into your Google Sheet or Excel"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                            <span>Copy for Excel / Sheets</span>
                          </>
                        )}
                      </button>

                      <button
                        id="converter-download-xlsx-btn"
                        onClick={handleDownloadXlsx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Download .xlsx</span>
                      </button>

                      <button
                        id="converter-save-db-btn"
                        onClick={handleSaveToDatabase}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving to Database...</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            <span>Save to Leads Database</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {saveSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {/* Table */}
                  <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-64 bg-[#070b14]">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-900/90 sticky top-0 text-[10px] font-bold text-slate-300 border-b border-slate-800 uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2 text-emerald-400">#</th>
                          <th className="px-3 py-2 text-emerald-400">Business Name</th>
                          <th className="px-3 py-2">Contact</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">City</th>
                          <th className="px-3 py-2">Niche</th>
                          <th className="px-3 py-2">GMB Rating</th>
                          <th className="px-3 py-2">CCB License</th>
                          <th className="px-3 py-2">Lead Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                        {convertedLeads.slice(0, 20).map((l, idx) => (
                          <tr key={l.lead_id || idx} className="hover:bg-slate-900/50">
                            <td className="px-3 py-1.5 text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-1.5 font-semibold text-white">{l.business_name}</td>
                            <td className="px-3 py-1.5 text-slate-300">{l.contact_name || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-300">{l.phone || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-300">{l.email || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-300">{l.city || 'Portland'}, {l.state || 'OR'}</td>
                            <td className="px-3 py-1.5 text-indigo-300">{l.niche || 'Contractor'}</td>
                            <td className="px-3 py-1.5">
                              {l.gmb_rating ? (
                                <span className="text-amber-300">★ {l.gmb_rating} ({l.gmb_review_count || 0})</span>
                              ) : (
                                <span className="text-slate-500">None</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-slate-400">{l.ccb_license_number || '—'}</td>
                            <td className="px-3 py-1.5">
                              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                                {l.lead_score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATABASE COLUMN SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Full Neon PostgreSQL Database & Leads Schema</h3>
                  <p className="text-[11px] text-slate-400">
                    All 28 columns supported by the Suite. Paste into these columns in your Excel sheet for 100% automated mapping:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    id="specs-download-excel-btn"
                    href="/suite_leads_template.xlsx"
                    download="suite_leads_template.xlsx"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel Sheet (.xlsx)</span>
                  </a>
                  <a
                    id="specs-download-csv-btn"
                    href="/suite_leads_template.csv"
                    download="suite_leads_template.csv"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download CSV (.csv)</span>
                  </a>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#070b14]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-[10px] font-bold text-slate-300 border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Field / Column Name</th>
                      <th className="px-3.5 py-2.5">Required</th>
                      <th className="px-3.5 py-2.5">Database Column</th>
                      <th className="px-3.5 py-2.5">Data Type</th>
                      <th className="px-3.5 py-2.5">Description</th>
                      <th className="px-3.5 py-2.5">Example Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {SUITE_DATABASE_FIELDS.map((f) => (
                      <tr key={f.field} className="hover:bg-slate-900/40">
                        <td className="px-3.5 py-2 font-semibold text-white flex items-center gap-1.5">
                          <span>{f.label}</span>
                          {f.required && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                              REQUIRED
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] ${
                              f.required
                                ? 'text-rose-400 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {f.required ? 'Yes' : 'Optional'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-indigo-400">{f.dbColumn}</td>
                        <td className="px-3.5 py-2 text-slate-400">{f.type}</td>
                        <td className="px-3.5 py-2 font-sans text-xs text-slate-300 max-w-xs">{f.description}</td>
                        <td className="px-3.5 py-2 text-emerald-400 font-sans">{f.sample}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE FOLDER & INSTRUCTIONS */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Your Suite Google Drive Folder</h3>
                      <p className="text-xs text-indigo-300 font-mono">Lead for Suite</p>
                    </div>
                  </div>

                  <a
                    id="drive-tab-open-folder-btn"
                    href={SUITE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
                  >
                    <span>Open in Google Drive</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300 font-mono break-all">
                  {SUITE_DRIVE_FOLDER_URL}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div className="font-bold text-white text-xs">Download Template</div>
                    <p className="text-[11px] text-slate-400">
                      Download the official Suite Excel template (.xlsx) with pre-configured headers and column validations.
                    </p>
                    <a
                      href="/suite_leads_template.xlsx"
                      download="suite_leads_template.xlsx"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold hover:underline pt-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .xlsx template</span>
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div className="font-bold text-white text-xs">Paste or Upload to Drive</div>
                    <p className="text-[11px] text-slate-400">
                      Upload the template to your Google Drive folder, or paste your contractor records directly into the sheet.
                    </p>
                    <a
                      href={SUITE_DRIVE_FOLDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 font-semibold hover:underline pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Go to Drive folder</span>
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div className="font-bold text-white text-xs">One-Click Suite Import</div>
                    <p className="text-[11px] text-slate-400">
                      Use the "Import Leads" button on the Leads page to import the Google Sheet or Excel file directly into Neon database.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Need help? Use the "Copy for Excel" button to copy converted columns and paste directly into Google Sheets.</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="converter-footer-drive-btn"
              href={SUITE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Google Drive</span>
            </a>
            <button
              id="converter-footer-close-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
