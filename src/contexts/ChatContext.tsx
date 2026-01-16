import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { notifyNewMessage } from "@/utils/notifications";

/* ===================== TYPES ===================== */

export type DMThread = {
  id: string;
  user1: string;
  user2: string;
  created_at: string;
};

export type DMMessage = {
  id: number;
  thread_id: string;
  sender_id: string;
  receiver_id: string;
  content?: string;
  attachment_url?: string;
  attachment_type?: "image" | "file";
  is_read: boolean;
  created_at: string;
};

export type SidebarThread = {
  id: string;
  otherUserId: string;
  name: string;
  profile: string | null;
  lastMessage?: DMMessage;
  unreadCount?: number;
};

type ChatContextType = {
  user: { id: string } | null;
  threads: DMThread[];
  sidebarThreads: SidebarThread[];
  activeThread: DMThread | null;
  messages: DMMessage[];
  typing: boolean;
  onlineUsers: string[];
  setActiveThread: (t: DMThread) => void;
  sendMessage: (
    content?: string,
    attachment?: { url: string; type: "image" | "file" }
  ) => Promise<DMMessage | undefined>;
  sendTyping: (state: boolean) => void;
  createOrGetThread: (otherUserId: string) => Promise<DMThread | null>;
  loadOlder: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [threads, setThreads] = useState<DMThread[]>([]);
  const [sidebarThreads, setSidebarThreads] = useState<SidebarThread[]>([]);
  const [activeThread, setActiveThread] = useState<DMThread | null>(null);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [oldestMessage, setOldestMessage] = useState<string | null>(null);

   useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
 }, []);
 
  /* ===================== MARK AS READ ===================== */
  const markThreadAsRead = async (threadId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("dm_messages")
      .update({ is_read: true })
      .eq("thread_id", threadId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Mark read failed:", error);
      return;
    }

    // Sidebar update
    setSidebarThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, unreadCount: 0 } : t
      )
    );

    // Message list update
    setMessages((prev) =>
      prev.map((m) =>
        m.receiver_id === user.id ? { ...m, is_read: true } : m
      )
    );
  };

  /* ===================== FETCH THREADS ===================== */
  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("dm_threads")
      .select("*")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          console.error("Failed to fetch threads:", error);
          return;
        }
        
        if (!data) return;

        setThreads(data);

        const otherUserIds = data.map((t) =>
          t.user1 === user.id ? t.user2 : t.user1
        );

        if (otherUserIds.length === 0) {
          setSidebarThreads([]);
          return;
        }

        const { data: users } = await supabase
          .from("users")
          .select("id, name, profile_image")
          .in("id", otherUserIds);

        const sidebar: SidebarThread[] = [];

        for (const t of data) {
          const otherUserId = t.user1 === user.id ? t.user2 : t.user1;
          const profile = users?.find((u) => u.id === otherUserId);

          const { data: lastMsg } = await supabase
            .from("dm_messages")
            .select("*")
            .eq("thread_id", t.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from("dm_messages")
            .select("*", { count: "exact", head: true })
            .eq("thread_id", t.id)
            .eq("receiver_id", user.id)
            .eq("is_read", false);

          sidebar.push({
            id: t.id,
            otherUserId,
            name: profile?.name || "Unknown",
            profile: profile?.profile_image || null,
            lastMessage: lastMsg || undefined,
            unreadCount: count || 0,
          });
        }

        setSidebarThreads(sidebar);
      })
      .catch((err) => {
        console.error("Error fetching threads:", err);
      });
  }, [user?.id]);

  /* ===================== REALTIME: THREADS ===================== */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("dm-threads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_threads" },
        (payload) => {
          const t = payload.new as DMThread;
          if (t.user1 === user.id || t.user2 === user.id) {
            setThreads((prev) =>
              prev.some((x) => x.id === t.id) ? prev : [t, ...prev]
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  /* ===================== REALTIME: MESSAGES ===================== */
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("dm-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages" },
        async (payload) => {
          const msg = payload.new as DMMessage;

          // Get sender info for notification
          const isIncomingMessage = msg.receiver_id === user.id;
          let senderName = "Unknown";
          let senderAvatar: string | undefined;

          if (isIncomingMessage) {
            try {
              const { data: sender } = await supabase
                .from("users")
                .select("name, profile_image")
                .eq("id", msg.sender_id)
                .single();

              if (sender) {
                senderName = sender.name || "Unknown";
                senderAvatar = sender.profile_image || undefined;
              }
            } catch (err) {
              console.error("Error fetching sender info:", err);
            }
          }

          setSidebarThreads((prev) =>
            prev.map((t) =>
              t.id === msg.thread_id
                ? {
                    ...t,
                    lastMessage: msg,
                    unreadCount:
                      msg.receiver_id === user.id
                        ? (t.unreadCount || 0) + 1
                        : t.unreadCount,
                  }
                : t
            )
          );

          if (activeThread?.id === msg.thread_id) {
            setMessages((prev) => [...prev, msg]);
            if (msg.receiver_id === user.id) {
              markThreadAsRead(msg.thread_id);
            }
          } else if (isIncomingMessage) {
            // Send notification only if not in active thread
            await notifyNewMessage(
              senderName,
              msg.content || "Sent a message",
              senderAvatar,
              msg.thread_id
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "dm_messages" },
        (payload) => {
          const updated = payload.new as DMMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id, activeThread?.id]);

  /* ===================== ACTIVE THREAD ===================== */
  useEffect(() => {
    if (!activeThread?.id) {
      setMessages([]);
      setOldestMessage(null);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("dm_messages")
        .select("*")
        .eq("thread_id", activeThread.id)
        .order("created_at", { ascending: true })
        .limit(20);

      if (data) {
        setMessages(data);
        if (data.length > 0) setOldestMessage(data[0].created_at);
        markThreadAsRead(activeThread.id);
      }
    };

    fetchMessages();
  }, [activeThread?.id]);

  /* ===================== SEND MESSAGE ===================== */
  const sendMessage = async (
    content?: string,
    attachment?: { url: string; type: "image" | "file" }
  ) => {
    if (!user?.id || !activeThread?.id) return;

    const receiverId =
      activeThread.user1 === user.id
        ? activeThread.user2
        : activeThread.user1;

    const { data } = await supabase
      .from("dm_messages")
      .insert([
        {
          thread_id: activeThread.id,
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          attachment_url: attachment?.url,
          attachment_type: attachment?.type,
        },
      ])
      .select()
      .single();

    return data as DMMessage;
  };

  /* ===================== CREATE / GET THREAD ===================== */
  const createOrGetThread = async (otherUserId: string) => {
    if (!user?.id) return null;

    const { data } = await supabase
      .from("dm_threads")
      .select("*")
      .or(
        `(user1.eq.${user.id},user2.eq.${otherUserId}),(user1.eq.${otherUserId},user2.eq.${user.id})`
      )
      .maybeSingle();

    if (data) {
      setActiveThread(data);
      return data;
    }

    const { data: created } = await supabase
      .from("dm_threads")
      .insert([{ user1: user.id, user2: otherUserId }])
      .select()
      .single();

    setActiveThread(created);
    setThreads((prev) => [created, ...prev]);
    return created;
  };

  /* ===================== LOAD OLDER ===================== */
  const loadOlder = async () => {
    if (!activeThread?.id || !oldestMessage) return;

    const { data } = await supabase
      .from("dm_messages")
      .select("*")
      .eq("thread_id", activeThread.id)
      .lt("created_at", oldestMessage)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      setMessages((prev) => [...data.reverse(), ...prev]);
      setOldestMessage(data[data.length - 1].created_at);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        threads,
        sidebarThreads,
        activeThread,
        messages,
        typing,
        onlineUsers,
        setActiveThread,
        sendMessage,
        sendTyping: () => {},
        createOrGetThread,
        loadOlder,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
