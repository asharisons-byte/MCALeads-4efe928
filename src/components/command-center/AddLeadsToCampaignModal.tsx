import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { Campaign } from '../../types';
import { getCampaigns, addLeadsToCampaign } from '../../services/commandCenterService';

interface AddLeadsToCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadIds: string[];
  onSuccess: () => void;
}

export const AddLeadsToCampaignModal: React.FC<AddLeadsToCampaignModalProps> = ({
  isOpen,
  onClose,
  leadIds,
  onSuccess,
}) => {
  const campaigns = getCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return;

    addLeadsToCampaign(selectedCampaignId, leadIds);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mca-hover/50 backdrop-blur-xs p-4">
      <div className="bg-mca-card rounded-xl max-w-sm w-full p-6 shadow-xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Add to Campaign
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Select Campaign</label>
            <select
              required
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 text-xs bg-mca-card"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.enrolled_lead_ids.length} leads)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-200 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add {leadIds.length} Leads
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
