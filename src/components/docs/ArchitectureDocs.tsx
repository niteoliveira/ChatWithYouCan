import React from 'react';
import { BookOpen, Layers, GitMerge, Code2, ShieldCheck, Cpu } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-emerald">Guia Didático</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            Engenharia de Software: React, TypeScript e Fluxo de Dados
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '850px' }}>
          Esta seção explica em detalhes como o sistema foi estruturado, como o estado reativo do React gerencia as entradas criptográficas, como o fluxo unidirecional de dados opera entre os componentes e como a rede local se integra via WebSockets.
        </p>
      </div>

      {/* Grid of concepts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Concept 1: useState */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 255, 170, 0.1)', color: '#00ffaa' }}>
              <Code2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Gerenciamento de Estado com useState</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            No React, variáveis comuns não provocam a atualização da tela quando alteradas. O Hook <code>useState</code> associa uma variável reativa a uma função disparadora (setter):
          </p>
          <div className="code-box" style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
            {`const [messageDec, setMessageDec] = useState<string>('12345');\n\n// Ao invocar setMessageDec(novoValor):\n// 1. O React agenda uma re-renderização.\n// 2. Compara o novo estado com o anterior.\n// 3. Atualiza somente o DOM necessário.`}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
            <strong>Na prática do CriptoLab:</strong> Cada mudança no campo de texto de uma cifra (seja a frase de Vigenère ou os valores da matriz de Hill) atualiza o estado correspondente e recalcula instantaneamente os determinantes e preenchimentos.
          </p>
        </div>

        {/* Concept 2: Unidirectional Data Flow */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}>
              <GitMerge size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Fluxo Unidirecional de Dados (Props)</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            O React adota o fluxo <em>top-down</em> (de cima para baixo). O estado central reside no componente pai (<code>App.tsx</code>) e desce para os componentes filhos como propriedades imutáveis (<code>props</code>):
          </p>
          <div className="code-box" style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
            {`// App.tsx gerencia a lista global de pacotes\n<ChatRoom\n  packets={packets}\n  clientId={clientId}\n  onSendPacket={handleBroadcast}\n/>`}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
            Quando o filho precisa modificar algo no pai, ele invoca funções de callback passadas via props (inversão de controle), garantindo previsibilidade total no ciclo de vida.
          </p>
        </div>

        {/* Concept 3: useEffect & WebSockets */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Efeitos Colaterais com useEffect</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            Conexões de rede, escuta de WebSockets e timers são efeitos colaterais (side effects). O Hook <code>useEffect</code> garante que o socket seja inicializado uma única vez:
          </p>
          <div className="code-box" style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
            {`useEffect(() => {\n  const conn = createWebSocketConnection(\n    (packet) => setPackets(prev => [...prev, packet]),\n    (status) => setWsStatus(status)\n  );\n  // Função de limpeza (cleanup) ao desmontar:\n  return () => conn.close();\n}, []);`}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
            O array de dependências vazio <code>[]</code> instrui o React a executar o efeito apenas na montagem inicial, evitando reconexões desnecessárias.
          </p>
        </div>

        {/* Concept 4: TypeScript Safety */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(157, 78, 221, 0.1)', color: '#d8bbff' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>4. Segurança Tipada com TypeScript</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            Erros matemáticos ou matrizes com dimensões erradas são prevenidos antes mesmo do código rodar através de tipos estritos:
          </p>
          <div className="code-box" style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
            {`export type Matrix2x2 = [\n  [number, number],\n  [number, number]\n];\n\nexport type CipherType = 'OTP' | 'CAESAR' | 'VIGENERE' | 'HILL';`}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
            Se um desenvolvedor passar uma matriz 3x3 ou uma cifra inexistente, o compilador recusa a compilação, eliminando bugs silenciosos em tempo de desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  );
};
