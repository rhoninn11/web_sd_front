import { NodePosition } from "./types_common";
import { PromptRealatedData } from "./types_serv_comm";


class RenderData {
    fresh: boolean = false;
}


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

export interface FlowEdge {
    id: string;
    
    db_id: number;
    serv_id: string;
    source: string;
    target: string;

    style: EdgeStyle;
}



export class EdgeStyle {
    strokeWidth: number = 2;
    stroke: string = '#FF0072';
}