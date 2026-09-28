import React, { useState } from 'react';
import { Skull, AlertTriangle, Radio, Terminal, Zap, CheckCircle2 } from 'lucide-react';
import { ChatPacket, TwoTimePadResult } from '../../types/crypto';
import { analyzeTwoTimePad } from '../../utils/cryptoEngine';

interface EveSnifferProps {
  packets: ChatPacket[];
}

export const EveSniffer: React.FC<EveSnifferProps> = ({ packets }) => {
  const [selectedPkt1, setSelectedPkt1] = useState<string>('');
  const [selectedPkt2, setSelectedPkt2] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<TwoTimePadResult | null>(null);

  // Filter only OTP packets
  const otpPackets = packets.filter((p) => p.cipherType === 'OTP');

  // Detect potential key reuse
  const keyReusedPairs: Array<[ChatPacket, ChatPacket]> = [];
  for (let i = 0; i < otpPackets.length; i++) {
    for (let j = i + 1; j < otpPackets.length; j++) {
      const p1 = otpPackets[i];
      const p2 = otpPackets[j];
      if (p1.metadata?.otpKeyHash && p1.metadata?.otpKeyHash === p2.metadata?.otpKeyHash) {
        keyReusedPairs.push([p1, p2]);
      }
    }
  }

  const handleLaunchAttack = (c1: string, c2: string) => {
    try {
      const res = analyzeTwoTimePad(c1, c2);
      setAnalysisResult(res);
    } catch (err: any) {
      alert('Erro ao processar ataque: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
      {/* Red Hacker Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        border: '1px solid rgba(255, 51, 102, 0.4)',
        background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.08) 0%, rgba(10, 15, 24, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-crimson">
                <Skull size={14} /> MODO INTERCEPTADOR / EVE
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ff3366' }}>
                Sniffer de Rede e Quebra de Two-Time Pad ao Vivo
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '780px' }}>
              Este painel simula a escuta passiva de tráfego de rede (Eve/Sniffer). Quando dois dispositivos na sala de aula transmitem mensagens cifradas por OTP reutilizando a mesma chave decimal, a chave se anula matematicamente ($K \oplus K = 0$), permitindo a revelação das mensagens claras.
            </p>
          </div>

          <div className="badge badge-crimson" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            <Radio size={14} className="pulse-glow" />
            <span>{packets.length} Pacotes Capturados na LAN</span>
          </div>
        </div>
      </div>

      {/* Real-Time Key Reuse Alert if detected */}
      {keyReusedPairs.length > 0 && (
        <div style={{
          background: 'rgba(255, 51, 102, 0.15)',
          border: '2px solid #ff3366',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 0 25px rgba(255, 51, 102, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff3366', fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px' }}>
            <AlertTriangle size={24} />
            <span>ALERTA VERMELHO: Reutilização de Chave OTP Detectada em Trânsito!</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '14px' }}>
            Dois pacotes na rede foram gerados com a mesma chave secreta decimal. Clique abaixo para executar o ataque Two-Time Pad imediatamente:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {keyReusedPairs.map(([p1, p2], idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPkt1(p1.ciphertext);
                  setSelectedPkt2(p2.ciphertext);
                  handleLaunchAttack(p1.ciphertext, p2.ciphertext);
                }}
                className="btn-danger"
                style={{ fontWeight: 700 }}
              >
                <Zap size={15} /> Atacar Par: [{p1.senderName}] e [{p2.senderName}]
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Attack Trigger */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#00ffaa" />
          <span>Executar Criptoanálise C₁ ⊕ C₂ sobre Pacotes do Chat</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label className="form-label">Pacote 1 (C₁ Decimal)</label>
            <input
              type="text"
              className="input-field input-field-mono"
              placeholder="Cole ou selecione o pacote C1..."
              value={selectedPkt1}
              onChange={(e) => setSelectedPkt1(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Pacote 2 (C₂ Decimal)</label>
            <input
              type="text"
              className="input-field input-field-mono"
              placeholder="Cole ou selecione o pacote C2..."
              value={selectedPkt2}
              onChange={(e) => setSelectedPkt2(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={() => handleLaunchAttack(selectedPkt1, selectedPkt2)}
          className="btn-danger"
          disabled={!selectedPkt1 || !selectedPkt2}
          style={{ opacity: selectedPkt1 && selectedPkt2 ? 1 : 0.5 }}
        >
          <Skull size={16} /> Calcular C₁ ⊕ C₂ e Quebrar Mensagens
        </button>
      </div>

      {/* Attack Results */}
      {analysisResult && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(0, 255, 170, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ffaa', fontWeight: 700, marginBottom: '14px' }}>
            <CheckCircle2 size={18} />
            <span>Resultado da Interceptação: Cancelamento da Chave</span>
          </div>

          <div className="code-box" style={{ lineHeight: '1.8', marginBottom: '20px' }}>
            {analysisResult.explanation.map((line, idx) => (
              <div key={idx} style={{ color: idx === 4 ? '#ff3366' : idx >= 5 ? '#00ffaa' : undefined, fontWeight: idx === 4 ? 700 : 400 }}>
                {line}
              </div>
            ))}
          </div>

          <div>
            <div className="form-label">Cribs / Palavras Candidatas Reveladas</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {analysisResult.cribCandidates.map((cand, idx) => (
                <div key={idx} className="code-box">
                  <div style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                    Palpite: "{cand.crib}"
                  </div>
                  <div style={{ color: '#00ffaa', marginTop: '4px' }}>
                    Texto Revelado: "{cand.revealed}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Raw Network Traffic Inspector */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={18} color="var(--accent-cyan)" />
          <span>Inspetor de Pacotes Brutos (Captura Promíscua na LAN)</span>
        </h3>

        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          background: '#05080e',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '12px'
        }}>
          {packets.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              Nenhum pacote detectado na rede ainda.
            </div>
          ) : (
            packets.map((pkt) => (
              <div
                key={pkt.id}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>[{pkt.cipherType}]</span>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>De: {pkt.senderName} ({pkt.senderId})</span>
                  <div style={{ color: '#a8d5e5', marginTop: '4px', wordBreak: 'break-all' }}>
                    Cifrado: {pkt.ciphertext}
                  </div>
                </div>

                {pkt.cipherType === 'OTP' && (
                  <button
                    onClick={() => {
                      if (!selectedPkt1) setSelectedPkt1(pkt.ciphertext);
                      else setSelectedPkt2(pkt.ciphertext);
                    }}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    Selecionar p/ Ataque
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
