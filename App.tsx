import React from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { DocumentScanner } from './components/DocumentScanner';

const App: React.FC = () => {
  return (
    <DashboardLayout>
      <DocumentScanner />
    </DashboardLayout>
  );
};

export default App;