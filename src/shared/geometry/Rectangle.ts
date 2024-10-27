export type Rectangle={
    x:number,
    y:number,
    w:number,
    h:number,
}

export namespace Rectangle{
    /**
     * Determine if two rectangles intersect
     * @param r1 first rectangle
     * @param r2 second rectangle
     * @returns whether the rectangles intersect
     */
    export const intersect=(r1:Rectangle,r2:Rectangle)=>{
        return r1.x+r1.w > r2.x && r2.x+r2.w > r1.x && r1.y+r1.h > r2.y && r2.y+r2.h > r1.y
    }
}