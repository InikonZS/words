import React, { useState } from "react";
import Socket from "../../socket";
import { useLangContext } from "../../context";
import { UserEditPopup } from "../user-edit-popup/user-edit-popup";
import '../../style.css';
import './top-panel.css';

interface ITopPanelProps {
  socket: Socket;
  pageName: string;
  onBack: () => void;
}

export function TopPanel({ socket, pageName, onBack}: ITopPanelProps) {
  const [userEditMode, setUserEditMode] = useState(false);
  const [ava, setAva] = useState<string | null>(null);
 
  const { setLang, currentLang } = useLangContext();

  const changeAvatar = (str: string) => {
    const httpMode = true;
    setUserEditMode(false)
    if (!str) {
      console.log('image is not selected')
      return
    }
    if (httpMode) {
      fetch('http://localhost:4002/uploadAvatar', { body: JSON.stringify({ avatar: str.slice(str.indexOf(",") + 1) }), method: 'POST' });
    } else {
      socket.sendState({
        type: "userAvatar",
        data: {
          img: str.slice(str.indexOf(",") + 1)
        }
      })
    }
  }

  return (
    <div className="top-panel">
      {userEditMode && <UserEditPopup onClose={changeAvatar} />}

      <div className="top-panel__buttons-wrapper">
      {pageName != 'lobby' && <button className="btn top-panel__button top-panel__button--back"  onClick={() => {
          onBack();
        }}>back</button>}

        <button className="btn top-panel__button top-panel__button--change-lang" onClick={() => {
          setLang();
        }}>change lang</button>
      </div>

      <div className="user-info__wrapper">
        {socket ? <div className="user-info__user-name">{socket.name}</div> : <div>connecting...</div>}
        <div className="user-info__picture" onClick={() => {
          setUserEditMode(true)
        }}>
          {ava && <img className="user-info__img" src={`${ava}`} width="100" height="100" alt="avatar" />}
          user avatar
        </div>
        <div className="user-info__info-block">
          {/* <div className="user-info__username">Hello, <span>{user.userName}</span></div> */}
        </div>
      </div>
    </div>
  )
}