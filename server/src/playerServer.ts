import { connection, Message } from "websocket";
//import { GameLogic } from "../../client/src/gameLogic/gameLogic1";
import { IGameState, ILetter } from "../../client/src/gameLogic/interfaces";
import { LobbyUser } from "./lobbyUser";
import { IRoomState, RoomLogic } from '../../client/src/gameLogic/roomLogic'

export class PlayerServer {
    private gameLogic: RoomLogic;//GameLogic;
    public user: LobbyUser;
    private connection: connection;
    onLeave: ()=>void;
    disconnectTimeout: NodeJS.Timeout;
    uid: number;
    clearConnection: ()=>void;

    constructor(gameLogic: RoomLogic, user: LobbyUser) { 
        this.user = user;
        this.gameLogic = gameLogic;
        this.gameLogic.onGameState.add(this.handleState);
        this.gameLogic.onCorrectWord.add(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.add(this.handleSelectLetter);
        this.gameLogic.onRoomState.add(this.handleRoomState);
        this.updateConnection(user);
        this.uid = Math.random();
    }

    updateConnection(user: LobbyUser){
        
        if (this.disconnectTimeout){
            clearTimeout(this.disconnectTimeout);
            this.disconnectTimeout = null;
        }
        
        /*this.gameLogic.onGameState.add(this.handleState);
        this.gameLogic.onCorrectWord.add(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.add(this.handleSelectLetter);
        this.gameLogic.onRoomState.add(this.handleRoomState);*/
        this.gameLogic.connectPlayer(user.name);
        if (this.connection == user.connection){
            console.log('actual connection');
            return;
        }
        this.connection = user.connection;
        
        const hMessage = (message: any) => {
            this.handleMessage(message);
        }
        this.connection.on('message', hMessage);

        const hClose = (reasonCode: number, description: string) => {
            console.log('Close!!!!', description);
            this.gameLogic.disconnectPlayer(user.name);
            this.disconnectTimeout = setTimeout(()=>{
                this.leaveRoom();
            }, 20000);
           /* this.gameLogic.onGameState.remove(this.handleState);
            this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
            this.gameLogic.onSelectLetter.remove(this.handleSelectLetter);*/
        }
        this.connection.on('close', hClose);
        this.clearConnection = ()=>{
            this.connection.off('message', hMessage);
            this.connection.off('close', hClose);
        }
    }

    handleState = (state: IGameState)=>{
        this.user.connection.sendUTF(JSON.stringify({
          type: 'state',
          data: state,
          room: this.gameLogic.name
        }))
    }

    handleRoomState = (state: IRoomState)=>{
        this.user.connection.sendUTF(JSON.stringify({
            type: 'roomState',
            data: state,
            room: this.gameLogic.name
        }))
    }

    handleCorrectWord = (state: ILetter[])=>{
        this.user.connection.sendUTF(JSON.stringify({
            type: 'correctWord',
            data: state,
            room: this.gameLogic.name
        }))
        }

    handleSelectLetter = (state: ILetter[])=>{
        this.user.connection.sendUTF(JSON.stringify({
            type: 'selectLetter',
            data: state,
            room: this.gameLogic.name
        }))
        }

    handleMessage(message: Message) {
        if (message.type == 'utf8') {
            const parsed = JSON.parse(message.utf8Data)
            //console.log("Message", parsed)
            if (!('type' in parsed)) {
                return;
            }

            if (parsed.room != this.gameLogic.name){
                return;
            }

            if (parsed.type == 'getState') {
                console.log('getState');
                this.user.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: this.gameLogic.getState()
                }))
            } 

            if (parsed.type == 'leaveRoom') {
                //const status = this.gameLogic.leavePlayer(this.user.name);
                //this.onLeave?.();
                const status = this.leaveRoom();
                this.user.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: {status: status}
                }));
                /*this.gameLogic.onGameState.remove(this.handleState);
                this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
                this.gameLogic.onSelectLetter.remove(this.handleSelectLetter);*/
            }

            if (parsed.type == 'submitWord') {
                console.log('playerServer uid ', this.uid);
                this.gameLogic.submitWord(this.user.name, parsed.data.selected);
                /*connection.sendUTF(JSON.stringify({
                  type: 'privateMessage',
                  requestId: parsed.requestId,
                  data: gameLogic.getState()
                }))*/
            }
            if (parsed.type == 'selectLetter') {
                this.gameLogic.select(this.user.name, parsed.data);
                /*connection.sendUTF(JSON.stringify({
                  type: 'privateMessage',
                  requestId: parsed.requestId,
                  data: gameLogic.getState()
                }))*/
            }

            if (parsed.type == 'leaveRoom') {
                this.gameLogic.shuffle(this.user.name);
            }

            if (parsed.type == 'requestStart') {
                const res = this.gameLogic.requestStart(this.user.name);
                this.user.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: res
                }))
            }

            if (parsed.type == 'shuffle') {
                const res = this.gameLogic.shuffle(this.user.name);
                this.user.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: res
                }));
            }

            if (parsed.type == 'showWords') {
                const res = this.gameLogic.showWords(this.user.name);
                this.user.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: res
                }));
            }

            if (parsed.type == 'showMask') {
                const res = this.gameLogic.showMask(this.user.name);
                this.user.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: res
                }))
            }
        }
    }

    leaveRoom(){
        const status = this.gameLogic.leave(this.user.name);
        this.onLeave?.();
        this.clearConnection?.();
        /*this.gameLogic.onGameState.remove(this.handleState);
        this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.remove(this.handleSelectLetter);*/
        return status;   
    }
}
