import { socket } from "../socket/socket"
import { EntityManager } from "./EntityManager"
import { GameState } from "./GameState"
import { Menu } from "./menu/Menu"
import { Clock, TimerId } from "./timing"

/** Singleton responsible for managing the state of the game */
export class GameStateManager {

    /** Singleton instance */
    private static _instance: GameStateManager

    /** whether the game is paused */
    private _paused: boolean = true
    /** whether the game is pauseLocked */
    private _pauseLocked: boolean = false
    /** the current state of the game */
    private _state: GameState = GameState.Menu
    /** timers that will be paused when the game is paused */
    private _timers: TimerId[] = []

    /** the current scene manager */
    private _entityManager: EntityManager

    /** All of the possible menus to display */
    private _menus: { [key: string]: Menu } = {}
    /** The current menu to display */
    private _menu: Menu

    /** Id of the current game */
    private _gameId: string = ''

    /** Constructor */
    private constructor() {
        //create a scene manager
        this._entityManager = new EntityManager()

        //create the menus
        this._menus = {
            TitleScreen: new Menu('Martian Invaders', [
                { label: 'Create Game', action: GameStateManager.createGame },
                { label: 'Join Game', input: { label: 'Game ID: ', placeholder: 'GAMEID', length: 6 }, action: GameStateManager.joinGame }
            ]),
            Lobby: new Menu(`Waiting for Other Players`, [
                { label: 'Ready', action: GameStateManager.ready }
            ]),
            Pause: new Menu('Paused', [
                { label: 'Resume', action: GameStateManager.unpause },
                { label: 'Exit to Main Menu', action: GameStateManager.reset }
            ]),
            GameOver: new Menu('Game Over', [
                { label: 'Back to Main Menu', action: GameStateManager.reset }
            ]),
            Victory: new Menu('Victory', [
                { label: 'Back to Main Menu', action: GameStateManager.reset }
            ])
        }
        //set the current menu visible, others hidden
        this._menus.TitleScreen.show()
        this._menus.Pause.hide()
        this._menus.GameOver.hide()
        this._menus.Victory.hide()
        this._menus.Lobby.hide()
        this._menu = this._menus.TitleScreen
    }

    /** Get the current singleton instance, create it if needed */
    private static get instance() {
        if (!GameStateManager._instance) {
            GameStateManager._instance = new GameStateManager()
        }

        return GameStateManager._instance
    }

    /** All possible menus to display */
    static get menus() { return GameStateManager.instance._menus }
    /** The current menu to display */
    static get menu() { return GameStateManager.instance._menu }
    //Change the current menu
    static set menu(menu: Menu) {
        GameStateManager.instance._menu.hide()
        GameStateManager.instance._menu = menu
        menu.show()
    }
    /** the id of the current game */
    static get gameId() { return this.instance._gameId }
    //change the id of the current game
    static set gameId(name: string) { this.instance._gameId = name }

    /** The current scene manager */
    static get entityManager() { return GameStateManager.instance._entityManager }

    /** whether the pause state is locked due to pointerLock delay */
    static get pauseLocked() { return GameStateManager.instance._pauseLocked }
    //set whether the game is currently locked due to pointerLock delay
    static set pauseLocked(pauseLock: boolean) {
        GameStateManager.instance._pauseLocked = pauseLock
    }

    /** whether the game is currently paused */
    static get paused() { return GameStateManager.instance._paused }
    //set whether the game is currently paused
    static set paused(pause: boolean) {
        GameStateManager.instance._paused = pause
    }

    /** The current state of the game */
    static get state() { return GameStateManager.instance._state }
    //set the state of the game
    static set state(state: GameState) {
        GameStateManager.instance._state = state
    }

    /** Pause the game */
    static pause() {
        const message = document.getElementById('wave')
        message?.classList.add('hidden')
        GameStateManager.paused = true
        GameStateManager.pauseLocked = true
        Clock.setTimer({ action: () => { GameStateManager.instance._pauseLocked = false }, duration: 1500, count: 1 })
        GameStateManager.instance._timers.forEach((timer) => {
            Clock.pauseTimer(timer)
        })
        GameStateManager.instance._menu.show()
        document.exitPointerLock()
    }

    /** Unpause the game */
    static unpause() {
        if (GameStateManager.state === GameState.Dead) {
            const message = document.getElementById('wave')
            message?.classList.remove('hidden')
        }

        if (GameStateManager.instance._pauseLocked)
            return
        GameStateManager.instance._paused = false
        GameStateManager.instance._timers.forEach((timer) => {
            Clock.unpauseTimer(timer)
        })
        GameStateManager.instance._menu.hide()
        document.getElementById("game-canvas")?.requestPointerLock()
    }

    /** Ask the server to create a new game */
    static createGame() {
        socket.emit('createGame')
    }

    /**
     * Attempt to join a game
     * @param gameId the id of the game to join
     */
    static joinGame(gameId?: string) {
        socket.emit('joinGame', gameId)
    }

    /** Tell the server you are ready to start */
    static ready() {
        socket.emit('ready')
        document.getElementById("game-canvas")?.requestPointerLock()
        GameStateManager.menus.Lobby.removeItem(GameStateManager.menus.Lobby.items[0])
    }

    /** go to Game Over screen */
    static endGame() {
        console.log('gameover ')
        GameStateManager.state = GameState.GameOver
        GameStateManager.menu = GameStateManager.menus.GameOver
        GameStateManager.pause()
    }

    /** Go back to title screen and reset */
    static reset() {
        GameStateManager.state = GameState.Menu
        GameStateManager.instance._entityManager = new EntityManager()
        GameStateManager.instance._menus.GameOver.hide()
        GameStateManager.menu = GameStateManager.menus.TitleScreen
        socket.emit('leaveGame', GameStateManager.gameId)
        GameStateManager.menus.Lobby.addItem(
            { label: 'Ready', action: GameStateManager.ready }
        )
        GameStateManager.gameId = ''
    }

    /**
     * Add a timer to pause when the game is paused
     * @param timer id of the timer to control
     */
    static addTimer(timer: TimerId) {
        GameStateManager.instance._timers.push(timer)
    }

    /** 
     * Remove a timer to pause when the game is paused 
     * @param timer id of the timer to stop controlling
     */
    static removeTimer(timer: TimerId) {
        GameStateManager.instance._timers = GameStateManager.instance._timers.filter((id) => id !== timer)
    }

    /**
     * display wave number at the start of a wave
     * @param wave the number of the wave
     */
    static startWave(wave: number) {
        const element = document.getElementById('wave')
        element!.innerHTML = `<h1>Wave ${wave}</h1>`
        element?.classList.remove('hidden')
        Clock.setTimer(
            {
                action: () => { element?.classList.add('hidden') },
                duration: 2000,
                count: 1
            }
        )
        GameStateManager.state = GameState.Active
        GameStateManager.menu = GameStateManager.menus.Pause
        GameStateManager.unpause()

    }

    /**
     * Handle the UI changes when the player dies
     */
    static die() {
        GameStateManager.state = GameState.Dead
        const element = document.getElementById('wave')
        element!.innerHTML = `<h1>You have died.</h1>`
        element?.classList.remove('hidden')
        element?.classList.add('dead')
    }

}