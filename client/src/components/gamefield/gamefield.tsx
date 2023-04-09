import React, { useEffect, useMemo, useRef, useState } from "react";
import Socket from "../../socket";
import { IBonus, ILetter, IPlayerData, IWinData } from '../../gameLogic/interfaces';
import { isClosest, traceField, traceOne } from '../../gameLogic/logicTools';
import { Player } from '../player/player';
import { GameLogic } from '../../gameLogic/gameLogic';
import { PlayerClient } from '../../player_client';
import '../../style.css';
import './gamefield.css';
import { LineOverlay, WordOverlay } from "../../animatedList";
import { moveTime } from "../../consts";
import { PlayerLocal } from "../../player_local";
import { Hints } from '../hints/hints';

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
    const [logic, setLogic] = useState<GameLogic>(null);
    //const [points, setPoints] = useState(0);
    //const [crystals, setCrystals] = useState(0);
    const [players, setPlayers] = useState<Array<IPlayerData>>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [client, setClient] = useState<PlayerClient | PlayerLocal>(null);
    const [pointer, setPointer] = useState<{ x: number, y: number }>(null);
    const fieldRef = useRef<HTMLDivElement>();
    const [winWord, setWinWord] = useState<Array<ILetter>>(null);
    const [time, setTime] = useState(0);
    const [cTime, setCTime] = useState(Date.now());
    const [round, setRound] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
    const [isStarted, setStarted] = useState<boolean>(false);
    const [spectators, setSpectators] = useState<Array<string>>(null);
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
            const logic = res;
            setLetters(logic.letters);
            setPlayers(logic.players);
            setCurrentPlayerIndex(logic.currentPlayerIndex);
            setTime(Date.now() + res.time);
            setRound({ current: res.currentRound, total: res.totalRounds });
            setStarted(res.isStarted);
            setSpectators(res.spectators);
            setStartRequestTime(res.isStartRequested ? res.startRequestTime + Date.now() : null);
            setHintMask(null);
            //setLogic(logic);
        })
        client.onGameState = (state) => {
            setLetters(state.letters);
            setPlayers(state.players);
            //if (currentPlayerIndex !== state.currentPlayerIndex){
            setCurrentPlayerIndex(state.currentPlayerIndex);
            setTime(Date.now() + state.time);
            setRound({ current: state.currentRound, total: state.totalRounds });
            setStarted(state.isStarted);
            setSpectators(state.spectators);
            setStartRequestTime(state.isStartRequested ? state.startRequestTime + Date.now() : null);
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
        /*socket.sendState({
            type: 'submitWord',
            data: {selected}
        })*/
    }

    useEffect(() => {
        if (selected.length) {
            const h = () => {
                if (player.playerName != players[currentPlayerIndex]?.name) {
                    return;
                }
                setPointer(null);
                submitWord(selected);
                setWinWord(selected);
                /*socket.sendState({
                    type: 'selectLetter',
                    data: []
                })*/
                client.selectLetter([]);
            };
            window.addEventListener('mouseup', h, { once: true });
            return () => {
                window.removeEventListener('mouseup', h);
            }
        }

    }, [selected, currentPlayerIndex]);

    useEffect(() => {
        setPointer(null);
        setSelected([])
    }, [currentPlayerIndex])

    useEffect(() => {
        if (winWord) {
            const tm = setTimeout(() => {
                setWinWord(null);
            }, 2000);
            return () => clearTimeout(tm);
        }
    }, [winWord])

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

    const numbersToGradient = (arr: Array<number>) => {
        const full = 360;
        const colors = ['#f00', '#f90', '#ff0', '#9f0', '#0f0', '#090', '#099', '#09f', '#0ff', '#f99', '#ff9', '#9f9', '#999', '#99f', '#9ff'];
        if (!arr.length) {
            return null;
        }
        if (arr.length == 1) {
            return `conic-gradient(${colors[arr[0]]}7 0deg, ${colors[arr[0]]}7 360deg)`;
        }

        const ang = full / arr.length;
        const initial = [0, 45, 0, 45][arr.length - 1] || 0;
        const pairs = arr.map((it, i) => {
            return {
                angle: ang * i + initial,
                color: colors[it % colors.length]
            }
        })
        const records: Array<string> = [];
        pairs.forEach(it => {
            records.push(`${it.color}7 ${it.angle}deg`);
            records.push(`${it.color}7 ${it.angle + ang}deg`);
        });
        const last = records.pop();
        records.unshift(`${pairs[pairs.length - 1].color}7 ${initial}deg`);
        return `conic-gradient(${records.join(', ')})`;
        //console.log(`conic-gradient(${pairs.map(it=> `${it.color}7 ${it.angle}deg`).join(', ')})`)
        //return `conic-gradient(${pairs.map(it=> `${it.color}7 ${it.angle}deg, ${it.color}7 ${it.angle + ang}deg`).join(', ')})`
        //conic-gradient(#ff06 45deg, #f006,45deg, #f006 225deg, #ff06 225deg)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (player.playerName != players[currentPlayerIndex]?.name) {
            return;
        }

        if (fieldRef.current && selected && selected.length) {
            const { left, top } = fieldRef.current.getBoundingClientRect();
            const paddingOffset = scale * 30;
            const point = { x: e.touches[0].clientX - left - paddingOffset, y: e.touches[0].clientY - top - paddingOffset };
            setPointer(point);
            if (Math.hypot(point.x % (70 * scale) - 35 * scale, point.x % (70 * scale) - 35 * scale) < 20 * scale) {
                const letter = letters[Math.floor(point.y / ((60 + 10) * scale))]?.[Math.floor(point.x / ((60 + 10) * scale))];
                //console.log(letter);
                if (letter) {
                    if (selected.length && !selected.find(it => it.id == letter.id) && isClosest(selected[selected.length - 1].x, selected[selected.length - 1].y, letter.x, letter.y)) {
                        client.selectLetter([...selected, letter]);
                    } else if (selected.length > 1 && selected[selected.length - 2].id == letter.id) {
                        client.selectLetter([...selected.slice(0, selected.length - 1)]);
                    }
                }
            }
        } else {
            setPointer(null);
        }
    }

    const handleWrapperMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (player.playerName != players[currentPlayerIndex]?.name) {
            return;
        }
        if (fieldRef.current && selected && selected.length) {
            const { left, top } = fieldRef.current.getBoundingClientRect();
            const paddingOffset = scale * 30;
            setPointer({ x: e.clientX - left - paddingOffset, y: e.clientY - top - paddingOffset });
            //setPointer({x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY});
        } else {
            setPointer(null);
        }
    }

    const getLetterClassName = (letter: ILetter) => {
        return `letter ${selected.find(it => it.id == letter.id) ? "letter_selected" : ""} ${animate.find(it => it.id == letter.id) ? "letter_hide" : ""}`
    }

    const handleMouseDown = (letter: ILetter) => {
        if (player.playerName != players[currentPlayerIndex]?.name) {
            return;
        }
        client.selectLetter([letter]);
    }

    const handleMouseMove = (letter: ILetter) => {
        if (player.playerName != players[currentPlayerIndex]?.name) {
            return;
        }
        if (selected.length && !selected.find(it => it.id == letter.id) && isClosest(selected[selected.length - 1].x, selected[selected.length - 1].y, letter.x, letter.y)) {
            client.selectLetter([...selected, letter]);
        } else if (selected.length > 1 && selected[selected.length - 2].id == letter.id) {
            client.selectLetter([...selected.slice(0, selected.length - 1)]);
        }
    }

    return (
        letters && (
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
                        {spectators.map((player, index) => {
                            return <div>{player}</div>
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

                        <div className="field__item field__item--center">
                            <div className="field__group">
                                <div className="field"
                                    ref={fieldRef}
                                    onMouseMove={handleWrapperMouseMove}
                                    onTouchMove={handleTouchMove}
                                >
                                    {
                                        letters.map((row, ri) => {
                                            return <div className="row">
                                                {
                                                    row.map((letter, li) => {
                                                        return <div className={getLetterClassName(letter)}
                                                            style={{
                                                                'background-image': hintMask && numbersToGradient(hintMask[ri][li])
                                                            }}
                                                            onMouseDown={() => {
                                                                handleMouseDown(letter);
                                                            }}
                                                            onMouseMove={() => {
                                                                handleMouseMove(letter);
                                                            }}

                                                            onTouchStart={(e) => {
                                                                e.preventDefault();
                                                                if (player.playerName != players[currentPlayerIndex]?.name) {
                                                                    return;
                                                                }
                                                                client.selectLetter([letter]);
                                                            }
                                                            }

                                                            onTouchEnd={(e) => {
                                                                if (player.playerName != players[currentPlayerIndex]?.name) {
                                                                    return;
                                                                }
                                                                setPointer(null);
                                                                submitWord(selected);
                                                                setWinWord(selected);
                                                                client.selectLetter([]);
                                                            }}
                                                        >
                                                            {letter.bonus.find(it => it.name == 'crystal') && <div className="crystal"></div>}
                                                            {letter.letter}
                                                            {false && hintMask && hintMask[ri]?.[li] && <div style={{ fontSize: '8px' }}>{hintMask[ri][li].join('/')}</div>}
                                                        </div>
                                                    })}
                                            </div>
                                        })
                                    }
                                </div>
                                <LineOverlay word={selected} pointer={pointer} base={scale}></LineOverlay>
                                {winWord && <WordOverlay word={winWord}></WordOverlay>}
                            </div>

                        </div>

                        <div className="field__item field__item--right">
                            <Hints crystals={players.find(it => it.name == player.playerName)?.crystals} onShuffle={() => {
                                player.shuffle();
                            }}
                                onShowWords={() => {
                                    setWords(player.showWords());
                                }}
                                onShowMask={() => {
                                    setHintMask(player.showMask());
                                }}
                            />
                        </div>

                    </div>

                </div>
            </div>
        )
    )
}

