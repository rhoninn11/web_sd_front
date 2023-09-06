import { cloneDeep, flow } from "lodash";
import { DBNode, FlowNode } from "../types/01_node_t";
import { PromptRealatedData } from "../types/02_serv_t";
import { DBEdge, EdgeStyle, FlowEdge } from "../types/04_edge_t";

export const node_db2flow = (db_node: DBNode): FlowNode => {

    let prompt_data_rel = new PromptRealatedData();
    prompt_data_rel.propmt_cfg = cloneDeep(db_node.prompt);
    prompt_data_rel.img_coded = db_node.img;

    let flow_node: FlowNode = {
        id: db_node.id,
        type: db_node.type,
        position: db_node.position,
        data: {
            db_id: db_node.db_id,
            serv_id: db_node.serv_id,
            data_prompt: prompt_data_rel,
            data_render: {
                fresh: false,
            }
        }
    }
    return flow_node;
}

export const node_flow2db = (flow_node: FlowNode):DBNode => {
    let db_node: DBNode = {
        id: flow_node.id,

        db_id: flow_node.data.db_id,
        serv_id: flow_node.data.serv_id,

        type: flow_node.type,
        position: flow_node.position,
        img: flow_node.data.data_prompt.img_coded,
        prompt: cloneDeep(flow_node.data.data_prompt.propmt_cfg),
    }
    return db_node;
}

export const edge_db2flow = (db_edge: DBEdge): FlowEdge => {
    let flow_edge: FlowEdge = {
        id: db_edge.id,
        db_id: db_edge.db_id,
        serv_id: db_edge.serv_id,
        source: db_edge.source,
        target: db_edge.target,
        style: new EdgeStyle(),
        type: 'prompt'
    }
    return flow_edge;
}

export const edge_flow2db = (flow_edge: FlowEdge): DBEdge => {
    let db_edge: DBEdge = {
        db_id: flow_edge.db_id,

        id: flow_edge.id,
        serv_id: flow_edge.serv_id,
        
        source: flow_edge.source,
        target: flow_edge.target,
    }
    return db_edge;
}