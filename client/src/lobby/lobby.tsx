import React, { useContext, useEffect, useState } from "react";
import Socket from "../socket";
import { AnimatedList } from '../animatedList';
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";

interface ILobbyProps {
    socket: Socket;
    onSingle: ()=>void;
    onMulti: ()=>void;
}

export function Lobby({ socket, onSingle, onMulti }: ILobbyProps) {

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
                        <button className="btn lobby__button lobby__button--get" onClick={() => {
                            onSingle();
                        }}>single</button>
                         <button className="btn lobby__button lobby__button--get" onClick={() => {
                            onMulti();
                        }}>multiplayer</button>
                    </div>
                    
                    {/* <AnimatedList></AnimatedList> */}

                </div>
            </div>

        </div>
    )
}