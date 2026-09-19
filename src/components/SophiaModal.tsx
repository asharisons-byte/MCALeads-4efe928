import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  User,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { Lead } from '../types';
import { askSophia } from '../services/geminiService';

interface SophiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  activeLead?: Lead | null;
  onSelectLead?: (lead: Lead) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sophia';
  text: string;
  timestamp: string;
}

export const SophiaModal: React.FC<SophiaModalProps> = ({
  isOpen,
  onClose,
  leads,
  activeLead,
  onSelectLead,
}) => {
  const topContractors = leads.slice(0, 2).map((l) => `${l.business_name} (${l.lead_score}/100)`).join(' and ');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'sophia',
      text: activeLead
        ? `Hello! I'm Sophia, your AI Sales Representative for Marketing Charm Agency. I am ready to assist with ${activeLead.business_name} (CCB Score: ${activeLead.lead_score}/100 in ${activeLead.city}, OR). What outreach pitch or service strategy would you like to prepare?`
        : `Hello! I'm Sophia, your AI Sales Representative for Marketing Charm Agency. I've analyzed your ${leads.length} Oregon CCB contractor leads. Contractors like ${topContractors || 'David Lee Arias and Crooked River Defensible Space'} are top targets with high-value digital gaps. How can I assist you with outreach or pipeline intelligence?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare leads summary for context
      const leadsSummary = {
        total_leads: leads.length,
        hot_targets: leads.filter((l) => l.is_hot_target).length,
        potential_mrr: leads.reduce((acc, l) => acc + (l.estimated_retainer || 0), 0),
        top_leads: leads.slice(0, 4).map((l) => ({
          name: l.business_name,
          score: l.lead_score,
          niche: l.niche,
          gaps: l.gaps,
          retainer: l.estimated_retainer,
          service: l.recommended_service,
        })),
      };

      const reply = await askSophia(text, leadsSummary, activeLead);

      const sophiaMsg: ChatMessage = {
        id: `sophia-${Date.now()}`,
        sender: 'sophia',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, sophiaMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `sophia-${Date.now()}`,
        sender: 'sophia',
        text: `I experienced a brief network blip, but based on your Oregon CCB dataset: contractors like ${topContractors || 'David Lee Arias'} remain your highest-priority conversion opportunities.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Who should I call first today?',
    'Which contractors have no website?',
    'How many new CCB registrants need GBP setup?',
    'Summarize top Oregon contractor targets',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end sm:p-4">
      <div className="w-full sm:max-w-lg h-full sm:h-[88vh] bg-[#0c101d] border-l sm:border border-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Sophia</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  AI Sales Rep
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Marketing Charm Agency • Intelligence Hub
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Lead Context Bar */}
        {activeLead && (
          <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-indigo-300 font-semibold">Active Context:</span>
              <span className="text-white font-bold">{activeLead.business_name}</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">
              Score: {activeLead.lead_score}/100
            </span>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'sophia' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-300 text-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 rounded-bl-none flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Sophia is analyzing CRM records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 overflow-x-auto">
          <div className="flex gap-1.5">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 whitespace-nowrap border border-slate-700/60 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Sophia anything about leads or outreach pitch..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
