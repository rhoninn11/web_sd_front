import React, { useCallback, useRef } from 'react';
import ReactFlow, {
	useNodesState,
	useEdgesState,
	addEdge,
	useReactFlow,
	ReactFlowProvider,
	MiniMap,
	Controls,
	Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import styles from './s.module.scss';
import { CustomNode } from './other/custom-node';
import { PromptNode } from './other/prompt_node/prompt_node';
import { txt2img_config } from '../../types/types_serv_comm';

const nodeTypes = {
	custom: CustomNode,
	prompt: PromptNode,
  }

const initialNodes = [
	{
		id: '0',
		type: 'prompt',
		data: { label: 'Node', prompt_data: {
			pipe_prompt_data: (t2i_cfg: txt2img_config) => console.log('pipe_prompt_data'),
			pipe_img_data: (img_coded: string) => console.log('pipe_img_data'),
		}},
		position: { x: 0, y: 50 },
	},
];

let id = 1;
const getId = () => `${id++}`;

const fitViewOptions = {
	padding: 3,
};

interface IdTracker {
	id: string;
}

const AddNodeOnEdgeDrop = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const connectingNodeId = useRef<IdTracker>({ id: '' });
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const { project } = useReactFlow();
	const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);


	const Elo = (id: string) => {
		let this_node = nodes.find((node) =>  node.id === id)
		if (this_node){
			let elo = this_node.data.prompt_data
		
	}

	const onConnectStart = useCallback((eventInfo, nodeInfo) => {
		let nodeId = nodeInfo?.nodeId
		connectingNodeId.current.id = nodeId;
	}, []);

	const onConnectEnd = useCallback(
		(event) => {
			const targetIsPane = event.target.classList.contains('react-flow__pane');

			if (targetIsPane) {
				// we need to remove the wrapper bounds, in order to get the correct position
				if (reactFlowWrapper && reactFlowWrapper.current) {
					console.log(`reactFlowWrapper.current.getBoundingClientRect()`, reactFlowWrapper.current.getBoundingClientRect())
					const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
					const id = getId();
					const newNode = {
						id,
						type: 'custom',
						// we are removing the half of the node width (75) to center the new node
						position: project({ x: event.clientX - left - 75, y: event.clientY - top }),
						// return random value from 0 to 100
						data: { 
							label: `Node ${id}`,
							roll: Math.floor(Math.random() * 100),
						},
					};
					const new_edge = { id, 
						source: connectingNodeId.current.id,
						target: id 
					};


					setNodes((nds) => nds.concat(newNode));

					setEdges((eds) => eds.concat(new_edge));
				}
			}
		},
		[project]
	);

	return (
		<div className={styles.wrapper} ref={reactFlowWrapper}>
			<MiniMap />
			<Controls />
			<Background />
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onConnectStart={onConnectStart}
				onConnectEnd={onConnectEnd}
				fitView
				fitViewOptions={fitViewOptions}
				nodeTypes={nodeTypes}
			/>
			
	</div>
	);
};

export const Flow = () => {
	return (
		<ReactFlowProvider>
			<AddNodeOnEdgeDrop />
		</ReactFlowProvider>
)};
