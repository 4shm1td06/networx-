import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

type ChatContextType = {
    latestCode: string | null;
    setLatestCode: (code: string | null) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [latestCode, setLatestCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestCode = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch("http://localhost:4012/api/get-latest-code", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: user.id }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Backend error:", result);
                    return;
                }

                setLatestCode(result.code || null);
            } catch (err) {
                console.error("Fetch latest code error:", err);
            }
        };

        fetchLatestCode();
    }, [user]);

    return (
        <ChatContext.Provider value={{ latestCode, setLatestCode }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatProvider");
    return context;
};
