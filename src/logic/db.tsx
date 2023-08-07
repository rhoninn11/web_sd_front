import { DBSchema, openDB } from "idb";


const GEN_FIELD = "gen";
const DEV_STEP_FIELD = "devSteps";
const DEV_STOP_NOTE_FIELD = "devStepNotes";

interface Generation {
    id: number;
    title: string;
    promp: string;
    neg_prompt: string;
    b64_img: string;
}

interface DBContent {
    gen: Generation[];
}

interface Wb_Sd_Db extends DBSchema {
    gen: {
        key: number;
        value: Generation;
    };
}

export let initDB = async () => {
    let db = await openDB<Wb_Sd_Db>('web_sd_db', 1, {
        upgrade(db) {
            db.createObjectStore(GEN_FIELD, { keyPath: 'id' });
        },
    });
    return db;
}


export let getDB = async () => {
    return await openDB<Wb_Sd_Db>('web_sd_db', 1)
}