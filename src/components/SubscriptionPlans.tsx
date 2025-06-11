
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { useSubscriptionTiers } from '@/hooks/useSubscriptions';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionPlansProps {
  currentTier?: string;
  onSelectPlan: (tierId: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentTier, onSelectPlan }) => {
  const { data: tiers, isLoading } = useSubscriptionTiers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  if (!tiers) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => {
        const isCurrentTier = currentTier === tier.id;
        const isRecommended = tier.name === 'Silver';
        
        return (
          <Card key={tier.id} className={`relative ${isCurrentTier ? 'ring-2 ring-blue-500' : ''} ${isRecommended ? 'border-yellow-500' : ''}`}>
            {isRecommended && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            )}
            
            {isCurrentTier && (
              <Badge className="absolute top-4 right-4 bg-green-500">
                Current Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
              <div className="text-3xl font-bold">
                RM {tier.price}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {tier.max_promoted_events === 0 ? 'No promoted events' : `${tier.max_promoted_events} promoted events`}
                </div>
                
                {tier.features.basic_listing && (
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Basic event listing
                  </div>
                )}
                
                {tier.features.featured_placement && (
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Featured placement
                  </div>
                )}
                
                {tier.features.priority_support && (
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Priority support
                  </div>
                )}
                
                {tier.features.analytics && (
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Advanced analytics
                  </div>
                )}
                
                {tier.promotion_duration_days > 0 && (
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    {tier.promotion_duration_days} days promotion
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full" 
                variant={isCurrentTier ? "secondary" : (isRecommended ? "default" : "outline")}
                onClick={() => onSelectPlan(tier.id)}
                disabled={isCurrentTier}
              >
                {isCurrentTier ? 'Current Plan' : `Choose ${tier.name}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionPlans;
