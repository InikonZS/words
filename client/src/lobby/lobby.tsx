import React, { useState } from "react";
import Socket from "../socket";
import { AnimatedList } from '../animatedList';
import '../style.css';
import './lobby.css';
import { TopPanel } from '../components/top-panel/top-panel';
import { useSettingsContext } from "../context";

interface ILobbyProps {
    socket: Socket;
    pageName: string;
    onSingle: () => void;
    onMulti: () => void;
    onBack: ()=> void;
}

export function Lobby({ socket, pageName, onSingle, onMulti, onBack }: ILobbyProps) {
  
    //const [items, setItems] = useState([]);
    const {isDebug} = useSettingsContext();
    return (
        <div className="lobby">
           
            <div className="lobby__wrapper">              
                {isDebug && <div className="debug__size"></div>}
                <TopPanel socket={socket} onBack={onBack} pageName={pageName}/>                

                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">
                        <h2 className="lobby__title">Select game mode:</h2>
                        <button className="btn lobby__button lobby__button--single" onClick={() => {
                            onSingle();
                        }}>single</button>
                        <button className="btn lobby__button lobby__button--multi" onClick={() => {
                            onMulti();
                        }}>multiplayer</button>
                    </div>

                    {/* <AnimatedList></AnimatedList> */}

                </div>
            </div>
        </div>
    )
}