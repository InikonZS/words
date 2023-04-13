import React, { useEffect, useMemo, useRef, useState } from "react";
import Socket from "../../socket";
import { IBonus, ILetter, IPlayerData, IWinData } from '../../gameLogic/interfaces';
import { isClosest, traceField, traceOne } from '../../gameLogic/logicTools';
import { Player } from '../player/player';
//import { GameLogic } from '../../gameLogic/gameLogic1';
import { PlayerClient } from '../../player_client';
import '../../style.css';
import './gamefield.css';
import { LineOverlay, WordOverlay } from "../../animatedList";
import { moveTime } from "../../consts";
import { PlayerLocal } from "../../player_local";
import { Hints } from '../hints/hints';
import { Letters } from './letters';

interface IGameFieldProps {
    player: PlayerClient | PlayerLocal;
    onLeave: () => void;
    onWin: (data: IWinData) => void;
    scale: number;
}

export default function GameField({ player, onLeave, onWin, scale }: IGameFieldProps) {
    const [letters, setLetters] = useState<Array<Array<ILetter>>>(null);
    const [hintMask, setHintMask] = useState<Array<Array<Array<number>>>>(null);
    const [selected, setSelected] = useState<Array<ILetter>>([]);
    const [animate, setAnimate] = useState<Array<ILetter>>([]);
    //const [logic, setLogic] = useState<GameLogic>(null);
    //const [points, setPoints] = useState(0);
    //const [crystals, setCrystals] = useState(0);
    const [players, setPlayers] = useState<Array<IPlayerData>>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [client, setClient] = useState<PlayerClient | PlayerLocal>(null);
    
    // const fieldRef = useRef<HTMLDivElement>();
    
    const [time, setTime] = useState(0);
    const [cTime, setCTime] = useState(Date.now());
    const [round, setRound] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
    const [isStarted, setStarted] = useState<boolean>(false);
    const [spectators, setSpectators] = useState<Array<{name: string}>>(null);
    const [startRequestTime, setStartRequestTime] = useState(null);
    const [words, setWords] = useState<Array<string>>(null);
    const [showStartGame, setShowStartGame] = useState(true);

    useEffect(() => {
        const tm = setInterval(() => {
            setCTime(Date.now());
        }, 200);
        return () => {
            clearInterval(tm);
        }
    }, [time, startRequestTime]);

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
            const logic = res.game;
            if (logic){
                setLetters(logic.letters);
                setPlayers(logic.players);
                setCurrentPlayerIndex(logic.currentPlayerIndex);
                setTime(Date.now() + logic.time);
                setRound({ current: logic.currentRound, total: logic.totalRounds });
            }
            setStarted(res.isStarted);
            setSpectators(res.spectators);
            setStartRequestTime(res.isStartRequested ? res.startRequestTime + Date.now() : null);
            setHintMask(null);
            //setLogic(logic);
        })

        client.onRoomState = (state) =>{
            setStarted(state.isStarted);
            setSpectators(state.spectators);
            setStartRequestTime(state.isStartRequested ? state.startRequestTime + Date.now() : null);  
            if (state.game){
                client.onGameState(state.game); 
            }         
        }

        client.onGameState = (state) => {
            setLetters(state.letters);
            setPlayers(state.players);
            //if (currentPlayerIndex !== state.currentPlayerIndex){
            setCurrentPlayerIndex(state.currentPlayerIndex);
            setTime(Date.now() + state.time);
            setRound({ current: state.currentRound, total: state.totalRounds });

            setHintMask(null);
            setWords(null);
            //console.log(isStarted, state.currentRound);
            if ((state.currentRound >= state.totalRounds)) {
                onWin({ players: state.players });
            }
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
    }    

    useEffect(() => {
        setSelected([])
      }, [currentPlayerIndex])   

    const getStartButtonText = () => {
        if (isStarted) {
            return 'started';
        } else {
            if (startRequestTime != null) {
                return 'wait for players ' + Math.floor((Math.max((startRequestTime - cTime) / 1000, 0)))
            } else {
                return 'click to start'
            }
        }
    }   

    return (
        (
            <div className="game__wrapper">

                <div className={`start-block ${showStartGame ? "start-block--show" : "start-block--hide"}`}>
                    <button className="btn start-block__button" onClick={() => {
                        player.startGame();
                        setShowStartGame(false);
                    }}> click to start</button>
                </div>

                <div className="game__nav">
                    <span> room: {player.roomName}</span>
                    {startRequestTime}

                    <button onClick={() => {
                        player.startGame();
                    }}>{getStartButtonText()} </button>

                    <button onClick={() => {
                        client.leaveRoom().then(res => {
                            console.log(res);
                            onLeave();
                        })
                    }}>leave</button>

                    <button onClick={() => {
                        document.body.requestFullscreen();
                    }}>fullscreen</button>
                </div>

                <div className="game__center-container">
                    <div className="players">
                        {spectators && spectators.map((player, index) => {
                            return <div>{player.name}</div>
                        })}
                    </div>
                    <div className="players">
                        {players.map((player, index) => {
                            return <Player playerData={player} isActive={currentPlayerIndex == index}></Player>
                        })}
                    </div>


                    <div>{Math.floor(Math.max((time - cTime) / 1000, 0))}</div>
                    <div className="game__rounds">round: {round.current} / {round.total}</div>
                    <div className="field__wrapper">

                        <div className="field__item field__item--left">
                            {words && <div className="hint-words">
                                {words.slice(0, 20).map(it => {
                                    return <span>{it} </span>
                                })}
                            </div>}
                        </div>

                        {letters && <div className="field__item field__item--center">
                            <Letters onSubmit={(selected) => {
                                submitWord(selected);
                            } } 
                            client={player} players={players} currentPlayerIndex={currentPlayerIndex} selected={selected} 
                            scale={scale} letters={letters} animate={animate} hintMask={hintMask} />
                        </div>}

                        <div className="field__item field__item--right">
                            <Hints crystals={players.find(it => it.name == player.playerName)?.crystals} onShuffle={() => {
                                player.shuffle();
                            }}
                                onShowWords={() => {
                                    player.showWords().then(res=>{
                                         setWords(res);
                                    })
                                }}
                                onShowMask={() => {
                                    player.showMask().then(res=>{
                                        setHintMask(res);
                                    })  
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

