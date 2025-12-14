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
        relative group w-full h-48 rounded-2xl transition-all duration-500 ease-out cursor-pointer select-none overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.005] active:scale-[0.99]'}
        ${isDragging 
            ? 'ring-2 ring-black bg-gray-50 scale-[1.005]' 
            : 'bg-white border border-gray-200'
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

      {/* Background Effects */}
      <div className={`absolute inset-0 bg-grid opacity-[0.3] pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-50' : ''}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white/60 pointer-events-none" />
      
      {/* Dashed Border Animation Wrapper */}
      <div className={`
          absolute inset-3 border-2 border-dashed rounded-xl pointer-events-none transition-colors duration-300
          ${isDragging ? 'border-black bg-white/40' : 'border-gray-200 group-hover:border-gray-300'}
      `}></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
        
        {/* Animated Icon Container */}
        <div className={`
            relative w-14 h-14 mb-4 rounded-xl flex items-center justify-center
            transition-all duration-500
            ${isDragging 
                ? 'bg-black text-white shadow-lg rotate-3 scale-110' 
                : 'bg-gray-50 text-gray-900 shadow-sm border border-gray-100 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-white'
            }
        `}>
           <CloudArrowUpIcon className={`w-6 h-6 transition-transform duration-300 ${isDragging ? 'animate-bounce' : ''}`} />
        </div>
        
        {/* Typography */}
        <div className="space-y-1 max-w-sm mx-auto">
            <h3 className={`text-base font-bold tracking-tight transition-colors duration-300 ${isDragging ? 'text-black' : 'text-gray-900'}`}>
               {title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium px-4">
               {isDragging ? (
                   <span className="text-black">Отпустите файлы для начала загрузки</span>
               ) : (
                   subtitle
               )}
            </p>
        </div>
      </div>
    </div>
  );
};