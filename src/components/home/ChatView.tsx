import React, { useEffect, useRef, useState } from "react";
import { Phone, Video, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useCall } from "@/contexts/CallContext";

const ChatView = () => {
  const { user } = useAuth();
  const { activeThread, messages, sendMessage, typing } = useChat();

  const {
    startVoiceCall,
    startVideoCall,
    acceptCall,
    incomingCall,
    localStream,
    remoteStream,
    endCall,
  } = useCall();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  /* attach streams */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeThread || !user) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = activeThread.participants?.find(
    (p: any) => p.id !== user.id
  );

  if (!otherUser) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full relative bg-[#0f1115] text-slate-200">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161922]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white">
            {otherUser.name?.[0] ?? "U"}
          </div>
          <div>
            <p className="text-sm font-medium">{otherUser.name}</p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => startVoiceCall(otherUser.id)}
            className="p-2 rounded hover:bg-white/10"
          >
            <Phone size={18} />
          </button>
          <button
            onClick={() => startVideoCall(otherUser.id)}
            className="p-2 rounded hover:bg-white/10"
          >
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.sender_id === user.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender_id === user.id
                    ? "bg-red-600 text-white rounded-br-sm"
                    : "bg-[#2a2e38] rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <p className="text-xs text-slate-400 italic">typing…</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-[#161922]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message…"
          className="flex-1 bg-[#0f1115] px-4 py-2 rounded-full outline-none"
        />
        <button
          type="submit"
          className="p-2 rounded-full bg-red-600 text-white"
          disabled={!input.trim()}
        >
          <Send size={16} />
        </button>
      </form>

      {/* INCOMING CALL POPUP */}
      {incomingCall && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0F1729] p-6 rounded-xl text-center space-y-4">
            <p className="text-lg font-semibold">
              Incoming {incomingCall.video ? "Video" : "Voice"} Call
            </p>
            <button
              onClick={acceptCall}
              className="px-6 py-2 bg-green-600 rounded text-white"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL POPUP (THIS WAS MISSING) */}
      {(localStream || remoteStream) && (
        <div className="absolute bottom-20 right-4 bg-black rounded-xl p-3 z-40 w-64 space-y-2">
          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-32 rounded bg-black"
            />
          )}

          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-32 rounded bg-black"
            />
          )}

          <audio ref={remoteAudioRef} autoPlay />

          <button
            onClick={endCall}
            className="w-full py-2 bg-red-600 rounded text-white"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatView;
