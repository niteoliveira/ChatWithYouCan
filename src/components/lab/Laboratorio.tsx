import React, { useState } from 'react';
import { OtpModule } from './OtpModule';
import { CaesarModule } from './CaesarModule';
import { VigenereModule } from './VigenereModule';
import { HillModule } from './HillModule';
import { TwoTimePadModule } from './TwoTimePadModule';
import { Binary, KeyRound, Grid, ShieldAlert, Sparkles } from 'lucide-react';

export const Laboratorio: React.FC = () => {
  const [selectedEx, setSelectedEx] = useState<'OTP' | 'CAESAR' | 'VIGENERE' | 'HILL' | 'TTP'>('OTP');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '20px' }}>
      {/* Exercise selector buttons */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedEx('OTP')}
          className={selectedEx === 'OTP' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <Binary size={15} /> Ex 1: One-Time Pad Decimal
        </button>

        <button
          onClick={() => setSelectedEx('CAESAR')}
          className={selectedEx === 'CAESAR' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <KeyRound size={15} /> Ex 2: César Generalizado
        </button>

        <button
          onClick={() => setSelectedEx('VIGENERE')}
          className={selectedEx === 'VIGENERE' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <Sparkles size={15} /> Ex 3: Vigenère (≥ 4 Palavras)
        </button>

        <button
          onClick={() => setSelectedEx('HILL')}
          className={selectedEx === 'HILL' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <Grid size={15} /> Ex 4: Hill (Matriz 2×2)
        </button>

        <button
          onClick={() => setSelectedEx('TTP')}
          className={selectedEx === 'TTP' ? 'btn-danger' : 'btn-secondary'}
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <ShieldAlert size={15} /> Opção B: Two-Time Pad
        </button>
      </div>

      {/* Render Active Exercise Module */}
      {selectedEx === 'OTP' && <OtpModule />}
      {selectedEx === 'CAESAR' && <CaesarModule />}
      {selectedEx === 'VIGENERE' && <VigenereModule />}
      {selectedEx === 'HILL' && <HillModule />}
      {selectedEx === 'TTP' && <TwoTimePadModule />}
    </div>
  );
};
