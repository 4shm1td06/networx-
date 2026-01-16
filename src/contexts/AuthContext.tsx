import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name?: string;
  accessToken?: string;
  refreshToken?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Validate if a string is a valid UUID format
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Load user from localStorage on refresh
  useEffect(() => {
    const stored = localStorage.getItem("networx_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        // Validate that the user ID is a proper UUID
        // If not, clear the invalid data (old format)
        if (parsedUser.id && !isValidUUID(parsedUser.id)) {
          console.warn("Invalid user ID format in localStorage, clearing...");
          localStorage.removeItem("networx_user");
          localStorage.removeItem("networx_accessToken");
          localStorage.removeItem("networx_refreshToken");
          return;
        }
        setUserState(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("networx_user");
      }
    }
  }, []);

  const saveUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("networx_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("networx_user");
      localStorage.removeItem("networx_accessToken");
      localStorage.removeItem("networx_refreshToken");
    }
    setUserState(user);
  };

  const logout = () => {
    saveUser(null);
  };

  const getAuthHeader = () => {
    if (!user?.accessToken) return null;
    return { Authorization: `Bearer ${user.accessToken}` };
  };

  return (
    <AuthContext.Provider value={{ user, setUser: saveUser, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};