import React from 'react';
import ReactDOM from 'react-dom';
import { ServerContextProvider} from './SocketProvider';
import { UsingServerPlug } from './UsingServerPlug';

export const ServerPlug = () => {

  return (
    <ServerContextProvider>
      <UsingServerPlug />
    </ServerContextProvider>
  );
};
