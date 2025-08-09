import React, { useState } from "react";
import { Search, Bell, Wallet, X, Menu, LogOut } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { login, authenticated, user, logout } = usePrivy();
  const isMobile = useIsMobile();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4 md:px-6 flex items-center justify-between shadow-clean relative z-20">
      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="absolute inset-0 bg-white z-30 p-3 flex items-center border-b border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="clean-input pl-10 pr-4 py-2 rounded-lg w-full text-sm"
              autoFocus
            />
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="ml-2 p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Left side - Menu and Logo */}
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-900 mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo - always shown */}
        <Link
          href="/"
          className="text-xl font-semibold text-gray-900 block md:hidden"
        >
          <div className="flex items-center">
            <Image src="/logo.png" alt="Signal" width={32} height={32} />
            <div className="flex items-center ml-2">
              <span className="text-gray-900">Signal</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Search bar - hidden on mobile */}
      <div className="hidden md:flex items-center relative flex-1 max-w-xl mx-6">
        <Search className="absolute left-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search assets, portfolios, transactions..."
          className="clean-input pl-10 pr-4 py-2 rounded-lg w-full text-sm"
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Mobile search button */}
        <button
          className="md:hidden text-gray-600 hover:text-gray-900 bg-white p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          onClick={() => setShowMobileSearch(true)}
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button className="text-gray-600 hover:text-gray-900 relative bg-white p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <Bell size={isMobile ? 18 : 20} />
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
            3
          </span>
        </button>

        {/* Wallet/User section */}
        {authenticated ? (
          <div className="flex items-center space-x-3">
            {/* Wallet balance */}
            <div className="hidden md:flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <Wallet size={16} className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">$24,567</span>
            </div>

            {/* User avatar */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.wallet?.address?.slice(0, 2).toUpperCase() || "U"}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-900">
                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="clean-button-primary px-4 py-2 rounded-lg font-medium text-sm hover:shadow-clean-md transition-all"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
