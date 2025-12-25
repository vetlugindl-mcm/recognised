import React, { useCallback, useState } from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { AnalysisSkeleton } from './AnalysisSkeleton';
import { UnifiedProfileForm } from './UnifiedProfileForm';
import { FileDetailModal } from './FileDetailModal'; // Imported
import { StorageService } from '../services/storageService';
import { UploadedFile, AnalyzedDocument } from '../types';
import { SparklesIcon, CheckCircleIcon, BuildingOfficeIcon, LoaderIcon } from './icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { useFileHydration } from '../hooks/useFileHydration';
import { ErrorBoundary } from './ErrorBoundary';
import { useDocumentProcessor } from '../hooks/useDocumentProcessor';

const BtnIconWrapper: React.FC<{ active: boolean, children: React.ReactNode }> = ({ active, children }) => (
    <div className={`
        absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${active ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}
    `}>
        {children}
    </div>
);

export const DocumentScanner: React.FC = () => {
  const { 
    analysisResults, 
    setAnalysisResults, 
    updateAnalysisResult, 
    removeAnalysisResult
  } = useAppContext();

  const { notify } = useNotification();
  const { files, setFiles, isHydrating } = useFileHydration(analysisResults);
  
  // Logic extracted to custom hook
  const { 
      processFiles, 
      isAnalyzing, 
      isComplete, 
      setAnalysisState 
  } = useDocumentProcessor(files, analysisResults);

  // Computed Profile from Global State
  const userProfile = useUserProfile(analysisResults);

  // --- Modal State ---
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const newUploadedFiles: UploadedFile[] = [];

    // Process each new file
    for (const file of newFiles) {
        const id = crypto.randomUUID();
        
        // 1. Save to IndexedDB immediately
        await StorageService.saveFile(id, file);

        // 2. Create UI Object
        newUploadedFiles.push({ file, id });
    }

    setFiles((prev) => [...prev, ...newUploadedFiles]);
    setAnalysisState('idle'); 
    
    // Notify user
    notify('info', 'Файлы добавлены', `Загружено документов: ${newFiles.length}. Нажмите "Распознать".`);

  }, [setFiles, notify, setAnalysisState]);

  const handleRemoveFile = useCallback(async (id: string) => {
    // 1. Update UI State (Files)
    setFiles((prev) => prev.filter((f) => f.id !== id));

    // 2. Remove result from Global Context
    removeAnalysisResult(id);

    // 3. Remove from Storage
    await StorageService.deleteFile(id);

    if (selectedFileId === id) setSelectedFileId(null);

  }, [setFiles, removeAnalysisResult, selectedFileId]);

  const handleDataUpdate = useCallback((fileId: string, newData: AnalyzedDocument) => {
      // Find original item to preserve meta
      const original = analysisResults.find(r => r.fileId === fileId);
      if (original) {
          updateAnalysisResult(fileId, { ...original, data: newData });
      }
  }, [analysisResults, updateAnalysisResult]);

  const handleReset = async () => {
    const ids = files.map(f => f.id);
    for (const id of ids) {
        await StorageService.deleteFile(id);
    }
    setFiles([]);
    setAnalysisState('idle');
    setAnalysisResults([]);
    notify('info', 'Очистка', 'Список файлов и данные сброшены.');
  };

  // Find the selected analysis item AND the original file blob
  const selectedItem = analysisResults.find(r => r.fileId === selectedFileId) || null;
  const selectedFileObj = files.find(f => f.id === selectedFileId)?.file || null;
  
  const unprocessedCount = files.length - analysisResults.length;
  const hasResults = analysisResults.length > 0;

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
                <div className="glass-panel rounded-3xl p-1 shadow-2xl shadow-gray-200/50 border-gray-100">
                    <div className="bg-white/80 rounded-[1.25rem] p-8 space-y-8">
                        <div className={`grid grid-cols-1 ${files.length > 0 ? 'lg:grid-cols-2' : ''} gap-8 items-start transition-all duration-500`}>
                            <div className="w-full">
                                <Dropzone 
                                    onFilesAdded={handleFilesAdded} 
                                    disabled={isAnalyzing}
                                    isProcessing={isAnalyzing} 
                                    title="Загрузка документов"
                                    subtitle="Перетащите паспорт, диплом и удостоверения"
                                />
                            </div>
                            
                            {files.length > 0 && (
                                <div className="w-full animate-enter">
                                    <FileList 
                                        files={files} 
                                        onRemove={handleRemoveFile}
                                        onSelect={(id) => setSelectedFileId(id)}
                                        disabled={isAnalyzing}
                                        analysisResults={analysisResults}
                                        isAnalyzing={isAnalyzing}
                                    />
                                </div>
                            )}
                        </div>

                        {files.length > 0 && (
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleReset}
                                    disabled={isAnalyzing}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-50"
                                >
                                    Сброс
                                </button>
                                <button
                                    onClick={processFiles}
                                    disabled={isAnalyzing || unprocessedCount === 0}
                                    className={`
                                        relative overflow-hidden px-10 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 min-w-[180px]
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
                                            {isAnalyzing 
                                                ? `Обработка...` 
                                                : isComplete ? "Готово" : "Распознать AI"}
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
                <div className="flex items-center gap-3 mb-6 px-1 mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Результаты анализа</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {isHydrating || (isAnalyzing && analysisResults.length === 0) ? (
                    <AnalysisSkeleton />
                ) : (
                    <UnifiedProfileForm 
                        profile={userProfile} 
                        onUpdate={handleDataUpdate}
                    />
                )}
            </section>
            )}

            {/* DETAIL MODAL */}
            <FileDetailModal 
                isOpen={!!selectedFileId}
                onClose={() => setSelectedFileId(null)}
                analysisItem={selectedItem}
                file={selectedFileObj}
                onUpdate={handleDataUpdate}
            />
        </div>
    </ErrorBoundary>
  );
};