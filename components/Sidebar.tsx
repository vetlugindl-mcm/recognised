
import React from 'react';
import { BuildingOfficeIcon, ClipboardDocumentCheckIcon } from './Icons';

interface SidebarProps {
  className?: string;
}

const MenuItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`
    group flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 font-medium text-[13px] tracking-wide select-none
    ${active 
      ? 'bg-black text-white shadow-md shadow-black/10' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }
  `}>
    <Icon className={`w-4 h-4 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
    <span>{label}</span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <aside className={`flex flex-col h-full w-60 shrink-0 py-6 px-4 z-20 border-r border-transparent ${className}`}>
      
      {/* Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        <MenuItem icon={BuildingOfficeIcon} label="Внесение в НОПРИЗ" active={true} />
        <MenuItem icon={ClipboardDocumentCheckIcon} label="Внесение в НОСТРОЙ" />
      </div>

      {/* Modern Support Card */}
      <div className="mt-auto">
        <div className="glass-panel rounded-xl p-4 border border-white/50 bg-white/50">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div>
                     <h4 className="text-gray-900 font-bold text-xs leading-none mb-1">Поддержка</h4>
                     <p className="text-[10px] text-gray-400 leading-none">Мы онлайн</p>
                </div>
            </div>
            
            <button className="w-full py-2 bg-black text-white rounded-lg text-[11px] font-bold hover:bg-gray-800 transition-all shadow-sm">
                Написать сообщение
            </button>
        </div>
      </div>
    </aside>
  );
};
