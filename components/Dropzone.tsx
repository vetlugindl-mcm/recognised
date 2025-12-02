
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
  subtitle = 'JPG, PDF, DOC до 10 МБ',
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
        relative w-full h-36 rounded-xl border border-dashed transition-all duration-300 ease-out flex flex-col items-center justify-center cursor-pointer overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}
        ${isDragging 
            ? 'border-gray-900 bg-gray-50 scale-[1.01]' 
            : 'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-gray-50'
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
      
      <div className="relative z-10 flex flex-row items-center gap-4 text-left p-6">
        <div className={`
            p-2.5 rounded-full transition-all duration-300
            ${isDragging ? 'bg-gray-900 text-white' : 'bg-white shadow-sm border border-gray-100 text-gray-500'}
        `}>
          <CloudArrowUpIcon className="w-5 h-5" />
        </div>
        
        <div>
            <h3 className={`text-sm font-bold transition-colors duration-300 ${isDragging ? 'text-gray-900' : 'text-gray-800'}`}>
            {isDragging ? 'Отпустите файлы' : title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
            {subtitle}
            </p>
        </div>
      </div>
    </div>
  );
};
