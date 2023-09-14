import { set } from "lodash";
import { NodePosition } from "../types/00_flow_t";
import { editDBNode, getDBNode } from "./db";
import { promptConfig } from "../types/03_sd_t";
import { ClientServerBridge } from "./ClientServerBridge";
import { DBNode } from "../types/01_node_t";


class updateStruct {
    id: number;
    update_queue: (() => void)[] = [];
    changes_num: number = 0;
    is_spinning: boolean = false;
    is_serv_syncing: boolean = false;

    constructor(id: number) {
        this.id = id;
    }

    sync_barier_on = () => {
        this.is_serv_syncing = true;
        this.changes_num = 0;
    }

    sync_barier_off = () => {
        this.is_serv_syncing = false;
    }

    is_blocking = () => {
        return this.is_spinning || this.is_serv_syncing;
    }
}

export class UpdateNodeSync {
    private static instance: UpdateNodeSync;
    private node_queues: { [key: number]: updateStruct } = {};

    public static getInstance(): UpdateNodeSync {
        if (!UpdateNodeSync.instance) {
            UpdateNodeSync.instance = new UpdateNodeSync();
        }

        return UpdateNodeSync.instance;
    }



    //mechanism
    private get_update_struct_safe = (id: number) => {
        if (!(id in this.node_queues))
            this.node_queues[id] = new updateStruct(id);

        return this.node_queues[id];
    }

    private respin = (up_st: updateStruct) => {
        let next_spin = () => {
            up_st.is_spinning = false;
            this.run_update_and_reduce(up_st.id)
        }

        setTimeout(next_spin, 0);
    }

    private server_sync = (db_node: DBNode) => {
        return new Promise<DBNode>((resolve, reject) => {
            ClientServerBridge.getInstance()
                .update_node(db_node, async (serv_node_out) => resolve(serv_node_out.db_node));
        });
    }


    // main pipeline
    private run_update_and_reduce = (id: number) => {
        let hasKey = id.toString() in this.node_queues;
        if (!hasKey)
            return;

        let up_St = this.node_queues[id];
        if(up_St.is_blocking())
            return;

        up_St.is_spinning = true;
        this.try_to_run_update(up_St)
        this.try_reduce_queue(id)
    }

    
    private try_to_run_update = (up_st: updateStruct) => {
        if (up_st.update_queue.length == 0)
            return;

        up_st.changes_num += 1;
        let update_fn = up_st.update_queue.shift();
        if (update_fn) update_fn(); //update fn is async, so mutex like flag is used

        this.respin(up_st);
    }

    
    private try_reduce_queue = (id: number) => {
        let up_st = this.node_queues[id];
        if (up_st.update_queue.length > 0)
            return;

        if (up_st.changes_num == 0) {
            delete this.node_queues[id];
            return;
        }

        up_st.sync_barier_on();
        getDBNode(id)
            .then(this.server_sync)
            .then(async (db_node) => {
                await editDBNode(db_node.id, db_node);
                up_st.sync_barier_off();
                this.respin(up_st);
            });
    }


    // interactions
    private _update_position = async (id: number, pos: NodePosition) => {
        getDBNode(id).then(async (db_node) => {
            db_node.position = pos;
            await editDBNode(db_node.id, db_node);
            return;
        });
    }

    public update_position(id: number, pos: NodePosition) {
        let queue = this.get_update_struct_safe(id)
        queue.update_queue.push(() => this._update_position(id, pos));
        this.run_update_and_reduce(id);
    }

    private _update_result_img = async (id: number, img_id: number) => {
        getDBNode(id).then(async (db_node) => {
            db_node.result_data.prompt_img_id = img_id;
            await editDBNode(db_node.id, db_node);
            return;
        });
    }

    public update_result_img(id: number, img_id: number) {
        let queue = this.get_update_struct_safe(id)
        queue.update_queue.push(() => this._update_result_img(id, img_id));
        this.run_update_and_reduce(id);
    }

    private _update_result_prompt = async (id: number, prompt: promptConfig) => {
        getDBNode(id).then(async (db_node) => {
            db_node.result_data.prompt = prompt;
            await editDBNode(db_node.id, db_node);
            return;
        });
    }

    public update_result_prompt(id: number, prompt: promptConfig) {
        let queue = this.get_update_struct_safe(id)
        queue.update_queue.push(() => this._update_result_prompt(id, prompt));
        this.run_update_and_reduce(id);
    }
}