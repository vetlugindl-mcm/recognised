import React, { useState, useEffect } from 'react';
import { UploadedFile, AnalysisItem } from '../types';
import { XMarkIcon, CheckIcon, ClockIcon, LoaderIcon, ExclamationCircleIcon, ChevronDownIcon } from './icons';
import { FilePreview } from './FilePreview';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onSelect?: (id: string) => void;
  disabled?: boolean;
  analysisResults?: AnalysisItem[];
  isAnalyzing?: boolean;
}

const ITEMS_PER_PAGE = 5;

// Helper component for the animated icon transition
const StatusIconWrapper: React.FC<{ active: boolean, children: React.ReactNode, className?: string, type?: "spin" | "default" }> = ({ active, children, className = "", type = "default" }) => (
    <div className={`
        absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${active ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}
        ${className}
    `}>
        {children}
    </div>
);

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onSelect, disabled, analysisResults = [], isAnalyzing = false }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);

  // Reset to page 1 if files are removed and current page becomes empty
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
        setPage(totalPages);
    } else if (totalPages === 0) {
        setPage(1);
    }
  }, [files.length, totalPages, page]);

  const displayedFiles = files.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getFileLabel = (file: File) => {
    const type = file.type;
    if (type === 'application/pdf') return 'PDF';
    if (type.includes('word') || type.includes('doc')) return 'DOC';
    return type.startsWith('image/') ? 'IMG' : 'FILE';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest select-none">
          Файлы <span className="text-gray-900 ml-1 opacity-60">({files.length})</span>
        </h4>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition-colors"
                >
                    <ChevronDownIcon className="w-3 h-3 rotate-90" />
                </button>
                <span className="text-[10px] font-mono text-gray-500">{page} / {totalPages}</span>
                <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition-colors"
                >
                    <ChevronDownIcon className="w-3 h-3 -rotate-90" />
                </button>
            </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2 min-h-[300px]">
        {displayedFiles.map((fileObj, index) => {
          const result = analysisResults.find(r => r.fileId === fileObj.id);
          const isProcessed = !!result;
          const showSpinner = isAnalyzing && !isProcessed;
          const isIdle = !isProcessed && !showSpinner;
          const isHandwritten = result?.data?.isHandwritten === true;

          return (
            <div
              key={fileObj.id}
              onClick={() => onSelect && isProcessed && onSelect(fileObj.id)}
              className={`
                group relative flex items-center gap-3.5 p-3 pr-4 rounded-xl transition-all duration-300
                border hover:shadow-sm animate-enter
                ${isProcessed 
                    ? 'bg-white border-gray-200 shadow-sm cursor-pointer hover:border-black/20' 
                    : 'bg-white/60 border-transparent hover:border-gray-200 hover:bg-white cursor-default'
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon / Preview Component */}
              <div className={`
                w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border transition-colors duration-300 overflow-hidden
                ${'border-gray-100 bg-white'}
              `}>
                <FilePreview file={fileObj.file} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex items-center gap-2">
                   <p className="text-sm font-medium text-gray-900 truncate tracking-normal" title={fileObj.file.name}>
                    {fileObj.file.name}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 font-normal">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 leading-none">
                    {getFileLabel(fileObj.file)}
                  </span>
                  <span className="opacity-80">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* HANDWRITTEN WARNING BADGE */}
              {isHandwritten && (
                  <div className="flex shrink-0 items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-100 rounded-lg mr-2 animate-enter whitespace-nowrap">
                      <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-[10px] font-bold text-red-600 leading-none hidden sm:inline">Рукописный текст</span>
                      <span className="text-[10px] font-bold text-red-600 leading-none sm:hidden">!</span>
                  </div>
              )}

              {/* Action Area */}
               <div className="relative w-8 h-8 flex items-center justify-center ml-auto shrink-0">
                    
                    {/* Status Icons */}
                    <div className={`
                        relative w-5 h-5 transition-all duration-300 ease-out flex items-center justify-center
                        ${!disabled ? 'group-hover:opacity-0 group-hover:scale-50' : ''}
                    `}>
                        <StatusIconWrapper active={isProcessed}>
                            <div className="bg-green-100 text-green-600 rounded-full p-0.5">
                                <CheckIcon className="w-4 h-4" strokeWidth={3} />
                            </div>
                        </StatusIconWrapper>

                        <StatusIconWrapper active={showSpinner} type="spin">
                            <LoaderIcon className="w-5 h-5 text-black animate-spin" />
                        </StatusIconWrapper>

                        <StatusIconWrapper active={isIdle}>
                            <ClockIcon className="w-5 h-5 text-gray-300" />
                        </StatusIconWrapper>
                    </div>

                    {/* Remove Action */}
                    {!disabled && (
                        <div className={`
                            absolute inset-0 flex items-center justify-center gap-1 z-10
                            transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                            opacity-0 scale-90 translate-x-2 pointer-events-none
                            group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 group-hover:pointer-events-auto
                        `}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(fileObj.id);
                                }}
                                className="
                                    w-8 h-8 flex items-center justify-center rounded-lg 
                                    bg-gray-100 text-gray-400 border border-gray-200
                                    hover:bg-red-50 hover:text-red-500 hover:border-red-200
                                    transition-all duration-200
                                "
                                title="Удалить файл"
                            >
                                <XMarkIcon className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
               </div>
            </div>
          );
        })}
        
        {/* Fill empty space to keep layout stable if last page has few items */}
        {displayedFiles.length < ITEMS_PER_PAGE && (
            <div className="flex-1 min-h-[40px]"></div>
        )}
      </div>
    </div>
  );
};
