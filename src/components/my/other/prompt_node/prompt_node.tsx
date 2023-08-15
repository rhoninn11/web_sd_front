import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import styles from './s.module.scss';
import { Button, Menu, MenuDivider, MenuItem, Popover, Spinner } from '@blueprintjs/core';
import { useServerContext } from '../../../server/SocketProvider';
import { ClientServerBridge } from '../../../../logic/ClientServerBridge';


interface CustomNodeData {
	label: string;
	roll: number;
}

const _PromptNode = ({ data }: NodeProps<CustomNodeData>) => {
	// const {txt2imgHandle, txt2imgResultHandle, setTxt2imgResultHandle} = useServerContext();
	const {isAuthenticated} = useServerContext();
    const [disable, setDisable] = React.useState(false);

    let click = () => {
        console.log('click');
		
        setDisable(true);
		
		let onFinished = (data: any) => {
			setDisable(false);
			console.log('from node');
			console.log(data);
		}

		let bridge = ClientServerBridge.getInstance();
		bridge.send_txt2_img()
		bridge.onText2imgResult.push(onFinished);


    }

	let display_content = <div>
			<div> {isAuthenticated ? "authenticated" : "not authenticcated"}</div>
            <Button onClick={click} disabled={disable} icon="refresh"/>
        </div>

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				style={{ background: '#555' }}
				onConnect={(params) => console.log('handle onConnect', params)}
				isConnectable={true}
			/>
			<div className={styles.nice_box}>
				Custom Color Picker Node: <strong></strong>
				{display_content}
			</div>
			<Handle
				type="source"
				position={Position.Right}
				id="a"
				style={{ background: '#555' }}
				isConnectable={true}
			/>
		</>
	);
}

export const PromptNode = memo(_PromptNode);
