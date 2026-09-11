import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  X,
  FileCode,
  FolderOpen,
} from 'lucide-react';
import { SharedDocument, ClientPortalUser, DocumentCategory } from '../../types/clientPortal';
import { logClientPortalActivity } from '../../services/clientPortalService';

interface ClientDocumentsViewProps {
  documents: SharedDocument[];
  currentUser: ClientPortalUser;
  businessName: string;
}

export const ClientDocumentsView: React.FC<ClientDocumentsViewProps> = ({
  documents,
  currentUser,
  businessName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<SharedDocument | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const categories: DocumentCategory[] = [
    'Reports',
    'Audit Documents',
    'Proposals',
    'Contracts',
    'Strategy Documents',
    'Deliverables',
    'Shared Files',
  ];

  const filteredDocs = documents.filter((doc) => {
    // Strict Client Access Protection: Only client visible
    if (doc.visibility === 'Internal Only') return false;

    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleDownload = (doc: SharedDocument) => {
    logClientPortalActivity({
      client_id: doc.client_id,
      user_id: currentUser.user_id,
      user_name: currentUser.name,
      activity_type: 'File Downloaded',
      resource_type: 'document',
      resource_id: doc.document_id,
      details: `Downloaded verified document "${doc.title}"`,
    });

    setDownloadSuccess(`Secure download initiated for "${doc.title}".`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handlePreview = (doc: SharedDocument) => {
    logClientPortalActivity({
      client_id: doc.client_id,
      user_id: currentUser.user_id,
      user_name: currentUser.name,
      activity_type: 'Document Viewed',
      resource_type: 'document',
      resource_id: doc.document_id,
      details: `Viewed document preview "${doc.title}"`,
    });
    setPreviewDoc(doc);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Verified Client Library
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client Document Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official agreements, technical audits, performance reports, and strategy blueprints for {businessName}.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {downloadSuccess}
          </span>
          <button onClick={() => setDownloadSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          All Categories ({documents.filter((d) => d.visibility !== 'Internal Only').length})
        </button>
        {categories.map((cat) => {
          const count = documents.filter(
            (d) => d.category === cat && d.visibility !== 'Internal Only'
          ).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.document_id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {doc.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {doc.file_type.toUpperCase()} • {doc.file_size}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Shared {new Date(doc.shared_at).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreview(doc)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No documents found matching this category or query.</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {previewDoc.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {previewDoc.description || 'Verified shared document ready for download.'}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Format: {previewDoc.file_type.toUpperCase()} • File Size: {previewDoc.file_size}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Shared by {previewDoc.shared_by}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
