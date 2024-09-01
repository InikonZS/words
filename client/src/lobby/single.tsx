import React, { useContext, useEffect, useState } from "react";
import Socket from "../socket";
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";
import { ChangeWordsLang } from '../components/words-lang/words-lang';
import { langList } from "../gameLogic/logicGenerator";
import { TopPanel } from "../components/top-panel/top-panel";

interface ISingleProps {
    socket: Socket;
    pageName: string;
    onLocal: (lang: number, hexMode: boolean)=>void;
    onBot: (lang: number, hexMode: boolean)=>void;
    onBack: ()=>void;
}

export function Single({ socket, pageName, onLocal, onBot, onBack }: ISingleProps) {
    const [langIndex, setLangIndex] = useState(0);
    const [fieldHexMode, setFieldHexMode] = useState<boolean>(false);
    const langs = langList.map(it=> it.name);
    console.log(langList);
    const {setLang, currentLang} = useLangContext();

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <div className="lobby__wrapper">               

                <TopPanel socket={socket} onBack={onBack} pageName={pageName}/>             

                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">
                    <h2 className="lobby__title">Singleplayer mode</h2>

                    <ChangeWordsLang langs={langs} langIndex={langIndex} setLangIndex={setLangIndex} />   

                    <button onClick={()=>setFieldHexMode(last=> !last)}>{fieldHexMode? 'hex' : 'rect'}</button>                

                    <h3>Select game type:</h3>

                    <button className="btn lobby__button lobby__button--single-bot" onClick={()=>{
                        onBot(langIndex, fieldHexMode);
                    }}>with bot</button>
                    <button className="btn lobby__button lobby__button--single-local" onClick={()=>{
                        onLocal(langIndex, fieldHexMode);
                    }}>{currentLang['singlePlayerButton']}</button>

                    </div>

                </div>
            </div>

        </div>
    )
}