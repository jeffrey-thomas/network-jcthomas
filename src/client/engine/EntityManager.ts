import { EntityData } from "../../shared/entities/EntityData"
import { Explosion } from "../../shared/entities/Explosion"
import { Audio } from "./audio"
import { Rectangle } from "../../shared/geometry"
import { Clock } from "./timing"


/** Handles manipulating the scene */
export class EntityManager {

    /** All of the entities in the scene grouped by type */
    private _entities: EntityData = {
        players: {},
        bullets: [],
        wave: {
            enemyCount: 0,
            enemies: [],
            path: (_t) => { return { x: 0, y: 0 } },
            duration: 0
        },
        bombs: []
    }

    private _explosions: Explosion[] = []

    /** plain constructor */
    constructor() { }

    /** all of the entities being managed */
    get entities() { return this._entities }
    /** all of the explosions being managed */
    get explosions() { return this._explosions }

    /**
     * Update entities based on data from server
     * @param data data from server
     */
    updateEntities(data: EntityData) {
        this._entities = data
    }

    /**
     * Remove a player object
     * @param id the id of the player to remove
     */
    removePlayer(id: string) {
        delete this.entities.players[id]
    }

    /**
     * Create an explosion object
     * @param position where to create the explosion
     */
    createExplosion(position: Rectangle) {
        const explosion: Explosion = {
            position: {
                x: position.x - 16,
                y: position.y - 16,
                w: 64,
                h: 64
            },
            frame: 0
        }

        Audio.playSound(Audio.EXPLOSION)

        //Advance the explosions frame every 20ms
        Clock.setTimer({
            action: () => { explosion.frame += 1 },
            duration: 20,
            count: 12
        })
        //Delete the explosion after animation is over
        Clock.setTimer({
            action: () => {
                this._explosions.shift()
            },
            duration: 240,
            count: 1
        })

        this._explosions.push(explosion)
    }
}