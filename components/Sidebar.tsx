import React from 'react';
import { BuildingOfficeIcon, Square2StackIcon, BriefcaseIcon } from './icons';
import { ViewState } from '../types';

interface SidebarProps {
  className?: string;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const MenuItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  onClick
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick: () => void 
}) => (
  <div 
    onClick={onClick}
    className={`
    group flex items-center gap-3 px-3.5 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm tracking-normal select-none
    ${active 
      ? 'bg-black text-white shadow-md shadow-black/10' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }
  `}>
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
    <span>{label}</span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ className, activeView, onNavigate, isOpen, onClose }) => {
  const handleNavigate = (view: ViewState) => {
      onNavigate(view);
      if (onClose) onClose();
  }

  return (
    <>
        {/* Mobile Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        />

        <aside className={`
            flex flex-col py-6 px-4 z-40 bg-[#fafafa] md:bg-transparent
            transition-transform duration-300 ease-out
            fixed left-0 w-64 border-r border-transparent
            top-16 bottom-0 md:relative md:top-0 md:h-full md:translate-x-0
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}
            ${className || ''}
        `}>
        
        {/* Navigation */}
        <div className="flex flex-col gap-1.5 flex-1">
            <MenuItem 
                icon={BuildingOfficeIcon} 
                label="Внесение в НОПРИЗ" 
                active={activeView === 'scanner'} 
                onClick={() => handleNavigate('scanner')}
            />
             <MenuItem 
                icon={BriefcaseIcon} 
                label="Внесение в НОСТРОЙ" 
                active={activeView === 'nostroy'} 
                onClick={() => handleNavigate('nostroy')}
            />
            <MenuItem 
                icon={Square2StackIcon} 
                label="Шаблоны документов" 
                active={activeView === 'templates'} 
                onClick={() => handleNavigate('templates')}
            />
        </div>

        </aside>
    </>
  );
};