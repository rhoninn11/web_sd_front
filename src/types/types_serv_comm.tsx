// general
export interface serverRequest {
    type: string;
    data: string;
}

//auth
export interface authData {
	password: string;
	auth: boolean;
}

//txt2img
export class txt2img {
    txt2img: txt2img_content = new txt2img_content();
}

export class txt2img_content {
    config: txt2img_config = new txt2img_config();
    metadata: metadata = new metadata();
    bulk: bulk_data = new bulk_data();

}

export class txt2img_config {
    prompt: string = '';
    prompt_negative: string = '';
    seed: number = 0;
    samples: number = 1;
}


export class metadata {
    id: string = '';
}

export class bulk_data{
    img: img64 = new img64();
}

export class img64{
    img64: string = '';
    mode: string = '';
    x: number = 0;
    y: number = 0;
}


export interface progress {
    progress: progress_content;
}

export interface progress_content {
    metadata: metadata;
    value: number;
}

export class GenData {
	propmt_cfg: txt2img_config = new txt2img_config();
	img_coded: string = '';
}