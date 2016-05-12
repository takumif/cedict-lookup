import {readFileSync} from "fs"
import {Entry} from "./entry"

export class CedictParser {
    /**
     * Parses a CEDICT text file into a list of entries
     */
    static parse(file: string): Entry[] {
        var text = readFileSync(file, "utf-8");
        return CedictParser.parseCedictText(text);
    }
    
    private static parseCedictText(text: string): Entry[] {
        var lines = text.split("\n");
        var entries: Entry[] = [];
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            
            // ignore non-entry lines
            if (line.length === 0 || line[0] === "#") {
                continue;
            }
            entries.push(CedictParser.parseCedictLine(line));    
        }
        return entries;
    }
    
    private static parseCedictLine(line: string): Entry {
        // Entries have this format:
        // TRADITIONAL SIMPLIFIED [PINYIN] /ENGLISH 1/ENGLISH 2/
        
        var firstSpace = line.indexOf(" ");
        var secondSpace = line.indexOf(" ", firstSpace + 1);
        var leftBracket = line.indexOf("[");
        var rightBracket = line.indexOf("]");
        var firstSlash = line.indexOf("/");
        var lastNonSlashChar = line.length - 2;
        
        var traditional = line.substr(0, firstSpace);
        var simplified = line.substr(firstSpace + 1, secondSpace - firstSpace - 1);
        var pinyin = line.substr(leftBracket + 1, rightBracket - leftBracket - 1);
        var english = line.substr(firstSlash + 1, lastNonSlashChar - firstSlash - 1);
        
        return new Entry(traditional, simplified, pinyin, english);
    }
}
