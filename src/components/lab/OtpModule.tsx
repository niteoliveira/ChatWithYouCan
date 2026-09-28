import React, { useState, useMemo } from 'react';
import { Lock, Unlock, Shuffle, AlertCircle, ArrowRightLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { encryptOtpDecimal, decryptOtpDecimal } from '../../utils/cryptoEngine';

export const OtpModule: React.FC = () => {
  const [mode, setMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [messageDec, setMessageDec] = useState<string>('12345');
  const [keyDec, setKeyDec] = useState<string>('67890');
  const [copied, setCopied] = useState<boolean>(false);

  const generateRandomKey = () => {
    const len = messageDec.trim().length || 5;
    let randStr = '';
    for (let i = 0; i < len; i++) {
      randStr += Math.floor(i === 0 ? 1 + Math.random() * 9 : Math.random() * 10);
    }
    setKeyDec(randStr);
  };

  // Real-time calculation based on inputs & mode
  const { result, error } = useMemo(() => {
    if (!messageDec.trim()) {
      return { result: null, error: 'Insira um valor decimal de entrada.' };
    }
    if (!keyDec.trim()) {
      return { result: null, error: 'Insira uma chave decimal.' };
    }
    if (!/^\d+$/.test(messageDec.trim())) {
      return { result: null, error: 'A entrada deve conter apenas dígitos decimais positivos (0-9).' };
    }
    if (!/^\d+$/.test(keyDec.trim())) {
      return { result: null, error: 'A chave deve conter apenas dígitos decimais positivos (0-9).' };
    }

    try {
      if (mode === 'ENCRYPT') {
        const res = encryptOtpDecimal(messageDec.trim(), keyDec.trim());
        return { result: res, error: null };
      } else {
        const res = decryptOtpDecimal(messageDec.trim(), keyDec.trim());
        return { result: res, error: null };
      }
    } catch (err: any) {
      return { result: null, error: err.message || 'Erro no cálculo do OTP decimal.' };
    }
  }, [mode, messageDec, keyDec]);

  const handleSwap = () => {
    if (result) {
      setMessageDec(result.cipherDec);
      setMode(mode === 'ENCRYPT' ? 'DECRYPT' : 'ENCRYPT');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.cipherDec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <span className="badge badge-neutral">Exercício 01</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              One-Time Pad Decimal
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Entradas em base 10, conversão em bits alinhados, XOR e reconversão para decimal.
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
              <span>Criptografar (M ⊕ K)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DECRYPT')}
              className={`segmented-btn ${mode === 'DECRYPT' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Unlock size={13} />
              <span>Decriptar (C ⊕ K)</span>
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div>
          <label className="form-label">
            {mode === 'ENCRYPT' ? 'Mensagem Clara Decimal (M)' : 'Texto Cifrado Decimal (C)'}
          </label>
          <input
            type="text"
            className="input-field input-field-mono"
            placeholder="Ex: 12345"
            value={messageDec}
            onChange={(e) => setMessageDec(e.target.value)}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Chave Secreta Decimal (K)</label>
            <button
              type="button"
              onClick={generateRandomKey}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Shuffle size={11} /> Gerar Aleatória
            </button>
          </div>
          <input
            type="text"
            className="input-field input-field-mono"
            placeholder="Ex: 67890"
            value={keyDec}
            onChange={(e) => setKeyDec(e.target.value)}
          />
        </div>

        {/* Action helper */}
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

        {/* Error message */}
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

      {/* Right Column: Live Output & Mathematical Walkthrough */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '14px'
      }}>
        {result ? (
          <>
            {/* Primary Result Box */}
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
                    Resultado em Base 10 ({mode === 'ENCRYPT' ? 'C = M ⊕ K' : 'M = C ⊕ K'})
                  </span>
                </div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-warm)',
                  wordBreak: 'break-all'
                }}>
                  {result.cipherDec}
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

            {/* Binary Alignment Matrix */}
            <div>
              <div className="form-label">Alinhamento Binário e Operação XOR ({result.bitLength} bits)</div>
              <div className="code-box" style={{ lineHeight: '1.7', letterSpacing: '0.04em', fontSize: '0.82rem' }}>
                <div>M (bin): <span style={{ color: '#ffffff' }}>{result.messageBin}</span> <span style={{ color: 'var(--text-dim)' }}>(dec: {result.messageDec})</span></div>
                <div>K (bin): <span style={{ color: '#fbbf24' }}>{result.keyBin}</span> <span style={{ color: 'var(--text-dim)' }}>(dec: {result.keyDec})</span></div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }}></div>
                <div>R (bin): <span style={{ color: '#34d399', fontWeight: 600 }}>{result.xorBin}</span> <span style={{ color: 'var(--text-dim)' }}>(dec: {result.cipherDec})</span></div>
              </div>
            </div>

            {/* Step by step execution trace */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <div className="form-label">Rastreamento Matemático</div>
              <div className="code-box" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.6' }}>
                {result.steps.map((st, idx) => (
                  <div key={idx}>{st}</div>
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
            Insira os dígitos decimais para visualizar os cálculos em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};


