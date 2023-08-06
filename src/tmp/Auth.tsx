import React, { useState } from 'react';
import { useSocket } from './SocketProvider';

const Auth: React.FC = () => {
  const [password, setPassword] = useState('');
  const { client, setIsAuthenticated } = useSocket();

  const handleLogin = () => {
    client?.send(JSON.stringify({ password }));
    // setIsAuthenticated(true);
  };

  return (
    <div>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Auth;
