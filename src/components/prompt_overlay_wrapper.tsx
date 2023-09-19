import styles from "./prompt_overlay.module.scss"
import styles_shered from "./shered_styles.module.scss"
import { Classes, Slider } from "@blueprintjs/core";
import { Button, TextArea, Label, NumericInput, Switch } from "@blueprintjs/core";
import { Overlay, H3, PortalProvider, Intent } from "@blueprintjs/core";
import { Code } from "@blueprintjs/icons";
import classNames from "classnames";
import { useState } from "react";

import { textAreaEditor } from "../logic/editor-helper";
import { img2img, img64, promptConfig, txt2img } from "../types/03_sd_t";
import { progress } from "../types/02_serv_t";
import { PromptOverlay } from "./prompt_overlay";
import { ClientServerBridge } from "../logic/ClientServerBridge";
import { prompt_to_img2img, prompt_to_txt2img } from "../logic/dono_utils";

interface RecipeOverlayWrapperProps {
    className?: string;
    children?: React.ReactNode;
    title: string;
    on_close: () => void;
    on_progress: (prog_val: number) => void;
    on_img_complete: (web_img64: img64) => void;
    on_prompt_complete: (prompt: promptConfig) => void;
    ovelay_prompt: promptConfig;
    overlay_img: img64;
    edit_cond: boolean;
}

export const RecipeOverlayWrapper = ({
    className,
    children,
    title,
    on_close,
    on_progress,
    on_img_complete,
    on_prompt_complete,
    ovelay_prompt,
    overlay_img,
    edit_cond
}: RecipeOverlayWrapperProps) => {

    
	const on_generation_progress = (progr: progress) => {
		on_progress(progr.progress.value);
	}


	const on_txt2img_generation_finish = (result: txt2img) => {
		let web_img64 = result.txt2img.bulk.img;
		on_img_complete(web_img64)
	}
	const on_img2img_generation_finish = (result: img2img) => {
		let web_img64 = result.img2img.bulk.img;
    }
		

	let startTxt2img = (prompt: promptConfig) => {
		on_close();
		if (!edit_cond)
			return
		
		on_prompt_complete(prompt)
		ClientServerBridge.getInstance()
			.send_txt2img(prompt_to_txt2img(prompt), on_generation_progress, on_txt2img_generation_finish)
	}

	let startImg2img = (prompt: promptConfig, img_id: number) => {
		on_close();
		if (!edit_cond)
			return

		on_prompt_complete(prompt)
		ClientServerBridge.getInstance()
			.send_img2img(prompt_to_img2img(prompt, img_id), on_generation_progress, on_img2img_generation_finish)
	}


    return (
        <div>
            <PromptOverlay
                onClose={on_close}
                onTxt2img={startTxt2img}
                onImg2img={startImg2img}
                title={'Image prompt options'}
                init_cfg={ovelay_prompt}
                img_cfg={overlay_img}
            />
        </div>
    );
};
