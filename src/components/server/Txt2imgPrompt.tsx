

import React from 'react';
import ReactDOM from 'react-dom';
import { useServerContext } from './SocketProvider';
import { serverRequest, authData, txt2img } from '../../types/types_serv_comm';
import { Button } from '@blueprintjs/core';

export const Txt2imgPrompt = () => {
    const { txt2imgHandle, txt2imgResultHandle, setTxt2imgResultHandle } = useServerContext();
    const [disable, setDisable] = React.useState(true);

    let click = () => {
        console.log('click');
        setDisable(true);
    }

    return (
        <div>
            <Button onClick={click}  icon="refresh"/>
        </div>
    );
};
