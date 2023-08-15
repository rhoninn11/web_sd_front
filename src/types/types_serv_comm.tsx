export interface authData {
	password: string;
	auth: boolean;
}

export interface serverRequest {
	type: string;
	data: string;
}

export interface metadata {
    id: string;
}

export interface bulk {
	img: string;
}

export interface txt2img_config {
    prompt: string;
    prompt_negative: string;
    seed: number;
    samples: number;
}

export interface txt2img_content {
    metadata: metadata;
    config: txt2img_config
	bulk: bulk;
}

export interface txt2img {
    txt2img: txt2img_content;
}