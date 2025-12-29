// src/App.tsx
import { useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";
import { ChatProvider } from "./contexts/ChatContext";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useIsMobile } from "./hooks/use-mobile";

// ✅ PWA Service Worker
import { registerSW } from "virtual:pwa-register";

// ✅ Pages
import Login from "./pages/Login";
import Home from "./components/home/Home";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminPanel from "./components/AdminPanel";
import MobileLayout from "./components/MobileLayout";
import Discovery from "./pages/Discovery";

// =======================
// 🔥 PWA REGISTRATION
// =======================
registerSW({
  immediate: true,

  onOfflineReady() {
    console.log("✅ PWA ready to work offline");
  },

  onNeedRefresh() {
    console.log("🔄 New version available — refresh to update");
  },
});

// =======================
// REACT QUERY CLIENT
// =======================
const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  // ✅ Detect standalone PWA mode
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;

  // ✅ Online / Offline detection
  useEffect(() => {
    const handleOffline = () => {
      console.warn("⚠️ You are offline");
    };

    const handleOnline = () => {
      console.log("✅ Back online");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  // 🔔 ask permission
  useEffect(() => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}, []);



  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConnectionProvider>
          <ChatProvider>
            <UserProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />

                <BrowserRouter>
                  {isMobile ? (
                    <MobileLayout>
                      <Routes>
                        {/* Public */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected */}
                        <Route
                          path="/home"
                          element={
                            <ProtectedRoute>
                              <Home />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/discovery"
                          element={
                            <ProtectedRoute>
                              <Discovery />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute>
                              <AdminPanel />
                            </ProtectedRoute>
                          }
                        />

                        {/* Root behavior */}
                        <Route
                          path="/"
                          element={
                            isStandalone ? (
                              <Navigate to="/home" />
                            ) : (
                              <Navigate to="/login" />
                            )
                          }
                        />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </MobileLayout>
                  ) : (
                    <Routes>
                      {/* Public */}
                      <Route path="/login" element={<Login />} />

                      {/* Protected */}
                      <Route
                        path="/home"
                        element={
                          <ProtectedRoute>
                            <Home />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/discovery"
                        element={
                          <ProtectedRoute>
                            <Discovery />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminPanel />
                          </ProtectedRoute>
                        }
                      />

                      {/* Root behavior */}
                      <Route
                        path="/"
                        element={
                          isStandalone ? (
                            <Navigate to="/home" />
                          ) : (
                            <Navigate to="/login" />
                          )
                        }
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  )}
                </BrowserRouter>
              </TooltipProvider>
            </UserProvider>
          </ChatProvider>
        </ConnectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
