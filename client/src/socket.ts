import { Signal } from "./common/signal"

const socketUrl = 'ws://localhost:4002';

const createIdGenerator = (pref: string) => {
    let id = 0;
  
    return () => {
      return pref + id++
    }
}

export default class Socket {
    webSocket: WebSocket
    private privateMessageSignal: Signal<Record<string, any>>
    nextReqId: () => string = createIdGenerator("socketReq");
    onConnect: () => void
    onClose: () => void;
    onMessage: (message: any) => void;
  
    constructor() {
      this.privateMessageSignal = new Signal()
      this.webSocket = new WebSocket(socketUrl)
      // this.webSocket.binaryType = "arraybuffer"
      this.webSocket.binaryType = "blob"
      this.webSocket.onopen = () => {
        this.onConnect?.()
      }
      this.webSocket.onerror = () => {
        console.log('Socket Error');
        this.onClose?.();
      }
      this.webSocket.onmessage = (message) => {
        console.log(message)
        const parsedData = JSON.parse(message.data)
        if (parsedData.type === "privateMessage") {
            this.privateMessageSignal.emit(parsedData)
        }
        this.onMessage?.(parsedData);
      }
      this.webSocket.onclose = () => {
        console.log('close')
        this.onClose?.();
      }
    }
  
    sendState(state: Record<string, any>): Promise<Record<string, any>> {
      state.requestId = this.nextReqId()
      this.webSocket.send(JSON.stringify(state))
  
      const response = new Promise<Record<string, any>>(res => {
        const handler = (msg: any) => {
          if (msg.requestId === state.requestId) {
            this.privateMessageSignal.remove(handler)
            res(msg.data)
          }
        }
  
        this.privateMessageSignal.add(handler)
      })
  
      return response
    }
  
    sendBinaryState(state: Blob) {
      this.webSocket.send(state)
    }
  
    destroy() {
      this.webSocket.close()
    }
  }