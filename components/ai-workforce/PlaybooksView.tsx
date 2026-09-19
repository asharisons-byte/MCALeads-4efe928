import React, { useState } from 'react';
import {
  AIPlaybook,
} from '../../types/aiWorkforce';
import { Lead } from '../../types';
import {
  getAIPlaybooks,
  executeAgentTask,
} from '../../services/aiWorkforceService';
import {
  BookOpen,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Filter,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface PlaybooksViewProps {
  leads: Lead[];
  onPlaybookExecuted: () => void;
  onNavigateToApprovals?: () => void;
}

export const PlaybooksView: React.FC<PlaybooksViewProps> = ({
  leads,
  onPlaybookExecuted,
  onNavigateToApprovals,
}) => {
  const [playbooks, setPlaybooks] = useState<AIPlaybook[]>(getAIPlaybooks());
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [runningPlaybook, setRunningPlaybook] = useState<AIPlaybook | null>(null);
  const [targetLeadId, setTargetLeadId] = useState<string>(leads[0]?.lead_id || '');
  const [isExecuting, setIsExecuting] = useState(false);

  const filteredPlaybooks = playbooks.filter(
    (p) => selectedIndustry === 'All' || p.industry === selectedIndustry
  );

  const handleLaunchPlaybook = async () => {
    if (!runningPlaybook) return;
    const lead = leads.find((l) => l.lead_id === targetLeadId) || leads[0];
    if (!lead) return;

    setIsExecuting(true);
    try {
      await executeAgentTask(
        runningPlaybook.target_agent,
        'Outreach Generation',
        {
          type: 'lead',
          id: lead.lead_id,
          name: lead.business_name,
          data: lead,
        },
        {
          playbookId: runningPlaybook.id,
          priority: 'High',
        }
      );
      setRunningPlaybook(null);
      onPlaybookExecuted();
    } catch (e) {
      console.error('Playbook execution failed:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">MCA Agency AI Playbooks</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Pre-configured, domain-specialized execution playbooks. Each playbook codifies tested high-ticket contractor
            angles, required inputs, output schemas, and strict human approval rules.
          </p>
        </div>

        {/* Industry Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-400">Industry:</span>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Playbooks ({playbooks.length})</option>
            <option value="Plumbing">Plumbing</option>
            <option value="HVAC">HVAC</option>
            <option value="Roofing">Roofing</option>
            <option value="Dental">Dental</option>
            <option value="Legal">Legal</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Restaurant">Restaurant</option>
          </select>
        </div>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaybooks.map((pb) => (
          <div
            key={pb.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {pb.industry}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    Agent: <strong className="text-white">{pb.target_agent}</strong>
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Playbook" />
              </div>

              <h3 className="font-bold text-white text-sm tracking-tight">{pb.name}</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                {pb.objective}
              </p>

              {/* Rules & Requirements */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Operational Rules
                  </span>
                  <ul className="space-y-1">
                    {pb.rules.map((rule, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Governance Gate
                  </span>
                  <div className="flex items-center space-x-1.5 text-[11px] text-amber-300 bg-amber-950/20 border border-amber-500/20 px-2 py-1 rounded">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{pb.approval_requirements[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setRunningPlaybook(pb);
                  setTargetLeadId(leads[0]?.lead_id || '');
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute on Lead</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Run Playbook Modal */}
      {runningPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full text-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Execute Playbook</h3>
                <p className="text-xs text-slate-400">{runningPlaybook.name}</p>
              </div>
              <button onClick={() => setRunningPlaybook(null)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Select Target Contractor Lead
                </label>
                <select
                  value={targetLeadId}
                  onChange={(e) => setTargetLeadId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {leads.map((l) => (
                    <option key={l.lead_id} value={l.lead_id}>
                      {l.business_name} ({l.niche || 'Contractor'} - {l.city || 'OR'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1">
                <div className="text-slate-300 font-medium">Assigned Agent: {runningPlaybook.target_agent.toUpperCase()}</div>
                <div className="text-slate-400 text-[11px]">
                  Output will be processed according to playbook rules and queued in the Approval Center.
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end space-x-2">
              <button
                onClick={() => setRunningPlaybook(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchPlaybook}
                disabled={isExecuting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                {isExecuting ? (
                  <span>Executing Playbook...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Playbook</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
