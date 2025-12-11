import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ConnectionContext = createContext<any>(null);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [currentCode, setCurrentCode] = useState<any>(null);

  // Get UID from public table
  const getPublicUserUID = async (email: string) => {
    if (!email) return null;
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching UID from public table:", error);
      return null;
    }

    return data?.id ?? null;
  };

  const generateConnectionCode = async () => {
    if (!user || isLoading || !user.email) return null;

    const uid = await getPublicUserUID(user.email);
    if (!uid) {
      console.error("❌ No UID found in public users table");
      return null;
    }

    try {
      const res = await fetch("https://networx-smtp.vercel.app/api/generate-connection-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          expirationMinutes: 15,
          maxUses: 1,
          isPermanent: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Backend error:", data);
        return null;
      }


      setCurrentCode(data); // ✅ update currentCode so UI can read it
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const refreshCode = async () => {
    setCurrentCode(null);
    await generateConnectionCode();
  };

  const verifyConnectionCode = async (code: string) => {
    if (!user || isLoading || !user.email) return null;

    const uid = await getPublicUserUID(user.email);
    if (!uid) return null;

    try {
      const res = await fetch("https://networx-smtp.vercel.app/api/verify-connection-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, requestingUserId: uid }),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return (
    <ConnectionContext.Provider value={{ currentCode, generateConnectionCode, refreshCode, verifyConnectionCode }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => useContext(ConnectionContext);
