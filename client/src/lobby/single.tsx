import React, { useContext, useEffect, useState } from "react";
import Socket from "../socket";
import '../style.css';
import './lobby.css';
import { useLangContext } from "../context";
import { ChangeWordsLang } from '../components/words-lang/words-lang';
import { langList } from "../gameLogic/logicGenerator";
import { TopPanel } from "../components/top-panel/top-panel";
import { decrement, getData, incrementByAmount, useAppDispatch, useAppSelector } from "../store";

interface ISingleProps {
    socket: Socket;
    pageName: string;
    onLocal: (lang: number)=>void;
    onBot: (lang: number)=>void;
    onBack: ()=>void;
}

export function Single({ socket, pageName, onLocal, onBot, onBack }: ISingleProps) {
    const [langIndex, setLangIndex] = useState(0);
    const langs = langList.map(it=> it.name);
    console.log(langList);
    const {setLang, currentLang} = useLangContext();
    const value = useAppSelector(state=> state);
    const dispatch = useAppDispatch();

    //const [items, setItems] = useState([]);
    return (
        <div className="lobby">
            <p>{JSON.stringify(value)}</p>
            <button onClick={()=>{
                console.log('click')
                dispatch(incrementByAmount(10));
            }}>inc</button>
                    <button onClick={()=>{
                console.log('click')
                dispatch(getData(''));
            }}>thunk</button>
            <div className="lobby__wrapper">
                {/* <button onClick={()=>{
                    onBack();
                }}>back</button>
                <button onClick={()=>{
                    setLang();
                    console.log(currentLang);
                }}>change lang</button> */}

                <TopPanel socket={socket} onBack={onBack} pageName={pageName}/>             

                <div className="lobby__center-container">
                    <div className="lobby__buttons-wrapper">
                    <h2 className="lobby__title">Singleplayer mode</h2>

                    <ChangeWordsLang langs={langs} langIndex={langIndex} setLangIndex={setLangIndex} />                   

                    <h3>Select game type:</h3>

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