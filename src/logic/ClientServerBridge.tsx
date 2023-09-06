





import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { ProcessorRepository } from './request_processing/RequestProcessor';
import { DBNode, FlowNode, ServerNode } from '../types/01_node_t';
import { FlowOps } from '../types/00_flow_t';
import { DBEdge, ServerEdge } from '../types/04_edge_t';
import { img64, promptConfig, txt2img } from '../types/03_sd_t';
import { serverRequest, authData, progress, syncSignature } from '../types/02_serv_t';

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

	private _handleAuth (data: string) {
		let authData: authData = JSON.parse(data);
		this._setIsAuthenticated(authData.auth);
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
			this._setIsAuthenticated(authData.auth);
			if (!authData.auth && this.auth_try_num > 0){
				this.auth_try_num--;
				setTimeout(() => this._askForAuth(), 100);
			}
		}
	
		this.req_proc.get_processor('auth')
			?.to_server(auth, on_finish)
	}

    private _handleServerMessage = (message: string) => {
		let respo: serverRequest = JSON.parse(message.toString());
		this._handleServerRequest(respo);
	}

    private _handleServerRequest (req: serverRequest) {
		if (req.type === 'txt2img') {
			this._handleTxt2img(req.data)
			return;
		}
		if (req.type === 'progress') {
			this._handleProgress(req.data)
			return;
		}

		this.req_proc.get_processor(req.type)
		?.from_server(req);
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
				img.img64 = coded_img;

				onFinished(img);

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
	public isAuthenticated = () => { 
		return this.auth; 
	};

	private isAuthenticatedSetter: (suth: boolean) => void = () => {};
    
    public setAuthenticatedSetter = (setter: (suth: boolean) => void) => {
		this.isAuthenticatedSetter = setter;
    }
	
    private _setIsAuthenticated = (isAuthenticated: boolean) => {
		console.log('+++ set is authenticated ', isAuthenticated);
		this.auth = isAuthenticated;
        this.isAuthenticatedSetter(isAuthenticated);
    }



   
// public methods
	public onText2imgResult: ((data:img64)=> void)[] = []
	public onText2imgProgress: ((data:any)=> void)[] = []

    public send_txt2_img(cfg: promptConfig){
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

	public sync_node(db_node: DBNode, on_finish: (serv_node: ServerNode) => void) {
		let server_node = new ServerNode();
		server_node.node_op = FlowOps.CLIENT_SYNC;
		server_node.db_node = db_node;
		console.log('+++ sync_node', server_node);
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

	public sync_edge(db_edge: DBEdge, on_finish: (serv_edge: ServerEdge) => void) {
		let server_edge = new ServerEdge();
		server_edge.node_op = FlowOps.CLIENT_SYNC;
		console.log('+++ sync_edge', server_edge);
		server_edge.db_edge = db_edge
	
		this.req_proc.get_processor('serverEdge')
			?.to_server(server_edge, on_finish)
	}

	public sync_with_server(syncSignature: syncSignature, on_finish: (sync_syg: syncSignature) => void) {
		this.req_proc.get_processor('sync')
			?.to_server(syncSignature, on_finish)
	}

}

