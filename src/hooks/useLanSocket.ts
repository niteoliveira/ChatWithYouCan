import { useState, useEffect, useCallback } from 'react';
import { ChatPacket, CipherType, LanInfo } from '../types/crypto';
import { fetchLanInfo } from '../api/lanApi';
import { createWebSocketConnection } from '../utils/lanUtils';

export function useLanSocket() {
  const [packets, setPackets] = useState<ChatPacket[]>([]);
  const [clientId, setClientId] = useState<string>('peer_init');
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [lanInfo, setLanInfo] = useState<LanInfo>({
    localIp: 'detectando...',
    port: 3000,
    clientCount: 1,
    totalPackets: 0
  });

  const [wsSender, setWsSender] = useState<((data: any) => void) | null>(null);

  const initConnection = useCallback(() => {
    fetchLanInfo().then(setLanInfo);

    const conn = createWebSocketConnection(
      (data) => {
        if (data.type === 'SYSTEM_WELCOME') {
          setClientId(data.clientId);
          if (data.history && data.history.length > 0) {
            setPackets(data.history);
          }
          setLanInfo((prev) => ({
            ...prev,
            localIp: data.serverIp || prev.localIp,
            clientCount: data.activeUsers || prev.clientCount
          }));
        } else if (data.type === 'NEW_PACKET') {
          setPackets((prev) => [...prev, data.packet]);
        } else if (data.type === 'PEER_JOINED' || data.type === 'PEER_LEFT') {
          setLanInfo((prev) => ({
            ...prev,
            clientCount: data.activeUsers
          }));
        }
      },
      (status) => {
        setWsStatus(status);
        if (status === 'connected') {
          fetchLanInfo().then(setLanInfo);
        }
      }
    );

    setWsSender(() => conn.send);

    return () => {
      conn.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = initConnection();
    return cleanup;
  }, [initConnection]);

  const sendPacket = useCallback(
    (packetData: {
      cipherType: CipherType;
      ciphertext: string;
      senderName: string;
      metadata?: any;
    }) => {
      if (wsSender && wsStatus === 'connected') {
        wsSender({
          type: 'CHAT_PACKET',
          ...packetData
        });
      } else {
        const localPkt: ChatPacket = {
          id: 'local_' + Date.now(),
          senderId: clientId,
          senderName: packetData.senderName,
          cipherType: packetData.cipherType,
          ciphertext: packetData.ciphertext,
          metadata: packetData.metadata,
          timestamp: Date.now()
        };
        setPackets((prev) => [...prev, localPkt]);
      }
    },
    [wsSender, wsStatus, clientId]
  );

  return {
    packets,
    clientId,
    wsStatus,
    lanInfo,
    sendPacket,
    reconnect: initConnection
  };
}
