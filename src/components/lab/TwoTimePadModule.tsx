import React, { useState, useMemo } from 'react';
import { AlertTriangle, Play, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeTwoTimePad, encryptOtpDecimal } from '../../utils/cryptoEngine';

export const TwoTimePadModule: React.FC = () => {
  const [c1Input, setC1Input] = useState<string>('9823412');
  const [c2Input, setC2Input] = useState<string>('7459123');

  const handleGenerateLiveDemo = () => {
    const secretKey = '8899771122';
    const m1 = '1234567890';
    const m2 = '9876543210';

    const c1 = encryptOtpDecimal(m1, secretKey).cipherDec;
    const c2 = encryptOtpDecimal(m2, secretKey).cipherDec;

    setC1Input(c1);
    setC2Input(c2);
  };

  // Real-time calculation based on C1 & C2 inputs
  const { result, error } = useMemo(() => {
    const cleanC1 = c1Input.trim().replace(/[^0-9]/g, '');
    const cleanC2 = c2Input.trim().replace(/[^0-9]/g, '');

    if (!cleanC1 || !cleanC2) {
      return { result: null, error: 'Informe ambos os pacotes cifrados em decimal (C₁ e C₂).' };
    }

    try {
      const analysis = analyzeTwoTimePad(cleanC1, cleanC2);
      return { result: analysis, error: null };
    } catch (err: any) {
      return { result: null, error: err.message || 'Erro ao analisar Two-Time Pad.' };
    }
  }, [c1Input, c2Input]);

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
            <span className="badge badge-coral">Exercício 05 • Opção B</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              Ataque Two-Time Pad
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Criptoanálise por reutilização de chave. C₁ ⊕ C₂ anula a chave por idempotência (K ⊕ K = 0).
          </p>
        </div>

        {/* Input C1 */}
        <div>
          <label className="form-label">Pacote Cifrado 1 (C₁ = M₁ ⊕ K)</label>
          <input
            type="text"
            className="input-field input-field-mono"
            value={c1Input}
            onChange={(e) => setC1Input(e.target.value)}
            placeholder="Ex: 9823412"
          />
        </div>

        {/* Input C2 */}
        <div>
          <label className="form-label">Pacote Cifrado 2 (C₂ = M₂ ⊕ K)</label>
          <input
            type="text"
            className="input-field input-field-mono"
            value={c2Input}
            onChange={(e) => setC2Input(e.target.value)}
            placeholder="Ex: 7459123"
          />
        </div>

        {/* Demo button */}
        <button
          type="button"
          onClick={handleGenerateLiveDemo}
          className="btn-secondary"
          style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
        >
          <Play size={13} />
          <span>Simular Reutilização de Chave (Live Demo)</span>
        </button>

        {/* Status note */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          <strong style={{ color: 'var(--text-warm)' }}>Condição de Falha:</strong> Se duas mensagens diferentes forem cifradas com a mesma chave decimal One-Time Pad, o segredo perfeito é instantaneamente violado porque o XOR dos textos cifrados resulta no XOR dos textos claros: C₁ ⊕ C₂ = M₁ ⊕ M₂.
        </div>

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

      {/* Right Column: Live Proof & Crib Dragging */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '14px'
      }}>
        {result ? (
          <>
            {/* Warning Banner */}
            <div style={{
              background: 'var(--accent-coral-muted)',
              border: '1px solid var(--accent-coral-border)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertTriangle size={16} color="#ff5c7a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#ff5c7a', fontSize: '0.82rem', marginBottom: '2px' }}>
                  Reutilização detectada: chave K eliminada por idempotência
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  A chave secreta foi totalmente eliminada da equação. O resultado da operação XOR expõe diretamente a relação entre os textos claros M₁ e M₂.
                </div>
              </div>
            </div>

            {/* Algebraic Demonstration */}
            <div>
              <div className="form-label">Demonstração Algébrica Passo a Passo</div>
              <div className="code-box" style={{ lineHeight: '1.8', fontSize: '0.78rem' }}>
                {result.explanation.map((line, idx) => (
                  <div key={idx} style={{
                    color: idx === 4 ? '#ff5c7a' : idx >= 5 ? '#34d399' : undefined,
                    fontWeight: idx === 4 ? 600 : 400
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Crib Dragging Candidates */}
            {result.cribCandidates.length > 0 && (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sparkles size={13} color="#fbbf24" />
                  <span className="form-label" style={{ marginBottom: 0 }}>Crib-Dragging: Varredura de Hipóteses Conhecidas</span>
                </div>
                <div style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '8px',
                  overflowY: 'auto',
                  alignContent: 'flex-start'
                }}>
                  {result.cribCandidates.map((cand, idx) => (
                    <div key={idx} className="code-box" style={{ padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.78rem' }}>
                        Palpite (Crib): "{cand.crib}"
                      </div>
                      <div style={{ color: '#34d399', marginTop: '4px', fontSize: '0.78rem' }}>
                        Texto Revelado: "{cand.revealed}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-dim)',
            padding: '30px',
            fontSize: '0.85rem'
          }}>
            Insira os pacotes C₁ e C₂ para computar o ataque Two-Time Pad em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};

