// ChatView.tsx
// THEME-LOCKED VERSION (Grey + Red, no gradients, consistent everywhere)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Check, CheckCheck, Paperclip} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
/* ===================== DATE HELPERS ===================== */
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDayLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/* ===================== TYPES ===================== */
type ChatViewProps = {
  connectionId?: string;
  otherUserId?: string;
  name?: string;
  profile_image?: string | null;
};

const ChatView = ({ connectionId, otherUserId, name, profile_image }: ChatViewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    activeThread,
    setActiveThread,
    messages,
    sendMessage,
    typing,
    sendTyping,
    onlineUsers,
    loadOlder,
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

  /* ===================== ENSURE THREAD ===================== */
  useEffect(() => {
    if (!activeThread && connectionId && user?.id && otherUserId) {
      setActiveThread({
        id: connectionId,
        user1: user.id,
        user2: otherUserId,
        created_at: new Date().toISOString(),
      });
    }
  }, [connectionId, activeThread, setActiveThread, user?.id, otherUserId]);

  /* ===================== AUTOSCROLL ===================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ===================== SEND ===================== */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    await sendMessage(messageInput, otherUserId);
    setMessageInput('');

    sendTyping(false);
    isTypingRef.current = false;
  };

  /* ===================== TYPING ===================== */
  const handleTyping = (val: string) => {
    setMessageInput(val);

    if (!isTypingRef.current) {
      sendTyping(true);
      isTypingRef.current = true;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendTyping(false);
      isTypingRef.current = false;
    }, 800);
  };

  /* ===================== DATE GROUPING ===================== */
  const groupedMessages = useMemo(() => {
    const result: any[] = [];
    let lastDate: string | null = null;

    messages.forEach((m) => {
      const date = new Date(m.created_at).toDateString();
      if (date !== lastDate) {
        result.push({ type: 'date', date: new Date(m.created_at) });
        lastDate = date;
      }
      result.push({ type: 'msg', data: m });
    });

    return result;
  }, [messages]);

  /* ===================== UI ===================== */
  return (
    <div className="flex flex-col h-full bg-[#0f1115] text-slate-200">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161922] border-b border-white/5">
       

        <Avatar className="h-9 w-9">
          {profile_image ? (
            <AvatarImage src={profile_image} />
          ) : (
            <AvatarFallback className="bg-red-600 text-white">
              {name?.[0] || 'U'}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-100">{name || 'User'}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
            <span className={isOnline ? 'text-green-500' : 'text-slate-500'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
        onScroll={(e) => e.currentTarget.scrollTop === 0 && loadOlder()}
      >
        <AnimatePresence>
          {groupedMessages.map((item, i) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${i}`} className="flex justify-center my-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#1c1f2a] text-slate-400 border border-white/5">
                    {getDayLabel(item.date)}
                  </span>
                </div>
              );
            }

            const m = item.data;
            const isOwn = m.sender_id === user?.id;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[72%] px-4 py-2 rounded-2xl text-sm leading-relaxed border shadow-sm
                    ${isOwn
                      ? 'bg-red-600 text-white border-red-700 rounded-br-sm'
                      : 'bg-[#2a2e38] text-slate-200 border-white/10 rounded-bl-sm'
                    }`}
                >
                  <p>{m.content}</p>

                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                    <span>
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isOwn && (m.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typing?.[activeThread?.id ?? ''] && (
          <p className="text-xs text-slate-400 italic px-2">typing…</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 px-4 py-3 bg-[#161922] border-t border-white/5"
      >
        <Button type="button" size="icon" variant="ghost" className="text-slate-400">
          <Paperclip size={16} />
        </Button>

        <Input
          value={messageInput}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Message…"
          className="flex-1 bg-[#0f1115] border border-white/10 rounded-full px-5 text-sm focus-visible:ring-2 focus-visible:ring-red-600"
        />

        <Button
          type="submit"
          size="icon"
          className="rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition"
          disabled={!messageInput.trim()}
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};

export default ChatView;