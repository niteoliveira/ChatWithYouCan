import React, { createContext, useContext, ReactNode } from 'react';
import { useLanSocket } from '../hooks/useLanSocket';
import { ChatPacket, CipherType, LanInfo } from '../types/crypto';

interface CryptoContextType {
  packets: ChatPacket[];
  clientId: string;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  lanInfo: LanInfo;
  sendPacket: (packetData: {
    cipherType: CipherType;
    ciphertext: string;
    senderName: string;
    metadata?: any;
  }) => void;
  reconnect: () => void;
}

const CryptoContext = createContext<CryptoContextType | null>(null);

export const CryptoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const lanSocket = useLanSocket();

  return (
    <CryptoContext.Provider value={lanSocket}>
      {children}
    </CryptoContext.Provider>
  );
};

export function useCrypto() {
  const ctx = useContext(CryptoContext);
  if (!ctx) {
    throw new Error('useCrypto deve ser utilizado dentro de um CryptoProvider');
  }
  return ctx;
}
