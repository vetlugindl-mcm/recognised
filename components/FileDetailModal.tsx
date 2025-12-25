import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnalysisItem, AnalyzedDocument } from '../types';
import { AnalysisResult } from './AnalysisResult';
import { XMarkIcon, DocumentIcon, MagnifyingGlassIcon } from './icons';
import { FilePreview } from './FilePreview';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { ImageZoom } from './ImageZoom';

interface FileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisItem: AnalysisItem | null;
  file: File | null;
  onUpdate: (fileId: string, newData: AnalyzedDocument) => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    analysisItem, 
    file,
    onUpdate 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Custom Focus Trap for accessibility
  const modalRef = useFocusTrap(isOpen && !isZoomed);
  const zoomRef = useFocusTrap(isZoomed);

  // Generate URL for PDF viewing
  const fileUrl = useObjectUrl(file);
  const isPdf = file?.type === 'application/pdf';

  // Handle Escape key
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              if (isZoomed) {
                  setIsZoomed(false);
                  e.stopPropagation(); 
              } else if (isOpen) {
                  onClose();
              }
          }
      };

      if (isOpen) {
          window.addEventListener('keydown', handleKeyDown);
      }
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomed, onClose]);

  if (!isOpen || !analysisItem) return null;

  return createPortal(
    <>
        {/* MAIN MODAL LAYER */}
        <div 
            ref={modalRef}
            className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden outline-none"
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-6xl h-full md:h-[90vh] flex flex-col animate-enter bg-[#fafafa] sm:rounded-2xl shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-gray-200 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 hidden sm:block">
                            <DocumentIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Сверка документа</h3>
                            <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-md">{analysisItem.fileName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:ring-black outline-none"
                        aria-label="Закрыть"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Split View Body */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
                    
                    {/* LEFT COLUMN: Document Preview */}
                    <div 
                        className="lg:w-1/2 bg-gray-900/5 relative flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 min-h-[200px] lg:min-h-0 group cursor-zoom-in"
                        onClick={() => file && setIsZoomed(true)}
                        onKeyDown={(e) => { if (e.key === 'Enter') file && setIsZoomed(true); }}
                        tabIndex={0}
                        role="button"
                        aria-label="Открыть изображение на весь экран"
                    >
                        
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-grid opacity-[0.5] pointer-events-none" />
                        
                        {/* Image Container */}
                        <div className="relative w-full h-full p-4 md:p-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                            {file ? (
                                <div className="relative w-full h-full shadow-lg rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
                                    <FilePreview 
                                        file={file} 
                                        fit="contain" 
                                        highRes={true}
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center gap-2">
                                    <DocumentIcon className="w-12 h-12 opacity-20" />
                                    <span className="text-sm font-medium">Файл не найден</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Overlay Label */}
                        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-white/10 pointer-events-none z-10">
                            Оригинал
                        </div>

                        {/* Hover Zoom Hint */}
                        {file && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center z-20">
                                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-4 py-2 rounded-full shadow-xl border border-gray-100 font-medium text-xs flex items-center gap-2">
                                    <MagnifyingGlassIcon className="w-4 h-4" />
                                    <span>Увеличить</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Analysis Form */}
                    <div className="lg:w-1/2 flex flex-col bg-[#fafafa] h-full overflow-hidden relative">
                        {/* Form Scroll Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
                            <div className="max-w-xl mx-auto">
                                <AnalysisResult item={analysisItem} onUpdate={onUpdate} />
                            </div>
                        </div>
                        
                        {/* Footer Gradient for scroll hint */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#fafafa] to-transparent pointer-events-none lg:block hidden"></div>
                    </div>

                </div>
            </div>
        </div>

        {/* LIGHTBOX / ZOOM OVERLAY */}
        {isZoomed && file && (
            <div 
                ref={zoomRef}
                className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center animate-enter"
                tabIndex={-1}
            >
                {/* Close Button */}
                <button 
                    className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-[80] focus:ring-2 focus:ring-white outline-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(false);
                    }}
                    autoFocus
                    aria-label="Закрыть режим просмотра"
                >
                    <XMarkIcon className="w-6 h-6" strokeWidth={2} />
                </button>

                {/* Content */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                     {isPdf && fileUrl ? (
                         // PDF: Use Native Iframe for full scrolling/interaction
                         <div className="w-full h-full p-4 sm:p-10">
                             <iframe 
                                src={fileUrl} 
                                className="w-full h-full rounded-lg bg-white shadow-2xl"
                                title="PDF Preview"
                             />
                         </div>
                     ) : fileUrl ? (
                         // Image: Use Custom ImageZoom
                         <ImageZoom src={fileUrl} alt={analysisItem.fileName} />
                     ) : (
                         <div className="text-white/50">Ошибка загрузки файла</div>
                     )}
                </div>
            </div>
        )}
    </>,
    document.body
  );
};