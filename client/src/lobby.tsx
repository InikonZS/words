import React, { useState } from "react";
import Socket from "./socket";
import {AnimatedList} from './animatedList';

interface ILobbyProps{
    socket: Socket;
    onRoomJoin: (name: string)=>void;
}

export function Lobby({socket, onRoomJoin}: ILobbyProps) {
    const [roomName, setRoomName] = useState('');
    //const [items, setItems] = useState([]);

    return <div>
        <button onClick={()=>{
            socket.sendState({
                type: 'createRoom',
                data: {}
            })
        }}>create room</button>

        <button onClick={()=>{
            socket.sendState({
                type: 'getRooms',
                data: {}
            })
        }}>get rooms</button>

        <input onChange={(e)=>{
            setRoomName(e.target.value)
        }}></input>   
        <button onClick={()=>{
            socket.sendState({
                type: 'joinRoom',
                data: {roomName: roomName}
            }).then(res=>{
                console.log(res);
                if (res === true){
                    onRoomJoin(roomName);
                }
            })
        }}>join room</button>
        <AnimatedList></AnimatedList>
    </div>
}