import React, { useState } from 'react';
import { OtpModule } from './OtpModule';
import { CaesarModule } from './CaesarModule';
import { VigenereModule } from './VigenereModule';
import { HillModule } from './HillModule';
import { TwoTimePadModule } from './TwoTimePadModule';
import { Binary, KeyRound, Grid, ShieldAlert, AlignLeft } from 'lucide-react';

export const Laboratorio: React.FC = () => {
  const [selectedEx, setSelectedEx] = useState<'OTP' | 'CAESAR' | 'VIGENERE' | 'HILL' | 'TTP'>('OTP');

  const tabs: Array<{ id: 'OTP' | 'CAESAR' | 'VIGENERE' | 'HILL' | 'TTP'; label: string; icon: any; num: string }> = [
    { id: 'OTP', label: 'One-Time Pad Decimal', icon: Binary, num: '01' },
    { id: 'CAESAR', label: 'César Generalizado', icon: KeyRound, num: '02' },
    { id: 'VIGENERE', label: 'Vigenère (≥4 palavras)', icon: AlignLeft, num: '03' },
    { id: 'HILL', label: 'Hill (Matriz 2×2)', icon: Grid, num: '04' },
    { id: 'TTP', label: 'Two-Time Pad (Opção B)', icon: ShieldAlert, num: '05' },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
      {/* Supercut-Style Tabs Bar */}
      <div className="glass-panel" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedEx === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedEx(tab.id)}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '5px 10px',
                fontSize: '0.78rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                opacity: isActive ? 0.7 : 0.4
              }}>
                {tab.num}
              </span>
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Exercise Module in Full Height Flexible Container */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedEx === 'OTP' && <OtpModule />}
        {selectedEx === 'CAESAR' && <CaesarModule />}
        {selectedEx === 'VIGENERE' && <VigenereModule />}
        {selectedEx === 'HILL' && <HillModule />}
        {selectedEx === 'TTP' && <TwoTimePadModule />}
      </div>
    </div>
  );
};


