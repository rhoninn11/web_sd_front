import { serverRequest } from "../types/types_serv_comm"

class RequestProcessor {
    protected type: string = '';

    public match_type(type: string): boolean {
        return this.type === type;
    }

    public to_server(){

    }

    public from_server(req: serverRequest){
    }
}

class NodeRequestProcessor extends RequestProcessor {
    constructor() {
        super();
        this.type = 'node';
    }
}


class EdgeRequestProcessor extends RequestProcessor {
    constructor() {
        super();
        this.type = 'edge';
    }
}

export class ProcessorRepository{
    protected processors: RequestProcessor[] = [];
    private static instance: ProcessorRepository;

    private constructor() {
        this.processors.push(new NodeRequestProcessor());
        this.processors.push(new EdgeRequestProcessor());
    }

    public static getInstance(): ProcessorRepository {
        if (!ProcessorRepository.instance){
            ProcessorRepository.instance = new ProcessorRepository();
        }

        return ProcessorRepository.instance;
    }

    public get_processor(type: string): RequestProcessor | undefined {
        return this.processors.find(processor => processor.match_type(type));
    }
}