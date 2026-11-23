// WORDDATA: the real data, keyed "section/word" (word = lower case, spaces -> "-").
// entry = [nodeId, form, clusterKey, chain?, borrowed?, source?]; a language may have several entries for one word (two words, or one per root)
//   nodeId     language or dialect id (tree.js + edits.js); the word is drawn on that node's area minus any descendant that has its own entry
//   clusterKey key into `clusters`; the same key = same root = same colour (two different words of one cluster get two shades of it)
//   chain      known steps between the cluster root and the modern form, oldest first: [["Proto-Italic","*akʷā"],["Latin","aqua"]]; a 3rd item 1 = borrowed from the previous box (dotted line)
//   borrowed   1 = the modern form itself was borrowed from the last chain step
//   source     [url, hover text]; every source that has a word gets its own letter in the language's box
// clusters = { key: { lang: "Proto-Indo-European", form: "*h₂ekʷeh₂" } }   (oldest known root; "Semitic" etc. when the word came from there)
const WK="https://en.wiktionary.org/wiki/";
const S=(path,tip)=>[WK+path,"Wiktionary: "+tip];
const VIN=S("vinum","Latin vīnum, descendants (Aromanian yin/yinu, Istro-Romanian vir, Megleno-Romanian vin)");
const VINRO=S("vin","vin (Romanian), from Latin vīnum");
const LUP=S("lup","lup (Aromanian, Istro-Romanian and Megleno-Romanian), from Latin lupus");
const LUPUS=S("lupus","Latin lupus, descendants (Aromanian lup/lupu, Romanian lup, Maltese lupu)");
const CAL=S("cal","cal (Aromanian, Megleno-Romanian and Romanian), from Late Latin caballus");
const MEL=S("Reconstruction:Latin/melem","Reconstruction:Latin/*melem, descendants (Aromanian njari, Istro-Romanian mľåre, Megleno-Romanian m'ari)");
const CAD=["https://www.anticaciviltasarda.com/files/vocabolario-logudorese---campidanese-italiano.pdf","Logudorese–Campidanese–Italian dictionary (forms marked l. = Logudorese, c. = Campidanese)"];
const PIT=["Proto-Italic","*akʷā"],AQ=["Latin","aqua"];
window.WORDDATA={
"drinks/water":{clusters:{A:{lang:"Proto-Indo-European",form:"*h₂ekʷeh₂"},B:{lang:"Proto-Afroasiatic",form:"*maʔ-"},C:{lang:"Basque",form:"ur (origin unknown)"},D:{lang:"Proto-Celtic",form:"*udenskyos"}},entries:[
  ["arom1237","apã","A",[PIT,AQ],0,S("ap%C3%A3","apã (Aromanian)")],
  ["istr1245","åpe","A",[PIT,AQ],0,S("%C3%A5pe","åpe (Istro-Romanian)")],
  ["megl1237","apu","A",[PIT,AQ],0,S("apu","apu (Megleno-Romanian), from Latin aqua")],
  ["roma1327","apă","A",[PIT,AQ],0,S("ap%C4%83","apă (Romanian), from Latin aqua")],
  ["basq1248","ur","C",[],0,S("ur","ur (Basque); origin unknown")],
  ["manx1243","ushtey","D",[["Old Irish","uisce"]],0,S("ushtey","ushtey (Manx), from Old Irish uisce")],
  ["camp1261","àcua","A",[PIT,AQ],0,S("%C3%A0cua","àcua (Campidanese Sardinian), from Latin aqua")],
  ["logu1236","abba","A",[PIT,AQ],0,S("abba","abba (Logudorese and Nuorese Sardinian), from Latin aqua")],
  ["malt1254","ilma","B",[["Proto-Semitic","*māy-"],["Arabic","مَاء (māʔ)"]],0,S("%D9%85%D8%A7%D8%A1","مَاء (Arabic māʔ), descendants (Maltese ilma)")]]},
"drinks/wine":{clusters:{A:{lang:"Proto-Italic",form:"*wīnom"},B:{lang:"Arabic",form:"نَبِيذ (nabīḏ)"},C:{lang:"Proto-Basque",form:"*ardano"}},entries:[
  ["arom1237","yin","A",[["Latin","vīnum"]],0,VIN],
  ["istr1245","vir","A",[["Latin","vīnum"]],0,VIN],
  ["megl1237","vin","A",[["Latin","vīnum"]],0,VIN],
  ["roma1327","vin","A",[["Latin","vīnum"]],0,VINRO],
  ["basq1248","ardo","C",[],0,["https://projetbabel.org/basque/dictionary.php?q=ardo","Projet Babel Basque dictionary: ardo"]],
  ["bisc1236","ardao","C",[],0,S("ardao","ardao (Biscayan alternative form of ardo)")],
  ["manx1243","feeyn","A",[["Latin","vīnum"],["Old Irish","fín",1]],0,S("feeyn","feeyn (Manx), from Old Irish fín, borrowed from Latin vīnum")],
  ["logu1236","binu","A",[["Latin","vīnum"]],0,CAD],
  ["camp1261","binu","A",[["Latin","vīnum"]],0,["https://www.academia.edu/85000725/Fueddariu_sardu_campidanesu_italianu_Melis","Melis, Fueddariu sardu campidanesu–italianu (bìnu)"]],
  ["malt1254","inbid","B",[],0,S("nbid","nbid / inbid (Maltese), from Arabic nabīḏ")]]},
"animals/wolf":{clusters:{A:{lang:"Proto-Indo-European",form:"*wĺ̥kʷos"},B:{lang:"Proto-Semitic",form:"*ḏiʔb-"},C:{lang:"Proto-Basque",form:"*otso"}},entries:[
  ["arom1237","lup","A",[["Proto-Italic","*lukʷos"],["Latin","lupus"]],0,LUP],
  ["istr1245","lup","A",[["Proto-Italic","*lukʷos"],["Latin","lupus"]],0,LUP],
  ["megl1237","lup","A",[["Proto-Italic","*lukʷos"],["Latin","lupus"]],0,LUP],
  ["roma1327","lup","A",[["Proto-Italic","*lukʷos"],["Latin","lupus"]],0,LUPUS],
  ["basq1248","otso","C",[],0,S("otso","otso (Basque), first attested in 1545")],
  ["camp1261","lupu","A",[["Proto-Italic","*lukʷos"],["Latin","lupus"],["Italian","lupo"]],1,["https://www.filologiasarda.eu/pubblicazioni/pdf/cfsvangeli/04glossario.pdf","Glossary of a Campidanese Gospel edition: lupu (Cagliari variety), an Italian loan according to Weiss"]],
  ["malt1254","lupu","A",[["Proto-Italic","*lukʷos"],["Latin","lupus"],["Sicilian","lupu"]],1,S("lupu","lupu (Maltese), borrowed from Sicilian lupu")],
  ["malt1254","dib","B",[["Arabic","ذِئْب (ḏiʔb)"]],0,S("dib","dib (Maltese), from Arabic ذِئْب (ḏiʔb)")]]},
"animals/dog":{clusters:{A:{lang:"Proto-Indo-European",form:"*ḱwṓ"},B:{lang:"Proto-Semitic",form:"*kalb-"},C:{lang:"Proto-Basque",form:"*zakuR"},D:{lang:"Proto-Basque",form:"*hoŕ"},E:{lang:"Old Irish",form:"madrad"}},entries:[
  ["arom1237","cãni","A",[["Latin","canis"]],0,S("c%C3%A3ni","cãni (Aromanian), alternative form cãne")],
  ["istr1245","căre","A",[["Latin","canis"]],0,S("c%C4%83re","căre (Istro-Romanian)")],
  ["megl1237","cǫini","A",[["Latin","canis"]],0,S("c%C7%ABini","cǫini (Megleno-Romanian), alternative form coini")],
  ["roma1327","câine","A",[["Latin","canis"]],0,S("c%C3%A2ine","câine (Romanian), from Latin canis")],
  ["basq1248","txakur","C",[["Basque (base word)","zakur"]],0,S("txakur","txakur (Basque), originally a diminutive of zakur; variants xakur, txakhür")],
  ["basq1248","or","D",[],0,S("or","or (Basque, variant hor); mostly replaced by zakur and txakur")],
  ["cypr1248","kilp","B",[["Arabic","كَلْب (kalb)"]],0,S("Appendix%3ACypriot_Arabic_Swadesh_list","Cypriot Arabic Swadesh list: kilp")],
  ["manx1243","moddey","E",[],0,S("moddey","moddey (Manx), from Old Irish madrad")],
  ["logu1236","cane","A",[["Latin","canis"]],0,S("cane","cane (Logudorese and Nuorese Sardinian), from Latin canis")],
  ["camp1261","cani","A",[["Latin","canis"]],0,S("cane","cani (Campidanese Sardinian), alternative form of cane")],
  ["malt1254","kelb","B",[["Arabic","كَلْب (kalb)"]],0,S("kelb","kelb (Maltese), from Arabic كَلْب (kalb)")]]},
"animals/horse":{clusters:{A:{lang:"Late Latin",form:"caballus"},B:{lang:"Arabic",form:"زَامِل (zāmil)"},C:{lang:"Proto-Basque",form:"*zaldi"}},entries:[
  ["arom1237","cal","A",[],0,CAL],
  ["megl1237","cal","A",[],0,CAL],
  ["roma1327","cal","A",[],0,CAL],
  ["basq1248","zaldi","C",[],0,S("zaldi","zaldi (Basque), first recorded in 1226")],
  ["manx1243","cabbyl","A",[["Old Irish","capall",1]],0,S("cabbyl","cabbyl (Manx), from Old Irish capall, itself borrowed from Latin")],
  ["logu1236","caddu","A",[],0,CAD],
  ["camp1261","cuaddu","A",[],0,CAD],
  ["malt1254","żiemel","B",[],0,S("%C5%BCiemel","żiemel (Maltese), from Arabic زَامِل (zāmil, horse or wild ass)")]]},
"food/honey":{clusters:{A:{lang:"Proto-Indo-European",form:"*mélit"},B:{lang:"Arabic",form:"عَسَل (ʕasal)"},C:{lang:"Basque",form:"*ez (wax, honey)"}},entries:[
  ["arom1237","njari","A",[["Proto-Italic","*meli"],["Latin","mel"],["Vulgar Latin","*melem"]],0,MEL],
  ["istr1245","mľåre","A",[["Proto-Italic","*meli"],["Latin","mel"],["Vulgar Latin","*melem"]],0,MEL],
  ["megl1237","m'ari","A",[["Proto-Italic","*meli"],["Latin","mel"],["Vulgar Latin","*melem"]],0,MEL],
  ["roma1327","miere","A",[["Proto-Italic","*meli"],["Latin","mel"],["Vulgar Latin","*melem"]],0,S("miere","miere (Romanian), from Latin mel")],
  ["basq1248","ezti","C",[],0,S("ezti","ezti (Basque), from *ez (wax, honey) + -ti")],
  ["manx1243","mill","A",[["Proto-Celtic","*meli"],["Old Irish","mil"]],0,S("mill","mill (Manx), from Old Irish mil")],
  ["camp1261","meli","A",[["Proto-Italic","*meli"],["Latin","mel"]],0,S("mele","meli (Campidanese Sardinian), from Latin mel")],
  ["malt1254","għasel","B",[],0,S("g%C4%A7asel","għasel (Maltese), from Arabic عَسَل (ʕasal)")]]},
"vegetables/onion":{clusters:{A:{lang:"Latin",form:"cēpa"},B:{lang:"Arabic",form:"بَصَل (baṣal)"}},entries:[
  ["arom1237","tseapã","A",[],0,S("tseap%C3%A3","tseapã (Aromanian), inherited from Latin cēpa")],
  ["roma1327","ceapă","A",[],0,S("ceap%C4%83","ceapă (Romanian), from Latin cēpa")],
  ["malt1254","basal","B",[],0,S("basal","basal (Maltese, collective; singulative basla), from Arabic بَصَل (baṣal)")]]}
};
