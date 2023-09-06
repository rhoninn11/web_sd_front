import { set } from "lodash";
import { NodePosition } from "../types/00_flow_t";
import { editDBNode, getDBNode } from "./db";
import { promptConfig } from "../types/03_sd_t";


export class UpdateNodeSync {
	
	private static instance: UpdateNodeSync;
    private node_queues: { [key: string]:(() => void)[]} = {};
	
    public static getInstance(): UpdateNodeSync {
        if (!UpdateNodeSync.instance){
            UpdateNodeSync.instance = new UpdateNodeSync();
        }

        return UpdateNodeSync.instance;
    }

    _get_queue_safe = (id: number) => {
        let hasKey = id.toString() in this.node_queues;
        if (!hasKey)
            this.node_queues[id.toString()] = [];

        return this.node_queues[id.toString()];
    }

    _run = (id: number, queue: (() => void)[]) => {
        let fn = queue.shift();
        if (fn) {
            fn();
        }
        setTimeout(() => this._run_and_reduce(id), 0);
    }

    _run_and_reduce = (id: number) => {
        let hasKey = id.toString() in this.node_queues;
        if (hasKey){
            let queue = this.node_queues[id.toString()];
            if(queue.length == 0) {
                // reduce
                delete this.node_queues[id.toString()];
                return;
            }

            this._run(id, queue)
        }
    }

    _update_position = async (id : number, pos: NodePosition) => {
        getDBNode(id).then(async (db_node) => {
            db_node.position = pos;
            await editDBNode(db_node.id, db_node);
            return;
        });
    }

    update_position(id : number, pos: NodePosition) {
        let queue = this._get_queue_safe(id)
        queue.push(() => this._update_position(id, pos));
        this._run_and_reduce(id);
    }

    _update_result_img = async (id : number, img_id: number) => {
        getDBNode(id).then(async (db_node) => {
            db_node.result_data.prompt_img_id = img_id;
            await editDBNode(db_node.id, db_node);
            return;
        });
    }

    update_result_img(id : number, img_id: number) {
        let queue = this._get_queue_safe(id)
        queue.push(() => this._update_result_img(id, img_id));
        this._run_and_reduce(id);
    }

    _update_result_prompt = async (id : number, prompt: promptConfig) => {
        getDBNode(id).then(async (db_node) => {
            db_node.result_data.prompt = prompt;
            await editDBNode(db_node.id, db_node);
            return;
        });
    }
    
    update_result_prompt(id : number, prompt: promptConfig) {
        let queue = this._get_queue_safe(id)
        queue.push(() => this._update_result_prompt(id, prompt));
        this._run_and_reduce(id);

    }
}