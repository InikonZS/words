import React, { useEffect, useState } from "react";
import Socket from "./socket";
import { IBonus, ILetter, IPlayerData } from './gameLogic/interfaces';
import { abc, formattedWords, freqRandom, generateLetters, getPoints, isClosest, traceField, traceOne } from './gameLogic/logicTools';
import { Player } from './player';

export default function GameField(){
    const [letters, setLetters] = useState<Array<Array<ILetter>>>(generateLetters(10, 10));
    const [selected, setSelected] = useState<Array<ILetter>>([]);
    const [animate, setAnimate] = useState<Array<ILetter>>([]);
    //const [points, setPoints] = useState(0);
    //const [crystals, setCrystals] = useState(0);
    const [players, setPlayers] = useState<Array<IPlayerData>>([
        {
            name: 'player',
            points: 0,
            crystals: 0,
            winWord: ''
        },
        {
            name: 'bot',
            points: 0,
            crystals: 0,
            winWord: ''
        }
    ]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    //const [winWord, setWinWord] = useState('');

    useEffect(()=>{
        setLetters(last=>{
            return last.map(row=> row.map(letter=>{
                if (Math.random() < 0.1){
                    letter.bonus = [
                        {
                            name: 'crystal',
                            apply: ()=>{
                                setPlayers(last=>{
                                    const current = last[currentPlayerIndex];
                                    current.crystals += 1;
                                    return last;
                                })
                                //setCrystals(last => last + 1);
                            }
                        }
                    ]
                }
                return letter;
            }));
            //return last;
        });
    }, []);

    useEffect(()=>{
        const socket = new Socket();
        socket.onConnect = ()=>{
            console.log('connected');
        }
        socket.onMessage = (message)=>{
        
        }
        return ()=>{
            socket.destroy();
        }
    }, []);

    const submitWord = (selected:Array<ILetter>)=>{
        const word = selected.map(it=> it.letter).join('');
        if (formattedWords.includes(word)){
            console.log('correct ', word);
            setPlayers(last=>{
                const current = last[currentPlayerIndex];
                current.points += getPoints(selected);
                current.winWord = selected.map(it=>it.letter).join('');
                return last;
            })
            //setPoints(last=> last + getPoints(selected));
            selected.map(it=>it.bonus.forEach(jt=> jt.apply()))
            setAnimate(selected);
            setTimeout(()=>{
                setLetters(last=>{
                    const newLetters = last.map(row=> row.map(item=>{
                        if (selected.find(it=> it.id == item.id)){
                            const bonus: Array<IBonus> = [];
                            if (Math.random() < 0.1) {
                                bonus.push(
                                    {
                                        name: 'crystal',
                                        apply: ()=>{
                                            //setCrystals(last => last + 1);
                                            setPlayers(last=>{
                                                const current = last[currentPlayerIndex];
                                                current.crystals += 1;
                                                return last;
                                            })
                                        }
                                    }
                                );
                            }
                            return {
                                ...item,
                                letter: abc[freqRandom()],
                                bonus: bonus
                            } 
                        } else {
                            return item
                        }
                        
                    }))
                    return newLetters;
                });
                setAnimate([]);
                setCurrentPlayerIndex(last => (last + 1) % players.length);
            }, 1000);
            
        } else {
            console.log('incorrect ', word);
        }
    }

    useEffect(()=>{
        if (players[currentPlayerIndex].name == 'bot'){
            const allWords = traceField(letters);
            const linearList: Array<Array<ILetter>> = [];
            allWords.forEach(row=>{
                row.forEach(words=>{
                    words.forEach(word=>{
                        linearList.push(word);
                    })
                })
            });

            linearList.sort((a, b)=>{
                return b.length - a.length;
            });
            const word = linearList[0];
            if (word){
                setTimeout(()=>{
                    setSelected(word);
                    setTimeout(()=>{
                        /*setPlayers(last=>{
                            const current = last[currentPlayerIndex];
                            current.winWord = word.map(it=>it.letter).join('');
                            return last;
                        })*/
                        //setWinWord(word.map(it=>it.letter).join(''));
                        submitWord(word); 
                        setSelected([]); 
                    }, 3000); 
                }, 1000);  
            }
        }
    }, [currentPlayerIndex]);

    return (
    <div>
        <div className="players">
            {players.map(player=>{
                return <Player playerData={player}></Player>
            })}
        </div>
    <div className="field">
        {
            letters.map(row=> {
                return <div className="row">
                    {
                    row.map(letter=> {
                    return <div className={`letter ${selected.find(it=>it.id == letter.id) ?  "letter_selected" : ""} ${animate.find(it=>it.id == letter.id) ?  "letter_hide" : ""}`} 
                    onMouseDown={()=>{
                        const list = traceOne(letters, letter.x, letter.y, [letter]);
                        console.log(list);
                        //const all = traceField(letters);
                        //console.log(all);
                        setSelected([letter]);
                    }}
                    onMouseMove={()=>{
                        if (selected.length && !selected.find(it=>it.id == letter.id) && isClosest(selected[selected.length-1].x, selected[selected.length-1].y, letter.x, letter.y)){
                            setSelected(last=> [...last, letter])
                        } else if(selected.length>1 && selected[selected.length-2].id == letter.id) {
                            setSelected(last=> [...last.slice(0, last.length-1)])
                        }
                    }}
                    onMouseUp = {()=>{
                        submitWord(selected);
                        setSelected([]); 
                    }}>
                        {letter.bonus.find(it=>it.name == 'crystal') && <div className="crystal"></div>}
                        {letter.letter}
                    </div>
                    })}
                </div>
            })
        }
    </div>
    </div>
    )
}

