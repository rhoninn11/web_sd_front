import { ServerNode, serverRequest } from "../../types/types_serv_comm";
import { RequestProcessor, FinishCB } from "./RequestProcessor";

export class NodeRequestProcessor extends RequestProcessor<ServerNode> {
    constructor() {
        super();
        this.type = 'serverNode';
        this.show_type();
    }

    public to_server(server_node: ServerNode, on_finish: FinishCB<ServerNode>) {
        this.on_finish.push(on_finish);
        this.input_to_server(server_node);
        console.log('+++ to server node request');
    }

    public from_server(req: serverRequest) {
        let server_node: ServerNode = JSON.parse(req.data);
        let on_finish = this.on_finish.shift();
        if (on_finish)
            on_finish(server_node);
    }
}
