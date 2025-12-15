import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AnalysisItem, DocumentTemplate } from '../types';
import { StorageService } from '../services/storageService';

interface AppContextType {
  analysisResults: AnalysisItem[];
  templates: DocumentTemplate[];
  isLoaded: boolean;
  
  // Actions
  setAnalysisResults: (results: AnalysisItem[] | ((prev: AnalysisItem[]) => AnalysisItem[])) => void;
  setTemplates: (templates: DocumentTemplate[] | ((prev: DocumentTemplate[]) => DocumentTemplate[])) => void;
  
  // Helpers
  addAnalysisResult: (item: AnalysisItem) => void;
  updateAnalysisResult: (fileId: string, item: AnalysisItem) => void;
  removeAnalysisResult: (fileId: string) => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisItem[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- HYDRATION (Load from Storage) ---
  useEffect(() => {
    const hydrate = async () => {
      try {
        // 1. Load Analysis Metadata (Sync)
        const savedResults = StorageService.loadAnalysisResults();
        setAnalysisResults(savedResults);

        // 2. Load Templates Metadata & Reconstruct Files (Async)
        const templatesMeta = StorageService.loadTemplatesMeta();
        const loadedTemplates: DocumentTemplate[] = [];

        for (const meta of templatesMeta) {
          const file = await StorageService.getFile(meta.id);
          if (file) {
            loadedTemplates.push({ ...meta, file });
          }
        }
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error("Hydration failed:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    hydrate();
  }, []);

  // --- PERSISTENCE (Save on Change) ---
  
  useEffect(() => {
    if (isLoaded) {
        StorageService.saveAnalysisResults(analysisResults);
    }
  }, [analysisResults, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
        StorageService.saveTemplatesMeta(templates);
    }
  }, [templates, isLoaded]);

  // --- HELPER ACTIONS ---

  const addAnalysisResult = useCallback((item: AnalysisItem) => {
    setAnalysisResults(prev => {
        // Sort priority: Passport (0), Qual (1), Diploma (2), Others (3)
        const combined = [...prev, item];
        return combined.sort((a, b) => {
            const getPriority = (i: AnalysisItem) => {
                if (i.data?.type === 'passport') return 0;
                if (i.data?.type === 'qualification') return 1;
                if (i.data?.type === 'diploma') return 2;
                return 3;
            };
            return getPriority(a) - getPriority(b);
        });
    });
  }, []);

  const updateAnalysisResult = useCallback((fileId: string, updatedItem: AnalysisItem) => {
    setAnalysisResults(prev => prev.map(item => item.fileId === fileId ? updatedItem : item));
  }, []);

  const removeAnalysisResult = useCallback((fileId: string) => {
    setAnalysisResults(prev => prev.filter(item => item.fileId !== fileId));
  }, []);

  const resetAllData = useCallback(async () => {
      // Clear State
      setAnalysisResults([]);
      setTemplates([]);
      
      // We don't clear IDB here directly as components might handle file deletions, 
      // but conceptually we could clear keys. 
      // For safety, we rely on StorageService.performCleanup or individual file deletion.
  }, []);

  const value = {
    analysisResults,
    templates,
    isLoaded,
    setAnalysisResults,
    setTemplates,
    addAnalysisResult,
    updateAnalysisResult,
    removeAnalysisResult,
    resetAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};