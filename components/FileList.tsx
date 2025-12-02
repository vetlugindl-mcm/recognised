import React from 'react';
import { UploadedFile } from '../types';
import { XMarkIcon, CheckCircleIcon, AcademicCapIcon, PhotoIcon } from './Icons';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  processedIds?: string[];
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, disabled, processedIds = [] }) => {
  
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
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
          Файлы <span className="text-gray-900 ml-1 opacity-60">({files.length})</span>
        </h4>
      </div>
      
      <div className="flex flex-col gap-2">
        {files.map((fileObj, index) => {
          const style = getFileStyle(fileObj.file);
          const IconComponent = style.Icon;
          const isProcessed = processedIds.includes(fileObj.id);

          return (
            <div
              key={fileObj.id}
              className={`
                group relative flex items-center gap-3.5 p-2 pr-10 rounded-xl transition-all duration-300
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
                w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border
                ${fileObj.previewUrl ? 'border-gray-100 bg-white' : 'border-gray-200/60 bg-gray-50 text-gray-400'}
              `}>
                {fileObj.previewUrl ? (
                  <img
                    src={fileObj.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <IconComponent className="w-4 h-4" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex items-center gap-2">
                   <p className="text-[13px] font-semibold text-gray-900 truncate tracking-tight leading-none" title={fileObj.file.name}>
                    {fileObj.file.name}
                  </p>
                  {isProcessed && (
                      <CheckCircleIcon className="w-3.5 h-3.5 text-black" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium leading-none">
                  <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-px rounded">
                    {style.label}
                  </span>
                  <span className="opacity-60">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* Status Text */}
               <span className={`text-[10px] font-medium hidden sm:block ${isProcessed ? "text-gray-900" : "text-gray-400"}`}>
                    {isProcessed ? "Готово" : "Ожидание"}
               </span>

              {/* Action */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onRemove(fileObj.id)}
                  disabled={disabled}
                  className="
                    p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 
                    transition-all duration-200 transform hover:scale-105
                  "
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};