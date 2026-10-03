import React from 'react';
import { Bot, Send, Mail, UserCheck, Sparkles, Trash2, Tag, Phone } from 'lucide-react';
import { PipelineStage } from '../types';

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
    <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-lg mb-4">
      <span className="text-xs font-bold text-indigo-300 font-mono">{selectedCount} selected</span>
      <div className="h-4 w-px bg-indigo-500/30" />
      <button onClick={onBulkAssign} className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
        <UserCheck className="w-3 h-3" /> Bulk Assign
      </button>
      <button onClick={onBulkMoveStage} className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
        Move Stage
      </button>
      <button onClick={onBulkTag} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
        <Tag className="w-3 h-3" /> Bulk Tag
      </button>
      <button onClick={onBulkEnrich} className="text-xs text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Enrich AI
      </button>
      <button onClick={onBulkAICall} className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1">
        <Bot className="w-3 h-3" /> AI Call
      </button>
      <button onClick={onBulkManualCall} className="text-xs text-rose-300 hover:text-rose-200 font-semibold flex items-center gap-1">
        <Phone className="w-3 h-3" /> Manual Call
      </button>
      <button onClick={onBulkSMS} className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1">
        <Send className="w-3 h-3" /> SMS
      </button>
      <button onClick={onBulkEmail} className="text-xs text-sky-300 hover:text-sky-200 font-semibold flex items-center gap-1">
        <Mail className="w-3 h-3" /> Email
      </button>
      <button onClick={onBulkDelete} className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
        Delete
      </button>
    </div>
  );
};
