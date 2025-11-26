import React from 'react';
import { UploadedFile } from '../types';
import { XMarkIcon, DocumentIcon, PhotoIcon, CheckCircleIcon } from './Icons';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, disabled }) => {
  
  const getFileStyle = (file: File) => {
    const type = file.type;
    if (type === 'application/pdf') {
      return {
        label: 'PDF',
        color: 'text-rose-600',
        bgIcon: 'bg-rose-100',
        textIcon: 'text-rose-600',
        border: 'group-hover:border-rose-200',
        Icon: DocumentIcon
      };
    }
    if (type.includes('word') || type.includes('doc')) {
      return {
        label: 'DOC',
        color: 'text-blue-600',
        bgIcon: 'bg-blue-100',
        textIcon: 'text-blue-600',
        border: 'group-hover:border-blue-200',
        Icon: DocumentIcon
      };
    }
    // Default / Image
    return {
        label: type.startsWith('image/') ? type.split('/')[1].toUpperCase() : 'FILE',
        color: 'text-indigo-600',
        bgIcon: 'bg-indigo-100',
        textIcon: 'text-indigo-600',
        border: 'group-hover:border-indigo-200',
        Icon: PhotoIcon
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Файлы для анализа <span className="text-indigo-400 font-normal ml-1">({files.length})</span>
        </h4>
      </div>
      
      <div className="flex flex-col gap-3">
        {files.map((fileObj, index) => {
          const style = getFileStyle(fileObj.file);
          const IconComponent = style.Icon;

          return (
            <div
              key={fileObj.id}
              className={`
                group relative flex items-center gap-4 p-3 pr-12 bg-white rounded-2xl border border-gray-100 shadow-sm 
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${style.border}
                animate-in slide-in-from-bottom-2 fade-in fill-mode-backwards
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Preview or Icon */}
              <div className={`
                w-14 h-14 shrink-0 rounded-xl overflow-hidden flex items-center justify-center transition-colors duration-300
                ${fileObj.previewUrl ? 'bg-gray-100' : style.bgIcon}
              `}>
                {fileObj.previewUrl ? (
                  <img
                    src={fileObj.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconComponent className={`w-7 h-7 ${style.textIcon}`} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-0.5">
                   <p className="text-sm font-semibold text-gray-800 truncate" title={fileObj.file.name}>
                    {fileObj.file.name}
                  </p>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span className={`${style.color} bg-opacity-10 px-1.5 py-0.5 rounded bg-gray-100`}>
                    {style.label}
                  </span>
                  <span>•</span>
                  <span>{(fileObj.file.size / 1024 / 1024).toFixed(2)} МБ</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-emerald-500">Готов к загрузке</span>
                </div>
              </div>

              {/* Action - Absolute positioned for a cleaner layout */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => onRemove(fileObj.id)}
                  disabled={disabled}
                  className="
                    p-2 rounded-full text-gray-300 hover:text-rose-500 hover:bg-rose-50 
                    transition-all duration-200 
                    disabled:opacity-30 disabled:hover:text-gray-300 disabled:hover:bg-transparent
                  "
                  title="Удалить файл"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
