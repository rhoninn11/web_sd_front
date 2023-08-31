import { NodePosition } from "./types_common";
import { RenderData } from "./types_flow";
import { FlowOps, PromptRealatedData, txt2img_config } from "./types_serv_comm";


export interface NodeData {
	db_id: number;
    serv_id: string;
	data_prompt: PromptRealatedData;
    data_render: RenderData;
}

export interface FlowNode {
    id: string;
    type: string;
    position: NodePosition;
    data: NodeData
}

export interface DBNode {
    db_id: number;
    id: string;
    serv_id: string;

    type: string;
    position: NodePosition;
    prompt: txt2img_config
    img: string;
}

export class ServerNode {
    serv_id: string = '';
    user_id: string = '';
    node_op: FlowOps = FlowOps.NONE;
    pos: NodePosition = {x: 0, y: 0};
    deleted: boolean = false;
}
