import styles from './App.module.scss';

import { Classes, FocusStyleManager } from '@blueprintjs/core';

import { NavigationBar } from './components/navigation-bar/navigation-bar';
import { CoreExample } from './components/core-example/core-example';
import { SelectExample } from './components/select-example/select-example';
import { DatetimeExample } from './components/datetime-example/datetime-example';
import { PopoverExample } from './components/popover-example/popover-example';
import { Flow } from './components/my/flow';
import classNames from 'classnames';
import { ServerContextProvider} from './components/server/SocketProvider';


FocusStyleManager.onlyShowFocusOnTabs();

function App() {
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
                <div style={{"width": "2000px", "height": "900px"}}>
                    <Flow />
                </div>
            </ServerContextProvider>
        </div>
    );
}
export default App;
