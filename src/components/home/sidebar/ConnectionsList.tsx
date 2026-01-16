import React, { useEffect, useState } from "react";
import { useChat, DMMessage, SidebarThread } from "@/contexts/ChatContext";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionsListProps {
  onThreadClick?: (threadId: string) => void;
}

interface ThreadMeta extends SidebarThread {
  lastMessage?: DMMessage;
  unreadCount: number;
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({ onThreadClick }) => {
  const { sidebarThreads, activeThread, setActiveThread, user } = useChat();
  const [threadsMeta, setThreadsMeta] = useState<ThreadMeta[]>([]);

  // Initialize threadsMeta with unread=0 and lastMessage undefined
  useEffect(() => {
    setThreadsMeta(
      sidebarThreads.map((t) => ({
        ...t,
        lastMessage: undefined,
        unreadCount: 0,
      }))
    );
  }, [sidebarThreads]);

  // Fetch lastMessage + unreadCount for each thread
  useEffect(() => {
    if (!user || sidebarThreads.length === 0) return;

    const loadMeta = async () => {
      const updatedThreads: ThreadMeta[] = [];

      for (const thread of sidebarThreads) {
        // Last message
        const { data: lastMsg } = await supabase
          .from("dm_messages")
          .select("*")
          .eq("thread_id", thread.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Unread count
        const { count: unreadCount } = await supabase
          .from("dm_messages")
          .select("*", { count: "exact", head: true })
          .eq("thread_id", thread.id)
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        updatedThreads.push({
          ...thread,
          lastMessage: lastMsg || undefined,
          unreadCount: unreadCount || 0,
        });
      }

      setThreadsMeta(updatedThreads);
    };

    loadMeta();
  }, [sidebarThreads, user?.id]);

  // Real-time updates for incoming messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("dm-messages-global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages" },
        (payload) => {
          const msg = payload.new as DMMessage;

          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            setThreadsMeta((prev) =>
              prev.map((t) =>
                t.id === msg.thread_id
                  ? {
                      ...t,
                      lastMessage: msg,
                      unreadCount:
                        t.unreadCount + (msg.receiver_id === user.id ? 1 : 0),
                    }
                  : t
              )
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  if (!sidebarThreads || sidebarThreads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4 sm:p-6">
        <div>
          <p className="text-sm text-networx-light/60 mb-2">No connections yet</p>
          <p className="text-xs text-networx-light/40">Share your code to connect with friends</p>
        </div>
      </div>
    );
  }

  const handleThreadClick = (thread: ThreadMeta) => {
    setActiveThread({
      id: thread.id,
      user1: user?.id || "",
      user2: thread.otherUserId,
      created_at: "" // placeholder; actual created_at is in threads
    });
    // Reset unread count
    setThreadsMeta((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
    );
    if (onThreadClick) onThreadClick(thread.id);
  };

  return (
    <div className="overflow-y-auto flex-1">
      {threadsMeta.map((t) => (
        <div
          key={t.id}
          className={`connection-item ${activeThread?.id === t.id ? 'connection-item-active' : 'hover:bg-[#0F1628] active:bg-[#0F1628]'} min-h-[64px] sm:min-h-auto`}
          onClick={() => handleThreadClick(t)}
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 p-3 sm:p-4">
            <img
              src={t.profile || "/placeholder.svg"}
              alt={t.name}
              className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0 border border-[#232e48]"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-networx-light truncate">
                {t.name}
              </div>
              <div className="text-xs text-networx-light/60 truncate">
                {t.lastMessage?.content ||
                  (t.lastMessage?.attachment_type
                    ? `[${t.lastMessage.attachment_type}]`
                    : "No messages yet")}
              </div>
            </div>
          
            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
              {t.lastMessage && (
                <span className="text-xs text-networx-light/50">
                  {new Date(t.lastMessage.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {t.unreadCount > 0 && (
                <span className="bg-networx-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  {t.unreadCount > 9 ? '9+' : t.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConnectionsList;
