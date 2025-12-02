import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ViewState } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] overflow-hidden font-sans text-gray-900 selection:bg-black selection:text-white">
      {/* Top Header */}
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar 
            className="md:flex" 
            activeView={activeView} 
            onNavigate={onNavigate} 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative">
           
           {/* Modern Tech Background: Dot Pattern + Radial Gradient + Noise */}
           <div className="fixed inset-0 pointer-events-none z-0 bg-white">
              {/* Radial Spotlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#f3f4f6,transparent)]"></div>
              
              {/* Dot Pattern */}
              <div 
                className="absolute inset-0 opacity-[0.4]"
                style={{
                  backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
                  backgroundSize: '32px 32px'
                }}
              ></div>

              {/* Noise Overlay */}
              <div className="absolute inset-0 bg-noise opacity-60 mix-blend-multiply"></div>
           </div>
           
           <div className="relative z-10 p-5 md:p-8 max-w-7xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};
