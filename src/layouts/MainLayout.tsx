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
    <div style={{ height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lanInfo={lanInfo}
        wsStatus={wsStatus}
        onReconnect={reconnect}
      />

      <main style={{
        flex: 1,
        minHeight: 0,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {children}
      </main>

      <footer style={{
        height: '28px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '0 20px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-warm)' }}>CriptoLab</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span>TypeScript puro</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span>Sem bibliotecas externas</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
            LAN: {lanInfo.localIp}:{lanInfo.port}
          </div>
        </div>
      </footer>
    </div>
  );
};


