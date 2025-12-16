import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Settings, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

import ChatView from '@/components/home/ChatView';
import UserHeader from '@/components/home/sidebar/UserHeader';
import CodeCard from '@/components/home/sidebar/CodeCard';
import ConnectionsList from '@/components/home/sidebar/ConnectionsList';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  const [overlayThreadId, setOverlayThreadId] = useState<string | null>(null);

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup';

  const isHome = location.pathname === '/home';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /* ================= DESKTOP ================= */
  if (!isMobile) {
    return <>{children}</>;
  }

  /* ================= MOBILE ================= */
  return (
    <div className="flex flex-col h-[100dvh] bg-networx-dark">

      {/* HEADER */}
      {!isAuthPage && (
        <header className="networx-gradient text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {overlayThreadId && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => setOverlayThreadId(null)}
              >
                <ArrowLeft size={22} />
              </Button>
            )}
            <h1 className="text-xl font-bold">NetworX</h1>
          </div>

          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <User size={22} />
                </Button>
              </SheetTrigger>

              <SheetContent className="bg-networx-dark border-l border-[#232e48]">
                <div className="flex flex-col h-full">
                  <div className="networx-gradient text-white p-4 -mx-6 -mt-6 mb-4">
                    <h2 className="text-lg font-bold">{user.displayName}</h2>
                    <p className="text-xs opacity-80">
                      ID: {user.identityCode || 'NX-XXXXX'}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    className="justify-start text-white"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings size={18} className="mr-2" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start text-networx-primary mt-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </header>
      )}

      {/* MAIN */}
      <main className="flex-1 relative overflow-hidden">

        {/* MOBILE HOME */}
        {isHome && (
          <>
            <UserHeader />
            <CodeCard />
            <ConnectionsList
              onThreadClick={(id) => setOverlayThreadId(id)}
            />

            {overlayThreadId && (
              <div className="absolute inset-0 z-50 bg-networx-dark">
                <ChatView connectionId={overlayThreadId} />
              </div>
            )}
          </>
        )}

        {/* NON-HOME ROUTES */}
        {!isHome && (
          <div className="h-full">
            {children}
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      {user && !isAuthPage && (
        <nav className="bg-[#0F1628] border-t border-[#232e48] p-2 flex justify-around">
          <Button
            variant="ghost"
            className={`flex flex-col items-center ${
              isHome ? 'text-networx-primary' : 'text-gray-400'
            }`}
            onClick={() => navigate('/home')}
          >
            <MessageCircle size={22} />
            <span className="text-xs mt-1">Chats</span>
          </Button>

          <Button
            variant="ghost"
            className={`flex flex-col items-center ${
              location.pathname === '/settings'
                ? 'text-networx-primary'
                : 'text-gray-400'
            }`}
            onClick={() => navigate('/settings')}
          >
            <Settings size={22} />
            <span className="text-xs mt-1">Settings</span>
          </Button>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;
