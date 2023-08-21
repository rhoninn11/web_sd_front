import { DBSchema, openDB } from "idb";
import { txt2img_content } from "../types/types_serv_comm";
import { Edge, Generation, DBNode } from "../types/types_db";

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
        value: Edge;
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

export let getAllDBNodes = async () => {
    const db = await initDB();
    const all_nodes: DBNode[] = await db.getAll(NODE_FIELD);
    return all_nodes;
}

export let addDBNode = async (new_node: DBNode) => {
    const db = await getDB();
    const tx = db.transaction(NODE_FIELD, 'readwrite');
    const store = tx.objectStore(NODE_FIELD);
    await store.add(new_node);
}

export let getDBNode = async (id: number) => {
    // console.log(' ++DB++ getDBNode', id)
    const db = await getDB();
    const tx = db.transaction(NODE_FIELD, 'readwrite');
    const store = tx.objectStore(NODE_FIELD);
    const node = await store.get(id);
    return node;
}

export let editDBFilm = async (id: number, updated_value: DBNode) => {
    // console.log(' ++DB++ editDBFilm', id)
    const db = await getDB();
    const tx = db.transaction(NODE_FIELD, 'readwrite');
    const store = tx.objectStore(NODE_FIELD);
    const node = await store.get(id);
    if (node) {
        await store.put(updated_value);
    }
}


export let addDBEdge = async (new_edge: Edge) => {
    const db = await getDB();
    const tx = db.transaction(EDGE_FIELD, 'readwrite');
    const store = tx.objectStore(EDGE_FIELD);
    await store.add(new_edge);
}


export let getAllDBEdges = async () => {
    const db = await initDB();
    const all_edges: Edge[] = await db.getAll(EDGE_FIELD);
    return all_edges;
}