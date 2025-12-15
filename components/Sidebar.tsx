import React, { useState } from 'react';
import { BuildingOfficeIcon, Square2StackIcon, ChevronDownIcon, CloudArrowUpIcon, ApartmentBuildingIcon, CitySkylineIcon } from './icons';
import { ViewState } from '../types';

interface SidebarProps {
  className?: string;
  activeView: ViewState | string; // Loosened type for future states
  onNavigate: (view: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const MenuItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  onClick,
  isSubItem = false
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick: () => void,
  isSubItem?: boolean
}) => (
  <div 
    onClick={onClick}
    className={`
    group flex items-center gap-3 px-3.5 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm tracking-normal select-none
    ${isSubItem ? 'ml-4' : ''}
    ${active 
      ? 'bg-gray-800 text-white shadow-md shadow-gray-800/10' // Lighter black (Charcoal)
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }
  `}>
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
    <span>{label}</span>
  </div>
);

const MenuGroup = ({
    label,
    icon: Icon,
    isOpen,
    onToggle,
    children
}: {
    label: string,
    icon: any,
    isOpen: boolean,
    onToggle: () => void,
    children: React.ReactNode
}) => {
    return (
        <div className="flex flex-col">
            {/* Group Header */}
            <div 
                onClick={onToggle}
                className={`
                    group flex items-center justify-between px-3.5 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm tracking-normal select-none
                    text-gray-900 hover:bg-gray-100
                `}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-900" />
                    <span>{label}</span>
                </div>
                <ChevronDownIcon 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? '-rotate-180' : 'rotate-0'}`} 
                />
            </div>

            {/* Collapsible Content */}
            <div 
                className={`
                    overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                `}
                style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0.5 }}
            >
                <div className="flex flex-col gap-1 py-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ className, activeView, onNavigate, isOpen, onClose }) => {
  // State for the main NOPRIZ group
  const [isNrsOpen, setIsNrsOpen] = useState(true); // Default open for better UX

  const handleNavigate = (view: string) => {
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
            top-20 bottom-0 md:relative md:top-0 md:h-full md:translate-x-0
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}
            ${className || ''}
        `}>
        
        {/* Navigation */}
        <div className="flex flex-col gap-1.5 flex-1">
            
            {/* Accordion Group */}
            <MenuGroup 
                label="НОСТРОЙ/НОПРИЗ" 
                icon={BuildingOfficeIcon} 
                isOpen={isNrsOpen} 
                onToggle={() => setIsNrsOpen(!isNrsOpen)}
            >
                 <MenuItem 
                    icon={CloudArrowUpIcon} 
                    label="Загрузка документов" 
                    active={activeView === 'upload_docs'} 
                    onClick={() => handleNavigate('upload_docs')}
                    isSubItem
                />
                <MenuItem 
                    icon={ApartmentBuildingIcon} 
                    label="НОСТРОЙ" 
                    active={activeView === 'nostroy_match'} 
                    onClick={() => handleNavigate('nostroy_match')}
                    isSubItem
                />
                 <MenuItem 
                    icon={CitySkylineIcon} 
                    label="НОПРИЗ" 
                    active={activeView === 'nopriz_match'} 
                    onClick={() => handleNavigate('nopriz_match')}
                    isSubItem
                />
                 <MenuItem 
                    icon={Square2StackIcon} 
                    label="Шаблоны документов" 
                    active={activeView === 'templates'} 
                    onClick={() => handleNavigate('templates')}
                    isSubItem
                />
            </MenuGroup>
        </div>

        </aside>
    </>
  );
};