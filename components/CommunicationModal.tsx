import React, { useState, useEffect } from 'react';
import {
  Phone,
  Bot,
  MessageSquare,
  Mail,
  X,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  PhoneCall,
  Clock,
  Flame,
} from 'lucide-react';
import {
  Lead,
  CommunicationChannel,
  CommunicationStatus,
  Communication,
} from '../types';

interface CommunicationModalProps {
  lead: Lead;
  channel: CommunicationChannel;
  isOpen: boolean;
  onClose: () => void;
  onLogCommunication: (commData: {
    channel: CommunicationChannel;
    direction: 'OUTBOUND' | 'INBOUND';
    status: CommunicationStatus;
    subject?: string;
    content: string;
    metadata?: Record<string, any>;
  }) => void;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({
  lead,
  channel,
  isOpen,
  onClose,
  onLogCommunication,
}) => {
  const [copiedHook, setCopiedHook] = useState(false);
  const [callOutcome, setCallOutcome] = useState<'Connected' | 'Voicemail' | 'No Answer' | 'Gatekeeper' | 'Meeting Booked'>('Connected');
  const [callDuration, setCallDuration] = useState('2m 15s');
  const [callNotes, setCallNotes] = useState('');

  // AI Voice Call options
  const [aiVoiceTone, setAiVoiceTone] = useState<'Professional' | 'Casual Consultant' | 'Direct'>('Professional');
  const [aiSimulationState, setAiSimulationState] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle');

  // SMS
  const [smsText, setSmsText] = useState('');

  // Email
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Initialize tailored outreach scripts on lead or channel changes
  useEffect(() => {
    if (!lead) return;

    // SMS Default
    const defaultSms = `Hi ${lead.contact_name || 'there'}, Sophia with Marketing Charm Agency. Noticed ${lead.business_name}'s high reputation in ${lead.city}, but your mobile website is currently ${lead.website_status.toLowerCase()}. We prepared a 2-min breakdown showing how to capture 10+ extra calls/mo. Mind if I text the link?`;
    setSmsText(defaultSms);

    // Email Defaults
    const defaultSubject = `Quick growth observation regarding ${lead.business_name} in ${lead.city}`;
    const defaultEmail = `Hi ${lead.contact_name || 'Team'},\n\nSophia here from Marketing Charm Agency in Oregon.\n\nI was reviewing local service leaders in ${lead.city} and was impressed by ${lead.business_name}'s track record (${lead.gmb_rating || '4.8'} stars on Google).\n\nHowever, our digital audit highlighted a key growth bottleneck: ${lead.gaps.slice(0, 2).join(' and ') || 'mobile conversion speed'}.\n\nWe specialize in ${lead.recommended_service}, generating an estimated ${lead.estimated_revenue_lift || '$4,000–$8,000/mo'} in additional booked jobs for contractors like you.\n\nWould you be open to a 5-minute overview this Wednesday or Thursday?\n\nBest regards,\nSophia\nAI Sales Rep | Marketing Charm Agency`;
    setEmailSubject(defaultSubject);
    setEmailBody(defaultEmail);

    setCallNotes('');
    setAiSimulationState('idle');
  }, [lead, channel, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  // Submit Call Log
  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    onLogCommunication({
      channel: 'CALL',
      direction: 'OUTBOUND',
      status: callOutcome === 'Connected' || callOutcome === 'Meeting Booked' ? 'COMPLETED' : 'DELIVERED',
      subject: `Call Outcome: ${callOutcome}`,
      content: `Call with ${lead.contact_name || lead.business_name} (${lead.phone || 'N/A'}). Outcome: ${callOutcome}. Duration: ${callDuration}. Notes: ${callNotes || 'No notes added.'}`,
      metadata: {
        outcome: callOutcome,
        duration: callDuration,
        phone: lead.phone,
        lead_id: lead.lead_id,
      },
    });
    onClose();
  };

  // Submit AI Call
  const handleSimulateAiCall = () => {
    setAiSimulationState('calling');
    setTimeout(() => {
      setAiSimulationState('connected');
      setTimeout(() => {
        setAiSimulationState('completed');
        onLogCommunication({
          channel: 'AI_CALL',
          direction: 'OUTBOUND',
          status: 'COMPLETED',
          subject: `Sophia AI Voice Call Dispatched`,
          content: `Sophia conducted an AI voice discovery call to ${lead.phone || 'Direct line'}. Pitch: "${lead.opportunity_angle || 'Local contractor growth'}" Tone: ${aiVoiceTone}. Client response qualified for ${lead.recommended_service}.`,
          metadata: {
            tone: aiVoiceTone,
            target_phone: lead.phone,
            service_pitched: lead.recommended_service,
            estimated_retainer: lead.estimated_retainer,
          },
        });
      }, 1500);
    }, 1200);
  };

  // Submit SMS
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    onLogCommunication({
      channel: 'SMS',
      direction: 'OUTBOUND',
      status: 'SENT',
      content: smsText,
      metadata: {
        phone: lead.phone,
        char_count: smsText.length,
      },
    });
    onClose();
  };

  // Submit Email
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    onLogCommunication({
      channel: 'EMAIL',
      direction: 'OUTBOUND',
      status: 'SENT',
      subject: emailSubject,
      content: emailBody,
      metadata: {
        recipient: lead.email,
        business: lead.business_name,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0c1220]">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                channel === 'CALL'
                  ? 'bg-emerald-600'
                  : channel === 'AI_CALL'
                  ? 'bg-purple-600'
                  : channel === 'SMS'
                  ? 'bg-sky-600'
                  : 'bg-blue-600'
              }`}
            >
              {channel === 'CALL' && <Phone className="w-4 h-4" />}
              {channel === 'AI_CALL' && <Bot className="w-4 h-4" />}
              {channel === 'SMS' && <MessageSquare className="w-4 h-4" />}
              {channel === 'EMAIL' && <Mail className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {channel === 'CALL' && 'Direct Phone Call & Dialer Prep'}
                {channel === 'AI_CALL' && 'Sophia AI Voice Outreach'}
                {channel === 'SMS' && 'Direct SMS Dispatch'}
                {channel === 'EMAIL' && 'Tailored Email Outreach'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lead.business_name} • {lead.city}, {lead.state}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* ================= CHANNEL: CALL ================= */}
          {channel === 'CALL' && (
            <form onSubmit={handleSaveCall} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Phone Number:</span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-base font-mono font-bold text-emerald-400 hover:underline"
                  >
                    {lead.phone || 'Not recorded'}
                  </a>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Decision Maker:</span>
                  <span className="text-slate-200 font-semibold">{lead.contact_name || 'Principal'}</span>
                </div>
              </div>

              {/* 15-second opening hook */}
              <div className="p-4 rounded-xl bg-indigo-950/25 border border-indigo-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Sophia's Recommended 15-Second Hook
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `Hi ${lead.contact_name || 'there'}, Sophia with Marketing Charm Agency. Calling about ${lead.business_name}'s local visibility in ${lead.city}.`
                      )
                    }
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedHook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHook ? 'Copied' : 'Copy Hook'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  "{lead.ai_enrichment?.suggested_pitch ||
                    `Hi ${lead.contact_name || 'there'}, Sophia from Marketing Charm Agency. I noticed ${lead.business_name} has outstanding ratings in ${lead.city}, but your mobile conversion setup is currently missing high-intent emergency job calls. We have a brief audit ready for you.`}"
                </p>
              </div>

              {/* Outcome & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Call Outcome *</label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Connected">Connected &amp; Spoke</option>
                    <option value="Meeting Booked">Meeting / Follow-Up Booked</option>
                    <option value="Voicemail">Left Voicemail</option>
                    <option value="Gatekeeper">Spoke to Gatekeeper / Reception</option>
                    <option value="No Answer">No Answer</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Duration</label>
                  <input
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    placeholder="e.g. 3m 45s"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                  </input>
                </div>
              </div>

              {/* Call Notes */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Call Notes &amp; Next Steps</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Record client questions, objections raised, agreed follow-up dates..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Log Call Record</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= CHANNEL: AI_CALL ================= */}
          {channel === 'AI_CALL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Sophia Autonomous Voice Agent Context</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Target: {lead.phone || 'Phone Required'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sophia dials using contextual knowledge of {lead.business_name}'s GMB rating ({lead.gmb_rating || '4.9'}), identified gap ({lead.gaps[0] || 'website performance'}), and recommended service ({lead.recommended_service}).
                </p>
              </div>

              {/* Voice Persona Tuning */}
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Sophia Conversation Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Professional', 'Casual Consultant', 'Direct'] as const).map((tone) => (
                    <button
                      type="button"
                      key={tone}
                      onClick={() => setAiVoiceTone(tone)}
                      className={`py-2 rounded-lg font-bold text-center border transition-all text-xs ${
                        aiVoiceTone === tone
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Breakdown */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/70">
                <div className="font-bold text-slate-200">Sophia's Conversational Arc:</div>
                <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                  <li><strong>Introduction:</strong> Friendly agency intro acknowledging {lead.city} local reputation.</li>
                  <li><strong>The Gap:</strong> Highlights {lead.gaps.slice(0, 2).join(' & ') || 'digital conversion friction'}.</li>
                  <li><strong>The Solution:</strong> Introduces {lead.recommended_service} with projected revenue lift ({lead.estimated_revenue_lift || '$4k–$8k/mo'}).</li>
                  <li><strong>Close:</strong> Books a brief discovery review with human agency account lead.</li>
                </ul>
              </div>

              {/* Call Simulation Status */}
              {aiSimulationState !== 'idle' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                    <span className="text-xs font-bold text-purple-300 capitalize font-mono">
                      Status: {aiSimulationState === 'calling' ? 'Initiating Dial...' : aiSimulationState === 'connected' ? 'Connected (Sophia Speaking)...' : 'Call Completed & Logged!'}
                    </span>
                  </div>
                  {aiSimulationState === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={aiSimulationState === 'calling' || aiSimulationState === 'connected'}
                  onClick={handleSimulateAiCall}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Bot className="w-4 h-4" />
                  <span>
                    {aiSimulationState === 'completed' ? 'Re-run Sophia AI Call' : 'Launch Sophia AI Voice Call'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ================= CHANNEL: SMS ================= */}
          {channel === 'SMS' && (
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Recipient Mobile</label>
                <input
                  readOnly
                  value={lead.phone || 'No phone recorded'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-400 font-semibold">SMS Message Body</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {smsText.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] text-slate-400">
                💡 Dispatches personalized SMS outreach and automatically records entry in the Activity Timeline and Communication history.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send &amp; Log SMS</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= CHANNEL: EMAIL ================= */}
          {channel === 'EMAIL' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Recipient Email</label>
                <input
                  required
                  value={lead.email || ''}
                  onChange={(e) => (lead.email = e.target.value)}
                  placeholder="contact@business.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Subject</label>
                <input
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Email Body</label>
                <textarea
                  rows={8}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send &amp; Log Email</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
