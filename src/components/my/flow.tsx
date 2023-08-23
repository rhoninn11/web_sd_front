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
} from 'reactflow';
import 'reactflow/dist/style.css';

import styles from './s.module.scss';
import { CustomNode } from './other/custom-node';
import { PromptNode } from './other/prompt_node/prompt_node';
import { GenData } from '../../types/types_serv_comm';
import { cloneDeep } from 'lodash';

import { addDBNode, addDBEdge, getAllDBEdges, getAllDBNodes, getDBNode, editDBNode } from '../../logic/db';
import { edge_db2flow, edge_flow2db, node_db2flow, node_flow2db } from '../../logic/convert_utils';
import { DBNode } from '../../types/types_db';
import { ClientServerBridge } from '../../logic/ClientServerBridge';
import { FlowEdge, FlowNode } from '../../types/types_flow';

const nodeTypes = {
	custom: CustomNode,
	prompt: PromptNode,
}

const fitViewOptions = {
	padding: 3,
};

interface NodeTracker {
	id: string;
	gen_data: GenData;
}

const AddNodeOnEdgeDrop = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const nodeConnectSource = useRef<NodeTracker>({ id: '', gen_data: new GenData() });
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
			return this_node.data.higher_level_data;
		}
		console.log(`+++ get_node_hl_data ${id} not found`)
		return undefined;
	}

	const onConnectStart = useCallback((eventInfo, nodeInfo) => {
		let nodeId = nodeInfo?.nodeId;
		nodeConnectSource.current.id = nodeId;

		let hl_data = get_node_hl_data(nodeId);
		if (hl_data)
			nodeConnectSource.current.gen_data = cloneDeep(hl_data);
		console.log(`+++ selected ${nodeId} hl_data`, hl_data)
	}, [nodes]);

	const onNodeDrag = useCallback((_0, node, _1) => {
		let flow_node: FlowNode = node;
		let db_node = node_flow2db(flow_node)
		console.log('+++ flow_node', flow_node)
		console.log('+++ db_node', db_node)
		editDBNode(db_node.db_id, db_node)
	}, [])

	const create_new_node = async (event: any, div: HTMLDivElement, sourceNodeData: NodeTracker) => {
		const { top, left } = div.getBoundingClientRect();

		// create new node
		// create new edge
		// add to db
		// send to server

		let hl_data = cloneDeep(sourceNodeData.gen_data);
		console.log('hl_data', hl_data)

		let node_db_id = nodeNum;
		let flow_node: FlowNode = {
			id: node_db_id.toString(),
			type: 'prompt',
			position: project({ x: event.clientX - left - 75, y: event.clientY - top }),
			data: {
				label: 'Node',
				db_id: node_db_id,
				higher_level_data: hl_data
			},
		};
		let db_node = node_flow2db(flow_node)

		const flow_db_id = edgeNum;
		let flow_edge: FlowEdge = {
			id: flow_db_id.toString(),
			source: nodeConnectSource.current.id,
			target: node_db_id.toString()
		};
		const db_edge = edge_flow2db(edges.length, flow_edge)

		setNodes((nds) => nds.concat(flow_node));
		setEdges((eds) => eds.concat(flow_edge));
		setEdgeNum(edgeNum + 1);
		setNodeNum(nodeNum + 1);
		await addDBNode(db_node);
		await addDBEdge(db_edge);

		let bridge = ClientServerBridge.getInstance();
		bridge.send_node(flow_node);
		bridge.send_edge(flow_edge);
		// i jeszcze do serwera
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
			console.log('+++ num', flow_nodes.length, flow_edges.length)
		};

		fetchData();
	}, []);


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
	)
};
