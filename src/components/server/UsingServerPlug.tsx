import React from 'react';
import ReactDOM from 'react-dom';
import {useServerContext} from './SocketProvider';

export const UsingServerPlug = () => {
  const {client, isAuthenticated, setIsAuthenticated} = useServerContext();

  return (
      <div> {isAuthenticated ? "authenticated" : "not authenticcated"}</div>
  );
};
