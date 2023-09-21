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

    const {isAuthenticated, isConnected, userId } = useServerContext();

    const [auth, setAuth] = useState(false)
    const [user_id, setUserId] = useState('')
    const [connected, setConnected] = useState(false);

    let auth_text = isAuthenticated ? 'Authenticated' : 'Not authenticated'
    let auth_class = isAuthenticated ? styles_shered.grean_text : styles_shered.red_text;

    let connect_text = isConnected ? 'Connected' : 'Not connected'
    let connect_class = isConnected ? styles_shered.grean_text : styles_shered.red_text;

    let user_id_text = isAuthenticated ? userId : '---'

    const try_to_login = (event: React.ChangeEvent<HTMLSelectElement>) => {

        console.log("try_to_login", isConnected)
        if (!isConnected){
            return;
        }

        let password = event.target.value;
        UserModule.getInstance().setPasswd(password)
        UserModule.getInstance().askForAuth()
    };

    console.log("InfoPanel", isConnected)

    return (
        <div className={Classes.ELEVATION_1} style={{ padding: "10px" }}>
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
        </div>
    );
};

import { OverlayToaster } from "@blueprintjs/core";
import { ClientServerBridge } from "../logic/ClientServerBridge";
import { useServerContext } from "./SocketProvider";


export const NotificationToster = OverlayToaster.create({
    className: "recipe-toaster",
    position: Position.BOTTOM,
});


export const SyncInfoToster = OverlayToaster.create({
    className: "recipe-toaster",
    position: Position.TOP,
});

