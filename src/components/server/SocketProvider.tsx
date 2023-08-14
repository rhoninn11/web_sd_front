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
	data: string;
}

const serverPort = 8700;
const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerContextProvider: React.FC = ({ children }) => {
	const [client, setClient] = useState<W3CWebSocket | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const askForAuth = (client: W3CWebSocket) => {

		let authData = {
			password: 'pulsary55.',
			auth: false
		}

		let test_obj: serverRequest = {
			type: 'auth',
			data: JSON.stringify(authData)
		}

		let json_string = JSON.stringify(test_obj);

		client.send(json_string);
	}

	const handleAuth = (data: string) => {
		let authData: authData = JSON.parse(data);
		setIsAuthenticated(authData.auth);
	}

	const handleServerRequest = (req: serverRequest) => {
		// console.log(respo);
		if (req.type === 'auth') {
			handleAuth(req.data)
		}
	}

	const handleServerMessage = (message: string) => {
		let respo: serverRequest = JSON.parse(message.toString());
		handleServerRequest(respo);
	}

	useEffect(() => {
		const client = new W3CWebSocket(`ws://localhost:${serverPort}`);
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
