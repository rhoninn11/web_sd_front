import { DBNode } from "./01_node_t";
import { DBImg } from "./03_sd_t";
import { DBEdge } from "./04_edge_t";

export type nodeCreateWCb = (db_node: DBNode, cb: () => void | undefined) => void;
export type edgeCreateWCb = (db_node: DBEdge, cb: () => void | undefined) => void;
export type imgCreateCb = (db_node: DBImg, cb: () => void | undefined) => void;