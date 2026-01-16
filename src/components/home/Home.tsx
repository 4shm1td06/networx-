import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnection } from "@/contexts/ConnectionContext";
import { useChat } from "@/contexts/ChatContext";
import { MessageCircle } from "lucide-react";

import UserHeader from "./sidebar/UserHeader";
import CodeCard from "./sidebar/CodeCard";
import SectionToggle from "./sidebar/SectionToggle";
import ConnectionsList from "./sidebar/ConnectionsList";

import CodeSettingsDialog from "./Dialogs/CodeSettingsDialog";
import ConnectDialog from "./Dialogs/ConnectDialog";
import ChatView from "./ChatView";

const Home = () => {
  const { user } = useAuth();
  const { hasConnections, loading } = useConnection();
  const { activeThread } = useChat();

  const [activeSection, setActiveSection] = useState("PERSONAL");
  const [showCodeSettings, setShowCodeSettings] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  // ⛔ Don’t render until connection state known
  if (loading) return null;

  return (
    <div className="flex h-screen bg-networx-dark overflow-hidden">
      {/* =======================
          SIDEBAR
      ======================= */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col bg-[#0F1628] border-r border-[#232e48] overflow-y-auto">
        <UserHeader
          onOpenSettings={() => setShowCodeSettings(true)}
        />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <CodeCard />

          <SectionToggle
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />

          <ConnectionsList />
        </div>
      </div>

      {/* =======================
          CHAT AREA
      ======================= */}
      <div className="hidden md:flex md:w-2/3 lg:w-3/4 flex-col bg-networx-dark">
        {activeThread ? (
          <ChatView />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="max-w-md">
              <div className="mb-6">
                <MessageCircle className="h-16 w-16 mx-auto text-networx-primary/30 mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-networx-light mb-2">
                No conversation selected
              </h3>
              <p className="text-networx-light/60 mb-8">
                Choose a conversation from your list or create a new connection to get started.
              </p>

              {/* ✅ Show connect ONLY if user has NO connections */}
              {!hasConnections && (
                <button
                  onClick={() => setShowConnectDialog(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 active:scale-95"
                >
                  Start a Connection
                </button>
              )}
            </div>
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
