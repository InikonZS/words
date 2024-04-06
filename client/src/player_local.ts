//import { GameLogic } from "./gameLogic/gameLogic1";
import { IGameState, ILetter } from "./gameLogic/interfaces";
import { langList } from "./gameLogic/logicGenerator";
import { IRoomState, RoomLogic } from "./gameLogic/roomLogic";

export class PlayerLocal{
    private gameLogic: RoomLogic;
    onGameState: (state:IGameState)=>void;
    onCorrectWord: (word: ILetter[])=>void;
    onSelectLetter: (word: ILetter[])=>void;

    onRoomState: (state: IRoomState)=>void;
    roomName: string = 'local';
    private name: string;
    get playerName(){
        return this.name;
    }
    //onLeave: ()=>void;

    constructor(lang: number, hexMode: boolean, bot: boolean) { 
        this.name = 'local';
        this.gameLogic = new RoomLogic('local_room', lang, hexMode);
        this.gameLogic.onGameState.add(this.handleGameState);
        this.gameLogic.onCorrectWord.add(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.add(this.handleSelectLetter);
        this.gameLogic.onRoomState.add(this.handleRoomState);
        setTimeout(()=>{
            this.gameLogic.join(this.name);
            if (bot){
                this.gameLogic.join('bot');
            }    
        }, 0);
    }

    handleGameState=(state: IGameState)=>{
        this.onGameState(state);
    }

    handleRoomState=(state: IRoomState)=>{
        this.onRoomState(state);
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

    getState():Promise<IRoomState>{
        console.log('getState');
        return Promise.resolve(this.gameLogic.getState());
    }

    leaveRoom(){
        this.gameLogic.onGameState.remove(this.handleGameState);
        this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.remove(this.handleSelectLetter);
        this.gameLogic.onRoomState.remove(this.handleRoomState);
        return Promise.resolve(true);
    }

    shuffle() {
        return Promise.resolve(this.gameLogic.shuffle(this.name));
    }
    
    startGame() {
        this.gameLogic.startGame();
        //this.gameLogic.requestStart(this.playerName);
    }

    showWords(){
        return Promise.resolve(this.gameLogic.showWords(this.playerName));
    }

    showMask(){
        return Promise.resolve(this.gameLogic.showMask(this.playerName));
    }
}