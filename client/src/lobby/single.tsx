import React, { useContext, useEffect, useState } from "react";
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";
import { ChangeWordsLang } from '../components/words-lang/words-lang';
import { langList } from "../gameLogic/logicGenerator";

interface ISingleProps {
    onLocal: (lang: number)=>void;
    onBot: (lang: number)=>void;
    onBack: ()=>void;
}

export function Single({ onLocal, onBot, onBack }: ISingleProps) {
    const [langIndex, setLangIndex] = useState(0);
    const langs = langList.map(it=> it.name);
    console.log(langList);
    const {setLang, currentLang} = useLangContext();

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <div className="lobby__wrapper">
                <button onClick={()=>{
                    onBack();
                }}>back</button>
                <button onClick={()=>{
                    setLang();
                    console.log(currentLang);
                }}>change lang</button>
                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">

                    <ChangeWordsLang langs={langs} langIndex={langIndex} setLangIndex={setLangIndex} />

                    <button className="btn lobby__button lobby__button--single-bot" onClick={()=>{
                        onBot(langIndex);
                    }}>with bot</button>
                    <button className="btn lobby__button lobby__button--single-local" onClick={()=>{
                        onLocal(langIndex);
                    }}>{currentLang['singlePlayerButton']}</button>

                    </div>

                </div>
            </div>

        </div>
    )
}