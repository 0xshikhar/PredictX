import React from 'react';
import { GlassPanel } from './glass-panel';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

/**
 * StatsCard - A card displaying key statistics with trend indicators
 */
export const StatsCard = ({
  title,
  value,
  subtitle,
  change,
  icon,
  className,
  trend = 'neutral',
  loading = false,
}: StatsCardProps) => {
  const trendColor = {
    'up': 'text-success',
    'down': 'text-danger',
    'neutral': 'text-info',
  }[trend];

  const trendIcon = {
    'up': '↑',
    'down': '↓',
    'neutral': '→',
  }[trend];

  return (
    <GlassPanel 
      className={cn('flex flex-col', className)}
      padding="md"
      interactive
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-white/60 font-medium">{title}</p>
        {icon && <span className="text-white/70">{icon}</span>}
      </div>

      {loading ? (
        <div className="h-8 bg-white/5 rounded animate-pulse"></div>
      ) : (
        <div className="flex flex-col">
                          <div className="text-2xl font-normal">{value}</div>
          {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
          {change !== undefined && (
            <div className={cn("flex items-center text-sm mt-1", trendColor)}>
              <span className="mr-1">{trendIcon}</span>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
};
