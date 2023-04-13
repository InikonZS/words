import * as webSocket from 'websocket'
import { connection } from 'websocket'
import * as http from 'http'
import * as path from "path"
import * as fs from "fs"
import * as url from "url"
//import { GameLogic } from '../../client/src/gameLogic/gameLogic1';
import { PlayerServer } from './playerServer';
import { Rooms } from './rooms';
import { LobbyUser } from './lobbyUser';

const WebSocketServer = webSocket.server
const port = process.env.PORT || 4002

const cors = {
  'Content-Type': 'text/plain',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
}

function processAvatar(req:http.IncomingMessage, res: http.ServerResponse){
  const avatarPath = "/avatar";
  if (req.url.startsWith(avatarPath)) {
    try {
      const { pathname } = url.parse(req.url)
      const avatar = pathname.slice(avatarPath.length + 1)
      const stream = fs.createReadStream(path.join(__dirname, "public", `${avatar}.png`))

      res.writeHead(200, {
        ...cors,
        'Content-Type': 'image/png',
      })

      stream.pipe(res)
      return true;
    } catch (e){
      return false;
    }
  } else {
    return false;
  }
}

function uploadAvatar(req:http.IncomingMessage, res: http.ServerResponse){
  const avatarPath = "/uploadAvatar";
  console.log(req.url);
  if (req.url.startsWith(avatarPath) && req.method == 'POST') {
    let body: string = '';
    const handleData = (chunk: Buffer)=>{
      body+=chunk.toString('utf8');
    }
    req.on('data', handleData);
    req.on('end', ()=>{
      console.log('loaded');
      const parsed = JSON.parse(body);
      const fileData = Buffer.from((parsed.avatar as string), 'base64');
      fs.promises.mkdir(path.join(__dirname, "public")).catch(()=>{}).then(()=>{
        return fs.promises.writeFile(path.join(__dirname, "public", `${111}.png`), fileData).then(writeRes=>{
            res.writeHead(200, cors);
            res.end('loaded');
        });
      });

    })
   
    return true;
  } else {
    return false;
  }
}

const server = http.createServer((req, res) => {
  let found = false;
  found ||= processAvatar(req, res);
  found ||= uploadAvatar(req, res);
  if (!found){
    res.writeHead(404, cors)
    res.end("not found")
  }
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
  const connection = request.accept(undefined, request.origin);
  connection.on('message', (message)=>{
    if (message.type == 'utf8'){
      const parsed = JSON.parse(message.utf8Data)
      console.log("Message", parsed)
      if (!('type' in parsed)) {
          return;
      }

      if (parsed.type == 'getUsers') {
        const names = parsed.data.names;
        if (names instanceof Array){
          connection.sendUTF(JSON.stringify({
            type: 'privateMessage',
            requestId: parsed.requestId,
            data: names.map(it => {
              const found = users.find(user=> user.name == it);
              if (found){
                return {
                  name: found.name,
                  nick: found.nick,
                  ava: found.ava
                }
              } else {
                return {
                  name: found.name
                };
              }
            })
          }))
        }
      }
    }
  })
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
          session: user.session,
          name: user.name,
          nick: user.nick,
          ava: user.ava
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
        session: user.session,
        name: user.name,
        nick: user.nick,
        ava: user.ava
      }
    }))
  }
  //const user = new LobbyUser(rooms, connection);
})

