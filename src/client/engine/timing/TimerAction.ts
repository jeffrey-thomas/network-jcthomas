/** 
 * Type for functions that can be called when a timer is elapsed. 
 * timestamp - milliseconds since program started
 * elapsed - milliseconds since timer started or last trigger (may not exactly equal duration)
 */
export type TimerAction = (timestamp:number, elapsed:number)=>void