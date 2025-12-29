
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader } from 'lucide-react';
import { interestCategories } from '@/pages/Discovery';

interface InterestsSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

const InterestsSelector = ({ 
  selectedInterests, 
  onChange, 
  onSkip, 
  showSkip = true 
}: InterestsSelectorProps) => {
  const [interests, setInterests] = useState<string[]>(selectedInterests || []);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setInterests(interests.filter(id => id !== interestId));
    } else {
      setInterests([...interests, interestId]);
    }
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onChange(interests);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = async () => {
    if (onSkip) {
      setIsLoading(true);
      try {
        await onSkip();
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">What are you interested in?</h2>
      <p className="text-sm text-gray-500">
        Select categories to receive personalized offers in the Discovery section.
        No personal information is shared with partners.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {interestCategories.map(category => (
          <div 
            key={category.id}
            onClick={() => toggleInterest(category.id)}
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              interests.includes(category.id) 
                ? 'bg-green-100 border-green-300' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center flex-1">
              <div className={`text-${interests.includes(category.id) ? 'green' : 'gray'}-600`}>
                {category.icon}
              </div>
              <span className="ml-2 text-sm font-medium">{category.name}</span>
            </div>
            {interests.includes(category.id) && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-4 flex justify-between">
        {showSkip && onSkip && (
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-gray-500"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Skip
          </Button>
        )}
        <Button 
          onClick={handleSave}
          className={showSkip ? "ml-auto" : "w-full"}
          disabled={isLoading}
        >
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Interests
        </Button>
      </div>
    </div>
  );
};

export default InterestsSelector;
