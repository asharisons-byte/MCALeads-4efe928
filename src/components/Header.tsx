import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Lead } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSophia: () => void;
  searchResults: Lead[];
  onSelectLead: (lead: Lead) => void;
  notificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSophia,
  searchResults,
  onSelectLead,
  notificationsCount,
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      id="mca-top-header"
      className="h-16 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-6 flex items-center justify-between z-10 sticky top-0"
    >
      {/* Search Input */}
      <div className="relative w-96">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchDropdown(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
            }}
            placeholder="Search business, phone, email, niche, GMB..."
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute top-full mt-1.5 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Matching CRM Leads ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching leads found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {searchResults.slice(0, 6).map((lead) => (
                  <button
                    key={lead.lead_id}
                    onClick={() => {
                      onSelectLead(lead);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 flex items-center gap-2">
                        <span>{lead.business_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {lead.lead_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{lead.niche}</span>
                        <span>•</span>
                        <span>{lead.city}, {lead.state}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        {lead.lead_score}/100
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ${lead.estimated_retainer?.toLocaleString()}/mo
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        {/* AI Assistant (Sophia) Button */}
        <button
          id="header-btn-sophia"
          onClick={onOpenSophia}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 text-xs font-semibold text-purple-200 hover:text-white hover:border-purple-400/50 transition-all shadow-sm group"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
          <span>Sophia AI Assistant</span>
        </button>

        <div className="h-5 w-px bg-slate-800" />

        {/* Notifications */}
        <div className="relative">
          <button
            id="header-btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Lead Intelligence Feed</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> System Active
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-slate-200">West Coast Plumbing Audit</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    PageSpeed latency 28/100 flagged. $2,400/mo retainer pitch ready.
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-slate-200">Crown Plumbing PDX</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    No website detected despite 18 5-star Google reviews.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agency Profile */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-400/30">
            MC
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              Marketing Charm
            </div>
            <div className="text-[10px] text-slate-400">Sophia • AI Sales Rep</div>
          </div>
        </div>
      </div>
    </header>
  );
};
