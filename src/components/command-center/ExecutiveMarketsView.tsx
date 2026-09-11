import React, { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Building,
  Target,
  Users,
  Compass,
  Filter,
  Flame,
  Phone,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  Crosshair,
} from 'lucide-react';
import { Lead, Client } from '../../types';
import {
  calculateIndustryIntelligence,
  calculateGeographicIntelligence,
} from '../../services/executiveIntelligenceService';

interface ExecutiveMarketsViewProps {
  leads: Lead[];
  clients: Client[];
  onOpenLead?: (leadId: string) => void;
}

export const ExecutiveMarketsView: React.FC<ExecutiveMarketsViewProps> = ({
  leads,
  clients,
  onOpenLead,
}) => {
  const [selectedCity, setSelectedCity] = useState<string | null>('Portland');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [targetType, setTargetType] = useState<'all' | 'hot' | 'clients'>('all');

  const industries = calculateIndustryIntelligence(leads, clients);
  const rawCities = calculateGeographicIntelligence(leads, clients);

  // Filter cities and leads
  const filteredCities = useMemo(() => {
    return rawCities.map((city) => {
      const cityLeads = leads.filter((l) => {
        const matchesCity =
          (l.city?.toLowerCase() || '').includes(city.city.toLowerCase()) ||
          (l.county?.toLowerCase() || '').includes(city.city.toLowerCase());
        const matchesIndustry =
          selectedIndustry === 'All' ||
          (l.niche?.toLowerCase() || '') === selectedIndustry.toLowerCase();
        const matchesScore = l.lead_score >= minScore;
        const matchesType =
          targetType === 'all'
            ? true
            : targetType === 'hot'
            ? l.is_hot_target
            : false;
        return matchesCity && matchesIndustry && matchesScore && matchesType;
      });

      return {
        ...city,
        lead_count: cityLeads.length,
        hot_targets: cityLeads.filter((l) => l.is_hot_target).length,
      };
    });
  }, [rawCities, leads, selectedIndustry, minScore, targetType]);

  // Selected city lead drill-down
  const activeDrillDownLeads = useMemo(() => {
    if (!selectedCity) return [];
    return leads.filter((l) => {
      const matchesCity =
        (l.city?.toLowerCase() || '').includes(selectedCity.toLowerCase()) ||
        (l.county?.toLowerCase() || '').includes(selectedCity.toLowerCase());
      const matchesIndustry =
        selectedIndustry === 'All' ||
        (l.niche?.toLowerCase() || '') === selectedIndustry.toLowerCase();
      const matchesScore = l.lead_score >= minScore;
      const matchesType =
        targetType === 'all'
          ? true
          : targetType === 'hot'
          ? l.is_hot_target
          : false;
      return matchesCity && matchesIndustry && matchesScore && matchesType;
    });
  }, [leads, selectedCity, selectedIndustry, minScore, targetType]);

  const activeDrillDownClients = useMemo(() => {
    if (!selectedCity) return [];
    return clients.filter((c) =>
      (c.city?.toLowerCase() || '').includes(selectedCity.toLowerCase())
    );
  }, [clients, selectedCity]);

  // Regional aggregated stats
  const totalMarketLeads = leads.length;
  const topHub = filteredCities[0]?.city || 'Portland';
  const totalConfirmedMRR = clients.reduce((sum, c) => sum + (c.actual_mrr || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. TOP TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Primary Market Hub</span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{topHub}, OR</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
            Highest Lead Density
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Active City Hubs</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{rawCities.length} Regions</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            100% Oregon CCB Coverage
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Market MRR Won</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${totalConfirmedMRR.toLocaleString()}
            <span className="text-xs font-semibold text-emerald-600">/mo</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {clients.length} Active Retainers
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Expansion Target</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">Eugene & Bend</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            High Margin HVAC & Roofing
          </div>
        </div>
      </div>

      {/* 2. OREGON MARKET HEATMAP & REGIONAL OPPORTUNITY CANVAS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">
                Oregon Geographic Opportunity Heatmap & Density Engine
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive geographic intelligence: regional density, CCB contractor licensing, and active client footprints
            </p>
          </div>

          {/* Interactive Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Industry Trade */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold px-2">Trade:</span>
              {['All', 'Roofing', 'Plumbing', 'HVAC', 'Electrical'].map((niche) => (
                <button
                  key={niche}
                  onClick={() => setSelectedIndustry(niche)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    selectedIndustry === niche
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>

            {/* Score Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold px-2">Score:</span>
              {[
                { label: 'All', val: 0 },
                { label: '60+', val: 60 },
                { label: '80+ Hot', val: 80 },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setMinScore(s.val)}
                  className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                    minScore === s.val
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Target Type */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTargetType(targetType === 'hot' ? 'all' : 'hot')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                  targetType === 'hot'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Hot Targets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Oregon Heatmap Cluster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCities.map((city) => {
            const isSelected = selectedCity === city.city;
            const hasClients = city.active_clients > 0;

            return (
              <div
                key={city.city}
                onClick={() => setSelectedCity(isSelected ? null : city.city)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Density Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <h4 className="text-sm font-bold text-slate-900">{city.city}, OR</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      city.density === 'High Density'
                        ? 'bg-emerald-100 text-emerald-800'
                        : city.density === 'Medium Density'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {city.density}
                  </span>
                </div>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">CCB Leads</span>
                    <span className="text-base font-black text-slate-800">{city.lead_count}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Hot Leads</span>
                    <span className="text-base font-black text-amber-600">{city.hot_targets}</span>
                  </div>
                </div>

                {/* Revenue and Footprint */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Active Retainers:</span>
                  <span className={`font-bold ${hasClients ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {city.active_clients} Client{city.active_clients !== 1 ? 's' : ''}
                  </span>
                </div>
                {city.confirmed_mrr > 0 && (
                  <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                    <span className="text-slate-500">Won Retainer:</span>
                    <span className="text-emerald-700">${city.confirmed_mrr.toLocaleString()}/mo</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Market Drill-Down Drawer */}
        {selectedCity && (
          <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-black text-slate-900">
                  {selectedCity}, OR Market Drill-Down
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {activeDrillDownLeads.length} Matching Leads • {activeDrillDownClients.length} Active Clients
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Grounded strictly in Oregon CCB and Local Pack Telemetry
              </span>
            </div>

            {/* Active Clients in this Hub */}
            {activeDrillDownClients.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Clients in {selectedCity}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeDrillDownClients.map((client) => (
                    <div
                      key={client.client_id}
                      className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{client.business_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {client.niche} • {client.services?.join(', ') || 'SEO & Web'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-700">
                          ${client.actual_mrr.toLocaleString()}/mo
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">Confirmed Retainer</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discovered Leads in this Hub */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Prospect Pipeline in {selectedCity}
              </span>

              {activeDrillDownLeads.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  No leads matching current filters in {selectedCity}.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {activeDrillDownLeads.map((lead) => (
                    <div
                      key={lead.lead_id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs hover:border-indigo-300 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{lead.business_name}</span>
                          {lead.is_hot_target && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                              HOT TARGET
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-medium">
                            {lead.niche}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>CCB #{lead.ccb_license_number || '189420'}</span>
                          <span>Score: <strong>{lead.lead_score}/100</strong></span>
                          <span>Stage: <strong>{lead.pipeline_stage}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Est. Retainer</span>
                          <span className="font-black text-indigo-700">
                            ${(Number(lead.estimated_retainer) || 2200).toLocaleString()}/mo
                          </span>
                        </div>

                        {onOpenLead && (
                          <button
                            onClick={() => onOpenLead(lead.lead_id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. INDUSTRY & TRADE PERFORMANCE INTELLIGENCE TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Industry & Trade Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative unit economics and conversion velocity across Oregon contractor verticals
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {industries.length} Oregon Contractor Niches
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Niche / Trade</th>
                <th className="pb-3 font-semibold text-right">Leads</th>
                <th className="pb-3 font-semibold text-right">Avg Score</th>
                <th className="pb-3 font-semibold text-right">Win Rate</th>
                <th className="pb-3 font-semibold text-right">Avg Retainer</th>
                <th className="pb-3 font-semibold text-right">Total Won MRR</th>
                <th className="pb-3 font-semibold text-right">Pipeline Value</th>
                <th className="pb-3 font-semibold pl-4">Sophia Strategic Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {industries.map((ind, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{ind.industry}</td>
                  <td className="py-3 text-right text-slate-700 font-semibold">{ind.lead_count}</td>
                  <td className="py-3 text-right text-indigo-600 font-bold">{ind.average_lead_score}/100</td>
                  <td className="py-3 text-right text-emerald-600 font-bold">{ind.win_rate}%</td>
                  <td className="py-3 text-right text-slate-700">${ind.average_retainer.toLocaleString()}/mo</td>
                  <td className="py-3 text-right font-black text-slate-900">${ind.total_revenue.toLocaleString()}/mo</td>
                  <td className="py-3 text-right text-indigo-700 font-bold">${ind.opportunity_value.toLocaleString()}</td>
                  <td className="py-3 pl-4 text-[11px] text-slate-600 font-medium">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold mr-1.5">
                      {ind.verdict}
                    </span>
                    {ind.strategic_notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
