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


import { addDBNode, addDBEdge, getAllDBEdges, getAllDBNodes, getDBNode, editDBNode } from '../logic/db';
import { edge_db2flow, edge_flow2db, node_db2flow, node_flow2db } from '../logic/convert_utils';
import { ClientServerBridge } from '../logic/ClientServerBridge';

// types
import { moveCB } from '../tests/canvas_move_test';

import { MoveObserver } from '../tests/canvas_move_test';
import { PromptRealatedData, syncOps, syncSignature } from '../types/02_serv_t';
import { DBNode, FlowNode, ServerNode } from '../types/01_node_t';
import { DBEdge, EdgeStyle, FlowEdge, ServerEdge } from '../types/04_edge_t';
import { add, set } from 'lodash';
import { useServerContext } from './SocketProvider';
import { send_client_data_to_serveer } from '../tests/sync_server_w_client_data';

const nodeTypes = {
	prompt: PromptNode,
}

const edgeTypes = {
	prompt: PromptEdge,
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
	const [allowCreate, setAllowCreate] = useState(false);
	const { isAuthenticated } = useServerContext();


	const { setCenter, getZoom } = useReactFlow();

	const setCenter_test: moveCB = (x, y, duration) => {
		const _x = x;
		const _y = y;
		const zoom = getZoom();

		//   console.log('+++ setCenter_test' , _x, "  ", _y, "  ", duration)

		// setCenter(0, 1000, { zoom, duration });
	};

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

	let add_node = async (db_node: DBNode, cb: () => void | undefined) => {
		console.log('+++ new node created: ', db_node.serv_id)
		let _flow_node = node_db2flow(db_node);
		setNodes((nds) => nds.concat(_flow_node));
		setNodeNum(nodeNum + 1);
		await addDBNode(db_node);
		if (cb) cb();
	}

	let add_edge = async (db_edge: DBEdge, cb: () => void | undefined) => {
		console.log('+++ new edge created: ', db_edge.serv_id)
		let _flow_edge = edge_db2flow(db_edge);
		setEdges((eds) => eds.concat(_flow_edge));
		setEdgeNum(edgeNum + 1);
		await addDBEdge(db_edge);
		if (cb) cb();
	}


	let ask_serv_to_create_node = (flow_node: FlowNode) => {
		return new Promise<void>((resolve, reject) => {
			let db_node = node_flow2db(flow_node)
			ClientServerBridge.getInstance()
				.send_node(db_node, (serv_node) => add_node(serv_node.db_node, () => resolve()));
		});

	}

	let ask_serv_to_create_edge = (flow_edge: FlowEdge) => {
		return new Promise<void>((resolve, reject) => {
			let db_edge = edge_flow2db(flow_edge)
			ClientServerBridge.getInstance()
				.send_edge(db_edge, (serv_edge) => add_edge(serv_edge.db_edge, () => resolve()));
		});

	}

	const create_new_node = async (event: any, div: HTMLDivElement, sourceNodeData: NodeTracker) => {

		setAllowCreate(false);
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
			type: 'prompt',
			id: flow_db_id.toString(),
			db_id: flow_db_id,
			serv_id: '',
			source: nodeConnectSource.current.id,
			target: node_db_id.toString(),
			style: new EdgeStyle(),
		};

		ask_serv_to_create_node(flow_node)
			.then(() => ask_serv_to_create_edge(flow_edge))
			.then(() => setAllowCreate(true))
	}

	const place_node = (event: any) => {
		const targetIsPane = event.target.classList.contains('react-flow__pane');

		if (targetIsPane && allowCreate)
			if (reactFlowWrapper && reactFlowWrapper.current)
				create_new_node(event, reactFlowWrapper.current, nodeConnectSource.current);
	}

	const onConnectEnd = useCallback(place_node, [project, nodeNum, edgeNum, allowCreate]);


	const sync_client_nodes_with_server = (node_id_arr: string[]) => {
		let initial = new Promise<void>((resolve, reject) => resolve());

		node_id_arr.forEach((node_id) => {
			initial = initial.then(() => {
				console.log('+++ 02 invest', node_id)
				return new Promise<void>((resolve, reject) => {
					let sync_data_in = new syncSignature()
					sync_data_in.sync_op = syncOps.TRANSFER;
					sync_data_in.set_ids([node_id], []);

					ClientServerBridge.getInstance()
						.sync_with_server(sync_data_in, (sync_data_out) => {
							console.log('+++ 03 invest', sync_data_out)
							if (sync_data_out.sync_op == syncOps.TRANSFER){
								if (sync_data_out.node_data_arr.length > 0){
									add_node(sync_data_out.node_data_arr[0], () => resolve())
								}
							}
						});
				});
			});
		});

		return initial;
	}

	const sync_client_edges_with_server = (edge_id_arr: string[]) => {
		let initial = new Promise<void>((resolve, reject) => resolve());

		edge_id_arr.forEach((edge_id) => {
			initial = initial.then(() => {
				return new Promise<void>((resolve, reject) => {
					let sync_data_in = new syncSignature()
					sync_data_in.sync_op = syncOps.TRANSFER;
					sync_data_in.set_ids([], [edge_id]);

					ClientServerBridge.getInstance()
						.sync_with_server(sync_data_in, (sync_data_out) => {
							if (sync_data_out.sync_op == syncOps.TRANSFER)
								if (sync_data_out.edge_data_arr.length > 0){
									add_edge(sync_data_out.edge_data_arr[0], () => resolve());
								}
						});
				});
			});
		});

		return initial;
	}

	const sync_client_with_server = (s_sygn: syncSignature) => {
		let { node_id_arr, edge_id_arr } = s_sygn;
		sync_client_nodes_with_server(node_id_arr)
			.then(() => sync_client_edges_with_server(edge_id_arr))
			.then(() => setAllowCreate(true))
	}



	const initialServerSync = (local_data: { nodes: DBNode[], edges: DBEdge[] }) => {

		if (ClientServerBridge.getInstance().isAuthenticated()) {
			// send_client_data_to_serveer(local_data.nodes, local_data.edges)
			_initialServerSync(local_data);
		} else {
			console.log('+++ initialServerSync: waiting for server to authenticate')
			setTimeout(() => initialServerSync(local_data), 1000);
		}
	}

	const _initialServerSync = (local_data: { nodes: DBNode[], edges: DBEdge[] }) => {
		let sync_data_in = new syncSignature()
		sync_data_in.sync_op = syncOps.INFO;
		let { nodes, edges } = local_data;
		sync_data_in.fill_ids(nodes, edges);


		console.log("+++  00 invest", sync_data_in)
		ClientServerBridge.getInstance()
			.sync_with_server(sync_data_in, (sync_data_out) => {
				console.log("+++  01 invest", sync_data_out)
				if (sync_data_out.sync_op == syncOps.INFO)
					sync_client_with_server(sync_data_out);
			});

	}


	const move_obs = MoveObserver.getInstance();
	useEffect(() => {
		const fetchData = async () => {
			let db_nodes = await getAllDBNodes()
			let db_edges = await getAllDBEdges()

			// sync_server(db_nodes, db_edges)

			let flow_nodes = db_nodes.map(node_db2flow)
			let flow_edges = db_edges.map(edge_db2flow)

			setNodes(flow_nodes);
			setEdges(flow_edges);
			setNodeNum(flow_nodes.length);
			setEdgeNum(flow_edges.length);

			return {
				nodes: db_nodes,
				edges: db_edges,
			}
		};

		move_obs.setCb(setCenter_test);
		fetchData()
			.then(initialServerSync);
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
				// edgeTypes={edgeTypes}
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
