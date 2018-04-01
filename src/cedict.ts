import {Entry} from "./entry"
import {CedictParser} from "./parser"

/**
 * An implementation of Cedict using the prefix tree data structure.
 * Each node (except for the root) contains a character, and contains a list of
 * entries formed by the characters in the path from the root to the node.
 * It uses the traditional attribute as the lookup key into the tree.
 */
class Cedict {
    private root: CedictNode;
    private traditional: boolean;

    constructor(entries: Entry[], trad: boolean) {
        this.traditional = trad;
        this.root = new CedictNode("");
        this.populateTree(entries);
    }

    getMatch(query: string): Entry[] {
        var node = this.getNodeForWord(query);
        return node != null ? node.entries : [];
    }

    getEntriesStartingWith(query: string): Entry[] {
        var node = this.getNodeForWord(query);
        return node != null ? this.gatherEntriesUnderNode(node) : [];
    }

    /**
     * E.g. for a query of "我們是" this will return entries for 我 and 我們
     */
    getPrefixEntries(query: string): Entry[] {
        var node = this.root;
        var entries: Entry[] = [];

        for (var i = 0; i < query.length; i++) {
            var nextChar = query[i];
            if (node.suffixes[nextChar] === undefined) {
                break;
            }
            node = node.suffixes[nextChar];
            Array.prototype.push.apply(entries, node.entries);
        }
        return entries;
    }

    private populateTree(entries: Entry[]): void {
        for (var i = 0; i < entries.length; i++) {
            this.insertEntry(entries[i]);
        }
    }

    private insertEntry(entry: Entry): void {
        var node = this.root;
        var characters = this.traditional ? entry.traditional : entry.simplified;
        while (node.word != characters) {
            var nextChar = characters[node.word.length];

            if (node.suffixes[nextChar] === undefined) {
                // never seen this character sequence before, so make a node for it
                node.suffixes[nextChar] = new CedictNode(node.word + nextChar);
            }
            node = node.suffixes[nextChar];
        }
        node.entries.push(entry);
    }

    private gatherEntriesUnderNode(node: CedictNode): Entry[] {
        if (node == null) {
            return [];
        }
        var entries: Entry[] = [];
        Array.prototype.push.apply(entries, node.entries);

        // get the entries from all the child nodes
        for (var suffix in node.suffixes) {
            Array.prototype.push.apply(entries, this.gatherEntriesUnderNode(node.suffixes[suffix]));
        }
        return entries;
    }

    /**
     * Returns null if the node is not found
     */
    private getNodeForWord(word: string): CedictNode {
        var node = this.root;
        for (var i = 0; i < word.length; i++) {
            var nextChar = word[i];
            if (node.suffixes[nextChar] === undefined) {
                return null;
            }
            node = node.suffixes[nextChar];
        }
        return node;
    }
}

class CedictNode {
    word: string;
    entries: Entry[];
    suffixes: { [id: string]: CedictNode };

    constructor(w: string) {
        this.word = w;
        this.entries = [];
        this.suffixes = {};
    }
}

export async function loadTraditional(filename: string): Promise<Cedict> {
    var entries = await CedictParser.parse(filename);
    return new Cedict(entries, true);
}

export async function loadSimplified(filename: string): Promise<Cedict> {
    var entries = await CedictParser.parse(filename);
    return new Cedict(entries, false);
}
