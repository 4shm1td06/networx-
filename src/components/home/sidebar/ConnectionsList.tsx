import React from "react";
import { useChat } from "@/contexts/ChatContext";

interface ConnectionsListProps {
  onThreadClick?: (threadId: string) => void;
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({ onThreadClick }) => {
  const { sidebarThreads, activeThread, setActiveThread } = useChat();

  if (!sidebarThreads || sidebarThreads.length === 0) {
    return <p className="text-networx-light/50 p-4">No chats yet</p>;
  }

  return (
    <ul className="overflow-y-auto flex-1">
      {sidebarThreads.map((t) => (
        <li
          key={t.id}
          className={`p-3 cursor-pointer hover:bg-networx-primary/70 ${
            activeThread?.id === t.id ? "bg-networx-primary" : ""
          } flex items-center gap-3`}
          onClick={() => {
            setActiveThread(t); // always set active thread
            if (onThreadClick) onThreadClick(t.id); // overlay for mobile
          }}
        >
          <img
            src={t.profile || "/placeholder.svg"}
            alt={t.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">{t.name}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ConnectionsList;
