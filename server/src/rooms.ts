//import { GameLogic } from "../../client/src/gameLogic/gameLogic1";
import { langList} from "../../client/src/gameLogic/logicGenerator";
import { RoomLogic } from "../../client/src/gameLogic/roomLogic";
import { LobbyUser } from "./lobbyUser";
import { PlayerServer } from './playerServer';

class Room{
    name: string;
    logic: RoomLogic;
    players: Array<PlayerServer> = [];
    lastActivity: number;
    onRemove: ()=>void;

    constructor(name: string, lang: number, hex: boolean, sx: number, sy: number, rounds: number){
        this.logic = new RoomLogic(name, lang/*langList.map(it=> it.gen)[lang]*/, hex, sx, sy, rounds);
        this.name = name;
        this.lastActivity = Date.now();
    }

    join(user: LobbyUser){
        this.lastActivity = Date.now();
        const existingPlayer = this.players.find(player => player.user == user)
        if (existingPlayer){
            existingPlayer.updateConnection(user);
            console.log('restore player');
            this.logic.join(user.name);
        } else {
            const playerServer = new PlayerServer(this.logic, user);
            this.players.push(playerServer);
            //const playerIndex = this.players.length-1;
            playerServer.onLeave = ()=>{
                const playerIndex = this.players.findIndex(it=> it.user.name == user.name);
                this.players.splice(playerIndex, 1);
            }
            this.logic.join(user.name);
            console.log('new player');
        }
    }

    remove(){
        this.onRemove();
    }
}

export class Rooms{
    private rooms: Array<Room> = [];
    static counter = 0;
    constructor(){

    }

    addRoom(lang: number, hex: boolean, sx: number, sy: number, rounds: number){
        Rooms.counter++;
        const room = new Room('room' + Rooms.counter, lang, hex, sx, sy, rounds);  
        room.onRemove = ()=>{
            const index = this.rooms.findIndex(it=> it.name == room.name);
            if (index != -1){
                this.rooms.splice(index, 1);
            }
        }  
        this.rooms.push(room);
        return room.name;
    }

    join(user: LobbyUser, name:string){
        const room = this.rooms.find(it=> it.name == name);
        if (room){
            room.join(user);
            return true;
        }
        return false;
    }

    getRooms(){
        return this.rooms.map(room=> room.name);
    }
}