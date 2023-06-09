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

    constructor(gameLogic: RoomLogic, user: LobbyUser) { 
        this.user = user;
        this.gameLogic = gameLogic;
        this.gameLogic.onGameState.add(this.handleState);
        this.gameLogic.onCorrectWord.add(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.add(this.handleSelectLetter);
        this.gameLogic.onRoomState.add(this.handleRoomState);
        this.updateConnection(user);
    }

    updateConnection(user: LobbyUser){
        if (this.disconnectTimeout){
            clearTimeout(this.disconnectTimeout);
            this.disconnectTimeout = null;
        }
        this.connection = user.connection;
        this.gameLogic.connectPlayer(user.name);
        this.connection.on('message', (message) => {
            this.handleMessage(message);
        });

        this.connection.on('close', (reasonCode, description) => {
            console.log('Close!!!!', description);
            this.gameLogic.disconnectPlayer(user.name);
            this.disconnectTimeout = setTimeout(()=>{
                this.leaveRoom();
            }, 3000);
           /* this.gameLogic.onGameState.remove(this.handleState);
            this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
            this.gameLogic.onSelectLetter.remove(this.handleSelectLetter);*/
        })
    }

    handleState = (state: IGameState)=>{
        this.user.connection.sendUTF(JSON.stringify({
          type: 'state',
          data: state
        }))
    }

    handleRoomState = (state: IRoomState)=>{
        this.user.connection.sendUTF(JSON.stringify({
            type: 'roomState',
            data: state
        }))
    }

    handleCorrectWord = (state: ILetter[])=>{
        this.user.connection.sendUTF(JSON.stringify({
            type: 'correctWord',
            data: state
        }))
        }

    handleSelectLetter = (state: ILetter[])=>{
        this.user.connection.sendUTF(JSON.stringify({
            type: 'selectLetter',
            data: state
        }))
        }

    handleMessage(message: Message) {
        if (message.type == 'utf8') {
            const parsed = JSON.parse(message.utf8Data)
            //console.log("Message", parsed)
            if (!('type' in parsed)) {
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
        this.gameLogic.onGameState.remove(this.handleState);
        this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.remove(this.handleSelectLetter); 
        return status;   
    }
}
