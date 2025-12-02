import React from 'react';
import { UploadedFile } from '../types';
import { XMarkIcon, AcademicCapIcon, PhotoIcon, CheckIcon, ClockIcon, LoaderIcon } from './icons';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  processedIds?: string[];
  isAnalyzing?: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, disabled, processedIds = [], isAnalyzing = false }) => {
  
  const getFileStyle = (file: File) => {
    const type = file.type;
    if (type === 'application/pdf') {
      return {
        label: 'PDF',
        Icon: AcademicCapIcon
      };
    }
    if (type.includes('word') || type.includes('doc')) {
      return {
        label: 'DOC',
        Icon: AcademicCapIcon
      };
    }
    return {
        label: type.startsWith('image/') ? 'IMG' : 'FILE',
        Icon: PhotoIcon
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest select-none">
          Файлы <span className="text-gray-900 ml-1 opacity-60">({files.length})</span>
        </h4>
      </div>
      
      <div className="flex flex-col gap-2">
        {files.map((fileObj, index) => {
          const style = getFileStyle(fileObj.file);
          const IconComponent = style.Icon;
          const isProcessed = processedIds.includes(fileObj.id);
          const showSpinner = isAnalyzing && !isProcessed;

          return (
            <div
              key={fileObj.id}
              className={`
                group relative flex items-center gap-3.5 p-3 pr-4 rounded-xl transition-all duration-300
                border hover:shadow-sm
                animate-enter
                ${isProcessed 
                    ? 'bg-white border-gray-200 shadow-sm' 
                    : 'bg-white/60 border-transparent hover:border-gray-200 hover:bg-white'
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon / Preview */}
              <div className={`
                w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border
                ${fileObj.previewUrl ? 'border-gray-100 bg-white' : 'border-gray-200/60 bg-gray-50 text-gray-400'}
              `}>
                {fileObj.previewUrl ? (
                  <img
                    src={fileObj.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                   <p className="text-sm font-medium text-gray-900 truncate tracking-normal leading-none" title={fileObj.file.name}>
                    {fileObj.file.name}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 font-normal leading-none">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {style.label}
                  </span>
                  <span className="opacity-80">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* Status Icons */}
               <div className={`
                   ml-auto flex items-center justify-center w-8 transition-opacity duration-200
                   ${!disabled ? 'group-hover:opacity-0' : ''}
               `}>
                    {isProcessed ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : showSpinner ? (
                        <LoaderIcon className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                        <ClockIcon className="w-5 h-5 text-gray-300" />
                    )}
               </div>

              {/* Action - Reveal on hover */}
              {!disabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                    <button
                    onClick={() => onRemove(fileObj.id)}
                    className="
                        p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 
                        transition-colors
                    "
                    >
                    <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};