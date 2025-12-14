import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon } from './icons';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
  accept?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ 
  onFilesAdded, 
  disabled,
  title = 'Загрузить документы',
  subtitle = 'Перетащите файлы сюда или нажмите для выбора',
  accept = 'image/jpeg,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) {
        e.dataTransfer.dropEffect = 'none';
        return;
    }
    e.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesAdded(droppedFiles);
    }
  }, [disabled, onFilesAdded]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesAdded(selectedFiles);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [onFilesAdded]);

  const onZoneClick = () => {
      if (!disabled && fileInputRef.current) {
          fileInputRef.current.click();
      }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onZoneClick}
      className={`
        relative group w-full min-h-[260px] rounded-[2rem] cursor-pointer select-none overflow-hidden flex flex-col items-center justify-center
        transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
        ${isDragging 
            ? 'bg-blue-50/60 scale-[1.02] shadow-2xl shadow-blue-900/10' 
            : 'bg-white hover:bg-gray-50 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1'
        }
      `}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept={accept}
        disabled={disabled}
      />

      {/* --- Decorative Background Layers --- */}
      
      {/* 1. Grid Pattern */}
      <div className={`absolute inset-0 bg-grid transition-opacity duration-700 ${isDragging ? 'opacity-50' : 'opacity-20'}`} />
      
      {/* 3. Active Border (Smooth Transition) */}
      <div className={`
          absolute inset-0 rounded-[2rem] border-2 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isDragging 
            ? 'border-black border-solid inset-0 opacity-100' 
            : 'border-dashed border-gray-200 inset-2 group-hover:border-gray-300 group-hover:inset-3 group-hover:border-dashed'
          }
      `}></div>

      {/* --- Main Content --- */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
        
        {/* Animated Icon Circle */}
        <div className={`
            relative w-20 h-20 mb-6 rounded-2xl flex items-center justify-center
            transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${isDragging 
                ? 'bg-black text-white shadow-xl scale-110 rotate-0' 
                : 'bg-white text-gray-900 shadow-md border border-gray-100 group-hover:scale-105 group-hover:shadow-lg group-hover:-translate-y-1'
            }
        `}>
           <CloudArrowUpIcon className={`w-8 h-8 transition-all duration-500 ${isDragging ? 'scale-110' : ''}`} />
           
           {/* Success Badge hint */}
           <div className={`absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white transition-all duration-500 ease-out ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
        </div>
        
        {/* Typography */}
        <div className="space-y-2 max-w-md mx-auto relative">
            <h3 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isDragging ? 'text-black' : 'text-gray-900'}`}>
               {isDragging ? 'Отпустите файлы здесь' : title}
            </h3>
            
            <p className="text-sm text-gray-500 leading-relaxed font-medium px-4">
               {isDragging ? (
                   <span className="text-gray-600 transition-opacity duration-300 animate-in fade-in slide-in-from-bottom-1">Мы автоматически обработаем документы</span>
               ) : (
                   <>
                      <span className="hidden sm:inline">Перетащите файлы сюда или </span>
                      <span className="transition-colors duration-300 group-hover:text-gray-700">нажмите для выбора</span>
                   </>
               )}
            </p>
        </div>
      </div>
    </div>
  );
};