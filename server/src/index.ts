import * as webSocket from 'websocket'
import { connection } from 'websocket'
import * as http from 'http'
import * as path from "path"
import * as fs from "fs"
import * as url from "url"

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

socket.on('request', (request) => {
  const connection = request.accept(undefined, request.origin)
  connections.push(connection)
  console.log(new Date() + ' Connection accepted.')

  connection.on('message', (message) => {
    console.log("Message")
    if (message.type === "binary") {

    } else if (message.type === 'utf8') {
      const parsed = JSON.parse(message.utf8Data)

      if (!('type' in parsed)) {
        return;
      }

    }
  })

  connection.on('close', (reasonCode, description) => {
    console.log('Close!!!!', description);
  })
})

