import React, { useState } from "react";
import './room-panel.css';
import { PlayerClient } from "../../player_client";
import { PlayerLocal } from "../../player_local";

interface IRoomPanelProps {
    spectators: Array<{name: string}>,
    client: PlayerClient | PlayerLocal,
    onLeave: ()=>void
}

export function RoomPanel({ spectators, client, onLeave }: IRoomPanelProps) {
    return (
        <div className="room-panel">
            <div className="room-panel__head">
                <div className="room-panel__room-name"> room: {client.roomName}</div>
                {/*startRequestTime*/}

                {/*<button onClick={() => {
                    client.startGame();
                }}>{getStartButtonText()} </button>*/}

                <button className="btn  room-panel__button room-panel__button--back" onClick={() => {
                    client.leaveRoom().then(res => {
                        console.log(res);
                        onLeave();
                    })
                }}>leave</button>
            </div>

            <div className="room-panel__players">
                {spectators && spectators.map((player, index) => {
                    return <div className="room-panel__player">{player.name}</div>
                })}
            </div>
        </div>
    )
}