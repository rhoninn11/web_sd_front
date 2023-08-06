import React from 'react';
import Auth from './Auth';
import Menu from './Menu';
import { useSocket } from './SocketProvider';

const App: React.FC = () => {
  const {isAuthenticated} = useSocket();

  return (
    <div className="App">
      {isAuthenticated ? <Menu /> : <Auth />}
    </div>
  );
};

export default App;
