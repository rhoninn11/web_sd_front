import styles from "./prompt_overlay.module.scss"
import { Classes } from "@blueprintjs/core";
import { Button, TextArea, Label, NumericInput, Switch } from "@blueprintjs/core";
import { Overlay, H3, PortalProvider, Intent } from "@blueprintjs/core";
import { Code } from "@blueprintjs/icons";
import classNames from "classnames";
import { useState } from "react";

import { textAreaEditor } from "../logic/editor-helper";
import { promptConfig } from "../types/03_sd_t";

interface RecipeOverlayProps {
    className?: string;
    children?: React.ReactNode;
    title: string;
    onClose?: () => void;
    onGenerate?: (t2i_cfg: promptConfig) => void;
    init_cfg: promptConfig;
    img_cfg: string;
}



export const PromptOverlay = ({
    className,
    children,
    title,
    onClose,
    onGenerate,
    init_cfg,
    img_cfg
}: RecipeOverlayProps) => {

    let base_cfg = init_cfg;
    const [visible, setVisible] = useState(true);
    const [prompt, setPrompt] = useState<string>(base_cfg.prompt)
    const [negPrompt, setNegPrompt] = useState<string>(base_cfg.prompt_negative)
    const [seed, setSeed] = useState<number>(base_cfg.seed)

    const [mode, setMode] = useState<boolean>(false)


    const _cfg_gen = () => {
        let cfg = new promptConfig()
        cfg.prompt = prompt;
        cfg.prompt_negative = negPrompt;
        cfg.seed = seed;
        
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

    const section_classes = classNames(
        Classes.CARD,
        Classes.ELEVATION_4,
        Classes.DARK,
        styles.card,
        styles.wrapper
    );



    const config_column =
        <div className={section_classes}>
            <H3>{title}</H3>
            <Label>
                Prompt
                <TextArea className={styles.higher}
                    value={prompt} onChange={(ev) => textAreaEditor(ev, setPrompt)} />
            </Label>
            <Label>
                Negative Prompt
                <TextArea className={styles.higher}
                    value={negPrompt} onChange={(ev) => textAreaEditor(ev, setNegPrompt)} />
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

    const allow_img2img = img_cfg.length > 0;

    const img_ref_column = allow_img2img ?
        <div className={section_classes}>
            <H3>Image</H3>
            <img src={img_cfg} alt="img_ref" />
        </div>
        : null

    const handleSwitchChange = () => {
        setMode(!mode)
    };

    const fn_row = allow_img2img ?
    <div className={styles.row}>
        <div className={section_classes} onMouseEnter={() => console.log("elo")}>
            <div className={styles.row}>
                <p> <Code /> {!mode ? <b className={styles.selected}>Text To Image</b> : <del>Text To Image</del>} </p>
                <Switch onChange={handleSwitchChange} />
                <p> <Code /> {mode ? <b className={styles.selected}>Image To Image</b> : <del>Image To Image</del>} </p>
            </div>
        </div>
    </div>
    : null



    const island_classes = classNames(
        styles.overlay_island,
        // styles.column
    );


    const sampleDialog = (
        <PortalProvider portalClassName={Classes.DARK}>
            <Overlay onClose={_on_close} className={Classes.OVERLAY_SCROLL_CONTAINER} isOpen={visible}>
                <div className={island_classes}>
                    <div className={styles.wr}>
                        <div className={styles.wc}>
                            {fn_row}
                            <div className={styles.row}>
                                {mode ? img_ref_column : null}
                                {config_column}
                            </div>
                        </div>
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
