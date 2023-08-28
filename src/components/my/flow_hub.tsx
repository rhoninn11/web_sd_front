import styles from './flow_hub.module.scss';

import React, { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';
import ReactFlow, {
	useNodesState,
	useEdgesState,
	addEdge,
	useReactFlow,
	ReactFlowProvider,
	MiniMap,
	Controls,
	Background,
	OnMove,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PromptNode } from './prompt_node';
import { PromptEdge } from './prompt_edge';


import { addDBNode, addDBEdge, getAllDBEdges, getAllDBNodes, getDBNode, editDBNode } from '../../logic/db';
import { edge_db2flow, edge_flow2db, node_db2flow, node_flow2db } from '../../logic/convert_utils';
import { ClientServerBridge } from '../../logic/ClientServerBridge';

// types
import { PromptRealatedData, ServerEdge, ServerNode } from '../../types/types_serv_comm';
import { EdgeStyle, FlowEdge, FlowNode } from '../../types/types_flow';
import { onMove, onMoveEnd, onMoveStart } from '../../tests/canvas_move_test';

import { MoveObserver } from '../../tests/canvas_move_test';

const nodeTypes = {
	prompt: PromptNode,
}

const fitViewOptions = {
	padding: 3,
};

interface NodeTracker {
	id: string;
	data_prompt: PromptRealatedData;
}

const AddNodeOnEdgeDrop = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const nodeConnectSource = useRef<NodeTracker>({ id: '', data_prompt: new PromptRealatedData() });
	// const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [nodeNum, setNodeNum] = useState(0);
	const [edgeNum, setEdgeNum] = useState(0);
	const { project } = useReactFlow();
	const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);


	const get_node_hl_data = (id: string) => {
		let this_node = nodes.find((node) => node.id === id)
		if (this_node) {
			let legit_node = this_node as FlowNode
			return legit_node.data.data_prompt;
		}
		return new PromptRealatedData();
	}

	const onConnectStart = useCallback((eventInfo, nodeInfo) => {
		let nodeId = nodeInfo?.nodeId;
		nodeConnectSource.current.id = nodeId;
		nodeConnectSource.current.data_prompt = get_node_hl_data(nodeId);

	}, [nodes]);

	const onNodeDrag = useCallback((_0, node, _1) => {
		let flow_node: FlowNode = node;
		let db_node = node_flow2db(flow_node)
		console.log('+++ flow_node', flow_node)
		console.log('+++ db_node', db_node)
		editDBNode(db_node.db_id, db_node)
	}, [])

	let ask_serv_to_create_node = (flow_node: FlowNode) => {
		return new Promise<void>((resolve, reject) => {
			let on_serv_accept = async (serv_node: ServerNode) => {
				flow_node.data.serv_id = serv_node.serv_id;

				setNodes((nds) => nds.concat(flow_node));
				setNodeNum(nodeNum + 1);
				let db_node = node_flow2db(flow_node)
				await addDBNode(db_node);
				console.log('+++ 00 node from server created')
				resolve();
			}

			ClientServerBridge.getInstance()
				.send_node(flow_node, on_serv_accept);
		});

	}

	let ask_serv_to_create_edge = (flow_edge: FlowEdge) => {

		console.log('+++ 01 ask_serv_to_create_edge')
		return new Promise<void>((resolve, reject) => {
			let on_serv_accept = async (serv_edge: ServerEdge) => {
				flow_edge.serv_id = serv_edge.serv_id;

				let db_edge = edge_flow2db(edges.length, flow_edge)
				setEdges((eds) => eds.concat(flow_edge));
				setEdgeNum(edgeNum + 1);
				await addDBEdge(db_edge);
				console.log('+++ 02 edge from server created')
				resolve();
			}

			ClientServerBridge.getInstance()
				.send_edge(flow_edge, on_serv_accept);
		});

	}

	const create_new_node = async (event: any, div: HTMLDivElement, sourceNodeData: NodeTracker) => {

		let prompt_data = new PromptRealatedData()
			.clone(sourceNodeData.data_prompt, false)

		const { top, left } = div.getBoundingClientRect();
		const xy_pos = { x: event.clientX - left - 75, y: event.clientY - top }
		let node_db_id = nodeNum;
		let flow_node: FlowNode = {
			type: 'prompt',
			id: node_db_id.toString(),
			position: project(xy_pos),
			data: {
				db_id: node_db_id,
				serv_id: '',
				data_prompt: prompt_data,
				data_render: { fresh: true },
			},
		};

		const flow_db_id = edgeNum;
		let flow_edge: FlowEdge = {
			id: flow_db_id.toString(),
			db_id: flow_db_id,
			serv_id: '',
			source: nodeConnectSource.current.id,
			target: node_db_id.toString(),
			style: new EdgeStyle(),
		};

		ask_serv_to_create_node(flow_node)
		.then(() => ask_serv_to_create_edge(flow_edge))
	}

	const place_node = (event: any) => {
		const targetIsPane = event.target.classList.contains('react-flow__pane');

		if (targetIsPane)
			if (reactFlowWrapper && reactFlowWrapper.current)
				create_new_node(event, reactFlowWrapper.current, nodeConnectSource.current);
	}

	const onConnectEnd = useCallback(place_node, [project, nodeNum, edgeNum]);



	useEffect(() => {
		const fetchData = async () => {
			let db_nodes = await getAllDBNodes()
			let db_edges = await getAllDBEdges()

			let flow_nodes = db_nodes.map(node_db2flow)
			let flow_edges = db_edges.map(edge_db2flow)

			setNodes(flow_nodes);
			setEdges(flow_edges);
			setNodeNum(flow_nodes.length);
			setEdgeNum(flow_edges.length);
		};

		fetchData();
	}, []);

	let move_obs = MoveObserver.getInstance();

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
				// onNodeDrag={onNodeDrag}
				onNodeDragStop={onNodeDrag}
				connectionLineComponent={PromptEdge}
				fitView
				fitViewOptions={fitViewOptions}
				nodeTypes={nodeTypes}
				onMoveStart={move_obs.onMoveStart}
				onMove={move_obs.onMove}
				onMoveEnd={move_obs.onMoveEnd}
			/>

		</div>
	);
};


export const Flow = () => {
	return (
		<ReactFlowProvider>
			<AddNodeOnEdgeDrop />
		</ReactFlowProvider>
	)
};
