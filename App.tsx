import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { DocumentScanner } from './components/DocumentScanner';
import { TemplatesView } from './components/TemplatesView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('scanner');

  return (
    <DashboardLayout activeView={currentView} onNavigate={setCurrentView}>
        {currentView === 'templates' ? <TemplatesView /> : <DocumentScanner />}
    </DashboardLayout>
  );
};

export default App;