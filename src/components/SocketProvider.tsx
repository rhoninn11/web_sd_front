import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserModule } from '../logic/UserModule';

export interface ServerContextType {
	isAuthenticated: boolean;
	userId: number;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerContextProvider: React.FC = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userId, setUserId] = useState<number>(-1)

	useEffect(() => {
		const client = UserModule.getInstance();
		client.setAuthenticatedSetter(setIsAuthenticated);
		client.setUserId(setUserId);
	}, []);

	return (
		<ServerContext.Provider value={{isAuthenticated, userId}}>
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
