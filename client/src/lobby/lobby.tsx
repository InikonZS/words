import React, { useState } from "react";
import Socket from "../socket";
import { AnimatedList } from '../animatedList';
import '../style.css';
import './lobby.css';
// import { useLangContext } from "../context";
import { UserEditPopup } from '../components/user-edit-popup/user-edit-popup';
import { TopPanel } from '../components/top-panel/top-panel';

interface ILobbyProps {
    socket: Socket;
    pageName: string;
    onSingle: () => void;
    onMulti: () => void;
    onBack: ()=> void;
}

export function Lobby({ socket, pageName, onSingle, onMulti, onBack }: ILobbyProps) {
    // const [userEditMode, setUserEditMode] = useState(false);
    // const [ava, setAva] = useState<string | null>(null);

    // const { setLang, currentLang } = useLangContext();

    // const changeAvatar = (str: string) => {
    //     const httpMode = true;
    //     setUserEditMode(false)
    //     if (!str) {
    //         console.log('image is not selected')
    //         return
    //     }
    //     if (httpMode) {
    //         fetch('http://localhost:4002/uploadAvatar', { body: JSON.stringify({ avatar: str.slice(str.indexOf(",") + 1) }), method: 'POST' });
    //     } else {
    //         socket.sendState({
    //             type: "userAvatar",
    //             data: {
    //                 img: str.slice(str.indexOf(",") + 1)
    //             }
    //         })
    //     }
    // }

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <div className="lobby__wrapper">
                {/* {userEditMode && <UserEditPopup onClose={changeAvatar} />} */}

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