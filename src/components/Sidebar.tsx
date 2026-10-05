import React from 'react';
import {
  LayoutDashboard,
  Users,
  ListFilter,
  BrainCircuit,
  Award,
  Sparkles,
  Target,
  Kanban,
  Clock,
  BarChart3,
  DollarSign,
  Settings,
  Puzzle,
  UserCheck,
  Bot,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
  FileCheck,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
  Activity,
} from 'lucide-react';

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

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenImport,
  leadsCount,
  hotCount,
  draftsCount = 0,
  smsCount = 0,
  callsCount = 0,
  followUpsCount = 0,
  approvalsCount = 0,
  currentUserRole,
}) => {
  const normalizedRole = normalizeAppRole(currentUserRole || '') || currentUserRole as AppRole;
  const canAccessTeam = canAccess(normalizedRole as AppRole, 'TeamManagement', 'READ');
  const isSalesRep = ['SDR', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST'].includes(normalizedRole as string);

  return (
    <aside
      id="mca-sidebar"
      className="hud-sidebar w-72 h-screen flex flex-col flex-shrink-0 select-none z-20" style={{ width: "288px" }}
    >
      {/* Brand Header */}
      <div className="hud-sidebar-brand">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              background: 'var(--primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="#002110" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--primary-container)',
                lineHeight: 1,
              }}
            >
              Marketing Charm
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary-fixed-dim)',
                marginTop: 3,
              }}
            >
              Lead Agency Suite
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between mt-3 px-2 py-1"
          style={{ background: 'var(--surface-container)' }}
        >
          <div className="flex items-center gap-2">
            <span className="hud-live-dot" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary-fixed)',
              }}
            >
              SWARM ONLINE
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--outline)',
              textTransform: 'uppercase',
            }}
          >
            MCA HUD
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        {/* WORKSPACE */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <div className="space-y-1">
            {!isSalesRep && (
              <button
                id="nav-command-center"
                onClick={() => onNavigate('command_center')}
                className={`hud-nav-item ${
                  currentTab === 'command_center' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  <span>Command Center</span>
                </div>
              </button>
            )}

            {!isSalesRep && (
              <button
                id="nav-dashboard"
                onClick={() => onNavigate('dashboard')}
                className={`hud-nav-item ${
                  currentTab === 'dashboard' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard</span>
                </div>
              </button>
            )}

            <button
              id="nav-leads"
              onClick={() => onNavigate('leads')}
              className={`hud-nav-item ${
                currentTab === 'leads' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Leads</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-slate-800 text-slate-300 font-mono">
                {leadsCount}
              </span>
            </button>

            <button
              id="nav-import-leads"
              onClick={() => onNavigate('import_leads')}
              className={`hud-nav-item ${
                currentTab === 'import_leads' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                <span>Import Leads</span>
              </div>
            </button>

            <button
              id="nav-lead-lists"
              onClick={() => onNavigate('lead_lists')}
              className={`hud-nav-item ${
                currentTab === 'lead_lists' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-slate-400" />
                <span>Lead Lists</span>
              </div>
            </button>
          </div>
        </div>

        {/* AI WORKFORCE & AUTOMATION */}
        <div>
          <div className="hud-sidebar-section-label"><span>AI Workforce</span></div>
          <div className="space-y-1">
            {!isSalesRep && (
              <button
                id="nav-ai-workforce"
                onClick={() => onNavigate('ai_workforce')}
                className={`hud-nav-item ${
                  currentTab === 'ai_workforce' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>Agency AI Workforce</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] rounded font-bold bg-indigo-500/20 text-indigo-300">
                  7 Agents
                </span>
              </button>
            )}

            <button
              id="nav-ai-approvals"
              onClick={() => onNavigate('ai_approvals')}
              className={`hud-nav-item ${
                currentTab === 'ai_approvals' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Approval Center</span>
              </div>
              {approvalsCount > 0 ? (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                  {approvalsCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] rounded text-slate-500">
                  0
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CLIENT EXPERIENCE & WHITE-LABEL PORTAL */}
        <div>
          <div className="hud-sidebar-section-label"><span>Client Experience</span></div>
          <div className="space-y-1">
            <button
              id="nav-client-portal"
              onClick={() => onNavigate('client_portal')}
              className={`hud-nav-item ${
                currentTab === 'client_portal' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Client Portal</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                White-Label
              </span>
            </button>
          </div>
        </div>

        {/* INTELLIGENCE */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence
          </div>
          <div className="space-y-1">
            <button
              id="nav-lead-intelligence"
              onClick={() => onNavigate('lead_intelligence')}
              className={`hud-nav-item ${
                currentTab === 'lead_intelligence' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Lead Intelligence & Scoring</span>
              </div>
            </button>

            <button
              id="nav-ai-analysis"
              onClick={() => onNavigate('ai_analysis')}
              className={`hud-nav-item ${
                currentTab === 'ai_analysis' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>AI Lead Analysis</span>
              </div>
            </button>

            <button
              id="nav-call-intelligence"
              onClick={() => onNavigate('call_intelligence')}
              className={`hud-nav-item ${
                currentTab === 'call_intelligence' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Call Intelligence & Objections</span>
              </div>
            </button>

            <button
              id="nav-lead-scoring"
              onClick={() => onNavigate('lead_scoring')}
              className={`hud-nav-item ${
                currentTab === 'lead_scoring' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Lead Scoring (0–100)</span>
              </div>
            </button>

            <button
              id="nav-opportunities"
              onClick={() => onNavigate('opportunities')}
              className={`hud-nav-item ${
                currentTab === 'opportunities' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Opportunities</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold">
                {hotCount} Hot
              </span>
            </button>
          </div>
        </div>

        {/* PIPELINE */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pipeline
          </div>
          <div className="space-y-1">
            <button
              id="nav-pipeline"
              onClick={() => onNavigate('pipeline')}
              className={`hud-nav-item ${
                currentTab === 'pipeline' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Kanban className="w-4 h-4 text-blue-400" />
                <span>Pipeline / Kanban</span>
              </div>
            </button>

            <button
              id="nav-audits-proposals"
              onClick={() => onNavigate('audits_proposals')}
              className={`hud-nav-item ${
                currentTab === 'audits_proposals' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Audits & Proposals</span>
              </div>
            </button>

            <button
              id="nav-followups"
              onClick={() => onNavigate('follow_ups')}
              className={`hud-nav-item ${
                currentTab === 'follow_ups' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Follow-Up Queue</span>
              </div>
              {typeof followUpsCount === 'number' && followUpsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {followUpsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* OUTREACH */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Outreach
          </div>
          <div className="space-y-1">
            <button
              id="nav-email-outreach"
              onClick={() => onNavigate('email_outreach')}
              className={`hud-nav-item ${
                currentTab === 'email_outreach' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Email Outreach</span>
              </div>
              {typeof draftsCount === 'number' && draftsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-blue-500/20 text-blue-300 font-mono font-bold">
                  {draftsCount}
                </span>
              )}
            </button>

            <button
              id="nav-sms-outreach"
              onClick={() => onNavigate('sms')}
              className={`hud-nav-item ${
                currentTab === 'sms' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>SMS Outreach</span>
              </div>
              {typeof smsCount === 'number' && smsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-sky-500/20 text-sky-300 font-mono font-bold">
                  {smsCount}
                </span>
              )}
            </button>

            <button
              id="nav-calls"
              onClick={() => onNavigate('calls')}
              className={`hud-nav-item ${
                currentTab === 'calls' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Calls & Dialer</span>
              </div>
              {typeof callsCount === 'number' && callsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {callsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* REPORTING */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Reporting
          </div>
          <div className="space-y-1">
            {!isSalesRep && (
              <button
                id="nav-analytics"
                onClick={() => onNavigate('analytics')}
                className={`hud-nav-item ${
                  currentTab === 'analytics' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Analytics</span>
                </div>
              </button>
            )}

            <button
              id="nav-revenue"
              onClick={() => onNavigate('revenue')}
              className={`hud-nav-item ${
                currentTab === 'revenue' ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <span>Revenue Forecast</span>
              </div>
            </button>
          </div>
        </div>

        {/* SETTINGS */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Settings
          </div>
          <div className="space-y-1">
            {!isSalesRep && (
              <button
                id="nav-agency-settings"
                onClick={() => onNavigate('agency_settings')}
                className={`hud-nav-item ${
                  currentTab === 'agency_settings' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Agency Settings</span>
                </div>
              </button>
            )}

            {!isSalesRep && (
              <button
                id="nav-integrations"
                onClick={() => onNavigate('integrations')}
                className={`hud-nav-item ${
                  currentTab === 'integrations' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-slate-400" />
                  <span>Integrations</span>
                </div>
              </button>
            )}

            {canAccessTeam && (
              <button
                id="nav-team"
                onClick={() => onNavigate('team')}
                className={`hud-nav-item ${
                  currentTab === 'team' ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Team</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Sales Rep Sophia Card */}
      <div className="p-3 border-t border-[var(--hud-border-base)] bg-[var(--hud-obsidian)]">
        <div
          onClick={() => onNavigate('ai_workforce')}
          className="p-2.5 bg-[var(--surface-container)] border border-[var(--hud-border-base)] flex items-center justify-between cursor-pointer hover:border-[var(--hud-border-bright)] transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-8 h-8 bg-[var(--primary-container)] flex items-center justify-center text-[#002110]">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary-container)] ring-2 ring-[var(--hud-obsidian)] animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>Sophia & Workforce</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-200 uppercase font-semibold">AI Ops</span>
              </div>
              <div className="text-[10px] text-indigo-300/80">
                Multi-Agent Ready
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400/60" />
        </div>
      </div>
    </aside>
  );
};
