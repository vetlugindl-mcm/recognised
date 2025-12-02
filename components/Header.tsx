
import React from 'react';
import { MagnifyingGlassIcon, BellIcon } from './icons';
import { McmLogo } from './McmLogo';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 flex items-center justify-between px-6 z-50 transition-all duration-300 supports-[backdrop-filter]:bg-white/70">
      
      {/* Left: Brand */}
      <div className="flex items-center gap-8">
        <div className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200 scale-90 origin-left">
            <McmLogo />
        </div>
      </div>

      {/* Right: User Actions */}
      <div className="flex items-center gap-3">
        
        {/* Search */}
        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full transition-all duration-200 group">
          <MagnifyingGlassIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
        </button>

        {/* Notifications */}
        <div className="relative">
            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full transition-all duration-200">
                <BellIcon className="w-5 h-5" />
            </button>
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 ml-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-800 to-black text-white flex items-center justify-center text-xs font-bold shadow-md shadow-black/10">
                MK
            </div>
            <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">Михаил К.</span>
                <span className="text-xs text-gray-500 leading-none">Администратор</span>
            </div>
        </button>

      </div>
    </header>
  );
};
