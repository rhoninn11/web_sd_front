

import { ProcessorRepository } from './RequestProcessor';
import { AuthRequestProcessor } from './AuthRequestProcessor';
import { NodeRequestProcessor } from './NodeRequestProcessor';
import { EdgeRequestProcessor } from './EdgeRequestProcessor';
import { Txt2ImgRequestProcessor } from "./Txt2ImgRequestProcessor";
import { ProgressRequestProcessor } from "./ProgressRequestProcessor";
import { SyncProcessor } from './SyncProcessor';


export let init_processors = () => {
    ProcessorRepository.getInstance()
        .register_processor(new AuthRequestProcessor())
        .register_processor(new EdgeRequestProcessor())
        .register_processor(new NodeRequestProcessor())
        .register_processor(new Txt2ImgRequestProcessor())
        .register_processor(new ProgressRequestProcessor())
        .register_processor(new SyncProcessor());
}