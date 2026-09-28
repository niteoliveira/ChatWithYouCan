import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { encryptCaesar, decryptCaesar } from '../../utils/cryptoEngine';
import { CaesarResult } from '../../types/crypto';

export const CaesarModule: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>('Ataque ao amanhecer! Sala 101.');
  const [shift, setShift] = useState<number>(3);
  const [result, setResult] = useState<CaesarResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEncrypt = () => {
    try {
      setError(null);
      const res = encryptCaesar(plaintext, shift);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar Cifra de César');
    }
  };

  const handleDecrypt = () => {
    try {
      setError(null);
      const res = decryptCaesar(plaintext, shift);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao decriptar Cifra de César');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-cyan">Exercício 2</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cifra de César Generalizada</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Deslocamento modular C = (P + K) mod 26. Suporta qualquer valor de K nos inteiros ℤ (positivo, negativo ou maior que 26), mantendo caixas maiúsculas/minúsculas e preservando pontuações e espaços.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label className="form-label">Texto Claro ou Cifrado</label>
          <input
            type="text"
            className="input-field"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Deslocamento Modular (K)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setShift(3)} className="badge badge-cyan" style={{ cursor: 'pointer', border: 'none' }}>K=3 (César)</button>
              <button onClick={() => setShift(13)} className="badge badge-amber" style={{ cursor: 'pointer', border: 'none' }}>K=13 (ROT13)</button>
              <button onClick={() => setShift(-1)} className="badge badge-crimson" style={{ cursor: 'pointer', border: 'none' }}>K=-1</button>
            </div>
          </div>
          <input
            type="number"
            className="input-field input-field-mono"
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value, 10) || 0)}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Equivalente modular: K ≡ {((shift % 26) + 26) % 26} (mod 26)
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <button onClick={handleEncrypt} className="btn-primary">
          <Lock size={16} /> Criptografar (+K)
        </button>

        <button onClick={handleDecrypt} className="btn-secondary">
          <Unlock size={16} /> Decriptar (-K)
        </button>

        {result && (
          <button onClick={() => setPlaintext(result.ciphertext)} className="btn-secondary">
            <ArrowRightLeft size={16} /> Copiar Resultado para Entrada
          </button>
        )}
      </div>

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
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'rgba(0, 229, 255, 0.05)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle2 size={18} color="#00e5ff" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#00e5ff' }}>
                Texto Processado
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {result.ciphertext}
            </div>
          </div>

          <div>
            <div className="form-label">Mapeamento Caractere a Caractere (A=0, B=1, ... Z=25)</div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '12px',
              background: '#06090e',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {result.steps.map((st, i) => (
                <div key={i} style={{
                  padding: '6px 10px',
                  background: st.isLetter ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid ' + (st.isLetter ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{st.char === ' ' ? '␣' : st.char}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>↓</span>
                  <span style={{ color: '#00e5ff', fontWeight: 700 }}>{st.cipherChar === ' ' ? '␣' : st.cipherChar}</span>
                  {st.isLetter && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', marginTop: '2px' }}>
                      {st.origPos}→{st.newPos}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
