import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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
  content: string;
  is_read: boolean;
  created_at: string;
};

export type SidebarThread = {
  id: string;
  otherUserId: string;
  name: string;
  profile: string | null;
};

type ChatContextType = {
  threads: DMThread[];
  sidebarThreads: SidebarThread[];
  activeThread: DMThread | null;
  messages: DMMessage[];
  setActiveThread: (t: DMThread) => void;
  sendMessage: (content: string) => Promise<void>;
  createOrGetThread: (otherUserId: string) => Promise<DMThread | null>;
};

/* ===================== CONTEXT ===================== */

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [threads, setThreads] = useState<DMThread[]>([]);
  const [sidebarThreads, setSidebarThreads] = useState<SidebarThread[]>([]);
  const [activeThread, setActiveThread] = useState<DMThread | null>(null);
  const [messages, setMessages] = useState<DMMessage[]>([]);

  /* ===================== FETCH THREADS ===================== */

  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("dm_threads")
      .select("*")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => setThreads(data || []));
  }, [user?.id]);

  /* ===================== BUILD SIDEBAR ===================== */

  useEffect(() => {
    if (!user?.id || threads.length === 0) {
      setSidebarThreads([]);
      return;
    }

    const loadSidebar = async () => {
      const otherUserIds = threads.map((t) =>
        t.user1 === user.id ? t.user2 : t.user1
      );

      const { data: users } = await supabase
        .from("users")
        .select("id, name, profile_image")
        .in("id", otherUserIds);

      const sidebar: SidebarThread[] = threads.map((t) => {
        const otherUserId = t.user1 === user.id ? t.user2 : t.user1;
        const profile = users?.find((u) => u.id === otherUserId);

        return {
          id: t.id,
          otherUserId,
          name: profile?.name || "Unknown",
          profile: profile?.profile_image || null,
        };
      });

      setSidebarThreads(sidebar);
    };

    loadSidebar();
  }, [threads, user?.id]);

  /* ===================== FETCH MESSAGES ===================== */

  useEffect(() => {
    if (!activeThread?.id) {
      setMessages([]);
      return;
    }

    supabase
      .from("dm_messages")
      .select("*")
      .eq("thread_id", activeThread.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [activeThread?.id]);

  /* ===================== REALTIME: MESSAGES ===================== */

  useEffect(() => {
    if (!activeThread?.id) return;

    const channel = supabase
      .channel(`dm-messages-${activeThread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `thread_id=eq.${activeThread.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as DMMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread?.id]);

  /* ===================== REALTIME: THREADS ===================== */

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("dm-threads")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_threads",
        },
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* ===================== CREATE OR GET THREAD ===================== */

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

  /* ===================== SEND MESSAGE ===================== */

  const sendMessage = async (content: string) => {
    if (!user?.id || !activeThread?.id || !content.trim()) return;

    const receiverId =
      activeThread.user1 === user.id
        ? activeThread.user2
        : activeThread.user1;

    await supabase.from("dm_messages").insert([
      {
        thread_id: activeThread.id,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      },
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        sidebarThreads,
        activeThread,
        messages,
        setActiveThread,
        sendMessage,
        createOrGetThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/* ===================== HOOK ===================== */

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
