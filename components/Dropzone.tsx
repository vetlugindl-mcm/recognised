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
  subtitle = 'Нажмите для выбора или перетащите файлы',
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
        group relative w-full h-56 rounded-xl border border-dashed transition-all duration-200 ease-out flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}
        ${isDragging 
            ? 'border-black bg-gray-50 ring-1 ring-black/5' 
            : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
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
      
      <div className="flex flex-col items-center text-center px-6 transition-transform duration-300 group-hover:scale-[1.02]">
        
        {/* Material Design Icon Container */}
        <div className={`
            mb-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300
            ${isDragging ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-black group-hover:text-white'}
        `}>
          <CloudArrowUpIcon className="w-6 h-6" />
        </div>
        
        <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">
               {isDragging ? 'Отпускайте файлы' : title}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
               {isDragging ? 'Обработка начнется автоматически' : subtitle}
            </p>
        </div>
      </div>
    </div>
  );
};