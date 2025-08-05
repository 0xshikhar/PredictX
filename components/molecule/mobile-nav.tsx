import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
    Home,
    BarChart3,
    Bot,
    Briefcase,
    Settings
} from 'lucide-react';

const MobileNav = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    const navItems = [
        {
            label: 'Home',
            href: '/',
            icon: Home,
        },
        {
            label: 'Portfolio',
            href: '/portfolio',
            icon: Briefcase,
        },
        {
            label: 'Research',
            href: '/research',
            icon: BarChart3,
        },
        {
            label: 'Agent',
            href: '/agent',
            icon: Bot,
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe-bottom lg:hidden shadow-clean-lg">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center py-3 px-4 transition-colors duration-200',
                                active 
                                    ? 'text-blue-600 bg-blue-50 rounded-lg mx-2' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg mx-2'
                            )}
                        >
                            <item.icon
                                size={22}
                                className={cn(
                                    'mb-1',
                                    active ? 'text-blue-600' : 'text-gray-600'
                                )}
                            />
                            <span className={cn(
                                'text-xs font-medium',
                                active ? 'text-blue-600' : 'text-gray-600'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export { MobileNav }; 