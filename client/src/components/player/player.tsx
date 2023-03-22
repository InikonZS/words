import React from "react";
import { IPlayerData } from "../../gameLogic/interfaces";
import '../../style.css';
import './player.css';

export function Player({playerData, isActive}: {playerData: IPlayerData, isActive:boolean}) {
    const {name, points, crystals, winWord} = playerData;
    return (
    <div className={`player ${isActive ? 'player--active' : ''}`}>
        <div className="player__name">
            {name}
        </div>
        <div className="player__score">
            <div className="player__points">score: {points}</div>
            <div className="player__crystals">crystals: {crystals}</div>
            <div className="player__word">word: {winWord}</div>
        </div> 
    </div>    
    )
}