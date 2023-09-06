

import { ProcessorRepository } from './RequestProcessor';
import { NodeRequestProcessor } from './NodeRequestProcessor';
import { EdgeRequestProcessor } from './EdgeRequestProcessor';
import { AuthRequestProcessor } from './AuthRequestProcessor';
import { SyncProcessor } from './SyncProcessor';


export let init_processors = () => {
    ProcessorRepository.getInstance()
        .register_processor(new NodeRequestProcessor())
        .register_processor(new EdgeRequestProcessor())
        .register_processor(new AuthRequestProcessor())
        .register_processor(new SyncProcessor());
}