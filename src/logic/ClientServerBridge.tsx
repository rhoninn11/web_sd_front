





import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { serverRequest, authData, txt2img, progress, txt2img_config, default_txt2img_config } from '../types/types_serv_comm';

const serverPort = 8700;

export class ClientServerBridge {
    private static instance: ClientServerBridge;
    private client: W3CWebSocket | null = null;


    private _init (){
        this.client = new W3CWebSocket(`ws://localhost:${serverPort}`);
		this.client.onopen = () => {
			console.log('WebSocket Client Connected');
			if (this.client)
                this._askForAuth(this.client);
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
// internals
    private _askForAuth(client: W3CWebSocket) {

		let authData = {
			password: 'pulsary55.',
			auth: false
		}

		let test_obj: serverRequest = {
			type: 'auth',
			data: JSON.stringify(authData)
		}

		let json_string = JSON.stringify(test_obj);

		client.send(json_string);
	}

    private _handleServerMessage = (message: string) => {
		let respo: serverRequest = JSON.parse(message.toString());
		this._handleServerRequest(respo);
	}

    private _handleServerRequest (req: serverRequest) {
		// console.log(respo);
		if (req.type === 'auth') {
			this._handleAuth(req.data)
		}
		if (req.type === 'txt2img') {
			this._handleTxt2img(req.data)
		}
		if (req.type === 'progress') {
			this._handleProgress(req.data)
		}
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
		if (!this.client) {
			return;
		}

		let txt2img_entry: txt2img = {
			txt2img: {
				metadata: { id: ''},
				bulk: { img: {
					img64: '',
					mode: '',
					x: 0,
					y: 0
				}},
				config: cfg
			}
		};

		let txt2img_object: serverRequest = {
			type: 'txt2img',
			data: JSON.stringify(txt2img_entry)
		}

		console.log("txt2img_object");
		let json_string = JSON.stringify(txt2img_object);
		console.log(this.client);
		this.client.send(json_string);
	}

}

