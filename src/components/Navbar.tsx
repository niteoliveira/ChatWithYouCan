import React from 'react';
import { Shield, FlaskConical, MessageSquare, Radio, BookOpen, Wifi, WifiOff, Users, RefreshCw } from 'lucide-react';
import { LanInfo } from '../types/crypto';

export type ActiveTab = 'LAB' | 'CHAT' | 'SNIFFER' | 'DOCS';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lanInfo: LanInfo;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  onReconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lanInfo,
  wsStatus,
  onReconnect
}) => {
  return (
    <header style={{
      background: 'rgba(10, 15, 24, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00ffaa, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050b14',
            boxShadow: '0 0 16px rgba(0, 255, 170, 0.35)'
          }}>
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>CriptoLab</span>
              <span style={{ color: '#00ffaa' }}>&</span>
              <span>CriptoChat LAN</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Aritmética Modular & Criptoanálise Pura
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('LAB')}
            className={activeTab === 'LAB' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <FlaskConical size={16} />
            Laboratório Formal
          </button>

          <button
            onClick={() => setActiveTab('CHAT')}
            className={activeTab === 'CHAT' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <MessageSquare size={16} />
            CriptoChat LAN
          </button>

          <button
            onClick={() => setActiveTab('SNIFFER')}
            className={activeTab === 'SNIFFER' ? 'btn-danger' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Radio size={16} />
            Sniffer & Two-Time Pad
          </button>

          <button
            onClick={() => setActiveTab('DOCS')}
            className={activeTab === 'DOCS' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16} />
            React & Data Flow
          </button>
        </nav>

        {/* LAN Status & Peers Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Peer count */}
          <div className="badge badge-cyan" title="Dispositivos conectados">
            <Users size={13} />
            <span>{lanInfo.clientCount} online</span>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`badge ${
              wsStatus === 'connected'
                ? 'badge-emerald'
                : wsStatus === 'connecting'
                ? 'badge-amber'
                : 'badge-crimson'
            }`}
            style={{ cursor: 'pointer' }}
            onClick={onReconnect}
            title="Clique para reconectar WebSocket"
          >
            {wsStatus === 'connected' ? (
              <>
                <Wifi size={13} />
                <span>LAN: {lanInfo.localIp}:{lanInfo.port}</span>
              </>
            ) : wsStatus === 'connecting' ? (
              <>
                <RefreshCw size={13} className="spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <WifiOff size={13} />
                <span>Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
