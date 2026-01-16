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
  const { user: authUser, logout } = useAuth(); 
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://networx-smtp.vercel.app/api";
  // const API_URL = "http://localhost:4012/api"; // backend for code generation only

  // =========================
  // Fetch user by email
  // =========================
  useEffect(() => {
    if (!authUser?.email) {
      console.warn("[UserHeader] No email in auth context");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, profile_image")
        .eq("email", authUser.email)
        .single();

      if (error) {
        console.error("[UserHeader] DB error:", error);
      } else {
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [authUser?.email]);

  // =========================
  // Logout
  // =========================
  const handleLogout = async () => {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include", // 🔥 REQUIRED
    });
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    logout(); // clear context
    window.location.href = "/login";
  }
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
    <div className="px-4 py-5 border-b border-[#232e48] bg-gradient-to-r from-[#0B1120] to-[#162039]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12 border-2 border-networx-primary/30 bg-[#1C2A41] flex-shrink-0">
            {user.profile_image ? (
              <AvatarImage src={user.profile_image} />
            ) : (
              <AvatarFallback className="bg-networx-primary/20 text-networx-primary font-semibold">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-networx-light truncate">
              {user.name ?? "User"}
            </h2>
            <p className="text-xs text-networx-light/60 truncate">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenSettings}
            className="hover:bg-[#1C2A41] transition-colors h-9 w-9"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="hover:bg-red-500/10 transition-colors h-9 w-9"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
