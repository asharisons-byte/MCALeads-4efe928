import React, { useState } from 'react';
import {
  X,
  Send,
  Plus,
  Mail,
  MessageSquare,
  Sparkles,
  Layers,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { Lead } from '../../types';
import { addCampaign } from '../../services/commandCenterService';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onCampaignCreated: () => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  leads,
  onCampaignCreated,
}) => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'Multi-Channel'>('Multi-Channel');
  const [niche, setNiche] = useState('Plumbing');
  const [location, setLocation] = useState('Portland Metro');

  if (!isOpen) return null;

  // Find candidate leads matching niche
  const candidateLeads = leads.filter((l) =>
    niche === 'All' ? true : l.niche?.toLowerCase().includes(niche.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const enrolledIds = candidateLeads.slice(0, 15).map((l) => l.lead_id);
    const estPipeline = enrolledIds.length * 2400;

    addCampaign({
      name: name.trim(),
      channel,
      status: 'Active',
      target_niche: niche,
      target_location: location,
      enrolled_lead_ids: enrolledIds,
      replies_count: 0,
      positive_responses_count: 0,
      meetings_count: 0,
      conversions_count: 0,
      estimated_pipeline_value: estPipeline,
      won_value: 0,
    });

    onCampaignCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Launch Contractor Outreach Campaign
              </h3>
              <p className="text-xs text-slate-500">
                Create an automated multi-touch sequence for verified Oregon CCB targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Campaign Sequence Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Portland Metro Plumbers GMB & SEO Sprint"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Channel Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Outreach Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Multi-Channel', 'Email', 'SMS'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    channel === ch
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Niche & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Target Niche
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Roofing">Roofing</option>
                <option value="HVAC">HVAC</option>
                <option value="Electrical">Electrical</option>
                <option value="Contractors">General Contractors</option>
                <option value="Landscaping">Landscaping</option>
                <option value="All">All CCB Niches</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Target Territory
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="Portland Metro">Portland Metro</option>
                <option value="Willamette Valley">Willamette Valley (Salem/Eugene)</option>
                <option value="Central Oregon">Central Oregon (Bend/Redmond)</option>
                <option value="All Oregon">Statewide (All Oregon)</option>
              </select>
            </div>
          </div>

          {/* Enrolled Preview */}
          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-medium">
              Initial Target Cohort: <strong>{Math.min(15, candidateLeads.length)} contractors</strong>
            </span>
            <span className="text-indigo-700 font-bold">
              ~${(Math.min(15, candidateLeads.length) * 2400).toLocaleString()} Potential
            </span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Launch Sequence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
