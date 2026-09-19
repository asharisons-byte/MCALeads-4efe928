import React, { useState } from 'react';
import {
  PieChart,
  Layers,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  ServiceRevenueBreakdown,
  IndustryRevenueBreakdown,
  LocationRevenueBreakdown,
} from '../../services/commandCenterService';

interface RevenueBreakdownsSectionProps {
  services: ServiceRevenueBreakdown[];
  industries: IndustryRevenueBreakdown[];
  locations: LocationRevenueBreakdown[];
}

export const RevenueBreakdownsSection: React.FC<RevenueBreakdownsSectionProps> = ({
  services,
  industries,
  locations,
}) => {
  const [activeTab, setActiveTab] = useState<'service' | 'industry' | 'location'>('service');

  return (
    <div id="revenue-breakdowns-section" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
      {/* Header with tab switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Revenue Intelligence Breakdowns
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution of active pipeline and won retainer revenue across segments
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('service')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'service'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            By Service
          </button>
          <button
            onClick={() => setActiveTab('industry')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'industry'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            By Niche
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            By Location
          </button>
        </div>
      </div>

      {/* Tab 1: By Agency Service */}
      {activeTab === 'service' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">Service Line</th>
                <th className="pb-2.5 font-semibold text-center">Leads Assigned</th>
                <th className="pb-2.5 font-semibold text-right">Pipeline MRR</th>
                <th className="pb-2.5 font-semibold text-right">Won Retainer MRR</th>
                <th className="pb-2.5 font-semibold text-right">Closing Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((item) => (
                <tr key={item.service} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {item.service}
                  </td>
                  <td className="py-2.5 text-center text-slate-600 font-medium">
                    {item.leadCount}
                  </td>
                  <td className="py-2.5 text-right font-medium text-slate-700">
                    ${item.estimatedPipelineMRR.toLocaleString()}/mo
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">
                    ${item.wonMRR.toLocaleString()}/mo
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                      {item.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: By Industry Niche */}
      {activeTab === 'industry' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">Industry Niche</th>
                <th className="pb-2.5 font-semibold text-center">Verified Leads</th>
                <th className="pb-2.5 font-semibold text-center">Avg Fit Score</th>
                <th className="pb-2.5 font-semibold text-right">Pipeline Value</th>
                <th className="pb-2.5 font-semibold text-right">Won Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {industries.map((item) => (
                <tr key={item.niche} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {item.niche}
                  </td>
                  <td className="py-2.5 text-center text-slate-600 font-medium">
                    {item.leadsCount}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800">
                      {item.avgScore}/100
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium text-slate-700">
                    ${item.pipelineValue.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">
                    ${item.wonRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: By Geographic Location */}
      {activeTab === 'location' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">City & Territory</th>
                <th className="pb-2.5 font-semibold text-center">Leads Count</th>
                <th className="pb-2.5 font-semibold text-center">Hot Targets</th>
                <th className="pb-2.5 font-semibold text-right">Pipeline Value</th>
                <th className="pb-2.5 font-semibold text-right">Won MRR</th>
                <th className="pb-2.5 font-semibold text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map((item) => (
                <tr key={`${item.city}-${item.state}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.city}, {item.state}
                  </td>
                  <td className="py-2.5 text-center text-slate-600 font-medium">
                    {item.leadsCount}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                      {item.hotLeadsCount}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium text-slate-700">
                    ${item.pipelineValue.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">
                    ${item.wonMRR.toLocaleString()}/mo
                  </td>
                  <td className="py-2.5 text-right font-semibold text-slate-800">
                    {item.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Segments derived directly from contractor CCB city and verified trade categories</span>
        <span className="text-slate-700 font-medium">Oregon Contractor Territory</span>
      </div>
    </div>
  );
};
