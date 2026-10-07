import React from 'react';
import { Bot, Send, Mail, UserCheck, Sparkles, Trash2, Tag, Phone, ArrowUpRight } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkAssign: () => void;
  onBulkMoveStage: () => void;
  onBulkEnrich: () => void;
  onBulkDelete: () => void;
  onBulkAICall: () => void;
  onBulkSMS: () => void;
  onBulkEmail: () => void;
  onBulkTag: () => void;
  onBulkManualCall: () => void;
}

interface ActionBtnProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: string;
  danger?: boolean;
}

const ActionBtn: React.FC<ActionBtnProps> = ({ onClick, icon, label, color = 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]', danger }) => (
  <button
    onClick={onClick}
    className={`
      text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-md transition-colors
      ${danger
        ? 'text-[var(--error)] hover:text-rose-300 hover:bg-rose-900/30'
        : `${color} hover:bg-slate-700/60`}
    `}
  >
    {icon}
    {label}
  </button>
);

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkAssign,
  onBulkMoveStage,
  onBulkEnrich,
  onBulkDelete,
  onBulkAICall,
  onBulkSMS,
  onBulkEmail,
  onBulkTag,
  onBulkManualCall,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 bg-indigo-950/60 border border-[rgba(139,92,246,0.2)] px-3 py-2 rounded-lg mb-3">
      {/* Selection count badge */}
      <span className="text-xs font-bold text-[var(--secondary)] font-mono bg-indigo-800/50 px-2 py-0.5 rounded-full mr-1">
        {selectedCount} selected
      </span>

      <div className="h-5 w-px bg-indigo-500/30 mx-0.5" />

      {/* Organization */}
      <ActionBtn onClick={onBulkAssign}    icon={<UserCheck   className="w-3 h-3" />} label="Assign"      color="text-[var(--tertiary-fixed-dim)] hover:text-sky-300" />
      <ActionBtn onClick={onBulkMoveStage} icon={<ArrowUpRight className="w-3 h-3" />} label="Advance Stage" color="text-[var(--hud-amber)] hover:text-amber-300" />
      <ActionBtn onClick={onBulkTag}       icon={<Tag         className="w-3 h-3" />} label="Tag"         color="text-teal-400 hover:text-teal-300" />
      <ActionBtn onClick={onBulkEnrich}    icon={<Sparkles    className="w-3 h-3" />} label="Enrich AI"   color="text-[var(--secondary)] hover:text-purple-200" />

      <div className="h-5 w-px bg-indigo-500/30 mx-0.5" />

      {/* Outreach */}
      <ActionBtn onClick={onBulkAICall}    icon={<Bot   className="w-3 h-3" />} label="AI Call"    color="text-[var(--secondary)] hover:text-indigo-200" />
      <ActionBtn onClick={onBulkManualCall} icon={<Phone className="w-3 h-3" />} label="Manual Call" color="text-rose-300 hover:text-rose-200" />
      <ActionBtn
        onClick={onBulkSMS}
        icon={<Send className="w-3 h-3" />}
        label="Bulk SMS"
        color="text-[var(--primary-fixed-dim)] hover:text-emerald-200"
      />
      <ActionBtn
        onClick={onBulkEmail}
        icon={<Mail className="w-3 h-3" />}
        label="Bulk Email"
        color="text-sky-300 hover:text-sky-200"
      />

      <div className="h-5 w-px bg-indigo-500/30 mx-0.5" />

      {/* Danger */}
      <ActionBtn onClick={onBulkDelete} icon={<Trash2 className="w-3 h-3" />} label="Delete" danger />

      {/* SMS/Email gap reminder */}
      <span className="ml-auto text-xs text-[var(--outline)] hidden xl:block">SMS &amp; Email send with 5-min gap</span>
    </div>
  );
};
