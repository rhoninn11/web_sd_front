





import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { ProcessorRepository } from './request_processing/RequestProcessor';
import { DBNode, FlowNode, ServerNode } from '../types/01_node_t';
import { FlowOps } from '../types/00_flow_t';
import { DBEdge, ServerEdge } from '../types/04_edge_t';
import { img64, txt2img, txt2img_config } from '../types/03_sd_t';
import { serverRequest, authData, progress } from '../types/02_serv_t';

const serverPort = 8700;

export class ClientServerBridge {

	private static instance: ClientServerBridge;
	private req_proc: ProcessorRepository;
    private client: W3CWebSocket | null = null;
	
	private constructor() {
		this.req_proc = ProcessorRepository.getInstance();
	}

    private _init (){
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
        if (!ClientServerBridge.instance){
            ClientServerBridge.instance = new ClientServerBridge();
            ClientServerBridge.instance._init();
        }

        return ClientServerBridge.instance;
    }

	public sendRequest(req: serverRequest) {
		if (this.client){
			let json_string = JSON.stringify(req);
			this.client.send(json_string);
		}
	}
	
// internals
    private _askForAuth() {
		let authData: authData = {
			password: 'pulsary55.',
			auth: false,
			user_id: '',

		}

		let test_obj: serverRequest = {
			type: 'auth',
			data: JSON.stringify(authData)
		}

		this.sendRequest(test_obj)
	}

    private _handleServerMessage = (message: string) => {
		let respo: serverRequest = JSON.parse(message.toString());
		this._handleServerRequest(respo);
	}

    private _handleServerRequest (req: serverRequest) {
		if (req.type === 'auth') {
			this._handleAuth(req.data)
			return;
		}
		if (req.type === 'txt2img') {
			this._handleTxt2img(req.data)
			return;
		}
		if (req.type === 'progress') {
			this._handleProgress(req.data)
			return;
		}
		console.log('+++ handle server request');

		this.req_proc.get_processor(req.type)
		?.from_server(req);
	}

	private _handleAuth (data: string) {
		let authData: authData = JSON.parse(data);
		this._setIsAuthenticated(authData.auth);
	}

	private async _handleTxt2img (data: string){
		let txt2imgData: txt2img = JSON.parse(data);
		// console.log('from bridge');
		// console.log(txt2imgData);
		if (this.onText2imgResult.length > 0){
			let onProgress = this.onText2imgProgress.shift();
			let onFinished = this.onText2imgResult.shift();

			if (onFinished){
				let img = txt2imgData.txt2img.bulk.img
				let prefix = `data:image/${img.mode};base64,`
				let coded_img = prefix + img.img64;

				onFinished(coded_img);

				// save to db
			}
		}
	}

	private _handleProgress(data: string){
		let progress: progress = JSON.parse(data);
		let prog_fn_num = this.onText2imgProgress.length;
		if(prog_fn_num > 0){
			// console.log(progress);
			// console.log('progress'+ progress);
			let onProgress = this.onText2imgProgress[0];
			onProgress(progress.progress.value);
		}
	}

// to communicate with react
    private isAuthenticatedSetter: (suth: boolean) => void = () => {};
    
    public setAuthenticatedSetter = (setter: (suth: boolean) => void) => {
        this.isAuthenticatedSetter = setter;
    }

    private _setIsAuthenticated = (isAuthenticated: boolean) => {
        this.isAuthenticatedSetter(isAuthenticated);
    }

   
// public methods
	public onText2imgResult: ((data:any)=> void)[] = []
	public onText2imgProgress: ((data:any)=> void)[] = []

    public send_txt2_img(cfg: txt2img_config){
		if (!this.client)
			return;

		let txt2img_entry: txt2img = {
			txt2img: {
				metadata: { id: ''},
				bulk: { img: new img64() },
				config: cfg
			}
		};

		let txt2img_req: serverRequest = {
			type: 'txt2img',
			data: JSON.stringify(txt2img_entry)
		}

		this.sendRequest(txt2img_req)
	}

	public send_node(db_node: DBNode, on_finish: (serv_node: ServerNode) => void) {
		let server_node = new ServerNode();
		server_node.node_op = FlowOps.CREATE;
		server_node.db_node = db_node;
		console.log('+++ send_node', server_node);
		this.req_proc.get_processor('serverNode')
			?.to_server(server_node, on_finish)
	}

	public delete_node(flow_node: FlowNode, on_finish: (serv_node: ServerNode) => void) {
		let server_node = new ServerNode();
		server_node.node_op = FlowOps.CREATE;

		this.req_proc.get_processor('serverNode')
			?.to_server(server_node, on_finish)
	}

	public send_edge(db_edge: DBEdge, on_finish: (serv_edge: ServerEdge) => void) {
		let server_edge = new ServerEdge();
		server_edge.node_op = FlowOps.CREATE;
		server_edge.db_edge = db_edge
	
		this.req_proc.get_processor('serverEdge')
			?.to_server(server_edge, on_finish)
	}


}

