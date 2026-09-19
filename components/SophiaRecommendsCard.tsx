import React from 'react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Lead, SophiaRecommendation } from '../types';

interface SophiaRecommendsCardProps {
  lead: Lead;
  recommendation: SophiaRecommendation;
  onExecuteAction: (action: string) => void;
  onRunAIAnalysis: () => void;
  isAnalyzing?: boolean;
}

export const SophiaRecommendsCard: React.FC<SophiaRecommendsCardProps> = ({
  lead,
  recommendation,
  onExecuteAction,
  onRunAIAnalysis,
  isAnalyzing = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPitch = () => {
    if (!recommendation.suggested_opening) return;
    navigator.clipboard.writeText(recommendation.suggested_opening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>High Priority</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span>Medium Priority</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
            <span>Low Priority</span>
          </span>
        );
    }
  };

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case 'CALL':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'AI_CALL':
        return <Bot className="w-4 h-4 text-purple-400" />;
      case 'SMS':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-400" />;
      default:
        return <Calendar className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div
      id="sophia-recommends-card"
      className="p-5 rounded-2xl bg-gradient-to-br from-[#121829] via-[#0e1424] to-[#0d1220] border border-indigo-500/30 shadow-xl relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header with Sophia Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Sophia Recommends</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </h3>
                {getPriorityBadge(recommendation.priority)}
              </div>
              <p className="text-[11px] text-slate-400">
                Ground-truth AI sales recommendation based on {lead.business_name}'s live data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Re-evaluate AI'}</span>
            </button>

            <button
              onClick={() => onExecuteAction(recommendation.action)}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
            >
              {getChannelIcon(recommendation.channel)}
              <span>Execute {recommendation.action}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Next Best Action Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Reason & Grounding */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Why this action now
            </span>
            <p className="text-slate-200 leading-relaxed">
              {recommendation.reason}
            </p>
          </div>

          {/* Recommended Next Step */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Recommended next step
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {recommendation.recommended_next_step}
            </p>
          </div>
        </div>

        {/* Suggested Opening Script */}
        {recommendation.suggested_opening && (
          <div className="p-3.5 rounded-xl bg-indigo-950/25 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Suggested Opening Script / Hook
              </span>
              <button
                onClick={handleCopyPitch}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono text-slate-200 leading-relaxed">
              "{recommendation.suggested_opening}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
