import { IGameState, ILetter } from "./gameLogic/interfaces";
import Socket from "./socket";

export class PlayerClient{
    private socket: Socket;

    onGameState: (state:IGameState)=>void;
    onCorrectWord: (word: ILetter[])=>void;
    onSelectLetter: (word: ILetter[])=>void;
    roomName: string;
    get playerName(){
        return this.socket.name;
    }

    constructor(socket:Socket, roomName: string){
        this.roomName = roomName;
        this.socket = socket;
        socket.onMessage = (message)=>{
            if (message.type == 'state'){
                const state = message.data;
                this.onGameState(state);
                //setLetters(state.letters);
                //setPlayers(state.players);
                //if (currentPlayerIndex !== state.currentPlayerIndex){
                    //setCurrentPlayerIndex(state.currentPlayerIndex);
                //}
            }
            if (message.type == 'correctWord'){
                const word = message.data;
                this.onCorrectWord(word);
                /*setAnimate(word);
                setSelected([]);
                setTimeout(()=>{
                    setAnimate([]);
                }, 1000);*/
            }
            if (message.type == 'selectLetter'){
                this.onSelectLetter(message.data);
                //setSelected(message.data);
            } 
        }
    }

    submitWord(selected:ILetter[]){
        this.socket.sendState({
            type: 'submitWord',
            data: {selected}
        })
    }

    selectLetter(selected:ILetter[]){
        this.socket.sendState({
            type: 'selectLetter',
            data: selected
        })
    }

    getState():Promise<IGameState>{
        console.log('getState');
        return this.socket.sendState({
            type: 'getState',
            data: {}
        })
    }

    leaveRoom(){
        return this.socket.sendState({
            type: 'leaveRoom',
            data: {}
        })
    }

    shuffle() {
        return this.socket.sendState({
            type: 'shuffle',
            data: {}
        })
    }

    startGame() {
        //this.gameLogic.start();
    }
}