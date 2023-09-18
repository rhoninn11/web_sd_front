import { DBNode } from "./01_node_t";
import { progress } from "./02_serv_t";
import { DBImg, txt2img } from "./03_sd_t";
import { DBEdge } from "./04_edge_t";

export type nodeCreateWCb = (db_node: DBNode, cb: () => void | undefined) => Promise<void>;
export type edgeCreateWCb = (db_node: DBEdge, cb: () => void | undefined) => Promise<void>;
export type imgCreateCb = (db_node: DBImg, cb: () => void | undefined) => Promise<void>;

export interface T2iOprionals {
    t2i : txt2img | undefined
    prog : progress | undefined
 }