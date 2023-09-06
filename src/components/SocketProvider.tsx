import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClientServerBridge } from '../logic/ClientServerBridge';

export interface ServerContextType {
	isAuthenticated: boolean;
}

const serverPort = 8700;
const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerContextProvider: React.FC = ({ children }) => {
	const [bridge, setBridge] = useState<ClientServerBridge | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const client = ClientServerBridge.getInstance();
		client.setAuthenticatedSetter(setIsAuthenticated);
		setBridge(client);
	}, []);

	console.log('+++ render server context', isAuthenticated);

	return (
		<ServerContext.Provider value={{isAuthenticated}}>
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
