// import styles from "./prompt_overlay.module.scss"
import { Classes, Menu, MenuItem } from "@blueprintjs/core";

interface MenuTestProps {
    className?: string;
    children?: React.ReactNode;
    refresh: () => void;
    copied: (title: string, msg: string) => void;
    prompt_text: string;
    prompt_neg_text: string;
}

export const MenuTest = ({
    className,
    children,
    refresh,
    copied,
    prompt_text,
    prompt_neg_text,
}: MenuTestProps) => {

    let copy_prompt = () => {
        navigator.clipboard.writeText(prompt_text)
        copied("copied", "prompt");
    }

    let copy_neg_prompt = () => {
        navigator.clipboard.writeText(prompt_neg_text)
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
                        <MenuItem icon="clipboard" text={`Prompt: ${prompt_text}`} onClick={copy_prompt} />
                        <MenuItem icon="clipboard" text={`Negative prompt: ${prompt_neg_text}`} onClick={copy_neg_prompt} />
                        <MenuItem icon="refresh" text="refresh" onClick={refresh} />
                    </>
                )}
            />
        </Menu>
    );
};
