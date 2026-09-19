import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Lead } from '../types';

interface FollowUpModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: {
    date: string;
    time?: string;
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    note?: string;
  }) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSchedule,
}) => {
  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState('Discovery Call');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onSchedule({
      date,
      time,
      type,
      priority,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Schedule Follow-Up</h3>
              <p className="text-[11px] text-slate-400">{lead.business_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Follow-Up Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:30 PM">2:30 PM</option>
                <option value="4:00 PM">4:00 PM</option>
              </select>
            </div>
          </div>

          {/* Follow-Up Type */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Follow-Up Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Discovery Call">Discovery Call</option>
              <option value="Audit Review Call">Audit Review Call</option>
              <option value="Proposal Decision Call">Proposal Decision Call</option>
              <option value="SMS Check-In">SMS Check-In</option>
              <option value="Email Check-In">Email Check-In</option>
              <option value="Contract Review">Contract Review</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setPriority(lvl)}
                  className={`py-1.5 rounded-lg font-bold text-center border transition-all ${
                    priority === lvl
                      ? lvl === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : lvl === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-700 text-slate-200 border-slate-600'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Context Note */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Objective / Context Note</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`e.g. Call ${lead.contact_name || 'owner'} to review the ${lead.recommended_service} package and answer pricing questions.`}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Save Follow-Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
