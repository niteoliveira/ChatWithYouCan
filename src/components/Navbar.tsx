import React from 'react';
import { FlaskConical, MessageSquare, BookOpen, Users, RefreshCw, RadioTower } from 'lucide-react';
import { LanInfo } from '../types/crypto';

export type ActiveTab = 'LAB' | 'CHAT' | 'DOCS';

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
      background: 'rgba(10, 11, 13, 0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Supercut-Style Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#16171d',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <RadioTower size={17} color="#fdfff1" strokeWidth={2} />
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-coral)'
            }} />
          </div>

          <div>
            <div style={{
              fontWeight: 700,
              fontSize: '0.96rem',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-warm)'
            }}>
              <span>CriptoLab</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>/</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.86rem' }}>LAN</span>
            </div>
          </div>
        </div>

        {/* Supercut-Style Segmented Navigation */}
        <nav className="segmented-control">
          <button
            type="button"
            onClick={() => setActiveTab('LAB')}
            className={`segmented-btn ${activeTab === 'LAB' ? 'active' : ''}`}
          >
            <FlaskConical size={14} />
            <span>Laboratório</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`segmented-btn ${activeTab === 'CHAT' ? 'active' : ''}`}
          >
            <MessageSquare size={14} />
            <span>Chat em Rede</span>
          </button>


          <button
            type="button"
            onClick={() => setActiveTab('DOCS')}
            className={`segmented-btn ${activeTab === 'DOCS' ? 'active' : ''}`}
          >
            <BookOpen size={14} />
            <span>Arquitetura</span>
          </button>
        </nav>

        {/* LAN Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="badge badge-neutral" title="Clientes ativos na rede">
            <Users size={12} />
            <span>{lanInfo.clientCount} online</span>
          </div>

          <button
            type="button"
            onClick={onReconnect}
            className={`badge ${
              wsStatus === 'connected'
                ? 'badge-emerald'
                : wsStatus === 'connecting'
                ? 'badge-amber'
                : 'badge-coral'
            }`}
            style={{ cursor: 'pointer', background: 'transparent' }}
            title="Clique para reconectar ao WebSocket"
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: wsStatus === 'connected' ? '#10b981' : wsStatus === 'connecting' ? '#f59e0b' : '#ff3157',
              display: 'inline-block'
            }} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {wsStatus === 'connected'
                ? `${lanInfo.localIp}:${lanInfo.port}`
                : wsStatus === 'connecting'
                ? 'Conectando...'
                : 'Offline (reconectar)'}
            </span>
            {wsStatus === 'connecting' && <RefreshCw size={11} className="spin" />}
          </button>
        </div>
      </div>
    </header>
  );
};

