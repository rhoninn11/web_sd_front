
import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { CustomNode_memo } from './custom-node';


const nodeTypes = {
  custom: CustomNode_memo
}

const initialNodes = [{ 
  id: '1', 
  position: { x: 0, y: 0 }, 
  data: { label: '1' },
  type: 'input',
},{ 
  id: '2', 
  position: { x: 0, y: 100 }, 
  data: { label: '2' },
  type: 'input',
},{
  id: '3', 
  position: { x: 0, y: 200 }, 
  data: { label: '3' },
  type: 'custom',
}
];


const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  console.log('Flow');
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
}

