import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = true, ...props }) => {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-6 relative overflow-hidden',
        hoverEffect && 'glass-panel-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
