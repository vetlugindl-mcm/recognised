import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { DocumentScanner } from './components/DocumentScanner';
import { TemplatesView } from './components/TemplatesView';
import { NostroyView } from './components/NostroyView';
import { ViewState } from './types';
import { useAppContext } from './context/AppContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('scanner');
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
        {currentView === 'templates' && (
           <TemplatesView />
        )}
        
        {currentView === 'nostroy' && (
            <NostroyView />
        )}

        {currentView === 'scanner' && (
           <DocumentScanner />
        )}
    </DashboardLayout>
  );
};

export default App;