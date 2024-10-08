import React, { useEffect, useState, createContext, useContext} from "react";
import "./style.css";
import GameField from './components/gamefield/gamefield';
import { Lobby } from './lobby/lobby';
import { Single } from './lobby/single';
import { Multi } from './lobby/multi';
import Socket from "./socket";
import { PlayerClient } from "./player_client";
import { PlayerLocal } from './player_local';
import { YandexPlatform } from './platforms/yandex/yandex';
import { Localization } from './localization/localization';
import { LangContext, SettingsContext} from './context';
import { WinScreen } from './components/winScreen/winScreen';
import { IWinData } from "./gameLogic/interfaces";

const langModel = new Localization();
const getUrlHashProps = ()=>{
  const props = window.location.hash.slice(1).split('&');
  const result: Record<string, string> = {};
  props.forEach(it=> {
      try {
      const [key, value] = it.split('=');
      result[key] = value;
      } catch(e){

      }
  });
  return result;
}

export default function App() {
  const [socket, setSocket] = useState<Socket>(null);
  const [pageName, setPageName] = useState('lobby');
  //const [roomName, setRoomName] = useState('');
  const [player, setPlayer] = useState<PlayerClient | PlayerLocal>(null);
  const [platform, setPlatform] = useState<YandexPlatform>(null);
  const [fix, setFix] = useState(0);
  const [scale, setScale] = useState(0);
  const [winData, setWinData] = useState<IWinData>(null);

  const joinRoom = (name:string)=>{
    socket.sendState({
      type: 'joinRoom',
      data: { roomName: name }
    }).then(res => {
      console.log(res);
      if (res === true) {
          //onRoomJoin(roomName);
          setPlayer(new PlayerClient(socket, name));
          setPageName('gameField');
      }
    })
  }

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
        if (player instanceof PlayerClient){
          player.updateSocket(socket);
        }
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
          connect();
        }, 3000);
      }
    }

    connect();
  }, []);

  useEffect(()=>{
    if (!socket) return ()=>{}
    const h = ()=>{
      const hash = getUrlHashProps();
      //console.log(hash);
      const inviteRoomId = hash['id'];
      if (inviteRoomId){
        console.log(inviteRoomId);
        setTimeout(()=>{
          joinRoom(inviteRoomId);
        }, 3000);
      }
    }
    window.addEventListener('popstate', h);
    h();
    return ()=>{
      window.removeEventListener('popstate', h);
    }
  }, [socket]);

  useEffect(() => {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let w = 1130 / 3 * 4;
      let h = 1130;
      //always use MAX-, not MIN- its important for == state
      if (matchMedia('(max-aspect-ratio: 1/1)').matches){
        w = 780;
        h = 1130;
      }
      const aspect = h / w;
      const size = Math.min(height / aspect, width);
      setScale(size / w);
    }
    window.addEventListener('resize', resize);
    //window.onresize = resize;
    resize();
    return () => {
      window.removeEventListener('resize', resize);
    }
  }, []);

  useEffect(() => {
    document.body.style.setProperty('--base', scale.toString() + 'px');
  }, [scale]);

  return (
    <SettingsContext.Provider value={{isDebug: false}}>
    <LangContext.Provider value={langModel}>
      <div className="game">
        {/*socket == null && 'connecting...'*/}
        {pageName == 'lobby' && <Lobby socket={socket}  pageName={pageName}
          onMulti = {()=>{
            setPageName('multi');
          }}

          onSingle = {()=>{
            setPageName('single');
          }}

          onBack = {()=>{
            setPageName('lobby');
          }}
        ></Lobby>}
        {pageName == 'multi' && <Multi socket={socket} pageName={pageName}
        onBack = {()=>{
          setPageName('lobby');
        }}
        onRoomJoin = {(name)=>{
          
          //setRoomName(roomName);
          joinRoom(name);
        }}        
        />}
        {pageName == 'single' && <Single socket={socket} pageName={pageName}
          onBack = {()=>{
            setPageName('lobby');
          }}
          onLocal={(lang, hexMode)=>{
            setPlayer(new PlayerLocal(lang, hexMode, false));
            setPageName('gameField');
          }}
          onBot = {(lang, hexMode)=>{
            setPlayer(new PlayerLocal(lang, hexMode, true));
            setPageName('gameField');
          }}
        />}
        {pageName == 'gameField' && <GameField 
          player={player} 
          onLeave={()=>{
            setPlayer(null);
            setPageName('lobby');
          }} 
          onWin={(data)=>{
            setPageName('winScreen');
            setWinData(data);
          }} 
          scale={scale}
        />}  
        {pageName == 'winScreen' && <WinScreen
          winData = {winData}
          onClose = {()=>{
            setPageName('gameField');
          }}
        />}
        {/*<GameField />*/}
      </div>
    </LangContext.Provider>
    </SettingsContext.Provider>
  )
}