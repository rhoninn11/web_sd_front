import { Overlay, Classes, H3, Button, Intent, Card, PortalProvider, TextArea, Label, NumericInput } from "@blueprintjs/core";
import { Code } from "@blueprintjs/icons";
import classNames from "classnames";
import { useState } from "react";

import styles from "./s.module.scss"
import { textAreaEditor } from "../../../logic/editor-helper";
import { txt2img_config } from "../../../types/types_serv_comm";

interface RecipeOverlayProps {
    className?: string;
    children?: React.ReactNode;
    title: string;
    onClose?: () => void;
    onGenerate?: (t2i_cfg: txt2img_config) => void;
    init_cfg: txt2img_config;
}

export const PromptOverlay = ({
    className,
    children,
    title,
    onClose,
    onGenerate,
    init_cfg,
}: RecipeOverlayProps ) => {
    
    let base_cfg = init_cfg;
    const [visible, setVisible] = useState(true);
    const [prompt, setPrompt] = useState<string>(base_cfg.prompt)
    const [negPrompt, setNegPrompt] = useState<string>(base_cfg.prompt_negative)
    const [seed, setSeed] = useState<number>(base_cfg.seed)

    const classes = classNames(
        Classes.CARD,
        Classes.ELEVATION_4,
        Classes.DARK,
        styles.elo
    );

    const _cfg_gen = () =>{
        let cfg: txt2img_config = {
            prompt: prompt,
            prompt_negative: negPrompt,
            seed: seed,
            samples: 1
        }
        return cfg;
    }

    const _on_close = () => {
        setVisible(false);
        if (onClose)
            onClose();
    }

    const _on_generate = () => {
        setVisible(false);
        if (onGenerate)
            onGenerate(_cfg_gen());
    }

    const sampleDialog = (
        <PortalProvider portalClassName={Classes.DARK}>
            <Overlay onClose={_on_close} className={Classes.OVERLAY_SCROLL_CONTAINER} isOpen={visible}>
                <div className={classes}>
                    <H3>{title}</H3>
                    <Label>
                        Prompt
                        <TextArea className={styles.higher}
                            value={prompt} onChange={(ev) => textAreaEditor(ev, setPrompt)}/>
                    </Label>
                    <Label>
                        Negative Prompt
                        <TextArea className={styles.higher}
                            value={negPrompt} onChange={(ev) => textAreaEditor(ev, setNegPrompt)}/>
                    </Label>
                    <NumericInput
                        min={0}
                        max={100}
                        value={seed}
                        onValueChange={(value) => setSeed(value)}
                        />

                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button intent={Intent.DANGER} onClick={_on_close} style={{ margin: "" }}>
                            Cancel
                        </Button>
                        <Button intent={Intent.SUCCESS} onClick={_on_generate} style={{ margin: "" }}>
                            Generate
                        </Button>
                    </div>
                </div>
            </Overlay>
        </PortalProvider>
    )

    return (
        <div>
            {sampleDialog}
        </div>
        );
};
