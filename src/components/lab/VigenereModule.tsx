import React, { useState, useMemo } from 'react';
import { Lock, Unlock, AlertCircle, ArrowRightLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { encryptVigenere, decryptVigenere, validateVigenereWords } from '../../utils/cryptoEngine';

export const VigenereModule: React.FC = () => {
  const [mode, setMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [plaintext, setPlaintext] = useState<string>('Antigravity criptografia sem bibliotecas externas');
  const [key, setKey] = useState<string>('SEGREDO');
  const [copied, setCopied] = useState<boolean>(false);

  const wordValidation = useMemo(() => validateVigenereWords(plaintext), [plaintext]);

  // Real-time calculation based on inputs & mode
  const { result, error } = useMemo(() => {
    if (!plaintext.trim()) {
      return { result: null, error: 'Digite uma mensagem para processamento.' };
    }

    if (!key.trim()) {
      return { result: null, error: 'Informe uma palavra-chave para a cifra.' };
    }

    if (mode === 'ENCRYPT' && !wordValidation.isValid) {
      return {
        result: null,
        error: `A frase deve conter no mínimo 4 palavras válidas (contagem atual: ${wordValidation.wordCount}).`
      };
    }

    try {
      if (mode === 'ENCRYPT') {
        const res = encryptVigenere(plaintext, key, true);
        return { result: res, error: null };
      } else {
        const res = decryptVigenere(plaintext, key);
        return { result: res, error: null };
      }
    } catch (err: any) {
      return { result: null, error: err.message || 'Erro ao processar Vigenère.' };
    }
  }, [mode, plaintext, key, wordValidation]);

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
            <span className="badge badge-neutral">Exercício 03</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              Cifra de Vigenère Polialfabética
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Cifra polialfabética por repetição periódica de palavra-chave em ℤ₂₆.
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
              <span>Criptografar</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DECRYPT')}
              className={`segmented-btn ${mode === 'DECRYPT' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Unlock size={13} />
              <span>Decriptar</span>
            </button>
          </div>
        </div>

        {/* Plaintext Input + Word Validation */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              {mode === 'ENCRYPT' ? 'Frase em Texto Claro' : 'Texto Cifrado'}
            </label>
            {mode === 'ENCRYPT' && (
              <span className={`badge ${wordValidation.isValid ? 'badge-emerald' : 'badge-coral'}`}>
                {wordValidation.wordCount} / 4 palavras
              </span>
            )}
          </div>
          <input
            type="text"
            className="input-field"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder={mode === 'ENCRYPT' ? 'Digite pelo menos 4 palavras...' : 'Digite o texto cifrado...'}
          />
        </div>

        {/* Keyword Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Palavra-Chave (A-Z)</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['SEGREDO', 'KEYWORD', 'CRIPTOGRAFIA'].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setKey(kw)}
                  className={`badge ${key.toUpperCase() === kw ? 'badge-coral' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer' }}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            className="input-field input-field-mono"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="Ex: SEGREDO"
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Caracteres especiais e números são filtrados automaticamente.
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

      {/* Right Column: Live Result & Periodic Alignment */}
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
                    Resultado Vigenère ({mode === 'ENCRYPT' ? 'Cifrado' : 'Decifrado'})
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

            {/* Periodic Key Alignment Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="form-label" style={{ marginBottom: 0 }}>Alinhamento Periódico de Chave</div>
              <div className="code-box" style={{ lineHeight: '1.8', letterSpacing: '0.05em', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--text-dim)', minWidth: '70px', userSelect: 'none' }}>TEXTO:</span>
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>{result.plaintext}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--text-dim)', minWidth: '70px', userSelect: 'none' }}>CHAVE:</span>
                  <span style={{ color: '#fbbf24', fontWeight: 500 }}>{result.alignedKey}</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }}></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--text-dim)', minWidth: '70px', userSelect: 'none' }}>CIFRA:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{result.ciphertext}</span>
                </div>
              </div>
            </div>

            {/* Educational Note */}
            <div style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <strong style={{ color: 'var(--text-warm)' }}>Propriedade Matemática:</strong> A cifra de Vigenère aplica a soma modular C_i = (P_i + K_(i \bmod L)) \bmod 26, onde L é o comprimento da chave. Diferente de César, letras idênticas no texto claro são mapeadas para caracteres cifrados distintos dependendo da sua posição relativa.
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
            Insira o texto e a palavra-chave para calcular a Cifra de Vigenère em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};

