import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';

type ChatViewProps = {
  connectionId?: string;  // Existing thread ID
  otherUserId?: string;   // Needed for first message if no thread exists
  name?: string;          // Other user name for avatar fallback
  profile_image?: string | null;
};

const ChatView = ({ connectionId, otherUserId, name, profile_image }: ChatViewProps) => {
  const { user } = useAuth();
  const { activeThread, setActiveThread, messages, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load thread as activeThread
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // If no active thread, create or get it
    if (!activeThread?.id) {
      if (!otherUserId) {
        console.error("Cannot send message: no thread and no otherUserId");
        return;
      }

      const t = await sendMessage(messageInput, otherUserId);
      if (t) setActiveThread(t);
      setMessageInput('');
      return;
    }

    // Otherwise, send normally
    await sendMessage(messageInput);
    setMessageInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#e8f4ff]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <User size={40} className="text-green-500 mb-2" />
            <p className="text-center text-sm text-green-700">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    {profile_image ? (
                      <AvatarImage src={profile_image} />
                    ) : (
                      <AvatarFallback>{name?.[0]}</AvatarFallback>
                    )}
                  </Avatar>
                )}
                <div className="max-w-[75%]">
                  <div className={`p-3 rounded-lg shadow-sm ${isOwnMessage ? 'bg-green-100' : 'bg-white'}`}>
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white shadow-lg flex items-center space-x-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border-[#232e48] focus:border-networx-primary"
        />
        <Button type="submit" size="icon" disabled={!messageInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatView;
