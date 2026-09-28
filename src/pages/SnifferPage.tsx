import React from 'react';
import { EveSniffer } from '../components/chat/EveSniffer';
import { useCrypto } from '../context/CryptoContext';

export const SnifferPage: React.FC = () => {
  const { packets } = useCrypto();

  return <EveSniffer packets={packets} />;
};
