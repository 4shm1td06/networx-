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
  const [showCodeCard, setShowCodeCard] = useState(false);

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
      {!isAuthPage && !overlayThreadId && (
        <header className="networx-gradient text-white px-4 py-3 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold">NetworX</h1>
          </div>

          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 active:bg-white/20 h-10 w-10">
                  <User size={24} />
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
                    className="justify-start text-white h-12 text-base hover:bg-white/10"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings size={20} className="mr-2" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start text-networx-primary h-12 text-base hover:bg-white/10 mt-2"
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
          <div className="flex flex-col h-full overflow-hidden">
            <UserHeader />
            
            {/* CODE CARD - COLLAPSIBLE */}
            {showCodeCard && (
              <div className="border-b border-[#232e48] bg-[#0F1628] p-3 flex-shrink-0">
                <CodeCard />
                <button
                  onClick={() => setShowCodeCard(false)}
                  className="w-full mt-2 py-2 text-xs text-networx-primary hover:text-networx-primary/80 font-medium"
                >
                  Hide Connection Code
                </button>
              </div>
            )}
            
            {/* SHOW CODE BUTTON - WHEN HIDDEN */}
            {!showCodeCard && (
              <button
                onClick={() => setShowCodeCard(true)}
                className="m-3 p-3 bg-networx-primary/20 hover:bg-networx-primary/30 text-networx-primary rounded-lg font-medium text-sm transition-colors active:bg-networx-primary/40 w-[calc(100%-24px)] flex-shrink-0"
              >
                Show Connection Code
              </button>
            )}
            
            {/* CONNECTIONS LIST - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <ConnectionsList
                onThreadClick={(id) => setOverlayThreadId(id)}
              />
            </div>

            {overlayThreadId && (
              <div className="absolute inset-0 z-50 bg-networx-dark">
                <ChatView onClose={() => setOverlayThreadId(null)} />
              </div>
            )}
          </div>
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
        <nav className="bg-[#0F1628] border-t border-[#232e48] p-2 flex justify-around gap-1 sticky bottom-0">
          <Button
            variant="ghost"
            className={`flex flex-col items-center h-16 flex-1 rounded-lg transition-all ${
              isHome ? 'text-networx-primary bg-networx-primary/10' : 'text-gray-400 hover:bg-white/5 active:bg-white/10'
            }`}
            onClick={() => navigate('/home')}
          >
            <MessageCircle size={24} />
            <span className="text-xs mt-1">Chats</span>
          </Button>

          <Button
            variant="ghost"
            className={`flex flex-col items-center h-16 flex-1 rounded-lg transition-all ${
              location.pathname === '/settings' ? 'text-networx-primary bg-networx-primary/10' : 'text-gray-400 hover:bg-white/5 active:bg-white/10'
            }`}
            onClick={() => navigate('/settings')}
          >
            <Settings size={24} />
            <span className="text-xs mt-1">Settings</span>
          </Button>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;
