import React, { memo, useEffect, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import styles from './s.module.scss';
import { Button, Classes, Intent, Menu, MenuDivider, MenuItem, Popover, ProgressBar, Spinner } from '@blueprintjs/core';
import { useServerContext } from '../../../server/SocketProvider';
import { ClientServerBridge } from '../../../../logic/ClientServerBridge';
import { PromptOverlay } from '../../../overlayes/delete-overlay/prompt_overlay';
import { cloneDeep } from 'lodash';

import { img64, txt2img_config, GenData } from '../../../../types/types_serv_comm';
import { DBNode } from '../../../../types/types_db';
import { editDBFilm, getDBNode } from '../../../../logic/db';

interface PromptNodeData {
	db_id: number;
	label: string;
	higher_level_data: GenData;
}

const _PromptNode = ({ data }: NodeProps<PromptNodeData>) => {
	const {isAuthenticated} = useServerContext();

	const hl_data = data.higher_level_data;
	const [txt2img_config, setTxt2img_config] = useState(cloneDeep(hl_data.propmt_cfg));

	const [generated, setGenerated] = React.useState(false);
    const [generating, setGenerating] = React.useState(false);
	const [showOoverlay, setShowOverlay] = useState(false);
	const [img64data, setImg64data] = useState('');
	const [progress, setProgress] = useState(0.0);

	const set_hl_prompt = (t2i_cfg:txt2img_config ) => {
		console.log('set_hl_prompt')
		hl_data.propmt_cfg = t2i_cfg;
	}
	const set_hl_img = (img_coded: string) => {
		console.log('set_hl_img')
		hl_data.img_coded = img_coded;
	}

	const db_img = async (coded_img64: string) => {
		let db_node = await getDBNode(data.db_id)
		if(db_node){
			db_node.img = coded_img64;
			await editDBFilm(data.db_id, db_node)
			console.log('db_img')
		}
	}

    let startGeneration = (t2i_cfg:txt2img_config ) => {
		setTxt2img_config(t2i_cfg);
		set_hl_prompt(t2i_cfg);

        setGenerating(true);
		
		let onProgress = (progress: number) => {
			setProgress(progress);
		}

		let onFinished = (coded_img64: string) => {
			setImg64data(coded_img64);
			set_hl_img(coded_img64)
			db_img(coded_img64);

			setGenerating(false);
			setGenerated(true);
			setProgress(0.0);

		}

		let bridge = ClientServerBridge.getInstance();
		bridge.send_txt2_img(t2i_cfg)
		bridge.onText2imgResult.push(onFinished);
		bridge.onText2imgProgress.push(onProgress);
    }

    let ShowPromptOverlay = () => {
		setShowOverlay(true);
    }


	useEffect(() => {
		const fetchData = async () => {
			let db_node = await getDBNode(data.db_id)
			if(db_node && db_node.img.length > 0){
				setGenerated(true);
				setImg64data(db_node.img);
				set_hl_img(db_node.img)
			}
		};

		fetchData();
	}, []);

	let oberlay_btn = !generated ?
		<Button onClick={ShowPromptOverlay} disabled={generating} rightIcon="edit" intent={Intent.PRIMARY}>
			Describe
		</Button>
		:null

	let prompt_overlay = showOoverlay ? 
		<PromptOverlay 
			onClose={() => setShowOverlay(false)}
			onGenerate={startGeneration}
			title={'Txt2img options'} 
			init_cfg={txt2img_config}/> 
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
