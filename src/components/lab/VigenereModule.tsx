import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { encryptVigenere, decryptVigenere, validateVigenereWords } from '../../utils/cryptoEngine';
import { VigenereResult } from '../../types/crypto';

export const VigenereModule: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>('Antigravity criptografia sem bibliotecas externas');
  const [key, setKey] = useState<string>('SEGREDO');
  const [result, setResult] = useState<VigenereResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordValidation = validateVigenereWords(plaintext);

  const handleEncrypt = () => {
    try {
      setError(null);
      const res = encryptVigenere(plaintext, key, true);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar Vigenère');
    }
  };

  const handleDecrypt = () => {
    try {
      setError(null);
      // Decrypt does not strictly enforce word count to allow decrypting any cipher text
      const res = decryptVigenere(plaintext, key);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao decriptar Vigenère');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-amber">Exercício 3</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cifra de Vigenère Polialfabética</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Cifra polialfabética por repetição de chave. Requisito obrigatório do exercício acadêmico: a frase clara deve conter no mínimo 4 palavras válidas.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Frase para Cifragem</label>
            <span className={`badge ${wordValidation.isValid ? 'badge-emerald' : 'badge-crimson'}`}>
              {wordValidation.wordCount} {wordValidation.wordCount === 1 ? 'palavra' : 'palavras'} (Mínimo: 4)
            </span>
          </div>
          <input
            type="text"
            className="input-field"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder="Digite uma frase com pelo menos 4 palavras..."
          />
        </div>

        <div>
          <label className="form-label">Palavra-Chave (A-Z)</label>
          <input
            type="text"
            className="input-field input-field-mono"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="Ex: SEGREDO"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Caracteres especiais e números na chave são descartados
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={handleEncrypt}
          className="btn-primary"
          disabled={!wordValidation.isValid}
          style={{ opacity: wordValidation.isValid ? 1 : 0.6 }}
        >
          <Lock size={16} /> Criptografar (Vigenère)
        </button>

        <button onClick={handleDecrypt} className="btn-secondary">
          <Unlock size={16} /> Decriptar
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
            background: 'rgba(255, 183, 3, 0.05)',
            border: '1px solid rgba(255, 183, 3, 0.25)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle2 size={18} color="#ffb703" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffb703' }}>
                Resultado Vigenère
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {result.ciphertext}
            </div>
          </div>

          <div>
            <div className="form-label">Alinhamento Periódico da Chave e Deslocamento Modular</div>
            <div className="code-box" style={{ lineHeight: '1.8', letterSpacing: '1px' }}>
              <div>Texto: <span style={{ color: '#ffffff' }}>{result.plaintext}</span></div>
              <div>Chave: <span style={{ color: 'var(--accent-amber)' }}>{result.alignedKey}</span></div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', margin: '4px 0' }}></div>
              <div>Cifra: <span style={{ color: '#ffb703', fontWeight: 700 }}>{result.ciphertext}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
