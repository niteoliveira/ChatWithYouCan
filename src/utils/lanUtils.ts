// LAN and WebSocket helper utilities

export interface LanInfo {
  localIp: string;
  port: number;
  clientCount: number;
  totalPackets: number;
}

export async function fetchLanInfo(): Promise<LanInfo> {
  try {
    const res = await fetch('/api/info');
    if (!res.ok) throw new Error('Falha ao obter dados da LAN');
    return await res.json();
  } catch {
    return {
      localIp: window.location.hostname || 'localhost',
      port: 3000,
      clientCount: 1,
      totalPackets: 0
    };
  }
}

export function createWebSocketConnection(
  onMessage: (data: any) => void,
  onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void
): { send: (data: any) => void; close: () => void } {
  let ws: WebSocket | null = null;
  let reconnectTimer: any = null;
  let isClosedManually = false;

  function connect() {
    if (isClosedManually) return;
    onStatusChange('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname || 'localhost';
    const wsUrl = window.location.port === '3000'
      ? `${protocol}//${window.location.host}`
      : `${protocol}//${hostname}:3000`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        onStatusChange('connected');
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage(parsed);
        } catch (err) {
          console.error('Erro ao interpretar pacote WS:', err);
        }
      };

      ws.onclose = () => {
        onStatusChange('disconnected');
        if (!isClosedManually) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        onStatusChange('disconnected');
      };
    } catch {
      onStatusChange('disconnected');
      if (!isClosedManually) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }
  }

  connect();

  return {
    send: (data: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      } else {
        console.warn('WebSocket não está aberto para envio:', data);
      }
    },
    close: () => {
      isClosedManually = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    }
  };
}
