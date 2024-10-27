import { TimerProps } from "./TimerProps"

/** Represents a timer */
export type Timer = TimerProps & {elapsed:number, paused:boolean}