import { Vector } from "../geometry"
import { Enemy } from "./Enemy"

export type EnemyWave = {
    enemyCount: number,
    enemies?: Enemy[],
    path: (t: number) => Vector,
    duration: number,
}