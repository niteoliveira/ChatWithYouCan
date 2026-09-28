import React, { useState } from 'react';
import { Lock, Unlock, Key, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { ChatPacket } from '../../types/crypto';
import {
  decryptOtpDecimal,
  decryptCaesar,
  decryptVigenere,
  decryptHill,
  parseHillKeyString,
  decimalToText,
  computeChecksum
} from '../../utils/cryptoEngine';

interface MessageBubbleProps {
  packet: ChatPacket;
  isSelf: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ packet, isSelf }) => {
  const [keyInput, setKeyInput] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDecryptor, setShowDecryptor] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [corruptedOutput, setCorruptedOutput] = useState<string | null>(null);

  const handleCopyCipher = () => {
    navigator.clipboard.writeText(packet.ciphertext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttemptDecrypt = () => {
    try {
      setError(null);
      setCorruptedOutput(null);

      if (!keyInput.trim()) {
        setError('Insira a chave secreta compartilhada pelo remetente.');
        return;
      }

      let candidate = '';

      if (packet.cipherType === 'OTP') {
        const decOtp = decryptOtpDecimal(packet.ciphertext, keyInput.trim());
        candidate = decimalToText(decOtp.messageDec);
      } else if (packet.cipherType === 'CAESAR') {
        const shift = parseInt(keyInput.trim(), 10);
        if (isNaN(shift)) throw new Error('A chave de César deve ser um número inteiro (deslocamento).');
        const dec = decryptCaesar(packet.ciphertext, shift);
        candidate = dec.ciphertext;
      } else if (packet.cipherType === 'VIGENERE') {
        const dec = decryptVigenere(packet.ciphertext, keyInput.trim());
        candidate = dec.plaintext;
      } else if (packet.cipherType === 'HILL') {
        const matrix = parseHillKeyString(keyInput.trim());
        const dec = decryptHill(packet.ciphertext, matrix);
        candidate = dec.ciphertext;
      }

      // Cryptographic authentication: check if decrypted text matches the original checksum
      let isMatch = true;

      if (packet.metadata?.checksum !== undefined) {
        const candidateChecksum = computeChecksum(candidate);
        if (candidateChecksum !== packet.metadata.checksum) {
          isMatch = false;
        }
      } else if (packet.metadata?.otpKeyHash) {
        if (keyInput.trim() !== packet.metadata.otpKeyHash) {
          isMatch = false;
        }
      }

      // If OTP produced an unparseable decimal prefix
      if (packet.cipherType === 'OTP' && candidate.startsWith('[Decimal puro:')) {
        isMatch = false;
      }

      if (!isMatch) {
        setError('Chave incorreta! A chave não corresponde ao segredo deste pacote.');
        setCorruptedOutput(candidate);
        setDecryptedText(null);
        return;
      }

      // Key is verified and authentic
      setDecryptedText(candidate);
      setCorruptedOutput(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Falha na decriptação com esta chave.');
      setDecryptedText(null);
      setCorruptedOutput(null);
    }
  };

  const getCipherBadge = () => {
    switch (packet.cipherType) {
      case 'OTP':
        return <span className="badge badge-emerald">One-Time Pad (Dec)</span>;
      case 'CAESAR':
        return <span className="badge badge-cyan">César Generalizado</span>;
      case 'VIGENERE':
        return <span className="badge badge-amber">Vigenère</span>;
      case 'HILL':
        return <span className="badge badge-purple" style={{ background: 'rgba(157, 78, 221, 0.15)', color: '#d8bbff' }}>Hill (Matriz)</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isSelf ? 'flex-end' : 'flex-start',
      marginBottom: '18px'
    }}>
      {/* Sender and timestamp header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginBottom: '4px',
        padding: '0 4px'
      }}>
        <span style={{ fontWeight: 700, color: isSelf ? '#00ffaa' : 'var(--text-main)' }}>
          {packet.senderName} {isSelf && '(Você)'}
        </span>
        <span>•</span>
        <span>{new Date(packet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        {getCipherBadge()}
      </div>

      {/* Bubble Container */}
      <div style={{
        maxWidth: '85%',
        background: isSelf ? 'rgba(0, 255, 170, 0.05)' : 'rgba(20, 28, 45, 0.7)',
        border: '1px solid ' + (isSelf ? 'rgba(0, 255, 170, 0.25)' : 'rgba(255, 255, 255, 0.09)'),
        borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Ciphertext in transit */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.05em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Pacote Cifrado em Trânsito na LAN</span>
            <button
              onClick={handleCopyCipher}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem'
              }}
            >
              {copied ? <Check size={12} color="#00ffaa" /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.92rem',
            color: '#a8d5e5',
            wordBreak: 'break-all',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '8px 10px',
            borderRadius: '6px',
            marginTop: '4px'
          }}>
            {packet.ciphertext}
          </div>
        </div>

        {/* Decrypted Reveal (if successful) */}
        {decryptedText ? (
          <div style={{
            background: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid rgba(0, 255, 170, 0.4)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffaa', fontSize: '0.75rem', fontWeight: 700, marginBottom: '2px' }}>
              <CheckCircle2 size={14} />
              <span>Mensagem Revelada com Sucesso</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
              {decryptedText}
            </div>
          </div>
        ) : (
          <div>
            {!showDecryptor ? (
              <button
                onClick={() => setShowDecryptor(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0,
                  marginTop: '6px'
                }}
              >
                <Key size={13} /> Inserir Chave Secreta para Decriptar
              </button>
            ) : (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                    placeholder={
                      packet.cipherType === 'OTP'
                        ? 'Chave decimal (Ex: 67890)'
                        : packet.cipherType === 'CAESAR'
                        ? 'Deslocamento K (Ex: 3)'
                        : packet.cipherType === 'VIGENERE'
                        ? 'Palavra-chave (Ex: SEGREDO)'
                        : 'Chave Hill ("HILL" ou "a,b,c,d")'
                    }
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAttemptDecrypt()}
                  />
                  <button
                    onClick={handleAttemptDecrypt}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    <Unlock size={14} /> Decifrar
                  </button>
                </div>

                {error && (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ color: '#ff3366', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <AlertCircle size={13} />
                      <span>{error}</span>
                    </div>
                    {corruptedOutput && (
                      <div style={{
                        marginTop: '6px',
                        padding: '6px 10px',
                        background: 'rgba(255, 51, 102, 0.08)',
                        border: '1px solid rgba(255, 51, 102, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.73rem',
                        color: 'var(--text-muted)'
                      }}>
                        <div style={{ color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '2px' }}>
                          Resultado obtido com chave incorreta (ruído matemático):
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: '#ff6688', wordBreak: 'break-all' }}>
                          {corruptedOutput.length > 70 ? corruptedOutput.slice(0, 70) + '...' : corruptedOutput}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
