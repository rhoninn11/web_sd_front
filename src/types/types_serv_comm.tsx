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

export const default_txt2img_config: txt2img_config = {
    prompt: "romantic evening in small itally town, pastel painting",
    prompt_negative: "borign sky",
    seed: 0,
    samples: 1
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

export interface GenData {
	propmt_cfg: txt2img_config
	img_coded: string
}

export const default_GenData: GenData = {
    propmt_cfg: default_txt2img_config,
    img_coded: ''
}