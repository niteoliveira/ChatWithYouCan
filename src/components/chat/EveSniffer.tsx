import React, { useState } from 'react';
import { AlertTriangle, Radio, Terminal, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
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
      alert('Erro ao processar análise: ' + err.message);
    }
  };

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
      gap: '14px',
      overflow: 'hidden'
    }}>
      {/* Left Column: Intercepted Traffic & Reused Key Alerts */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span className="badge badge-coral">
                <Radio size={11} /> Monitoramento LAN
              </span>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-warm)' }}>
                Tráfego Interceptado
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
              Inspeção de pacotes transitando pelo canal de rede local.
            </p>
          </div>

          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {packets.length} {packets.length === 1 ? 'pacote' : 'pacotes'}
          </span>
        </div>

        {/* Key Reuse Alert */}
        {keyReusedPairs.length > 0 && (
          <div style={{
            background: 'var(--accent-coral-muted)',
            border: '1px solid var(--accent-coral-border)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff5c7a', fontWeight: 600, fontSize: '0.8rem' }}>
              <AlertTriangle size={15} />
              <span>Chave Reutilizada Detectada em Trânsito</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Dois nós utilizaram o mesmo segredo OTP. A chave pode ser anulada algebricamente:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {keyReusedPairs.map(([p1, p2], idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPkt1(p1.ciphertext);
                    setSelectedPkt2(p2.ciphertext);
                    handleLaunchAttack(p1.ciphertext, p2.ciphertext);
                  }}
                  className="btn-danger"
                  style={{ fontSize: '0.74rem', padding: '5px 10px' }}
                >
                  <ShieldAlert size={12} /> Analisar Par: {p1.senderName} e {p2.senderName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Captured Packets Feed */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="form-label" style={{ marginBottom: '6px' }}>Fluxo de Pacotes na Rede</div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg-inset)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {packets.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px 10px', fontSize: '0.78rem' }}>
                Nenhum tráfego detectado na LAN até o momento.
              </div>
            ) : (
              packets.map((pkt) => (
                <div
                  key={pkt.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{pkt.cipherType}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-warm)' }}>{pkt.senderName}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {new Date(pkt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    wordBreak: 'break-all',
                    background: 'var(--bg-inset)',
                    padding: '4px 6px',
                    borderRadius: '4px'
                  }}>
                    {pkt.ciphertext}
                  </div>

                  {pkt.cipherType === 'OTP' && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedPkt1(pkt.ciphertext)}
                        className={`badge ${selectedPkt1 === pkt.ciphertext ? 'badge-coral' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer', fontSize: '0.68rem' }}
                      >
                        Definir C₁
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPkt2(pkt.ciphertext)}
                        className={`badge ${selectedPkt2 === pkt.ciphertext ? 'badge-coral' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer', fontSize: '0.68rem' }}
                      >
                        Definir C₂
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Two-Time Pad Cryptanalysis Workbench */}
      <div className="glass-panel" style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        gap: '14px'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Terminal size={15} color="var(--text-muted)" />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-warm)' }}>
            Estação de Criptoanálise C₁ ⊕ C₂
          </h3>
        </div>

        {/* Selected Packets Input */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          <div>
            <label className="form-label">Pacote 1 (C₁ Decimal)</label>
            <input
              type="text"
              className="input-field input-field-mono"
              placeholder="Cole ou selecione C1..."
              value={selectedPkt1}
              onChange={(e) => setSelectedPkt1(e.target.value)}
              style={{ fontSize: '0.78rem' }}
            />
          </div>

          <div>
            <label className="form-label">Pacote 2 (C₂ Decimal)</label>
            <input
              type="text"
              className="input-field input-field-mono"
              placeholder="Cole ou selecione C2..."
              value={selectedPkt2}
              onChange={(e) => setSelectedPkt2(e.target.value)}
              style={{ fontSize: '0.78rem' }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleLaunchAttack(selectedPkt1, selectedPkt2)}
          className="btn-primary"
          disabled={!selectedPkt1 || !selectedPkt2}
          style={{
            opacity: selectedPkt1 && selectedPkt2 ? 1 : 0.5,
            cursor: selectedPkt1 && selectedPkt2 ? 'pointer' : 'not-allowed',
            fontSize: '0.8rem',
            justifyContent: 'center'
          }}
        >
          <ShieldAlert size={14} />
          <span>Executar Ataque Two-Time Pad (C₁ ⊕ C₂)</span>
        </button>

        {/* Analysis Result */}
        {analysisResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.82rem',
              background: 'rgba(16, 185, 129, 0.08)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <CheckCircle2 size={15} />
              <span>Chave Secreta K Cancelada por Idempotência (K ⊕ K = 0)</span>
            </div>

            <div>
              <div className="form-label">Trilha Algébrica Passo a Passo</div>
              <div className="code-box" style={{ lineHeight: '1.8', fontSize: '0.78rem' }}>
                {analysisResult.explanation.map((line, idx) => (
                  <div key={idx} style={{
                    color: idx === 4 ? '#ff5c7a' : idx >= 5 ? '#34d399' : undefined,
                    fontWeight: idx === 4 ? 600 : 400
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {analysisResult.cribCandidates.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sparkles size={13} color="#fbbf24" />
                  <span className="form-label" style={{ marginBottom: 0 }}>Crib-Dragging: Varredura de Hipóteses Conhecidas</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {analysisResult.cribCandidates.map((cand, idx) => (
                    <div key={idx} className="code-box" style={{ padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.78rem' }}>
                        Palpite (Crib): "{cand.crib}"
                      </div>
                      <div style={{ color: '#34d399', marginTop: '4px', fontSize: '0.78rem' }}>
                        Texto Revelado: "{cand.revealed}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-dim)',
            padding: '30px',
            fontSize: '0.82rem'
          }}>
            Selecione dois pacotes OTP na coluna esquerda ou cole seus valores decimais para calcular o cancelamento da chave.
          </div>
        )}
      </div>
    </div>
  );
};
