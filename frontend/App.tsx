import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { ChatPanel } from './components/ChatPanel';
import { AIAssistant } from './components/AIAssistant';
import { Login } from './components/Login';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  
  // Initialize view from local storage or default to dashboard
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'settings'>(() => {
    const saved = localStorage.getItem('collabflow_view');
    if (saved === 'dashboard' || saved === 'chat' || saved === 'settings') {
      return saved;
    }
    return 'dashboard';
  });

  const handleViewChange = (view: 'dashboard' | 'chat' | 'settings') => {
    setActiveView(view);
    localStorage.setItem('collabflow_view', view);
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Layout activeView={activeView} onViewChange={handleViewChange}>
      {activeView === 'dashboard' && <KanbanBoard />}
      {activeView === 'chat' && <ChatPanel />}
      {activeView === 'settings' && (
        <div className="p-8 text-center text-slate-500">
          Settings Panel Placeholder
        </div>
      )}
      <AIAssistant />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
