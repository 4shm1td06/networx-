import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealTimeMessages = (threadId: string) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!threadId) return;

    // Fetch existing messages
    supabase
      .from("dm_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .then(({ data }) => data && setMessages(data));

    // Subscribe to real-time inserts
    const channel = supabase
      .channel(`dm-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [threadId]);

  return { messages, setMessages };
};
