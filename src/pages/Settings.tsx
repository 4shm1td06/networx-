
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  VolumeX, 
  Lock, 
  ChevronRight, 
  Trash, 
  Info, 
  LogOut, 
  User,
  CreditCard,
  Sparkles
} from 'lucide-react';
import InterestsSelector from '@/components/InterestsSelector';
import { interestCategories } from '@/pages/Discovery';

const Settings = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [showInterestsEditor, setShowInterestsEditor] = useState(false);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserProfile({ displayName });
      // Success notification could be added here
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateInterests = async (selectedInterests: string[]) => {
    setIsSubmitting(true);
    
    try {
      setInterests(selectedInterests);
      await updateUserProfile({ interests: selectedInterests });
      setShowInterestsEditor(false);
      // Success notification could be added here
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-networx-dark">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-2xl p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-networx-light">Settings</h1>
            <p className="text-sm sm:text-base text-networx-light/60 mt-2">Manage your account and preferences</p>
          </div>

          {/* Profile Card */}
          <Card className="networx-card">
            <CardHeader className="card-header p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-networx-primary flex-shrink-0" />
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-base">Profile</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-networx-light/60">
                    Update your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content p-3 sm:p-4">
              <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-networx-light" htmlFor="displayName">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field h-10"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-networx-light">
                    Identity Code
                  </label>
                  <div className="p-2 sm:p-3 bg-[#1C2A41] rounded-lg text-xs sm:text-sm font-mono text-networx-primary border border-[#232e48] break-all">
                    {user?.identityCode || 'NX-XXXXX'}
                  </div>
                  <p className="text-xs text-networx-light/50">
                    Your unique identifier. Use this if you need support.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary mt-3 sm:mt-4 h-10 sm:h-9 w-full"
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Discovery Card */}
          <Card className="networx-card">
            <CardHeader className="card-header p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-networx-primary flex-shrink-0" />
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-base">Discovery Preferences</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-networx-light/60">
                    Manage interests for personalized offers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content p-3 sm:p-4">
              {!showInterestsEditor ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-[#1C2A41] rounded-lg border border-[#232e48]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm font-medium text-networx-light">Personalized Offers</span>
                    </div>
                    <Switch checked={interests.length > 0} disabled />
                  </div>
                  
                  <div className="pt-1 sm:pt-2">
                    <p className="text-xs sm:text-sm font-medium text-networx-light mb-2">Your interests:</p>
                    {interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => {
                          const category = interestCategories.find(cat => cat.id === interest);
                          return category ? (
                            <div key={interest} className="bg-[#1C2A41] text-networx-primary text-xs rounded-full px-2 py-1 flex items-center gap-1 border border-[#232e48]">
                              {category.icon}
                              <span className="hidden sm:inline">{category.name}</span>
                              <span className="sm:hidden text-xs">{category.name.slice(0, 4)}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-networx-light/50">No interests selected yet</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 sm:mt-4 h-10 sm:h-9 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all text-sm"
                    onClick={() => setShowInterestsEditor(true)}
                  >
                    Update Interests
                  </Button>
                </div>
              ) : (
                <InterestsSelector 
                  selectedInterests={interests}
                  onChange={handleUpdateInterests}
                  showSkip={false}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Security Card */}
          <Card className="networx-card">
            <CardHeader className="card-header p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-networx-primary flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg sm:text-base">Security</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-networx-light/60">
                    Manage your security settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content space-y-0 p-0">
              <div className="flex justify-between items-center p-3 sm:p-4 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors active:bg-[#0f1823] h-12">
                <div className="flex items-center gap-3 min-w-0">
                  <Lock className="h-4 w-4 text-networx-light/60 flex-shrink-0" />
                  <span className="text-sm text-networx-light truncate">Privacy settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40 flex-shrink-0" />
              </div>
              
              <Separator className="bg-[#232e48]" />
              
              <div className="flex justify-between items-center p-3 sm:p-4 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors active:bg-[#0f1823] h-12">
                <div className="flex items-center gap-3 min-w-0">
                  <Bell className="h-4 w-4 text-networx-light/60 flex-shrink-0" />
                  <span className="text-sm text-networx-light truncate">Notification preferences</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40 flex-shrink-0" />
              </div>
              
              <Separator className="bg-[#232e48]" />
              
              <div className="flex justify-between items-center p-3 sm:p-4 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors active:bg-[#0f1823] h-12">
                <div className="flex items-center gap-3 min-w-0">
                  <VolumeX className="h-4 w-4 text-networx-light/60 flex-shrink-0" />
                  <span className="text-sm text-networx-light truncate">Call settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="networx-card">
            <CardHeader className="card-header p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-networx-primary flex-shrink-0" />
                <CardTitle className="text-lg sm:text-base">Support & Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="card-content space-y-0 p-0">
              <div className="flex justify-between items-center p-3 sm:p-4 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors active:bg-[#0f1823] h-12">
                <div className="flex items-center gap-3 min-w-0">
                  <Info className="h-4 w-4 text-networx-light/60 flex-shrink-0" />
                  <span className="text-sm text-networx-light truncate">Help Center</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40 flex-shrink-0" />
              </div>
              
              <Separator className="bg-[#232e48]" />
              
              <div className="flex justify-between items-center p-3 sm:p-4 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors active:bg-red-500/20 h-12">
                <div className="flex items-center gap-3 min-w-0">
                  <Trash className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400 truncate">Delete Account</span>
                </div>
                <ChevronRight className="h-4 w-4 text-red-400/40 flex-shrink-0" />
              </div>
            </CardContent>
            <CardFooter className="pt-3 sm:pt-4 border-t border-[#232e48] p-3 sm:p-4">
              <Button 
                className="w-full btn-primary bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 h-10 sm:h-9"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Settings;
