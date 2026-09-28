import React from 'react';
import { Layers, GitMerge, Code2, ShieldCheck } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-neutral">Documentação</span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-warm)' }}>
            Arquitetura e Fluxo de Dados
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '850px' }}>
          Como o estado reativo do React gerencia as operações criptográficas, como as propriedades fluem entre componentes e como a conexão LAN opera via WebSockets.
        </p>
      </div>

      {/* Grid of concepts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Concept 1: useState */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-warm)'
            }}>
              <Code2 size={15} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              1. Estado Local com useState
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
            No React, variáveis simples não atualizam o DOM. O Hook <code>useState</code> conecta um valor ao ciclo de renderização:
          </p>
          <div className="code-box" style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
            {`const [messageDec, setMessageDec] = useState<string>('12345');\n\n// Ao chamar setMessageDec(novoValor):\n// O React re-executa o componente e atualiza o DOM`}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            Cada alteração nos campos de entrada recalcula os resultados e passos criptográficos em tempo real.
          </p>
        </div>

        {/* Concept 2: Unidirectional Data Flow */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-warm)'
            }}>
              <GitMerge size={15} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              2. Fluxo Unidirecional (Props)
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
            O estado central reside nos componentes superiores e é repassado aos filhos como propriedades imutáveis:
          </p>
          <div className="code-box" style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
            {`// CryptoContext gerencia pacotes recebidos pela LAN\n<ChatRoom\n  packets={packets}\n  clientId={clientId}\n  onSendPacket={sendPacket}\n/>`}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            Comunicação inversa ocorre via callbacks, garantindo rastreabilidade do fluxo de dados.
          </p>
        </div>

        {/* Concept 3: useEffect & WebSockets */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-warm)'
            }}>
              <Layers size={15} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              3. Ciclo de Vida e WebSockets com useEffect
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
            Conexões de rede persistentes são efeitos colaterais gerenciados por <code>useEffect</code>:
          </p>
          <div className="code-box" style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
            {`useEffect(() => {\n  const socket = new WebSocket(url);\n  socket.onmessage = (e) => handlePacket(JSON.parse(e.data));\n  return () => socket.close(); // Limpeza ao desmontar\n}, []);`}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            A função de cleanup fecha o socket ao desmontar a página, prevenindo vazamentos de conexões.
          </p>
        </div>

        {/* Concept 4: TypeScript Safety */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-warm)'
            }}>
              <ShieldCheck size={15} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-warm)' }}>
              4. Tipagem Estrita com TypeScript
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
            Estruturas matemáticas e tipos de cifras são garantidos em tempo de compilação:
          </p>
          <div className="code-box" style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
            {`export type Matrix2x2 = [\n  [number, number],\n  [number, number]\n];\n\nexport type CipherType = 'OTP' | 'CAESAR' | 'VIGENERE' | 'HILL';`}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            Dimensões inválidas de matrizes ou algoritmos inexistentes são bloqueados pelo compilador.
          </p>
        </div>
      </div>
    </div>
  );
};

