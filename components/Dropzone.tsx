import React, { useState, useRef, useCallback } from 'react';
import { ArrowDownTrayIcon, DocumentIcon, LoaderIcon } from './icons';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  title?: string;
  subtitle?: string;
  accept?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ 
  onFilesAdded, 
  disabled,
  isProcessing = false,
  title = 'Загрузить документы',
  subtitle = 'Перетащите файлы (PDF, JPG, DOCX)',
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

  // --- Visual Logic ---
  const isActive = isDragging;
  const showScanning = isProcessing;

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
        relative group w-full min-h-[320px] rounded-3xl cursor-pointer select-none flex flex-col items-center justify-center text-center overflow-hidden
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        border-[3px] border-dashed
        ${disabled 
            ? 'cursor-not-allowed bg-gray-50 border-gray-200' 
            : isActive 
                ? 'bg-gray-50 border-black scale-[1.01] shadow-2xl shadow-black/5'
                : isHovering
                    ? 'bg-white border-gray-300 shadow-xl shadow-gray-200/50 -translate-y-1'
                    : 'bg-white border-gray-200'
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

      {/* --- LAYER 1: Background Patterns --- */}
      
      {/* Dot Pattern */}
      <div className={`absolute inset-0 bg-dot-black transition-opacity duration-700 pointer-events-none ${isActive ? 'opacity-[0.15]' : isHovering ? 'opacity-[0.08]' : 'opacity-[0.03]'}`} />
      
      {/* Radial Gradient Spotlight */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80 pointer-events-none`} />

      {/* Scanning Line Animation */}
      {(isActive || showScanning) && (
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-black to-transparent z-0 animate-scan pointer-events-none opacity-50">
             <div className="absolute inset-0 bg-black blur-[4px] opacity-20"></div>
        </div>
      )}

      {/* --- LAYER 2: Corner Brackets (Scanner Aesthetic) --- */}
      {/* Top Left */}
      <div className={`absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 transition-all duration-500 ease-out pointer-events-none rounded-tl-lg
        ${isActive || showScanning ? 'border-black scale-110 translate-x-1 translate-y-1' : isHovering ? 'border-gray-900' : 'border-gray-300'}
      `}/>
      {/* Top Right */}
      <div className={`absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 transition-all duration-500 ease-out pointer-events-none rounded-tr-lg
        ${isActive || showScanning ? 'border-black scale-110 -translate-x-1 translate-y-1' : isHovering ? 'border-gray-900' : 'border-gray-300'}
      `}/>
      {/* Bottom Left */}
      <div className={`absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 transition-all duration-500 ease-out pointer-events-none rounded-bl-lg
        ${isActive || showScanning ? 'border-black scale-110 translate-x-1 -translate-y-1' : isHovering ? 'border-gray-900' : 'border-gray-300'}
      `}/>
      {/* Bottom Right */}
      <div className={`absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 transition-all duration-500 ease-out pointer-events-none rounded-br-lg
        ${isActive || showScanning ? 'border-black scale-110 -translate-x-1 -translate-y-1' : isHovering ? 'border-gray-900' : 'border-gray-300'}
      `}/>


      {/* --- LAYER 3: Main Content --- */}
      <div className="relative z-10 flex flex-col items-center gap-6 p-6 transform transition-transform duration-500 will-change-transform">
        
        {/* Animated Icon Container */}
        <div className={`
            relative p-6 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${isActive || showScanning
                ? 'bg-black text-white scale-110 rotate-0 shadow-xl shadow-black/20' 
                : isHovering && !disabled
                    ? 'bg-black text-white scale-105 shadow-lg shadow-black/10'
                    : 'bg-gray-100 text-gray-400'
            }
        `}>
           {showScanning ? (
              <LoaderIcon className="w-10 h-10 animate-spin" />
           ) : isActive ? (
               <ArrowDownTrayIcon className="w-10 h-10 animate-bounce" />
           ) : (
               <DocumentIcon className={`w-10 h-10 transition-transform duration-500 ${isHovering ? 'scale-110' : ''}`} />
           )}
           
           {/* Decorative Rings */}
           <div className={`absolute inset-0 rounded-2xl border border-black transition-all duration-700 ${(isActive || showScanning) ? 'scale-125 opacity-20' : 'scale-100 opacity-0'}`} />
           <div className={`absolute inset-0 rounded-2xl border border-black transition-all duration-1000 delay-100 ${(isActive || showScanning) ? 'scale-150 opacity-10' : 'scale-100 opacity-0'}`} />
        </div>
        
        {/* Text Content */}
        <div className="space-y-3 max-w-sm mx-auto">
            <h3 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${isActive || showScanning ? 'text-black' : 'text-gray-900'}`}>
               {showScanning ? 'Анализируем документы...' : isActive ? 'Отпускайте файлы' : title}
            </h3>
            
            <p className={`text-sm transition-colors duration-300 leading-relaxed font-medium ${isActive || showScanning ? 'text-gray-900' : 'text-gray-500'}`}>
               {showScanning ? (
                   'Подождите, идет обработка с помощью AI'
               ) : isActive ? (
                   'Мы автоматически извлечем данные'
               ) : (
                   <span className="flex flex-col gap-1">
                       <span>{subtitle}</span>
                       <span className={`text-xs opacity-60 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                           или нажмите для выбора вручную
                       </span>
                   </span>
               )}
            </p>
        </div>

        {/* Badge */}
        {!isActive && !showScanning && !disabled && (
            <div className={`
                mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-500
                ${isHovering ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}
            `}>
                AI Scanner Ready
            </div>
        )}
      </div>
    </div>
  );
};