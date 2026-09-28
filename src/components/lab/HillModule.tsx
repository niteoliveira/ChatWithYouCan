import React, { useState, useMemo } from 'react';
import { Lock, Unlock, AlertCircle, ArrowRightLeft, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { analyzeHillMatrix, encryptHill, decryptHill, parseHillKeyString } from '../../utils/cryptoEngine';
import { Matrix2x2 } from '../../types/crypto';

export const HillModule: React.FC = () => {
  const [mode, setMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [plaintext, setPlaintext] = useState<string>('HELP');
  const [keyInputType, setKeyInputType] = useState<'text' | 'grid'>('text');
  const [keyWord, setKeyWord] = useState<string>('HILL');
  const [matrixCells, setMatrixCells] = useState<Matrix2x2>([[7, 8], [11, 11]]);
  const [copied, setCopied] = useState<boolean>(false);

  const currentMatrix: Matrix2x2 = useMemo(() => {
    if (keyInputType === 'text') {
      try {
        return parseHillKeyString(keyWord);
      } catch {
        return [[0, 0], [0, 0]];
      }
    }
    return matrixCells;
  }, [keyInputType, keyWord, matrixCells]);

  const matrixAnalysis = useMemo(() => {
    return analyzeHillMatrix(currentMatrix);
  }, [currentMatrix]);

  const handleCellChange = (row: number, col: number, val: string) => {
    const num = parseInt(val, 10) || 0;
    const newM: Matrix2x2 = [
      [...matrixCells[0]] as [number, number],
      [...matrixCells[1]] as [number, number]
    ];
    newM[row][col] = ((num % 26) + 26) % 26;
    setMatrixCells(newM);
  };

  // Real-time calculation based on inputs & mode
  const { result, error } = useMemo(() => {
    const clean = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
    if (!clean) {
      return { result: null, error: 'Digite uma mensagem (A-Z) para processamento.' };
    }

    if (!matrixAnalysis.isInvertible) {
      return {
        result: null,
        error: `A matriz não é invertível em ℤ₂₆ (det = ${matrixAnalysis.detMod26}, mdc = ${matrixAnalysis.gcd} ≠ 1).`
      };
    }

    try {
      if (mode === 'ENCRYPT') {
        const res = encryptHill(clean, currentMatrix);
        return { result: res, error: null };
      } else {
        const res = decryptHill(clean, currentMatrix);
        return { result: res, error: null };
      }
    } catch (err: any) {
      return { result: null, error: err.message || 'Erro ao processar Cifra de Hill.' };
    }
  }, [mode, plaintext, currentMatrix, matrixAnalysis]);

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

  const letterCount = plaintext.toUpperCase().replace(/[^A-Z]/g, '').length;

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(320px, 390px) minmax(0, 1fr)',
      gap: '14px',
      overflow: 'hidden'
    }}>
      {/* Left Column: Controls & Matrix Inputs */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-neutral">Exercício 04</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              Cifra de Hill (Matriz 2×2 em ℤ₂₆)
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Transformação linear em blocos de 2 caracteres: C = K · P mod 26.
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
              <span>Criptografar (K · P)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DECRYPT')}
              className={`segmented-btn ${mode === 'DECRYPT' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Unlock size={13} />
              <span>Decriptar (K⁻¹ · C)</span>
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              {mode === 'ENCRYPT' ? 'Texto Claro (A-Z)' : 'Texto Cifrado (A-Z)'}
            </label>
            <span className={`badge ${letterCount % 2 === 0 ? 'badge-emerald' : 'badge-coral'}`}>
              {letterCount} letras {letterCount % 2 !== 0 ? '(+X padding)' : '(pares)'}
            </span>
          </div>
          <input
            type="text"
            className="input-field input-field-mono"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value.toUpperCase())}
            placeholder="Ex: HELP"
          />
        </div>

        {/* Matrix Key Config */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Matriz Chave K (2×2)</label>
            <div className="segmented-control" style={{ padding: '2px' }}>
              <button
                type="button"
                onClick={() => setKeyInputType('text')}
                className={`segmented-btn ${keyInputType === 'text' ? 'active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                Palavra 4 letras
              </button>
              <button
                type="button"
                onClick={() => setKeyInputType('grid')}
                className={`segmented-btn ${keyInputType === 'grid' ? 'active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                Grade 2×2
              </button>
            </div>
          </div>

          {keyInputType === 'text' ? (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input
                  type="text"
                  maxLength={4}
                  className="input-field input-field-mono"
                  value={keyWord}
                  onChange={(e) => setKeyWord(e.target.value.toUpperCase())}
                  placeholder="Ex: HILL"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Presets:</span>
                {['HILL', 'GYBN', 'DDCF'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setKeyWord(preset)}
                    className={`badge ${keyWord.toUpperCase() === preset ? 'badge-coral' : 'badge-neutral'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxWidth: '200px' }}>
              <input
                type="number"
                className="input-field input-field-mono"
                value={matrixCells[0][0]}
                onChange={(e) => handleCellChange(0, 0, e.target.value)}
              />
              <input
                type="number"
                className="input-field input-field-mono"
                value={matrixCells[0][1]}
                onChange={(e) => handleCellChange(0, 1, e.target.value)}
              />
              <input
                type="number"
                className="input-field input-field-mono"
                value={matrixCells[1][0]}
                onChange={(e) => handleCellChange(1, 0, e.target.value)}
              />
              <input
                type="number"
                className="input-field input-field-mono"
                value={matrixCells[1][1]}
                onChange={(e) => handleCellChange(1, 1, e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Matrix Invertibility Status Pill Bar */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Invertibilidade</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: matrixAnalysis.isInvertible ? '#34d399' : '#ff5c7a',
              marginTop: '2px'
            }}>
              {matrixAnalysis.isInvertible ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span>{matrixAnalysis.isInvertible ? 'Válida em ℤ₂₆' : 'Não Invertível'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>det(K) mod 26</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-warm)', marginTop: '2px' }}>
              {matrixAnalysis.detMod26} (gcd={matrixAnalysis.gcd})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>det⁻¹ mod 26</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fbbf24', marginTop: '2px' }}>
              {matrixAnalysis.isInvertible ? matrixAnalysis.invDetMod26 : '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Matriz K</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              [{currentMatrix[0].join(', ')}][{currentMatrix[1].join(', ')}]
            </div>
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

      {/* Right Column: Live Result & Vector Multiplications */}
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
                    Resultado Hill ({mode === 'ENCRYPT' ? 'Cifrado' : 'Decifrado'})
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
                {result.paddedText !== result.plaintext && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Texto com caractere de preenchimento: <strong style={{ color: 'var(--text-warm)' }}>{result.paddedText}</strong>
                  </div>
                )}
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

            {/* Block Multiplications breakdown */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div className="form-label">Multiplicação Vetorial por Blocos de 2 Caracteres</div>
              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '10px',
                overflowY: 'auto',
                alignContent: 'flex-start'
              }}>
                {result.blocks.map((blk, idx) => (
                  <div key={idx} className="code-box" style={{ padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-warm)', fontWeight: 600 }}>
                        Bloco #{idx + 1}: "{blk.pair}"
                      </span>
                      <span style={{ color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        → "{blk.cipherPair}"
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {blk.calculation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational Math Note */}
            <div style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <strong style={{ color: 'var(--text-warm)' }}>Condição de Invertibilidade:</strong> Em ℤ₂₆, uma matriz quadrada K só possui inversa se e somente se \gcd(\det(K), 26) = 1. A decriptação é obtida multiplicando os blocos pela matriz adjunta multiplicada pelo inverso modular do determinante.
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
            Insira o texto e defina uma matriz invertível para ver a Cifra de Hill em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};

