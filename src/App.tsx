import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts/AuthContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";
import { ChatProvider } from "./contexts/ChatContext";
import { CallProvider } from "./contexts/CallContext";
import { UserProvider } from "./contexts/UserContext";

import ProtectedRoute from "./components/ProtectedRoute";
import { useIsMobile } from "./hooks/use-mobile";

import Login from "./pages/Login";
import Home from "./components/home/Home";
import Settings from "./pages/Settings";
import Discovery from "./pages/Discovery";
import AdminPanel from "./components/AdminPanel";
import NotFound from "./pages/NotFound";
import MobileLayout from "./components/MobileLayout";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;

  useEffect(() => {
    window.addEventListener("online", () =>
      console.log("✅ Back online")
    );
    window.addEventListener("offline", () =>
      console.warn("⚠️ Offline")
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConnectionProvider>
          <CallProvider>
            <ChatProvider>
              <UserProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />

                  <BrowserRouter>
                    {isMobile ? (
                      <MobileLayout>
                        <Routes>
                          <Route path="/login" element={<Login />} />

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

                          <Route
                            path="/"
                            element={
                              <Navigate to={isStandalone ? "/home" : "/login"} />
                            }
                          />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </MobileLayout>
                    ) : (
                      <Routes>
                        <Route path="/login" element={<Login />} />

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

                        <Route
                          path="/"
                          element={
                            <Navigate to={isStandalone ? "/home" : "/login"} />
                          }
                        />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    )}
                  </BrowserRouter>
                </TooltipProvider>
              </UserProvider>
            </ChatProvider>
          </CallProvider>
        </ConnectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
