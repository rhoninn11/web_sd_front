import React, { createContext, useContext, useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

interface SocketContextType {
  client: W3CWebSocket | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (suth: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC = ({ children }) => {
  const [client, setClient] = useState<W3CWebSocket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const client = new W3CWebSocket('ws://localhost:8765');
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    }
    client.onmessage = (message) => {
      console.log(message);
    }
    setClient(client);
  }, []);

  return (
    <SocketContext.Provider value={{ client, isAuthenticated, setIsAuthenticated }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
      throw new Error('useSocket must be used within a SocketProvider');
    }
  
    return context;
}
