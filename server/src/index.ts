import * as webSocket from 'websocket'
import { connection } from 'websocket'
import * as http from 'http'
import * as path from "path"
import * as fs from "fs"
import * as url from "url"
import { GameLogic } from '../../client/src/gameLogic/gameLogic';

const WebSocketServer = webSocket.server
const port = process.env.PORT || 4002

const server = http.createServer((req, res) => {
  res.writeHead(404, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
  })

  res.end("not found")
})

server.listen(port, () => {
  console.log(new Date() + ` Server is listening on port ${port}`)
})

const socket = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 1000000,
})

const connections: connection[] = []

const gameLogic = new GameLogic();
gameLogic.onGameState = (state)=>{
  connections.forEach(connection => connection.sendUTF(JSON.stringify({
    type: 'state',
    data: state
  })))
}
gameLogic.onCorrectWord = (state)=>{
  connections.forEach(connection => connection.sendUTF(JSON.stringify({
    type: 'correctWord',
    data: state
  })))
}
gameLogic.onSelectLetter = (state)=>{
  connections.forEach(connection => connection.sendUTF(JSON.stringify({
    type: 'selectLetter',
    data: state
  })))
}

socket.on('request', (request) => {
  const connection = request.accept(undefined, request.origin)
  connections.push(connection)
  console.log(new Date() + ' Connection accepted.')

  connection.on('message', (message) => {
    
    if (message.type === "binary") {

    } else if (message.type === 'utf8') {
      const parsed = JSON.parse(message.utf8Data)
      console.log("Message", parsed)
      if (!('type' in parsed)) {
        return;
      }

      if (parsed.type == 'getState'){
        connection.sendUTF(JSON.stringify({
          type: 'privateMessage',
          requestId: parsed.requestId,
          data: gameLogic.getState()
        }))
      }

      if (parsed.type == 'submitWord'){
        gameLogic.submitWord(parsed.data.selected);
        /*connection.sendUTF(JSON.stringify({
          type: 'privateMessage',
          requestId: parsed.requestId,
          data: gameLogic.getState()
        }))*/
      }
      if (parsed.type == 'selectLetter'){
        gameLogic.select(parsed.data);
        /*connection.sendUTF(JSON.stringify({
          type: 'privateMessage',
          requestId: parsed.requestId,
          data: gameLogic.getState()
        }))*/
      }
    }
  })

  connection.on('close', (reasonCode, description) => {
    console.log('Close!!!!', description);
  })
})

