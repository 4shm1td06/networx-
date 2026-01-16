import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ConnectionContext = createContext<any>(null);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, getAuthHeader } = useAuth();
  const [currentCode, setCurrentCode] = useState<any>(null);
  const [activeFriend, setActiveFriend] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

 const API_URL = "https://networx-smtp.vercel.app/api"
// const API_URL = "http://localhost:4012/api"; // backend for code generation only

  // ---------------------------
  // Generate connection code
  // ---------------------------
  const generateConnectionCode = async () => {
  // 1️⃣ Ensure user is logged in
  if (!user?.id) {
    console.error("Cannot generate code: user not logged in");
    return null;
  }

  const ownerUserId = user.id; // Use the UUID from Supabase auth

  // 2️⃣ Make request to generate connection code
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    // If token is available, send it
    if (user.accessToken) {
      headers.Authorization = `Bearer ${user.accessToken}`;
    }

    const res = await fetch(`${API_URL}/generate-connection-code`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ownerUserId }),
      credentials: "include", // Include cookies if backend uses them
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error("Failed to generate code:", data);
      return null;
    }

    setCurrentCode(data);
    return data;
  } catch (err) {
    console.error("Error generating connection code:", err);
    return null;
  }
};


  const refreshCode = async () => {
    setCurrentCode(null);
    await generateConnectionCode();
  };

  // ---------------------------
  // Verify connection code (frontend-only)
  // ---------------------------
  const verifyConnectionCode = async (code: string) => {
    if (!user) return null;

    try {
      // 1️⃣ Fetch code (unverified & not expired)
      const { data: codeData, error: fetchError } = await supabase
        .from("connection_code")
        .select("*")
        .eq("code", code)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (fetchError || !codeData) {
        console.error("Invalid or expired code");
        return null;
      }

      if (codeData.owner_user_id === user.id) {
        console.error("Cannot use your own code");
        return null;
      }

      // 2️⃣ Mark code as verified
      const { error: updateError } = await supabase
        .from("connection_code")
        .update({ verified: true })
        .eq("id", codeData.id);

      if (updateError) {
        console.error("Failed to verify code:", updateError.message);
        return null;
      }

      // 3️⃣ Create mutual friendship
      const currentUserId = user.id;
      const { error: friendError } = await supabase.from("friends").insert([
        { user_id: codeData.owner_user_id, friend_id: currentUserId },
        { user_id: currentUserId, friend_id: codeData.owner_user_id },
      ]);

      if (friendError) {
        console.error("Failed to create friendship:", friendError.message);
        return null;
      }

      // 4️⃣ Set active friend
      setActiveFriend(codeData.owner_user_id);

      return codeData.owner_user_id;
    } catch (err) {
      console.error("Error verifying connection code:", err);
      return null;
    }
  };

  // ---------------------------
  // Start chat with a friend
  // ---------------------------
  const startChatWithFriend = (friendId: string) => {
    setActiveFriend(friendId);
  };

  // ---------------------------
  // Send message
  // ---------------------------
  const sendMessage = async (text: string) => {
    if (!activeFriend || !text || !user) return;

    try {
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: activeFriend,
        content: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender_id: user.id,
          receiver_id: activeFriend,
          content: text,
          created_at: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // ---------------------------
  // Real-time message subscription
  // ---------------------------
  useEffect(() => {
    if (!activeFriend) return;

    // Unsubscribe previous subscription
    if (subscription) {
      supabase.removeSubscription(subscription);
      setSubscription(null);
    }

    const sub = supabase
      .from(`messages:receiver_id=eq.${user.id}`)
      .on("INSERT", (payload) => {
        const msg = payload.new;
        if (msg.sender_id === activeFriend || msg.receiver_id === activeFriend) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    setSubscription(sub);

    // Cleanup on unmount or activeFriend change
    return () => {
      supabase.removeSubscription(sub);
      setSubscription(null);
    };
  }, [activeFriend, user?.id]);

  return (
    <ConnectionContext.Provider
      value={{
        currentCode,
        generateConnectionCode,
        refreshCode,
        verifyConnectionCode,
        activeFriend,
        messages,
        sendMessage,
        startChatWithFriend,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => useContext(ConnectionContext);
