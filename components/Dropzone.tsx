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
        w-full h-56 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}
        ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
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
      
      <div className="flex flex-col items-center text-center px-4">
        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          <CloudArrowUpIcon className="w-8 h-8" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-1">
           {title}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
           {subtitle}
        </p>
      </div>
    </div>
  );
};