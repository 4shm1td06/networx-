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

  // ⛔ wait until connection state is ready
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
          <div className="flex items-center justify-center h-full text-slate-400">
            Select a chat to start messaging
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
