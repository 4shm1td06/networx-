import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnection } from "@/contexts/ConnectionContext";
import UserHeader from "./sidebar/UserHeader";
import CodeCard from "./sidebar/CodeCard";
import SectionToggle from "./sidebar/SectionToggle";
import ConnectionsList from "./sidebar/ConnectionsList";
import CodeSettingsDialog from "./Dialogs/CodeSettingsDialog";
import ChatView from "./ChatView";
import ConnectDialog from "./Dialogs/ConnectDialog";

const Home = () => {
    const { user, handleLogout } = useAuth();
    const { connections, activeConnection, setActiveConnection } = useConnection();

    const [activeSection, setActiveSection] = useState("PERSONAL");
    const [showCodeSettings, setShowCodeSettings] = useState(false);
    const [showConnectDialog, setShowConnectDialog] = useState(false);

    return (
        <div className="flex h-screen bg-networx-dark">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col bg-[#0F1628] border-r border-[#232e48]">
                <UserHeader user={user} onLogout={handleLogout} onOpenSettings={() => setShowCodeSettings(true)} />
                <CodeCard />
                <SectionToggle activeSection={activeSection} setActiveSection={setActiveSection} />
                <ConnectionsList activeSection={activeSection} activeConnection={activeConnection} setActiveConnection={setActiveConnection} />
            </div>

            {/* Chat Area */}
            <div className="hidden md:block md:w-2/3 lg:w-3/4">
                {activeConnection ? (
                    <ChatView connection={activeConnection} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-networx-dark">
                        <div className="text-center">
                            <p className="mt-2 text-networx-light/70 max-w-md">Choose a conversation or share your connection code.</p>
                            <button onClick={() => setShowConnectDialog(true)}>New Connection</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CodeSettingsDialog show={showCodeSettings} setShow={setShowCodeSettings} />
            <ConnectDialog show={showConnectDialog} setShow={setShowConnectDialog} />
        </div>
    );
};

export default Home;
