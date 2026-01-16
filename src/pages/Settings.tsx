
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
        <div className="mx-auto max-w-2xl p-6 space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-networx-light">Settings</h1>
            <p className="text-networx-light/60 mt-2">Manage your account and preferences</p>
          </div>

          {/* Profile Card */}
          <Card className="networx-card">
            <CardHeader className="card-header">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-networx-primary" />
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription className="text-networx-light/60">
                    Update your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-networx-light" htmlFor="displayName">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-networx-light">
                    Identity Code
                  </label>
                  <div className="p-3 bg-[#1C2A41] rounded-lg text-sm font-mono text-networx-primary border border-[#232e48]">
                    {user?.identityCode || 'NX-XXXXX'}
                  </div>
                  <p className="text-xs text-networx-light/50">
                    Your unique identifier. Use this if you need support.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary mt-4"
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Discovery Card */}
          <Card className="networx-card">
            <CardHeader className="card-header">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-networx-primary" />
                <div>
                  <CardTitle>Discovery Preferences</CardTitle>
                  <CardDescription className="text-networx-light/60">
                    Manage interests for personalized offers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content">
              {!showInterestsEditor ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-[#1C2A41] rounded-lg border border-[#232e48]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-networx-light">Personalized Offers</span>
                    </div>
                    <Switch checked={interests.length > 0} disabled />
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm font-medium text-networx-light mb-3">Your interests:</p>
                    {interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => {
                          const category = interestCategories.find(cat => cat.id === interest);
                          return category ? (
                            <div key={interest} className="bg-[#1C2A41] text-networx-primary text-xs rounded-full px-3 py-1.5 flex items-center gap-1 border border-[#232e48]">
                              {category.icon}
                              {category.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-networx-light/50">No interests selected yet</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
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
            <CardHeader className="card-header">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-networx-primary" />
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription className="text-networx-light/60">
                    Manage your security settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content space-y-0">
              <div className="flex justify-between items-center p-3 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-networx-light/60" />
                  <span className="text-sm text-networx-light">Privacy settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40" />
              </div>
              
              <Separator className="bg-[#232e48]" />
              
              <div className="flex justify-between items-center p-3 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-networx-light/60" />
                  <span className="text-sm text-networx-light">Notification preferences</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40" />
              </div>
              
              <Separator className="bg-[#232e48]" />
              
              <div className="flex justify-between items-center p-3 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <VolumeX className="h-4 w-4 text-networx-light/60" />
                  <span className="text-sm text-networx-light">Call settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40" />
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="networx-card">
            <CardHeader className="card-header">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-networx-primary" />
                <CardTitle>Support & Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="card-content space-y-0">
              <div className="flex justify-between items-center p-3 hover:bg-[#1C2A41] rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-networx-light/60" />
                  <span className="text-sm text-networx-light">Help Center</span>
                </div>
                <ChevronRight className="h-4 w-4 text-networx-light/40" />
              </div>
              
              <Separator className="bg-[#232e48]" />
              
              <div className="flex justify-between items-center p-3 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Trash className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">Delete Account</span>
                </div>
                <ChevronRight className="h-4 w-4 text-red-400/40" />
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-[#232e48]">
              <Button 
                className="w-full btn-primary bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
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
