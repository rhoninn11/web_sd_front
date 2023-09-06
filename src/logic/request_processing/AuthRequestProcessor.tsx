import { authData, serverRequest } from "../../types/02_serv_t";
import { RequestProcessor, FinishCB } from "./RequestProcessor";


export class AuthRequestProcessor extends RequestProcessor<authData> {
    constructor() {
        super();
        this.type = 'auth';
        this.show_type();
    }

    public to_server(auth_data: authData, on_finish: FinishCB<authData>) {
        this.on_finish.push(on_finish);
        this.input_to_server(auth_data);
        console.log('+++ to server node request');
    }

    public from_server(req: serverRequest) {
        console.log('+++ from server auth request', req);
        let auth_data: authData = JSON.parse(req.data);
        let on_finish = this.on_finish.shift();
        if (on_finish)
            on_finish(auth_data);
    }
}