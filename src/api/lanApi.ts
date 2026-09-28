// Client-side API requests to backend
import { LanInfo } from '../types/crypto';

export async function fetchLanInfo(): Promise<LanInfo> {
  try {
    const host = window.location.hostname || 'localhost';
    const baseUrl = window.location.port === '3000' ? '' : `http://${host}:3000`;
    const res = await fetch(`${baseUrl}/api/info`);
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
