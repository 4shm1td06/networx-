
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
    <div className="flex flex-col h-full bg-networx-dark">
      {/* Offers settings card */}
      <div className="p-4">
        <Card className="networx-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-networx-light">Industry/Perks</CardTitle>
              <Switch 
                checked={offersEnabled} 
                onCheckedChange={setOffersEnabled} 
              />
            </div>
            <CardDescription className="text-networx-light/70">
              Curated offers based on your interests
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-networx-light/80 mb-2">
              <p>You will receive offers from the categories you've selected. No personal information is shared with partners.</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {user?.interests?.map(interest => (
                <Badge key={interest} variant="outline" className="bg-[#1C2A41] text-networx-light border-[#232e48] px-3 py-1 flex items-center">
                  {interestCategories.find(cat => cat.id === interest)?.icon}
                  {interestCategories.find(cat => cat.id === interest)?.name}
                </Badge>
              )) || (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs bg-[#1C2A41] text-networx-light border-[#232e48] hover:bg-[#283a56]"
                  onClick={() => window.location.href = '/settings'}
                >
                  Select interests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers list */}
      <div className="flex-1 overflow-auto">
        {offersEnabled ? (
          demoOffers.map((offer) => (
            <div key={offer.id} className="p-4 border-b border-[#232e48]">
              <div className="flex items-start">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={offer.image} />
                  <AvatarFallback className="bg-[#1C2A41] border border-[#232e48] text-networx-light">
                    {offer.icon}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-networx-light">{offer.sender}</h3>
                      <Badge variant="outline" className="inline-flex items-center bg-[#1C2A41] text-networx-light border-[#232e48] text-xs mt-0.5">
                        <Tag size={12} className="mr-1" /> {offer.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-networx-light/50">{formatTime(offer.timestamp)}</span>
                  </div>
                  <h4 className="font-medium mt-2 text-networx-light">{offer.title}</h4>
                  <p className="text-sm text-networx-light mt-1">{offer.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <Tag className="h-12 w-12 text-[#2A3A57] mb-4" />
            <h3 className="text-xl font-medium text-networx-light">Discovery is turned off</h3>
            <p className="text-sm text-networx-light/70 mt-2 max-w-xs">
              Enable Discovery to see personalized offers based on your interests
            </p>
            <Button 
              variant="outline" 
              className="mt-4 bg-[#1C2A41] text-networx-light border-[#232e48] hover:bg-[#283a56]"
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
