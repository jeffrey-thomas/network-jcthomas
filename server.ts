import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { Game } from './src/server/Game'
import { GameId } from './src/server/GameId'

const PORT = 5000

// Create Socket.IO TCP Server
const app = express()
app.use(cors)
const server = new http.Server(app)
const io = new Server(server, {
    pingInterval: 2000,
    pingTimeout: 5000,
    cors: {
        origin: ["http://localhost:3000", "http://192.168.0.110:3000", "http://192.168.0.108:3000"]
    }
})

//Create empty map of gameId to Game
const games: { [key in string]: Game } = {}

/** When a new player connects to the game */
io.on('connection', (socket) => {

    //Handle Game creation
    socket.on('createGame', () => {
        const name = GameId.generate(6)   //generate random game id
        games[name] = new Game(io, name)     //create game
        socket.join(name)
        socket.emit('gameCreated', name)
        games[name].onConnect(socket)       //join game
    })

    //Handle Joining Existing Game
    socket.on('joinGame', (id: string) => {
        id = id.toUpperCase()
        if (games[id]) {                  //match game id ignoring case
            socket.join(id)
            socket.emit('gameJoined', id)
            games[id].onConnect(socket)     //join game
        } else {
            socket.emit('joinFailed', id)    //id not valid
        }
    })

    //Handle Leaving Game
    socket.on('leaveGame', (id: string) => {
        if (games[id]) {
            socket.leave(id)
            games[id].onDisconnect(socket)
            if (games[id].playerCount === 0)
                delete games[id]
        }
    })

    //When this player disconnects
    socket.on('disconnect', () => {

        Object.keys(games).forEach((id) => {
            if (games[id].hasPlayer(socket.id)) {
                games[id].onDisconnect(socket)
            }
            if (games[id].playerCount === 0)     //If there are no players left in a game delete it
                delete games[id]
        })
    })
})



//Listen for TCP connection on the correct port
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})