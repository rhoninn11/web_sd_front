import styles from './prompt_node.module.scss';
import React, { memo, useEffect, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';

import { Button, Intent, ProgressBar} from '@blueprintjs/core';
import { useServerContext } from './SocketProvider';
import { ClientServerBridge } from '../logic/ClientServerBridge';
import { PromptOverlay } from './prompt_overlay';
import { cloneDeep } from 'lodash';

import { NodeData } from '../types/01_node_t';
import { txt2img_config } from '../types/03_sd_t';

import { editDBNode, getDBNode } from '../logic/db';
import { MenuTest } from './menu_test';



const _PromptNode = ({ data }: NodeProps<NodeData>) => {
	const {isAuthenticated} = useServerContext();

	const prompt_data = data.data_prompt;
	const [txt2img_config, setTxt2img_config] = useState(cloneDeep(prompt_data.propmt_cfg));

	const [generated, setGenerated] = React.useState(false);
    const [generating, setGenerating] = React.useState(false);
	const [showOoverlay, setShowOverlay] = useState(false);
	const [img64data, setImg64data] = useState('');
	const [progress, setProgress] = useState(0.0);

	const set_hl_prompt = (t2i_cfg: txt2img_config) => {
		prompt_data.propmt_cfg = t2i_cfg;
	}
	const set_hl_img = (img_coded: string) => {
		prompt_data.img_coded = img_coded;
	}

	const db_img = async (coded_img64: string) => {
		let db_node = await getDBNode(data.db_id)
		if(db_node){
			db_node.img = coded_img64;
			await editDBNode(data.db_id, db_node)
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

	const ShowEditorForFirstTime = () => {
		const render_data = data.data_render;
		setShowOverlay(render_data.fresh);
		render_data.fresh = false;
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
		
		ShowEditorForFirstTime();
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
				onConnect={(params) => console.log('handle onConnect left', params)}
				isConnectable={true}
			/>
			<Handle
				type="target"
				position={Position.Top}
				style={{ background: '#555' }}
				onConnect={(params) => console.log('handle onConnect top', params)}
				isConnectable={true}
			/>
			<div className={styles.nice_box}>
				Stable diffusion XL txt2img
				{display_content}
				<MenuTest test={() => console.log("test")}/>
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
