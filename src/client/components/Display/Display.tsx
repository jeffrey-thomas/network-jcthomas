import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Vector } from "../../../shared/geometry";
import { SpriteId, SpriteManager } from "../../engine/sprites";
import { Clock } from "../../engine/timing";
import { GameStateManager } from "../../engine/GameStateManager";
import { PlayerColors } from "../../engine/players/PlayerColors";
import { Player } from "../../../shared/entities/Player";
import { Bullet } from "../../../shared/entities/Bullet";
import { Bomb } from "../../../shared/entities/Bomb";
import { Enemy } from "../../../shared/entities/Enemy";
import { Explosion } from "../../../shared/entities/Explosion";

export interface DisplayProps {
    width: number,
    height: number
}

/** Displays the game entities on a canvas */
export const Display = forwardRef<HTMLCanvasElement, DisplayProps>(({ width, height }, ref) => {

    //////////////////////////////////////////////////////////////////////
    //State and Setup
    //////////////////////////////////////////////////////////////////////    
    const canvas = useRef<HTMLCanvasElement>(null)

    useImperativeHandle(ref, () => canvas.current!)

    useEffect(() => {
        if (canvas.current)
            document.addEventListener('pointerlockchange', onPointerLockChange)
        Clock.setTimer({ action: renderGame })
    }, [])

    /** Handle the player pressing 'Esc' and pausing */
    const onPointerLockChange = () => {
        //pause
        if (document.pointerLockElement != canvas.current) {
            GameStateManager.pause()
        }
    }
    //////////////////////////////////////////////////////////////////////
    //Render
    //////////////////////////////////////////////////////////////////////

    /**
     * Render a player to the screen
     * @param context CanvasRenderingContext2D to use to draw the player
     * @param player the player to draw
     */
    const renderPlayer = (context: CanvasRenderingContext2D, player: Player, frame: number) => {
        renderSprite(context, SpriteManager.PLAYER, { x: player.position.x, y: player.position.y }, player.color * 2 + frame)
        context.fillStyle = PlayerColors[player.color]
        context.font = "bold 14px verdana, sans-serif"
        context.textAlign = 'center'
        context.fillText(player.name, player.position.x + player.position.w / 2, player.position.y + 42, 64)
    }

    /**
     * Render a bullet to the screen
     * @param context the canvas context to use for drawing
     * @param bullet the bullet to draw
     */
    const renderBullet = (context: CanvasRenderingContext2D, bullet: Bullet) => {
        renderSprite(context, SpriteManager.BULLET, { x: bullet.position.x, y: bullet.position.y })
    }

    /**
     * Render a bomb to the screen
     * @param context the canvas context to use for drawing
     * @param bomb the bomb to draw
     */
    const renderBomb = (context: CanvasRenderingContext2D, bomb: Bomb) => {
        renderSprite(context, SpriteManager.BOMB, { x: bomb.position.x, y: bomb.position.y })
    }

    /**
     * Render an enemy to the screen
     * @param context the canvas context to use for drawing
     * @param enemy the enemy to draw
     */
    const renderEnemy = (context: CanvasRenderingContext2D, enemy: Enemy) => {
        renderSprite(context, SpriteManager.ENEMY, { x: enemy.position.x, y: enemy.position.y }, Math.floor(enemy.charge))
    }

    /**
     * Render an explosion to the screen
     * @param context the canvas context to use for drawing
     * @param explosion the explosion to draw
     */
    const renderExplosion = (context: CanvasRenderingContext2D, explosion: Explosion) => {
        renderSprite(context, SpriteManager.EXPLOSION, { x: explosion.position.x, y: explosion.position.y }, explosion.frame)
    }

    /**
     * Draw a sprite to the screen
     * @param context CanvasRenderingContext2D to use to draw the sprite
     * @param spriteId the id of the sprite to draw
     * @param position the location to draw the sprite
     * @param frame which frame of an animated sprite to draw
     */
    const renderSprite = (context: CanvasRenderingContext2D, spriteId: SpriteId, position: Vector, frame?: number) => {
        const sprite = SpriteManager.get(spriteId)

        if (frame != undefined) {
            const src = sprite.getFrame(frame)
            context.drawImage(
                sprite.img,
                src.x / 2,
                src.y / 2,
                src.w / 2,
                src.h / 2,
                position.x,
                position.y,
                src.w,
                src.h)
        }
        else {
            context.drawImage(
                sprite.img,
                position.x,
                position.y,
                sprite.width,
                sprite.height
            )
        }
    }

    /**
     * Render all of the entities in the game
     * @param timestamp current frame's timestamp, used for animated sprites
     */
    const renderGame = (timestamp: number) => {

        const playerFrame = Math.floor((timestamp / 100) % 2)
        const context = canvas.current?.getContext('2d')
        const entities = GameStateManager.entityManager.entities
        if (context) {

            context.imageSmoothingEnabled = false

            context.drawImage(SpriteManager.get(SpriteManager.BACKGROUND).img, 0, 0, context.canvas.width * devicePixelRatio, context.canvas.height * devicePixelRatio)

            if (GameStateManager.gameId) {
                context.fillStyle = "white"
                context.font = "bold 14px verdana, sans-serif"
                context.textAlign = 'left'
                context.fillText(`Game Id: ${GameStateManager.gameId}`, 8, 16)
            }

            entities.bullets.forEach((bullet) => { renderBullet(context, bullet) })
            entities.bombs.forEach((bomb) => { renderBomb(context, bomb) })
            if (entities.wave.enemies && entities.wave.enemies.length > 0)
                entities.wave.enemies.forEach((enemy) => { renderEnemy(context, enemy) })
            Object.keys(entities.players).forEach((playerId) => {
                renderPlayer(context, entities.players[playerId], playerFrame)
            })

            GameStateManager.entityManager.explosions.forEach((explosion) => {
                renderExplosion(context, explosion)
            })
        }

    }

    return (
        <>
            <canvas id="game-canvas" ref={canvas} width={width} height={height} ></canvas>
            <div id='overlay'>
                <div id='wave' className='hidden'>
                    <h1>Wave 1</h1>
                </div>
            </div>
        </>
    )
},)