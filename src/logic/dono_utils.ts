import { img2img, img64, promptConfig, txt2img } from "../types/03_sd_t";

export const prompt_to_txt2img = (prompt: promptConfig): txt2img => {

    let txt_to_img: txt2img = {
        txt2img: {
            metadata: { id: ''},
            bulk: { img: new img64() },
            config: prompt
        }
    };

    return txt_to_img;
}

export const prompt_to_img2img = (prompt: promptConfig, image_id: number): img2img => {

    let ref_img = new img64()
    ref_img.id = image_id;

    let img_to_img: img2img = {
        img2img: {
            metadata: { id: ''},
            bulk: { img: ref_img },
            config: prompt
        }
    };

    return img_to_img;
}


export const is_prompt_empty = (prompt: promptConfig): boolean => {
    return prompt.prompt === '' && prompt.prompt_negative === '';
}
