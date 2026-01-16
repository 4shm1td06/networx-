// THEME-LOCKED VERSION (Grey + Red, no gradients)
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Check, CheckCheck, Paperclip, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/* ===================== DATE HELPERS ===================== */
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDayLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ===================== COMPONENT ===================== */
const ChatView = ({ onClose }: { onClose?: () => void } = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    activeThread,
    messages,
    sendMessage,
    typing,
    sendTyping,
    onlineUsers,
    loadOlder,
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
    profile_image: string | null;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  /* ===================== RESOLVE OTHER USER ID ===================== */
  const otherUserId = useMemo(() => {
    if (!activeThread || !user?.id) return null;
    return activeThread.user1 === user.id
      ? activeThread.user2
      : activeThread.user1;
  }, [activeThread, user?.id]);

  const isOnline = otherUserId
    ? onlineUsers.includes(otherUserId)
    : false;

  /* ===================== LOAD OTHER USER (THIS WAS MISSING) ===================== */
  useEffect(() => {
    if (!otherUserId) return;

    const loadUser = async () => {
      const { data, error } = await supabase
        .from("users") // ✅ YOUR TABLE
        .select("id, name, profile_image")
        .eq("id", otherUserId)
        .single();

      if (!error && data) {
        setOtherUser(data);
      }
    };

    loadUser();
  }, [otherUserId]);

  /* ===================== AUTOSCROLL ===================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* ===================== SEND ===================== */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !otherUserId) return;

    await sendMessage(messageInput);
    setMessageInput("");
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
    }, 700);
  };

  /* ===================== DATE GROUPING ===================== */
  const groupedMessages = useMemo(() => {
    const result: any[] = [];
    let lastDate: string | null = null;

    messages.forEach((m) => {
      const date = new Date(m.created_at).toDateString();
      if (date !== lastDate) {
        result.push({ type: "date", date: new Date(m.created_at) });
        lastDate = date;
      }
      result.push({ type: "msg", data: m });
    });

    return result;
  }, [messages]);

  /* ===================== UI ===================== */
  return (
    <div className="flex flex-col h-full bg-networx-dark text-networx-light">

      {/* HEADER */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#0B1120] to-[#162039] border-b border-[#232e48] h-14 sm:h-auto">
        {isMobile && (
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onClose ? onClose() : navigate(-1)}
            className="hover:bg-[#1C2A41] transition-colors h-10 w-10"
          >
            <ArrowLeft size={18} />
          </Button>
        )}

        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-[#232e48] flex-shrink-0">
          {otherUser?.profile_image ? (
            <AvatarImage src={otherUser.profile_image} />
          ) : (
            <AvatarFallback className="bg-networx-primary text-white font-semibold text-sm">
              {otherUser?.name?.[0] || "U"}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-networx-light truncate">
            {otherUser?.name || "Loading…"}
          </p>
          <p className={`text-xs font-medium ${isOnline ? 'text-green-400' : 'text-networx-light/60'}`}>
            {isOnline ? "● Online" : "Offline"}
          </p>
        </div>

        <Button 
          size="icon" 
          variant="ghost" 
          className="hover:bg-[#1C2A41] transition-colors h-10 w-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* MESSAGES */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4"
        onScroll={(e) => e.currentTarget.scrollTop === 0 && loadOlder()}
      >
        <AnimatePresence>
          {groupedMessages.map((item, i) =>
            item.type === "date" ? (
              <div key={i} className="message-date-separator">
                <div className="message-date-separator-inner text-xs sm:text-sm">
                  {getDayLabel(item.date)}
                </div>
              </div>
            ) : (
              <motion.div
                key={item.data.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${
                  item.data.sender_id === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div 
                  className={`max-w-xs sm:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm break-words ${
                    item.data.sender_id === user?.id
                      ? 'chat-bubble-sent'
                      : 'chat-bubble-received'
                  }`}
                >
                  {item.data.content}
                </div>
              </motion.div>
            )
          )}
          
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-1.5 p-2 sm:p-3 bg-[#1C2A41] rounded-xl">
                <div className="w-2 h-2 bg-networx-light/60 rounded-full animation-pulse"></div>
                <div className="w-2 h-2 bg-networx-light/60 rounded-full animation-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-networx-light/60 rounded-full animation-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-end gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-[#0F1628] border-t border-[#232e48]"
      >
        <Button 
          type="button"
          size="icon" 
          variant="ghost"
          className="hover:bg-[#1C2A41] transition-colors flex-shrink-0 h-10 w-10"
        >
          <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-networx-light/60" />
        </Button>

        <Input
          value={messageInput}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message…"
          className="input-field flex-1 h-10 sm:h-auto text-sm"
        />
        
        <Button 
          type="submit" 
          disabled={!messageInput.trim()}
          className="btn-primary flex-shrink-0 h-10 w-10 sm:h-10 sm:px-4 p-0"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatView;
