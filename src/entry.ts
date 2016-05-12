export class Entry {
    traditional: string;
    simplified: string;
    pinyin: string;
    english: string;
    
    constructor(trad: string, simpl: string, pinyin: string, english: string) {
        this.traditional = trad;
        this.simplified = simpl;
        this.pinyin = pinyin;
        this.english = english;
    }
}
