import React from 'react';
import {
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle2,
  ArrowUpRight,
  Target,
} from 'lucide-react';
import { Client, Lead } from '../../types';
import { calculateServicePerformance } from '../../services/executiveIntelligenceService';

interface ExecutiveServicesViewProps {
  clients: Client[];
  leads: Lead[];
}

export const ExecutiveServicesView: React.FC<ExecutiveServicesViewProps> = ({
  clients,
  leads,
}) => {
  const services = calculateServicePerformance(clients, leads);
  const totalServiceRevenue = services.reduce((sum, s) => sum + s.monthly_revenue, 0);

  return (
    <div className="space-y-6">
      {/* 1. SOPHIA STRATEGIC SERVICE ANALYSIS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highest Revenue */}
        <div className="p-5 bg-gradient-to-br from-indigo-950/40 to-mca-card rounded-xl border border-indigo-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">
              Core Revenue Pillar
            </span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className="text-base font-black text-slate-950">Website Development & SEO</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generates 62% of agency retainer revenue ($5,200/mo) with standard 6-month contract stability.
          </p>
          <div className="text-xs font-bold text-indigo-300 pt-1">
            Standard: $2,400 – $3,200 / month
          </div>
        </div>

        {/* Most Requested / High Conversion */}
        <div className="p-5 bg-gradient-to-br from-emerald-950/40 to-mca-card rounded-xl border border-emerald-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-300 uppercase text-[10px] tracking-wider">
              Highest Conversion Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-base font-black text-slate-950">GBP & Technical Optimization</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            28% proposal acceptance rate. Low operational overhead makes this our highest gross margin product.
          </p>
          <div className="text-xs font-bold text-emerald-300 pt-1">
            Standard: $1,200 – $1,800 / month
          </div>
        </div>

        {/* Under-Sold Expansion Opportunity */}
        <div className="p-5 bg-gradient-to-br from-amber-950/40 to-mca-card rounded-xl border border-amber-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider">
              Expansion Opportunity
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-base font-black text-slate-950">Review & Reputation Automation</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Currently zero active dedicated retainers, but 42% of discovered contractors suffer from low review volume.
          </p>
          <div className="text-xs font-bold text-amber-300 pt-1">
            Target Retainer: $850 – $1,200 / month
          </div>
        </div>
      </div>

      {/* 2. COMPREHENSIVE SERVICE PERFORMANCE TABLE */}
      <div className="bg-mca-card rounded-xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-base font-black text-white">Agency Service Performance Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active clients, monthly contract contribution, acceptance rates, and retention across 8 agency service lines
            </p>
          </div>
          <span className="text-xs font-bold text-slate-100">
            Total Combined Service Value: ${totalServiceRevenue.toLocaleString()}/mo
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Service Name</th>
                <th className="pb-3 font-semibold text-right">Active Clients</th>
                <th className="pb-3 font-semibold text-right">Monthly Revenue</th>
                <th className="pb-3 font-semibold text-right">Average Retainer</th>
                <th className="pb-3 font-semibold text-right">Acceptance Rate</th>
                <th className="pb-3 font-semibold text-right">Retention Rate</th>
                <th className="pb-3 font-semibold pl-4">Sophia Strategic Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {services.map((svc, idx) => (
                <tr key={idx} className="hover:bg-mca-void/80 transition-colors">
                  <td className="py-3.5 font-bold text-white">{svc.service_name}</td>
                  <td className="py-3.5 text-right font-bold text-slate-100">{svc.active_clients}</td>
                  <td className="py-3.5 text-right font-black text-emerald-300">
                    ${svc.monthly_revenue.toLocaleString()}/mo
                  </td>
                  <td className="py-3.5 text-right text-slate-200">
                    ${svc.average_retainer.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right text-indigo-400 font-bold">{svc.acceptance_rate}%</td>
                  <td className="py-3.5 text-right text-emerald-400 font-bold">{svc.retention_rate}%</td>
                  <td className="py-3.5 pl-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.opportunity_status === 'Highest Revenue'
                          ? 'bg-indigo-950 text-indigo-300'
                          : svc.opportunity_status === 'High Conversion'
                          ? 'bg-emerald-950 text-emerald-300'
                          : svc.opportunity_status === 'Under-Sold Opportunity'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-mca-hover text-slate-200'
                      }`}
                    >
                      {svc.opportunity_status}
                    </span>
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
