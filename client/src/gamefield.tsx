import React, { useEffect, useState } from "react";
import {words} from "./words";

const formattedWords = words.split('\n').filter(it=> it.length>=2);
console.log(formattedWords);
const abc = 'abcdefghijklmnopqrstuvwxyz';
const frequency = [
    7.8,
    2,
    4,
    3.8,
    11,
    1.4,
    3,
    2.3,
    8.6,
    0.21,
    0.97,
    5.3,
    2.7,
    7.2,
    6.1,
    2.8,
    0.19,
    7.3,
    8.7,
    6.7,
    3.3,
    1,
    0.91,
    0.27,
    1.6,
    0.44
];

function getSumFreq(){
    let sum = 0;
    const sumFreq = frequency.map(it=>{
        const res = it + sum;
        sum = res;
        return res;
    });
    return sumFreq;
}

const sumFreq = getSumFreq();
console.log(sumFreq);

function freqRandom(){
    const sum = frequency.reduce((ac, it)=> ac + it, 0);
    const rnd = Math.random() * sum;
    const ind = sumFreq.findIndex(it=>rnd<it);
    return ind;
}
//(window as any).rnd = freqRandom;
console.log(freqRandom());

function generateLetters(x: number, y: number){
    return new Array(y).fill(null).map((it, i)=> new Array(x).fill('').map((jt, j)=> {
        return {
            letter: abc[freqRandom()],//abc[Math.floor(Math.random() * abc.length)],
            x: j,
            y: i,
            id: `x${j}y${i}`
    }}));
}


function isClosest(x: number, y:number, x1: number, y1:number){
    return (((x - x1 == -1) || (x - x1 == 1) || (x - x1 == 0)) && ((y - y1 == -1) || (y - y1 == 1) || (y - y1 == 0))) && !(x == x1 && y == y1)
}

function checkWord(word: Array<ILetter>): [boolean, string]{
    const wordString = word.map(it=> it.letter).join('');
    return [formattedWords.includes(wordString), wordString];
}

function findWordsByPart(part:string){
    return formattedWords.filter(word=>{
        const partWord = word.slice(0, part.length);
        return partWord == part;
    })
}

function traceOne(letters:Array<Array<ILetter>>, x: number, y:number, current:Array<ILetter>){
    const closeList = [
        letters[y-1]?.[x],
        letters[y+1]?.[x],
        letters[y]?.[x+1],
        letters[y]?.[x-1],
        letters[y-1]?.[x-1],
        letters[y+1]?.[x-1],
        letters[y-1]?.[x+1],
        letters[y+1]?.[x+1],
    ].filter(it => it).filter(jt=>{
        return !current.find(it=>it.id == jt.id);
    });
    //const wordList:Array<string> = [];
    const fullWordList:Array<Array<ILetter>> = [];
    const currentWord = current.map(it=> it.letter).join('');
    for (const letter of closeList){
        const findWord = currentWord + letter.letter;
        const findFullWord = [...current, letter];
        const shortList = findWordsByPart(findWord);
        if (shortList.length){
            if (/*formattedWords*/shortList.includes(findWord)){
                //console.log('found ', currentWord + letter.letter);
                //wordList.push(findWord);
                fullWordList.push(findFullWord);
            }
            const childList = traceOne(letters, letter.x, letter.y, findFullWord);
            fullWordList.splice(fullWordList.length, 0, ...childList);
            //wordList.splice(wordList.length, 0, ...childList);
        } else {
            
        }
    }
    return fullWordList;//wordList;
}

function traceField(letters:Array<Array<ILetter>>){
    return letters.map(row => row.map(letter=>{
        return traceOne(letters, letter.x, letter.y, [letter]);
    }))
}

function getPoints(word: Array<ILetter>){
    const result = word.reduce((ac, letter, index)=>{
        return ac + (index + 1)
    }, 0);
    return result;
}

interface ILetter{
    id: string,
    x: number,
    y: number,
    letter: string
}

export default function GameField(){
    const [letters, setLetters] = useState(generateLetters(10, 10));
    const [selected, setSelected] = useState<Array<ILetter>>([]);
    const [animate, setAnimate] = useState<Array<ILetter>>([]);
    const [points, setPoints] = useState(0);

    return (
    <div>
        <div className="score">
            <div className="points">score: {points}</div>
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
                        const word = selected.map(it=> it.letter).join('');
                        if (formattedWords.includes(word)){
                            console.log('correct ', word);
                            setPoints(last=> last + getPoints(selected));
                            setAnimate(selected);
                            setTimeout(()=>{
                                setLetters(last=>{
                                    const newLetters = last.map(row=> row.map(item=>{
                                        if (selected.find(it=> it.id == item.id)){
                                            return {
                                                ...item,
                                                letter: abc[freqRandom()]
                                            } 
                                        } else {
                                            return item
                                        }
                                        
                                    }))
                                    return newLetters;
                                });
                                setAnimate([]);
                            }, 1000);
                            
                        } else {
                            console.log('incorrect ', word);
                        }
                        setSelected([]);
                    }}>
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

