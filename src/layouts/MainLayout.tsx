import React, { ReactNode } from 'react';
import { Navbar, ActiveTab } from '../components/Navbar';
import { useCrypto } from '../context/CryptoContext';

interface MainLayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  const { lanInfo, wsStatus, reconnect } = useCrypto();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lanInfo={lanInfo}
        wsStatus={wsStatus}
        onReconnect={reconnect}
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 15, 24, 0.6)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>CriptoLab</strong> — Implementação Pura em TypeScript (Zero Bibliotecas Externas)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            LAN IP: {lanInfo.localIp}:{lanInfo.port} | WebSockets: {wsStatus}
          </div>
        </div>
      </footer>
    </div>
  );
};
