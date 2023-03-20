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