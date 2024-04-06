import { Signal } from "../common/signal";
import { IBonus, IGameState, ILetter, IPlayerData } from "./interfaces";
import { getPoints, shuffle, traceField } from "./logicTools";
import { ILangGen } from './logicGenerator'; 
import { moveTime } from '../consts';
/*const langSumFreq = getSumFreq(frequency);
const langFreqRandom = ()=>freqRandom(langSumFreq);
const langGenerateLetters = (x: number, y: number)=>generateLetters(x, y, langSumFreq);
const langTraceField = (letters: ILetter[][])=> traceField(letters, (part)=> findWordsByPart(part, formattedWordsEn));
const langCheckWord = (letters: ILetter[]) => checkWord(letters, formattedWordsEn);*/

export class GameLogic{
    gen: ILangGen;
    letters: ILetter[][];
    players: Array<IPlayerData>;
    currentPlayerIndex: number = -1;

    onGameState: Signal<IGameState> = new Signal();//(state:IGameState)=>void;
    onCorrectWord: Signal<ILetter[]> = new Signal();//(word: ILetter[])=>void;
    onSelectLetter: Signal<ILetter[]> = new Signal();//(word: ILetter[])=>void;
    onFinish: Signal<IGameState> = new Signal();//(word: ILetter[])=>void;

    private moveTimer: any = null;
    isStarted: boolean = false;
    startMoveTime: number;
    moveCounter: number = 0;
    roundCounter: number = 0;
    maxRound: number = 3;
    hexMode: boolean;

    constructor(gen: ILangGen, hexMode: boolean, sx: number, sy: number, rounds: number, players: IPlayerData[]){
        this.gen = gen;
        this.players = players;
        this.currentPlayerIndex = -1;
        this.hexMode = hexMode;
        this.maxRound = rounds;
        this.letters = this.gen.generateLetters(sx, sy, hexMode);

        this.addCrystals();
        this.isStarted = true;
        this.roundCounter = 0;
        this.nextPlayer(0);
        //????
        //this.onGameState.emit(this.getState());  
    }

    getNextPlayerIndex(){
        return this.players.length ? (this.currentPlayerIndex + 1) % this.players.length : -1;
    }

    nextRound(){
        if ((this.roundCounter + 1)>=this.maxRound){
            console.log('finish game');
            this.roundCounter += 1; 
            this.stopGame();
        } else {
            console.log('next round'); 
            this.roundCounter += 1;    
        }
       
    }

    stopGame(){
        this.isStarted = false;
        clearTimeout(this.moveTimer);
        this.moveTimer = null;
        //this.players = [];
        this.currentPlayerIndex = -1;
        this.onFinish.emit(this.getState());
    }

    nextPlayer(index: number){
        console.log('next player', index)
        this.moveCounter+=1;
        if (this.currentPlayerIndex>=index){
            this.nextRound();
        }
        this.currentPlayerIndex = index; 
        this.startMoveTime = Date.now();
        this.onGameState.emit(this.getState());
        this.bot();
        clearTimeout(this.moveTimer);
        if (this.isStarted){
            this.moveTimer = setTimeout(()=>{
                this.nextPlayer(this.getNextPlayerIndex());
            }, moveTime * 1000);
        }
    }

    leavePlayer(playerName:string){
        //this.leaveSpectator(playerName);
        const playerIndex = this.players.findIndex(it=> playerName == it.name);
        if (playerIndex != -1) {
            this.players.splice(playerIndex, 1);
            if (this.currentPlayerIndex >= this.players.length){
                //this.currentPlayerIndex = 0;
                this.nextPlayer(0);
            }
            this.onGameState.emit(this.getState());
            return true;
        }
        return false;
    }

    connectPlayer(playerName: string){
        const player = this.players.find(it=> playerName == it.name);
        if (player){
            player.connected = true;
            this.onGameState.emit(this.getState());
        }
    }

    disconnectPlayer(playerName: string){
        const player = this.players.find(it=> playerName == it.name);
        if (player){
            player.connected = false;
            this.onGameState.emit(this.getState());
        }
    }

    //start(){
      //  this.currentPlayerIndex = -1;
       // this.letters = this.gen.generateLetters(10, 10);
        /*this.players.map(it=> {
            it.crystals = 0;
            it.points = 0;
            it.winWord = '';
        })*/
       /* this.players = this.spectators.map(it=> ({
            name: it,
            points: 0,
            crystals: 0,
            winWord: '',
            connected: true,
            correctWords: [],
            incorrectWords: []
        }));
        this.addCrystals();
        this.isStarted = true;
        this.roundCounter = 0;
        this.nextPlayer(0);
        this.onGameState.emit(this.getState());   */ 
    //}

    /*requestStart(name: string){
        if (this.isStarted){
            console.log('game already started');
            return;
        }
        if (!this.gameStartTimer){
            console.log('started timer for start game');
            this.roundCounter = 0;
            this.moveCounter = 0;
            this.gameStartRequestTime = Date.now();
            this.gameStartTimer = setTimeout(()=>{
                this.gameStartTimer = null;
                this.start();
            }, 10000);
            this.onGameState.emit(this.getState());
        } else {
            console.log('timer already started'); 
        }
    }*/

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

    submitWord(playerName: string, selected:Array<ILetter>){
        const player = this.players.find(it=> playerName == it.name);
        const current = this.players[this.currentPlayerIndex];
        if (!player || player.name !== current.name) {
            return;
        }

        const [isCorrect, word] = this.gen.checkWord(selected);//selected.map(it=> it.letter).join('');
        if ( isCorrect || word == ''){
            console.log('correct ', word);
            current.correctWords.push(word);
            //clearTimeout(this.moveTimer);
            //this.moveTimer = null;
            this.onCorrectWord.emit(selected);
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
            selected.map(it=>this.letters[it.y][it.x].bonus.forEach(jt=> jt.apply()))
            //setAnimate(selected);
            clearTimeout(this.moveTimer);
            this.moveTimer = null;

            setTimeout(()=>{
                this.updateLetters(selected);
                //setLetters
                //setAnimate([]);
                //this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                this.nextPlayer(this.getNextPlayerIndex());
                
                //this.bot();
                //setCurrentPlayerIndex(last => (last + 1) % players.length);
            }, 1000);
            
        } else {
            console.log('incorrect ', word);
            current.incorrectWords.push(word);
        }
    }

    /*selectLetter(){

    }*/

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
                    letter: this.gen.randomLetter(),
                    bonus: bonus
                } 
            } else {
                return item
            }
            
        }));
        this.letters = newLetters;
        this.onGameState.emit(this.getState());
        //return newLetters;
    }

    updatePlayer(index:number, data: (last: IPlayerData) => IPlayerData){
        this.players[index] = data(this.players[index]);
        this.onGameState.emit(this.getState());
    }

    getState(): IGameState{
        return {
         //   isStarted: this.isStarted,
         //   isStartRequested: null,
         //   startRequestTime: null,
            letters: this.letters,
            players: this.players,
         //   spectators: null,
            currentPlayerIndex: this.currentPlayerIndex,
            time: - Date.now() + this.startMoveTime + (moveTime * 1000),
            currentRound: this.roundCounter ,
            totalRounds: this.maxRound,
            currentMove: this.moveCounter,
            hexMode: this.hexMode
        }
    }

    select(playerName: string, word:ILetter[]){
        const player = this.players.find(it=> playerName == it.name);
        const current = this.players[this.currentPlayerIndex];
        if (!player || player.name !== current.name) {
            return;
        }

        this.onSelectLetter.emit(word);
    }

    bot(){
        if (this.players[this.currentPlayerIndex]?.name == 'bot'){
            const allWords = this.gen.traceField(this.letters, this.hexMode);
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
                    this.onSelectLetter.emit(word);
                    setTimeout(()=>{
                        /*setPlayers(last=>{
                            const current = last[currentPlayerIndex];
                            current.winWord = word.map(it=>it.letter).join('');
                            return last;
                        })*/
                        //setWinWord(word.map(it=>it.letter).join(''));
                        this.submitWord('bot', word); 
                        //setSelected([]); 
                    }, 3000); 
                }, 1000);  
            }
        } else {
           /* this.moveTimer = setTimeout(()=>{
                this.submitWord('bot', []);
            }, 10000)*/
        }
    }

    shuffle(name: string) {
        const player = this.players.find(it=> name == it.name);
        const current = this.players[this.currentPlayerIndex];
        if (!player || player.name !== current.name) {
            return;
        }
        if(current.crystals < 1) return;
        current.crystals -= 1;

        shuffle(this.letters);
        this.letters.forEach(item => shuffle(item));
        this.letters.forEach((row, i) => row.forEach((letter, j) => {
            letter.x = j;
            letter.y = i;
        }) )
        this.onGameState.emit(this.getState());
    }

    showWords(name: string){
        const allWords = this.gen.traceField(this.letters, this.hexMode);
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

        const uniq: Record<string, string> = {};
        linearList.forEach(it=>{
            const word = it.map(jt => jt.letter).join('');
            uniq[word] = word;
        });
        console.log(Object.keys(uniq));
        return Object.keys(uniq);  
    }

    showMask(name: string){
        const allWords = this.gen.traceField(this.letters, this.hexMode);
        let linearList: Array<Array<ILetter>> = [];
        allWords.forEach(row=>{
            row.forEach(words=>{
                words.forEach(word=>{
                    linearList.push(word);
                })
            })
        });

        linearList.sort((a, b)=>{
            return b.length - a.length;
        })
        linearList = linearList.slice(0, 12);
        const uniq: Record<string, Array<ILetter>> = {};
        linearList.forEach(it=>{
            const word = it.map(jt => jt.letter).join('');
            uniq[word] = it;
        });

        const res: Array<Array<Array<number>>> = this.letters.map(it=>{
            return it.map(jt=>{
                return [];
            })
        });
        Object.values(uniq).forEach((it, i)=> it.forEach(jt=>{res[jt.y][jt.x].push(i)}));
        console.log(Object.keys(uniq));
        return res;
    }
}