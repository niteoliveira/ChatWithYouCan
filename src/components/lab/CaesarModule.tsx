import React, { useState, useMemo } from 'react';
import { Lock, Unlock, AlertCircle, ArrowRightLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { encryptCaesar, decryptCaesar } from '../../utils/cryptoEngine';

export const CaesarModule: React.FC = () => {
  const [mode, setMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [plaintext, setPlaintext] = useState<string>('Ataque ao amanhecer! Sala 101.');
  const [shift, setShift] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  // Real-time calculation based on inputs & mode
  const { result, error } = useMemo(() => {
    if (!plaintext.trim()) {
      return { result: null, error: 'Digite um texto para processamento.' };
    }

    try {
      if (mode === 'ENCRYPT') {
        const res = encryptCaesar(plaintext, shift);
        return { result: res, error: null };
      } else {
        const res = decryptCaesar(plaintext, shift);
        return { result: res, error: null };
      }
    } catch (err: any) {
      return { result: null, error: err.message || 'Erro ao processar Cifra de César.' };
    }
  }, [mode, plaintext, shift]);

  const handleSwap = () => {
    if (result) {
      setPlaintext(result.ciphertext);
      setMode(mode === 'ENCRYPT' ? 'DECRYPT' : 'ENCRYPT');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.ciphertext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mod26 = ((shift % 26) + 26) % 26;

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
      gap: '14px',
      overflow: 'hidden'
    }}>
      {/* Left Column: Controls & Inputs */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-neutral">Exercício 02</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              Cifra de César Generalizada
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Deslocamento modular C = (P + K) mod 26 para qualquer K ∈ ℤ.
          </p>
        </div>

        {/* Mode Toggle */}
        <div>
          <label className="form-label">Modo de Operação</label>
          <div className="segmented-control" style={{ width: '100%' }}>
            <button
              type="button"
              onClick={() => setMode('ENCRYPT')}
              className={`segmented-btn ${mode === 'ENCRYPT' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Lock size={13} />
              <span>Criptografar (+K)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DECRYPT')}
              className={`segmented-btn ${mode === 'DECRYPT' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Unlock size={13} />
              <span>Decriptar (-K)</span>
            </button>
          </div>
        </div>

        {/* Input Text */}
        <div>
          <label className="form-label">
            {mode === 'ENCRYPT' ? 'Texto Claro (P)' : 'Texto Cifrado (C)'}
          </label>
          <input
            type="text"
            className="input-field"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Digite a mensagem..."
          />
        </div>

        {/* Shift Input + Presets */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Deslocamento (K)</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setShift(3)}
                className={`badge ${shift === 3 ? 'badge-coral' : 'badge-neutral'}`}
                style={{ cursor: 'pointer' }}
              >
                K=3
              </button>
              <button
                type="button"
                onClick={() => setShift(13)}
                className={`badge ${shift === 13 ? 'badge-coral' : 'badge-neutral'}`}
                style={{ cursor: 'pointer' }}
              >
                ROT13
              </button>
              <button
                type="button"
                onClick={() => setShift(-1)}
                className={`badge ${shift === -1 ? 'badge-coral' : 'badge-neutral'}`}
                style={{ cursor: 'pointer' }}
              >
                K=-1
              </button>
            </div>
          </div>
          <input
            type="number"
            className="input-field input-field-mono"
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value, 10) || 0)}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Equivalente positivo: K ≡ {mod26} (mod 26)
          </div>
        </div>

        {/* Swap button */}
        {result && (
          <button
            type="button"
            onClick={handleSwap}
            className="btn-secondary"
            style={{ width: '100%', marginTop: 'auto', fontSize: '0.78rem' }}
          >
            <ArrowRightLeft size={13} />
            <span>Inverter e Alimentar Entrada</span>
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--accent-coral-muted)',
            border: '1px solid var(--accent-coral-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#ff5c7a',
            fontSize: '0.78rem'
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Right Column: Live Result & Character Map */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '14px'
      }}>
        {result ? (
          <>
            {/* Main Result Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    Texto Processado ({mode === 'ENCRYPT' ? 'Cifrado' : 'Decifrado'})
                  </span>
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-warm)',
                  wordBreak: 'break-all'
                }}>
                  {result.ciphertext}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
              >
                {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Character Mapping stream */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div className="form-label">Mapeamento Modular Caractere a Caractere</div>
              <div style={{
                flex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                alignContent: 'flex-start',
                overflowY: 'auto',
                padding: '12px',
                background: 'var(--bg-inset)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                {result.steps.map((st, i) => (
                  <div key={i} style={{
                    padding: '5px 7px',
                    background: st.isLetter ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    border: '1px solid ' + (st.isLetter ? 'rgba(255, 255, 255, 0.09)' : 'transparent'),
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.76rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '34px'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{st.char === ' ' ? '␣' : st.char}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>↓</span>
                    <span style={{ color: 'var(--text-warm)', fontWeight: 600 }}>{st.cipherChar === ' ' ? '␣' : st.cipherChar}</span>
                    {st.isLetter && (
                      <span style={{ fontSize: '0.6rem', color: '#fbbf24', marginTop: '2px' }}>
                        {st.origPos}→{st.newPos}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-dim)',
            padding: '30px',
            fontSize: '0.85rem'
          }}>
            Insira o texto para calcular o deslocamento de César em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};


