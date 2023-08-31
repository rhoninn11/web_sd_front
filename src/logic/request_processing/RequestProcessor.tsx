import { serverRequest } from "../../types/types_serv_comm"
import { ClientServerBridge } from "../ClientServerBridge";
import { EdgeRequestProcessor } from "./EdgeRequestProcessor";
import { NodeRequestProcessor } from "./NodeRequestProcessor";

export type FinishCB<T> = (data: T) => void;

export class RequestProcessor<T> {
    protected type: string = '';
    protected on_finish: FinishCB<T>[] = [];

    public show_type() {
        console.log('+++ show_type', this.type);
    }

    public match_type(type: string): boolean {
        console.log('+++ match_type', this.type, type);
        return this.type === type;
    }

    public to_server(input: T, on_finish: FinishCB<T>) {
        console.log('+++ to server basic');
    }

    public from_server(req: serverRequest) {
    }

    public input_to_server(input: T) {
        let serv_req: serverRequest = {
            data: JSON.stringify(input),
            type: this.type,
        }

        console.log('+++ input_to_server', serv_req);
        ClientServerBridge.getInstance()
            .sendRequest(serv_req);
    }
}

export class ProcessorRepository {
    protected processors: RequestProcessor<any>[] = [];
    private static instance: ProcessorRepository;

    private constructor() {
    }

    public register_processor(processor: RequestProcessor<any>) {
        this.processors.push(processor);
        processor.show_type();
        return this;
    }
    public static getInstance(): ProcessorRepository {
        if (!ProcessorRepository.instance) {
            ProcessorRepository.instance = new ProcessorRepository();
        }

        return ProcessorRepository.instance;
    }

    public get_processor(type: string): RequestProcessor<any> | undefined {
        let processor = this.processors.find(processor => processor.match_type(type));
        console.log('+++ get_processor', processor);
        return processor
    }
}