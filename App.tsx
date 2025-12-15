import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { DocumentScanner } from './components/DocumentScanner';
import { TemplatesView } from './components/TemplatesView';
import { ViewState, AnalysisItem, DocumentTemplate } from './types';
import { useUserProfile } from './hooks/useUserProfile';
import { StorageService } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('scanner');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // --- Global State ---
  const [analysisResults, setAnalysisResults] = useState<AnalysisItem[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);

  // --- HYDRATION (Load from Storage) ---
  useEffect(() => {
    const hydrate = async () => {
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
      setIsLoaded(true);
    };

    hydrate();
  }, []);

  // --- PERSISTENCE (Save on Change) ---
  
  // Save Analysis Results
  useEffect(() => {
    if (isLoaded) {
        StorageService.saveAnalysisResults(analysisResults);
    }
  }, [analysisResults, isLoaded]);

  // Save Templates Meta (Files are saved individually by the component)
  useEffect(() => {
    if (isLoaded) {
        StorageService.saveTemplatesMeta(templates);
    }
  }, [templates, isLoaded]);

  // Computed Profile
  const userProfile = useUserProfile(analysisResults);

  if (!isLoaded) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#fafafa]">
              <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <DashboardLayout activeView={currentView} onNavigate={setCurrentView}>
        {currentView === 'templates' ? (
           <TemplatesView 
              templates={templates} 
              onTemplatesChange={setTemplates}
              userProfile={userProfile}
           />
        ) : (
           <DocumentScanner 
              results={analysisResults}
              onResultsChange={setAnalysisResults}
           />
        )}
    </DashboardLayout>
  );
};

export default App;
