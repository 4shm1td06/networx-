
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Tag, Coffee, Shirt, Car, Plane, Smartphone, BookOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Demo offers data
const demoOffers = [
  {
    id: '1',
    category: 'Food & Beverage',
    icon: <Coffee className="h-8 w-8 text-amber-500" />,
    title: 'Happy Hour at LocalCafe',
    description: '20% off on all beverages between 4-7PM today!',
    sender: 'LocalCafe',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571'
  },
  {
    id: '2',
    category: 'Clothing',
    icon: <Shirt className="h-8 w-8 text-blue-500" />,
    title: 'Weekend Flash Sale',
    description: 'Buy 2 Get 1 Free on all summer collection items',
    sender: 'Fashion Store',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68'
  },
  {
    id: '3',
    category: 'Automobile',
    icon: <Car className="h-8 w-8 text-red-500" />,
    title: 'Car Service Special',
    description: 'Free engine check with every full service this month',
    sender: 'Auto Service',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3'
  },
  {
    id: '4',
    category: 'Travel',
    icon: <Plane className="h-8 w-8 text-violet-500" />,
    title: 'Summer Getaway Deal',
    description: '30% off on beach resort bookings for next month',
    sender: 'Travel Agency',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    image: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d'
  },
  {
    id: '5',
    category: 'Electronics',
    icon: <Smartphone className="h-8 w-8 text-gray-700" />,
    title: 'New Smartphone Launch',
    description: 'Be the first to pre-order the latest model with special discounts',
    sender: 'Tech Store',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8'
  }
];

// Available interest categories
export const interestCategories = [
  { id: 'travel', name: 'Travel', icon: <Plane className="h-5 w-5 mr-2" /> },
  { id: 'food', name: 'Food & Beverage', icon: <Coffee className="h-5 w-5 mr-2" /> },
  { id: 'electronics', name: 'Electronics', icon: <Smartphone className="h-5 w-5 mr-2" /> },
  { id: 'automobile', name: 'Automobile', icon: <Car className="h-5 w-5 mr-2" /> },
  { id: 'clothing', name: 'Clothing', icon: <Shirt className="h-5 w-5 mr-2" /> },
  { id: 'education', name: 'Education', icon: <BookOpen className="h-5 w-5 mr-2" /> },
];

const Discovery = () => {
  const { user } = useAuth();
  const [offersEnabled, setOffersEnabled] = useState(true);
  
  // Format time display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-networx-dark overflow-hidden">
      {/* Header Section */}
      <div className="border-b border-[#232e48] p-6">
        <h1 className="text-3xl font-bold text-networx-light">Discovery</h1>
        <p className="text-networx-light/60 mt-2">Explore offers based on your interests</p>
      </div>

      {/* Offers settings card */}
      <div className="px-6 py-4">
        <Card className="networx-card border-[#232e48]">
          <CardHeader className="card-header pb-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg text-networx-light flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-networx-primary" />
                  Personalized Offers
                </CardTitle>
                <CardDescription className="text-networx-light/60 mt-1">
                  Get offers from categories you care about
                </CardDescription>
              </div>
              <Switch 
                checked={offersEnabled} 
                onCheckedChange={setOffersEnabled}
              />
            </div>
          </CardHeader>
          <CardContent className="card-content">
            <p className="text-sm text-networx-light/70 mb-4">
              We only send offers from the categories you've selected. Your privacy is important to us.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-networx-light">Your interests:</p>
              {user?.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(interest => {
                    const category = interestCategories.find(cat => cat.id === interest);
                    return category ? (
                      <Badge 
                        key={interest} 
                        className="bg-networx-primary/20 text-networx-primary border-networx-primary/30 px-3 py-1.5 flex items-center gap-1"
                      >
                        {category.icon}
                        {category.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-sm text-networx-light/50 p-3 bg-[#1C2A41] rounded-lg border border-[#232e48]">
                  No interests selected. Go to Settings to add your interests.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers list */}
      <div className="flex-1 overflow-auto">
        {offersEnabled && user?.interests && user.interests.length > 0 ? (
          <div className="space-y-0">
            {demoOffers.map((offer, index) => (
              <div 
                key={offer.id} 
                className="border-b border-[#232e48] hover:bg-[#121A2F] transition-colors duration-150 cursor-pointer group"
              >
                <div className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-lg bg-[#1C2A41] border border-[#232e48] flex items-center justify-center group-hover:border-networx-primary/30 transition-colors">
                      {offer.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-networx-light">
                          {offer.sender}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="inline-flex items-center bg-[#1C2A41] text-networx-light/70 border-[#232e48] text-xs mt-1"
                        >
                          <Tag size={12} className="mr-1" /> {offer.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-networx-light/50 flex-shrink-0 whitespace-nowrap">
                        {formatTime(offer.timestamp)}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-networx-light leading-snug">
                      {offer.title}
                    </h4>
                    <p className="text-sm text-networx-light/70 mt-1">
                      {offer.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : offersEnabled ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Tag className="h-16 w-16 text-networx-light/20 mb-4" />
            <h3 className="text-xl font-semibold text-networx-light">No interests yet</h3>
            <p className="text-sm text-networx-light/60 mt-2 max-w-xs">
              Select your interests in Settings to start receiving personalized offers
            </p>
            <Button 
              className="mt-6 btn-primary"
              onClick={() => window.location.href = '/settings'}
            >
              Go to Settings
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <CheckCircle2 className="h-16 w-16 text-networx-light/20 mb-4" />
            <h3 className="text-xl font-semibold text-networx-light">Discovery is off</h3>
            <p className="text-sm text-networx-light/60 mt-2 max-w-xs">
              Enable Discovery to see personalized offers from your favorite categories
            </p>
            <Button 
              className="mt-6 btn-primary"
              onClick={() => setOffersEnabled(true)}
            >
              Turn on Discovery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
