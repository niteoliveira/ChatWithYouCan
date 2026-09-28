import React from 'react';
import { ChatRoom } from '../components/chat/ChatRoom';
import { useCrypto } from '../context/CryptoContext';

export const ChatPage: React.FC = () => {
  const { packets, clientId, sendPacket } = useCrypto();

  return (
    <ChatRoom
      packets={packets}
      clientId={clientId}
      onSendPacket={sendPacket}
    />
  );
};
