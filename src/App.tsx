// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ConnectionProvider } from "./contexts/ConnectionContext.tsx";
import { ChatProvider } from "./contexts/ChatContext";
import { UserProvider } from "./contexts/UserContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { useIsMobile } from "./hooks/use-mobile";

// ✅ Pages you’re keeping
import Login from "./pages/Login";
import Home from "./components/home/Home.tsx";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminPanel from "./components/AdminPanel";
import MobileLayout from "./components/MobileLayout";
import Discovery from "./pages/Discovery";

const queryClient = new QueryClient();

const App = () => {
    const isMobile = useIsMobile();

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

                                            <Route path="/login" element={<Login />} />

                                            {/* Protected routes */}
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

                                            {/* Redirect root to /login */}
                                            <Route path="/" element={<Navigate to="/login" />} />
                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </MobileLayout>
                                ) : (
                                    <Routes>
                                        {/* Only Login route (no signup/prodauth) */}
                                        <Route path="/login" element={<Login />} />

                                        {/* Protected routes */}
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

                                        {/* Redirect root to /login */}
                                        <Route path="/" element={<Navigate to="/login" />} />
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
