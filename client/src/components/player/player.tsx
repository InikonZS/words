import React from "react";
import { IPlayerData } from "../../gameLogic/interfaces";
import '../../style.css';
import './player.css';

export function Player({playerData, isActive}: {playerData: IPlayerData, isActive:boolean}) {
    return (
    <div className={`player ${isActive ? 'player--active' : ''}`}>
        <div className="player__name">
            {playerData.name}
        </div>
        <div className="player__score">
            <div className="player__points">score: {playerData.points}</div>
            <div className="player__crystals">crystals: {playerData.crystals}</div>
            <div className="player__word">word: {playerData.winWord}</div>
        </div> 
    </div>    
    )
}