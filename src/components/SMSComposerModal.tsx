import React, { useState, useEffect } from 'react';
import {
  Lead,
  SMSType,
  PersonalizationLevel,
  SMSMessage,
} from '../types';
import {
  validateAndNormalizePhone,
  checkSMSEligibility,
  detectSMSType,
  detectSMSPersonalizationLevel,
  generateSophiaSMS,
  sendOutboundSMS,
  calculateSmsSegments,
} from '../services/messagingService';
import {
  X,
  Sparkles,
  RefreshCw,
  Send,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Phone,
  Building2,
  Flame,
  Info,
} from 'lucide-react';

interface SMSComposerModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSMSSent?: (message: SMSMessage) => void;
  initialType?: SMSType;
  prefillContent?: string;
}

export const SMSComposerModal: React.FC<SMSComposerModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSMSSent,
  initialType,
  prefillContent,
}) => {
  const [smsType, setSmsType] = useState<SMSType>(initialType || detectSMSType(lead));
  const [personalizationLevel, setPersonalizationLevel] = useState<PersonalizationLevel>(
    detectSMSPersonalizationLevel(lead)
  );
  const [content, setContent] = useState<string>(prefillContent || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phone validation & eligibility check
  const phoneVal = validateAndNormalizePhone(lead.phone);
  const eligibility = checkSMSEligibility(lead, phoneVal);

  const { characterCount, segmentsCount } = calculateSmsSegments(content);

  // Auto-generate on open if empty
  useEffect(() => {
    if (isOpen && !content && eligibility.canSend) {
      handleGenerate();
    }
  }, [isOpen, lead.lead_id]);

  if (!isOpen) return null;

  async function handleGenerate() {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const result = await generateSophiaSMS(lead, {
        smsType,
        personalizationLevel,
      });
      setContent(result.content);
    } catch (err: any) {
      console.error('Generation error', err);
      setErrorMessage('Failed to generate SMS. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConfirmSend() {
    if (!eligibility.canSend || !content.trim()) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const result = await sendOutboundSMS({
        lead,
        content: content.trim(),
        smsType,
        personalizationLevel,
        recipientPhone: phoneVal.e164 || phoneVal.display,
      });

      setShowConfirm(false);
      if (onSMSSent) {
        onSMSSent(result.message);
      }
      onClose();
    } catch (err: any) {
      console.error('Send SMS error', err);
      setErrorMessage(err.message || 'Failed to send SMS.');
      setShowConfirm(false);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header with Lead Context */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  SMS Outreach • Sophia AI
                </span>
                {lead.is_hot_target && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <Flame className="w-3 h-3" />
                    Hot Lead ({lead.lead_score})
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                {lead.business_name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                {lead.contact_name && (
                  <span>
                    Contact: <strong className="text-slate-200">{lead.contact_name}</strong>
                  </span>
                )}
                <span>
                  Location: <strong className="text-slate-200">{lead.city || 'Oregon'}, OR</strong>
                </span>
                {lead.niche && (
                  <span>
                    Trade: <strong className="text-slate-200">{lead.niche}</strong>
                  </span>
                )}
                {lead.recommended_service && (
                  <span>
                    Service: <strong className="text-sky-300">{lead.recommended_service}</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              id="close-sms-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Eligibility & Phone Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              eligibility.canSend
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : eligibility.status === 'OPTED_OUT'
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}
          >
            {eligibility.canSend ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : eligibility.status === 'OPTED_OUT' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-semibold text-slate-100">
                    {phoneVal.valid ? phoneVal.display : 'No Verified Phone'}
                  </span>
                  {phoneVal.e164 && (
                    <span className="font-mono text-[11px] text-slate-400">
                      [{phoneVal.e164}]
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    eligibility.canSend
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {eligibility.status}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{eligibility.reason}</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Controls: SMS Type & Personalization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Outreach Objective / Type
              </label>
              <select
                id="sms-type-select"
                value={smsType}
                onChange={(e) => setSmsType(e.target.value as SMSType)}
                disabled={!eligibility.canSend || isGenerating}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="Initial Outreach">Initial Outreach (First Contact)</option>
                <option value="Follow-Up">Follow-Up (Previous Note)</option>
                <option value="Audit Follow-Up">Audit Follow-Up (Visibility Breakdown)</option>
                <option value="Information Follow-Up">Information Follow-Up</option>
                <option value="Proposal Follow-Up">Proposal Follow-Up</option>
                <option value="Re-Engagement">Re-Engagement (Cold Pipeline)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Personalization Level
              </label>
              <select
                id="sms-personalization-select"
                value={personalizationLevel}
                onChange={(e) => setPersonalizationLevel(e.target.value as PersonalizationLevel)}
                disabled={!eligibility.canSend || isGenerating}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="High">High (Reputation, Gaps & Opportunity)</option>
                <option value="Medium">Medium (Business & City Context)</option>
                <option value="Low">Low (Direct Greeting)</option>
              </select>
            </div>
          </div>

          {/* Textarea & Live Segment Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Message Content</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Sophia Grounded Draft)
                </span>
              </label>

              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`font-mono font-medium ${
                    characterCount > 320
                      ? 'text-rose-400'
                      : characterCount > 160
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {characterCount} chars
                </span>
                <span className="text-slate-500">•</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">
                  {segmentsCount} {segmentsCount === 1 ? 'Segment' : 'Segments'}
                </span>
              </div>
            </div>

            <textarea
              id="sms-content-textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!eligibility.canSend || isGenerating}
              placeholder={
                eligibility.canSend
                  ? 'Generating grounded SMS from Sophia...'
                  : 'Outreach disabled due to contact eligibility status.'
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
            />

            {characterCount > 320 && (
              <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Message exceeds 320 characters. For high mobile deliverability, consider shortening.
              </p>
            )}
          </div>

          {/* Safety Notice */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong>Compliance & Safety:</strong> Sophia sends 1-on-1 human-reviewed messages. Opt-out requests (e.g. STOP) are automatically honored and logged into the compliance registry.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="sms-generate-btn"
              onClick={handleGenerate}
              disabled={!eligibility.canSend || isGenerating}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>{content ? 'Regenerate' : 'Generate with Sophia'}</span>
            </button>

            {content && (
              <button
                id="sms-copy-btn"
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sms-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              id="sms-send-trigger-btn"
              onClick={() => setShowConfirm(true)}
              disabled={!eligibility.canSend || !content.trim() || isGenerating || isSending}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send SMS</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Send className="w-4 h-4" />
                Confirm SMS Delivery
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Recipient:</span>
                  <span className="font-semibold text-slate-200">{lead.business_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phone Number:</span>
                  <span className="font-mono text-emerald-400">{phoneVal.display}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Segments:</span>
                  <span className="text-slate-200">{segmentsCount} ({characterCount} chars)</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Preview:
                </span>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
                  "{content}"
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  id="sms-confirm-cancel-btn"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Back to Edit
                </button>
                <button
                  id="sms-confirm-send-btn"
                  onClick={handleConfirmSend}
                  disabled={isSending}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSending ? 'Delivering...' : 'Send Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
