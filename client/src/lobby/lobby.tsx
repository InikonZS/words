import React, { useContext, useEffect, useState } from "react";
import Socket from "../socket";
import { AnimatedList } from '../animatedList';
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";
import { UserEditPopup } from '../components/user-edit-popup/user-edit-popup';

interface ILobbyProps {
    socket: Socket;
    onSingle: ()=>void;
    onMulti: ()=>void;
}

export function Lobby({ socket, onSingle, onMulti }: ILobbyProps) {
    const [userEditMode, setUserEditMode] = useState(false);
    const [ava, setAva] = useState<string | null>(null);

    const {setLang, currentLang} = useLangContext();

    const changeAvatar = (str: string) => {
        setUserEditMode(false)
        if (!str) {
          console.log('image is not selected')
          return
        }
        socket.sendState({
          type: "userAvatar",
          data: {
            img: str.slice(str.indexOf(",") + 1)
          }
        })
      }

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <div className="lobby__wrapper">
            {userEditMode && <UserEditPopup onClose={changeAvatar} />}

            <div className="user-info__wrapper">            
            <div className="user-info__picture" onClick={() => {
              setUserEditMode(true)
            }}>
              {ava && <img className="user-info__img" src={`${ava}`} width="100" height="100" alt="avatar" />}
              user block
            </div>
            <div className="user-info__info-block">
              {/* <div className="user-info__username">Hello, <span>{user.userName}</span></div> */}
            </div>
          </div>

                {socket ? <div>userName: {socket.name}</div> : <div>connecting...</div>}
                <button onClick={()=>{
                    setLang();
                    console.log(currentLang);
                }}>change lang</button>
                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">
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