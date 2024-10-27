import { io } from "socket.io-client"

/** The Server URL */
const URL = "http://192.168.0.110:5000"

/** Socket.IO instance connected to the server */
export const socket = io(URL, {autoConnect:false})