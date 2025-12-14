import React, { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ConnectDialog({ show, setShow }: { show: boolean; setShow: (v: boolean) => void }) {
  const [code, setCode] = useState("");
  const { createOrGetThread } = useChat();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Verify code on backend (you already have verifyCode)
      const res = await fetch("http://localhost:4012/api/verify-connection-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, requestingUserId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");

      // Create or get DM thread
      await createOrGetThread(data.connectedUserId);

      setShow(false);
    } catch (err: any) {
      alert(err.message || "Failed to connect");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-networx-dark p-6 rounded-lg flex flex-col gap-4 w-80"
      >
        <h2 className="text-lg font-semibold">Connect</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="p-2 rounded border border-gray-600 bg-[#0F1628]"
        />
        <button className="bg-primary text-white py-2 rounded">Connect</button>
      </form>
    </div>
  );
}
