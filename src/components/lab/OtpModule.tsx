import React, { useState } from 'react';
import { Lock, Unlock, Sparkles, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { encryptOtpDecimal, decryptOtpDecimal } from '../../utils/cryptoEngine';
import { OtpResult } from '../../types/crypto';

export const OtpModule: React.FC = () => {
  // useState hooks: managing user inputs, calculation results, and error state
  const [messageDec, setMessageDec] = useState<string>('12345');
  const [keyDec, setKeyDec] = useState<string>('67890');
  const [result, setResult] = useState<OtpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to generate a random decimal key matching the input's order of magnitude
  const generateRandomKey = () => {
    try {
      const len = messageDec.trim().length || 5;
      let randStr = '';
      for (let i = 0; i < len; i++) {
        randStr += Math.floor(i === 0 ? 1 + Math.random() * 9 : Math.random() * 10);
      }
      setKeyDec(randStr);
      setError(null);
    } catch {
      setKeyDec('98765');
    }
  };

  const handleEncrypt = () => {
    try {
      setError(null);
      const res = encryptOtpDecimal(messageDec, keyDec);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar OTP');
      setResult(null);
    }
  };

  const handleDecrypt = () => {
    try {
      setError(null);
      const res = decryptOtpDecimal(messageDec, keyDec);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao decriptar OTP');
      setResult(null);
    }
  };

  const handleSwapInputs = () => {
    if (result) {
      setMessageDec(result.cipherDec);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-emerald">Exercício 1</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>One-Time Pad Decimal (Base 10)</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Criptografia estritamente numérica com entradas e saídas em base decimal. O algoritmo converte os valores para binário, alinha os bits com preenchimento equivalente, aplica XOR bit a bit e reconverte o resultado para decimal.
          </p>
        </div>
      </div>

      {/* Input controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label className="form-label">Mensagem Clara em Decimal (M)</label>
          <input
            type="text"
            className="input-field input-field-mono"
            placeholder="Ex: 12345"
            value={messageDec}
            onChange={(e) => setMessageDec(e.target.value)}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Apenas dígitos decimais positivos (0-9)
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Chave Secreta em Decimal (K)</label>
            <button
              onClick={generateRandomKey}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-emerald)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <Sparkles size={13} /> Gerar Aleatória
            </button>
          </div>
          <input
            type="text"
            className="input-field input-field-mono"
            placeholder="Ex: 67890"
            value={keyDec}
            onChange={(e) => setKeyDec(e.target.value)}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Apenas dígitos decimais positivos (0-9)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <button onClick={handleEncrypt} className="btn-primary">
          <Lock size={16} /> Criptografar (M ⊕ K)
        </button>

        <button onClick={handleDecrypt} className="btn-secondary">
          <Unlock size={16} /> Decriptar (C ⊕ K)
        </button>

        {result && (
          <button onClick={handleSwapInputs} className="btn-secondary" title="Usar resultado como nova entrada">
            <ArrowRightLeft size={16} /> Copiar Cifrado para Entrada
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(255, 51, 102, 0.12)',
          border: '1px solid rgba(255, 51, 102, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#ff3366',
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Detailed Math Result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Output Box */}
          <div style={{
            background: 'rgba(0, 255, 170, 0.05)',
            border: '1px solid rgba(0, 255, 170, 0.25)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle2 size={18} color="#00ffaa" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#00ffaa' }}>
                Resultado Decimal (Base 10)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Entrada (M)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {result.messageDec}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Chave (K)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                  {result.keyDec}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Resultado Decimal (C)
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                  {result.cipherDec}
                </div>
              </div>
            </div>
          </div>

          {/* Binary Alignment Matrix */}
          <div>
            <div className="form-label">Alinhamento Binário e Operação XOR ({result.bitLength} bits)</div>
            <div className="code-box" style={{ lineHeight: '1.8', letterSpacing: '2px' }}>
              <div>M (bin): <span style={{ color: '#ffffff' }}>{result.messageBin}</span> (Base 10: {result.messageDec})</div>
              <div>K (bin): <span style={{ color: 'var(--accent-amber)' }}>{result.keyBin}</span> (Base 10: {result.keyDec})</div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', margin: '4px 0' }}></div>
              <div>C (bin): <span style={{ color: '#00ffaa', fontWeight: 700 }}>{result.xorBin}</span> (Base 10: {result.cipherDec})</div>
            </div>
          </div>

          {/* Mathematical Step by Step Trace */}
          <div>
            <div className="form-label">Passo a Passo Acadêmico da Execução</div>
            <div className="code-box" style={{ color: '#8b9bb4', fontSize: '0.82rem', lineHeight: '1.6' }}>
              {result.steps.map((st, idx) => (
                <div key={idx}>{st}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
