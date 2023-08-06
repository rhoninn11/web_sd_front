import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { SocketProvider } from './SocketProvider';

export const TestingComponent = () => {
  return (
    <SocketProvider>
      <App />
    </SocketProvider>
  );
};
