import { useEffect } from 'react'
import { socket } from '../../socket/socket'
import { Game } from '..'
import { GameStateManager } from '../../engine/GameStateManager'
import { EntityData } from '../../../shared/entities/EntityData'
import { Rectangle } from '../../../shared/geometry'
import { Player } from '../../../shared/entities/Player'


/** Handles receiveing communication from  the server and routing data where it needs to go*/
export const Client = () => {

  useEffect(() => {
    //Connect to socket.io server if needed
    if (socket.disconnected)
      socket.connect()

    //Receive data to update entities
    socket.on('updateEntities', (entities: EntityData) => {
      GameStateManager.entityManager.updateEntities(entities)
    })

    //Remove a player
    socket.on('removePlayer', (playerId: string) => {
      GameStateManager.entityManager.removePlayer(playerId)
    })

    //Create an explosion
    socket.on('explosion', (position: Rectangle) => {
      GameStateManager.entityManager.createExplosion(position)
    })

    //Game successfully created
    socket.on('gameCreated', (name: string) => {
      GameStateManager.gameId = name
      GameStateManager.menu = GameStateManager.menus.Lobby
    })

    //Game successfully joined
    socket.on('gameJoined', (name: string) => {
      GameStateManager.gameId = name
      GameStateManager.menu = GameStateManager.menus.Lobby
    })

    //Failed to join game
    socket.on('joinFailed', (name: string) => {
      alert(`A game with id=${name} was not found. Please try again.`)
    })

    //A wave is beginning
    socket.on('beginWave', (wave: number) => {
      GameStateManager.startWave(wave)
    })

    //A player has died
    socket.on('death', (data: { id: String, player: Player }) => {
      GameStateManager.entityManager.createExplosion(data.player.position)
      if (socket.id === data.id)
        GameStateManager.die()
    })

    //Game Over
    socket.on('gameover', () => {
      GameStateManager.endGame()
    })

    //disconnect when done
    return () => { socket.disconnect() }
  })

  return (
    <div id='wrapper'>
      <Game socket={socket} />
    </div>
  );
}

