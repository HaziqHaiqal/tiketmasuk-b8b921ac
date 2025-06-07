
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({ children, className = '' }) => {
  return (
    <Card className={`touch-manipulation transition-all duration-200 active:scale-95 ${className}`}>
      {children}
    </Card>
  );
};

export default MobileOptimizedCard;
