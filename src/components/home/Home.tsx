import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnection } from "@/contexts/ConnectionContext";
import { useChat } from "@/contexts/ChatContext";

import UserHeader from "./sidebar/UserHeader";
import CodeCard from "./sidebar/CodeCard";
import SectionToggle from "./sidebar/SectionToggle";
import ConnectionsList from "./sidebar/ConnectionsList";

import CodeSettingsDialog from "./Dialogs/CodeSettingsDialog";
import ConnectDialog from "./Dialogs/ConnectDialog";
import ChatView from "./ChatView";

const Home = () => {
  const { user, handleLogout } = useAuth();
  const { hasConnections, loading } = useConnection();
  const { activeThread } = useChat();

  const [activeSection, setActiveSection] = useState("PERSONAL");
  const [showCodeSettings, setShowCodeSettings] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  // ⛔ Don’t render until connection state known
  if (loading) return null;

  return (
    <div className="flex h-screen bg-networx-dark">
      {/* =======================
          SIDEBAR
      ======================= */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col bg-[#0F1628] border-r border-[#232e48]">
        <UserHeader
          user={user}
          onLogout={handleLogout}
          onOpenSettings={() => setShowCodeSettings(true)}
        />

        <CodeCard />

        <SectionToggle
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <ConnectionsList />
      </div>

      {/* =======================
          CHAT AREA
      ======================= */}
      <div className="hidden md:block md:w-2/3 lg:w-3/4">
        {activeThread ? (
          <ChatView />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-networx-dark text-center">
            <p className="mt-2 text-networx-light/70 max-w-md">
              Choose a conversation or share your connection code.
            </p>

            {/* ✅ Show connect ONLY if user has NO connections */}
            {!hasConnections && (
              <button
                onClick={() => setShowConnectDialog(true)}
                className="mt-4 px-4 py-2 bg-primary rounded"
              >
                New Connection
              </button>
            )}
          </div>
        )}
      </div>

      {/* =======================
          DIALOGS
      ======================= */}
      <CodeSettingsDialog
        show={showCodeSettings}
        setShow={setShowCodeSettings}
      />

      {/* ❌ Dialog will NEVER reopen after first connection */}
      {!hasConnections && (
        <ConnectDialog
          show={showConnectDialog}
          setShow={setShowConnectDialog}
        />
      )}
    </div>
  );
};

export default Home;
