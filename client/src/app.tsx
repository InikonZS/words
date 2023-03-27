import React, { useEffect, useState, createContext, useContext} from "react";
import "./style.css";
import GameField from './components/gamefield/gamefield';
import { Lobby } from './lobby/lobby';
import Socket from "./socket";
import { PlayerClient } from "./player_client";
import { PlayerLocal } from './player_local';
import { YandexPlatform } from './platforms/yandex/yandex';
import { Localization } from './localization/localization';
import { LangContext } from './context';

const langModel = new Localization();

export default function App() {
  const [socket, setSocket] = useState<Socket>(null);
  const [pageName, setPageName] = useState('lobby');
  //const [roomName, setRoomName] = useState('');
  const [player, setPlayer] = useState<PlayerClient | PlayerLocal>(null);
  const [platform, setPlatform] = useState<YandexPlatform>(null);
  const [fix, setFix] = useState(0);
  useEffect(()=>{
    langModel.onChange = ()=>{
      setFix(last=> last + 1); //react render fix;
    }
  }, []);

  useEffect(()=>{
    const yandex = 'yandex';
    if (window.location.host.slice(0, yandex.length) == yandex){
      console.log('Yandex environment');
      const _platform = new YandexPlatform();
      _platform.init().then(()=>{ 
        return _platform.initPlayer();  
      }).then((player)=>{
        const language = _platform.getLang();
        setPlatform(_platform);
        console.log('successful yandex auth');
      });
    } else {
      console.log('Local environment');
    }

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
    <LangContext.Provider value={langModel}>
      <div>
        {/*socket == null && 'connecting...'*/}
        {pageName == 'lobby' && <Lobby socket={socket} onRoomJoin={(name)=>{
          //setRoomName(roomName);
          setPlayer(new PlayerClient(socket, name));
          setPageName('gameField');
        }}
        onLocal={(lang)=>{
          setPlayer(new PlayerLocal(lang, false));
          setPageName('gameField');
        }}
        onBot = {(lang)=>{
          setPlayer(new PlayerLocal(lang, true));
          setPageName('gameField');
        }}
        ></Lobby>}

        {pageName == 'gameField' && <GameField player={player} onLeave={()=>{
          setPlayer(null);
          setPageName('lobby');
        }}/>}  
        {/*<GameField />*/}
      </div>
    </LangContext.Provider>
  )
}