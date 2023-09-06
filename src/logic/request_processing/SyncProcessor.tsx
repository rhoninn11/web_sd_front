import { serverRequest, syncSignature } from "../../types/02_serv_t";
import { RequestProcessor, FinishCB } from "./RequestProcessor";


export class SyncProcessor extends RequestProcessor<syncSignature> {
    constructor() {
        super();
        this.type = 'sync';
        this.show_type();
    }

    public to_server(syncData: syncSignature, on_finish: FinishCB<syncSignature>) {
        this.on_finish.push(on_finish);
        this.input_to_server(syncData);
    }

    public from_server(req: serverRequest) {
        let sync_data: syncSignature = JSON.parse(req.data);
        let on_finish = this.on_finish.shift();
        if (on_finish)
            on_finish(sync_data);
    }
}
