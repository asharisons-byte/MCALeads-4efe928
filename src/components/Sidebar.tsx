import React from 'react';

import { canAccess, normalizeAppRole } from '../utils/roleUtils.js';
import { AppRole } from '../constants.js';

export type NavigationItem =
  | 'command_center'
  | 'dashboard'
  | 'leads'
  | 'import_leads'
  | 'lead_lists'
  | 'lead_intelligence'
  | 'ai_analysis'
  | 'call_intelligence'
  | 'lead_scoring'
  | 'opportunities'
  | 'pipeline'
  | 'audits_proposals'
  | 'follow_ups'
  | 'email_outreach'
  | 'sms'
  | 'calls'
  | 'analytics'
  | 'revenue'
  | 'agency_settings'
  | 'integrations'
  | 'team'
  | 'ai_workforce'
  | 'ai_approvals'
  | 'client_portal';

interface SidebarProps {
  currentTab: NavigationItem;
  onNavigate: (tab: NavigationItem) => void;
  onOpenImport?: () => void;
  leadsCount: number;
  hotCount: number;
  draftsCount?: number;
  smsCount?: number;
  callsCount?: number;
  followUpsCount?: number;
  approvalsCount?: number;
  currentUserRole?: string;
}

/**
 * Sidebar — Stitch "MainSidebar" (w-64 rail, unified-shell navigation anchor).
 *
 * Markup, spacing, badges and active-state styling mirror the Stitch
 * Executive Command Dashboard export. All routes / role gates are preserved.
 * The Client Portal module stays isolated from this shell (white-label integrity).
 */

/* ── Badge presets (verbatim from the Stitch markup) ───────────────────── */
const badge = {
  count: 'text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 rounded',
  countMuted: 'text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 rounded',
  phaseBlue: 'text-[9px] font-mono bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800/50',
  csv: 'text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1 rounded',
  agents: 'text-[9px] font-mono bg-purple-900/50 text-purple-300 px-1.5 rounded',
  whiteLabel: 'font-mono border border-slate-700 text-slate-400 px-1 rounded text-[8px]',
  phaseAmber: 'text-[9px] font-mono bg-amber-950/60 text-amber-400 px-1.5 rounded border border-amber-900/40',
  indigo: 'text-[9px] font-mono bg-indigo-950 text-indigo-300 px-1.5 rounded border border-indigo-800/40',
  purple: 'text-[9px] font-mono bg-purple-950 text-purple-300 px-1.5 rounded',
  hot: 'text-[9px] font-mono bg-amber-500/20 text-amber-400 px-1.5 rounded border border-amber-500/30',
  live: 'text-[9px] font-mono bg-mca-neonGreen/10 text-mca-neonGreen px-1 rounded',
  cyan: 'text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 rounded',
  blue: 'text-[9px] font-mono bg-blue-950 text-blue-300 px-1.5 rounded',
  amber: 'text-[9px] font-mono bg-amber-950/60 text-amber-300 px-1.5 rounded border border-amber-900/40',
  approvalsPending:
    'text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 rounded border border-amber-500/40 animate-pulse',
} as const;

interface NavItemProps {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: string; // font-awesome class (e.g. "fa-terminal")
  iconClass?: string; // colour accent for the icon
  label: React.ReactNode;
  badgeEl?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ id, active, onClick, icon, iconClass = '', label, badgeEl }) => (
  <button
    id={id}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
      active
        ? 'bg-gradient-to-r from-mca-neonGreen/10 to-transparent text-mca-neonGreen border-l-2 border-mca-neonGreen font-semibold shadow-glass'
        : 'text-slate-400 hover:text-white hover:bg-mca-hover'
    }`}
  >
    <span className="flex items-center gap-2 min-w-0">
      <i className={`fa-solid ${icon} w-4 text-center shrink-0 ${active ? '' : iconClass}`}></i>
      <span className="truncate">{label}</span>
    </span>
    {badgeEl ? badgeEl : active ? <i className="fa-solid fa-circle text-[6px] animate-pulse"></i> : null}
  </button>
);

const GroupHeader: React.FC<{ title: string; tag?: React.ReactNode }> = ({ title, tag }) => (
  <div className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
    <span>{title}</span>
    {tag}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  leadsCount,
  hotCount,
  draftsCount = 0,
  smsCount = 0,
  callsCount = 0,
  followUpsCount = 0,
  approvalsCount = 0,
  currentUserRole,
}) => {
  const normalizedRole = normalizeAppRole(currentUserRole || '') || (currentUserRole as AppRole);
  const canAccessTeam = canAccess(normalizedRole as AppRole, 'TeamManagement', 'READ');
  const isSalesRep = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'].includes(normalizedRole as string);

  const is = (t: NavigationItem) => currentTab === t;
  const go = (t: NavigationItem) => () => onNavigate(t);

  return (
    <aside
      id="mca-sidebar"
      className="w-64 h-screen bg-mca-surface border-r border-mca-border flex flex-col flex-shrink-0 z-30 select-none"
      data-purpose="sidebar-navigation"
    >
      {/* Sidebar Branding Header */}
      <div className="h-16 border-b border-mca-border flex items-center px-4 gap-3 bg-mca-void/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-mca-neonGreen flex items-center justify-center font-mono font-bold text-black shadow-neon-green">
          MCA
        </div>
        <div>
          <div className="text-xs font-bold text-white tracking-widest uppercase">Lead Agency Suite</div>
          <div className="text-[10px] font-mono text-mca-neonGreen flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-mca-neonGreen animate-pulse"></span>
            SWARM ONLINE v5.4
          </div>
        </div>
      </div>

      {/* Navigation Directory */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
        {/* Group: Workspace */}
        <div>
          <GroupHeader
            title="Workspace"
            tag={<span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">HUD</span>}
          />
          <nav className="space-y-0.5">
            {!isSalesRep && (
              <NavItem
                id="nav-command-center"
                active={is('command_center')}
                onClick={go('command_center')}
                icon="fa-terminal"
                label="Command Center"
                badgeEl={<span className={badge.phaseBlue}>Phase 5A</span>}
              />
            )}
            {!isSalesRep && (
              <NavItem
                id="nav-dashboard"
                active={is('dashboard')}
                onClick={go('dashboard')}
                icon="fa-gauge-high"
                label="Dashboard"
              />
            )}
            <NavItem
              id="nav-leads"
              active={is('leads')}
              onClick={go('leads')}
              icon="fa-user-plus"
              label="Leads"
              badgeEl={<span className={badge.count}>{leadsCount}</span>}
            />
            <NavItem
              id="nav-import-leads"
              active={is('import_leads')}
              onClick={go('import_leads')}
              icon="fa-file-import"
              label="Import Leads"
              badgeEl={<span className={badge.csv}>.CSV</span>}
            />
            <NavItem
              id="nav-lead-lists"
              active={is('lead_lists')}
              onClick={go('lead_lists')}
              icon="fa-list-check"
              label="Lead Lists"
            />
          </nav>
        </div>

        {/* Group: AI Workforce */}
        <div>
          <GroupHeader
            title="AI Workforce"
            tag={
              <span className="text-[9px] bg-purple-950 text-purple-400 px-1 rounded border border-purple-800/40">
                Phase 4A
              </span>
            }
          />
          <nav className="space-y-0.5">
            {!isSalesRep && (
              <NavItem
                id="nav-ai-workforce"
                active={is('ai_workforce')}
                onClick={go('ai_workforce')}
                icon="fa-microchip"
                iconClass="text-purple-400"
                label="Agency AI Workforce"
                badgeEl={<span className={badge.agents}>7 Agents</span>}
              />
            )}
            <NavItem
              id="nav-ai-approvals"
              active={is('ai_approvals')}
              onClick={go('ai_approvals')}
              icon="fa-shield-halved"
              label="Approval Center"
              badgeEl={
                <span className={approvalsCount > 0 ? badge.approvalsPending : badge.countMuted}>
                  {approvalsCount}
                </span>
              }
            />
          </nav>
        </div>

        {/* Group: Client Experience */}
        <div>
          <GroupHeader
            title="Client Experience"
            tag={<span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">Phase 4B</span>}
          />
          <nav className="space-y-0.5">
            <NavItem
              id="nav-client-portal"
              active={is('client_portal')}
              onClick={go('client_portal')}
              icon="fa-window-maximize"
              iconClass="text-cyan-400"
              label="Client Portal"
              badgeEl={<span className={badge.whiteLabel}>White-Label</span>}
            />
            <NavItem
              id="nav-audits-proposals"
              active={is('audits_proposals')}
              onClick={go('audits_proposals')}
              icon="fa-file-signature"
              label="Audits & Proposals"
              badgeEl={<span className={badge.phaseAmber}>Phase 2C</span>}
            />
          </nav>
        </div>

        {/* Group: Intelligence */}
        <div>
          <GroupHeader title="Intelligence" />
          <nav className="space-y-0.5">
            <NavItem
              id="nav-lead-intelligence"
              active={is('lead_intelligence')}
              onClick={go('lead_intelligence')}
              icon="fa-brain"
              iconClass="text-indigo-400"
              label="Lead Intel & Scoring"
            />
            <NavItem
              id="nav-ai-analysis"
              active={is('ai_analysis')}
              onClick={go('ai_analysis')}
              icon="fa-chart-pie"
              label="AI Lead Analysis"
            />
            <NavItem
              id="nav-call-intelligence"
              active={is('call_intelligence')}
              onClick={go('call_intelligence')}
              icon="fa-headset"
              iconClass="text-purple-400"
              label="Call Intel & Objections"
            />
            <NavItem
              id="nav-lead-scoring"
              active={is('lead_scoring')}
              onClick={go('lead_scoring')}
              icon="fa-ranking-star"
              iconClass="text-amber-400"
              label="Lead Scoring (0–100)"
            />
            <NavItem
              id="nav-opportunities"
              active={is('opportunities')}
              onClick={go('opportunities')}
              icon="fa-fire"
              iconClass="text-amber-500"
              label="Opportunities"
              badgeEl={<span className={badge.hot}>{hotCount} Hot</span>}
            />
          </nav>
        </div>

        {/* Group: Outreach & Ops */}
        <div>
          <GroupHeader title="Outreach & Ops" />
          <nav className="space-y-0.5">
            <NavItem
              id="nav-calls"
              active={is('calls')}
              onClick={go('calls')}
              icon="fa-phone-volume"
              iconClass="text-mca-neonGreen"
              label="MCA Dialer LIVE"
              badgeEl={callsCount > 0 ? <span className={badge.live}>{callsCount}</span> : undefined}
            />
            <NavItem
              id="nav-sms-outreach"
              active={is('sms')}
              onClick={go('sms')}
              icon="fa-comments"
              label="SMS Swarm"
              badgeEl={smsCount > 0 ? <span className={badge.cyan}>{smsCount}</span> : undefined}
            />
            <NavItem
              id="nav-email-outreach"
              active={is('email_outreach')}
              onClick={go('email_outreach')}
              icon="fa-envelope"
              label="Email Outreach"
              badgeEl={draftsCount > 0 ? <span className={badge.blue}>{draftsCount}</span> : undefined}
            />
            <NavItem
              id="nav-pipeline"
              active={is('pipeline')}
              onClick={go('pipeline')}
              icon="fa-table-columns"
              iconClass="text-blue-400"
              label="Pipeline / Kanban"
            />
            <NavItem
              id="nav-followups"
              active={is('follow_ups')}
              onClick={go('follow_ups')}
              icon="fa-clock"
              iconClass="text-amber-400"
              label="Follow-Up Queue"
              badgeEl={followUpsCount > 0 ? <span className={badge.amber}>{followUpsCount}</span> : undefined}
            />
          </nav>
        </div>

        {/* Group: Reporting */}
        <div>
          <GroupHeader title="Reporting" />
          <nav className="space-y-0.5">
            {!isSalesRep && (
              <NavItem
                id="nav-analytics"
                active={is('analytics')}
                onClick={go('analytics')}
                icon="fa-chart-column"
                iconClass="text-emerald-400"
                label="Analytics"
              />
            )}
            <NavItem
              id="nav-revenue"
              active={is('revenue')}
              onClick={go('revenue')}
              icon="fa-dollar-sign"
              iconClass="text-emerald-300"
              label="Revenue Forecast"
            />
          </nav>
        </div>

        {/* Group: Settings */}
        <div>
          <GroupHeader title="Settings" />
          <nav className="space-y-0.5">
            {!isSalesRep && (
              <NavItem
                id="nav-agency-settings"
                active={is('agency_settings')}
                onClick={go('agency_settings')}
                icon="fa-gear"
                label="Agency Settings"
              />
            )}
            {!isSalesRep && (
              <NavItem
                id="nav-integrations"
                active={is('integrations')}
                onClick={go('integrations')}
                icon="fa-puzzle-piece"
                label="Integrations"
              />
            )}
            {canAccessTeam && (
              <NavItem
                id="nav-team"
                active={is('team')}
                onClick={go('team')}
                icon="fa-user-group"
                label="Team"
              />
            )}
          </nav>
        </div>
      </div>

      {/* Sidebar Bottom Telemetry Widget */}
      <div className="p-3 border-t border-mca-border bg-mca-void/60 text-[11px] shrink-0">
        <div
          onClick={() => onNavigate('ai_workforce')}
          className="p-2.5 rounded-lg bg-mca-card border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/15 transition"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-purple-950 border border-purple-800/40 flex items-center justify-center text-purple-300 font-mono text-[10px] font-bold">
              AI
            </div>
            <div>
              <div className="font-bold text-white leading-none">Sophia &amp; Workforce</div>
              <div className="text-[9px] text-mca-neonGreen font-mono mt-0.5">Phase 4A Multi-Agent Ready</div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white" aria-label="Open AI Workforce">
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};
