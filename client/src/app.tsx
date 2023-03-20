import React, { useEffect, useState } from "react";
import "./style.css";
import GameField from './components/gamefield/gamefield';
import { Lobby } from './lobby';
import Socket from "./socket";
import { PlayerClient } from "./player_client";

export default function App() {
  const [socket, setSocket] = useState<Socket>(null);
  const [pageName, setPageName] = useState('lobby');
  //const [roomName, setRoomName] = useState('');
  const [player, setPlayer] = useState<PlayerClient>(null);

  useEffect(()=>{
    const connect = ()=>{
      const socket = new Socket();
      socket.onConnect = ()=>{
        setSocket(socket);
      }
      socket.onClose = ()=>{
        socket.destroy();
        setSocket(null);
        setPlayer(null);
        setPageName('lobby');
        setTimeout(()=>{
          console.log('try connect');
          connect();
        }, 3000);
      }
    }

    connect();
  }, []);

  return (
      <div>
        {socket == null && 'connecting...'}
        {pageName == 'lobby' && socket && <Lobby socket={socket} onRoomJoin={(name)=>{
          //setRoomName(roomName);
          setPlayer(new PlayerClient(socket));
          setPageName('gameField');
        }}></Lobby>}

        {pageName == 'gameField' && socket && <GameField player={player}/>}  
        {/*<GameField />*/}
      </div>
  )
}