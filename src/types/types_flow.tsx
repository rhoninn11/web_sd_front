import { NodePosition } from "./types_common";
import { PromptRealatedData } from "./types_serv_comm";


export class RenderData {
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

enum EDGE_COLOR {
    COLOR_1 = '#FF0072',
    COLOR_2 = '#FBB195',
    COLOR_3 = '#F67280',
    COLOR_4 = '#C06C84',
    COLOR_5 = '#6C5B7B',
    COLOR_6 = '#355C7D',
}



export class EdgeStyle {
    strokeWidth: number = 2;
    stroke: string = EDGE_COLOR.COLOR_2;
}