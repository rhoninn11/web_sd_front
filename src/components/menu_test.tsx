// import styles from "./prompt_overlay.module.scss"
import { Classes, Menu, MenuItem } from "@blueprintjs/core";

interface MenuTestProps {
    className?: string;
    children?: React.ReactNode;
}

export const MenuTest = ({
    className,
    children,
}: MenuTestProps) => {

    return (
        <Menu className={Classes.ELEVATION_1}>
            <MenuItem
                icon={"applications"}
                text="Image"
                children={(
                    <>
                        <MenuItem icon="add" text="Add new" />
                        <MenuItem icon="remove" text="Remove" />
                    </>
                )}
            />
        </Menu>
    );
};
