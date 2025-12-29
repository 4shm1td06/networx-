import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notifyNewMessage } from "@/utils/notify";
import { useUser } from "@/contexts/UserContext";

export const useRealTimeMessages = (threadId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  //get logged-in user
  const {user}= useUser();
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
        
        (payload) => {
          const newMessage = payload.new;

          setMessages((prev) => [...prev, newMessage]);

          // 🔔 STEP 3 — show notification ONLY for incoming message
          if (newMessage.sender_id !== user?.id) {
            new Notification("New message", {
              body: newMessage.content,
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [threadId]);

  return { messages, setMessages };
};