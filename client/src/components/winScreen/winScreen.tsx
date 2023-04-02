import React from "react";
import { IPlayerData, IWinData } from "../../gameLogic/interfaces";
import { PlayerClient } from "../../player_client";
import { PlayerLocal } from "../../player_local";

interface IWinScreenProps {
    winData: IWinData;
    onClose: () => void;
}

export function WinScreen({ winData, onClose }: IWinScreenProps) {
    const sortedPlayers = [...winData.players].sort((a, b)=> a.points - b.points);
    console.log(sortedPlayers);
    return (
        <div>
            <div>
                {sortedPlayers.map((player, place)=>{
                    return <div>
                        <div>{place + 1}</div>
                        <div>{player.name}</div>
                        <div>{player.points}</div>
                        <div>words: {player.correctWords.map(word=>{
                            return <div>
                                {word}
                            </div>
                        })} </div>
                    </div>
                })}
            </div>
            <button onClick={()=>{
                onClose()
            }}>play again</button>
        </div>
    )
}