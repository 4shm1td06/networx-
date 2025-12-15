import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Check, CheckCheck, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ChatViewProps = {
  connectionId?: string;
  otherUserId?: string;
  name?: string;
  profile_image?: string | null;
};

const ChatView = ({ connectionId, otherUserId, name, profile_image }: ChatViewProps) => {
  const { user } = useAuth();
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<any>(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---------------- SET ACTIVE THREAD ---------------- */
  useEffect(() => {
    if (!activeThread && connectionId) {
      setActiveThread({
        id: connectionId,
        user1: user?.id || '',
        user2: otherUserId || '',
        created_at: new Date().toISOString(),
      });
    }
  }, [connectionId, activeThread, setActiveThread, user?.id, otherUserId]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!activeThread?.id && otherUserId) {
      const t = await sendMessage(messageInput, otherUserId);
      if (t) setActiveThread(t);
    } else {
      await sendMessage(messageInput);
    }

    sendTyping(false);
    setMessageInput('');
  };

  /* ---------------- TYPING HANDLER ---------------- */
  const handleTyping = (val: string) => {
    setMessageInput(val);
    sendTyping(true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 p-4 bg-white shadow-sm">
        <Avatar>
          {profile_image ? (
            <AvatarImage src={profile_image} />
          ) : (
            <AvatarFallback>{name?.[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-semibold">{name || 'User'}</p>
          <p className={`text-xs ${onlineUsers.includes(otherUserId) ? 'text-green-600' : 'text-slate-400'}`}>
            {onlineUsers.includes(otherUserId) ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
        onScroll={(e) => {
          if (e.currentTarget.scrollTop === 0) loadOlder();
        }}
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <User size={42} className="text-green-500 mb-2" />
              <p className="text-sm text-green-700">Start your conversation</p>
            </motion.div>
          )}

          {messages.map((m) => {
            const isOwn = m.sender_id === user?.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    isOwn
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white rounded-bl-sm'
                  }`}
                >
                  {/* CONTENT */}
                  {m.content && <p className="text-sm">{m.content}</p>}

                  {/* ATTACHMENT (READY) */}
                  {m.attachment_type === 'image' && (
                    <img src={m.attachment_url} className="mt-2 rounded-lg max-w-xs" />
                  )}

                  {m.attachment_type === 'file' && (
                    <a
                      href={m.attachment_url}
                      target="_blank"
                      className="underline text-sm"
                    >
                      Download file
                    </a>
                  )}

                  {/* META */}
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isOwn ? 'text-white/70' : 'text-slate-400'
                    }`}
                  >
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

        {typing && <p className="text-xs text-green-600 px-2">Typing…</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white flex items-center gap-2 shadow-lg"
      >
        <Button type="button" size="icon" variant="ghost">
          <Paperclip size={16} />
        </Button>
        <Input
          value={messageInput}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message…"
          className="rounded-full px-4"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={!messageInput.trim()}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};

export default ChatView;