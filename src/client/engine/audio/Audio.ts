import { GameState } from "../GameState";
import { GameStateManager } from "../GameStateManager";
import { AudioId } from "./AudioId";

import deathSrc from './sounds/death.mp3'
import explosionSrc from './sounds/explosion.mp3'
import bombSrc from './sounds/laser.mp3'
import laserSrc from './sounds/retro-laser.mp3'

/**
 * Audio - Singleton Class
 * Handles loading and playing of sounds
 */
export class Audio{

    //Singleton instance
    private static _instance:Audio

    //AudioIds for all of the sounds
    static readonly LASER:AudioId = Symbol('AudioId: Laser')
    static readonly DEATH:AudioId = Symbol('AudioId: Death')
    static readonly BOMB:AudioId = Symbol('AudioId: Bomb')
    static readonly EXPLOSION:AudioId = Symbol('AudioId: Explosion')

    //Web Audio API Context
    private _audioCtx:AudioContext

    //Map of Ids to Sound Data
    private _sounds:Map<AudioId,AudioBuffer>

    /**
     * Private constructor enforces singleton
     * Get Web Audio API context and loads sound files storing data in map
     */
    private constructor(){
        this._audioCtx = new AudioContext()
        this._sounds = new Map<AudioId, AudioBuffer>()
        this.loadSound(bombSrc).then((sound)=>{ this._sounds.set(Audio.BOMB,sound) })
        this.loadSound(deathSrc).then((sound)=>{ this._sounds.set(Audio.DEATH,sound) })
        this.loadSound(explosionSrc).then((sound)=>{ this._sounds.set(Audio.EXPLOSION,sound) })
        this.loadSound(laserSrc).then((sound)=>{ this._sounds.set(Audio.LASER,sound) })
    }

    /**
     * Gets the singleton instance, creating it if needed
     */
    private static get instance(){
        if(!Audio._instance)
            Audio._instance = new Audio()

        return Audio._instance
    }

    /**
     * Retrieve the sound data from a file
     * @param filepath path to the file to load
     * @returns sound data in an AudioBuffer
     */
    async loadSound(filepath:string){
        const file = await fetch(filepath)
        const buffer = await file.arrayBuffer()
        return this._audioCtx.decodeAudioData(buffer)
    }

    /**
     * Play a sound
     * @param sound the Id of the sound to play 
     */
    static playSound(sound:AudioId) {
        if(GameStateManager.state === GameState.Active){
            var source = Audio.instance._audioCtx.createBufferSource(); // creates a sound source
            source.buffer = Audio.instance._sounds.get(sound)!;         // tell the source which sound to play
            source.connect(Audio.instance._audioCtx.destination);       // connect the source to the context's destination (the speakers)
            source.start(0)                                             // play the source now
        }                                           
    }

}