
import React from 'react';
import { MagnifyingGlassIcon, BellIcon } from './Icons';
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
      <div className="flex items-center gap-2">
        
        {/* Search */}
        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full transition-all duration-200 group">
          <MagnifyingGlassIcon className="w-4 h-4 group-hover:scale-105 transition-transform" />
        </button>

        {/* Notifications */}
        <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full transition-all duration-200">
                <BellIcon className="w-4 h-4" />
            </button>
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-black rounded-full border border-white"></span>
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 ml-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-gray-800 to-black text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-black/10">
                MK
            </div>
            <div className="hidden lg:flex flex-col items-start">
                <span className="text-[11px] font-bold text-gray-900 leading-none mb-0.5">Михаил К.</span>
                <span className="text-[9px] text-gray-500 leading-none">Администратор</span>
            </div>
        </button>

      </div>
    </header>
  );
};
