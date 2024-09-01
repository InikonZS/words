import { Signal } from '../common/signal';
import { GameLogic } from './gameLogic';
import { IGameState, ILetter } from './interfaces';
import { langList } from './logicGenerator';

export interface ISpectator{
    name: string
}

export interface IRoomState{
    isStarted: boolean,
    lang: number,
    spectators: ISpectator[],
    isStartRequested: boolean,
    startRequestTime: number,
    game: IGameState,
    hexMode: boolean,
    roomName: string
}

export class RoomLogic{
    name: string;
    game: GameLogic;
    players: Array<ISpectator> = [];
    //lastActivity: number;
    onRemove: ()=>void;
    lang: number;
    gameStartTimer: any = null;
    gameStartRequestTime: number;
    onGameState: Signal<IGameState> = new Signal();//(state:IGameState)=>void;
    onCorrectWord: Signal<ILetter[]> = new Signal();//(word: ILetter[])=>void;
    onSelectLetter: Signal<ILetter[]> = new Signal();

    onRoomState: Signal<IRoomState> = new Signal();
    sx: number;
    sy: number;
    hexMode: boolean;
    rounds: number;

    constructor(name: string, lang: number, hexMode: boolean, sx: number = 10, sy: number = 10, rounds: number = 3){
        this.lang = lang;
        this.name = name;
        this.hexMode = hexMode;
        this.sx = sx;
        this.sy = sy;
        this.rounds = rounds
        /*this.logic = new GameLogic(langList.map(it=> it.gen)[lang], []);
        this.name = name;
        this.lastActivity = Date.now();*/
    }

    generatePlayers(){
        return this.players.filter(it=>it).map(it=> ({
            name: it.name,
            points: 0,
            crystals: 0,
            winWord: '',
            connected: true,
            correctWords: [],
            incorrectWords: []
        }));
    }

    startGame(){
        const game = new GameLogic(langList.map(it=> it.gen)[this.lang], this.hexMode, this.sx, this.sy, this.rounds, this.generatePlayers());
        game.onGameState.add((state)=>{
            this.onGameState.emit(state);
        })
        game.onCorrectWord.add((word)=>{
            this.onCorrectWord.emit(word);
        })
        game.onSelectLetter.add((word)=>{
            this.onSelectLetter.emit(word);   
        })
        game.onFinish.add((state)=>{
            this.game = null;
            this.sendState();
        })
        this.game = game;
        this.sendState();
    }

    isStarted(){
        return !!this.game;
    }

    requestStart(name: string){
        if (this.isStarted()){
            console.log('game already started');
            return;
        }
        if (!this.gameStartTimer){
            console.log('started timer for start game');
            //this.roundCounter = 0;
            //this.moveCounter = 0;
            this.gameStartRequestTime = Date.now();
            this.gameStartTimer = setTimeout(()=>{
                this.gameStartTimer = null;
                this.startGame();
            }, 10000);
            //this.onGameState.emit(this.getState());
        } else {
            console.log('timer already started'); 
        }
        this.sendState();
    }

    join(userName: string){
        console.log('players room', this.players);
        if (this.players.find(it=>it.name == userName) == undefined){
            this.players.push({
                name: userName
            });
        }
        this.sendState();
    }

    remove(){
        this.onRemove();
    }

    getState(): IRoomState{
        return {
            isStarted: this.isStarted(),
            lang: this.lang,
            hexMode: this.hexMode,
            spectators: this.players,
            isStartRequested: !!this.gameStartTimer,
            startRequestTime: - Date.now() + this.gameStartRequestTime + (10000),
            game: this.game?.getState(),
            roomName: this.name
        }
    }

    sendState(){
        this.onRoomState.emit(this.getState());
    }

    
    updateLetters(selected: Array<ILetter>){
        this.game.updateLetters(selected);
    }
    /*updatePlayer(index:number, data: (last: IPlayerData) => IPlayerData){

    }*/
    leave(playerName:string){
        this.players = this.players.filter(it=> it.name != playerName); 
        console.log('leave room logic', !!this.game);
        if (!this.game){
            return;
        }
        return this.game.leavePlayer(playerName);
    }

    //getState(): IRoomState{
        //return this.game.getState();
    //}

    select(playerName: string, word:ILetter[]){
        return this.game.select(playerName, word);
    }

    shuffle(name: string) {
        if (!this.game){
            return;
        }
        return this.game.shuffle(name);
    }

    showWords(name: string){
        return this.game.showWords(name);
    }

    showMask(name: string){
        return this.game.showMask(name);
    }

    submitWord(playerName: string, selected:Array<ILetter>){
        console.log('room players', this.players)
        return this.game.submitWord(playerName, selected);
    }

    connectPlayer(playerName: string){
        return this.game?.connectPlayer(playerName);
    }

    disconnectPlayer(playerName: string){
        //this.players = this.players.filter(it=> it.name != playerName); 
        if (!this.game){
            return;
        }
        return this.game.disconnectPlayer(playerName);
    }

}
