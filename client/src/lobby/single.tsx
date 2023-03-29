import React, { useContext, useEffect, useState } from "react";
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";

interface ISingleProps {
    onLocal: (lang: number)=>void;
    onBot: (lang: number)=>void;
    onBack: ()=>void;
}

export function Single({ onLocal, onBot, onBack }: ISingleProps) {
    const [langIndex, setLangIndex] = useState(0);
    const langs = ['en', 'ru'];
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
                    <div>
                        <div>words language: </div>
                        <button onClick={()=>{
                            setLangIndex(last=> (last + 1) % langs.length)
                        }}>left</button>
                        <span>{langs[langIndex]}</span>
                        <button onClick={()=>{
                            setLangIndex(last=> ((last + langs.length) - 1) % langs.length) 
                        }}>right</button>
                    </div>
                    <button className="btn lobby__button lobby__button--create" onClick={()=>{
                        onBot(langIndex);
                    }}>with bot</button>
                    <button className="btn lobby__button lobby__button--create" onClick={()=>{
                        onLocal(langIndex);
                    }}>{currentLang['singlePlayerButton']}</button>

                    </div>

                </div>
            </div>

        </div>
    )
}