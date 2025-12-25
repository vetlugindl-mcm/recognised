import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { AnalysisItem, DocumentTemplate } from '../types';
import { useAnalysisData } from '../hooks/useAnalysisData';
import { useTemplateData } from '../hooks/useTemplateData';
import { useNotification } from '../context/NotificationContext';

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
  // 1. Composition: Data Hooks
  const {
    analysisResults,
    setAnalysisResults,
    addAnalysisResult,
    updateAnalysisResult,
    removeAnalysisResult,
    isAnalysisLoaded
  } = useAnalysisData();

  const {
    templates,
    setTemplates,
    isTemplatesLoaded
  } = useTemplateData();

  // Notification is now consumed from its own Context, 
  // but we use it here for the global reset action.
  const { notify } = useNotification();

  // 2. Aggregated Loading State
  const isLoaded = isAnalysisLoaded && isTemplatesLoaded;

  // 3. Global Actions
  const resetAllData = useCallback(async () => {
      setAnalysisResults([]);
      setTemplates([]);
      notify('info', 'Данные сброшены', 'Все файлы удалены из хранилища');
  }, [setAnalysisResults, setTemplates, notify]);

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