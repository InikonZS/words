import { IBonus, ILetter, IPlayerData } from "./interfaces";
import { abc, formattedWords, freqRandom, generateLetters, getPoints, traceField } from "./logicTools";

interface IGameState{
    letters: ILetter[][];
    players: Array<IPlayerData>;
    currentPlayerIndex: number;
}

export class GameLogic{
    letters: ILetter[][];
    players: Array<IPlayerData>;
    currentPlayerIndex: number = 0;

    onGameState: (state:IGameState)=>void;
    onCorrectWord: (word: ILetter[])=>void;

    constructor(){
        this.letters = generateLetters(10, 10);
        this.addCrystals();
        this.players = [
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
        ];
    }

    private addCrystals(){
        this.letters.map(row=> row.map(letter=>{
            if (Math.random() < 0.1){
                letter.bonus = [
                    {
                        name: 'crystal',
                        apply: ()=>{
                            this.updatePlayer(this.currentPlayerIndex, (last)=>{
                                return {
                                    ...last, 
                                    crystals: last.crystals + 1
                                };
                            })
                            //setCrystals(last => last + 1);
                        }
                    }
                ];
                
            }
        }))
    }

    submitWord(selected:Array<ILetter>){
        const word = selected.map(it=> it.letter).join('');
        if (formattedWords.includes(word)){
            console.log('correct ', word);
            this.onCorrectWord(selected);
            /*setPlayers(last=>{
                const current = last[currentPlayerIndex];
                current.points += getPoints(selected);
                current.winWord = selected.map(it=>it.letter).join('');
                return last;
            })*/
            this.updatePlayer(this.currentPlayerIndex, (last)=>{
                return {
                    ...last, 
                    points: last.points + getPoints(selected),
                    winWord: selected.map(it=>it.letter).join('')
                };
            })
            //setPoints(last=> last + getPoints(selected));
            //!!!selected.map(it=>it.bonus.forEach(jt=> jt.apply()))
            //setAnimate(selected);
            setTimeout(()=>{
                this.updateLetters(selected);
                //setLetters
                //setAnimate([]);
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                this.onGameState(this.getState());
                this.bot();
                //setCurrentPlayerIndex(last => (last + 1) % players.length);
            }, 1000);
            
        } else {
            console.log('incorrect ', word);
        }
    }

    updateLetters(selected: Array<ILetter>){
        const last = this.letters;
        const newLetters = last.map(row=> row.map(item=>{
            if (selected.find(it=> it.id == item.id)){
                const bonus: Array<IBonus> = [];
                if (Math.random() < 0.1) {
                    bonus.push(
                        {
                            name: 'crystal',
                            apply: ()=>{
                                this.updatePlayer(this.currentPlayerIndex, (last)=>{
                                    return {
                                        ...last, 
                                        crystals: last.crystals + 1
                                    };
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
            
        }));
        this.letters = newLetters;
        this.onGameState(this.getState());
        //return newLetters;
    }

    updatePlayer(index:number, data: (last: IPlayerData) => IPlayerData){
        this.players[index] = data(this.players[index]);
        this.onGameState(this.getState());
    }

    getState(): IGameState{
        return {
            letters: this.letters,
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex
        }
    }

    bot(){
        if (this.players[this.currentPlayerIndex]?.name == 'bot'){
            const allWords = traceField(this.letters);
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
                    //this.onCorrectWord(word);
                    //setSelected(word);
                    setTimeout(()=>{
                        /*setPlayers(last=>{
                            const current = last[currentPlayerIndex];
                            current.winWord = word.map(it=>it.letter).join('');
                            return last;
                        })*/
                        //setWinWord(word.map(it=>it.letter).join(''));
                        this.submitWord(word); 
                        //setSelected([]); 
                    }, 3000); 
                }, 1000);  
            }
        }
    }
}