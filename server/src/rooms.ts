import { GameLogic } from "../../client/src/gameLogic/gameLogic";
import { LobbyUser } from "./lobbyUser";
import { PlayerServer } from './playerServer';

class Room{
    name: string;
    logic: GameLogic;
    players: Array<PlayerServer> = [];

    constructor(name: string){
        this.logic = new GameLogic();
        this.name = name;
    }

    join(user: LobbyUser){
        const playerServer = new PlayerServer(this.logic, user.connection);
        this.players.push(playerServer);
    }
}

export class Rooms{
    private rooms: Array<Room> = [];

    constructor(){

    }

    addRoom(){
        const room = new Room('room' + this.rooms.length.toString());    
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