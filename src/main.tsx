import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/table/lib/css/table.css';
import { ProcessorRepository } from './logic/request_processing/RequestProcessor';
import { NodeRequestProcessor } from './logic/request_processing/NodeRequestProcessor';
import { EdgeRequestProcessor } from './logic/request_processing/EdgeRequestProcessor';

ProcessorRepository.getInstance()
    .register_processor(new NodeRequestProcessor())
    .register_processor(new EdgeRequestProcessor());

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root') as HTMLElement,
);
