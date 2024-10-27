import { TimerAction } from "./TimerAction"

/**
 * Properties for a Timer
 * action - The callback function for when the timer has elapsed
 * duration - The duration of the timer in milliseconds,if not set the timer will trigger on the next tick.
 * count - The number of times the timer should run, if not set it will run indefinitely
 * 
 * A timer with no duration or count will have its callback function called every tick
 */
export type TimerProps={
    action:TimerAction,
    duration?:number,
    count?:number
}