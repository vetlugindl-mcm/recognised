
import React, { useState, useCallback } from 'react';
import { Dropzone } from './components/Dropzone';
import { FileList } from './components/FileList';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeFile } from './services/gemini';
import { UploadedFile, AnalysisState, AnalyzedDocument, AnalysisItem } from './types';
import { RocketLaunchIcon } from './components/Icons';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [results, setResults] = useState<AnalysisItem[]>([]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
    setAnalysisState('idle');
    setResults([]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    // Also remove the result if it exists
    setResults(prev => prev.filter(r => r.fileId !== id));
  }, []);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert("Пожалуйста, загрузите хотя бы один файл (JPG, PDF или DOC) для анализа.");
      return;
    }

    setAnalysisState('analyzing');
    setResults([]);
    
    try {
      const promises = files.map(async (fileObj): Promise<AnalysisItem> => {
        try {
          const resultJsonString = await analyzeFile(fileObj.file);
          let parsedData: AnalyzedDocument;
          
          try {
            // Clean up markdown code blocks if present
            const cleanJson = resultJsonString.replace(/```json\n?|\n?```/g, '').trim();
            const json = JSON.parse(cleanJson);
            
            // Normalize type to lowercase
            if (json.type) {
                json.type = json.type.toLowerCase();
            }
            
            if (json.type === 'passport' || json.type === 'diploma') {
                parsedData = json as AnalyzedDocument;
            } else {
                 console.warn(`Unknown document type for ${fileObj.file.name}:`, json.type);
                 parsedData = {
                    type: 'raw',
                    rawText: resultJsonString
                 };
            }
          } catch (e) {
            console.error(`JSON Parse error for ${fileObj.file.name}`, e);
            parsedData = {
                type: 'raw',
                rawText: resultJsonString 
            };
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

      const analysisResults = await Promise.all(promises);
      
      // Sorting: Passport (0) -> Diploma (1) -> Others (2)
      const sortedResults = analysisResults.sort((a, b) => {
        const getPriority = (item: AnalysisItem) => {
          if (item.data?.type === 'passport') return 0;
          if (item.data?.type === 'diploma') return 1;
          return 2;
        };
        return getPriority(a) - getPriority(b);
      });

      setResults(sortedResults);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col transition-all duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AI Сканер Документов</h1>
              <p className="text-sm text-gray-500 font-medium">Загрузите паспорт или диплом для автоматического распознавания</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Dropzone Area */}
          <div className="relative group">
             <Dropzone onFilesAdded={handleFilesAdded} disabled={analysisState === 'analyzing'} />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FileList 
                files={files} 
                onRemove={handleRemoveFile} 
                disabled={analysisState === 'analyzing'} 
              />
              
              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                 <button
                  onClick={handleReset}
                  disabled={analysisState === 'analyzing'}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  Очистить все
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analysisState === 'analyzing' || analysisState === 'complete'}
                  className={`
                    relative overflow-hidden px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200
                    transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                    ${analysisState === 'complete' ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'}
                  `}
                >
                  {analysisState === 'analyzing' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Обработка...
                    </span>
                  ) : analysisState === 'complete' ? (
                    'Распознано'
                  ) : (
                    'Распознать данные'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {results.length > 0 && (
             <div className="space-y-6">
                {results.map((item) => (
                    <AnalysisResult key={item.fileId} item={item} />
                ))}
             </div>
          )}
          
          {analysisState === 'error' && results.length === 0 && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                  Не удалось распознать документы. Произошла системная ошибка.
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;
