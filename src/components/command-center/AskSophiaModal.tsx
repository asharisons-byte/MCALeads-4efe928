import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  PhoneCall,
  DollarSign,
  Compass,
  Calendar,
} from 'lucide-react';
import { Lead, Client, Proposal, FollowUpTask } from '../../types';
import { askSophiaExecutiveQuestion } from '../../services/executiveIntelligenceService';

interface AskSophiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  clients: Client[];
  proposals: Proposal[];
  followUps: FollowUpTask[];
  onOpenLead?: (leadId: string) => void;
  onStartCall?: (leadId: string) => void;
}

const PRESET_QUESTIONS = [
  { icon: Compass, label: 'What should I focus on today?' },
  { icon: PhoneCall, label: 'Which leads should I call first?' },
  { icon: TrendingUp, label: 'Why is our pipeline slowing down?' },
  { icon: DollarSign, label: 'Which service makes the most money?' },
  { icon: AlertTriangle, label: 'Which client is most at risk?' },
  { icon: Sparkles, label: 'What industry should we target next?' },
  { icon: Calendar, label: 'What happened this week?' },
];

export const AskSophiaModal: React.FC<AskSophiaModalProps> = ({
  isOpen,
  onClose,
  leads,
  clients,
  proposals,
  followUps,
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'user' | 'sophia'; text: string; time: string; source?: string }[]
  >([
    {
      sender: 'sophia',
      text: `Good day, Ahmed. I am monitoring all Marketing Charm Agency operations, confirmed retainers, and sales pipelines in real time. Ask me any strategic question about our revenue, clients, hot targets, or operational priorities.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q || isLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: q, time: userTime }]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await askSophiaExecutiveQuestion(q, {
        leads,
        clients,
        proposals,
        followUps,
      });

      const sophiaTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'sophia',
          text: response.answer,
          time: sophiaTime,
          source: response.source === 'gemini' ? 'Google Gemini Executive AI' : 'Deterministic Agency Engine',
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'sophia',
          text: 'I encountered an issue processing that query. Marketing Charm Agency pipeline data remains secure and accessible.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Ask Sophia About My Agency</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Executive Intelligence
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Grounded strictly in Marketing Charm Agency CRM, Telemetry & Retainers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Prompt Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3 text-indigo-500" /> Presets:
          </span>
          {PRESET_QUESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleAsk(item.label)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 shadow-2xs font-medium"
              >
                <Icon className="w-3 h-3 text-indigo-600" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'sophia' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs whitespace-pre-line'
                }`}
              >
                <div className="font-sans">{m.text}</div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[10px] opacity-70">
                  <span>{m.time}</span>
                  {m.source && (
                    <span className="text-indigo-600 font-medium">Grounded • {m.source}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Sophia is analyzing live agency data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask Sophia anything: revenue, renewals, hot targets, bottleneck analysis..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
