import React, { useEffect, useRef, useState } from 'react';
import { Lead } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSophia: () => void;
  searchResults: Lead[];
  onSelectLead: (lead: Lead) => void;
  notificationsCount: number;
}

/**
 * Header — Stitch "TopBar" (executive-header).
 * Left: omnibox search with Ctrl K chip. Right: glowing "Ask Sophia" action + agency identity.
 */
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
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <header
      id="mca-top-header"
      ref={wrapRef}
      className="h-14 border-b border-mca-border bg-mca-surface/80 backdrop-blur px-6 flex items-center justify-between z-20 flex-shrink-0 sticky top-0"
      data-purpose="executive-header"
    >
      {/* Left: Omnibox Search */}
      <div className="w-96 relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
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
          placeholder="Search business, phone, email, niche, GMB... [Ctrl+K]"
          className="w-full bg-mca-void/80 border border-mca-border rounded-lg pl-9 pr-14 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />
        {searchQuery ? (
          <button
            onClick={() => {
              onSearchChange('');
              setShowSearchDropdown(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            aria-label="Clear search"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        ) : (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 border border-slate-700/60 px-1.5 py-0.5 rounded pointer-events-none">
            Ctrl K
          </span>
        )}

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="hud-search-results absolute top-full left-0 z-50 w-full max-h-80 overflow-y-auto p-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-2 py-1">
              Matching CRM Leads ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-400">
                No matching leads found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-0.5 mt-1">
                {searchResults.slice(0, 6).map((lead) => (
                  <button
                    key={lead.lead_id}
                    onClick={() => {
                      onSelectLead(lead);
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-mca-hover transition"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="truncate">{lead.business_name}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                          {lead.lead_id}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {lead.niche} · {lead.city}, {lead.state}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <div className="text-xs font-mono font-bold text-mca-neonGreen">{lead.lead_score}/100</div>
                      <div className="text-[10px] font-mono text-slate-400">
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

      {/* Right: Sophia AI Action & User Indicator */}
      <div className="flex items-center gap-4">
        <button
          id="header-btn-sophia"
          onClick={onOpenSophia}
          className="relative px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-neon-purple transition transform active:scale-95 border border-purple-400/40"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-cyan-300"></i>
          <span>Ask Sophia</span>
          <span className="w-2 h-2 rounded-full bg-mca-neonGreen animate-ping"></span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="header-btn-notifications"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-8 h-8 rounded-lg bg-mca-card hover:bg-mca-hover border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
            aria-label="Notifications"
          >
            <i className="fa-regular fa-bell text-xs"></i>
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mca-neonGreen ring-2 ring-mca-surface"></span>
            )}
          </button>

          {showNotifications && (
            <div className="hud-search-results absolute right-0 top-full z-50 w-80 p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-mca-border">
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                  Lead Intelligence Feed
                </span>
                <span className="text-[10px] font-mono text-mca-neonGreen flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-mca-neonGreen animate-pulse"></span>
                  System Active
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-mca-card hud-border-green">
                  <div className="text-xs font-bold text-white">West Coast Plumbing Audit</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    PageSpeed latency 28/100 flagged. $2,400/mo retainer pitch ready.
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-mca-card hud-border-cyan">
                  <div className="text-xs font-bold text-white">Crown Plumbing PDX</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    No website detected despite 18 5-star Google reviews.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-mca-border"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-mca-border flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
            MC
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white leading-none">Marketing Charm</div>
            <div className="text-[10px] font-mono text-slate-400">Sophia • AI Sales Rep</div>
          </div>
        </div>
      </div>
    </header>
  );
};
