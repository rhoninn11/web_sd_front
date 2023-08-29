import { cloneDeep } from "lodash";

// general
export interface serverRequest {
    type: string;
    data: string;
}

//auth
export interface authData {
	password: string;
	auth: boolean;
    user_id: string;
}

//txt2img
export class txt2img {
    txt2img: txt2img_content = new txt2img_content();
}

export class txt2img_content {
    config: txt2img_config = new txt2img_config();
    metadata: metadata = new metadata();
    bulk: bulk_data = new bulk_data();

}

export class txt2img_config {
    prompt: string = '';
    prompt_negative: string = '';
    seed: number = 0;
    samples: number = 1;
}


export class metadata {
    id: string = '';
}

export class bulk_data{
    img: img64 = new img64();
}

export class img64{
    img64: string = '';
    mode: string = '';
    x: number = 0;
    y: number = 0;
}


export interface progress {
    progress: progress_content;
}

export interface progress_content {
    metadata: metadata;
    value: number;
}

export class PromptRealatedData {
	public propmt_cfg: txt2img_config = new txt2img_config();
	public img_coded: string = '';

    constructor(){
    }

    public clone(other: PromptRealatedData, copy_img: boolean = false){
        this.propmt_cfg = cloneDeep(other.propmt_cfg);
        if(copy_img)
            this.img_coded = other.img_coded;
        return this;
    }
}
export enum FlowOps {
    NONE = 'none',
    CREATE = 'create',
}

export class ServerNode {
    serv_id: string = '';
    user_id: string = '';
    node_op: FlowOps = FlowOps.NONE;
}

export class ServerEdge {
    serv_id: string = '';
    user_id: string = '';
    node_op: FlowOps = FlowOps.NONE;
}