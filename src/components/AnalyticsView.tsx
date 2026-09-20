import React from 'react';
import { Lead } from '../types';
import { BarChart3, TrendingUp, DollarSign, Award, Target, MapPin } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface AnalyticsViewProps {
  leads: Lead[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const totalMRR = leads.reduce((acc, l) => acc + (l.estimated_retainer || 0), 0);
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((acc, l) => acc + l.lead_score, 0) / totalLeads) : 0;

  // Gaps counts
  const gapsCount: Record<string, number> = {};
  leads.forEach((l) => {
    l.gaps?.forEach((g) => {
      gapsCount[g] = (gapsCount[g] || 0) + 1;
    });
  });

  // Service distribution
  const serviceRevenue: Record<string, number> = {};
  leads.forEach((l) => {
    const service = l.recommended_service || 'Other Services';
    serviceRevenue[service] = (serviceRevenue[service] || 0) + (l.estimated_retainer || 0);
  });

  // Geocoding placeholder: in a real app, this would use geocoding API or stored coords.
  // Using fixed Oregon coordinates for demo based on Lead data.
  const mapCenter = { lat: 44.5, lng: -120.5 };

  return (
    <div id="mca-analytics" className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Agency Analytics &amp; Revenue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Market penetration insights, gap prevalence, projected retainer revenue, and geographic clustering.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Pipeline Value</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              ${totalMRR.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across {totalLeads} prospects</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Average Lead Score</div>
            <div className="text-2xl font-extrabold text-purple-400 font-mono mt-1">
              {avgScore}/100
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Targeting fit rating</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Hot Target Conversion Ratio</div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {totalLeads > 0
                ? Math.round((leads.filter((l) => l.is_hot_target).length / totalLeads) * 100)
                : 0}
              %
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Scoring 88+</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Gaps Distribution */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Prevalent Marketing Gaps</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(gapsCount).map(([gap, count]) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={gap} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{gap}</span>
                    <span className="font-mono text-slate-400 font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projected MRR by Recommended Service */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Projected Monthly Retainers by Service</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(serviceRevenue).map(([service, mrr]) => {
              const pct = totalMRR > 0 ? Math.round((mrr / totalMRR) * 100) : 0;
              return (
                <div key={service} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="truncate max-w-[280px]">{service}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${mrr.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Geographic Lead Clusters</span>
        </h3>
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-800">
          <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY || ''}>
            <Map defaultCenter={mapCenter} defaultZoom={7} disableDefaultUI={true}>
              {leads.map((lead, index) => (
                // In production, use real geocoding coordinates.
                // Dummy logic to scatter markers in Oregon area.
                <AdvancedMarker
                  key={index}
                  position={{
                    lat: mapCenter.lat + (Math.random() - 0.5) * 3,
                    lng: mapCenter.lng + (Math.random() - 0.5) * 3,
                  }}
                  title={lead.business_name}
                >
                  <Pin background={'#fbbf24'} glyphColor={'#000'} borderColor={'#000'} />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>
      </div>
    </div>
  );
};
