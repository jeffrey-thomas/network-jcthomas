# Overview

This is a simple network multiplayer game I made to learn how to do basic networking. There are 2 parts a client that serves a webpage and a node.js server backend. 

To start the server use the command: npm run server

To start the client use the command: npm run dev . Then go to localhost:3000 in a web browser.


# Network Communication

This project uses a client-server desing. Player inputs are sent from the client to the server. The server calculates the new state of objects based on player input and elapsed time and sends the result to all clients, which then rerender the scene.

The front-end webpage is served on port 3000.
The back-end server listens on port 5000.

Messages between the client and server have an 'event' string label and a data object that has been passed through JSON.stringify.  


# Development Environment

Visual Studio Code 1.93.1

Languages and Libraries:

Typescript - Web Audio API, Canvas API
Vite
React
React-Router-Dom
Express
Socket.IO

Graphics created with GIMP 2.10.32

# Useful Websites

* [MDN Web Docs](https://developer.mozilla.org/en-US/)
* [Socket.IO Docs](https://socket.io/docs/v4/)

# Future Work

In the future I would like to make the following changes:
* Limit client connections to a single game instance to 4
* work on improving latency
* add text chat between players