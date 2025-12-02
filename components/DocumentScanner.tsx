import React, { useState, useCallback } from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { AnalysisResult, AnalysisSkeleton } from './AnalysisResult';
import { analyzeFile } from '../services/gemini';
import { UploadedFile, AnalysisState, AnalyzedDocument, AnalysisItem } from '../types';
import { SparklesIcon, CheckCircleIcon } from './icons';

// Helper to generate PDF thumbnail using pdf.js
const generatePdfThumbnail = async (file: File): Promise<string | null> => {
  try {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      console.warn("PDF.js library not found");
      return null;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    // Scale for thumbnail (target width ~200px for high res small preview)
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = 200 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Draw white background (PDFs might have transparent background in canvas)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };
    
    await page.render(renderContext).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error("Error generating PDF thumbnail:", error);
    return null;
  }
};

export const DocumentScanner: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [results, setResults] = useState<AnalysisItem[]>([]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    // 1. Add files immediately with basic info
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
    setAnalysisState('idle'); 

    // 2. Process PDFs asynchronously for thumbnails
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
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    setResults(prev => prev.filter(r => r.fileId !== id));
  }, []);

  const handleAnalyze = async () => {
    const unprocessedFiles = files.filter(f => !results.some(r => r.fileId === f.id));

    if (unprocessedFiles.length === 0) {
      if (files.length === 0) {
          alert("Пожалуйста, загрузите файлы.");
      } else {
          alert("Все загруженные файлы уже обработаны.");
      }
      return;
    }

    setAnalysisState('analyzing');
    
    try {
      const promises = unprocessedFiles.map(async (fileObj): Promise<AnalysisItem> => {
        try {
          const resultJsonString = await analyzeFile(fileObj.file);
          let parsedData: AnalyzedDocument;
          
          try {
            // Robust JSON extraction
            const firstBrace = resultJsonString.indexOf('{');
            const lastBrace = resultJsonString.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1) {
                 const cleanJson = resultJsonString.substring(firstBrace, lastBrace + 1);
                 const json = JSON.parse(cleanJson);
                 
                 if (json.type) {
                    json.type = json.type.toLowerCase();
                 }
                 
                 if (json.type === 'passport' || json.type === 'diploma') {
                    parsedData = json as AnalyzedDocument;
                 } else {
                     parsedData = { type: 'raw', rawText: resultJsonString };
                 }
            } else {
                 parsedData = { type: 'raw', rawText: resultJsonString };
            }
          } catch (e) {
            console.error(`JSON Parse error for ${fileObj.file.name}`, e);
            parsedData = { type: 'raw', rawText: resultJsonString };
          }

          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            data: parsedData
          };

        } catch (error) {
          console.error(`Error analyzing ${fileObj.file.name}:`, error);
          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            data: null,
            error: "Не удалось прочитать файл"
          };
        }
      });

      const newResults = await Promise.all(promises);
      
      setResults(prevResults => {
          const combined = [...prevResults, ...newResults];
          // Sorting: Passport (0) -> Diploma (1) -> Others (2)
          return combined.sort((a, b) => {
            const getPriority = (item: AnalysisItem) => {
              if (item.data?.type === 'passport') return 0;
              if (item.data?.type === 'diploma') return 1;
              return 2;
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
    setResults([]);
  };

  const unprocessedCount = files.length - results.length;
  const isAnalyzing = analysisState === 'analyzing';

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-10">
        
        {/* SECTION 1: UPLOAD AREA */}
        <section className="animate-enter">
             
             <div className="glass-panel rounded-2xl p-1 shadow-xl shadow-gray-200/50 border-gray-100">
                 <div className="bg-white/70 rounded-xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <Dropzone onFilesAdded={handleFilesAdded} disabled={isAnalyzing} />
                        
                        {files.length > 0 && (
                             <div className="w-full">
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
                                        <>
                                            {/* No Spinner here, we use Skeletons below for better UX */}
                                            <span>Обработка данных...</span>
                                        </>
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

        {/* SECTION 2: RESULTS or SKELETONS */}
        {(results.length > 0 || isAnalyzing) && (
            <section className="animate-enter" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-6 px-1 mt-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] select-none">
                        {isAnalyzing ? 'Анализ...' : 'Данные'}
                     </span>
                     <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                    {/* Render Skeletons when analyzing */}
                    {isAnalyzing && (
                        <>
                           <AnalysisSkeleton />
                           <AnalysisSkeleton />
                        </>
                    )}

                    {/* Render Results when complete */}
                    {!isAnalyzing && results.map((item) => (
                        <AnalysisResult key={item.fileId} item={item} />
                    ))}
                </div>
            </section>
        )}
    </div>
  );
};
