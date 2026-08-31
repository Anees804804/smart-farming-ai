import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, RotateCcw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import type { ChatMessage, ChatResponse } from '../types';

const SESSION_STORAGE_KEY = 'smart-farming-session-id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export default function AiAssistant() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('chat.welcomeMessage'), timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post<ChatResponse>('/assistant/chat', {
        message: trimmed,
        sessionId: getSessionId(),
        language,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: res.data.data.reply,
        timestamp: res.data.data.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const msg = err.message || t('chat.error');
      setError(msg);

      // Show specific not-configured message
      if (msg.includes('not configured') || msg.includes('AI_NOT_CONFIGURED')) {
        setError(t('chat.notConfigured'));
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: t('chat.welcomeMessage'), timestamp: new Date().toISOString() },
    ]);
    setError(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('chat.title')}
            </h1>
            <p className="text-sm text-gray-500">{t('chat.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} />
          {t('chat.clearChat')}
        </button>
      </div>

      {/* Chat Container */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Messages */}
        <div className="h-[55vh] min-h-[350px] max-h-[600px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-farm-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {t('chat.sending')}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border-t border-red-100 px-4 py-2.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('chat.placeholder')}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-farm-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-primary !py-2.5 !px-4 !text-sm disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {t('chat.disclaimer')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
