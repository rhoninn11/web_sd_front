import { cloneDeep, flow } from "lodash";
import { DBNode } from "../types/types_db";
import { FlowNode } from "../types/types_flow";

export const node_db2flow = (db_node: DBNode): FlowNode => {
    let flow_node: FlowNode = {
        id: db_node.id,
        type: db_node.type,
        position: db_node.position,
        data: {
            label: "ni",
            db_id: db_node.db_id,
            higher_level_data: {
                propmt_cfg: cloneDeep(db_node.prompt),
                img_coded: db_node.img,
            }
        }
    }
    return flow_node;
}

export const node_flow2db = (flow_node: FlowNode):DBNode => {
    let db_node = {
        db_id: flow_node.data.db_id,
        id: flow_node.id,
        type: flow_node.type,
        position: flow_node.position,
        img: flow_node.data.higher_level_data.img_coded,
        prompt: cloneDeep(flow_node.data.higher_level_data.propmt_cfg),
    }
    return db_node;
}

export const edge_db2flow = (db_edge: any) => {
    let flow_edge = {
        id: db_edge.id,
        source: db_edge.source,
        target: db_edge.target,
    }
    return flow_edge;
}

export const edge_flow2db = (db_id: number, flow_edge: any) => {
    let db_edge = {
        db_id: db_id,
        id: flow_edge.id,
        source: flow_edge.source,
        target: flow_edge.target,
    }
    return db_edge;
}