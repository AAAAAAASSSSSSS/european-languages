// Writes data/votable.json: the ids that can still be voted for (languages without any polygon, words without any entry).
// The voting server reads this file, so an item stops being votable the moment it is added to the project.
// Run:  node tools/votable.js     (tools/bundle.py runs it for you when node is installed)
const vm=require("vm"),fs=require("fs"),path=require("path");const root=path.join(__dirname,"..");
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const f of["tree","native","areas","edits","edits2","words","worddata"])vm.runInContext(fs.readFileSync(path.join(root,"data",f+".js"),"utf8"),ctx);
const a=ctx.EDITS||{},b=ctx.EDITS2||{},ED={};["remove","add"].forEach(k=>ED[k]=[...(a[k]||[]),...(b[k]||[])]);["rename","parent","flags","note"].forEach(k=>ED[k]={...(a[k]||{}),...(b[k]||{})});
const rows=ctx.TREE.filter(t=>!ED.remove.includes(t[0])).map(t=>t.slice()).concat(ED.add.map(t=>t.slice())),RB={};rows.forEach(t=>RB[t[0]]=t);
for(const[k,i]of[["rename",1],["parent",2],["note",4],["flags",3]])Object.entries(ED[k]).forEach(([id,v])=>RB[id]&&(RB[id][i]=v));
const N={};rows.forEach(([id,name,p,f])=>N[id]={id,name,p,f,kids:[]});const nodes=Object.values(N);nodes.forEach(n=>N[n.p]&&N[n.p].kids.push(n));
// descendants of an extinct language are extinct (not under Indo-Iranian)
nodes.forEach(n=>{if(n.f.includes("x")||n.name==="[…]")return;let t=N[n.p],ir=false,dead=false;while(t){if(t.name==="Indo-Iranian")ir=true;if(t.f.includes("x"))dead=true;t=N[t.p]}if(dead&&!ir)n.f+="x"});
const memo={},has=n=>memo[n.id]!==undefined?memo[n.id]:(memo[n.id]=((ctx.AREAS[n.id]||[]).length>0)||n.kids.some(has));
const alive=n=>!n.f.includes("x")&&(!n.kids.length||n.kids.every(k=>k.name==="[…]")||n.kids.some(k=>k.name!=="[…]"&&alive(k)));
const lang=nodes.filter(n=>n.name!=="[…]"&&!has(n)&&alive(n)).map(n=>n.id);
const word=[];for(const s of ctx.WORDS.sections)for(const nm of s.words.split(",").map(x=>x.trim()).filter(Boolean)){const id=s.id+"/"+nm.toLowerCase().replace(/[^a-z0-9]+/g,"-"),d=(ctx.WORDDATA||{})[id];if(!d||!(d.entries||[]).some(e=>N[e[0]]))word.push(id)}
fs.writeFileSync(path.join(root,"data","votable.json"),JSON.stringify({lang,word}));console.log("votable: "+lang.length+" languages, "+word.length+" words");
