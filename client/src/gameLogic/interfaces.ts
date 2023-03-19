export interface IBonus{
    apply: ()=>void,
    name: string
}

export interface ILetter{
    id: string,
    x: number,
    y: number,
    letter: string,
    bonus: Array<IBonus>
}

export interface IPlayerData{
    name: string;
    points: number;
    crystals: number;
    winWord: string;
}

export interface IGameState{
    letters: ILetter[][];
    players: Array<IPlayerData>;
    currentPlayerIndex: number;
}