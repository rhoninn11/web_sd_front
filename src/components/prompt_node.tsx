import styles from './prompt_node.module.scss';
import styles_shered from "./shered_styles.module.scss"

import React, { memo, useEffect, useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';

import { Button, Classes, Intent, ProgressBar } from '@blueprintjs/core';
import { useServerContext } from './SocketProvider';
import { ClientServerBridge } from '../logic/ClientServerBridge';
import { PromptOverlay } from './prompt_overlay';
import { cloneDeep, set } from 'lodash';

import { NodeData, NodeConnData, PromptReference } from '../types/01_node_t';
import { progress } from '../types/02_serv_t';

import { DBImg, img2img, img64, promptConfig, txt2img } from '../types/03_sd_t';

import { addDBImg, editDBNode, getDB, getDBImg, getDBNode } from '../logic/db';
import { MenuTest } from './menu_test';
import { UpdateNodeSync } from '../logic/UpdateNodeSync';
import { T2iOprionals } from '../types/types_db';
import { is_prompt_empty, prompt_to_img2img, prompt_to_txt2img } from '../logic/dono_utils';
import classNames from 'classnames';



const _PromptNode = ({ data }: NodeProps<NodeConnData>) => {
	const { isAuthenticated } = useServerContext();

	const [initPrompt, setInitPrompt] = useState(new promptConfig());
	const [resultPrompt, setResultPrompt] = useState(new promptConfig());

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
		setResultPrompt(prompt_ref.prompt);

		let result_img_id = prompt_ref.prompt_img_id;
		if (result_img_id == -1)
			return;

		await getDBImg(result_img_id).then((img) => {
			setResultImg(img.img);
			setHasResultImg(true);
			setGenerated(true);
		});

		return;
	}

	const setup_sample_init_prompt = () => {
		let sample_prompt = new promptConfig();
		sample_prompt.prompt = "Cozy italian vilage";
		sample_prompt.prompt_negative = "Boring sky";
		setInitPrompt(sample_prompt);
	}

	const tryFetchInitialData = async () => {
		let init_node_id = data.node_data.initial_node_id;
		if (init_node_id == -1) {
			setup_sample_init_prompt();
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
			await tryFetchInitialData()
			await tryFetchResultData(prompt_ref)
		};

		fetchData();
	}, []);

	let ShowPromptOverlay = () => {
		setShowOverlay(true);
	}

	let oberlay_btn = !generated && !generating ?
		<Button onClick={ShowPromptOverlay} disabled={generating} rightIcon="edit" intent={Intent.PRIMARY}>
			Describe
		</Button>
		: null


	let startTxt2img = (prompt: promptConfig) => {
		setShowOverlay(false);
		setResultPrompt(prompt);
		result_prompt_save2db(prompt);
		setGenerating(true);

		let on_gen_progress = (progr: progress) => {
			setProgress(progr.progress.value)
		}
		
		let on_gen_finish = (result: txt2img) => {
			let web_img64 = result.txt2img.bulk.img;
			result_img_save2db(web_img64);

			setGenerating(false);
			setGenerated(true);
			setProgress(0.0);
		}

		ClientServerBridge.getInstance()
			.send_txt2img(prompt_to_txt2img(prompt), on_gen_progress, on_gen_finish)
	}

	let startImg2img = (prompt: promptConfig, img_id: number) => {
		setShowOverlay(false);
		setResultPrompt(prompt);
		result_prompt_save2db(prompt);
		setGenerating(true);

		let on_gen_progress = (progr: progress) => {
			setProgress(progr.progress.value)
		}
		
		let on_gen_finish = (result: img2img) => {
			let web_img64 = result.img2img.bulk.img;
			result_img_save2db(web_img64);

			setGenerating(false);
			setGenerated(true);
			setProgress(0.0);
		}

		ClientServerBridge.getInstance()
			.send_img2img(prompt_to_img2img(prompt, img_id), on_gen_progress, on_gen_finish)
	}


	let overlay_prompt = is_prompt_empty(resultPrompt) ? initPrompt : resultPrompt;
	let prompt_overlay = showOoverlay ? <PromptOverlay
		onClose={() => setShowOverlay(false)}
		onTxt2img={startTxt2img}
		onImg2img={startImg2img}
		title={'Image prompt options'}
		init_cfg={overlay_prompt}
		img_cfg={initImg}
		/>
		: null



	let progress_bar = generating ?
		<ProgressBar value={progress} />
		: null;



	const classes_img_preview = classNames(
		styles_shered.smaller_img,
		Classes.SKELETON,
	)
	const classes_img = classNames(
        styles_shered.smaller_img,
        styles_shered.prettier_img,
    );

	let img_preview = generating ? <div className={classes_img_preview}/> : null
	let generated_img = generated ?
		<img className={classes_img}
			src={resultImg.img64} />
		: img_preview;



	let display_content = <div>
		<div> {isAuthenticated ? "authenticated" : "not authenticcated"}</div>
		{oberlay_btn}
		{prompt_overlay}
		{generated_img}
		{progress_bar}
	</div>

	let bigger_handl_style = { background: '#784be8', width: "15px", height: "30px", borderRadius: "3px" };
	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				style={bigger_handl_style}
				onConnect={(params) => console.log('handle onConnect left', params)}
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
				style={bigger_handl_style}
				isConnectable={true}
			/>
		</>
	);
}

export const PromptNode = memo(_PromptNode);


