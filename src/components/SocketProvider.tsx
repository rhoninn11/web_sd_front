import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserModule } from '../logic/UserModule';

export interface ServerContextType {
	isAuthenticated: boolean;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerContextProvider: React.FC = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const client = UserModule.getInstance();
		client.setAuthenticatedSetter(setIsAuthenticated);
	}, []);

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
