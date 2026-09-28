import React, { useState } from 'react';
import { CryptoProvider } from './context/CryptoContext';
import { MainLayout } from './layouts/MainLayout';
import { LaboratorioPage } from './pages/LaboratorioPage';
import { ChatPage } from './pages/ChatPage';
import { DocsPage } from './pages/DocsPage';
import { ActiveTab } from './components/Navbar';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('LAB');

  return (
    <CryptoProvider>
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'LAB' && <LaboratorioPage />}
        {activeTab === 'CHAT' && <ChatPage />}
        {activeTab === 'DOCS' && <DocsPage />}
      </MainLayout>
    </CryptoProvider>
  );
};
