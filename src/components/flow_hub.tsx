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
	Viewport,
	Panel,


} from 'reactflow';
import 'reactflow/dist/style.css';

import { PromptNode } from './prompt_node';
import { PromptEdge } from './prompt_edge';


import { addDBNode, addDBEdge, getAllDBEdges, getAllDBNodes, getDBNode, editDBNode, getAllDBImgIds, addDBImg } from '../logic/db';
import { edge_db2flow, node_db2flow } from '../logic/convert_utils';
import { ClientServerBridge } from '../logic/ClientServerBridge';

// types
import { moveCB } from '../tests/canvas_move_test';

import { MoveObserver } from '../tests/canvas_move_test';
import { syncOps, syncSignature } from '../types/02_serv_t';
import { DBNode, FlowNode, PromptReference, ServerNode } from '../types/01_node_t';
import { DBEdge, EdgeStyle, FlowEdge, ServerEdge } from '../types/04_edge_t';
import { send_client_data_to_serveer } from '../tests/sync_server_w_client_data';
import _, { flow, set } from 'lodash';
import { UpdateNodeSync } from '../logic/UpdateNodeSync';
import { sync_client_nodes_with_server, sync_client_edges_with_server, sync_client_img_with_server } from '../logic/ServerSyncREalated';
import { edgeCreateWCb, imgCreateCb, nodeCreateWCb } from '../types/types_db';
import { DBImg } from '../types/03_sd_t';
import { UserModule } from '../logic/UserModule';
import { InfoPanel } from './info_panel';

const nodeTypes = {
	prompt: PromptNode,
}

const edgeTypes = {
	prompt: PromptEdge,
}

interface AllData {
	nodes: DBNode[],
	edges: DBEdge[],
	imgs: DBImg[]
}

const fitViewOptions = {
	padding: 3,
};

interface NodeTracker {
	node_id: string;
	prompt_ref: PromptReference;
}

const AddNodeOnEdgeDrop = () => {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const nodeConnectSource = useRef<NodeTracker>({ node_id: '', prompt_ref: new PromptReference() });
	// const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const { project } = useReactFlow();
	const [allowCreate, setAllowCreate] = useState(false);

	const [validUser, setValidUser] = useState(false);
	const [userId, setUserId] = useState(-1);

	


	const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

	const get_node_hl_data = (id: string) => {
		let this_node = nodes.find((node) => node.id === id)
		if (this_node) {
			let legit_node = this_node as FlowNode
			return legit_node.data.node_data.result_data;
		}
		return new PromptReference()
	}

	const onConnectStart = useCallback((eventInfo, nodeInfo) => {
		let nodeId = nodeInfo?.nodeId;
		nodeConnectSource.current.node_id = nodeId;
		nodeConnectSource.current.prompt_ref = get_node_hl_data(nodeId);

	}, [nodes]);

	const onNodeDragFinished = useCallback((_0, node, _1) => {
		let flow_node: FlowNode = node;
		let id: number = parseInt(flow_node.id);
		let position = flow_node.position;
		if (validUser) {
			UpdateNodeSync.getInstance().update_position(id, position);
		}

	}, [validUser])

	let add_node: nodeCreateWCb = async (db_node: DBNode, cb: () => void | undefined) => {
		let _flow_node = node_db2flow(db_node);
		setNodes((nds) => nds.concat(_flow_node));
		await addDBNode(db_node);
		if (cb) cb();
	}

	let add_edge: edgeCreateWCb = async (db_edge: DBEdge, cb: () => void | undefined) => {
		console.log("!!!add_edge", db_edge)
		let _flow_edge = edge_db2flow(db_edge);
		setEdges((eds) => eds.concat(_flow_edge));
		await addDBEdge(db_edge);
		if (cb) cb();
	}

	let add_img: imgCreateCb = async (db_img: DBImg, cb: () => void | undefined) => {
		await addDBImg(db_img);
		if (cb) cb();
	}


	let ask_serv_to_create_node = (db_node: DBNode) => {
		return new Promise<DBNode>((resolve, reject) => {
			ClientServerBridge.getInstance()
				.create_node(db_node, (serv_node) => add_node(serv_node.db_node, () => resolve(serv_node.db_node)));
		});

	}

	let ask_serv_to_create_edge = (db_edge: DBEdge) => {
		return new Promise<DBEdge>((resolve, reject) => {
			ClientServerBridge.getInstance()
				.create_edge(db_edge, (serv_edge) => add_edge(serv_edge.db_edge, () => resolve(serv_edge.db_edge)));
		});

	}

	let asign_target = (db_edge: DBEdge, db_node: DBNode) => {
		return new Promise<DBEdge>((resolve, reject) => {
			db_edge.target = db_node.id.toString();
			resolve(db_edge);
		});
	}

	const create_first_node = () => {
		setAllowCreate(false);

		const xy_pos = { x: 0, y: 0 }

		let db_node = new DBNode();
		db_node.position = project(xy_pos);

		ask_serv_to_create_node(db_node)
			.then(() => {
				setAllowCreate(true)
				console.log('!!! first node created !!!')
			})
	}

	const create_next_node = async (event: any, div: HTMLDivElement, sourceNodeData: NodeTracker) => {

		setAllowCreate(false);
		let prompt_data = sourceNodeData.prompt_ref

		const { top, left } = div.getBoundingClientRect();
		const xy_pos = { x: event.clientX - left - 75, y: event.clientY - top }

		let db_node = new DBNode();
		db_node.position = project(xy_pos);
		db_node.initial_node_id = parseInt(sourceNodeData.node_id);


		let lul = new DBEdge();
		lul.source = nodeConnectSource.current.node_id;

		ask_serv_to_create_node(db_node)
			.then((serv_db_node) => asign_target(lul, serv_db_node))
			.then((proccessed_db_edge) => ask_serv_to_create_edge(proccessed_db_edge))
			.then(() => setAllowCreate(true))
	}

	const place_node = (event: any) => {
		const targetIsPane = event.target.classList.contains('react-flow__pane');

		if (targetIsPane && allowCreate)
			if (reactFlowWrapper && reactFlowWrapper.current)
				create_next_node(event, reactFlowWrapper.current, nodeConnectSource.current);
	}

	const onConnectEnd = useCallback(place_node, [project, allowCreate]);

	const start_chain = () => {
		return new Promise<void>((resolve, reject) => resolve())
	}

	// step 1 
	const fetchData = async () => {
		let db_nodes = await getAllDBNodes()
		let db_edges = await getAllDBEdges()

		// sync_server(db_nodes, db_edges)

		let flow_nodes = db_nodes.map(node_db2flow)
		let flow_edges = db_edges.map(edge_db2flow)

		console.log("db_edges", db_edges)
		console.log("flow_edges", flow_edges)

		setNodes(flow_nodes);
		setEdges(flow_edges);

		// just id fetch, meaby faser then all bulk data fetch idono
		let imgIds = (await getAllDBImgIds()).map((id) => {
			let db_img_shell = new DBImg();
			db_img_shell.id = id;
			return db_img_shell;
		});

		let all_data = {
			nodes: db_nodes,
			edges: db_edges,
			imgs: imgIds
		}

		return all_data;
	};

	// step 2
	const auth_check_async_loop = (on_auth: () => void, retry_time: number) => {
		if (UserModule.getInstance().isAuthenticated()) {
			on_auth();
		}
		else
			setTimeout(() => auth_check_async_loop(on_auth, retry_time), retry_time);
	}

	const checkAuth = () => {
		let auth_loop = new Promise<void>((resolve, reject) => {
			auth_check_async_loop(resolve, 100);
		})

		let auth_chain = auth_loop
			.then(() => console.log('+INFO+ user authenticated'))
			.then(() => {
				let usr_id = UserModule.getInstance().getUserId();
				setValidUser(true);
				setUserId(usr_id);
			})

		return auth_chain;
	}

	// step 3
	const initialServerSync = (local_data: AllData) => {
		let sync_data_in = new syncSignature()
		sync_data_in.sync_op = syncOps.INFO;

		let { nodes, edges, imgs } = local_data;
		sync_data_in.fill_ids(nodes, edges, imgs);

		let chain = new Promise<number>((resolve, reject) => {
			ClientServerBridge.getInstance()
				.sync_with_server(sync_data_in, (sync_data_out) => {
					if (sync_data_out.sync_op != syncOps.INFO)
						return;

					sync_client_with_server(sync_data_out, nodes.length)
						.then((new_node_num) => resolve(new_node_num));
				});
		});

		return chain;
	}

	const sync_client_with_server = (s_sygn: syncSignature, client_node_num: number) => {
		let { node_id_arr, edge_id_arr, img_id_arr } = s_sygn;
		console.log("node_id_arr", node_id_arr);
		console.log("edge_id_arr", edge_id_arr);
		console.log("img_id_arr", img_id_arr);

		let sync_chain = start_chain()
		.then(() => sync_client_img_with_server(img_id_arr, add_img))
			.then(() => sync_client_nodes_with_server(node_id_arr, add_node))
			.then(() => sync_client_edges_with_server(edge_id_arr, add_edge))
			.then(() => console.log('+INFO+ server synced'))
			.then(() => node_id_arr.length + client_node_num);

		return sync_chain;
	}

	const release_node = (local_data: AllData) => {
		let user_id = UserModule.getInstance().getUserId();
		local_data.nodes.filter((node) => node.user_id == user_id)
	}

	useEffect(() => {
		let local_data: AllData = { nodes: [], edges: [], imgs: [] };
		start_chain()
			.then(() => fetchData())
			.then((data) => local_data = data)
			.then(checkAuth)
			.then(() => initialServerSync(local_data))
			// .then(() => initialServerSync(local_data))
			.then((node_num) => {
				setAllowCreate(true)
				if (node_num == 0)
					create_first_node();
			})
	}, []);


	const move_obs = MoveObserver.getInstance();
	return (
		<div className={styles.full_screan_wrapper} ref={reactFlowWrapper}>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onConnectStart={onConnectStart}
				onConnectEnd={onConnectEnd}
				onNodeDragStop={onNodeDragFinished}
				fitView
				fitViewOptions={fitViewOptions}
				nodeTypes={nodeTypes}
				// edgeTypes={edgeTypes}
				onMoveStart={move_obs.onMoveStart}
				onMove={move_obs.onMove}
				onMoveEnd={move_obs.onMoveEnd}

				minZoom={0.125}
				maxZoom={4}
				deleteKeyCode={null}
			>
				<Panel position="top-left"><InfoPanel /></Panel>
				<MiniMap />
				<Controls />
				<Background />
			</ReactFlow>


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
