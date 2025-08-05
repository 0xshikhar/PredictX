import React from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glowEffect?: 'none' | 'primary' | 'secondary';
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * GlassPanel - A glass morphism styled container component
 * 
 * @param interactive - Adds hover effects when true
 * @param glowEffect - Adds a colored glow effect (primary=purple, secondary=teal)
 * @param bordered - Adds a subtle border
 * @param padding - Amount of internal padding
 * @param blur - Strength of backdrop blur effect
 */
export const GlassPanel = ({
  children,
  className,
  interactive = false,
  glowEffect = 'none',
  bordered = true,
  padding = 'md',
  blur = 'md',
  ...props
}: GlassPanelProps) => {
  return (
    <div
      className={cn(
        'glass-panel',
        {
          'glass-panel-hover': interactive,
          'purple-glow': glowEffect === 'primary',
          'shadow-glow-primary': glowEffect === 'primary',
          'shadow-glow-secondary': glowEffect === 'secondary',
          'border border-white/5': bordered,
          'p-0': padding === 'none',
          'p-2': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
          'backdrop-blur-sm': blur === 'sm',
          'backdrop-blur-md': blur === 'md',
          'backdrop-blur-lg': blur === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
