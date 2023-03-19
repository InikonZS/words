import { connection, Message } from "websocket";
import { GameLogic } from "../../client/src/gameLogic/gameLogic";
import { IGameState, ILetter } from "../../client/src/gameLogic/interfaces";

export class PlayerServer {
    private gameLogic: GameLogic;
    private connection: connection;

    constructor(gameLogic: GameLogic, connection: connection) { 
        this.connection = connection;
        this.gameLogic = gameLogic;
        this.gameLogic.onGameState.add(this.handleState);
        this.gameLogic.onCorrectWord.add(this.handleCorrectWord);
        this.gameLogic.onSelectLetter.add(this.handleSelectLetter);

        connection.on('message', (message) => {
            this.handleMessage(message);
        });

        connection.on('close', (reasonCode, description) => {
            console.log('Close!!!!', description);
            this.gameLogic.onGameState.remove(this.handleState);
            this.gameLogic.onCorrectWord.remove(this.handleCorrectWord);
            this.gameLogic.onSelectLetter.remove(this.handleCorrectWord);
        })
    }

    handleState = (state: IGameState)=>{
        this.connection.sendUTF(JSON.stringify({
          type: 'state',
          data: state
        }))
      }

    handleCorrectWord = (state: ILetter[])=>{
        this.connection.sendUTF(JSON.stringify({
            type: 'correctWord',
            data: state
        }))
        }

    handleSelectLetter = (state: ILetter[])=>{
        this.connection.sendUTF(JSON.stringify({
            type: 'selectLetter',
            data: state
        }))
        }

    handleMessage(message: Message) {
        if (message.type == 'utf8') {
            const parsed = JSON.parse(message.utf8Data)
            console.log("Message", parsed)
            if (!('type' in parsed)) {
                return;
            }

            if (parsed.type == 'getState') {
                this.connection.sendUTF(JSON.stringify({
                    type: 'privateMessage',
                    requestId: parsed.requestId,
                    data: this.gameLogic.getState()
                }))
            }

            if (parsed.type == 'submitWord') {
                this.gameLogic.submitWord(parsed.data.selected);
                /*connection.sendUTF(JSON.stringify({
                  type: 'privateMessage',
                  requestId: parsed.requestId,
                  data: gameLogic.getState()
                }))*/
            }
            if (parsed.type == 'selectLetter') {
                this.gameLogic.select(parsed.data);
                /*connection.sendUTF(JSON.stringify({
                  type: 'privateMessage',
                  requestId: parsed.requestId,
                  data: gameLogic.getState()
                }))*/
            }
        }
    }
}
