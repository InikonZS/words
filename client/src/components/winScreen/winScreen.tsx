import React from "react";
import { IPlayerData, IWinData } from "../../gameLogic/interfaces";
import { PlayerClient } from "../../player_client";
import { PlayerLocal } from "../../player_local";
import "./winScreen.css";

interface IWinScreenProps {
    winData: IWinData;
    onClose: () => void;
}

export function WinScreen({ winData, onClose }: IWinScreenProps) {
    const sortedPlayers = [...winData.players].sort((a, b)=> b.points - a.points);
    console.log(sortedPlayers);
    const isDebug = false;
    return (
        <div className="winScreen">
            {isDebug && <div className="debug__size"></div>}
            <div className="winScreen__players">
                {sortedPlayers.map((player, place)=>{
                    return <div className="winScreen__player winPlayer">
                        <div className="winPlayer__name">{player.name}</div>
                        <div className="winPlayer__place"><span className="winPlayer__key winPlayer__placeKey">place: </span><span className="winPlayer__value winPlayer__placeValue">{place + 1}</span></div>
                        <div className="winPlayer__points"><span className="winPlayer__key winPlayer__pointsKey">score: </span><span className="winPlayer__value winPlayer__pointsValue">{player.points}</span></div>
                        <div className="winPlayer__words"><span className="winPlayer__key winPlayer__wordsKey">words: </span>{player.correctWords.map(word=>{
                            return <div className="winPlayer__word">
                                {word}
                            </div>
                        })} </div>
                    </div>
                })}
            </div>
            <button className="btn winScreen__close" onClick={()=>{
                onClose()
            }}>play again</button>
        </div>
    )
}