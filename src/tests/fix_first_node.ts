import { editDBNode, getDBNode } from "../logic/db"


export const fix_initial_node = async () => {
    let inittial_node = await getDBNode(0)
    inittial_node.serv_id = 'initial'
    await editDBNode(0, inittial_node)
}