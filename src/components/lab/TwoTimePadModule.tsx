import React, { useState } from 'react';
import { Skull, AlertTriangle, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { analyzeTwoTimePad, encryptOtpDecimal, textToDecimal } from '../../utils/cryptoEngine';
import { TwoTimePadResult } from '../../types/crypto';

export const TwoTimePadModule: React.FC = () => {
  const [c1Input, setC1Input] = useState<string>('9823412');
  const [c2Input, setC2Input] = useState<string>('7459123');
  const [result, setResult] = useState<TwoTimePadResult | null>(null);

  // Generate a live demonstration with identical key
  const handleGenerateLiveDemo = () => {
    const secretKey = '8899771122';
    const m1 = '1234567890';
    const m2 = '9876543210';

    const c1 = encryptOtpDecimal(m1, secretKey).cipherDec;
    const c2 = encryptOtpDecimal(m2, secretKey).cipherDec;

    setC1Input(c1);
    setC2Input(c2);

    const analysis = analyzeTwoTimePad(c1, c2);
    setResult(analysis);
  };

  const handleAnalyze = () => {
    try {
      const analysis = analyzeTwoTimePad(c1Input, c2Input);
      setResult(analysis);
    } catch (err: any) {
      alert('Erro ao analisar pacotes: ' + err.message);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-crimson">Opção B do Trabalho</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ff3366' }}>
              Criptoanálise: Ataque Two-Time Pad (Reutilização de Chave)
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '780px' }}>
            O One-Time Pad oferece segurança perfeita estritamente sob a condição de que a chave nunca seja reutilizada. Se uma chave $K$ for usada para cifrar duas mensagens distintas, o cálculo de $C_1 \oplus C_2$ elimina completamente a chave por idempotência ($K \oplus K = 0$), permitindo a recuperação dos textos claros via <em>crib dragging</em>.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label className="form-label">Pacote Cifrado 1 em Decimal (C₁ = M₁ ⊕ K)</label>
          <input
            type="text"
            className="input-field input-field-mono"
            value={c1Input}
            onChange={(e) => setC1Input(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Pacote Cifrado 2 em Decimal (C₂ = M₂ ⊕ K)</label>
          <input
            type="text"
            className="input-field input-field-mono"
            value={c2Input}
            onChange={(e) => setC2Input(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <button onClick={handleAnalyze} className="btn-danger">
          <Skull size={16} /> Disparar Criptoanálise (C₁ ⊕ C₂)
        </button>

        <button onClick={handleGenerateLiveDemo} className="btn-secondary">
          <Sparkles size={16} /> Simular Cenário Real com Chave Idêntica
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Warning Banner */}
          <div style={{
            background: 'rgba(255, 51, 102, 0.1)',
            border: '1px solid rgba(255, 51, 102, 0.3)',
            borderRadius: '12px',
            padding: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertTriangle size={24} color="#ff3366" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#ff3366', fontSize: '0.95rem', marginBottom: '4px' }}>
                Falha Crítica de Segurança Detectada: A Chave foi Anulada!
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Como o emissor utilizou a mesma chave $K$ em ambas as transmissões, o atacante interceptador obtém diretamente $M_1 \oplus M_2$, sem precisar saber qual era a chave secreta.
              </div>
            </div>
          </div>

          {/* Mathematical Proof */}
          <div>
            <div className="form-label">Demonstração Algébrica e Passos de Interceptação</div>
            <div className="code-box" style={{ lineHeight: '1.8' }}>
              {result.explanation.map((line, idx) => (
                <div key={idx} style={{ color: idx === 4 ? '#ff3366' : idx >= 5 ? '#00ffaa' : undefined, fontWeight: idx === 4 ? 700 : 400 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Crib Dragging candidates */}
          {result.cribCandidates.length > 0 && (
            <div>
              <div className="form-label">Técnica de Crib-Dragging (Varredura de Palavras Prováveis)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {result.cribCandidates.map((cand, idx) => (
                  <div key={idx} className="code-box" style={{ padding: '12px' }}>
                    <div style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.85rem' }}>
                      Palpite (Crib): "{cand.crib}"
                    </div>
                    <div style={{ color: '#00ffaa', marginTop: '4px', fontSize: '0.82rem' }}>
                      Texto Revelado: "{cand.revealed}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
