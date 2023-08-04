import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = (data:any , isConnectable = false) => {
    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <div>
          Custom Color Picker Node: <strong></strong>
        </div>
        <img src="https://www.thoughtco.com/thmb/HvrGMQjIgp1U-A9vLEjFzMJmKcI=/768x0/filters:no_upscale():max_bytes(150000):strip_icc()/antacid-tablet-dissolving-in-glass-of-water-84284196-58a30d095f9b58819ca7dd02.jpg"></img>
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          style={{ top: 10, background: '#555' }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="b"
          style={{ bottom: 10, top: 'auto', background: '#555' }}
          isConnectable={isConnectable}
        />
      </>
    );
  }

export const CustomNode_memo = memo(CustomNode);
