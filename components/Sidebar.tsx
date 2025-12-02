
import React from 'react';
import { BuildingOfficeIcon, ClipboardDocumentCheckIcon } from './icons';

interface SidebarProps {
  className?: string;
}

const MenuItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`
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

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <aside className={`flex flex-col h-full w-64 shrink-0 py-6 px-4 z-20 border-r border-transparent ${className}`}>
      
      {/* Navigation */}
      <div className="flex flex-col gap-1.5 flex-1">
        <MenuItem icon={BuildingOfficeIcon} label="Внесение в НОПРИЗ" active={true} />
        <MenuItem icon={ClipboardDocumentCheckIcon} label="Внесение в НОСТРОЙ" />
      </div>

      {/* Modern Support Card */}
      <div className="mt-auto">
        <div className="glass-panel rounded-xl p-5 border border-white/50 bg-white/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div>
                     <h4 className="text-gray-900 font-bold text-sm leading-none mb-1">Поддержка</h4>
                     <p className="text-xs text-gray-500 leading-none">Мы онлайн</p>
                </div>
            </div>
            
            <button className="w-full py-2.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all shadow-sm tracking-wide">
                Написать сообщение
            </button>
        </div>
      </div>
    </aside>
  );
};
