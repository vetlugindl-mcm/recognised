import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { DocumentScanner } from './components/DocumentScanner';
import { TemplatesView } from './components/TemplatesView';
import { ViewState, AnalysisItem, DocumentTemplate } from './types';
import { useUserProfile } from './hooks/useUserProfile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('scanner');
  
  // --- Global State ---
  // Lifted here so data persists when switching between 'scanner' and 'templates'
  const [analysisResults, setAnalysisResults] = useState<AnalysisItem[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);

  // Computed Profile based on analysis results
  const userProfile = useUserProfile(analysisResults);

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