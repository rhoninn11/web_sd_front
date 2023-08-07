import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from './s.module.scss';

const _CustomNode = (data:any , isConnectable = false) => {
    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <div className={styles.nice_box}>
          Custom Color Picker Node: <strong></strong>
          <img 
            className={styles.smaller_img}
            src="https://www.thoughtco.com/thmb/HvrGMQjIgp1U-A9vLEjFzMJmKcI=/768x0/filters:no_upscale():max_bytes(150000):strip_icc()/antacid-tablet-dissolving-in-glass-of-water-84284196-58a30d095f9b58819ca7dd02.jpg"/>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      </>
    );
  }

export const CustomNode = memo(_CustomNode);
