import { connection, Message } from "websocket";
import { Rooms } from "./rooms";

export class LobbyUser{
    connection: connection;
    session: string;
    rooms: Rooms;
    name: string = Math.random().toFixed(5);
    nick: string;
    ava: string;
    online: boolean;
    onUpdate: ()=>void;

    constructor(rooms: Rooms, _connection: connection){
        this.session = Math.random().toString() + Date.now().toString();
        this.rooms = rooms;
        this.updateConnection(_connection);
    }

    updateConnection(_connection: connection){
        this.connection = _connection; 
        const rooms = this.rooms;
        this.online = true;
        _connection.on('message', (message: Message)=>{
            if (message.type == 'utf8') {
                const parsed = JSON.parse(message.utf8Data)
                console.log("Message", parsed)
                if (!('type' in parsed)) {
                    return;
                }
    
                if (parsed.type == 'getRooms') {
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: rooms.getRooms()
                    }))
                }

                if (parsed.type == 'createRoom') {
                    const lang = parsed.data?.lang || 0;
                    const name = rooms.addRoom(lang);
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: name
                    }))
                }

                if (parsed.type == 'joinRoom') {
                    console.log('joinRoom');
                    const result = rooms.join(this, parsed.data.roomName);
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: result
                    }))
                }

                if (parsed.type == 'updateNick') {
                    console.log('updateNick');
                    const nick = parsed.data.nick;
                    const result = this.updateNick(nick);
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: result
                    }))
                }

                if (parsed.type == 'updateAva') {
                    console.log('updateAva');
                    const ava = parsed.data.ava;
                    const result = this.updateAva(ava);
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: result
                    }))
                }
            }
        });
        this.onUpdate?.();
        _connection.on("close", ()=>{
            this.online = false;
            this.onUpdate();
        })
    }

    updateNick(nick: string){
        this.nick = nick;
        this.onUpdate();
        return true;
    }

    updateAva(ava: string){
        this.ava = ava;
        this.onUpdate();
        return true;
    }
}