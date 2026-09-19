import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Clock,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  Filter,
  User,
  AlertTriangle,
} from 'lucide-react';
import { ClientMessage, ClientPortalUser, MessageCategory } from '../../types/clientPortal';
import { sendClientMessage } from '../../services/clientPortalService';

interface ClientMessagingViewProps {
  messages: ClientMessage[];
  currentUser: ClientPortalUser;
  businessName: string;
  onRefresh: () => void;
}

export const ClientMessagingView: React.FC<ClientMessagingViewProps> = ({
  messages,
  currentUser,
  businessName,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [composerCategory, setComposerCategory] = useState<MessageCategory>('General');
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [isSending, setIsSending] = useState(false);

  const categories: MessageCategory[] = [
    'General',
    'Service Question',
    'Support',
    'Strategy',
    'Billing',
    'Urgent',
  ];

  const filteredMessages = messages.filter((m) => {
    if (selectedCategory === 'All') return true;
    return m.category === selectedCategory;
  });

  const handleSend = () => {
    if (!messageContent.trim()) return;

    setIsSending(true);
    sendClientMessage(
      currentUser.client_id,
      currentUser,
      {
        category: composerCategory,
        subject: messageSubject || `${composerCategory} Inquiry`,
        content: messageContent,
      }
    );

    setMessageContent('');
    setMessageSubject('');
    setIsSending(false);
    onRefresh();
  };

  const getCategoryBadge = (cat: MessageCategory) => {
    switch (cat) {
      case 'Urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Urgent
          </span>
        );
      case 'Strategy':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Strategy
          </span>
        );
      case 'Billing':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Billing
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {cat}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct Client Channel
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Client Communication Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Direct communication between {businessName} and the Marketing Charm Agency account team.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMessages.map((msg) => {
            const isClient = msg.sender_type === 'client';
            return (
              <div
                key={msg.message_id}
                className={`flex gap-3 ${isClient ? 'justify-end' : 'justify-start'}`}
              >
                {!isClient && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 shadow-sm">
                    MCA
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl p-4 text-xs space-y-2 leading-relaxed ${
                    isClient
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-1.5">
                    <span className="font-bold">
                      {msg.sender_name} ({msg.sender_role})
                    </span>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(msg.category)}
                      <span className="text-[10px] opacity-75 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {msg.subject && msg.subject !== 'Message from Client' && (
                    <div className="font-semibold text-xs opacity-90">
                      Subject: {msg.subject}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {isClient && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0 mt-1">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No messages found in this category.</p>
            </div>
          )}
        </div>

        {/* Message Composer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Category:</span>
              <select
                value={composerCategory}
                onChange={(e) => setComposerCategory(e.target.value as MessageCategory)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="Subject (optional)..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-3 py-1 focus:outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
              placeholder={`Write your message to the agency account team... (Ctrl+Enter to send)`}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />

            <button
              onClick={handleSend}
              disabled={!messageContent.trim() || isSending}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
