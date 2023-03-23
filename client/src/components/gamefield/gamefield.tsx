import React, { useEffect, useRef, useState } from "react";
import Socket from "../../socket";
import { IBonus, ILetter, IPlayerData } from '../../gameLogic/interfaces';
import { isClosest, traceField, traceOne } from '../../gameLogic/logicTools';
import { Player } from '../player/player';
import { GameLogic } from '../../gameLogic/gameLogic';
import { PlayerClient } from '../../player_client';
import '../../style.css';
import './gamefield.css';
import { LineOverlay } from "../../animatedList";

export default function GameField({player, onLeave}: {player: PlayerClient, onLeave: ()=>void}){
    const [letters, setLetters] = useState<Array<Array<ILetter>>>(null);
    const [selected, setSelected] = useState<Array<ILetter>>([]);
    const [animate, setAnimate] = useState<Array<ILetter>>([]);
    const [logic, setLogic] = useState<GameLogic>(null);
    //const [points, setPoints] = useState(0);
    //const [crystals, setCrystals] = useState(0);
    const [players, setPlayers] = useState<Array<IPlayerData>>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [client, setClient] = useState<PlayerClient>(null);
    const [pointer, setPointer] = useState<{x: number, y: number}>(null);
    const fieldRef = useRef<HTMLDivElement>();
    //const [winWord, setWinWord] = useState('');

    useEffect(() => {
        /*const logic = new GameLogic();
        logic.onGameState = (state)=>{
            setLetters(state.letters);
            setPlayers(state.players);
            setCurrentPlayerIndex(state.currentPlayerIndex);
        }
        logic.onCorrectWord = (word) => {
            setAnimate(word);
            setTimeout(()=>{
                setAnimate([]);
            }, 1000);
        }
        setLetters(logic.letters);
        setPlayers(logic.players);
        setCurrentPlayerIndex(logic.currentPlayerIndex);
        setLogic(logic);*/
    }, [])

    useEffect(() => {
        //const socket = new Socket();
        const client = player;//new PlayerClient(socket);
        /*socket.onConnect = ()=>{
            console.log('connected');
            
            
        }*/
        setClient(client);
        client.getState().then(res => {
            const logic = res;
            setLetters(logic.letters);
            setPlayers(logic.players);
            setCurrentPlayerIndex(logic.currentPlayerIndex);
            //setLogic(logic);
        })
        client.onGameState = (state) => {
            setLetters(state.letters);
            setPlayers(state.players);
            //if (currentPlayerIndex !== state.currentPlayerIndex){
            setCurrentPlayerIndex(state.currentPlayerIndex);
            //}
        }
        client.onSelectLetter = (word) => {
            setSelected(word);
        }
        client.onCorrectWord = (word) => {
            setAnimate(word);
            setSelected([]);
            setTimeout(() => {
                setAnimate([]);
            }, 1000);
        }
        /*socket.onMessage = (message)=>{
            if (message.type == 'state'){
                const state = message.data;
                
            }
            if (message.type == 'correctWord'){
                const word = message.data;
                setAnimate(word);
                setSelected([]);
                setTimeout(()=>{
                    setAnimate([]);
                }, 1000);
            }
            if (message.type == 'selectLetter'){
                setSelected(message.data);
            } 
        }*/

        return () => {
            //socket.destroy();
        }
    }, [player]);

    const submitWord = (selected: Array<ILetter>) => {
        client.submitWord(selected);
        /*socket.sendState({
            type: 'submitWord',
            data: {selected}
        })*/
    }

    return (
        letters && (
        <div className="game__wrapper">
            <div>
                <button onClick={()=>{
                    client.leaveRoom().then(res=>{
                        console.log(res);
                        onLeave();
                    })
                }}>leave</button>
            </div>
            
            <div className="game__center-container">
                <div className="players">
                    {players.map((player, index) => {
                        return <Player playerData={player} isActive={currentPlayerIndex == index}></Player>
                    })}
                </div>
                <div className="field__group">
                <div className="field" ref={fieldRef} onMouseMove={(e)=>{
                    if (fieldRef.current && selected && selected.length){
                        const {left, top} =fieldRef.current.getBoundingClientRect();
                        setPointer({x: e.clientX - left, y: e.clientY - top});
                    }
                }}>
                    {
                        letters.map(row => {
                            return <div className="row">
                                {
                                    row.map(letter => {
                                        return <div className={`letter ${selected.find(it => it.id == letter.id) ? "letter_selected" : ""} ${animate.find(it => it.id == letter.id) ? "letter_hide" : ""}`}
                                            onMouseDown={() => {
                                                //const list = traceOne(letters, letter.x, letter.y, [letter]);
                                                //console.log(list);
                                                //const all = traceField(letters);
                                                //console.log(all);
                                                //setSelected([letter]);
                                                /*socket.sendState({
                                                    type: 'selectLetter',
                                                    data: [letter]
                                                })*/
                                                client.selectLetter([letter]);
                                                window.addEventListener('mouseup', ()=>{
                                                    setPointer(null);
                                                    submitWord(selected);
                                                    /*socket.sendState({
                                                        type: 'selectLetter',
                                                        data: []
                                                    })*/
                                                    client.selectLetter([]);
                                                }, {once: true});
                                            }}
                                            onMouseMove={(e) => {
                                                //console.log(fieldRef.current.getBoundingClientRect())
                                                
                                                if (selected.length && !selected.find(it => it.id == letter.id) && isClosest(selected[selected.length - 1].x, selected[selected.length - 1].y, letter.x, letter.y)) {
                                                    //setSelected(last=> [...last, letter])
                                                    /*socket.sendState({
                                                        type: 'selectLetter',
                                                        data: [...selected, letter]
                                                    })*/
                                                    client.selectLetter([...selected, letter]);
                                                } else if (selected.length > 1 && selected[selected.length - 2].id == letter.id) {
                                                    //setSelected(last=> [...last.slice(0, last.length-1)])
                                                    /*socket.sendState({
                                                        type: 'selectLetter',
                                                        data: [...selected.slice(0, selected.length-1)]
                                                    })*/
                                                    client.selectLetter([...selected.slice(0, selected.length - 1)]);
                                                }
                                            }}
                                            onMouseUp={() => {
                                             //   setPointer(null);
                                             //   submitWord(selected);
                                                /*socket.sendState({
                                                    type: 'selectLetter',
                                                    data: []
                                                })*/
                                              //  client.selectLetter([]);
                                                //setSelected([]); 
                                            }}>
                                            {letter.bonus.find(it => it.name == 'crystal') && <div className="crystal"></div>}
                                            {letter.letter}
                                        </div>
                                    })}
                            </div>
                        })
                    }
                </div>
                <LineOverlay word={selected} pointer={pointer}></LineOverlay>
                </div>
            </div>
        </div>
    )
    )
}

