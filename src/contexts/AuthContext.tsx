import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;  // includes uid from auth table
  setUser: (user: any | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch UID from your auth table
  const fetchUserUID = async (email: string) => {
    const { data, error } = await supabase
      .from("auth")       // your auth table name
      .select("uid")      // UID column
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching UID:", error);
      return null;
    }
    return data?.uid ?? null;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        let currentUser = sessionData?.session?.user ?? null;

        if (!currentUser) {
          const { data: userData } = await supabase.auth.getUser();
          currentUser = userData?.user ?? null;
        }

        if (currentUser?.email) {
          const uid = await fetchUserUID(currentUser.email);
          if (uid) {
            setUser({ ...currentUser, uid }); // store UID from auth table
            console.log("Logged in user:", { ...currentUser, uid });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth load error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const updatedUser = session?.user ?? null;
      setUser(updatedUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
