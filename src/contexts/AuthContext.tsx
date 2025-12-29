import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id?: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on refresh
  useEffect(() => {
    const stored = localStorage.getItem("networx_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const saveUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("networx_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("networx_user");
    }
    setUser(user);
  };

  const logout = () => {
    saveUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
