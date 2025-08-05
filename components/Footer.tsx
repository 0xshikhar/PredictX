import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-5 px-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center mb-4 md:mb-0">
          <h2 className="text-lg font-normal text-white mr-4 flex items-center">
            <span className="text-purple-500 mr-1">Strati</span>Fi
          </h2>
          <span className="text-xs text-gray-400">© 2025 All rights reserved</span>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">
            Terms of Service
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">
            Security
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
