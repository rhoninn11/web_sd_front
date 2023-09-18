import styles_shered from "./shered_styles.module.scss"
// import styles from "./prompt_overlay.module.scss"
import { Classes, Menu, MenuItem } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { UserModule } from "../logic/UserModule";

interface InfoPanelProps {
    className?: string;
    children?: React.ReactNode;
}

export const InfoPanel = ({
    className,
    children,
}: InfoPanelProps) => {

    const [auth, setAuth] = useState(false)
    const [user_id, setUserId] = useState('')

    let auth_text = auth ? 'Authenticated' : 'Not authenticated'
    let auth_class = auth ? styles_shered.grean_text : styles_shered.red_text;

    let user_id_text = auth ? user_id : '---'

    let auth_check_async_loop = (on_auth: () => void, retry_time: number) => {
        if (UserModule.getInstance().isAuthenticated())
            on_auth();
        else
            setTimeout(() => auth_check_async_loop(on_auth, retry_time), retry_time);
    }

    let on_auth = () => {
        let auth_val = UserModule.getInstance().isAuthenticated()
        let user_id_val = UserModule.getInstance().getUserId()
        setUserId(user_id_val.toString())
        setAuth(auth_val)
    }

    useEffect(() => {
        auth_check_async_loop(on_auth, 100);
    }, []);

    const try_to_login = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let password = event.target.value;
        UserModule.getInstance().setPasswd(password)
        UserModule.getInstance().askForAuth()
      };

    return (
        <Menu className={Classes.ELEVATION_1}>
            <MenuItem
                icon={"paperclip"}
                text="Client info"
                children={(
                    <>
                        <div className={auth_class}>{auth_text}</div>
                        <div>User id: {user_id_text}</div>
                        <select onChange={try_to_login}>
                            <option selected value="none">none</option>
                            <option value="policjantZawodLaskowy51+">usr_0</option>
                            <option value="myszKsztalcenieAgrest80-">usr_1</option>
                            
                        </select>
                        {/* <MenuItem icon="add" text="Add new" />
                        <MenuItem icon="remove" text="Remove" /> */}
                        <MenuItem icon="log-in" text="login" onClick={() => console.log("logins")} />
                    </>
                )}
            />
        </Menu>
    );
};

import { OverlayToaster } from "@blueprintjs/core";
import { Position } from "reactflow";


export const NotificationToster = OverlayToaster.create({
	className: "recipe-toaster",
	position: Position.Bottom,
});


export const SyncInfoToster = OverlayToaster.create({
	className: "recipe-toaster",
	position: Position.Bottom,
});

