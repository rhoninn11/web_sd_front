export interface authData {
	password: string;
	auth: boolean;
}

export interface serverRequest {
	type: string;
	data: string;
}



export interface img64{
    img64: string;
    mode: string;
    x: number;
    y: number;
}

export interface bulk_data{
    img: img64;
}

export interface metadata {
    id: string;
}

export interface txt2img_config {
    prompt: string;
    prompt_negative: string;
    seed: number;
    samples: number;
}

export interface txt2img_content {
    config: txt2img_config
    metadata: metadata;
    bulk: bulk_data;

}

export interface txt2img {
    txt2img: txt2img_content;
}

export interface progress {
    progress: progress_content;
}

export interface progress_content {
    metadata: metadata;
    value: number;
}