
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
    <div className="container h-full">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-md p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="displayName">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Identity Code</label>
                  <div className="p-2 bg-gray-100 rounded text-sm font-mono">
                    {user?.identityCode || 'NX-XXXXX'}
                  </div>
                  <p className="text-xs text-gray-500">
                    This is your unique identifier on NetworX. It can be used if someone needs to report an issue.
                  </p>
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Discovery Preferences</CardTitle>
              <CardDescription>Manage your interests for the Discovery section</CardDescription>
            </CardHeader>
            <CardContent>
              {!showInterestsEditor ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Personalized Offers</span>
                    </div>
                    <Switch checked={interests.length > 0} />
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm mb-2">Your interests:</p>
                    {interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => {
                          const category = interestCategories.find(cat => cat.id === interest);
                          return category ? (
                            <div key={interest} className="bg-green-100 text-green-800 text-xs rounded-full px-3 py-1 flex items-center">
                              {category.icon}
                              {category.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No interests selected</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
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
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Privacy settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Notification preferences</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <VolumeX className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Call settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Help Center</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Trash className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">Delete Account</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
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
