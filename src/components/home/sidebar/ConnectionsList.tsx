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
    return <p className="text-networx-light/50 p-4">No chats yet</p>;
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
    <ul className="overflow-y-auto flex-1">
      {threadsMeta.map((t) => (
        <li
          key={t.id}
          className={`p-3 cursor-pointer hover:bg-networx-primary/70 ${
            activeThread?.id === t.id ? "bg-networx-primary" : ""
          } flex items-center gap-3 justify-between`}
          onClick={() => handleThreadClick(t)}
        >
          <div className="flex items-center gap-3 flex-1">
            <img
              src={t.profile || "/placeholder.svg"}
              alt={t.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-gray-400 truncate">
                {t.lastMessage?.content ||
                  (t.lastMessage?.attachment_type
                    ? `[${t.lastMessage.attachment_type}]`
                    : "No messages yet")}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {t.lastMessage && (
              <span className="text-xs text-gray-400">
                {new Date(t.lastMessage.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            {t.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {t.unreadCount}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ConnectionsList;
