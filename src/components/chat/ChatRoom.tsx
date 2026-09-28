import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { ChatPacket, CipherType } from '../../types/crypto';
import { MessageBubble } from './MessageBubble';
import {
  encryptOtpDecimal,
  textToDecimal,
  encryptCaesar,
  encryptVigenere,
  encryptHill,
  parseHillKeyString,
  computeChecksum
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cripto_user_name', senderName);
  }, [senderName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [packets]);

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
        // In chat mode, convert text to decimal (ASCII codes), then apply decimal OTP
        const decM = textToDecimal(message);
        if (!/^\d+$/.test(cipherKey.trim())) {
          throw new Error('A chave de OTP deve ser um número decimal positivo.');
        }
        const otpRes = encryptOtpDecimal(decM, cipherKey.trim());
        ciphertext = otpRes.cipherDec;
        metadata = {
          originalDec: decM,
          otpBits: otpRes.bitLength,
          otpKeyHash: cipherKey.trim(), // Shared metadata for Eve detection demonstration
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

      // Clear input but keep key
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Erro ao criptografar mensagem para transmissão.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '20px' }}>
      {/* Top Banner explaining Chat dynamic */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="#00ffaa" />
          <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            <strong>Canal de Demonstração em Rede Local:</strong> Todas as mensagens trafegam 100% cifradas pela LAN. Para ler, qualquer dispositivo conectado deve possuir a chave compartilhada!
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Seu Nome na Rede:</span>
          <input
            type="text"
            className="input-field"
            style={{ width: '150px', padding: '6px 10px', fontSize: '0.85rem' }}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="glass-panel" style={{
        padding: '24px',
        minHeight: '420px',
        maxHeight: '520px',
        overflowY: 'auto',
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
            <Lock size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Nenhum pacote criptografado em trânsito ainda
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              Seja o primeiro a cifrar e disparar uma mensagem na rede local!
            </div>
          </div>
        ) : (
          packets.map((pkt) => (
            <MessageBubble
              key={pkt.id}
              packet={pkt}
              isSelf={pkt.senderId === clientId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSend} className="glass-panel" style={{ padding: '20px' }}>
        {/* Selection Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label className="form-label">Algoritmo Criptográfico</label>
            <select
              className="input-field"
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
              <option value="OTP">One-Time Pad Decimal</option>
              <option value="CAESAR">Cifra de César Generalizada</option>
              <option value="VIGENERE">Cifra de Vigenère</option>
              <option value="HILL">Cifra de Hill (Matriz 2×2)</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Chave Secreta de Envio</label>
              <button
                type="button"
                onClick={handleGenerateKey}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-emerald)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <Sparkles size={12} /> Gerar Chave
              </button>
            </div>
            <input
              type="text"
              className="input-field input-field-mono"
              value={cipherKey}
              onChange={(e) => setCipherKey(e.target.value)}
              placeholder="Digite a chave secreta..."
            />
          </div>
        </div>

        {/* Message Input and Send Button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            className="input-field"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite a mensagem para cifrar e transmitir na LAN..."
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Send size={16} /> Cifrar e Enviar
          </button>
        </div>

        {error && (
          <div style={{ color: '#ff3366', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};
