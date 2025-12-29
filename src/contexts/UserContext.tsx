import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type User = {
  id: string;
  name?: string;
  email: string;
  profile_image?: string;
  token?: string; // backend token
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("networx_user");
    if (stored) setUserState(JSON.parse(stored));
  }, []);

  const setUser = (user: User | null) => {
    if (user) localStorage.setItem("networx_user", JSON.stringify(user));
    else localStorage.removeItem("networx_user");
    setUserState(user);
  };

  const logout = () => {
    setUser(null);
    window.location.href = "/login"; // redirect to login
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
