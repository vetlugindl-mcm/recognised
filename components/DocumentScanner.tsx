import React, { useState, useCallback } from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { AnalysisSkeleton } from './AnalysisSkeleton';
import { UnifiedProfileForm } from './UnifiedProfileForm';
import { analyzeFile } from '../services/gemini';
import { StorageService } from '../services/storageService';
import { UploadedFile, AnalysisState, AnalyzedDocument, AnalysisItem } from '../types';
import { SparklesIcon, CheckCircleIcon, BuildingOfficeIcon, LoaderIcon } from './icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { AppError } from '../utils/errors';
import { useAppContext } from '../context/AppContext';
import { useFileHydration } from '../hooks/useFileHydration';
import { ErrorBoundary } from './ErrorBoundary';

const BtnIconWrapper = ({ active, children }: { active: boolean, children: React.ReactNode }) => (
    <div className={`
        absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${active ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}
    `}>
        {children}
    </div>
);

export const DocumentScanner: React.FC = () => {
  const { analysisResults, setAnalysisResults, updateAnalysisResult, removeAnalysisResult } = useAppContext();
  const { files, setFiles, isHydrating } = useFileHydration(analysisResults);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');

  // Computed Profile from Global State
  const userProfile = useUserProfile(analysisResults);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const newUploadedFiles: UploadedFile[] = [];

    // Process each new file
    for (const file of newFiles) {
        const id = crypto.randomUUID();
        
        // 1. Save to IndexedDB immediately
        await StorageService.saveFile(id, file);

        // 2. Create UI Object (No more manual Preview URL creation here)
        newUploadedFiles.push({ file, id });
    }

    setFiles((prev) => [...prev, ...newUploadedFiles]);
    setAnalysisState('idle'); 
  }, [setFiles]);

  const handleRemoveFile = useCallback(async (id: string) => {
    // 1. Update UI State (Files)
    setFiles((prev) => prev.filter((f) => f.id !== id));

    // 2. Remove result from Global Context
    removeAnalysisResult(id);

    // 3. Remove from Storage
    await StorageService.deleteFile(id);

  }, [setFiles, removeAnalysisResult]);

  const handleDataUpdate = useCallback((fileId: string, newData: AnalyzedDocument) => {
      // Find original item to preserve meta
      const original = analysisResults.find(r => r.fileId === fileId);
      if (original) {
          updateAnalysisResult(fileId, { ...original, data: newData });
      }
  }, [analysisResults, updateAnalysisResult]);

  const handleAnalyze = async () => {
    const unprocessedFiles = files.filter(f => !analysisResults.some(r => r.fileId === f.id));

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
      
      // Update Context with sorting logic
      setAnalysisResults(prevResults => {
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
    const ids = files.map(f => f.id);
    for (const id of ids) {
        await StorageService.deleteFile(id);
    }
    setFiles([]);
    setAnalysisState('idle');
    setAnalysisResults([]);
  };

  const unprocessedCount = files.length - analysisResults.length;
  const isAnalyzing = analysisState === 'analyzing';
  const hasResults = analysisResults.length > 0;
  const isComplete = unprocessedCount === 0 && analysisResults.length > 0;

  return (
    <ErrorBoundary fallbackTitle="Ошибка в модуле сканирования">
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
            
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between animate-enter">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <BuildingOfficeIcon className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Загрузка документов</h1>
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
                                        analysisResults={analysisResults}
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
    </ErrorBoundary>
  );
};