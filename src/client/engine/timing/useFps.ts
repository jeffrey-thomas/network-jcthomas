import { useEffect, useRef, useState } from "react"
import { Clock } from "./Clock"

const tickId = Symbol('FpsTick')
const freqId = Symbol('FpsInterval')

/** React hook that allows a component to display frames per second */
export const useFps = () => {

    const [fps, setFps] = useState(0)
    const count = useRef(0)
    const prevTimestamp = useRef(0)
    const frequency = useRef(1000)

    const [initialized, setInitialized] = useState(false)

    useEffect(
        () => {
            //Set timers to keep track of framerate
            if (!initialized) {
                //count the number of frames
                Clock.setTimer(
                    { action: () => { count.current = count.current + 1 } }, 
                    false,
                    tickId
                )
                //each second calculate fps based on count and reset the count
                Clock.setTimer(
                    {
                        action: (timestamp) => {
                            let newFps = Math.round(count.current / (timestamp - prevTimestamp.current) * 1000)
                            setFps(newFps)
                            prevTimestamp.current = timestamp
                            count.current = 0
                        },
                        duration: frequency.current,
                    },
                    false,
                    freqId
                )

                setInitialized(true)
            }

        }, [initialized]
    )

    return [fps]

}