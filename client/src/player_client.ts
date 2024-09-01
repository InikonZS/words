import { IGameState, ILetter } from "./gameLogic/interfaces";
import { IRoomState } from "./gameLogic/roomLogic";
import Socket from "./socket";

export class PlayerClient{
    private socket: Socket;

    onGameState: (state:IGameState)=>void;
    onCorrectWord: (word: ILetter[])=>void;
    onSelectLetter: (word: ILetter[])=>void;

    onRoomState: (state: IRoomState)=>void;
    roomName: string;
    get playerName(){
        return this.socket.name;
    }

    constructor(socket:Socket, roomName: string){
        console.log('created player client');
        this.roomName = roomName;
        //this.socket = socket;
        this.updateSocket(socket);
    }

    updateSocket(socket:Socket){
        this.socket = socket;
        socket.onMessage = (message)=>{
            if (message.room != this.roomName) return;
            if (message.type == 'roomState'){
                const state: IRoomState = message.data;
                if (state.roomName == this.roomName){
                    this.onRoomState(state);
                }
            }

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
            data: {selected},
            room: this.roomName
        })
    }

    selectLetter(selected:ILetter[]){
        this.socket.sendState({
            type: 'selectLetter',
            data: selected,
            room: this.roomName
        })
    }

    getState():Promise<IRoomState>{
        console.log('getState');
        return this.socket.sendState({
            type: 'getState',
            data: {},
            room: this.roomName
        })
    }

    leaveRoom(){
        return this.socket.sendState({
            type: 'leaveRoom',
            data: {},
            room: this.roomName
        })
    }

    shuffle() {
        return this.socket.sendState({
            type: 'shuffle',
            data: {},
            room: this.roomName
        })
    }

    startGame() {
        //this.gameLogic.start();
        return this.socket.sendState({
            type: 'requestStart',
            data: {},
            room: this.roomName
        })
    }

    showWords():Promise<string[]>{
        return this.socket.sendState({
            type: 'showWords',
            data: {},
            room: this.roomName
        })
        //return [];
    }

    showMask():Promise<number[][][]>{
        return this.socket.sendState({
            type: 'showMask',
            data: {},
            room: this.roomName
        })
    }
}