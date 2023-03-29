import React, { useContext, useEffect, useState } from "react";
import Socket from "../socket";
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";

interface IMultiProps {
    socket: Socket;
    onRoomJoin: (name: string) => void;
}

export function Multi({ socket, onRoomJoin }: IMultiProps) {
    const [roomName, setRoomName] = useState('');
    const [langIndex, setLangIndex] = useState(0);
    const langs = ['en', 'ru'];
    const {setLang, currentLang} = useLangContext();

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <div className="lobby__wrapper">
                {socket ? <div>userName: {socket.name}</div> : <div>connecting...</div>}
                <button onClick={()=>{
                    setLang();
                    console.log(currentLang);
                }}>change lang</button>
                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">
                    <div>
                        <div>words language: </div>
                        <button onClick={()=>{
                            setLangIndex(last=> (last + 1) % langs.length)
                        }}>left</button>
                        <span>{langs[langIndex]}</span>
                        <button onClick={()=>{
                            setLangIndex(last=> ((last + langs.length) - 1) % langs.length) 
                        }}>right</button>
                    </div>

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
                        socket.sendState({
                            type: 'joinRoom',
                            data: { roomName: roomName }
                        }).then(res => {
                            console.log(res);
                            if (res === true) {
                                onRoomJoin(roomName);
                            }
                        })
                    }}>join room</button>

                    </div>
                    
                    {/* <AnimatedList></AnimatedList> */}

                </div>
            </div>

        </div>
    )
}