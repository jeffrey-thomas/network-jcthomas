import { Rectangle } from "../geometry"

export type Player = {
    position: Rectangle,
    color: number,
    name: string,
    ready: boolean,
}