interface IYaGames {
    init():Promise<IYaSdk>;
}

interface IYaSdk {
    features: {
        LoadingAPI: {
            ready():void;
        }
    }

    getPlayer(options?: {signed?: boolean, scopes?: boolean}):Promise<{getMode:()=>('lite' | string)}>

    auth: {
        openAuthDialog():Promise<void>;
    }
}

export class YandexPlatform {
    sdk: IYaSdk;

    constructor(){

    }

    async init(){
        await this.loadSdk();
        await this.initSdk();
    }

    private loadSdk(): Promise<void>{
        return new Promise((resolve, reject)=>{
            const script = document.createElement('script');
            document.body.appendChild(script);
            script.onload = ()=>{
                resolve();
            }
            script.onerror = ()=>{
                reject();
            }
            script.async = true;
            script.src = 'https://yandex.ru/games/sdk/v2';
        })
    }

    private initSdk(): Promise<void>{
        const YaGames: IYaGames = (window as any).YaGames;
        return YaGames
        .init()
        .then(ysdk => {
            console.log('Yandex SDK initialized', ysdk);
            this.sdk = ysdk;
        });
    }

    initPlayer(){
        if (!this.sdk){
            console.log('Sdk not found');
            return null;
        }
        return this.sdk.getPlayer().then(_player => {
            console.log(_player);
            return _player;
        });
    }

    getUrlProps(){
        const props = window.location.search.split('&');
        const result: Record<string, string> = {};
        props.forEach(it=> {
            try {
            const [key, value] = it.split('=');
            result[key] = value;
            } catch(e){

            }
        });
        return result;
    }

    getLang(){
        return this.getUrlProps()['lang'] || 'en';
    }
}