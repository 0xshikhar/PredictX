import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  bgColor?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon,
  href,
  bgColor = 'from-gray-800 to-gray-900'
}) => {
  return (
    <Link 
      href={href}
      className="block relative rounded-xl overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${bgColor} p-6 h-full`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
                            <div className="text-white text-xl font-normal">{title}</div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400 mb-4">{description}</p>
          <div className="mt-auto">
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
