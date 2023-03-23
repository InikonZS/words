import { IBonus, IGameState, ILetter, IPlayerData } from "./interfaces";
import { abc, ru, formattedWordsRu, formattedWordsEn, freqRandom, generateLetters, getPoints, traceField, checkWord, findWordsByPart, getSumFreq, frequency, ru_freq } from "./logicTools";

export interface ILangGen{
    randomLetter():string;
    generateLetters(x: number, y: number):Array<Array<ILetter>>;
    traceField(letters: ILetter[][]):ILetter[][][][];
    checkWord(letters: ILetter[]):[result:boolean, word:string];
}

class UniGen implements ILangGen{
    private frequency: number[];
    private words: string[];
    private sumFreq: number[];
    private abc: string;

    constructor(abc: string, frequency: Array<number>, words:Array<string>){
        this.frequency = frequency;
        this.words = words;
        this.sumFreq = getSumFreq(this.frequency);
        this.abc = abc;
    }

    randomLetter(): string {
        return freqRandom(this.abc, this.sumFreq);
    }
    generateLetters(x: number, y: number): ILetter[][] {
        return generateLetters(x, y, this.abc, this.sumFreq);
    }
    traceField(letters: ILetter[][]): ILetter[][][][] {
        return traceField(letters, (part)=> findWordsByPart(part, this.words));
    }
    checkWord(letters: ILetter[]): [result: boolean, word: string] {
        return checkWord(letters, this.words);
    }  
}

export const enGen = new UniGen(abc, frequency, formattedWordsEn);
export const ruGen = new UniGen(ru, ru_freq, formattedWordsRu)