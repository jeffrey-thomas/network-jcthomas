import { Rectangle } from "../geometry"

export type Enemy = {
    position: Rectangle,
    charge: number,
    fireDelay: number,
    pathPoint: number
}