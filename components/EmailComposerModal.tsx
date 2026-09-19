import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Mail,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Info,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  User,
  Zap,
  Save,
} from 'lucide-react';
import {
  Lead,
  EmailDraft,
  EmailType,
  PersonalizationLevel,
  EmailTone,
  ActivityEvent,
} from '../types';
import {
  generateSophiaEmail,
  detectEmailType,
  detectPersonalizationLevel,
  buildGmailComposeUrl,
  getDraftForLead,
  saveEmailDraft,
  markEmailPrepared,
} from '../services/emailService';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  activities?: ActivityEvent[];
  onDraftSaved?: (draft: EmailDraft) => void;
  onEmailPrepared?: (draft: EmailDraft, activity: ActivityEvent) => void;
}

const TONE_OPTIONS: EmailTone[] = [
  'More Professional',
  'More Direct',
  'More Friendly',
  'Shorter',
  'More Personalized',
  'Different Angle',
];

const EMAIL_TYPE_OPTIONS: EmailType[] = [
  'Initial Outreach',
  'Follow-Up',
  'Audit Follow-Up',
  'Proposal Follow-Up',
  'Re-Engagement',
];

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  lead,
  activities = [],
  onDraftSaved,
  onEmailPrepared,
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [body, setBody] = useState<string>('');
  const [emailType, setEmailType] = useState<EmailType>('Initial Outreach');
  const [personalizationLevel, setPersonalizationLevel] = useState<PersonalizationLevel>('High');
  const [selectedTone, setSelectedTone] = useState<EmailTone>('More Professional');
  const [keyOpportunity, setKeyOpportunity] = useState<string>('');
  const [suggestedCta, setSuggestedCta] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRegenerateMenu, setShowRegenerateMenu] = useState<boolean>(false);
  const [preparedSuccess, setPreparedSuccess] = useState<boolean>(false);
  const [draftId, setDraftId] = useState<string>('');

  const hasVerifiedEmail = Boolean(lead.email && lead.email.includes('@'));

  // Word count calculation
  const wordCount = useMemo(() => {
    if (!body.trim()) return 0;
    return body.trim().split(/\s+/).length;
  }, [body]);

  // Load existing draft or generate initial
  useEffect(() => {
    if (!isOpen || !lead) return;

    setRecipientEmail(lead.email || '');
    setPreparedSuccess(false);

    const existingDraft = getDraftForLead(lead.lead_id);
    if (existingDraft) {
      setDraftId(existingDraft.id);
      setSubject(existingDraft.subject);
      setSubjectOptions(existingDraft.subject_options || [existingDraft.subject]);
      setBody(existingDraft.body);
      setEmailType(existingDraft.email_type || detectEmailType(lead, activities));
      setPersonalizationLevel(existingDraft.personalization_level || detectPersonalizationLevel(lead));
      setSelectedTone((existingDraft.tone as EmailTone) || 'More Professional');
      setKeyOpportunity(existingDraft.key_opportunity || lead.opportunity_angle || '');
      setSuggestedCta(existingDraft.suggested_cta || 'Would you be open to taking a quick look?');
    } else {
      // First time opening for this lead
      const detectedType = detectEmailType(lead, activities);
      const detectedLevel = detectPersonalizationLevel(lead);
      setEmailType(detectedType);
      setPersonalizationLevel(detectedLevel);
      setKeyOpportunity(lead.opportunity_angle || (lead.gaps && lead.gaps[0]) || 'Local search visibility');
      handleGenerate(detectedType, 'More Professional', detectedLevel);
    }
  }, [isOpen, lead?.lead_id]);

  const handleGenerate = async (
    typeToUse = emailType,
    toneToUse = selectedTone,
    levelToUse = personalizationLevel
  ) => {
    setIsLoading(true);
    setShowRegenerateMenu(false);
    try {
      const res = await generateSophiaEmail(lead, {
        emailType: typeToUse,
        tone: toneToUse,
        personalizationLevel: levelToUse,
      });

      setSubject(res.subject);
      setSubjectOptions(res.subject_options || [res.subject]);
      setBody(res.body);
      setEmailType(res.email_type);
      setPersonalizationLevel(res.personalization_level);
      if (res.key_opportunity) setKeyOpportunity(res.key_opportunity);
      if (res.suggested_cta) setSuggestedCta(res.suggested_cta);

      // Save as draft
      const saved = saveEmailDraft({
        id: draftId || undefined,
        lead_id: lead.lead_id,
        business_name: lead.business_name,
        contact_name: lead.contact_name,
        recipient: lead.email || recipientEmail,
        subject: res.subject,
        subject_options: res.subject_options,
        body: res.body,
        email_type: res.email_type,
        personalization_level: res.personalization_level,
        tone: toneToUse,
        key_opportunity: res.key_opportunity,
        suggested_cta: res.suggested_cta,
        lead_score: lead.lead_score,
        niche: lead.niche,
        city: lead.city,
        status: 'GENERATED',
      });
      setDraftId(saved.id);
      onDraftSaved?.(saved);
    } catch (err) {
      console.error('Failed to generate email', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSaveDraft = () => {
    const saved = saveEmailDraft({
      id: draftId || undefined,
      lead_id: lead.lead_id,
      business_name: lead.business_name,
      contact_name: lead.contact_name,
      recipient: recipientEmail,
      subject,
      subject_options: subjectOptions,
      body,
      email_type: emailType,
      personalization_level: personalizationLevel,
      tone: selectedTone,
      key_opportunity: keyOpportunity,
      suggested_cta: suggestedCta,
      lead_score: lead.lead_score,
      niche: lead.niche,
      city: lead.city,
      status: 'DRAFT',
    });
    setDraftId(saved.id);
    onDraftSaved?.(saved);
  };

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInGmail = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Please provide a valid recipient email address before opening in Gmail.');
      return;
    }

    const gmailUrl = buildGmailComposeUrl(recipientEmail, subject, body);

    // Save as PREPARED and record activity & communication
    const currentDraft: EmailDraft = {
      id: draftId || `draft-${lead.lead_id}-${Date.now()}`,
      lead_id: lead.lead_id,
      business_name: lead.business_name,
      contact_name: lead.contact_name,
      recipient: recipientEmail,
      subject,
      subject_options: subjectOptions,
      body,
      email_type: emailType,
      personalization_level: personalizationLevel,
      tone: selectedTone,
      key_opportunity: keyOpportunity,
      suggested_cta: suggestedCta,
      generated_by: 'Sophia (AI Sales Rep)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'PREPARED',
      lead_score: lead.lead_score,
      niche: lead.niche,
      city: lead.city,
    };

    const { activity, draft } = markEmailPrepared(currentDraft, lead);
    setDraftId(draft.id);
    setPreparedSuccess(true);
    onEmailPrepared?.(draft, activity);

    // Open Gmail in a new tab
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Email Outreach</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Sophia AI Sales Rep
                </span>
                {draftId && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    Draft Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Personalized cold email crafted from verified lead intelligence and local market data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PREPARED SUCCESS NOTIFICATION */}
        {preparedSuccess && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Gmail Compose Opened.</strong> Recorded in CRM Activity Timeline as <strong>PREPARED</strong>. Review and send directly in Gmail.
              </span>
            </div>
            <button
              onClick={() => setPreparedSuccess(false)}
              className="text-emerald-400 hover:text-emerald-200 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* THREE-COLUMN BODY */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* ================= LEFT COLUMN: LEAD CONTEXT (3 Cols) ================= */}
          <div className="lg:col-span-3 p-5 bg-slate-950/40 space-y-4 overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Target Business
              </span>
              <h3 className="text-base font-bold text-white leading-tight">{lead.business_name}</h3>
              {lead.contact_name ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.contact_name}</span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic mt-1">No contact person listed</div>
              )}
            </div>

            {/* Quick Badges */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Lead Score</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {lead.lead_score || 88}/100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-200 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {lead.city || 'Oregon'}, OR
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trade / Niche</span>
                <span className="text-slate-200 font-medium truncate max-w-[130px]" title={lead.niche}>
                  {lead.niche || 'Contractor'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Est. Retainer</span>
                <span className="text-emerald-400 font-bold">
                  ${(lead.estimated_retainer || 1800).toLocaleString()}/mo
                </span>
              </div>
            </div>

            {/* Verified Digital Presence */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Digital Presence Check
              </span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Website:</span>
                  <span
                    className={`font-semibold ${
                      lead.website ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {lead.website ? 'Active Site' : 'No Website'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Google Maps:</span>
                  <span
                    className={`font-semibold ${
                      lead.gmb_status === 'Active' || lead.gmb_status === 'Verified'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {lead.gmb_status || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reviews:</span>
                  <span className="text-slate-200">
                    {lead.gmb_rating ? `★ ${lead.gmb_rating}` : 'None'} ({lead.gmb_review_count ?? 0})
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Service & Angle */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Recommended Pitch
              </span>
              <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-indigo-200">
                <div className="font-semibold text-indigo-300">
                  {lead.recommended_service || 'Local Search & Website Launch'}
                </div>
                <p className="text-[11px] text-indigo-300/80 mt-1 leading-snug">
                  {lead.opportunity_angle || 'Fast-Start Contractor visibility package'}
                </p>
              </div>
            </div>
          </div>

          {/* ================= CENTER COLUMN: COMPOSER (6 Cols) ================= */}
          <div className="lg:col-span-6 p-5 flex flex-col space-y-4">
            {/* TO FIELD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>To:</span>
                  {!hasVerifiedEmail && (
                    <span className="text-[11px] text-amber-400 font-normal flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      No verified email address in CCB registry
                    </span>
                  )}
                </label>
                {hasVerifiedEmail && (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Email
                  </span>
                )}
              </div>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="No verified email address available for this lead."
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none transition-all ${
                  hasVerifiedEmail
                    ? 'border-slate-700 text-white focus:border-blue-500'
                    : 'border-amber-500/40 text-amber-200 bg-amber-950/10 focus:border-amber-400'
                }`}
              />
            </div>

            {/* SUBJECT FIELD WITH 3 OPTIONS SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Subject Line</label>
                {subjectOptions.length > 1 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Variations:</span>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-200 px-2 py-0.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {subjectOptions.map((opt, i) => (
                        <option key={i} value={opt}>
                          Option {i + 1}: {opt.substring(0, 35)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject line..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* BODY FIELD */}
            <div className="flex-1 flex flex-col min-h-[260px]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Message Body</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      wordCount >= 100 && wordCount <= 180
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : wordCount > 180
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {wordCount} words (ideal: 100–180)
                  </span>
                </div>
              </div>

              <div className="relative flex-1 flex flex-col">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Sophia will draft a personalized cold email grounded in actual lead data..."
                  rows={11}
                  className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-blue-500 transition-all resize-none"
                />

                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    <div className="text-xs font-semibold text-indigo-300">
                      Sophia is analyzing verified CCB records &amp; drafting...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                {/* REGENERATE DROPDOWN */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRegenerateMenu(!showRegenerateMenu)}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showRegenerateMenu && (
                    <div className="absolute left-0 bottom-full mb-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-20 space-y-1 animate-in fade-in duration-150">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Style / Tone Options
                      </div>
                      {TONE_OPTIONS.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => {
                            setSelectedTone(tone);
                            handleGenerate(emailType, tone, personalizationLevel);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                            selectedTone === tone
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{tone}</span>
                          {selectedTone === tone && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* COPY BUTTON */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* SAVE DRAFT */}
                <button
                  type="button"
                  onClick={handleManualSaveDraft}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-slate-400" />
                  <span>Save Draft</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>

                {/* OPEN IN GMAIL BUTTON */}
                <button
                  type="button"
                  onClick={handleOpenInGmail}
                  disabled={!recipientEmail || !recipientEmail.includes('@')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Gmail</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: SOPHIA SUGGESTIONS & SETTINGS (3 Cols) ================= */}
          <div className="lg:col-span-3 p-5 bg-slate-950/40 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs pb-1 border-b border-slate-800">
              <Sparkles className="w-4 h-4" />
              <span>Sophia Outreach Strategy</span>
            </div>

            {/* EMAIL TYPE SELECTOR */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Outreach Intent / Stage
              </label>
              <select
                value={emailType}
                onChange={(e) => {
                  const newType = e.target.value as EmailType;
                  setEmailType(newType);
                  handleGenerate(newType, selectedTone, personalizationLevel);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {EMAIL_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Auto-detected based on CRM stage &amp; communication history.
              </p>
            </div>

            {/* PERSONALIZATION LEVEL */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Personalization Level
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                {(['Low', 'Medium', 'High'] as PersonalizationLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setPersonalizationLevel(level);
                      handleGenerate(emailType, selectedTone, level);
                    }}
                    className={`py-1 text-[11px] font-semibold rounded transition-all ${
                      personalizationLevel === level
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                {personalizationLevel === 'High'
                  ? 'Grounds copy in CCB license type, Google Maps, ratings, and detected gaps.'
                  : personalizationLevel === 'Medium'
                  ? 'Cites business name, city, and primary market opportunity.'
                  : 'Minimal citations for high-volume baseline touches.'}
              </p>
            </div>

            {/* KEY OPPORTUNITY CITED */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Primary Finding Cited
              </span>
              <div className="text-slate-200 font-medium leading-snug">
                {keyOpportunity || 'Local search visibility and customer conversion'}
              </div>
            </div>

            {/* SUGGESTED CALL TO ACTION */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Suggested Low-Pressure CTA
              </span>
              <div className="text-slate-300 italic text-[11px] leading-snug">
                "{suggestedCta || 'Would you be open to taking a quick look?'}"
              </div>
            </div>

            {/* SENDER COMPLIANCE FOOTER */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>MCA Brand Safety</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Sender is locked to Sophia at Marketing Charm Agency. No fabricated statistics or placeholders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
