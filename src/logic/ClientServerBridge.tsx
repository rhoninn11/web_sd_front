





import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { ProcessorRepository } from './request_processing/RequestProcessor';
import { DBNode, FlowNode, ServerNode } from '../types/01_node_t';
import { FlowOps } from '../types/00_flow_t';
import { DBEdge, ServerEdge } from '../types/04_edge_t';
import { img64, promptConfig, txt2img } from '../types/03_sd_t';
import { serverRequest, authData, progress, syncSignature } from '../types/02_serv_t';
import { T2iOprionals } from '../types/types_db';
import { v4 as uuid } from 'uuid';


const serverPort = 8700;

export class ClientServerBridge {

	private auth_try_num: number = 10;
	private static instance: ClientServerBridge;
	private req_proc: ProcessorRepository;
	private client: W3CWebSocket | null = null;
	private auth: boolean = false;

	private constructor() {
		this.req_proc = ProcessorRepository.getInstance();
	}

	private _init() {
		// get host name from web bar
		let host = window.location.hostname;
		this.client = new W3CWebSocket(`ws://${host}:${serverPort}`);
		this.client.onopen = () => {
			this._askForAuth();
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

	// internals
	private _askForAuth() {
		let auth = new authData();
		// random int from 48 to 55
		let int_value = Math.floor(Math.random() * (55 - 48 + 1) + 48);
		let password = 'pulsary' + int_value + '.';
		auth.password = password
		console.log('+++ try pass', password);

		let on_finish = (authData: authData) => {
			console.log('+++ authData', authData);
			this._setIsAuthenticated(authData.auth);
			if (!authData.auth && this.auth_try_num > 0) {
				this.auth_try_num--;
				setTimeout(() => this._askForAuth(), 100);
			}
		}

		let unique_id = uuid()
		this.req_proc.get_processor('auth')
			?.bind_fn(on_finish, unique_id)
			.to_server(auth, unique_id)
	}

	private _handleServerMessage = (message: string) => {
		let respo: serverRequest = JSON.parse(message.toString());
		this.req_proc.get_processor(respo.type)
			?.from_server(respo);
	}

	// to communicate with react
	public isAuthenticated = () => {
		return this.auth;
	};

	private isAuthenticatedSetter: (suth: boolean) => void = () => { };

	public setAuthenticatedSetter = (setter: (suth: boolean) => void) => {
		this.isAuthenticatedSetter = setter;
	}

	private _setIsAuthenticated = (isAuthenticated: boolean) => {
		console.log('+++ set is authenticated ', isAuthenticated);
		this.auth = isAuthenticated;
		this.isAuthenticatedSetter(isAuthenticated);
	}

	// public methods
	public onText2imgResult: ((data: img64) => void)[] = []
	public onText2imgProgress: ((data: any) => void)[] = []

	public send_txt2_img(text_to_img_in: txt2img, on_progress: (progr: progress) => void, on_finish: (text_to_img_out: txt2img) => void) {
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

	public send_node(db_node: DBNode, on_finish: (serv_node: ServerNode) => void) {
		let server_node = new ServerNode();
		server_node.node_op = FlowOps.CREATE;
		server_node.db_node = db_node;
		console.log('+++ send_node', server_node);

		let unique_id = uuid()
		this.req_proc.get_processor('serverNode')
			?.bind_fn(on_finish, unique_id)
			.to_server(server_node, unique_id)
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

	public send_edge(db_edge: DBEdge, on_finish: (serv_edge: ServerEdge) => void) {
		let server_edge = new ServerEdge();
		server_edge.node_op = FlowOps.CREATE;
		server_edge.db_edge = db_edge

		let unique_id = uuid()
		this.req_proc.get_processor('serverEdge')
			?.bind_fn(on_finish, unique_id)
			.to_server(server_edge, unique_id)
	}

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

}

