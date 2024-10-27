import { Bomb } from "./Bomb";
import { Bullet } from "./Bullet";
import { EnemyWave } from "./EnemyWave";
import { Player } from "./Player";

export type EntityData={
    players:{[key in string]:Player},
    bullets:Bullet[],
    wave:EnemyWave,
    bombs:Bomb[],
}