import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { DocumentScanner } from './components/DocumentScanner';
import { TemplatesView } from './components/TemplatesView';
import { NostroyView } from './components/NostroyView';
import { ViewState } from './types';
import { useAppContext } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  // Set default view to 'upload_docs' based on new structure
  const [currentView, setCurrentView] = useState<ViewState>('upload_docs');
  const { isLoaded } = useAppContext();

  if (!isLoaded) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#fafafa]">
              <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <DashboardLayout activeView={currentView} onNavigate={setCurrentView}>
        {/* Mapping New IDs to Existing Components */}
        
        {currentView === 'templates' && (
           <ErrorBoundary fallbackTitle="Ошибка в шаблонах">
              <TemplatesView />
           </ErrorBoundary>
        )}
        
        {currentView === 'nostroy_match' && (
            <ErrorBoundary fallbackTitle="Ошибка проверки соответствия">
                <NostroyView mode="nostroy" />
            </ErrorBoundary>
        )}

        {currentView === 'nopriz_match' && (
            <ErrorBoundary fallbackTitle="Ошибка проверки соответствия">
                <NostroyView mode="nopriz" />
            </ErrorBoundary>
        )}

        {currentView === 'upload_docs' && (
           <DocumentScanner />
        )}
    </DashboardLayout>
  );
};

export default App;