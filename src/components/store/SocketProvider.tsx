import React, { createContext, useContext, useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

export interface ServerContextType {
  client: W3CWebSocket | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (suth: boolean) => void;
}

interface authData {
  password: string;
  auth: boolean;
}

interface serverRequest {
  type: string;
  data: authData;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerContextProvider: React.FC = ({ children }) => {
  const [client, setClient] = useState<W3CWebSocket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const askForAuth = (client: W3CWebSocket) => {
    let test_obj: serverRequest = {
      type: 'auth',
      data: { 
        password: 'pulsary55.', 
        auth: false
      },
    }
    let json_string = JSON.stringify(test_obj);

    client.send(json_string );
  }

  const handleServerRequest = (req: serverRequest) => {
    // console.log(respo);
    if (req.type === 'auth') {
      setIsAuthenticated(req.data.auth);
    }
  } 

  const handleServerMessage = (message: string ) => {
    let respo: serverRequest = JSON.parse(message.toString());
    handleServerRequest(respo);
  }

  useEffect(() => {
    const client = new W3CWebSocket('ws://localhost:8765');
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      askForAuth(client);
    }
    client.onmessage = (message) => {
      handleServerMessage(message.data.toString());
    }
    setClient(client);
  }, []);

  return (
    <ServerContext.Provider value={{ client, isAuthenticated, setIsAuthenticated }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServerContext = () => {
    const context = useContext(ServerContext);
    if (!context) {
      throw new Error('useSocket must be used within a SocketProvider');
    }
  
    return context;
}
