// EDITS: changes applied on top of data/tree.js and data/native.js when the page loads
// (so they survive a rebuild of those two files by tools/build_areas.py).
//   remove  ids dropped from the tree          add     rows [id,name,parent,flags,note,glottocode]
//   rename  id -> new name                     parent  id -> new parent id        flags  id -> new flags
//   native  id -> {main:[shown names], all:[every name, shown as hover]}
//   info    id -> {links:[{url?,tip?}], facts:[{t,ref?}], badges:[...]}   links get the letters [a],[b],[c]... in order
//           (a link without url is a plain source note; tip = hover text; fact.ref = index of the link whose letter it carries)
const WP="https://en.wikipedia.org/wiki/",RW="https://ro.wikipedia.org/wiki/",GL="https://glottolog.org/resource/languoid/id/";
const ATLAS={url:"https://ebib.inst-puscariu.ro/atlasullingvisticroman.html",tip:"Atlasul lingvistic român (Institutul de Lingvistică „Sextil Pușcariu”, e-library)"};
window.EDITS={
remove:["wall1263","arma1245","rram1234",
  /* Berber, Northwest Semitic (Punic, Phoenician), Iberian, Etruscan: nothing modern spoken in Europe descends from them */
  "berb1260", "grea1296", "zena1250", "chen1266", "beni1254", "blid1234", "metm1234", "tach1251", "tame1243", "zena1250_etc", "grea1296_etc", "kaby1244", "kaby1243", "tasa1242", "tazw1234", "less1241", "farw1241", "grea1281", "kaby1244_etc", "unun9880", "guan1277", "berb1260_etc", "nort3165", "cana1267", "ugar1239", "phoe1238", "puni1241", "neop1239", "phoe1238_etc", "ugar1239_etc", "cana1267_etc", "nort3165_etc", "iber1250", "etru1241",
  /* round 3: Anatolian detail, colonial varieties outside Europe */
  "abaj1234", "acro1240", "adae1234", "afri1276", "afro1260", "amer1254", "amer1259", "amer1261", "anat1257_etc", "ande1249", "ande1250", "appa1236", "atla1283", "aust1313", "aust1314", "aust1315", "baha1263", "blac1271", "boli1265", "bost1234", "braz1246", "brul1240", "camb1246", "came1256", "camf1234", "cana1268", "cape1242", "cari1274", "cari1288", "cent2388", "cent2389", "chap1272", "char1284", "chic1275", "chil1286", "cinc1234", "coas1329", "cuba1237", "domi1242", "earl1247", "east2835", "falk1236", "fiji1245", "flor1243", "fran1263", "ghan1247", "hong1245", "indi1255", "indi1259", "inla1269", "jama1265", "keny1281", "libe1248", "loui1241", "lumb1253", "luvi1234", "luvi1234_etc", "luvo1234", "luvo1235", "lyco1238", "lyco1238_etc", "lydi1241", "mala1551", "mexi1248", "mida1234", "midl1243", "mily1239", "mily1239_etc", "newf1239", "newm1234", "newm1235", "newy1234", "newz1240", "nige1260", "nort3314", "nort3316", "nort3317", "nort3318", "nort3383", "nort3384", "nort3385", "nucl1791", "ozar1236", "paki1244", "pala1331", "palm1243", "phil1246", "pome1234", "prov1249", "puer1238", "pure1243", "queb1247", "queb1250", "queb1251", "queb1252", "queb1253", "riop1234", "rura1252", "rwan1247", "sing1272", "sout3300", "sout3301", "sout3302", "sout3359", "span1270", "sril1243", "stlo1234", "stlo1235", "tali1266", "tanz1240", "texa1234", "ugan1243", "urba1236", "vall1258", "vene1262", "west2919", "west2920", "west2921", "west2971", "whit1271", "whit1272", "yuca1256"],
add:[
 ["manx-n","Northern Manx","manx1243","Dp","",""],
 ["manx-s","Southern Manx","manx1243","Dp","",""],
 ["manx-c","Central Manx","manx1243","Dp","",""],
 ["anat1257_all", "[…]", "anat1257", "n", "8 further Glottolog branches or languages outside this project, e.g. Hittite, Luwian, Lycian, Lydian, Carian, Palaic", ""],
 ["stan1288_out", "[…]", "stan1288", "n", "3 further Glottolog branches or languages outside this project, e.g. Latin American Spanish, Spanish of Equatorial Guinea, Adaeseño Spanish", ""],
 ["cana1258_out", "[…]", "cana1258", "n", "2 further Glottolog branches or languages outside this project, e.g. Brule Spanish, Isleño Spanish of St. Bernard Parish (Louisiana)", ""],
 ["port1283_out", "[…]", "port1283", "n", "1 further Glottolog branch or language outside this project, e.g. Brazilian Portuguese", ""],
 ["stan1290_out", "[…]", "stan1290", "n", "2 further Glottolog branches or languages outside this project, e.g. American Koine French (Québécois, Franco-Ontarien), Camfranglais", ""],
 ["vene1258_out", "[…]", "vene1258", "n", "1 further Glottolog branch or language outside this project, e.g. Talian (Brazilian Veneto)", ""],
 ["ostp1235_out", "[…]", "ostp1235", "n", "1 further Glottolog branch or language outside this project, e.g. Pomerano (Brazil)", ""],
 ["stan1293_out", "[…]", "stan1293", "n", "26 further Glottolog branches or languages outside this project, e.g. North American English, Australian English, New Zealand English, Indian English, Nigerian English, South African English", ""],
 ["rom-n","Northern group","roma1327","p","",""],
 ["rom-s","Southern group","roma1327","p","",""],
 ["arom-far","Fãrsherot","arom1237","D","","rram1234"],
 ["arom-gra","Grãmostean","arom1237","D","","arma1245"],
 ["arom-pin","Pindean","arom1237","D","","arma1245"]],
rename:{tran1277:"Transylvanian",bana1280:"Banat",olte1239:"Oltenia",less1244:"Oltenia-Tarani"},
parent:{bana1311:"rom-n",baya1255:"rom-n",cris1238:"rom-n",mara1372:"rom-n",mold1248:"rom-n",tran1277:"rom-n",munt1238:"rom-s",less1244:"rom-s"},
note:{afro1255_etc:"4 further Glottolog branches or languages outside this project, e.g. Berber, Chadic, Cushitic, Egyptian",cent2236_etc:"2 further Glottolog branches or languages outside this project, e.g. Northwest Semitic (Aramaic, Hebrew, Phoenician-Punic), Sayhadic"},
flags:{roma1334:"B",slav1255:"B",arab1395:"B",goid1240:"B",germ1287:"B",bryt1239:"B",gree1276:"B",oldl1240:"Dx",oldc1253:"Dx",oldp1256:"Dx",olds1253:"Dx",midd1359:"Dx",olds1252:"Dx",oldd1239:"Dx",fior1236:"Dx",midd1316:"Dx",oldc1251:"Dx",oldp1257:"Dx",midd1322:"Dx",angl1258:"Dx",midd1380:"Dx",mode1263:"Dx",roma1240:"Lx",euro1251:"Dx",manx1243:"L",corn1251:"L",east2303:"L",aval1237:"Dx",ronc1236:"Dx",alto1237:"Dx",baya1255:"Ds",megl1237:"L",istr1245:"L",arom1237:"Ls"},
native:{
 roma1327:{main:["Română","Românește"]},
 megl1237:{main:["Vlășește"]},
 istr1245:{main:["Vlåški","Žejånski"]},
 arom1237:{main:["Armãneashti"],all:["Armãneascã","Armãnã","Armãneashti","Armãneashte","Armãneashci","Armãneashce","Rrãmãneascã","Rrãmãnã","Rrãmãneshti"]},
 baya1255:{main:["Bȯjáṡ"]},
 tran1277:{main:["Graiul ardelenesc"]},cris1238:{main:["Graiul crișean"]},bana1280:{main:["Graiul bănățean"]},
 mara1372:{main:["Graiul maramureșean"]},mold1248:{main:["Graiul moldovenesc"]},munt1238:{main:["Graiul muntenesc"]},
 olte1239:{main:["Graiul oltenesc"]},gozo1238:{main:["Għawdxi"]},cypr1248:{main:["العربية القبرصية","سانا"]},guip1235:{main:["Gipuzkera"],all:["Gipuzkera","Gipuzkoan","Guipuzcoan"]},labo1236:{main:["Lapurtera"],all:["Lapurtera","Lapurtara"]},"arom-far":{main:["Fãrsherot"]},"arom-gra":{main:["Grãmostean"]},timo1262:{main:["Ungureni"]},tara1329:{main:["Țărani"]}},
info:{
 sard1257:{links:[{url:WP+"Limba_Sarda_Comuna"}]},
 camp1261:{links:[{url:WP+"Campidanese_Sardinian"},{url:WP+"Limba_Sarda_Comuna"}]},
 logu1236:{links:[{url:WP+"Logudorese_Sardinian"},{url:WP+"Limba_Sarda_Comuna"}]},
 arbo1235:{links:[{url:WP+"Campidanese_Sardinian"}]},
 meri1242:{links:[{url:WP+"Campidanese_Sardinian"}]},
 cent1961:{links:[{url:WP+"Campidanese_Sardinian"}]},
 ogli1238:{links:[{url:WP+"Campidanese_Sardinian"}]},
 sarr1244:{links:[{url:WP+"Campidanese_Sardinian"}]},
 subb1238:{links:[{url:WP+"Campidanese_Sardinian"}]},
 sulc1238:{links:[{url:WP+"Campidanese_Sardinian"}]},
 west2345:{links:[{url:WP+"Campidanese_Sardinian"}]},
 barb1262:{links:[{url:WP+"Logudorese_Sardinian"}]},
 nort2610:{links:[{url:WP+"Logudorese_Sardinian"}]},
 nuor1238:{links:[{url:WP+"Logudorese_Sardinian"}]},
 sout2614:{links:[{url:WP+"Logudorese_Sardinian"}]},
 manx1243:{links:[{url:WP+"Manx_language"}],facts:[{t:"Base dialect: Central Manx",ref:0}]},
 "manx-n":{links:[{url:WP+"Manx_language"}]},"manx-s":{links:[{url:WP+"Manx_language"}]},"manx-c":{links:[{url:WP+"Manx_language"}],badges:["base dialect of Manx"]},
 aval1237:{links:[{url:WP+"Alavese_dialect"}]},
 ronc1236:{links:[{url:WP+"Eastern_Navarrese_dialect"},{url:WP+"Salazarese_dialect"},{url:WP+"Roncalese_dialect"}]},
 alto1237:{links:[{url:WP+"Upper_Navarrese_dialect"}]},alto1238:{links:[{url:WP+"Upper_Navarrese_dialect"}]},
 bisc1236:{links:[{url:WP+"Biscayan_dialect"},{tip:"Because of its special features, Basque could well be split into two groups of dialects: Biscayan and all the rest. Georges Lacombe argued that the lines separating Biscayan from its neighbours (such as Gipuzkoan) run so close together that they form one clear border: its sounds, grammar and vocabulary all change in the same place. (As reported on Wikipedia.)"},{tip:"Biscayan is not one uniform dialect: it has two subdialects and eight main variations. Western subdialect: Uribe-Kosta, Mungialdea, Txorierri, Nerbion Valley, Zeberio, Arratia, Orozko. Eastern subdialect: Lea-Artibai, Durangaldea, Aramaio, Debagoiena, Debabarrena, Ermua, Eibar, Soraluze. Two transitional zones: Busturialdea, Otxandio and Villarreal (between the Western and Eastern subdialects), and Elgoibar, Deba, Mendaro and Mutriku (between Biscayan and Gipuzkoan). The Biscayan used by Sabino Arana and his followers added many new and purist word forms and used spellings such as ĺ and ŕ, but only some of these innovations were taken up by modern Biscayan and Standard Basque."}]},
 guip1235:{links:[{url:WP+"Gipuzkoan_dialect"}]},
 basq1249:{links:[{url:WP+"Navarro-Lapurdian_dialect"}]},east1470:{links:[{url:WP+"Navarro-Lapurdian_dialect"}]},labo1236:{links:[{url:WP+"Navarro-Lapurdian_dialect"}]},west1508:{links:[{url:WP+"Navarro-Lapurdian_dialect"}]},
 basq1250:{links:[{url:WP+"Souletin_dialect"}]},
 basq1248:{links:[{url:WP+"Basque_dialects"},{url:WP+"Navarro-Lapurdian_dialect"}],facts:[{t:"Standard Basque (Batua) is based on the central dialects: Gipuzkoan, High Navarrese and Labourdin",ref:[0,1]}]},
 cypr1248:{links:[{url:WP+"Kormakitis"},{url:WP+"Cypriot_Arabic"}]},
 malt1254:{links:[{url:WP+"Maltese_language"}],facts:[{t:"Base dialect: Standard Maltese",ref:0}]},
 east2714:{links:[
  {url:WP+"Eastern_Romance_languages",tip:"Peter R. Petrucci, by contrast, states that Common Romanian had developed into two major dialects by the 10th century, and that Daco-Romanian and Istro-Romanian are descended from the northern dialect, while Megleno-Romanian and Aromanian are descended from the southern dialect."},
  {tip:"Petrucci, Peter R. (1999). Slavic Features in the History of Rumanian. München: LINCOM Europa. ISBN 3-89586-599-0."}]},
 roma1327:{links:[{url:WP+"Romanian_language"},ATLAS],
  facts:[{t:"Official in: Moldova, Romania, Vojvodina (Serbia)",ref:0},{t:"Base dialect: Muntenian",ref:0}]},
 megl1237:{links:[{url:WP+"Megleno-Romanian_language"}]},
 istr1245:{links:[{url:WP+"Istro-Romanian_language"}]},
 arom1237:{links:[{url:WP+"Aromanian_language"}]},
 "arom-far":{links:[{url:WP+"Aromanian_dialects"}]},"arom-gra":{links:[{url:WP+"Aromanian_dialects"}]},"arom-pin":{links:[{url:WP+"Aromanian_dialects"}]},
 "rom-n":{links:[ATLAS,{url:RW+"Graiul_bucovinean",tip:"Some researchers also consider the Bukovinian dialect to be distinct from both the Maramureș and the Moldavian dialects."}]},
 "rom-s":{links:[ATLAS]},
 baya1255:{links:[
  {url:RW+"B%C4%83ie%C8%99i",tip:"In Hungary two main groups of dialects are distinguished, those in the south-west of the country, called árgyelán “Transylvanian” and muncsán “Muntenian”. Besides the Transylvanian and the Muntenian type, there is one more type of dialects, that of the Tisza people, called ticsán by Hungarian researchers. The Transylvanian dialects are close to the Crișana subdialect of the Romanian language, while the Muntenian ones are close to the Muntenian subdialect of Romanian. In both, the influence of the Banat subdialect can be felt, more strongly in the Transylvanian Boyash dialects. The Tisza dialect is closer to the Crișana subdialect in Romania than the Transylvanian Boyash dialects are. (Translated from the Romanian.)"},
  {url:WP+"Boyash"}]},
 tran1277:{links:[{url:RW+"Graiul_ardelenesc"}]},cris1238:{links:[{url:RW+"Graiul_cri%C8%99ean"}]},
 bana1280:{links:[{url:RW+"Graiul_b%C4%83n%C4%83%C8%9Bean"}]},bana1311:{links:[{url:RW+"Graiul_b%C4%83n%C4%83%C8%9Bean"}]},
 mara1372:{links:[{url:RW+"Graiul_maramure%C8%99ean"}]},mold1248:{links:[{url:RW+"Graiul_moldovenesc"}]},
 munt1238:{links:[{url:RW+"Graiul_muntenesc"},{url:GL+"wall1263",tip:"Glottolog: Wallachic"}],badges:["base dialect of Romanian"],facts:[{t:"Base dialect of standard Romanian"}]},
 olte1239:{links:[{url:RW+"Graiul_oltenesc"}]},less1244:{links:[{url:RW+"Graiul_oltenesc"}]},
 gozo1238:{links:[{url:WP+"Gozitan_dialects"},{url:WP+"G%C4%A7arb_dialect"}]},port1290:{links:[{url:WP+"Maltese_language"}]},
 rura1250:{links:[{url:WP+"Zurrieq_dialect"}]},zurr1238:{links:[{url:WP+"Zurrieq_dialect"}]},rura1251:{links:[{url:WP+"Maltese_language"}]},
 rura1249:{links:[{url:WP+"Maltese_language"},{url:WP+"Imgarri_dialect"}]},stan1322:{links:[{url:WP+"Maltese_language"}],badges:["base dialect of Maltese"]},
 timo1262:{links:[{url:RW+"Rom%C3%A2na_timocean%C4%83"}]},tara1329:{links:[{url:RW+"Rom%C3%A2na_timocean%C4%83"}]}}
};
