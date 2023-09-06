import { cloneDeep, flow } from "lodash";
import { DBNode, FlowNode } from "../types/01_node_t";
import { PromptRealatedData } from "../types/02_serv_t";
import { DBEdge, EdgeStyle, FlowEdge } from "../types/04_edge_t";

export const node_db2flow = (db_node: DBNode): FlowNode => {

    let flow_node: FlowNode = {
        id: db_node.id.toString(),
        type: 'prompt',
        position: db_node.position,
        data: {
            node_data: {
                id: db_node.id.toString(),
                initial_node_id: db_node.initial_node_id,
                result_data: cloneDeep(db_node.result_data),
            },
            node_callback: {
                on_update_result_img: () => { },
                on_update_result_prompt: () => { },
            },
        }
    }
    return flow_node;
}

export const node_flow2db = (flow_node: FlowNode): DBNode => {
    let db_node: DBNode = {
        id: parseInt(flow_node.id),

        position: flow_node.position,

        initial_node_id: flow_node.data.node_data.initial_node_id,
        result_data: cloneDeep(flow_node.data.node_data.result_data),
    }
    return db_node;
}

export const edge_db2flow = (db_edge: DBEdge): FlowEdge => {
    let flow_edge: FlowEdge = {
        id: db_edge.id.toString(),
        source: db_edge.source,
        target: db_edge.target,
        style: new EdgeStyle(),
        type: 'prompt'
    }
    return flow_edge;
}

export const edge_flow2db = (flow_edge: FlowEdge): DBEdge => {
    let db_edge: DBEdge = {
        id: parseInt(flow_edge.id),

        source: flow_edge.source,
        target: flow_edge.target,
    }
    return db_edge;
}