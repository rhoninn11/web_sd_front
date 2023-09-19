// import styles from "./prompt_overlay.module.scss"
import { Classes, Menu, MenuItem } from "@blueprintjs/core";
import { promptConfig } from "../types/03_sd_t";

interface MenuTestProps {
    className?: string;
    children?: React.ReactNode;
    refresh: () => void;
    copied: (title: string, msg: string) => void;
    prompt: promptConfig;
}

export const MenuTest = ({
    className,
    children,
    refresh,
    copied,
    prompt,
}: MenuTestProps) => {

    let copy_prompt = () => {
        navigator.clipboard.writeText(prompt.prompt)
        copied("copied", "prompt");
    }

    let copy_neg_prompt = () => {
        navigator.clipboard.writeText(prompt.prompt_negative)
        copied("copied", "negative prompt");
    }


    return (
        <Menu className={Classes.ELEVATION_1}>
            <MenuItem
                icon={"applications"}
                text="Image"
                children={(
                    <>
                        {/* <MenuItem icon="add" text="Add new" />
                        <MenuItem icon="remove" text="Remove" /> */}
                        <MenuItem icon="clipboard" text={`Prompt: \"${prompt.prompt}\"`} onClick={copy_prompt} />
                        <MenuItem icon="clipboard" text={`Negative prompt: \"${prompt.prompt_negative}\"`} onClick={copy_neg_prompt} />
                        <MenuItem icon="refresh" text="refresh" onClick={refresh} />
                    </>
                )}
            />
        </Menu>
    );
};
