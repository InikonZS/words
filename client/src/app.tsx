import React, { useEffect, useState } from "react";
import "./style.css";
import GameField from './components/gamefield/gamefield';
import { Lobby } from './lobby/lobby';
import Socket from "./socket";
import { PlayerClient } from "./player_client";
import { PlayerLocal } from './player_local';
import { YandexPlatform } from './platforms/yandex/yandex';

export default function App() {
  const [socket, setSocket] = useState<Socket>(null);
  const [pageName, setPageName] = useState('lobby');
  //const [roomName, setRoomName] = useState('');
  const [player, setPlayer] = useState<PlayerClient | PlayerLocal>(null);
  const [platform, setPlatform] = useState<YandexPlatform>(null);

  useEffect(()=>{
    const _platform = new YandexPlatform();
    _platform.init().then(()=>{ 
      return _platform.initPlayer();  
    }).then(()=>{
      setPlatform(platform);
      console.log('successful yandex auth');
    });
    const connect = ()=>{
      const socket = new Socket();
      socket.onConnect = ()=>{
        setSocket(socket);
      }
      socket.onClose = ()=>{
        socket.destroy();
        setSocket(null);
        //think how to reconnect only for multiplayer
        //setPlayer(null);
        //setPageName('lobby');
        setTimeout(()=>{
          console.log('try connect');
          //recursive reconnect attempt
          //connect();
        }, 3000);
      }
    }

    connect();
  }, []);

  useEffect(()=>{
    const h = ()=>{
      //window.location.hash
    }
    window.addEventListener('popstate', h);
    return ()=>{
      window.removeEventListener('popstate', h);
    }
  });

  return (
      <div>
        {/*socket == null && 'connecting...'*/}
        {pageName == 'lobby' && <Lobby socket={socket} onRoomJoin={(name)=>{
          //setRoomName(roomName);
          setPlayer(new PlayerClient(socket, name));
          setPageName('gameField');
        }}
        onLocal={(lang)=>{
          setPlayer(new PlayerLocal(lang));
          setPageName('gameField');
        }}
        onBot = {()=>{

        }}
        ></Lobby>}

        {pageName == 'gameField' && <GameField player={player} onLeave={()=>{
          setPlayer(null);
          setPageName('lobby');
        }}/>}  
        {/*<GameField />*/}
      </div>
  )
}