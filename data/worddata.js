// WORDDATA: the real data, keyed "section/word" (word = lower case, spaces -> "-").
// entry = [nodeId, form, clusterKey, chain?, borrowed?, source?]; a language may have several entries for one word (two words, or one per root)
//   nodeId     language or dialect id (tree.js + edits.js); the word is drawn on that node's area minus any descendant that has its own entry
//   clusterKey key into `clusters`; the same key = same root = same colour (two different words of one cluster get two shades of it)
//   chain      known steps between the cluster root and the modern form, oldest first: [["Proto-Italic","*akʷā"],["Latin","aqua"]]; a 3rd item 1 = borrowed from the previous box (dotted line)
//   borrowed   1 = the modern form itself was borrowed from the last chain step
//   source     [url, hover text]; every source that has a word gets its own letter in the language's box
// clusters = { key: { lang: "Proto-Indo-European", form: "*h₂ekʷeh₂" } }   (oldest known root; "Semitic" etc. when the word came from there)
const WK="https://en.wiktionary.org/wiki/";
const VIN=[WK+"vinum","Wiktionary: Latin vīnum, descendants (Aromanian yin/yinu, Istro-Romanian vir, Megleno-Romanian vin)"];
window.WORDDATA={
"drinks/water":{clusters:{A:{lang:"Proto-Indo-European",form:"*h₂ekʷeh₂"}},entries:[
  ["arom1237","apã","A",[["Proto-Italic","*akʷā"],["Latin","aqua"]],0,[WK+"ap%C3%A3","Wiktionary: apã (Aromanian)"]],
  ["istr1245","åpe","A",[["Proto-Italic","*akʷā"],["Latin","aqua"]],0,[WK+"%C3%A5pe","Wiktionary: åpe (Istro-Romanian)"]]]},
"drinks/wine":{clusters:{A:{lang:"Proto-Italic",form:"*wīnom"}},entries:[
  ["arom1237","yin","A",[["Latin","vīnum"]],0,VIN],
  ["istr1245","vir","A",[["Latin","vīnum"]],0,VIN],
  ["megl1237","vin","A",[["Latin","vīnum"]],0,VIN]]},
"vegetables/onion":{clusters:{A:{lang:"Latin",form:"cēpa"}},entries:[
  ["arom1237","tseapã","A",[],0,[WK+"tseap%C3%A3","Wiktionary: tseapã (Aromanian), inherited from Latin cēpa"]]]}
};
