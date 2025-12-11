import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const UserHeader = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const { user, logout } = useUser();

  const displayName = user?.name ?? "NetworX User";
  const avatarLetter = (user?.name ?? user?.email ?? "U").charAt(0);
  const userId = user?.id ?? "N/A";

  return (
    <div className="flex items-center justify-between p-4 border-b border-[#232e48] bg-gradient-to-r from-[#0B1120] to-[#162039] text-white">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 bg-[#1C2A41] border-2 border-[#232e48]">
          {user?.profile_image ? (
            <AvatarImage src={user.profile_image} alt={displayName} />
          ) : (
            <AvatarFallback>{avatarLetter}</AvatarFallback>
          )}
        </Avatar>
        <div className="ml-3">
          <h2 className="text-lg font-semibold">{displayName}</h2>
          <p className="text-xs text-networx-light/70">ID: {userId}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Open Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default UserHeader;
