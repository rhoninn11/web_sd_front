import { NodePosition } from "./types_common";
import { GenData } from "./types_serv_comm";


export interface FlowNode {
    id: string;
    type: string;
    position: NodePosition;
    data: {
        label: string;
        db_id: number;
        higher_level_data: GenData;
    }
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
}