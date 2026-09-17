import React, { useState, useEffect } from 'react';
import { Lead, SMSMessage, SophiaReplyAnalysis } from '../types';
import {
  getSMSMessages,
  receiveInboundSMS,
  sendOutboundSMS,
  checkSMSEligibility,
  validateAndNormalizePhone,
  calculateSmsSegments,
} from '../services/messagingService';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCheck,
  Check,
  Building2,
  Phone,
  ChevronDown,
  RefreshCw,
  Edit3,
  Bot,
  User,
  FlaskConical,
} from 'lucide-react';

interface SMSConversationViewProps {
  lead: Lead;
  onOpenComposer: (prefillContent?: string) => void;
  onMessageChange?: () => void;
}

export const SMSConversationView: React.FC<SMSConversationViewProps> = ({
  lead,
  onOpenComposer,
  onMessageChange,
}) => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      setMessages(await getSMSMessages(lead.lead_id));
    }
    fetchMessages();
  }, [lead.lead_id]);
  const [replyInput, setReplyInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulateDrawer, setShowSimulateDrawer] = useState(false);
  const [simText, setSimText] = useState('');

  const phoneVal = validateAndNormalizePhone(lead.phone);
  const eligibility = checkSMSEligibility(lead, phoneVal);

  async function refresh() {
    setMessages(await getSMSMessages(lead.lead_id));
    if (onMessageChange) onMessageChange();
  }

  async function handleSendInline() {
    if (!replyInput.trim() || !eligibility.canSend) return;

    setIsSending(true);
    try {
      await sendOutboundSMS({
        lead,
        content: replyInput.trim(),
        smsType: 'Follow-Up',
        personalizationLevel: 'High',
      });
      setReplyInput('');
      refresh();
    } catch (e: any) {
      console.error('Inline SMS send error', e);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendSuggested(suggestedText: string) {
    if (!eligibility.canSend) return;
    setIsSending(true);
    try {
      await sendOutboundSMS({
        lead,
        content: suggestedText,
        smsType: 'Follow-Up',
        personalizationLevel: 'High',
      });
      refresh();
    } catch (e: any) {
      console.error('Failed to send suggested reply', e);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSimulateReply(customContent?: string) {
    const textToSimulate = customContent || simText;
    if (!textToSimulate.trim()) return;

    setIsSimulating(true);
    try {
      await receiveInboundSMS({
        leadId: lead.lead_id,
        content: textToSimulate.trim(),
        fromNumber: phoneVal.e164 || phoneVal.display,
      });
      setSimText('');
      setShowSimulateDrawer(false);
      refresh();
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setIsSimulating(false);
    }
  }

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'Interested':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Pricing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Meeting Request':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Opt-Out':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Not Interested':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      case 'Question':
      case 'Information Request':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[560px]">
      {/* Thread Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white truncate">
                {lead.business_name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  eligibility.canSend
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {eligibility.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>{phoneVal.valid ? phoneVal.display : 'No verified phone'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Simulate Reply Trigger */}
          <button
            id="toggle-simulate-reply-btn"
            onClick={() => setShowSimulateDrawer(!showSimulateDrawer)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-slate-700/60"
            title="Simulate an inbound reply from the prospect for testing"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Simulate Reply</span>
          </button>

          <button
            id="open-sms-composer-from-thread"
            onClick={() => onOpenComposer()}
            disabled={!eligibility.canSend}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compose SMS</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Drawer */}
      {showSimulateDrawer && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 animate-fadeIn space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              Simulate Inbound SMS from {lead.business_name}:
            </span>
            <span className="text-[10px] text-slate-500">
              Tests intent classification & opt-out rules
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSimulateReply('Sure, what did you guys find? Send it over.')}
              disabled={isSimulating}
              className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] transition-colors"
            >
              "Sure, send it over" (Interested)
            </button>
            <button
              onClick={() => handleSimulateReply('How much does this typically cost per month?')}
              disabled={isSimulating}
              className="px-2 py-1 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[11px] transition-colors"
            >
              "How much does this cost?" (Pricing)
            </button>
            <button
              onClick={() => handleSimulateReply('Can you call me tomorrow morning at 10am?')}
              disabled={isSimulating}
              className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[11px] transition-colors"
            >
              "Call me tomorrow" (Meeting)
            </button>
            <button
              onClick={() => handleSimulateReply('STOP')}
              disabled={isSimulating}
              className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors"
            >
              "STOP" (Opt-Out)
            </button>
            <button
              onClick={() => handleSimulateReply('Not interested at this time, thank you.')}
              disabled={isSimulating}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              "Not interested" (Decline)
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Or type a custom prospect reply..."
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSimulateReply();
              }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleSimulateReply()}
              disabled={!simText.trim() || isSimulating}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Receive'}
            </button>
          </div>
        </div>
      )}

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No SMS conversation yet</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Send an AI-crafted outreach message from Sophia or prepare a follow-up.
            </p>
            {eligibility.canSend ? (
              <button
                onClick={() => onOpenComposer()}
                className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compose First SMS with Sophia</span>
              </button>
            ) : (
              <span className="text-xs text-rose-400 font-medium">
                {eligibility.reason}
              </span>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.direction === 'OUTBOUND';
            const analysis = msg.reply_analysis;

            return (
              <div
                key={msg.sms_id}
                className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
              >
                {/* Sender & Timestamp label */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  {isOutbound ? (
                    <>
                      <Bot className="w-3 h-3 text-sky-400" />
                      <span className="font-semibold text-slate-300">Sophia (MCA)</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 text-emerald-400" />
                      <span className="font-semibold text-slate-300">
                        {lead.contact_name || lead.business_name}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                    isOutbound
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : msg.opt_out_status
                      ? 'bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-tl-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  <div className="flex items-center justify-end gap-2 mt-1.5 pt-1 text-[10px] opacity-75">
                    {msg.segments_count && (
                      <span>
                        {msg.segments_count} {msg.segments_count === 1 ? 'segment' : 'segments'}
                      </span>
                    )}
                    {isOutbound && (
                      <span className="flex items-center gap-0.5">
                        {msg.status === 'DELIVERED' ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-sky-200" />
                            <span>Delivered</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-sky-200" />
                            <span>Sent</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sophia Reply Analysis Card (for Inbound messages) */}
                {!isOutbound && analysis && (
                  <div className="mt-2.5 max-w-[90%] bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-200">
                          Sophia Reply Analysis
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getIntentColor(
                          analysis.intent
                        )}`}
                      >
                        Intent: {analysis.intent}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 italic">
                      "{analysis.summary}"
                    </p>

                    {analysis.recommended_next_action && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <strong className="text-slate-200">Next Step: </strong>
                        {analysis.recommended_next_action}
                      </div>
                    )}

                    {analysis.suggested_response && !msg.opt_out_status && eligibility.canSend && (
                      <div className="pt-1">
                        <div className="text-[11px] font-semibold text-sky-300 mb-1">
                          Suggested Reply from Sophia:
                        </div>
                        <div className="text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-200">
                          {analysis.suggested_response}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleSendSuggested(analysis.suggested_response)}
                            disabled={isSending}
                            className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>Quick Send</span>
                          </button>
                          <button
                            onClick={() => onOpenComposer(analysis.suggested_response)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit in Composer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Composer Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        {eligibility.canSend ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type an SMS response..."
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendInline();
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              onClick={handleSendInline}
              disabled={!replyInput.trim() || isSending}
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="p-2 bg-rose-950/30 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{eligibility.reason}</span>
          </div>
        )}
      </div>
    </div>
  );
};
