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
    connected: boolean;
    correctWords: Array<string>;
    incorrectWords: Array<string>;
}

export interface IGameState{
  //  isStarted: boolean;
    letters: ILetter[][];
    players: Array<IPlayerData>;
    currentPlayerIndex: number;
    time: number;
    currentRound: number;
    totalRounds: number;
   // spectators: Array<string>;
  //  isStartRequested: boolean;
  //  startRequestTime: number;
    currentMove: number;
    hexMode: boolean
}

export interface IWinData {
    players: Array<IPlayerData>
}
