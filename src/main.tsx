import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/table/lib/css/table.css';
import { init_processors } from './logic/request_processing/00_init';
import { fix_initial_node } from './tests/fix_first_node';

init_processors();
// await fix_initial_node();

// document.addEventListener('keydown', (event) => {
//     console.log(`Key pressed: ${event.key}, COde: ${event.code}`);
// });

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root') as HTMLElement,
);


