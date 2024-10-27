import { useCallback, useRef } from "react";

import './Game.css'
import { Display } from "../Display";
import { Socket } from "socket.io-client";

const screenW = 640;
const screenH = 480;

export interface GameProps{
    socket:Socket
}

/** Create the canvas to display the game and gather user input */
export const Game = ({socket}:GameProps) => {

    //////////////////////////////////////////////////////////////////////
    //State and Setup
    //////////////////////////////////////////////////////////////////////    
    const canvas = useRef<HTMLCanvasElement>(null)
    const container = useRef<HTMLDivElement>(null)

    //////////////////////////////////////////////////////////////////////
    //Event Listeners
    //////////////////////////////////////////////////////////////////////

    /**
     * Handle when the player clicks
     */
    const onClick = useCallback(() => {
        if(document.pointerLockElement != null)
            socket.emit('click')
    }, [])

    /**
     * Handle when the player moves the mouse
     * @param event React.MouseEvent than contains movement information
     */
    const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if(document.pointerLockElement != null)
            socket.emit('mouseMove',event.movementX)
    }, [])

    return (
        <div id='game' ref={container} style={{ width: screenW, height:screenH }} onClick={onClick} onMouseMove={onMouseMove} >
            <Display ref={canvas} width={screenW} height={screenH}></Display>
        </div>
    )
}