import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  CheckCircle2,
  X,
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
      className="hud-header h-16 px-6 flex items-center justify-between z-10 sticky top-0"
    >
      {/* Search Input */}
      <div className="relative" style={{ width: 440 }}>
        <div className="relative flex items-center">
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.625rem',
              color: 'var(--outline)',
              pointerEvents: 'none',
            }}
          />
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
            className="hud-search-input"
            style={{ paddingLeft: '2.25rem', paddingRight: searchQuery ? '4rem' : '3.5rem', width: '100%' }}
          />
          <div
            className="absolute flex items-center gap-0.5 px-1.5 py-0.5"
            style={{
              right: '0.5rem',
              background: 'var(--surface-container)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--outline)',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ fontSize: 10 }}>⌘</span>
            <span>K</span>
          </div>

          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearchDropdown(false);
              }}
              style={{
                position: 'absolute',
                right: '3.5rem',
                color: 'var(--outline)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="hud-search-results absolute top-full left-0 z-50 overflow-y-auto"
            style={{ width: "100%", maxHeight: 320, padding: "0.5rem" }}>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--outline)',
                padding: '0.25rem 0.5rem',
                marginBottom: '0.25rem',
              }}>
              Matching CRM Leads ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--on-surface-variant)',
                }}>
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
                    className="w-full text-left flex items-center justify-between px-2 py-2 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--hud-border-dim)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-high)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--on-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <span>{lead.business_name}</span>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            padding: '0 4px',
                            background: 'var(--surface-container)',
                            color: 'var(--on-surface-variant)',
                          }}>
                          {lead.lead_id}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--on-surface-variant)',
                        marginTop: 2,
                      }}>
                        <span>{lead.niche}</span>
                        <span>·</span>
                        <span>{lead.city}, {lead.state}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--primary-container)',
                      }}>
                        {lead.lead_score}/100
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--on-surface-variant)',
                      }}>
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
      <div className="flex items-center gap-3">
        {/* AI Assistant (Sophia) Button */}
        <button
          id="header-btn-sophia"
          onClick={onOpenSophia}
          className="hud-btn-sophia"
        >
          <Sparkles
            size={14}
            style={{
              color: 'var(--primary-container)',
              animation: 'hud-blink 1.4s ease-in-out infinite',
            }}
          />
          <span>Ask Sophia</span>
          <span
            style={{
              background: 'var(--primary-container)',
              color: '#002110',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '0.125rem 0.375rem',
              marginLeft: 2,
            }}
          >
            AI
          </span>
        </button>

        <div style={{ width: 1, height: 20, background: "var(--hud-border-base)" }} />

        {/* Notifications */}
        <div className="relative">
          <button
            id="header-btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              padding: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--on-surface-variant)',
              position: 'relative',
              display: 'flex',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--on-surface)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
          >
            <Bell size={16} />
            {notificationsCount > 0 && (
              <span style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--primary-container)',
                  border: '2px solid var(--hud-obsidian)',
                }} />
            )}
          </button>

          {showNotifications && (
            <div className="hud-panel absolute right-0 top-full z-50"
              style={{ width: 320, marginTop: 8, padding: "0.75rem" }}>
              <div className="flex items-center justify-between pb-2"
                style={{ borderBottom: '1px solid var(--hud-border-base)', marginBottom: '0.5rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>Lead Intelligence Feed</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <CheckCircle2 size={10} /> System Active
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div style={{
                    padding: '0.5rem',
                    background: 'var(--surface-container)',
                    borderLeft: '2px solid var(--primary-container)',
                  }}>
                  <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--on-surface)',
                    }}>West Coast Plumbing Audit</div>
                  <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--on-surface-variant)',
                      marginTop: 2,
                    }}>
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
        <div className="flex items-center gap-2 pl-1">
          <div style={{
              width: 32,
              height: 32,
              background: 'var(--secondary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--secondary)',
              flexShrink: 0,
            }}>
            MC
          </div>
          <div className="hidden lg:block">
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--on-surface)',
                lineHeight: 1.2,
              }}>
              Marketing Charm
            </div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--outline)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>Sophia • AI Sales Rep</div>
          </div>
        </div>
      </div>
    </header>
  );
};
