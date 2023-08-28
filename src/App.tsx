import styles from './App.module.scss';

import { Classes, FocusStyleManager } from '@blueprintjs/core';

import { NavigationBar } from './components/navigation-bar/navigation-bar';
import { CoreExample } from './components/core-example/core-example';
import { SelectExample } from './components/select-example/select-example';
import { DatetimeExample } from './components/datetime-example/datetime-example';
import { PopoverExample } from './components/popover-example/popover-example';
import { Flow } from './components/my/flow_hub';
import classNames from 'classnames';
import { ServerContextProvider} from './components/server/SocketProvider';
import { useEffect, useState } from 'react';
import { set } from 'lodash';


FocusStyleManager.onlyShowFocusOnTabs();

function App() {

    // get the size of the window of browser
    // const [width, height] = useWindowSize();
    let init_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let init_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const [width, setWidth] = useState(init_width);
    const [height, setHeight] = useState(init_height);

    useEffect(() => {
        const resize_fn = () => {
            let new_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let new_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
            setWidth(new_width);
            setHeight(new_height);
        }

        window.addEventListener('resize', resize_fn);

        return () => {
            window.removeEventListener('resize', resize_fn)
        }
    }, []);


    return (
        <div className={classNames(styles.App, Classes.DARK)}>
            {/* <NavigationBar />
            <CoreExample />
            <SelectExample />
            <DatetimeExample />
            <PopoverExample />
            <TestingComponent /> */}
            {/* add inline width and height to div*/}
            <ServerContextProvider>
                {/* <div className={styles.frow}>
                </div> */}
                <div style={{"width": `${init_width}px`, "height": `${init_height}px`}}>
                    <Flow />
                </div>
            </ServerContextProvider>
        </div>
    );
}
export default App;
