import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Shuffle, AlertCircle, ShieldCheck, Key, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';
import { ChatPacket, CipherType } from '../../types/crypto';
import { MessageBubble } from './MessageBubble';
import {
  encryptOtpDecimal,
  textToDecimal,
  encryptCaesar,
  encryptVigenere,
  encryptHill,
  parseHillKeyString,
  computeChecksum,
  decryptOtpDecimal,
  decryptCaesar,
  decryptVigenere,
  decryptHill,
  decimalToText
} from '../../utils/cryptoEngine';

interface ChatRoomProps {
  packets: ChatPacket[];
  clientId: string;
  onSendPacket: (packet: {
    cipherType: CipherType;
    ciphertext: string;
    senderName: string;
    metadata?: any;
  }) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ packets, clientId, onSendPacket }) => {
  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem('cripto_user_name') || 'Aluno_' + clientId.slice(-4);
  });
  const [message, setMessage] = useState<string>('Ataque ao amanhecer na base secreta');
  const [cipherType, setCipherType] = useState<CipherType>('OTP');
  const [cipherKey, setCipherKey] = useState<string>('9988776655');
  const [error, setError] = useState<string | null>(null);

  // Selected packet for right-hand inspector
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);
  const [inspectorKey, setInspectorKey] = useState<string>('');
  const [inspectorDecrypted, setInspectorDecrypted] = useState<string | null>(null);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [copiedCipher, setCopiedCipher] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cripto_user_name', senderName);
  }, [senderName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!selectedPacketId && packets.length > 0) {
      setSelectedPacketId(packets[packets.length - 1].id);
    }
  }, [packets]);

  const selectedPacket = packets.find((p) => p.id === selectedPacketId) || packets[packets.length - 1] || null;

  // Reset inspector state when selected packet changes
  useEffect(() => {
    setInspectorKey('');
    setInspectorDecrypted(null);
    setInspectorError(null);
  }, [selectedPacketId]);

  const handleGenerateKey = () => {
    if (cipherType === 'OTP') {
      let rand = '';
      for (let i = 0; i < 10; i++) rand += Math.floor(Math.random() * 10);
      setCipherKey(rand);
    } else if (cipherType === 'CAESAR') {
      setCipherKey(String(Math.floor(1 + Math.random() * 25)));
    } else if (cipherType === 'VIGENERE') {
      const keys = ['VERAO', 'CRIPTOGRAFIA', 'MATRIZ', 'ALGORITMO', 'SENHA'];
      setCipherKey(keys[Math.floor(Math.random() * keys.length)]);
    } else if (cipherType === 'HILL') {
      const hillKeys = ['HILL', 'GYBN', 'DDCF'];
      setCipherKey(hillKeys[Math.floor(Math.random() * hillKeys.length)]);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError('A mensagem não pode estar vazia.');
      return;
    }

    try {
      let ciphertext = '';
      let metadata: any = {};

      if (cipherType === 'OTP') {
        const decM = textToDecimal(message);
        if (!/^\d+$/.test(cipherKey.trim())) {
          throw new Error('A chave de OTP deve ser um número decimal positivo.');
        }
        const otpRes = encryptOtpDecimal(decM, cipherKey.trim());
        ciphertext = otpRes.cipherDec;
        metadata = {
          originalDec: decM,
          otpBits: otpRes.bitLength,
          otpKeyHash: cipherKey.trim(),
          checksum: computeChecksum(message)
        };
      } else if (cipherType === 'CAESAR') {
        const shift = parseInt(cipherKey.trim(), 10);
        if (isNaN(shift)) throw new Error('A chave de César deve ser um número inteiro de deslocamento.');
        const cRes = encryptCaesar(message, shift);
        ciphertext = cRes.ciphertext;
        metadata = { checksum: computeChecksum(message) };
      } else if (cipherType === 'VIGENERE') {
        const vRes = encryptVigenere(message, cipherKey.trim(), false);
        ciphertext = vRes.ciphertext;
        metadata = { checksum: computeChecksum(message) };
      } else if (cipherType === 'HILL') {
        const matrix = parseHillKeyString(cipherKey.trim());
        const hRes = encryptHill(message, matrix);
        ciphertext = hRes.ciphertext;
        metadata = {
          hillPadding: hRes.paddedText !== hRes.plaintext,
          checksum: computeChecksum(hRes.paddedText)
        };
      }

      onSendPacket({
        cipherType,
        ciphertext,
        senderName,
        metadata
      });

      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Erro ao criptografar mensagem para transmissão.');
    }
  };

  const handleInspectorDecrypt = () => {
    if (!selectedPacket) return;
    try {
      setInspectorError(null);
      if (!inspectorKey.trim()) {
        setInspectorError('Insira a chave simétrica.');
        return;
      }

      let candidate = '';
      if (selectedPacket.cipherType === 'OTP') {
        const decOtp = decryptOtpDecimal(selectedPacket.ciphertext, inspectorKey.trim());
        candidate = decimalToText(decOtp.messageDec);
      } else if (selectedPacket.cipherType === 'CAESAR') {
        const shift = parseInt(inspectorKey.trim(), 10);
        if (isNaN(shift)) throw new Error('A chave de César deve ser um número inteiro.');
        candidate = decryptCaesar(selectedPacket.ciphertext, shift).ciphertext;
      } else if (selectedPacket.cipherType === 'VIGENERE') {
        candidate = decryptVigenere(selectedPacket.ciphertext, inspectorKey.trim()).plaintext;
      } else if (selectedPacket.cipherType === 'HILL') {
        const matrix = parseHillKeyString(inspectorKey.trim());
        candidate = decryptHill(selectedPacket.ciphertext, matrix).ciphertext;
      }

      // Cryptographic authentication
      let isMatch = true;
      if (selectedPacket.metadata?.checksum !== undefined) {
        if (computeChecksum(candidate) !== selectedPacket.metadata.checksum) {
          isMatch = false;
        }
      } else if (selectedPacket.metadata?.otpKeyHash) {
        if (inspectorKey.trim() !== selectedPacket.metadata.otpKeyHash) {
          isMatch = false;
        }
      }

      if (selectedPacket.cipherType === 'OTP' && candidate.startsWith('[Decimal puro:')) {
        isMatch = false;
      }

      if (!isMatch) {
        setInspectorError('Chave inválida. Checksum criptográfico não confere.');
        setInspectorDecrypted(null);
        return;
      }

      setInspectorDecrypted(candidate);
      setInspectorError(null);
    } catch (err: any) {
      setInspectorError(err.message || 'Falha ao decriptar pacote.');
      setInspectorDecrypted(null);
    }
  };

  const handleCopyCipher = () => {
    if (selectedPacket) {
      navigator.clipboard.writeText(selectedPacket.ciphertext);
      setCopiedCipher(true);
      setTimeout(() => setCopiedCipher(false), 2000);
    }
  };

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 360px)',
      gap: '14px',
      overflow: 'hidden'
    }}>
      {/* Left Column: Messenger Chat Feed + Docked Input */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Messenger Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              Canal de Transmissão LAN
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              {packets.length} {packets.length === 1 ? 'pacote' : 'pacotes'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Seu Nome:</span>
            <input
              type="text"
              className="input-field"
              style={{ width: '130px', padding: '3px 8px', fontSize: '0.78rem' }}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        </div>

        {/* Message Feed */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {packets.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '40px 20px'
            }}>
              <Lock size={26} color="var(--text-dim)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-warm)', marginBottom: '4px' }}>
                Nenhum pacote transmitido ainda
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Escreva e envie uma mensagem cifrada abaixo para circular na rede.
              </div>
            </div>
          ) : (
            packets.map((pkt) => (
              <div
                key={pkt.id}
                onClick={() => setSelectedPacketId(pkt.id)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                  background: selectedPacketId === pkt.id ? 'rgba(255, 49, 87, 0.04)' : 'transparent',
                  outline: selectedPacketId === pkt.id ? '1px solid var(--accent-coral-border)' : 'none',
                  padding: '4px'
                }}
              >
                <MessageBubble
                  packet={pkt}
                  isSelf={pkt.senderId === clientId}
                />
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Docked Send Form */}
        <form onSubmit={handleSend} style={{
          borderTop: '1px solid var(--border-color)',
          padding: '14px 18px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Controls Bar: Cipher Selector & Key Field */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr auto', gap: '8px', alignItems: 'center' }}>
            <select
              className="input-field"
              style={{ fontSize: '0.78rem', padding: '6px 8px' }}
              value={cipherType}
              onChange={(e) => {
                const val = e.target.value as CipherType;
                setCipherType(val);
                if (val === 'OTP') setCipherKey('9988776655');
                if (val === 'CAESAR') setCipherKey('3');
                if (val === 'VIGENERE') setCipherKey('SEGREDO');
                if (val === 'HILL') setCipherKey('HILL');
              }}
            >
              <option value="OTP">OTP Decimal</option>
              <option value="CAESAR">Cifra de César</option>
              <option value="VIGENERE">Vigenère</option>
              <option value="HILL">Hill (2×2)</option>
            </select>

            <input
              type="text"
              className="input-field input-field-mono"
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
              value={cipherKey}
              onChange={(e) => setCipherKey(e.target.value)}
              placeholder="Chave secreta..."
            />

            <button
              type="button"
              onClick={handleGenerateKey}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              title="Gerar chave aleatória para o algoritmo atual"
            >
              <Shuffle size={12} />
              <span>Chave Aleatória</span>
            </button>
          </div>

          {/* Message Input and Send Button */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="input-field"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem em texto claro para cifrar e transmitir..."
              style={{ fontSize: '0.82rem' }}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '8px 16px', fontSize: '0.8rem' }}>
              <Send size={13} />
              <span>Cifrar & Enviar</span>
            </button>
          </div>

          {error && (
            <div style={{ color: '#ff5c7a', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Right Column: Packet Inspector & Key Decryptor */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Terminal size={15} color="var(--text-muted)" />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-warm)' }}>
            Inspetor Criptográfico de Pacote
          </h3>
        </div>

        {selectedPacket ? (
          <>
            {/* Packet Metadata */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>Remetente:</span>
                <span style={{ color: 'var(--text-warm)', fontWeight: 600 }}>{selectedPacket.senderName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>Algoritmo:</span>
                <span className="badge badge-neutral">{selectedPacket.cipherType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-dim)' }}>Data/Hora:</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {new Date(selectedPacket.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {selectedPacket.metadata?.checksum !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Checksum:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontSize: '0.72rem' }}>
                    {String(selectedPacket.metadata.checksum).slice(0, 12)}
                  </span>
                </div>
              )}
            </div>

            {/* Ciphertext in Transit */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Cifra Capturada na Rede</label>
                <button
                  type="button"
                  onClick={handleCopyCipher}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                >
                  {copiedCipher ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                  <span>{copiedCipher ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <div className="code-box" style={{ wordBreak: 'break-all', fontSize: '0.8rem', padding: '10px' }}>
                {selectedPacket.ciphertext}
              </div>
            </div>

            {/* Symmetric Decryption Workbench */}
            <div style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={13} color="var(--text-muted)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-warm)' }}>
                  Decriptação com Chave Simétrica
                </span>
              </div>

              <div>
                <input
                  type="text"
                  className="input-field input-field-mono"
                  style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                  placeholder={
                    selectedPacket.cipherType === 'OTP'
                      ? 'Chave decimal (Ex: 9988776655)'
                      : selectedPacket.cipherType === 'CAESAR'
                      ? 'Deslocamento K (Ex: 3)'
                      : selectedPacket.cipherType === 'VIGENERE'
                      ? 'Palavra-chave (Ex: SEGREDO)'
                      : 'Chave Hill ("HILL")'
                  }
                  value={inspectorKey}
                  onChange={(e) => setInspectorKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInspectorDecrypt()}
                />
              </div>

              <button
                type="button"
                onClick={handleInspectorDecrypt}
                className="btn-primary"
                style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
              >
                <ShieldCheck size={13} />
                <span>Testar Chave & Verificar Checksum</span>
              </button>

              {inspectorError && (
                <div style={{
                  background: 'var(--accent-coral-muted)',
                  border: '1px solid var(--accent-coral-border)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#ff5c7a',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={13} />
                  <span>{inspectorError}</span>
                </div>
              )}

              {inspectorDecrypted && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  padding: '10px 12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>Texto Claro Autenticado</span>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-warm)' }}>
                    {inspectorDecrypted}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-dim)',
            padding: '30px 16px',
            fontSize: '0.8rem'
          }}>
            Clique em qualquer pacote na conversa para inspecionar seus bytes e testar a decriptação.
          </div>
        )}
      </div>
    </div>
  );
};
