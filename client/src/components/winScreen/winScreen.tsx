import React from "react";
import { PlayerClient } from "../../player_client";
import { PlayerLocal } from "../../player_local";

interface IWinData {

}

interface IWinScreenProps {
    winData: IWinData;
    onClose: () => void;
}

export function WinScreen({ winData, onClose }: IWinScreenProps) {
    return (
        <div>
            <button onClick={()=>{
                onClose()
            }}>play again</button>
        </div>
    )
}