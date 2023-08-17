import React, { memo, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import styles from './s.module.scss';
import { Button, Classes, Intent, Menu, MenuDivider, MenuItem, Popover, ProgressBar, Spinner } from '@blueprintjs/core';
import { useServerContext } from '../../../server/SocketProvider';
import { ClientServerBridge } from '../../../../logic/ClientServerBridge';
import { PromptOverlay } from '../../../overlayes/delete-overlay/prompt_overlay';

import { img64, txt2img_config, default_txt2img_config } from '../../../../types/types_serv_comm';

interface CustomNodeData {
	label: string;
	roll: number;
}

const _PromptNode = ({ data }: NodeProps<CustomNodeData>) => {
	// const {txt2imgHandle, txt2imgResultHandle, setTxt2imgResultHandle} = useServerContext();
	const {isAuthenticated} = useServerContext();

	const [txt2img_config, setTxt2img_config] = useState(default_txt2img_config);

	const [generated, setGenerated] = React.useState(false);
    const [generating, setGenerating] = React.useState(false);
	const [showOoverlay, setShowOverlay] = useState(false);
	const [img64data, setImg64data] = useState('');
	const [progress, setProgress] = useState(0.0);

    let startGeneration = (t2i_cfg:txt2img_config ) => {
		setTxt2img_config(t2i_cfg);
        setGenerating(true);
		
		let onProgress = (progress: number) => {
			setProgress(progress);
		}

		let onFinished = (data: img64) => {
			let prefix = `data:image/${data.mode};base64,`
			setImg64data(prefix + data.img64);
			setGenerating(false);
			setGenerated(true);
			setProgress(0.0);

		}

		let bridge = ClientServerBridge.getInstance();
		bridge.send_txt2_img(t2i_cfg)
		bridge.onText2imgResult.push(onFinished);
		bridge.onText2imgProgress.push(onProgress);
    }

    let click_2 = () => {
		setShowOverlay(true);
    }

	let oberlay_btn = !generated ?
		<Button onClick={click_2} disabled={generating} rightIcon="edit" intent={Intent.PRIMARY}>
			Describe
		</Button>
		:null

	let prompt_overlay = showOoverlay ? 
		<PromptOverlay 
			onClose={() => setShowOverlay(false)}
			onGenerate={startGeneration}
			title={'Txt2img options'} /> 
		: null;

	let progress_bar = generating ?
	 	<ProgressBar value={progress} />
		: null;
	let generated_img = generated ? 
		<img className={styles.limited_size_img}
			src={img64data} /> 
		: null;

	let display_content = <div>
			<div> {isAuthenticated ? "authenticated" : "not authenticcated"}</div>
            {oberlay_btn}
			{prompt_overlay}
			{generated_img}
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
				Stable diffusion XL txt2img
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
