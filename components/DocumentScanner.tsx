import React, { useState, useCallback, useEffect } from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { AnalysisSkeleton } from './AnalysisSkeleton';
import { UnifiedProfileForm } from './UnifiedProfileForm';
import { analyzeFile } from '../services/gemini';
import { PdfService } from '../services/pdfService';
import { StorageService } from '../services/storageService';
import { UploadedFile, AnalysisState, AnalyzedDocument, AnalysisItem } from '../types';
import { SparklesIcon, CheckCircleIcon, BuildingOfficeIcon, LoaderIcon } from './icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { AppError } from '../utils/errors';

interface DocumentScannerProps {
    results: AnalysisItem[];
    onResultsChange: (results: AnalysisItem[] | ((prev: AnalysisItem[]) => AnalysisItem[])) => void;
}

const BtnIconWrapper = ({ active, children }: { active: boolean, children: React.ReactNode }) => (
    <div className={`
        absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${active ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}
    `}>
        {children}
    </div>
);

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ results, onResultsChange }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [isHydrating, setIsHydrating] = useState(true);

  // Computed Profile
  const userProfile = useUserProfile(results);

  // --- HYDRATION: Restore files from IndexedDB based on Results IDs ---
  useEffect(() => {
    const hydrateFiles = async () => {
        if (results.length === 0) {
            setIsHydrating(false);
            return;
        }

        // Only try to load files that we don't already have in state
        const existingIds = new Set(files.map(f => f.id));
        const missingItems = results.filter(r => !existingIds.has(r.fileId));

        if (missingItems.length === 0) {
            setIsHydrating(false);
            return;
        }

        const restoredFiles: UploadedFile[] = [];

        for (const item of missingItems) {
            const fileBlob = await StorageService.getFile(item.fileId);
            if (fileBlob) {
                // Determine preview
                let previewUrl: string | undefined = undefined;
                
                if (fileBlob.type.startsWith('image/')) {
                    previewUrl = URL.createObjectURL(fileBlob);
                } else if (fileBlob.type === 'application/pdf') {
                    // Async PDF thumb generation
                    PdfService.generateThumbnail(fileBlob).then(url => {
                        if (url) {
                            setFiles(prev => prev.map(f => f.id === item.fileId ? { ...f, previewUrl: url } : f));
                        }
                    });
                }

                restoredFiles.push({
                    id: item.fileId,
                    file: fileBlob,
                    previewUrl
                });
            } else {
                // If file is missing in IDB but exists in Metadata (rare sync error), remove from metadata
                console.warn(`File blob missing for ID: ${item.fileId}. Cleaning up metadata.`);
                onResultsChange(prev => prev.filter(p => p.fileId !== item.fileId));
            }
        }

        if (restoredFiles.length > 0) {
            setFiles(prev => [...prev, ...restoredFiles]);
        }
        setIsHydrating(false);
    };

    hydrateFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]); // Dependency on results ensures we try to load when App passes them

  // --- CLEANUP: Revoke Object URLs ---
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const newUploadedFiles: UploadedFile[] = [];

    // Process each new file
    for (const file of newFiles) {
        const id = crypto.randomUUID();
        
        // 1. Save to IndexedDB immediately
        await StorageService.saveFile(id, file);

        // 2. Create UI Object
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        
        newUploadedFiles.push({ file, id, previewUrl });

        // 3. Trigger PDF generation async
        if (file.type === 'application/pdf') {
             PdfService.generateThumbnail(file).then(thumbUrl => {
                if (thumbUrl) {
                    setFiles(prev => prev.map(f => f.id === id ? { ...f, previewUrl: thumbUrl } : f));
                }
             });
        }
    }

    setFiles((prev) => [...prev, ...newUploadedFiles]);
    setAnalysisState('idle'); 
  }, []);

  const handleRemoveFile = useCallback(async (id: string) => {
    // 1. Update UI State
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl && fileToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });

    // 2. Remove result from parent state
    onResultsChange(prev => prev.filter(r => r.fileId !== id));

    // 3. Remove from Storage
    await StorageService.deleteFile(id);

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
          const errorMessage = error instanceof AppError 
            ? error.publicMessage 
            : "Не удалось обработать файл";

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

  const handleReset = async () => {
    // Clear all files from storage and state
    const ids = files.map(f => f.id);
    for (const id of ids) {
        await StorageService.deleteFile(id);
    }
    setFiles([]);
    setAnalysisState('idle');
    onResultsChange([]);
  };

  const unprocessedCount = files.length - results.length;
  const isAnalyzing = analysisState === 'analyzing';
  const hasResults = results.length > 0;
  const isComplete = unprocessedCount === 0 && results.length > 0;

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
                                    relative overflow-hidden px-8 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg transition-all duration-300 min-w-[160px]
                                    hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                                    disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                                    ${isComplete
                                        ? 'bg-gray-800 shadow-gray-200' 
                                        : 'bg-black shadow-black/20'}
                                `}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <div className="relative w-5 h-5">
                                        <BtnIconWrapper active={isAnalyzing}>
                                            <LoaderIcon className="w-5 h-5 animate-spin text-white/80" />
                                        </BtnIconWrapper>
                                        <BtnIconWrapper active={isComplete}>
                                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        </BtnIconWrapper>
                                        <BtnIconWrapper active={!isAnalyzing && !isComplete}>
                                            <SparklesIcon className="w-4 h-4 text-white/90" />
                                        </BtnIconWrapper>
                                    </div>
                                    
                                    <span className="relative">
                                        {isAnalyzing ? "Обработка..." : isComplete ? "Готово" : "Распознать"}
                                    </span>
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

              {isAnalyzing || isHydrating ? (
                 <AnalysisSkeleton />
              ) : (
                 <UnifiedProfileForm profile={userProfile} onUpdate={handleDataUpdate} />
              )}
           </section>
        )}
    </div>
  );
};
