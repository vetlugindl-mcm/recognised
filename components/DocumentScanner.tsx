import React, { useState, useCallback, useEffect } from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { AnalysisSkeleton } from './AnalysisSkeleton';
import { UnifiedProfileForm } from './UnifiedProfileForm';
import { analyzeFile } from '../services/gemini';
import { UploadedFile, AnalysisState, AnalyzedDocument, AnalysisItem } from '../types';
import { SparklesIcon, CheckCircleIcon, BuildingOfficeIcon } from './icons';
import { useUserProfile } from '../hooks/useUserProfile';

// --- Types for PDF.js Integration ---
interface PDFPageViewport {
    width: number;
    height: number;
}
interface PDFPageProxy {
    getViewport: (params: { scale: number }) => PDFPageViewport;
    render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PDFPageViewport }) => { promise: Promise<void> };
}
interface PDFDocumentProxy {
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}
interface PDFJSStatic {
    getDocument: (data: { data: ArrayBuffer }) => { promise: Promise<PDFDocumentProxy> };
    GlobalWorkerOptions: { workerSrc: string };
}

declare global {
  interface Window {
    pdfjsLib?: PDFJSStatic;
  }
}

// --- Utils ---

/**
 * Generates a thumbnail from the first page of a PDF file.
 * Uses client-side rendering via PDF.js.
 */
const generatePdfThumbnail = async (file: File): Promise<string | null> => {
  try {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      console.warn("PDF.js library not loaded via CDN");
      return null;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    // Scale for thumbnail (target width ~200px)
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = 200 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Draw white background (handle transparent PDFs)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };
    
    await page.render(renderContext).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error("PDF Thumbnail Generation Error:", error);
    return null;
  }
};

interface DocumentScannerProps {
    results: AnalysisItem[];
    onResultsChange: (results: AnalysisItem[] | ((prev: AnalysisItem[]) => AnalysisItem[])) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ results, onResultsChange }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');

  // Computed Profile
  const userProfile = useUserProfile(results);

  // Resource Cleanup: Revoke Object URLs when files change or component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    // 1. Optimistic UI update: Add files immediately
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: crypto.randomUUID(), // Modern UUID generation
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
    setAnalysisState('idle'); 

    // 2. Process PDFs asynchronously
    uploadedFiles.forEach(async (uFile) => {
        if (uFile.file.type === 'application/pdf') {
            const thumbUrl = await generatePdfThumbnail(uFile.file);
            if (thumbUrl) {
                setFiles(prev => prev.map(f => 
                    f.id === uFile.id ? { ...f, previewUrl: thumbUrl } : f
                ));
            }
        }
    });
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl && fileToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    onResultsChange(prev => prev.filter(r => r.fileId !== id));
  }, [onResultsChange]);

  const handleDataUpdate = useCallback((fileId: string, newData: AnalyzedDocument) => {
    onResultsChange(prevResults => 
      prevResults.map(item => 
        item.fileId === fileId ? { ...item, data: newData } : item
      )
    );
  }, [onResultsChange]);

  const handleAnalyze = async () => {
    const unprocessedFiles = files.filter(f => !results.some(r => r.fileId === f.id));

    if (unprocessedFiles.length === 0) {
      alert(files.length === 0 ? "Пожалуйста, загрузите файлы." : "Все загруженные файлы уже обработаны.");
      return;
    }

    setAnalysisState('analyzing');
    
    try {
      const promises = unprocessedFiles.map(async (fileObj): Promise<AnalysisItem> => {
        try {
          const analyzedData = await analyzeFile(fileObj.file);
          
          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            data: analyzedData
          };

        } catch (error: unknown) {
          console.error(`Error analyzing ${fileObj.file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : "Не удалось обработать файл";
          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            data: null,
            error: errorMessage
          };
        }
      });

      const newResults = await Promise.all(promises);
      
      onResultsChange(prevResults => {
          const combined = [...prevResults, ...newResults];
          // Sort priorities: Passport (0) -> Qualification (1) -> Diploma (2) -> Other
          return combined.sort((a, b) => {
            const getPriority = (item: AnalysisItem) => {
              if (item.data?.type === 'passport') return 0;
              if (item.data?.type === 'qualification') return 1;
              if (item.data?.type === 'diploma') return 2;
              return 3;
            };
            return getPriority(a) - getPriority(b);
          });
      });

      setAnalysisState('complete');

    } catch (error) {
      console.error("Global analysis error:", error);
      setAnalysisState('error');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setAnalysisState('idle');
    onResultsChange([]);
  };

  const unprocessedCount = files.length - results.length;
  const isAnalyzing = analysisState === 'analyzing';
  const hasResults = results.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
        
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between animate-enter">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <BuildingOfficeIcon className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Внесение в НОПРИЗ</h1>
                  <p className="text-sm text-gray-500">Загрузите документы для формирования цифрового профиля специалиста</p>
              </div>
          </div>
        </div>

        {/* UPLOAD AREA */}
        <section className="animate-enter" style={{ animationDelay: '100ms' }}>
             <div className="glass-panel rounded-2xl p-1 shadow-xl shadow-gray-200/50 border-gray-100">
                 <div className="bg-white/70 rounded-xl p-6 space-y-6">
                    <div className={`grid grid-cols-1 ${files.length > 0 ? 'md:grid-cols-2' : ''} gap-8 items-start transition-all duration-300`}>
                        <div className="w-full">
                            <Dropzone 
                                onFilesAdded={handleFilesAdded} 
                                disabled={isAnalyzing} 
                                title="Загрузить документы"
                                subtitle="Нажмите или перетащите JPG, PDF, DOC"
                            />
                        </div>
                        
                        {files.length > 0 && (
                             <div className="w-full animate-enter">
                                <FileList 
                                    files={files} 
                                    onRemove={handleRemoveFile} 
                                    disabled={isAnalyzing}
                                    processedIds={results.map(r => r.fileId)}
                                    isAnalyzing={isAnalyzing}
                                />
                             </div>
                        )}
                    </div>

                    {files.length > 0 && (
                         <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/50">
                            <button
                                onClick={handleReset}
                                disabled={isAnalyzing}
                                className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-50"
                            >
                                Сброс
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || unprocessedCount === 0}
                                className={`
                                    relative overflow-hidden px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg transition-all duration-300
                                    hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                                    disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                                    ${unprocessedCount === 0 && results.length > 0
                                        ? 'bg-gray-800 shadow-gray-200' 
                                        : 'bg-black shadow-black/20'}
                                `}
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    {isAnalyzing ? (
                                        <span>Обработка данных...</span>
                                    ) : unprocessedCount === 0 && results.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                            <span>Готово</span>
                                        </div>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-4 h-4 text-white/90" />
                                            <span>Распознать</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    )}
                 </div>
             </div>
        </section>

        {/* UNIFIED SUMMARY FORM */}
        {(hasResults || isAnalyzing) && (
           <section className="animate-enter" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-6 px-1 mt-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] select-none">
                      Профиль кандидата
                   </span>
                   <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {isAnalyzing ? (
                 <AnalysisSkeleton />
              ) : (
                 <UnifiedProfileForm profile={userProfile} onUpdate={handleDataUpdate} />
              )}
           </section>
        )}
    </div>
  );
};