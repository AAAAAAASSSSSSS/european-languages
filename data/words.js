// WORDS: sections -> words -> entries.
// entry = [nodeId, form, clusterKey, chain?, borrowed?, source?]
//   nodeId     id of a language or dialect (tree.js + edits.js); the word is drawn on that node's area minus any descendant that has its own entry
//   clusterKey key into the word's `clusters`; entries with the same key share a colour and count as "same root" in the distance maths
//   chain      optional known steps between the cluster root and the modern form, oldest first: [["Proto-Germanic","*watōr"],["Old English","wæter"]]
//              a step may carry a 3rd item 1 = "borrowed from the previous box" (drawn with a dotted line)
//   borrowed   optional 1 = the modern form itself was borrowed from the last chain step
//   source     optional [url, hover text]; every source that has a word gets its own letter in the language's box
// clusters = { key: { lang: "Proto-Indo-European", form: "*wódr̥" } }  (oldest known root; Semitic etc. when the word came from there)
const WK="https://en.wiktionary.org/wiki/";
const VIN=[WK+"vinum","Wiktionary: Latin vīnum, descendants (Aromanian yin/yinu, Istro-Romanian vir, Megleno-Romanian vin)"];
window.WORDS={sections:[
{id:"drinks",name:"Drinks",words:[
 {id:"water",name:"Water",clusters:{A:{lang:"Proto-Indo-European",form:"*h₂ekʷeh₂"}},entries:[
  ["arom1237","apã","A",[["Proto-Italic","*akʷā"],["Latin","aqua"]],0,[WK+"ap%C3%A3","Wiktionary: apã (Aromanian)"]],
  ["istr1245","åpe","A",[["Proto-Italic","*akʷā"],["Latin","aqua"]],0,[WK+"%C3%A5pe","Wiktionary: åpe (Istro-Romanian)"]]]},
 {id:"beer",name:"Beer",clusters:{},entries:[]},
 {id:"wine",name:"Wine",clusters:{A:{lang:"Proto-Italic",form:"*wīnom"}},entries:[
  ["arom1237","yin","A",[["Latin","vīnum"]],0,VIN],
  ["istr1245","vir","A",[["Latin","vīnum"]],0,VIN],
  ["megl1237","vin","A",[["Latin","vīnum"]],0,VIN]]}]},
{id:"fruits",name:"Fruits",words:[
 {id:"apple",name:"Apple",clusters:{},entries:[]},
 {id:"orange",name:"Orange",clusters:{},entries:[]},
 {id:"banana",name:"Banana",clusters:{},entries:[]},
 {id:"lemon",name:"Lemon",clusters:{},entries:[]},
 {id:"grape",name:"Grape",clusters:{},entries:[]},
 {id:"olive",name:"Olive",clusters:{},entries:[]},
 {id:"strawberry",name:"Strawberry",clusters:{},entries:[]}]},
{id:"vegetables",name:"Vegetables",words:[
 {id:"cucumber",name:"Cucumber",clusters:{},entries:[]},
 {id:"potato",name:"Potato",clusters:{},entries:[]},
 {id:"garlic",name:"Garlic",clusters:{},entries:[]},
 {id:"onion",name:"Onion",clusters:{A:{lang:"Latin",form:"cēpa"}},entries:[
  ["arom1237","tseapã","A",[],0,[WK+"tseap%C3%A3","Wiktionary: tseapã (Aromanian), inherited from Latin cēpa"]]]},
 {id:"tomato",name:"Tomato",clusters:{},entries:[]},
 {id:"carrot",name:"Carrot",clusters:{},entries:[]}]}
]};
