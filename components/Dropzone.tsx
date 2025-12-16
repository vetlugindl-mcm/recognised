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
  const [isHovering, setIsHovering] = useState(false);
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
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        relative group w-full min-h-[280px] rounded-2xl cursor-pointer select-none flex flex-col items-center justify-center text-center overflow-hidden
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        border-2 
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}
        ${isDragging 
            ? 'bg-white border-black shadow-2xl shadow-black/5 scale-[1.02]' 
            : isHovering && !disabled
                ? 'bg-white border-gray-400 shadow-xl shadow-gray-200/50 -translate-y-1'
                : 'bg-white border-dashed border-gray-200'
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

      {/* Subtle Background Pattern (Engineering Grid) */}
      <div className={`absolute inset-0 bg-grid pointer-events-none transition-opacity duration-700 ease-in-out ${isDragging ? 'opacity-10' : 'opacity-0'}`} />

      <div className="relative z-10 flex flex-col items-center gap-5 p-6 transform transition-transform duration-500 will-change-transform">
        
        {/* Animated Icon Container */}
        <div className={`
            relative p-5 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${isDragging 
                ? 'bg-black text-white scale-110 rotate-0 shadow-lg' 
                : isHovering && !disabled
                    ? 'bg-gray-100 text-gray-900 scale-105'
                    : 'bg-gray-50 text-gray-400'
            }
        `}>
           <CloudArrowUpIcon className={`w-8 h-8 transition-transform duration-500 ${isDragging ? 'scale-110' : ''}`} />
           
           {/* Decorative dots that appear on hover */}
           <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-black transition-all duration-500 ${isHovering && !isDragging ? 'opacity-20 scale-100' : 'opacity-0 scale-0'}`}></div>
           <div className={`absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-black transition-all duration-500 delay-75 ${isHovering && !isDragging ? 'opacity-20 scale-100' : 'opacity-0 scale-0'}`}></div>
        </div>
        
        <div className="space-y-2 max-w-sm mx-auto">
            <h3 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isDragging ? 'text-black' : 'text-gray-900'}`}>
               {isDragging ? 'Отпускайте файлы' : title}
            </h3>
            
            <p className={`text-sm transition-colors duration-300 leading-relaxed ${isDragging ? 'text-gray-600' : 'text-gray-500'}`}>
               {isDragging ? (
                   'Мы автоматически распознаем данные'
               ) : (
                   <>
                       <span className="group-hover:text-gray-700 transition-colors">Перетащите файлы сюда</span> или <span className="underline decoration-gray-300 underline-offset-4 decoration-1 group-hover:decoration-black group-hover:text-black transition-all">выберите на компьютере</span>
                   </>
               )}
            </p>
        </div>
      </div>
    </div>
  );
};