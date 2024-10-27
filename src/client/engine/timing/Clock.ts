import { Timer, TimerId, TimerProps } from "."

//A class that handles all timing issues
export class Clock {

    private _lastTick: number = 0
    private _timers = new Map<TimerId, Timer>()

    private static _instance: Clock

    //Private constructor - enforce all other code using the same Clock instance
    private constructor() {
        this._lastTick = window.performance.now()
        requestAnimationFrame(this.tick.bind(this))
    }

    //Create the single instance if it doesn't exist and then return it
    private static get instance() {
        if (!Clock._instance)
            Clock._instance = new Clock();

        return Clock._instance
    }

    /**
     * tick - function that represents one tick of the clock (1 requestAnimationFrame callback)
     * @param timestamp - number of milliseconds since app started
     */
    private tick(timestamp: number) {
        const delta = timestamp - this._lastTick
        this._lastTick = timestamp

        //Loop over timers
        for (const [id, timer] of this._timers) {

            //Skip paused timers
            if (timer.paused)
                continue

            //Trigger timers with no duration
            if (!timer.duration) {
                timer.action(timestamp, delta)
                continue
            }

            timer.elapsed += delta  //increment timers with duration

            //Check if duration has elapsed
            while (timer.elapsed >= timer.duration) {

                timer.action(timestamp, timer.elapsed)

                //Handle timers with a set number of iterations
                if (timer.count) {
                    timer.count--
                    if (timer.count === 0) {
                        Clock.instance._timers.delete(id)
                        break;
                    }
                }

                timer.elapsed -= timer.duration
            }

        }

        requestAnimationFrame(this.tick.bind(this))
    }

    /**
     * Add a new Timer to the clock 
     * @param options - callback, duration, and count for the new timer
     * @param paused - whether the timer should start paused
     * @param id - optional a TimerId to assign to the timer
     * @returns - the TimerId of the new timer
     */
    static setTimer(options: TimerProps, paused:boolean = false,id: TimerId = Symbol('TimerId')) {
        Clock.instance._timers.set(id, { elapsed: 0, paused: paused, ...options })
        return id
    }

    /**
     * Remove a timer from the clock
     * @param id - TimerId for the timer to remove
     */
    static deleteTimer(id: TimerId) {
        Clock.instance._timers.delete(id)
    }

    /**
     * Pause a timer
     * @param id - TimerId of the timer to pause
     */
    static pauseTimer(id: TimerId) {
        if (Clock.instance._timers.has(id))
            Clock.instance._timers.get(id)!.paused = true
    }

    /**
     * Unpause a timer
     * @param id - TimerId of the timer to unpause
     */
    static unpauseTimer(id: TimerId) {
        if (Clock.instance._timers.has(id))
            Clock.instance._timers.get(id)!.paused = false
    }

    /**
     * Check that a TimerId is valid
     * @param id TimerId to check
     * @returns whether the TimerId belongs to a valid timer that hasn't been deleted
     */
    static timerExists(id: TimerId) {
        return Clock.instance._timers.has(id)
    }
}