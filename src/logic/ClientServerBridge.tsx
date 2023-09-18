





import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { ProcessorRepository } from './request_processing/RequestProcessor';
import { DBNode, FlowNode, ServerNode } from '../types/01_node_t';
import { FlowOps } from '../types/00_flow_t';
import { DBEdge, ServerEdge } from '../types/04_edge_t';
import { img2img, img64, promptConfig, txt2img } from '../types/03_sd_t';
import { serverRequest, authData, progress, syncSignature } from '../types/02_serv_t';
import { v4 as uuid } from 'uuid';
import { UserModule } from './UserModule';


const serverPort = 8700;

export class ClientServerBridge {

	private static instance: ClientServerBridge;
	private req_proc: ProcessorRepository;
	private user_module: UserModule;
	private client: W3CWebSocket | null = null;
	

	private constructor() {
		this.req_proc = ProcessorRepository.getInstance();
		this.user_module = UserModule.getInstance();
	}

	private _init() {
		// get host name from web bar
		console.log('+++ init ClientServerBridge');
		let host = window.location.hostname;
		this.client = new W3CWebSocket(`ws://${host}:${serverPort}`);
		this.client.onopen = () => {
			console.log('WebSocket Client Connected');
			// this.user_module.askForAuth();
		}
		this.client.onmessage = (message) => {
			this._handleServerMessage(message.data.toString());
		}
	}

	public static getInstance(): ClientServerBridge {
		if (!ClientServerBridge.instance) {
			ClientServerBridge.instance = new ClientServerBridge();
			ClientServerBridge.instance._init();
		}

		return ClientServerBridge.instance;
	}

	public sendRequest(req: serverRequest) {
		if (this.client) {
			let json_string = JSON.stringify(req);
			this.client.send(json_string);
		}
	}



	private _handleServerMessage = (message: string) => {
		let respo: serverRequest = JSON.parse(message.toString());
		this.req_proc.get_processor(respo.type)
			?.from_server(respo);
	}



	public send_txt2img(text_to_img_in: txt2img, on_progress: (progr: progress) => void, on_finish: (text_to_img_out: txt2img) => void) {
		let unique_id = uuid()
		let progress_proc = this.req_proc.get_processor('progress')
			?.bind_fn(on_progress, unique_id);

		let on_txt2img_finish = (text_to_img_out: txt2img) => {
			if (progress_proc) progress_proc.unbind_fn(unique_id);
			on_finish(text_to_img_out);
		}

		this.req_proc.get_processor('txt2img')
			?.bind_fn(on_txt2img_finish, unique_id)
			.to_server(text_to_img_in, unique_id);

	}
	
	public send_img2img(img_to_img_in: img2img, on_progress: (progr: progress) => void, on_finish: (img_to_img_out: img2img) => void) {
		let unique_id = uuid()
		let progress_proc = this.req_proc.get_processor('progress')
			?.bind_fn(on_progress, unique_id);

		let on_img2img_finish = (img_to_img_out: img2img) => {
			if (progress_proc) progress_proc.unbind_fn(unique_id);
			on_finish(img_to_img_out);
		}

		this.req_proc.get_processor('img2img')
			?.bind_fn(on_img2img_finish, unique_id)
			.to_server(img_to_img_in, unique_id);

	}

	public create_node(db_node: DBNode, on_finish: (serv_node: ServerNode) => void) {
		let server_node = new ServerNode();
		server_node.db_node = db_node;
		server_node.db_node.node_op = FlowOps.CREATE;
		server_node.user_id = this.user_module.getUserId();
		console.log('+BRIDGE+ create node');

		let unique_id = uuid()
		this.req_proc.get_processor('serverNode')
			?.bind_fn(on_finish, unique_id)
			.to_server(server_node, unique_id)
	}

	public update_node(db_node: DBNode, on_finish: (serv_node: ServerNode) => void) {
		let server_node = new ServerNode();
		server_node.db_node = db_node;
		server_node.db_node.node_op = FlowOps.UPDATE;
		server_node.user_id = this.user_module.getUserId();
		console.log('+BRIDGE+ update node');

		let unique_id = uuid()
		this.req_proc.get_processor('updateNode')
			?.bind_fn(on_finish, unique_id)
			.to_server(server_node, unique_id)
	}

	public create_edge(db_edge: DBEdge, on_finish: (serv_edge: ServerEdge) => void) {
		let server_edge = new ServerEdge();
		server_edge.db_edge = db_edge
		server_edge.node_op = FlowOps.CREATE;
		server_edge.user_id = this.user_module.getUserId();
		console.log('+BRIDGE+ create edge');


		let unique_id = uuid()
		this.req_proc.get_processor('serverEdge')
			?.bind_fn(on_finish, unique_id)
			.to_server(server_edge, unique_id)
	}

	// public sync_node(db_node: DBNode, on_finish: (serv_node: ServerNode) => void) {
	// 	let server_node = new ServerNode();
	// 	server_node.node_op = FlowOps.CLIENT_SYNC;
	// 	server_node.db_node = db_node;
	// 	console.log('+++ sync_node', server_node);
	// 	this.req_proc.get_processor('serverNode')
	// 		?.bind_fn(on_finish)
	// 		.to_server(server_node)
	// }

	// public delete_node(flow_node: FlowNode, on_finish: (serv_node: ServerNode) => void) {
	// 	let server_node = new ServerNode();
	// 	server_node.node_op = FlowOps.CREATE;

	// 	this.req_proc.get_processor('serverNode')
	// 		?.bind_fn(on_finish)
	// 		.to_server(server_node)


	// }



	// public sync_edge(db_edge: DBEdge, on_finish: (serv_edge: ServerEdge) => void) {
	// 	let server_edge = new ServerEdge();
	// 	server_edge.node_op = FlowOps.CLIENT_SYNC;
	// 	console.log('+++ sync_edge', server_edge);
	// 	server_edge.db_edge = db_edge

	// 	this.req_proc.get_processor('serverEdge')
	// 		?.bind_fn(on_finish)
	// 		.to_server(server_edge)
	// }

	public sync_with_server(syncSignature: syncSignature, on_finish: (sync_syg: syncSignature) => void) {

		let unique_id = uuid()
		this.req_proc.get_processor('sync')
			?.bind_fn(on_finish, unique_id)
			.to_server(syncSignature, unique_id)
	}

	
	public sync_timestump_with_server(syncSignature: syncSignature, on_finish: (sync_syg: syncSignature) => void) {
		this.sync_with_server(syncSignature, on_finish);
	}

}

