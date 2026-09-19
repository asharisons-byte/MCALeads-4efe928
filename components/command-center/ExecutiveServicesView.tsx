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
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider">
              Core Revenue Pillar
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <h4 className="text-base font-black text-slate-950">Website Development & SEO</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generates 62% of agency retainer revenue ($5,200/mo) with standard 6-month contract stability.
          </p>
          <div className="text-xs font-bold text-indigo-700 pt-1">
            Standard: $2,400 – $3,200 / month
          </div>
        </div>

        {/* Most Requested / High Conversion */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">
              Highest Conversion Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="text-base font-black text-slate-950">GBP & Technical Optimization</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            28% proposal acceptance rate. Low operational overhead makes this our highest gross margin product.
          </p>
          <div className="text-xs font-bold text-emerald-700 pt-1">
            Standard: $1,200 – $1,800 / month
          </div>
        </div>

        {/* Under-Sold Expansion Opportunity */}
        <div className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider">
              Expansion Opportunity
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="text-base font-black text-slate-950">Review & Reputation Automation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Currently zero active dedicated retainers, but 42% of discovered contractors suffer from low review volume.
          </p>
          <div className="text-xs font-bold text-amber-800 pt-1">
            Target Retainer: $850 – $1,200 / month
          </div>
        </div>
      </div>

      {/* 2. COMPREHENSIVE SERVICE PERFORMANCE TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Agency Service Performance Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active clients, monthly contract contribution, acceptance rates, and retention across 8 agency service lines
            </p>
          </div>
          <span className="text-xs font-bold text-slate-800">
            Total Combined Service Value: ${totalServiceRevenue.toLocaleString()}/mo
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Service Name</th>
                <th className="pb-3 font-semibold text-right">Active Clients</th>
                <th className="pb-3 font-semibold text-right">Monthly Revenue</th>
                <th className="pb-3 font-semibold text-right">Average Retainer</th>
                <th className="pb-3 font-semibold text-right">Acceptance Rate</th>
                <th className="pb-3 font-semibold text-right">Retention Rate</th>
                <th className="pb-3 font-semibold pl-4">Sophia Strategic Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((svc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">{svc.service_name}</td>
                  <td className="py-3.5 text-right font-bold text-slate-800">{svc.active_clients}</td>
                  <td className="py-3.5 text-right font-black text-emerald-700">
                    ${svc.monthly_revenue.toLocaleString()}/mo
                  </td>
                  <td className="py-3.5 text-right text-slate-700">
                    ${svc.average_retainer.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right text-indigo-600 font-bold">{svc.acceptance_rate}%</td>
                  <td className="py-3.5 text-right text-emerald-600 font-bold">{svc.retention_rate}%</td>
                  <td className="py-3.5 pl-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.opportunity_status === 'Highest Revenue'
                          ? 'bg-indigo-100 text-indigo-800'
                          : svc.opportunity_status === 'High Conversion'
                          ? 'bg-emerald-100 text-emerald-800'
                          : svc.opportunity_status === 'Under-Sold Opportunity'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
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
