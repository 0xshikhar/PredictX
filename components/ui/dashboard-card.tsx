import React from 'react';
import { GlassPanel } from './glass-panel';
import { cn } from '@/lib/utils';

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  accent?: 'primary' | 'secondary' | 'accent' | 'none';
  loading?: boolean;
}

/**
 * DashboardCard - A specialized Glass Panel with a header for dashboard sections
 */
export const DashboardCard = ({
  title,
  icon,
  action,
  children,
  className,
  contentClassName,
  accent = 'primary',
  loading = false,
  ...props
}: DashboardCardProps) => {
  const accentClass = {
    'border-t-primary-500': accent === 'primary',
    'border-t-secondary-500': accent === 'secondary',
    'border-t-accent-500': accent === 'accent',
    'border-t-transparent': accent === 'none',
  };

  return (
    <GlassPanel 
      className={cn('flex flex-col h-full overflow-hidden', className)} 
      bordered
      {...props}
    >
      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-b border-white/5',
        'border-t-2', 
        accentClass
      )}>
        <div className="flex items-center space-x-2">
          {icon && <span className="text-white/70">{icon}</span>}
          <h3 className="font-medium text-base">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <div className={cn('flex-1 p-4 overflow-auto', contentClassName)}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </GlassPanel>
  );
};
