import React, { useState, useMemo } from 'react';
import { Lock, Unlock, AlertCircle, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react';
import { analyzeHillMatrix, encryptHill, decryptHill, parseHillKeyString } from '../../utils/cryptoEngine';
import { Matrix2x2, HillResult } from '../../types/crypto';

export const HillModule: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>('HELP');
  const [keyInputType, setKeyInputType] = useState<'text' | 'grid'>('text');
  const [keyWord, setKeyWord] = useState<string>('HILL');
  const [matrixCells, setMatrixCells] = useState<Matrix2x2>([[7, 8], [11, 11]]);
  const [result, setResult] = useState<HillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute active matrix based on current input mode
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

  // Real-time mathematical analysis of matrix
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

  const handleEncrypt = () => {
    try {
      setError(null);
      const res = encryptHill(plaintext, currentMatrix);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar Cifra de Hill');
    }
  };

  const handleDecrypt = () => {
    try {
      setError(null);
      const res = decryptHill(plaintext, currentMatrix);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao decriptar Cifra de Hill');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-purple" style={{ background: 'rgba(157, 78, 221, 0.15)', color: '#d8bbff', border: '1px solid rgba(157, 78, 221, 0.3)' }}>
              Exercício 4
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cifra de Hill (Matriz 2×2 Modular)</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Criptografia matricial em ℤ₂₆. A matriz chave K é validada em tempo real para garantir que mdc(det(K), 26) = 1, calculando a matriz inversa modular K⁻¹ para decriptação.
          </p>
        </div>
      </div>

      {/* Input Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Text Input */}
        <div>
          <label className="form-label">Texto Claro ou Cifrado</label>
          <input
            type="text"
            className="input-field"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value.toUpperCase())}
            placeholder="Ex: HELP"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {plaintext.replace(/[^A-Z]/g, '').length % 2 !== 0
              ? 'Comprimento ímpar: será preenchido automaticamente com "X"'
              : 'Comprimento par: pronto para divisão em blocos de 2'}
          </div>
        </div>

        {/* Matrix Controls */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Chave da Matriz 2×2</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setKeyInputType('text')}
                className={`badge ${keyInputType === 'text' ? 'badge-cyan' : 'badge-emerald'}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                Palavra (4 letras)
              </button>
              <button
                onClick={() => setKeyInputType('grid')}
                className={`badge ${keyInputType === 'grid' ? 'badge-cyan' : 'badge-emerald'}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                Grade Numérica
              </button>
            </div>
          </div>

          {keyInputType === 'text' ? (
            <div>
              <input
                type="text"
                maxLength={4}
                className="input-field input-field-mono"
                value={keyWord}
                onChange={(e) => setKeyWord(e.target.value.toUpperCase())}
                placeholder="Ex: HILL"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Exemplos clássicos invertíveis: "HILL", "GYBN", "DDCF"
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '200px' }}>
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
      </div>

      {/* Real-time Matrix Math Inspection Card */}
      <div style={{
        background: matrixAnalysis.isInvertible ? 'rgba(0, 255, 170, 0.05)' : 'rgba(255, 51, 102, 0.08)',
        border: '1px solid ' + (matrixAnalysis.isInvertible ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255, 51, 102, 0.3)'),
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS DA MATRIZ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginTop: '2px', color: matrixAnalysis.isInvertible ? '#00ffaa' : '#ff3366' }}>
            {matrixAnalysis.isInvertible ? (
              <>
                <CheckCircle2 size={16} />
                <span>Invertível em ℤ₂₆</span>
              </>
            ) : (
              <>
                <XCircle size={16} />
                <span>Não Invertível!</span>
              </>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DETERMINANTE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            det = {matrixAnalysis.det} ≡ {matrixAnalysis.detMod26} (mod 26)
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MDC(det, 26)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            gcd({matrixAnalysis.detMod26}, 26) = {matrixAnalysis.gcd}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>INVERSO MODULAR det⁻¹</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-amber)' }}>
            {matrixAnalysis.isInvertible ? `${matrixAnalysis.invDetMod26} (mod 26)` : 'Não existe'}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={handleEncrypt}
          className="btn-primary"
          disabled={!matrixAnalysis.isInvertible}
          style={{ opacity: matrixAnalysis.isInvertible ? 1 : 0.5 }}
        >
          <Lock size={16} /> Criptografar (K · P)
        </button>

        <button
          onClick={handleDecrypt}
          className="btn-secondary"
          disabled={!matrixAnalysis.isInvertible}
          style={{ opacity: matrixAnalysis.isInvertible ? 1 : 0.5 }}
        >
          <Unlock size={16} /> Decriptar (K⁻¹ · C)
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

      {/* Result Display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'rgba(157, 78, 221, 0.08)',
            border: '1px solid rgba(157, 78, 221, 0.25)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle2 size={18} color="#d8bbff" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#d8bbff' }}>
                Texto Cifrado / Processado
              </span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#d8bbff' }}>
              {result.ciphertext}
            </div>
            {result.paddedText !== result.plaintext && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Texto com padding par: <strong>{result.paddedText}</strong>
              </div>
            )}
          </div>

          {/* Block Multiplications breakdown */}
          <div>
            <div className="form-label">Multiplicação Vetorial Bloco a Bloco</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {result.blocks.map((blk, idx) => (
                <div key={idx} className="code-box" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>Bloco {idx + 1}: "{blk.pair}"</span>
                    <span style={{ color: '#00ffaa' }}>→ "{blk.cipherPair}"</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {blk.calculation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
