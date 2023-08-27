import { ServerEdge, ServerNode, serverRequest } from "../types/types_serv_comm"
import { ClientServerBridge } from "./ClientServerBridge";

type FinishCB<T> = (data: T) => void;

class RequestProcessor<T> {
    protected type: string = '';
    protected on_finish: FinishCB<T>[] = [];

    public match_type(type: string): boolean {
        return this.type === type;
    }

    public to_server(input: T, on_finish: FinishCB<T>){
        console.log('+++ to server basic');
    }

    public from_server(req: serverRequest){
    }
    
    public input_to_server(input: T){
        let serv_req: serverRequest = {
            data: JSON.stringify(input),
			type: this.type,
		}

        console.log('+++ input_to_server', serv_req); 
        ClientServerBridge.getInstance()
            .sendRequest(serv_req);
    }
}

class NodeRequestProcessor extends RequestProcessor<ServerNode> {
    constructor() {
        super();
        this.type = 'serverNode';
    }

    public to_server(server_node: ServerNode, on_finish: FinishCB<ServerNode>){
        this.on_finish.push(on_finish);
        this.input_to_server(server_node);
        console.log('+++ to server node request');
    }

    public from_server(req: serverRequest){
        let server_node: ServerNode = JSON.parse(req.data);
        let on_finish = this.on_finish.shift();
        if(on_finish) 
            on_finish(server_node);      
    }
}

class EdgeRequestProcessor extends RequestProcessor<ServerEdge> {
    constructor() {
        super();
        this.type = 'serverEdge';
    }

    public to_server(server_node: ServerNode, on_finish: FinishCB<ServerNode>){
        this.on_finish.push(on_finish);
        this.input_to_server(server_node);
        console.log('+++ to server node request');
    }

    public from_server(req: serverRequest){
        let server_node: ServerNode = JSON.parse(req.data);
        let on_finish = this.on_finish.shift();
        if(on_finish) 
            on_finish(server_node);      
    }
}

export class ProcessorRepository{
    protected processors: RequestProcessor<any>[] = [];
    private static instance: ProcessorRepository;

    private constructor() {
        this.processors.push(new NodeRequestProcessor());
        this.processors.push(new EdgeRequestProcessor());
    }

    public static getInstance(): ProcessorRepository {
        if (!ProcessorRepository.instance){
            ProcessorRepository.instance = new ProcessorRepository();
        }

        return ProcessorRepository.instance;
    }

    public get_processor(type: string): RequestProcessor<any> | undefined {
        return this.processors.find(processor => processor.match_type(type));
    }
}