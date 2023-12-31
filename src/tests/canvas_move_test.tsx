import React from 'react';
import { Viewport } from 'reactflow';


export const onMoveStart = (event: MouseEvent | TouchEvent, viewport: Viewport): void => {
    console.log('!!! Move Start')
    console.log(viewport)
}
export const onMove = (event: MouseEvent | TouchEvent, viewport: Viewport): void => {
    console.log('!!! Move !!!')
}
export const onMoveEnd = (event: MouseEvent | TouchEvent, viewport: Viewport): void => {
    console.log('!!! Move End')
}


class HoldInterval{
    public this_interval: NodeJS.Timer | null = null;
}

export type moveCB = (x: number, y: number, dur: number) => void;

export class MoveObserver{
    private timestump: number = 0;
    private lastX: number = 0;
    private lastY: number = 0;

    private speedX: number = 0;
    private speedY: number = 0;

    private projectedX: number = 0;
    private projectedY: number = 0;


    private static instance: MoveObserver;
    private moveCB: moveCB [] = [];

    public static getInstance(): MoveObserver {
        if (!MoveObserver.instance){
            MoveObserver.instance = new MoveObserver();
        }

        return MoveObserver.instance;
    }

    public setCb(cb: moveCB): void{
        if (this.moveCB.length == 0)
            this.moveCB.push(cb);
    }

    public onMoveStart = (event: MouseEvent | TouchEvent, viewport: Viewport): void => {
        // console.log('!!! Move Start')
        this.timestump = Date.now();
        this.lastX = viewport.x;
        this.lastY = viewport.y;
    }
    public onMove = (event: MouseEvent | TouchEvent, viewport: Viewport): void => {
        let now = Date.now();
        let dt = now - this.timestump;

        let nowX = viewport.x;
        let nowY = viewport.y;

        let dx = nowX - this.lastX;
        let dy = nowY - this.lastY;

        this.speedX = dx / dt;
        this.speedY = dy / dt;

        this.lastX = nowX;
        this.lastY = nowY;
        this.timestump = now;
    }
    public onMoveEnd = (event: MouseEvent | TouchEvent, viewport: Viewport): void => {
        let dt = 0.025 // 40FPS
        let holder: HoldInterval = new HoldInterval();
        this.projectedX = viewport.x;
        this.projectedY = viewport.y;

        let interval = setInterval(() => {
            let dumping = 0.99 * dt;
            this.speedX *= (1-dumping);
            this.speedY *= (1-dumping);

            if(Math.abs(this.speedX) < 0.1)
                this.speedX = 0;

            if(Math.abs(this.speedY) < 0.1)
                this.speedY = 0;

            if(this.speedX == 0 && this.speedY == 0){
                if(holder.this_interval){
                    clearInterval(holder.this_interval);
                    holder.this_interval = null;
                    return;
                }
            }

            this.projectedX += this.speedX * dt * 1000;
            this.projectedY += this.speedY * dt * 1000;

            if(this.moveCB.length > 0)
                this.moveCB[0](this.projectedX, this.projectedY, dt*1000)

            // console.log('speedX', this.speedX, 'speedY', this.speedY)


        }, dt*1000);

        holder.this_interval = interval;
    }
}
