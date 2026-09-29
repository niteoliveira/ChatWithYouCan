import React, { useState, useMemo } from 'react';
import { AlertTriangle, Shuffle, AlertCircle, ChevronRight, Eye, KeyRound, ShieldOff } from 'lucide-react';
import { analyzeTwoTimePadText } from '../../utils/cryptoEngine';

const PRESETS = [
  { label: 'Exemplo A', m1: 'ATAQUE AO AMANHECER', m2: 'RECUAR PARA O SUL', key: 'GUERRA' },
  { label: 'Exemplo B', m1: 'SENHA: admin123', m2: 'SENHA: root9999', key: 'SEGREDO' },
  { label: 'Exemplo C', m1: 'Alice paga 500 reais', m2: 'Bob paga 999 reais', key: 'BANCO' },
];

interface HexTableProps {
  c1Hex: string;
  c2Hex: string;
  xorHex: string;
}

const HexTable: React.FC<HexTableProps> = ({ c1Hex, c2Hex, xorHex }) => {
  const c1Parts = c1Hex.split(' ').filter(Boolean);
  const c2Parts = c2Hex.split(' ').filter(Boolean);
  const xorParts = xorHex.split(' ').filter(Boolean);
  const minLen = Math.min(c1Parts.length, c2Parts.length, xorParts.length);

  const cols = 10;
  const numRows = Math.ceil(minLen / cols);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        tableLayout: 'auto',
      }}>
        <tbody>
          {Array.from({ length: numRows }, (_, row) => {
            const start = row * cols;
            const end = Math.min(start + cols, minLen);
            const slice = Array.from({ length: end - start }, (_, i) => start + i);

            return (
              <React.Fragment key={row}>
                <tr>
                  <td style={{ color: '#7dd3fc', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>C₁</td>
                  {slice.map(i => (
                    <td key={i} style={{ textAlign: 'center', padding: '2px 4px', color: '#7dd3fc' }}>
                      {c1Parts[i]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-dim)', padding: '1px 6px', fontSize: '0.62rem' }}>⊕</td>
                  {slice.map(i => (
                    <td key={i} style={{ textAlign: 'center', padding: '1px 4px', color: 'var(--text-dim)', fontSize: '0.62rem' }}>⊕</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ color: '#c4b5fd', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}>C₂</td>
                  {slice.map(i => (
                    <td key={i} style={{ textAlign: 'center', padding: '2px 4px', color: '#c4b5fd' }}>
                      {c2Parts[i]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td colSpan={cols + 1} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1px 0' }} />
                </tr>
                <tr>
                  <td style={{ color: '#ff5c7a', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>M₁⊕M₂</td>
                  {slice.map(i => (
                    <td key={i} style={{ textAlign: 'center', padding: '2px 4px', color: '#ff5c7a', fontWeight: 700 }}>
                      {xorParts[i]}
                    </td>
                  ))}
                </tr>
                {row < numRows - 1 && (
                  <tr><td colSpan={cols + 1} style={{ height: '10px' }} /></tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const TwoTimePadModule: React.FC = () => {
  const [m1, setM1] = useState<string>('ATAQUE AO AMANHECER');
  const [m2, setM2] = useState<string>('RECUAR PARA O SUL');
  const [key, setKey] = useState<string>('GUERRA');

  const loadPreset = (p: typeof PRESETS[0]) => {
    setM1(p.m1);
    setM2(p.m2);
    setKey(p.key);
  };

  const generateRandom = () => {
    const words = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL'];
    const rw = () => words[Math.floor(Math.random() * words.length)];
    setKey(`${rw()}${rw()}`);
  };

  const { result, error } = useMemo(() => {
    if (!m1.trim() || !m2.trim()) {
      return { result: null, error: 'Informe M₁ e M₂.' };
    }
    if (!key.trim()) {
      return { result: null, error: 'Informe a chave K.' };
    }
    try {
      const r = analyzeTwoTimePadText(m1.trim(), m2.trim(), key.trim());
      return { result: r, error: null };
    } catch (err: any) {
      return { result: null, error: err.message };
    }
  }, [m1, m2, key]);

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(310px, 370px) minmax(0, 1fr)',
      gap: '14px',
      overflow: 'hidden'
    }}>
      {/* ── Left Column: Inputs ── */}
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
              Criptoanálise — Two-Time Pad
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            Digite duas mensagens e <strong style={{ color: 'var(--text-warm)' }}>a mesma chave K</strong> para ambas.
            A ferramenta cifra M₁ e M₂ com K, depois calcula C₁ ⊕ C₂ provando que K desapareceu.
          </p>
        </div>

        {/* Presets */}
        <div>
          <label className="form-label">Carregar Exemplo</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => loadPreset(p)}
                className="badge badge-neutral"
                style={{ cursor: 'pointer' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* M1 */}
        <div>
          <label className="form-label">Mensagem Clara M₁</label>
          <input
            type="text"
            className="input-field"
            value={m1}
            onChange={e => setM1(e.target.value)}
            placeholder="Ex: ATAQUE AO AMANHECER"
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '3px' }}>
            {m1.length} car. · C₁ = M₁ ⊕ K
          </div>
        </div>

        {/* M2 */}
        <div>
          <label className="form-label">Mensagem Clara M₂</label>
          <input
            type="text"
            className="input-field"
            value={m2}
            onChange={e => setM2(e.target.value)}
            placeholder="Ex: RECUAR PARA O SUL"
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '3px' }}>
            {m2.length} car. · C₂ = M₂ ⊕ K
          </div>
        </div>

        {/* Key */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <KeyRound size={12} />
              Chave Compartilhada K
            </label>
            <button
              type="button"
              onClick={generateRandom}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: '0.72rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Shuffle size={11} /> Aleatória
            </button>
          </div>
          <input
            type="text"
            className="input-field input-field-mono"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Ex: GUERRA"
          />
          <div style={{ fontSize: '0.7rem', color: '#ff5c7a', marginTop: '4px', lineHeight: 1.4 }}>
            ⚠ Esta mesma chave cifra M₁ e M₂ — é exatamente isso que cria a vulnerabilidade.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--accent-coral-muted)',
            border: '1px solid var(--accent-coral-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#ff5c7a', fontSize: '0.78rem'
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── Right Column: Results ── */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '14px'
      }}>
        {result ? (
          <>
            {/* Alert Banner */}
            <div style={{
              background: 'rgba(255, 92, 122, 0.08)',
              border: '1px solid var(--accent-coral-border)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex', alignItems: 'flex-start', gap: '10px'
            }}>
              <ShieldOff size={17} color="#ff5c7a" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#ff5c7a', fontSize: '0.83rem', marginBottom: '2px' }}>
                  Chave K eliminada por idempotência — K ⊕ K = 0
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  C₁ ⊕ C₂ = M₁ ⊕ M₂. A chave secreta desapareceu completamente da equação.
                </div>
              </div>
            </div>

            {/* Step 1 */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: '#1e3a5f', color: '#7dd3fc',
                  borderRadius: '50%', width: '18px', height: '18px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
                }}>1</span>
                Cifrado C₁ = M₁ ⊕ K
              </div>
              <div className="code-box" style={{ fontSize: '0.76rem', lineHeight: 1.7 }}>
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>M₁:</span><span style={{ color: '#fff' }}>{result.m1}</span></div>
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>K:</span><span style={{ color: '#fbbf24' }}>{result.key}</span></div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', margin: '4px 0' }} />
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>C₁ (hex):</span><span style={{ color: '#7dd3fc', wordBreak: 'break-all' }}>{result.c1Hex}</span></div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: '#2e1a5e', color: '#c4b5fd',
                  borderRadius: '50%', width: '18px', height: '18px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
                }}>2</span>
                Cifrado C₂ = M₂ ⊕ K (mesma chave!)
              </div>
              <div className="code-box" style={{ fontSize: '0.76rem', lineHeight: 1.7 }}>
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>M₂:</span><span style={{ color: '#fff' }}>{result.m2}</span></div>
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>K:</span><span style={{ color: '#fbbf24' }}>{result.key}</span></div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', margin: '4px 0' }} />
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>C₂ (hex):</span><span style={{ color: '#c4b5fd', wordBreak: 'break-all' }}>{result.c2Hex}</span></div>
              </div>
            </div>

            {/* Step 3: Attack */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: '#450a0a', color: '#ff5c7a',
                  borderRadius: '50%', width: '18px', height: '18px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
                }}>3</span>
                Ataque: C₁ ⊕ C₂ = M₁ ⊕ M₂
              </div>
              <div className="code-box" style={{ fontSize: '0.76rem' }}>
                <div><span style={{ color: 'var(--text-dim)', display: 'inline-block', minWidth: '70px' }}>C₁ ⊕ C₂:</span><span style={{ color: '#ff5c7a', fontWeight: 700, wordBreak: 'break-all' }}>{result.xorHex}</span></div>
              </div>
            </div>

            {/* Byte-level proof table */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={12} />
                Tabela Byte a Byte — Prova Visual da Eliminação da Chave
              </div>
              <div className="code-box" style={{ padding: '10px 12px', overflowX: 'auto' }}>
                <HexTable c1Hex={result.c1Hex} c2Hex={result.c2Hex} xorHex={result.xorHex} />
              </div>
            </div>

            {/* Algebraic proof */}
            <div>
              <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ChevronRight size={13} />
                Demonstração Algébrica Passo a Passo
              </div>
              <div className="code-box" style={{ fontSize: '0.75rem', lineHeight: 1.9 }}>
                {result.explanation.map((line, idx) => {
                  const isConclusion = line.startsWith('Conclusão');
                  const isAlgebra = line.trim().startsWith('=');
                  const isStep = line.startsWith('Passo');
                  return (
                    <div key={idx} style={{
                      color: isConclusion ? '#ff5c7a' : isAlgebra ? '#34d399' : isStep ? 'var(--text-warm)' : 'var(--text-muted)',
                      fontWeight: isConclusion ? 700 : isStep ? 600 : 400,
                      marginTop: (isStep && idx > 0) ? '8px' : undefined,
                    }}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Educational note */}
            <div style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <strong style={{ color: '#fbbf24' }}>Por que isso é grave?</strong> Com C₁ ⊕ C₂ = M₁ ⊕ M₂, o atacante pode
              aplicar <em>crib-dragging</em>: chuta palavras conhecidas em uma posição e verifica se o trecho
              correspondente em M₂ faz sentido. A OTP só oferece segredo perfeito quando{' '}
              <strong style={{ color: 'var(--text-warm)' }}>cada chave é usada uma única vez e descartada</strong>.
            </div>

            {/* Attack warning */}
            <div style={{
              background: 'rgba(255, 92, 122, 0.06)',
              border: '1px dashed rgba(255, 92, 122, 0.35)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '0.76rem', color: '#ff5c7a'
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>
                O atacante <strong>nunca viu K</strong>, mas calculando C₁ ⊕ C₂ obteve M₁ ⊕ M₂ —
                informação suficiente para quebrar ambas as mensagens com análise estatística.
              </span>
            </div>
          </>
        ) : (
          <div style={{
            margin: 'auto', textAlign: 'center',
            color: 'var(--text-dim)', padding: '30px', fontSize: '0.85rem'
          }}>
            Preencha M₁, M₂ e K para visualizar o ataque Two-Time Pad em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};

