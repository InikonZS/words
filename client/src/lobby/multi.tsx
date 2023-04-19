import React, { useContext, useEffect, useState } from "react";
import Socket from "../socket";
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";
import { ChangeWordsLang } from '../components/words-lang/words-lang';
import { langList } from '../gameLogic/logicGenerator';
import { TopPanel } from "../components/top-panel/top-panel";

interface IMultiProps {
    socket: Socket;
    pageName: string;
    onRoomJoin: (name: string) => void;
    onBack: ()=>void;
}

export function Multi({ socket, pageName, onRoomJoin, onBack }: IMultiProps) {
    const [roomName, setRoomName] = useState('');
    const [langIndex, setLangIndex] = useState(0);
    const langs = langList.map(it=> it.name);
    const {setLang, currentLang} = useLangContext();

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <div className="lobby__wrapper">
                {/* {socket ? <div>userName: {socket.name}</div> : <div>connecting...</div>}

                <button onClick={()=>{
                    onBack();
                }}>back</button>
                
                <button onClick={()=>{
                    setLang();
                    console.log(currentLang);
                }}>change lang</button> */}

                <TopPanel socket={socket} onBack={onBack} pageName={pageName} />

                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">
                        <h2 className="lobby__title">Multiplayer mode</h2>

                        <ChangeWordsLang langs={langs} langIndex={langIndex} setLangIndex={setLangIndex} />                       

                        <button className="btn lobby__button lobby__button--create" onClick={() => {
                            socket.sendState({
                                type: 'createRoom',
                                data: {
                                    lang: langIndex
                                }
                            })
                        }}>create room</button>

                        <button className="btn lobby__button lobby__button--get" onClick={() => {
                            socket.sendState({
                                type: 'getRooms',
                                data: {}
                            })
                        }}>get rooms</button>

                        <label className="lobby__label lobby__label--room-name" htmlFor="room-name">Enter the room name:</label>
                        <input className="lobby__input lobby__input--room-name" id="room=name" onChange={(e) => {
                            setRoomName(e.target.value)
                        }}></input>

                        <button className="btn lobby__button lobby__button--join" onClick={() => {
                            onRoomJoin(roomName);
                        }}>join room</button>

                    </div>
                </div>
            </div>
        </div>
    )
}