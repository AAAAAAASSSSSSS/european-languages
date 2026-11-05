// Source records. Shape: SOURCES[nodeId] = [{c: claim, w: who says it, r: reference, s: status}]
// status: "reference" = a real publication that covers this area generally (claim not individually checked);
//         "pending" = placeholder, a citation still has to be found; "data" = where the numbers come from.
// Add entries here; the [i] button in the app reads this file. Competing views go in as separate entries.
window.SOURCES={
_generic:[
 {c:"Region boundaries used for every polygon",w:"Natural Earth 1:10m admin-0 and admin-1 (public domain)",r:"naturalearthdata.com",s:"data"},
 {c:"Which countries and regions each language covers",w:"Catalogue supplied by the project owner (31 Oct 2026), refined with approximate boxes where a region is too coarse",r:"data/languages.txt",s:"pending"},
 {c:"Classification (parent and children)",w:"Glottolog and Ethnologue family trees, used as general guides",r:"glottolog.org, ethnologue.com",s:"reference"}],
ie:[{c:"Indo-European branches",w:"Mallory & Adams",r:"Encyclopedia of Indo-European Culture (1997)",s:"reference"}],
sl:[{c:"Slavic split into West, East and South",w:"Sussex & Cubberley",r:"The Slavic Languages (Cambridge, 2006)",s:"reference"}],
tk:[{c:"Turkic branches including Oghur",w:"Johanson & Csató (eds)",r:"The Turkic Languages (Routledge, 1998)",s:"reference"}],
ur:[{c:"Uralic branches",w:"Abondolo (ed)",r:"The Uralic Languages (Routledge, 1998)",s:"reference"}],
lc:[{c:"View A: Lechitic = Polabian + Polish + Pomeranian (Silesian inside Polish)",w:"to be filled in",r:"",s:"pending"},
    {c:"View B: Lechitic = Polabian + Pomeranian + Polish-Silesian, which then splits into Polish and Silesian",w:"to be filled in",r:"",s:"pending"}],
szl:[{c:"Silesian as its own language versus a dialect of Polish",w:"to be filled in",r:"",s:"pending"}],
rr:[{c:"Ladin, Romansh and Friulian form one Rhaeto-Romance group",w:"G. I. Ascoli",r:"Saggi ladini, Archivio Glottologico Italiano 1 (1873)",s:"reference"},
    {c:"The three are not a single unit",w:"Italian dialectologists in the opposing camp (e.g. Battisti)",r:"exact work to be filled in",s:"pending"}],
mol:[{c:"Moldovan as a separate language versus Romanian",w:"Moldovan legislation changed the state language name to Romanian (2023)",r:"to be verified",s:"pending"}],
elf:[{c:"Elfdalian as a language versus a Swedish dialect",w:"to be filled in",r:"",s:"pending"}],
sco:[{c:"Scots as a language versus a dialect of English",w:"to be filled in",r:"",s:"pending"}]};
