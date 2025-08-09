import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  Wallet,
  Trophy,
  Settings,
  HelpCircle,
  MessageSquare,
  Zap,
  X
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  // Get current pathname to highlight active link
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Helper to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (isMobile && isOpen && onClose) {
      onClose();
    }
  }, [pathname, isMobile, isOpen, onClose]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white text-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-gray-200 overflow-hidden shadow-clean-lg`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
                            <Link href="/predictions" className="text-xl font-semibold text-gray-900">
              <div className="flex items-center">
                <Image src="/logo.png" alt="Predict Core" width={32} height={32} />
                <div className="flex items-center ml-2">
                  <span className="text-gray-900">Predict</span>
                  <span className="text-primary ml-1">Core</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Close button - mobile only */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Main Navigation - Scrollable area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 touch-pan-y">
          <div className="mb-6">
            <p className="text-xs text-gray-500 font-semibold mb-3 px-2 uppercase tracking-wider">Prediction Market</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/predictions"
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive('/predictions') 
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp size={18} className={`mr-3 ${
                    isActive('/predictions') ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span>Predictions</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/markets"
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive('/markets') 
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 size={18} className={`mr-3 ${
                    isActive('/markets') ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span>Markets</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive('/portfolio') 
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Wallet size={18} className={`mr-3 ${
                    isActive('/portfolio') ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span>Portfolio</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive('/leaderboard') 
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Trophy size={18} className={`mr-3 ${
                    isActive('/leaderboard') ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span>Leaderboard</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-500 font-semibold mb-3 px-2 uppercase tracking-wider">Support</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/settings"
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive('/settings') 
                      ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings size={18} className={`mr-3 ${
                    isActive('/settings') ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive('/support') 
                      ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <HelpCircle size={18} className={`mr-3 ${
                    isActive('/support') ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span>Help & Support</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-medium">Signal v1.0</p>
            <p className="mt-1">Advanced DeFi Analytics</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
