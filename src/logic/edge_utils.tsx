import { Position, internalsSymbol, Node } from 'reactflow';

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: Node, nodeB: Node) {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    const horizontalDiff = Math.abs(centerA.x - centerB.x);
    const verticalDiff = Math.abs(centerA.y - centerB.y);

    let position: Position;

    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    if (horizontalDiff > verticalDiff) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const [x, y] = getHandleCoordsByPosition(nodeA, position);
    return [x, y, position];
}

function getHandleCoordsByPosition(node: Node, handlePosition: Position) {


    // const elo = node?[internalsSymbol];
    // const 
    // // const handle = node?[internalsSymbol].handleBounds.source.find(
    // //     (h) => h.position === handlePosition
    // // );

    let handle = {
        width: 100,
        height: 100,
        x: 0,
        y: 0,
    }

    let offsetX = handle.width / 2;
    let offsetY = handle.height / 2;

    // this is a tiny detail to make the markerEnd of an edge visible.
    // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
    // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
    switch (handlePosition) {
        case Position.Left:
            offsetX = 0;
            break;
        case Position.Right:
            offsetX = handle.width;
            break;
        case Position.Top:
            offsetY = 0;
            break;
        case Position.Bottom:
            offsetY = handle.height;
            break;
    }

    let x = 0 
    if (node?.positionAbsolute?.x)
        x = node.positionAbsolute.x + handle.x + offsetX
    let y = 0
    if (node?.positionAbsolute?.y)
        y = node.positionAbsolute.y + handle.y + offsetY

    return [x, y];
}

function getNodeCenter(node: Node) {
    // return {
    //     x: node?.positionAbsolute?.x? + node?.width? / 2,
    //     y: node?.positionAbsolute?.y? + node.height / 2,
    // };

    return {    
        x: 0,
        y: 0,
    }
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: Node, target: Node) {
    const [sx, sy, sourcePos] = getParams(source, target);
    const [tx, ty, targetPos] = getParams(target, source);

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
    };
}
