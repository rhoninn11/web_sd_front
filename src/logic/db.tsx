import { DBSchema, openDB } from "idb";
import { txt2img_content } from "../types/types_serv_comm";
import { DBEdge, Generation, DBNode } from "../types/types_db";

const GEN_FIELD = "gen";
const NODE_FIELD = "node";
const EDGE_FIELD = "edge";

interface Wb_Sd_Db extends DBSchema {
    gen: {
        key: number;
        value: Generation;
    };
    node: {
        key: number;
        value: DBNode;
    };
    edge: {
        key: number;
        value: DBEdge;
    };
}

export let initDB = async () => {
    let db = await openDB<Wb_Sd_Db>('web_sd_db', 1, {
        upgrade(db) {
            db.createObjectStore(GEN_FIELD, { keyPath: 'db_id' });
            db.createObjectStore(NODE_FIELD, { keyPath: 'db_id' });
            db.createObjectStore(EDGE_FIELD, { keyPath: 'db_id' });
            let initial_node = { db_id: 0,
                id: "0",
                type: "prompt",
                position: { x: 0, y: 50 },
                img: "",
                prompt: { 
                    prompt: "Italian vialge",
                    prompt_negative: "borign sky",
                    seed: 0,
                    samples: 1 } 
            }
            addDBNode(initial_node)
        },
    });
    return db;
}

export let getDB = async () => {
    return await openDB<Wb_Sd_Db>('web_sd_db', 1)
}

const _get_store = async (store_name: any) => {
    const db = await getDB();
    const tx = db.transaction(store_name, 'readwrite');
    const store = tx.objectStore(store_name);
    return store;
}

export let getAllDBNodes = async () => {
    const db = await initDB();
    const all_nodes: DBNode[] = await db.getAll(NODE_FIELD);
    return all_nodes;
}

export let addDBNode = async (new_node: DBNode) => {
    let job = _get_store(NODE_FIELD)
        .then((store) => store.add(new_node))
    return await job
}

export let getDBNode = async (id: number) => {
    let job = _get_store(NODE_FIELD)
        .then((store) => store.get(id))

    return await job;
}

export let editDBNode = async (id: number, updated_value: DBNode) => {
    let store = await _get_store(NODE_FIELD)
    let node = await store.get(id)
    if (node) {
        await store.put(updated_value);
    }
}

export let addDBEdge = async (new_edge: DBEdge) => {
    let job = _get_store(EDGE_FIELD)
        .then((store) => store.add(new_edge))
    return await job
}


export let getAllDBEdges = async () => {
    const db = await initDB();
    const all_edges: DBEdge[] = await db.getAll(EDGE_FIELD);
    return all_edges;
}