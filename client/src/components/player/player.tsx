import React from "react";
import { IPlayerData } from "../../gameLogic/interfaces";
import '../../style.css';
import './player.css';

export function Player({playerData, isActive}: {playerData: IPlayerData, isActive:boolean}) {
    const {name, points, crystals, winWord} = playerData;
    return (
    <div className={`player ${isActive ? 'player--active' : ''}`}>
        {!playerData.connected && <div className="player__disconnect">disconnected</div>}
        <div className="player__name">
            {name}
        </div>
        <div className="player__score">
            <div className="player__points">
                <span className="player__points-text">score:</span><span className="player__points-value">{points}</span>
            </div>
            <div className="player__crystals">
                {crystals>0?new Array(crystals).fill(0).map(it=><div className="player__crystal"></div>): <div className="player__no-crystals">no crystals</div>}
            </div>
            <div className="player__word">word: {winWord}</div>
        </div> 
    </div>    
    )
}