import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ChatView from '@/components/home/ChatView';
import UserHeader from './home/sidebar/UserHeader';
import CodeCard from './home/sidebar/CodeCard';
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

  // Overlay chat state
  const [overlayThreadId, setOverlayThreadId] = useState<string | null>(null);

  // Auth page detection
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleBack = () => {
    if (overlayThreadId) {
      setOverlayThreadId(null);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-networx-dark">
      {/* HEADER */}
      {!isAuthPage && (
        <header className="networx-gradient text-white p-4 flex items-center justify-between relative z-10">
          <div className="flex items-center">
            {overlayThreadId || (location.pathname !== '/home' && location.pathname !== '/discovery') ? (
              <Button
                variant="ghost"
                className="mr-2 text-white hover:bg-[#1c2a41]/30 p-1"
                onClick={handleBack}
              >
                <ArrowLeft size={24} />
              </Button>
            ) : null}
            <h1 className="text-xl font-bold">NetworX</h1>
          </div>

          <div>
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-[#1c2a41]/30">
                    <User size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-networx-dark border-l border-[#232e48]">
                  <div className="flex flex-col h-full">
                    <div className="p-4 networx-gradient text-white mb-4 -mt-6 -mx-6">
                      <h2 className="text-xl font-bold">{user.displayName}</h2>
                      <p className="text-sm opacity-80">ID: {user.identityCode || 'NX-XXXXX'}</p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings size={18} className="mr-2" />
                        Settings
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-networx-primary hover:text-networx-accent"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden">
        {isMobile ? (
          <div className="flex flex-col h-full w-full">
            {/* User Header */}
            <UserHeader />
             {/* Code Card  */}
              <CodeCard />

            {/* DM LIST */}
            <ConnectionsList onThreadClick={(id) => setOverlayThreadId(id)} />
             
            {/* Chat overlay */}
            {overlayThreadId && (
              <div className="absolute top-0 left-0 w-full h-full z-50 bg-networx-dark transition-transform duration-300">

                {/* ChatView */}
                <ChatView threadId={overlayThreadId} />
              </div>
            )}
          </div>
        ) : (
          // Desktop: show children (Sidebar + ChatView)
          children
        )}
      </main>

      {/* BOTTOM NAV */}
      {user && !isAuthPage && (
        <nav className="bg-[#0F1628] border-t border-[#232e48] p-2 flex justify-around">
          <Button
            variant="ghost"
            className={`flex flex-col items-center ${
              location.pathname === '/home' ? 'text-networx-primary' : 'text-gray-400'
            }`}
            onClick={() => navigate('/home')}
          >
            <MessageCircle size={24} />
            <span className="text-xs mt-1">Chats</span>
          </Button>

          <Button
            variant="ghost"
            className={`flex flex-col items-center ${
              location.pathname === '/settings' ? 'text-networx-primary' : 'text-gray-400'
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
