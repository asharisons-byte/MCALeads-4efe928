import React from 'react';
import {
  Send,
  Mail,
  MessageSquare,
  Phone,
  Radio,
  Plus,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
} from 'lucide-react';
import {
  ChannelPerformanceMetric,
} from '../../services/commandCenterService';
import { Campaign } from '../../types';

interface CrossChannelAndCampaignSectionProps {
  channelMetrics: ChannelPerformanceMetric[];
  campaigns: Campaign[];
  onAddNewCampaign: () => void;
  onFilterCampaign?: (campaign: Campaign) => void;
}

export const CrossChannelAndCampaignSection: React.FC<CrossChannelAndCampaignSectionProps> = ({
  channelMetrics,
  campaigns,
  onAddNewCampaign,
  onFilterCampaign,
}) => {
  const getChannelIcon = (channel: ChannelPerformanceMetric['channel']) => {
    switch (channel) {
      case 'AI Calls':
        return <Radio className="w-4 h-4 text-indigo-400" />;
      case 'Manual Calls':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'SMS':
        return <MessageSquare className="w-4 h-4 text-violet-400" />;
    }
  };

  // Find channel with highest conversion rate
  const bestChannel = [...channelMetrics].sort((a, b) => b.conversionRate - a.conversionRate)[0];

  return (
    <div id="cross-channel-and-campaign-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Cross-Channel Performance Table (6 Cols) */}
      <div className="lg:col-span-6 bg-mca-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                Cross-Channel Performance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of conversion velocity across outreach channels
              </p>
            </div>
            {bestChannel && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-800/50 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Top: {bestChannel.channel} ({bestChannel.conversionRate}%)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">Channel</th>
                  <th className="pb-2.5 font-semibold text-center">Attempts</th>
                  <th className="pb-2.5 font-semibold text-center">Connected</th>
                  <th className="pb-2.5 font-semibold text-center">Positive</th>
                  <th className="pb-2.5 font-semibold text-center">Meetings</th>
                  <th className="pb-2.5 font-semibold text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {channelMetrics.map((cm) => (
                  <tr key={cm.channel} className="hover:bg-mca-void/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-100 flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-mca-hover shrink-0">
                        {getChannelIcon(cm.channel)}
                      </div>
                      <div>
                        <div>{cm.channel}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {cm.channel === 'AI Calls' ? 'Sophia Voice Engine' : 'Outreach channel'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-200 font-medium">
                      {cm.attempts}
                    </td>
                    <td className="py-3 text-center text-slate-200">
                      {cm.successfulConnections}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/50 text-emerald-300">
                        {cm.positiveEngagement}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-white">
                      {cm.meetings}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {cm.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>AI Voice calls demonstrate highest qualification rate</span>
          <span className="text-slate-200 font-medium">Strict Telephony Logs</span>
        </div>
      </div>

      {/* Campaign Sequence Performance (6 Cols) */}
      <div className="lg:col-span-6 bg-mca-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                Active Outreach Campaigns
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated multi-channel contractor enrollment sequences
              </p>
            </div>

            <button
              onClick={onAddNewCampaign}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                onClick={() => onFilterCampaign && onFilterCampaign(camp)}
                className="p-3.5 rounded-xl border border-white/10 hover:border-indigo-700/60 hover:bg-indigo-950/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-300">
                        {camp.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
                        {camp.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {camp.target_niche || 'Contractors'} • {camp.target_location || 'Oregon'} • {camp.channel}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-white">
                      ${camp.estimated_pipeline_value.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Pipeline MRR</div>
                  </div>
                </div>

                {/* Campaign stats grid */}
                <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-white/5 text-center text-xs">
                  <div className="bg-mca-void/40 p-1.5 rounded">
                    <div className="text-[10px] text-slate-500">Enrolled</div>
                    <div className="font-bold text-slate-100">{camp.enrolled_lead_ids.length}</div>
                  </div>
                  <div className="bg-mca-void/40 p-1.5 rounded">
                    <div className="text-[10px] text-slate-500">Replies</div>
                    <div className="font-bold text-slate-100">{camp.replies_count}</div>
                  </div>
                  <div className="bg-mca-void/40 p-1.5 rounded">
                    <div className="text-[10px] text-slate-500">Meetings</div>
                    <div className="font-bold text-slate-100">{camp.meetings_count}</div>
                  </div>
                  <div className="bg-emerald-950/50 p-1.5 rounded text-emerald-300">
                    <div className="text-[10px] text-emerald-400">Won Value</div>
                    <div className="font-bold">${camp.won_value.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Targeting verified Oregon CCB licenses</span>
          <button
            onClick={onAddNewCampaign}
            className="text-indigo-400 font-medium hover:underline"
          >
            Create Multi-Touch Sequence →
          </button>
        </div>
      </div>
    </div>
  );
};
