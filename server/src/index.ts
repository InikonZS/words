import * as webSocket from 'websocket'
import { connection } from 'websocket'
import * as http from 'http'
import * as path from "path"
import * as fs from "fs"
import * as url from "url"
import { GameLogic } from '../../client/src/gameLogic/gameLogic';
import { PlayerServer } from './playerServer';
import { Rooms } from './rooms';
import { LobbyUser } from './lobbyUser';

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

//const connections: connection[] = []

//const gameLogic = new GameLogic();
const rooms = new Rooms();

const users: Array<LobbyUser> = [];

socket.on('request', (request) => {
  const connection = request.accept(undefined, request.origin)
  console.log(request.httpRequest.url);
  const params: Record<string, string> = {};
  request.httpRequest.url.split('?')[1]?.split('&')?.forEach(it=>{
    const [key, value] = it.split('=');
    params[key] = value;
  });
  console.log(params);
  //connections.push(connection)
  console.log(new Date() + ' Connection accepted.')
  //const player = new PlayerServer(gameLogic, connection);
  let user: LobbyUser = null;
  if (params['session']){
    user = users.find(it=> it.session == params['session']);
    if (user){
      user.updateConnection(connection);
      connection.sendUTF(JSON.stringify({
        type: 'restoreSession',
        data: {
          session: user.session
        }
      }))  
    }
  }
  if (!user){
    user = new LobbyUser(rooms, connection);
    users.push(user);
    connection.sendUTF(JSON.stringify({
      type: 'newSession',
      data: {
        session: user.session
      }
    }))
  }
  //const user = new LobbyUser(rooms, connection);
})

