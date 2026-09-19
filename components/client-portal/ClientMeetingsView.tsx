import React, { useState } from 'react';
import {
  Calendar,
  Video,
  Clock,
  Users,
  CheckSquare,
  FileText,
  ExternalLink,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { ClientMeeting, ClientPortalUser } from '../../types/clientPortal';

interface ClientMeetingsViewProps {
  meetings: ClientMeeting[];
  currentUser: ClientPortalUser;
  businessName: string;
}

export const ClientMeetingsView: React.FC<ClientMeetingsViewProps> = ({
  meetings,
  currentUser,
  businessName,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const upcomingMeetings = meetings.filter((m) => m.status === 'Upcoming');
  const pastMeetings = meetings.filter((m) => m.status !== 'Upcoming');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Meeting & Strategy Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review upcoming strategy sessions, action items, and past call notes for {businessName}.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Strategy Session</span>
        </button>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Upcoming Strategy Calls
        </h3>

        {upcomingMeetings.map((meet) => (
          <div
            key={meet.meeting_id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {meet.meeting_type}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {meet.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(meet.scheduled_for).toLocaleDateString()} at{' '}
                    {new Date(meet.scheduled_for).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>Duration: {meet.duration_minutes} min</span>
                  <span>•</span>
                  <span>Host: {meet.host_name}</span>
                </div>
              </div>

              {meet.meeting_link && (
                <a
                  href={meet.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Google Meet</span>
                </a>
              )}
            </div>

            {meet.meeting_notes && (
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Session Agenda:
                </span>
                {meet.meeting_notes}
              </div>
            )}

            {meet.action_items && meet.action_items.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Action Items Prior to Session:
                </span>
                <div className="space-y-1.5">
                  {meet.action_items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {upcomingMeetings.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No upcoming meetings currently scheduled. Use the button above to request a strategy call.
          </div>
        )}
      </div>

      {/* Past Meetings Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Past Meetings & Scoping Sessions
        </h3>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {pastMeetings.map((meet) => (
            <div key={meet.meeting_id} className="p-6 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    {meet.meeting_type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {meet.title}
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(meet.scheduled_for).toLocaleDateString()}
                </span>
              </div>

              {meet.meeting_notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {meet.meeting_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Strategy Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Strategy Session
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Book directly with your Marketing Charm Agency team
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Google Calendar Direct Booking</span>
              </div>
              <p className="leading-relaxed">
                Connect directly to your account director's real-time calendar to select a 30-minute growth review or technical walk-through.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowScheduleModal(false)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Open Agency Scheduling Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[11px] text-center text-slate-400">
                Prefer a quick message? You can also message Sophia in the Communication Center.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
