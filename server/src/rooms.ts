import { GameLogic } from "../../client/src/gameLogic/gameLogic";
import { enGen, ruGen } from "../../client/src/gameLogic/logicGenerator";
import { LobbyUser } from "./lobbyUser";
import { PlayerServer } from './playerServer';

class Room{
    name: string;
    logic: GameLogic;
    players: Array<PlayerServer> = [];
    lastActivity: number;
    onRemove: ()=>void;

    constructor(name: string){
        this.logic = new GameLogic(enGen);
        this.name = name;
        this.lastActivity = Date.now();
    }

    join(user: LobbyUser){
        this.lastActivity = Date.now();
        const existingPlayer = this.players.find(player => player.user == user)
        if (existingPlayer){
            existingPlayer.updateConnection(user);
            console.log('restore player');
        } else {
            const playerServer = new PlayerServer(this.logic, user);
            this.players.push(playerServer);
            playerServer.onLeave = ()=>{
                this.players.splice(this.players.length-1, 1);
            }
            this.logic.joinPlayer(user.name);
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

    addRoom(){
        Rooms.counter++;
        const room = new Room('room' + Rooms.counter);  
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