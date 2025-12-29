import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type UserData = {
  id: string;
  email: string;
  name: string | null;
  profile_image: string | null;
};

export default function UserHeader({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  const { user: authUser, logout } = useAuth(); // backend-controlled
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch user by email
  // =========================
  useEffect(() => {
    if (!authUser?.email) {
      console.warn("[UserHeader] No email in auth context");
      setLoading(false);
      return;
    }

    console.log("[UserHeader] Fetching profile for:", authUser.email);

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, profile_image")
        .eq("email", authUser.email)
        .single();

      if (error) {
        console.error("[UserHeader] DB error:", error);
      } else {
        console.log("[UserHeader] User loaded:", data);
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [authUser?.email]);

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    logout(); // clears context + localStorage
    window.location.href = "/login";
  };

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading user…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-sm text-red-400">
        User not found
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-[#232e48] bg-gradient-to-r from-[#0B1120] to-[#162039] text-white">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 border-2 border-[#232e48] bg-[#1C2A41]">
          {user.profile_image ? (
            <AvatarImage src={user.profile_image} />
          ) : (
            <AvatarFallback>
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="ml-3">
          <h2 className="text-lg font-semibold">
            {user.name ?? "User"}
          </h2>
          <p className="text-xs text-white/70">
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
