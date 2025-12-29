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

  useEffect(() => {
    setThreadsMeta(
      sidebarThreads.map((t) => ({
        ...t,
        lastMessage: undefined,
        unreadCount: 0,
      }))
    );
  }, [sidebarThreads]);

  useEffect(() => {
    if (!user || sidebarThreads.length === 0) return;

    const loadMeta = async () => {
      const updatedThreads: ThreadMeta[] = [];

      for (const thread of sidebarThreads) {
        const { data: lastMsg } = await supabase
          .from("dm_messages")
          .select("*")
          .eq("thread_id", thread.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

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

  if (!threadsMeta.length) {
    return <p className="text-networx-light/50 p-4">No chats yet</p>;
  }

  /* 🔥 FIXED PART */
  const handleThreadClick = (thread: ThreadMeta) => {
    setActiveThread({
      id: thread.id,
      participants: [
        {
          id: user!.id,
          name: user!.name,
          profile_image: user!.profile_image,
        },
        {
          id: thread.otherUserId,
          name: thread.name,
          profile_image: thread.profile,
        },
      ],
    });

    setThreadsMeta((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
    );

    onThreadClick?.(thread.id);
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
                {t.lastMessage?.content || "No messages yet"}
              </div>
            </div>
          </div>

          {t.unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {t.unreadCount}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ConnectionsList;
