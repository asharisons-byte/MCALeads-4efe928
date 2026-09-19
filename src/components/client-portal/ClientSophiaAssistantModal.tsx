import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  HelpCircle,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ClientPerformanceReport } from '../../types/clientPortal';
import { askSophiaAboutReport } from '../../services/clientPortalService';

interface ClientSophiaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  activeReport?: ClientPerformanceReport | null;
  onNavigateTab: (tab: string) => void;
}

export const ClientSophiaAssistantModal: React.FC<ClientSophiaAssistantModalProps> = ({
  isOpen,
  onClose,
  businessName,
  activeReport,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'sophia' | 'client'; text: string; time: string }>>([
    {
      sender: 'sophia',
      text: `Hello! I'm Sophia, your AI Client Concierge at Marketing Charm Agency. I can explain your monthly performance reports, walk you through active deliverable milestones, or help you submit a request to our operations team. What would you like to explore today?`,
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'What improved in our latest performance report?',
    'What key milestones are scheduled for this month?',
    'Why did our phone call volume increase?',
    'How do I submit a website update request?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      sender: 'client' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      if (activeReport) {
        const reply = await askSophiaAboutReport(activeReport, textToSend, businessName);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'sophia',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Safe general answer
        setTimeout(() => {
          let genericAnswer = `Thank you for asking! For ${businessName}, our primary focus is expanding your local service area coverage and driving emergency estimate inquiries. You can view all our completed work under the Deliverables tab or review verified metrics in the Reports tab.`;
          const lower = textToSend.toLowerCase();
          if (lower.includes('milestone') || lower.includes('work') || lower.includes('service')) {
            genericAnswer = `We have 3 active service streams running for ${businessName}: Website SEO & Technical Optimization, Google Local Services Ads, and our Automated Review Engine. You can inspect exact stage completion in the Services tab!`;
          } else if (lower.includes('request') || lower.includes('change') || lower.includes('update')) {
            genericAnswer = `You can submit any website change, campaign adjustment, or general question anytime in the Requests tab. Our operations team routes and reviews requests within 1 business day.`;
          } else if (lower.includes('meeting') || lower.includes('call') || lower.includes('schedule')) {
            genericAnswer = `You have an upcoming Monthly Strategy Review scheduled with your account team. You can check the agenda and Google Meet link in the Meetings tab!`;
          }

          setMessages((prev) => [
            ...prev,
            {
              sender: 'sophia',
              text: genericAnswer,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setIsLoading(false);
        }, 1000);
        return;
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'sophia',
          text: `I apologize, but I am currently unable to retrieve additional details. Your assigned account manager at Marketing Charm Agency is notified and will follow up with you directly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[640px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-900/50 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Sophia</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Client Concierge AI
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Marketing Charm Agency • Supporting {businessName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 px-6 py-2 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-900 dark:text-indigo-300">
          <span className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            Sophia operates strictly on your verified reports and active agency milestones.
          </span>
          {activeReport && (
            <span className="font-semibold bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded text-[10px]">
              Context: {activeReport.period}
            </span>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'sophia' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                  S
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'client'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`mt-1 text-[10px] ${
                    m.sender === 'client' ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400 italic py-2">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              Sophia is synthesizing client report insights...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick questions:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask Sophia about your reports, rankings, or next steps..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Navigation Footer */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800">
          <span>Need direct action?</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('reports');
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
            >
              <FileText className="w-3 h-3" /> All Reports
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateTab('requests');
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
            >
              <Layers className="w-3 h-3" /> Submit Request
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateTab('meetings');
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> View Meetings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
