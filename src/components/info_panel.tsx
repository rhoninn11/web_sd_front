import styles_shered from "./shered_styles.module.scss"
// import styles from "./prompt_overlay.module.scss"
import { Classes, Menu, MenuItem, NumericInput, Position } from "@blueprintjs/core";
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
    const [connected, setConnected] = useState(false);

    let auth_text = auth ? 'Authenticated' : 'Not authenticated'
    let auth_class = auth ? styles_shered.grean_text : styles_shered.red_text;

    let connect_text = connected ? 'Connected' : 'Not connected'
    let connect_class = connected ? styles_shered.grean_text : styles_shered.red_text;

    let user_id_text = auth ? user_id : '---'

    let check_connect_loop = (on_check: () => void, retry_time: number) => {
        on_check();
        setTimeout(() => auth_check_async_loop(on_check, retry_time), retry_time);
    }

    let check_connect = () => {
        let conn = ClientServerBridge.getInstance().isConnected()
        if (conn !== connected){
            setConnected(conn)
        }
    }

    let auth_check_async_loop = (on_auth: () => void, retry_time: number) => {
        on_auth();
        setTimeout(() => auth_check_async_loop(on_auth, retry_time), retry_time);
    }

    let on_auth = () => {
        let auth_val = UserModule.getInstance().isAuthenticated()
        if (!auth_val)
            return;

        let user_id_val = UserModule.getInstance().getUserId()
        setUserId(user_id_val.toString())
        setAuth(auth_val)
    }

    useEffect(() => {
        auth_check_async_loop(on_auth, 100);
        check_connect_loop(check_connect, 100);
    }, []);

    const try_to_login = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let password = event.target.value;
        UserModule.getInstance().setPasswd(password)
        UserModule.getInstance().askForAuth()
      };

    return (
        <Menu className={Classes.ELEVATION_1} style={{width: "200px"}}>
            <MenuItem
                icon={"paperclip"}
                text="Client info"
                children={(
                    <>
                        <div className={connect_class}>{connect_text}</div>
                        <div className={auth_class}>{auth_text}</div>
                        <div>User id: {user_id_text}</div>
                        <select onChange={try_to_login}>
                            <option selected value="none">none</option>
                            <option value="policjantZawodLaskowy51+">usr_0</option>
                            <option value="myszKsztalcenieAgrest80-">usr_1</option>
                            <option value="zukInternetBak39.">usr_2</option>
                            <option value="muzeumRurkaPapier40,">usr_3</option>
                            <option value="filmMyszkaKomputer18+">usr_4</option>
                            <option value="uczenJeziorakKoce36,">usr_5</option>
                            
                        </select>
                        {/* <MenuItem icon="add" text="Add new" />
                        <MenuItem icon="remove" text="Remove" /> */}
                        <MenuItem icon="log-in" text={"login ----------------------------"} onClick={() => console.log("logins")} />
                    </>
                )}
            />
        </Menu>
    );
};

import { OverlayToaster } from "@blueprintjs/core";
import { ClientServerBridge } from "../logic/ClientServerBridge";


export const NotificationToster = OverlayToaster.create({
	className: "recipe-toaster",
	position: Position.BOTTOM,
});


export const SyncInfoToster = OverlayToaster.create({
	className: "recipe-toaster",
	position: Position.TOP,
});

