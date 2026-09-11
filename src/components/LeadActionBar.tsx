import React, { useState } from 'react';
import {
  Phone,
  Bot,
  MessageSquare,
  Mail,
  Calendar,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ListPlus,
  Check,
  FileCheck,
  Award,
} from 'lucide-react';
import { Lead } from '../types';

interface LeadActionBarProps {
  lead: Lead;
  onOpenCall: () => void;
  onOpenAICall: () => void;
  onOpenSMS: () => void;
  onOpenEmail: () => void;
  onOpenScheduleFollowUp: () => void;
  onCompleteFollowUp?: () => void;
  onAddToCallQueue?: () => void;
  onOpenAudit?: () => void;
  onOpenProposal?: () => void;
}

export const LeadActionBar: React.FC<LeadActionBarProps> = ({
  lead,
  onOpenCall,
  onOpenAICall,
  onOpenSMS,
  onOpenEmail,
  onOpenScheduleFollowUp,
  onCompleteFollowUp,
  onAddToCallQueue,
  onOpenAudit,
  onOpenProposal,
}) => {
  const [queued, setQueued] = useState(false);

  // Construct clean Google Maps search URL
  const queryParts = [lead.business_name, lead.address, lead.city, lead.state, lead.postal_code]
    .filter(Boolean)
    .join(' ');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`;

  const hasPhone = Boolean(lead.phone && lead.phone !== 'Not Available');
  const hasEmail = Boolean(lead.email && lead.email !== 'Not Available');

  return (
    <div id="mca-lead-action-bar" className="space-y-3">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 p-3.5 rounded-2xl bg-[#0e1424] border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Call Button */}
          <button
            onClick={onOpenCall}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              hasPhone
                ? 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-300'
            }`}
            title={hasPhone ? `Call ${lead.phone}` : 'No phone recorded'}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call</span>
          </button>

          {/* Queue Call Button */}
          {hasPhone && onAddToCallQueue && (
            <button
              onClick={() => {
                onAddToCallQueue();
                setQueued(true);
                setTimeout(() => setQueued(false), 2500);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                queued
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
              }`}
              title="Add to today's outbound call queue"
            >
              {queued ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ListPlus className="w-3.5 h-3.5 text-slate-400" />}
              <span>{queued ? 'Queued' : 'Queue Call'}</span>
            </button>
          )}

          {/* AI Call Button */}
          <button
            onClick={onOpenAICall}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 transition-all shadow-sm"
            title="Initiate Sophia AI Voice outreach script &amp; call flow"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Call</span>
          </button>

          {/* SMS Button */}
          <button
            onClick={onOpenSMS}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              hasPhone
                ? 'bg-sky-600/15 hover:bg-sky-600/25 text-sky-300 border border-sky-500/30'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-300'
            }`}
            title={hasPhone ? `Send SMS to ${lead.phone}` : 'No mobile phone recorded'}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>SMS</span>
          </button>

          {/* Email Button */}
          <button
            onClick={onOpenEmail}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              hasEmail
                ? 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-300'
            }`}
            title={hasEmail ? `Email ${lead.email}` : 'No direct email recorded'}
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Email</span>
          </button>

          {/* Schedule Follow-Up Button */}
          <button
            onClick={onOpenScheduleFollowUp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600/15 hover:bg-amber-600/25 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule Follow-Up</span>
          </button>

          {/* Phase 3C: Digital Audit Button */}
          {onOpenAudit && (
            <button
              onClick={onOpenAudit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 transition-all shadow-sm"
              title="Generate or view Sophia digital audit scorecard for this lead"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Digital Audit (3C)</span>
            </button>
          )}

          {/* Phase 3C: Proposal Button */}
          {onOpenProposal && (
            <button
              onClick={onOpenProposal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-400/40 transition-all shadow-sm"
              title="Draft or edit customized client proposal & pricing"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proposal & Pricing</span>
            </button>
          )}
        </div>

        {/* External Context Actions */}
        <div className="flex items-center gap-2">
          {/* Open in Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all"
            title="Open business location and Google reviews in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {lead.website && (
            <a
              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {/* Active Upcoming Follow-Up Alert Banner (if scheduled) */}
      {lead.upcoming_follow_up && (
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-200">
                  Follow-Up Scheduled: {lead.upcoming_follow_up.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {lead.upcoming_follow_up.priority} Priority
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Target Date: <strong>{lead.upcoming_follow_up.date}</strong> at {lead.upcoming_follow_up.time || '10:00 AM'}
                {lead.upcoming_follow_up.note ? ` — "${lead.upcoming_follow_up.note}"` : ''}
              </p>
            </div>
          </div>

          {onCompleteFollowUp && (
            <button
              onClick={onCompleteFollowUp}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Completed</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
