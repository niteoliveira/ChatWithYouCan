# CriptoLab & CriptoChat LAN

Laboratório acadêmico de criptografia clássica e sala de chat em rede local com transmissão de pacotes cifrados e criptoanálise em tempo real. Implementação em **React + TypeScript puro** (zero dependências criptográficas externas).

## Estrutura do Projeto

```
src/
├── api/             # Chamadas de API para o backend LAN
│   └── lanApi.ts
├── assets/          # Ícones e recursos estáticos
│   └── logo.svg
├── components/      # Componentes visuais reutilizáveis
│   ├── chat/        # Balões e salas de chat
│   ├── lab/         # Módulos interativos das cifras
│   ├── docs/        # Documentação didática de engenharia
│   └── Navbar.tsx   # Barra de navegação e status LAN
├── context/         # React Context API para estado global de rede
│   └── CryptoContext.tsx
├── data/            # Dicionários de presets e palavras de crib
│   └── cryptoPresets.ts
├── hooks/           # Hooks customizados para WebSockets
│   └── useLanSocket.ts
├── layouts/         # Layout principal da aplicação
│   └── MainLayout.tsx
├── pages/           # Páginas principais da interface
│   ├── LaboratorioPage.tsx
│   ├── ChatPage.tsx
│   ├── SnifferPage.tsx
│   └── DocsPage.tsx
├── types/           # Interfaces TypeScript e definições de tipos
│   └── crypto.ts
├── utils/           # Motor matemático puro e utilitários
│   ├── cryptoEngine.ts
│   └── lanUtils.ts
├── App.tsx          # Roteamento e orquestração de páginas
├── index.css        # Sistema de design (Dark Cyber, Glassmorphism)
└── main.tsx         # Ponto de entrada React
```

## Como Rodar

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Executar Testes Unitários de Criptografia:**
   ```bash
   npm test
   ```

3. **Iniciar Servidor LAN (Backend + WebSockets):**
   ```bash
   npm run server
   ```

4. **Iniciar Frontend (Vite Dev Server):**
   ```bash
   npm run dev
   ```

## Acesso em Rede Local (LAN)
Abra no navegador de qualquer dispositivo conectado à mesma rede Wi-Fi:
`http://<SEU_IP_LAN>:5173` ou `http://<SEU_IP_LAN>:3000`
