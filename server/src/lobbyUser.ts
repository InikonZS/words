import { connection, Message } from "websocket";
import { Rooms } from "./rooms";

export class LobbyUser{
    connection: connection;

    constructor(rooms: Rooms, _connection: connection){
        this.connection = _connection;
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
                    const name = rooms.addRoom();
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: name
                    }))
                }

                if (parsed.type == 'joinRoom') {
                    const result = rooms.join(this, parsed.data.roomName);
                    _connection.sendUTF(JSON.stringify({
                        type: 'privateMessage',
                        requestId: parsed.requestId,
                        data: result
                    }))
                }
            }
        })
    }
}