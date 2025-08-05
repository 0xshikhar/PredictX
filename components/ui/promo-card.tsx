import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface PromoCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  bgColor?: string;
  href: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const PromoCard: React.FC<PromoCardProps> = ({
  title,
  subtitle,
  description,
  bgColor = 'from-purple-900 to-indigo-900',
  href,
  fullWidth = false,
  children
}) => {
  return (
    <Link 
      href={href}
      className={`block relative rounded-xl overflow-hidden ${fullWidth ? 'col-span-2' : ''}`}
    >
      <div className={`bg-gradient-to-br ${bgColor} p-6 h-full`}>
        <div className="flex flex-col h-full">
          {subtitle && (
            <div className="text-xs text-gray-300 mb-1">{subtitle}</div>
          )}
                          <h3 className="text-2xl font-normal text-white mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-300 mb-4">{description}</p>
          )}
          
          {children}
          
          <div className="absolute top-4 right-4">
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PromoCard;
