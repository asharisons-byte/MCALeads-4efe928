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
} from 'lucide-react';

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
}) => {
  return (
    <aside
      id="mca-sidebar"
      className="w-64 h-screen bg-[#0d121f] border-r border-slate-800/80 flex flex-col flex-shrink-0 select-none z-20"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center font-extrabold text-white text-base tracking-wider shadow-lg shadow-indigo-600/20 border border-indigo-400/20">
            MCA
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Lead Agency Suite</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Marketing Charm Agency
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* WORKSPACE */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <div className="space-y-1">
            <button
              id="nav-command-center"
              onClick={() => onNavigate('command_center')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'command_center'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Command Center</span>
              </div>
            </button>

            <button
              id="nav-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              id="nav-leads"
              onClick={() => onNavigate('leads')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'leads'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'import_leads'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                <span>Import Leads</span>
              </div>
            </button>

            <button
              id="nav-lead-lists"
              onClick={() => onNavigate('lead_lists')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'lead_lists'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListFilter className="w-4 h-4 text-slate-400" />
                <span>Lead Lists</span>
              </div>
            </button>
          </div>
        </div>

        {/* AI WORKFORCE & AUTOMATION */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>AI Workforce</span>
          </div>
          <div className="space-y-1">
            <button
              id="nav-ai-workforce"
              onClick={() => onNavigate('ai_workforce')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'ai_workforce'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Agency AI Workforce</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] rounded font-bold bg-indigo-500/20 text-indigo-300">
                7 Agents
              </span>
            </button>

            <button
              id="nav-ai-approvals"
              onClick={() => onNavigate('ai_approvals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'ai_approvals'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Client Experience</span>
          </div>
          <div className="space-y-1">
            <button
              id="nav-client-portal"
              onClick={() => onNavigate('client_portal')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'client_portal'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'lead_intelligence'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Lead Intelligence & Scoring</span>
              </div>
            </button>

            <button
              id="nav-ai-analysis"
              onClick={() => onNavigate('ai_analysis')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'ai_analysis'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>AI Lead Analysis</span>
              </div>
            </button>

            <button
              id="nav-call-intelligence"
              onClick={() => onNavigate('call_intelligence')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'call_intelligence'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Call Intelligence & Objections</span>
              </div>
            </button>

            <button
              id="nav-lead-scoring"
              onClick={() => onNavigate('lead_scoring')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'lead_scoring'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Lead Scoring (0–100)</span>
              </div>
            </button>

            <button
              id="nav-opportunities"
              onClick={() => onNavigate('opportunities')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'opportunities'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'pipeline'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4 text-blue-400" />
                <span>Pipeline / Kanban</span>
              </div>
            </button>

            <button
              id="nav-audits-proposals"
              onClick={() => onNavigate('audits_proposals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'audits_proposals'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Audits & Proposals</span>
              </div>
            </button>

            <button
              id="nav-followups"
              onClick={() => onNavigate('follow_ups')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'follow_ups'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'email_outreach'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'sms'
                  ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'calls'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
            <button
              id="nav-analytics"
              onClick={() => onNavigate('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Analytics</span>
              </div>
            </button>

            <button
              id="nav-revenue"
              onClick={() => onNavigate('revenue')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'revenue'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
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
            <button
              id="nav-agency-settings"
              onClick={() => onNavigate('agency_settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'agency_settings'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Agency Settings</span>
              </div>
            </button>

            <button
              id="nav-integrations"
              onClick={() => onNavigate('integrations')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'integrations'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Puzzle className="w-4 h-4 text-slate-400" />
                <span>Integrations</span>
              </div>
            </button>

            <button
              id="nav-team"
              onClick={() => onNavigate('team')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'team'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Team</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* AI Sales Rep Sophia Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div
          onClick={() => onNavigate('ai_workforce')}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
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
