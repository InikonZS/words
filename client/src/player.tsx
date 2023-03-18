import React from "react";
import { IPlayerData } from "./gameLogic/interfaces";

export function Player({playerData, isActive}: {playerData: IPlayerData, isActive:boolean}) {
    return (
    <div className={`player ${isActive ? 'player_active' : ''}`}>
        <div>
            {playerData.name}
        </div>
        <div className="score">
            <div className="points">score: {playerData.points}</div>
            <div className="crystals">crystals: {playerData.crystals}</div>
            <div>word: {playerData.winWord}</div>
        </div> 
    </div>
    
    )
}