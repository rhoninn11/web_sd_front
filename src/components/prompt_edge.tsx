import React, { memo } from 'react';
import { ConnectionLineComponent } from 'reactflow';

const _PromptEdge: ConnectionLineComponent = ({
    fromX,
    fromY,
    fromPosition,
    toX,
    toY,
    toPosition,
    connectionLineType,
    connectionLineStyle,
}) => {


    return (
        <g>
            <path
                fill="none"
                stroke="#fff"
                strokeWidth={1.5}
                className="animated"
                d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
            />
            <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
        </g>
    );
};

export const PromptEdge = memo(_PromptEdge);
