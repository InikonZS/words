import { GameLogic } from "./gameLogic/gameLogic";
import { IGameState, ILetter } from "./gameLogic/interfaces";
import { enGen, ruGen, byGen } from "./gameLogic/logicGenerator";

export class PlayerLocal{
    private gameLogic: GameLogic;
    onGameState: (state:IGameState)=>void;
    onCorrectWord: (word: ILetter[])=>void;
    onSelectLetter: (word: ILetter[])=>void;
    roomName: string = 'local';
    private name: string;
    get playerName(){
        return this.name;
    }
    //onLeave: ()=>void;

    constructor(lang: number, bot: boolean) { 
        this.name = 'local';
        this.gameLogic = new GameLogic([enGen, ruGen, byGen][lang]);
        this.gameLogic.onGameState.add(this.handleGameState);
        this.gameLogic.onCorrectWord.add(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.add(this.handleSelectLetter);
        setTimeout(()=>{
            this.gameLogic.joinPlayer(this.name);
            if (bot){
                this.gameLogic.joinPlayer('bot');
            }    
        }, 0);
    }

    handleGameState=(state: IGameState)=>{
        this.onGameState(state);
    }

    handleCorrectWord=(word:ILetter[])=>{
        this.onCorrectWord(word);
    }

    handleSelectLetter=(word:ILetter[])=>{
        this.onSelectLetter(word);
    }

    submitWord(selected:ILetter[]){
        return Promise.resolve(this.gameLogic.submitWord(this.name, selected));
    }

    selectLetter(selected:ILetter[]){
        return Promise.resolve(this.gameLogic.select(this.name, selected));
    }

    getState():Promise<IGameState>{
        console.log('getState');
        return Promise.resolve(this.gameLogic.getState());
    }

    leaveRoom(){
        this.gameLogic.onGameState.remove(this.handleGameState);
        this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.remove(this.handleSelectLetter);
        return Promise.resolve(true);
    }

    shuffle() {
        return Promise.resolve(this.gameLogic.shuffle(this.name));
    }
    
    startGame() {
        //this.gameLogic.start();
        this.gameLogic.requestStart(this.playerName);
    }
}