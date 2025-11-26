import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, PhotoIcon } from './Icons';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, disabled }) => {
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
    // Reset input so the same file can be selected again if needed
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
        relative w-full h-64 rounded-3xl border-[3px] border-dashed transition-all duration-300 ease-out flex flex-col items-center justify-center cursor-pointer overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}
        ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-xl shadow-indigo-100' 
            : 'border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-indigo-300'
        }
      `}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/jpeg,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={disabled}
      />
      
      {/* Background Animated Gradient Blob for aesthetic */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-100/40 to-purple-100/40 transition-opacity duration-500 pointer-events-none ${isDragging ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10 flex flex-col items-center text-center p-6">
        <div className={`
            p-4 rounded-full mb-4 transition-all duration-300
            ${isDragging ? 'bg-indigo-100 text-indigo-600 scale-110' : 'bg-white shadow-sm text-gray-400'}
        `}>
          <CloudArrowUpIcon className="w-10 h-10" />
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDragging ? 'text-indigo-700' : 'text-gray-700'}`}>
          {isDragging ? 'Отпустите файлы' : 'Нажмите или перетащите файлы'}
        </h3>
        
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Поддержка <b>JPG, PDF, DOC</b>. <br />
          <span className="text-xs opacity-75">Макс. размер файла 10 МБ</span>
        </p>
      </div>
    </div>
  );
};