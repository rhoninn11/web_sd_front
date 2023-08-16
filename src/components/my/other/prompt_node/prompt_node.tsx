import React, { memo, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import styles from './s.module.scss';
import { Button, Menu, MenuDivider, MenuItem, Popover, ProgressBar, Spinner } from '@blueprintjs/core';
import { useServerContext } from '../../../server/SocketProvider';
import { ClientServerBridge } from '../../../../logic/ClientServerBridge';

import { img64 } from '../../../../types/types_serv_comm';

interface CustomNodeData {
	label: string;
	roll: number;
}

const _PromptNode = ({ data }: NodeProps<CustomNodeData>) => {
	// const {txt2imgHandle, txt2imgResultHandle, setTxt2imgResultHandle} = useServerContext();
	const {isAuthenticated} = useServerContext();
    const [generating, setGenerating] = React.useState(false);
	const [img64data, setImg64data] = useState('');
	const [progress, setProgress] = useState(0.0);

    let click = () => {
        console.log('click');
		
        setGenerating(true);
		
		let onProgress = (progress: number) => {
			console.log('progress: ' + progress);
			setProgress(progress);
		}

		let onFinished = (data: img64) => {

			setGenerating(false);
			setProgress(0.0);
			let prefix = `data:image/${data.mode};base64,`
			setImg64data(prefix + data.img64);
			console.log(data);
		}

		let bridge = ClientServerBridge.getInstance();
		bridge.send_txt2_img()
		bridge.onText2imgResult.push(onFinished);
		bridge.onText2imgProgress.push(onProgress);
    }

	let progress_bar = generating ? <ProgressBar value={progress} /> : null;
	let test_img = img64data.length > 0 ? <img src={img64data} /> : null;
	console.log("length: " + img64data.length)

	let display_content = <div>
			<div> {isAuthenticated ? "authenticated" : "not authenticcated"}</div>
            <Button onClick={click} disabled={generating} icon="refresh"/>
			{test_img}
			{progress_bar}
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
