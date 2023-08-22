import { NodePosition } from "./types_common";
import { txt2img_config } from "./types_serv_comm";


export interface Generation {
    db_id: number;
    title: string;
    promp: string;
    neg_prompt: string;
    b64_img: string;
}


export interface DBNode {
    db_id: number;
    id: string;
    type: string;
    position: NodePosition;
    img: string;
    prompt: txt2img_config
}

export interface Edge {
    db_id: number;
    id: string;
    source: string;
    target: string;
}