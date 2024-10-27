import { Server, Socket } from "socket.io"
import { EntityData } from "../shared/entities/EntityData"
import { Rectangle } from "../shared/geometry"
import { waves } from "./Waves"

/** Represents 1 instance of the game */
export class Game {



    /** Boundaries of the game screen */
    private readonly bounds = {
        x: 0,
        y: 0,
        w: 640,
        h: 480
    }

    private readonly tickRate = 15

    /** All of the entities currently in the game */
    private _entities: EntityData
    /** the Socket.IO server to use to communicate with client */
    private _io: Server
    /** The six letter id of this game */
    private _id: string
    /** Which wave the players are currently facing */
    private _wave: number = 0
    /** An offset used to make enemies descend from the top of the screen each wave */
    private _enemyOffset = -480

    /**
     * Create a new Game
     * @param io the socket.IO server to use to communicate with clients
     * @param id the gameId for this game
     */
    constructor(io: Server, id: string) {
        this._io = io
        this._id = id

        //Initialize entities
        this._entities = {
            players: {},
            bullets: [],
            wave: { ...waves[0] },
            bombs: [],
        }

        //Update all entities and send info to client every tickRate ms
        setInterval(() => { this.onTick() }, this.tickRate)
    }

    /** the number of players connected to this game */
    get playerCount() { return Object.keys(this._entities.players).length }
    /** List of connected player ids */
    get playerList() { return Object.keys(this._entities.players) }

    /**
     * Check if a certain playerId is part of this game
     * @param playerId the id to check
     * @returns whether a player with the given id is part of this game
     */
    hasPlayer(playerId: string) {
        return this._entities.players[playerId] !== undefined
    }



    /**
     * Handle when a new player connects
     * @param socket the socket that the player connected to
     */
    onConnect(socket: Socket) {
        //Create the player entity at a random location and send info to all players
        this._entities.players[`${socket.id}`] = {
            position: {
                x: Math.floor(640 * Math.random()),
                y: 432,
                w: 32,
                h: 32
            },
            color: this.playerCount,
            name: `Player ${this.playerCount + 1}`,
            ready: false,
        }

        this._io.to(this._id).emit('updateEntities', this._entities)

        //When this player indicates they are ready
        socket.on('ready', () => {
            if (!this._entities.players[socket.id]) { return }
            this._entities.players[socket.id].ready = true

            //Check if all players are ready
            let ready = true
            Object.keys(this._entities.players).forEach((id) => {
                if (!this._entities.players[id].ready) {
                    ready = false
                }
            })
            if (ready) {
                this.beginWave(this._wave++)
            }
        })

        //When this player sends a 'click' message
        socket.on('click', () => {
            //Ignore if dead
            if (!this._entities.players[socket.id]) { return }

            //Create a bullet entity
            this._entities.bullets.push({
                position: {
                    x: this._entities.players[socket.id].position.x + this._entities.players[socket.id].position.w / 2 - 4,
                    y: this._entities.players[socket.id].position.y,
                    w: 8,
                    h: 16
                },
                owner: socket.id
            })
        })

        //When this player sends a 'mouseMove' event
        socket.on('mouseMove', (movementX: number) => {
            //Ignore if dead
            if (!this._entities.players[socket.id]) { return }

            //Move the player entity
            this._entities.players[socket.id].position.x += movementX
            this._entities.players[socket.id].position.x = Math.min(this.bounds.x + this.bounds.w - 32, Math.max(this.bounds.x, this._entities.players[socket.id].position.x))
        })
    }

    onDisconnect(socket: Socket) {
        delete this._entities.players[socket.id]
        this._io.to(this._id).emit('removePlayer', socket.id)
        socket.removeAllListeners('mouseMove')
        socket.removeAllListeners('click')
        socket.removeAllListeners('ready')
    }

    /** Update entities and send their info to clients */
    private onTick() {

        //Move Bullets
        this._entities.bullets.forEach((bullet) => {
            bullet.position.y -= 480 * (this.tickRate / 1000)
        })

        //Move Bombs
        this._entities.bombs.forEach((bomb) => {
            bomb.position.y += 480 * (this.tickRate / 1000)
        })

        //Check if oldest bullets are off screen
        while (this._entities.bullets.length > 0 && this._entities.bullets[0].position.y < -8)
            this._entities.bullets.shift()

        //Check if bombs are off screen
        this._entities.bombs.forEach((bomb)=>{
            if(bomb.position.y>this.bounds.h+16)
                this._entities.bombs = this._entities.bombs.filter(b=>b!==bomb)
        })

        //Bring enemies down from top of screen at beginning of wave
        if (this._enemyOffset < 0)
            this._enemyOffset += 480 * (this.tickRate / 1000)

        //Handle Enemies
        if (this._entities.wave.enemies) {
            this._entities.wave.enemies.forEach((enemy) => {

                //Motion
                const pathPoint = (enemy.pathPoint + this.tickRate / this._entities.wave.duration) % 1
                const pos = this._entities.wave.path(pathPoint)
                enemy.position.x = pos.x
                enemy.position.y = pos.y + this._enemyOffset
                enemy.pathPoint = pathPoint

                //Firing              
                if (enemy.fireDelay <= 0) {
                    enemy.charge += this.tickRate / 100
                } else {
                    enemy.fireDelay -= this.tickRate
                }

                if (enemy.charge > 4) {
                    enemy.charge = 0
                    enemy.fireDelay = 2000 + Math.random() * 2000
                    this._entities.bombs.push({
                        position: {
                            x: enemy.position.x + 6,
                            y: enemy.position.y + 18,
                            w: 20,
                            h: 14
                        }
                    })
                }

            })
        }

        //Check for collisions
        this.checkCollisions()

        //check if wave defeated
        if (this._entities.wave.enemies && this._entities.wave.enemies.length === 0 && this._wave < waves.length)
            this.beginWave(this._wave++)

        //Send updated info
        this._io.to(this._id).emit('updateEntities', this._entities)

    }

    /** Check for collisions between bullets and enemies and between bombs and players */
    checkCollisions() {
        //bullet-enemy collisions
        this._entities.bullets.forEach((bullet) => {
            if (this._entities.wave.enemies) {
                this._entities.wave.enemies.forEach((enemy) => {
                    if (Rectangle.intersect(bullet.position, enemy.position)) {
                        this._entities.wave.enemies = this._entities.wave.enemies!.filter(e => e !== enemy)
                        this._entities.bullets = this._entities.bullets.filter(b => b !== bullet)
                        this._io.to(this._id).emit('explosion', enemy.position)
                    }
                })
            }
        })
        //bomb-player collisions
        this._entities.bombs.forEach((bomb) => {
            Object.keys(this._entities.players).forEach((playerId) => {
                if (Rectangle.intersect(bomb.position, this._entities.players[playerId].position)) {
                    this._entities.bombs = this._entities.bombs.filter(b => b !== bomb)
                    this._io.to(this._id).emit('death', { id: playerId, player: this._entities.players[playerId] })
                    delete this._entities.players[playerId]
                    //Check for gameover
                    if (Object.keys(this._entities.players).length === 0) {
                        this._io.to(this._id).emit('gameover')
                    }
                }
            })
        })
    }

    /**
     * Begin the nth wave
     * @param n the wave to begin
     */
    beginWave(n: number) {
        this._enemyOffset = -480
        this.populateWave(n)
        this._io.to(this._id).emit('beginWave', n + 1)
    }

    /**
     * Populate the list of enemies for the nth wave
     * @param n the wave to populate
     */
    populateWave(n: number) {
        const wave = { ...waves[n] }
        wave.enemies = []
        //Initialize group of enemies
        for (let i = 0; i < wave.enemyCount; i++) {
            const pos = wave.path(i / wave.enemyCount)
            wave.enemies.push({
                position: {
                    x: pos.x,
                    y: pos.y + this._enemyOffset,
                    w: 32,
                    h: 32
                },
                charge: 0,
                fireDelay: 2000 + Math.random() * 2000,
                pathPoint: i / wave.enemyCount
            })
        }
        this._entities.wave = wave
    }
}