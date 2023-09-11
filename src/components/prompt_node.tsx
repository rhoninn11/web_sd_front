import styles from './prompt_node.module.scss';
import React, { memo, useEffect, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';

import { Button, Intent, ProgressBar } from '@blueprintjs/core';
import { useServerContext } from './SocketProvider';
import { ClientServerBridge } from '../logic/ClientServerBridge';
import { PromptOverlay } from './prompt_overlay';
import { cloneDeep, set } from 'lodash';

import { NodeData, NodeConnData, PromptReference } from '../types/01_node_t';
import { DBImg, img64, promptConfig } from '../types/03_sd_t';

import { addDBImg, editDBNode, getDB, getDBImg, getDBNode } from '../logic/db';
import { MenuTest } from './menu_test';
import { UpdateNodeSync } from '../logic/UpdateNodeSync';



const _PromptNode = ({ data }: NodeProps<NodeConnData>) => {
	const { isAuthenticated } = useServerContext();


	const [initPrompt, setInitPrompt] = useState(new promptConfig());
	const [resultPrompt, setResultprompt] = useState(new promptConfig());

	const [generated, setGenerated] = React.useState(false);
	const [generating, setGenerating] = React.useState(false);
	const [showOoverlay, setShowOverlay] = useState(false);
	const [progress, setProgress] = useState(0.0);

	const [initImg, setInitImg] = useState(new img64());
	const [hasInitImg, setHasInitImg] = useState(false);
	const [resultImg, setResultImg] = useState(new img64());
	const [hasResultImg, setHasResultImg] = useState(false);


	const result_img_save2db = async (web_img64: img64) => {
		await addDBImg(new DBImg().from(web_img64))
		setHasResultImg(true);
		setResultImg(web_img64);

		let db_id = parseInt(data.node_data.id);
		UpdateNodeSync.getInstance().update_result_img(db_id, web_img64.id);
	}

	const result_prompt_save2db = async (prompt: promptConfig) => {
		let db_id = parseInt(data.node_data.id);
		UpdateNodeSync.getInstance().update_result_prompt(db_id, prompt);
	}

	const tryFetchResultData = async (prompt_ref: PromptReference) => {
		console.log("+++ elo", prompt_ref)
		let result_img_id = prompt_ref.prompt_img_id;

		setResultprompt(prompt_ref.prompt);
		if (result_img_id == -1)
			return;

		await getDBImg(result_img_id).then((img) => {
			setResultImg(img.img);
			setHasResultImg(true);
			setGenerated(true);
		});

		return;
	}

	const tryFetchInitialData = async () => {
		let init_node_id = data.node_data.initial_node_id;
		if (init_node_id == -1) {
			let sample_prompt = new promptConfig();
			sample_prompt.prompt = "Cozy italian vilage";
			sample_prompt.prompt_negative = "Boring sky";
			setInitPrompt(sample_prompt);
			return;
		}

		await getDBNode(init_node_id)
			.then((db_node) => {
				let img_id = db_node.result_data.prompt_img_id;
				setInitPrompt(db_node.result_data.prompt);
				if (img_id == -1)
					return;

				getDBImg(img_id).then((img) => {
					setInitImg(img.img);
					setHasInitImg(true);
				});
			});

		return;
	}

	useEffect(() => {
		const fetchData = async () => {
			let prompt_ref = data.node_data.result_data;
			await tryFetchResultData(prompt_ref)

			await tryFetchInitialData()
		};

		fetchData();
	}, []);

	let ShowPromptOverlay = () => {
		setShowOverlay(true);
	}

	let oberlay_btn = !generated ?
		<Button onClick={ShowPromptOverlay} disabled={generating} rightIcon="edit" intent={Intent.PRIMARY}>
			Describe
		</Button>
		: null


	let startGeneration = (prompt: promptConfig) => {
		setShowOverlay(false);
		setResultprompt(prompt);
		result_prompt_save2db(prompt);
		setGenerating(true);

		let onProgress = (progress: number) => {
			setProgress(progress);
		}

		let onFinished = (web_img64: img64) => {
			result_img_save2db(web_img64);

			setGenerating(false);
			setGenerated(true);
			setProgress(0.0);

		}

		let bridge = ClientServerBridge.getInstance();
		bridge.send_txt2_img(prompt)
		bridge.onText2imgResult.push(onFinished);
		bridge.onText2imgProgress.push(onProgress);
	}


	let prompt_overlay = showOoverlay ? <PromptOverlay
		onClose={() => setShowOverlay(false)}
		onGenerate={startGeneration}
		title={'Txt2img options'}
		init_cfg={initPrompt}
		img_cfg={initImg.img64}
		/>
		: null


	let progress_bar = generating ?
		<ProgressBar value={progress} />
		: null;
	let generated_img = generated ?
		<img className={styles.limited_size_img}
			src={resultImg.img64} />
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
				<MenuTest refresh={async () => await tryFetchInitialData()} />
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
