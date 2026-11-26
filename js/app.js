(()=>{
const $=s=>document.querySelector(s), H=document.documentElement, esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ED=(()=>{const a=window.EDITS||{},b=window.EDITS2||{},o={};["remove","add"].forEach(k=>o[k]=[...(a[k]||[]),...(b[k]||[])]);["rename","parent","flags","note","native","info"].forEach(k=>o[k]={...(a[k]||{}),...(b[k]||{})});return o})(),INFO=ED.info||{};
const ROWS=TREE.filter(t=>!(ED.remove||[]).includes(t[0])).map(t=>t.slice()).concat((ED.add||[]).map(t=>t.slice()));
const RB={};ROWS.forEach(t=>RB[t[0]]=t);
Object.entries(ED.rename||{}).forEach(([id,v])=>RB[id]&&(RB[id][1]=v));Object.entries(ED.parent||{}).forEach(([id,v])=>RB[id]&&(RB[id][2]=v));Object.entries(ED.note||{}).forEach(([id,v])=>RB[id]&&(RB[id][4]=v));Object.entries(ED.flags||{}).forEach(([id,v])=>RB[id]&&(RB[id][3]=v));
const F0=(n,c)=>n.f.includes(c);const N={};ROWS.forEach(([id,name,p,f,note,code],i)=>N[id]={id,name,p,f,note,code,i,kids:[]});
const nodes=Object.values(N);nodes.forEach(n=>N[n.p]&&N[n.p].kids.push(n));
const COLL=new Intl.Collator("en",{sensitivity:"base",numeric:true}),cmpN=(x,y)=>(x.name==="[…]")-(y.name==="[…]")||COLL.compare(x.name,y.name);   // the tree is always alphabetical, […] last
nodes.forEach(n=>n.kids.sort(cmpN));const ROOTS=nodes.filter(n=>!N[n.p]).sort(cmpN);
// whatever descends from an extinct language is extinct too (Indo-Iranian is left as it is); a revived language is un-flagged in edits.js
nodes.forEach(n=>{if(F0(n,"x")||n.name==="[…]")return;let t=N[n.p],ir=false,dead=false;while(t){if(t.name==="Indo-Iranian")ir=true;if(F0(t,"x"))dead=true;t=N[t.p]}if(dead&&!ir)n.f+="x"});
{const inIr=n=>{while(n){if(n.name==="Indo-Iranian")return true;n=N[n.p]}return false};   // and upwards: a category with nothing but extinct languages below it
 const up=n=>{n.kids.forEach(up);if(F0(n,"x")||n.name==="[…]"||F0(n,"L")||F0(n,"D")||!n.kids.length||inIr(n)||n.kids.some(k=>k.name==="[…]"))return;if(n.kids.every(k=>F0(k,"x")))n.f+="x"};
 nodes.filter(n=>!N[n.p]).forEach(up)}
const F=(n,c)=>n.f.includes(c), anc=n=>{const a=[];while(N[n.p]){n=N[n.p];a.push(n)}return a};
const disp=n=>F(n,"s")||anc(n).some(a=>F(a,"s"));   // dialects of a dispersed language are dispersed too
const byName=(a,b)=>N[a].name.localeCompare(N[b].name);
// ---- geometry: only the small shapes are given; every bigger shape is the UNION (set theory) of its parts ----
const NAT={};Object.entries(window.NATIVE||{}).forEach(([k,v])=>NAT[k]={main:[v]});Object.assign(NAT,ED.native||{});
const nat=n=>NAT[n.id]?`(${NAT[n.id].main.join("/")})`:"", natAll=n=>NAT[n.id]&&NAT[n.id].all?NAT[n.id].all.join(" / "):"";
const PC=window.polygonClipping, safe=(f,...a)=>{try{return f(...a)}catch(e){return null}};
const AR={};
const P=id=>AR[id]||(AR[id]=(AREAS[id]||[]).map(po=>po.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o})));
const toGJ=po=>po.map(r=>r.map(([la,ln])=>[ln,la])), ringA=r=>{let s=0;for(let i=0;i<r.length-1;i++)s+=r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1];return Math.abs(s)/2},
 fromGJ=mp=>mp.map(po=>po.filter((r,i)=>!i||ringA(r)>.02).map(r=>r.map(([x,y])=>[y,x])));   // tiny gaps between hand-drawn neighbours are filled; real enclaves (> 0.02 sq. degrees) stay
const DISPP=window.DISPP||{};
const MZ=(window.MIXED||[]).map(m=>({ids:m.ids,area:m.area.map(po=>po.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o}))}));
const SH={};
function shape(n){if(n.id in SH)return SH[n.id];const parts=P(n.id).map(toGJ);MZ.forEach(m=>m.ids.includes(n.id)&&m.area.forEach(po=>parts.push(toGJ(po))));n.kids.forEach(k=>{const s=shape(k);if(s)s.forEach(po=>parts.push(toGJ(po)))});
 let r=null;if(parts.length===1)r=fromGJ(parts);else if(parts.length){const u=safe(PC.union,...parts);r=u?fromGJ(u):fromGJ(parts)}
 return SH[n.id]=r&&r.length?r:null}
const has=n=>!!shape(n), exp=n=>n.kids.some(has), NOSHAPES=!Object.keys(AREAS).length, ok=n=>has(n)||(NOSHAPES&&n.name!=="[…]");
const bb=ring=>{let a=90,b=180,c=-90,d=-180;ring.forEach(([y,x])=>{a=Math.min(a,y);c=Math.max(c,y);b=Math.min(b,x);d=Math.max(d,x)});return[a,b,c,d]};
const LB=new WeakMap();   // label spot of one part: widest horizontal stretch through the part
function labelOf(po){let r=LB.get(po);if(r)return r;const ring=po[0],b=bb(ring);let best={w:0,lat:(b[0]+b[2])/2,lng:(b[1]+b[3])/2};
 for(const f of[.5,.42,.58,.34,.66,.26,.74]){const cy=b[0]+(b[2]-b[0])*f,xs=[];
  for(let i=0;i<ring.length-1;i++){const[y1,x1]=ring[i],[y2,x2]=ring[i+1];if((y1<=cy&&y2>cy)||(y2<=cy&&y1>cy))xs.push(x1+(cy-y1)/(y2-y1)*(x2-x1))}
  xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]-xs[i]>best.w)best={w:xs[i+1]-xs[i],lat:cy,lng:(xs[i]+xs[i+1])/2}}
 return LB.set(po,r={...best,area:(b[2]-b[0])*(b[3]-b[1])}),r}
// ---- state ----
let HINT1=false,HINT2=false,PEND2=false;const hint2=()=>{if(HINT2){$("#box").hidden=true;return}HINT2=true;showBox('<p class="mu">Word mode: each shape carries its word, shapes of one cluster share a colour, and the thick outline carries the oldest known root. A place with two words is striped.</p>')};let E=new Set(),S=null,MODE="street",HZ="F",LASTH="F",W=null,WSEL=null,items=[];
const dark=()=>H.dataset.theme==="dark";
// every child of a family gets its own hue (golden-angle steps from a family-specific start) and brothers alternate in lightness
nodes.forEach(n=>n.kids.forEach((k,i)=>k.si=i));ROOTS.forEach((k,i)=>k.si=i);
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h};
const hueOf=n=>(hash(n.p||"root")+n.si*137.508)%360,litOf=n=>(dark()?62:40)+(n.si%2?8:-6);
const col=n=>`hsl(${hueOf(n)},${dark()?66:60}%,${litOf(n)}%)`;
// cluster colours: red, blue, green, yellow, orange, then more (no black / white)
const PALC=["#e6194b","#2f6fe0","#2fa84f","#f2cf1d","#f58231","#911eb4","#17b8b8","#e056a8","#8b5a2b","#7f9a1c"];
const hex=(h,s,l)=>{s/=100;l/=100;const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,"0")};return"#"+f(0)+f(8)+f(4)};
const PAL=i=>i<PALC.length?PALC[i]:hex((i*137.508)%360,65,50);
const shade=(c,k)=>{if(!k)return c;const t=Math.min(.75,k*.45),v=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));return"#"+v.map(x=>Math.round(x+(255-x)*t).toString(16).padStart(2,"0")).join("")};
const map=L.map("map",{zoomControl:false,minZoom:3,maxZoom:14,renderer:L.canvas({padding:.4})}).setView([53,20],4);
L.control.zoom({position:"bottomright"}).addTo(map);
new(L.Control.extend({options:{position:"bottomright"},onAdd(){const d=L.DomUtil.create("div","leaflet-bar leaflet-control"),a=L.DomUtil.create("a","infobtn",d);a.href="#";a.textContent="i";a.title="About this project";a.setAttribute("role","button");
 L.DomEvent.on(a,"click",e=>{L.DomEvent.stop(e);$("#about").classList.toggle("open")});return d}}))().addTo(map);
$("#ax").onclick=()=>$("#about").classList.remove("open");
map.createPane("basep").style.zIndex=150;
const baseL=L.layerGroup().addTo(map),layer=L.layerGroup().addTo(map),labels=L.layerGroup().addTo(map);
function drawBase(){baseL.clearLayers();const cs=getComputedStyle(H),r=L.svg({pane:"basep"});BASE.forEach(([c,po])=>{
 L.polygon(po.map(p=>p.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o})),{pane:"basep",renderer:r,fillColor:cs.getPropertyValue("--land"),fillOpacity:1,color:cs.getPropertyValue("--bd"),weight:.7,interactive:false}).addTo(baseL)})}
let tl=[];
function tiles(){tl.forEach(x=>x.remove());tl=[];
 if(MODE==="sat"){tl.push(L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Imagery &copy; Esri"}),
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:18}))}
 else tl.push(L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}));
 tl.forEach(x=>x.addTo(map));map.getContainer().classList.toggle("inv",dark()&&MODE==="street")}
const colX=n=>hex(hueOf(n),dark()?66:60,litOf(n));
const mixCol=ids=>{const v=ids.map(id=>{const c=colX(N[id]);return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))});return"#"+[0,1,2].map(k=>Math.round(v.reduce((s,x)=>s+x[k],0)/v.length).toString(16).padStart(2,"0")).join("")};
const DS=new Map();   // dialect shape without the zones it shares with others
function dshape(n,zs){const base=shape(n);if(!base||!zs.length)return base;const key=n.id+"|"+zs.map(z=>MZ.indexOf(z)).join();if(DS.has(key))return DS.get(key);
 const d=safe(PC.difference,base.map(toGJ),...zs.flatMap(z=>z.area.map(toGJ)));const r=d?fromGJ(d):base;DS.set(key,r.length?r:null);return DS.get(key)}
const vis=n=>has(n)&&(!n.p||E.has(n.p))&&!E.has(n.id);
// ---- striped fills (a place with two words / a place shared by several dialects) are SVG patterns ----
const SVGR=L.svg({padding:.4});SVGR.addTo(map);const NS="http://www.w3.org/2000/svg",SPID=new Map();let DEFS=null;
function stripe(cols){const key=cols.join("|");if(SPID.has(key)&&DEFS&&DEFS.isConnected)return SPID.get(key);
 if(!DEFS||!DEFS.isConnected){DEFS=document.createElementNS(NS,"defs");SVGR._container.insertBefore(DEFS,SVGR._container.firstChild);SPID.clear()}
 const id="st"+SPID.size,p=document.createElementNS(NS,"pattern"),w=5;p.setAttribute("id",id);p.setAttribute("patternUnits","userSpaceOnUse");p.setAttribute("width",w*cols.length);p.setAttribute("height",10);p.setAttribute("patternTransform","rotate(45)");
 cols.forEach((c,i)=>{const r=document.createElementNS(NS,"rect");r.setAttribute("x",i*w);r.setAttribute("width",w);r.setAttribute("height",10);r.setAttribute("fill",c);p.append(r)});DEFS.append(p);SPID.set(key,id);return id}
function poly(po,o,cols){if(cols&&cols.length>1){const id=stripe(cols),p=L.polygon(po,{...o,renderer:SVGR,fillOpacity:.35}).addTo(layer);p._path&&p._path.setAttribute("fill",`url(#${id})`);return p}
 return L.polygon(po,o).addTo(layer)}
// ---- words: which node carries which word (a node may carry several) ----
const entFor=n=>{while(n){const e=W.ents.get(n.id);if(e)return e;n=N[n.p]}return null};   // own words, else the nearest ancestor's
const forms=es=>[...new Set(es.map(e=>e.form))].join(", "), colsOf=es=>[...new Set(es.map(e=>e.color))];
// area of a node minus the places further down that have a word of their own
function tshape(n){if(W.tc.has(n.id))return W.tc.get(n.id);const base=shape(n);let r=base;
 if(base){const cut=[];W.ents.forEach((e,id)=>{if(id!==n.id&&anc(N[id]).includes(n)){const s=shape(N[id]);s&&cut.push(s.map(toGJ))}});
  if(cut.length){const d=safe(PC.difference,base.map(toGJ),...cut);r=d?fromGJ(d):base}if(r&&!r.length)r=null}
 W.tc.set(n.id,r);return r}
function computeWS(){W.ws=new Map();W.sc=new Map();W.tc=new Map();W.entAnc=new Set();
 W.ents.forEach((e,id)=>anc(N[id]).forEach(a=>W.entAnc.add(a.id)));
 W.ents.forEach((e,id)=>{const r=tshape(N[id]);if(r)W.ws.set(id,r)});
 W.cls.forEach(c=>{const ps=c.ids.map(id=>W.ws.get(id)).filter(Boolean).map(s=>s.map(toGJ));
  const un=l=>{const q=l.length?safe(PC.union,...l):null;return l.length?fromGJ(q||l.flat()):null};
  c.u=un(ps);   // whole cluster (for its label); dispersed and compact members get their own outline (dotted / solid)
  c.uD=un(c.ids.filter(id=>disp(N[id])).map(id=>W.ws.get(id)).filter(Boolean).map(s=>s.map(toGJ)));
  c.uN=un(c.ids.filter(id=>!disp(N[id])).map(id=>W.ws.get(id)).filter(Boolean).map(s=>s.map(toGJ)))})}
// with a word selected only places that have a version of that word can be shown; a place that only has descendants with the word is cut down to those descendants
function wshape(n){if(entFor(n))return tshape(n);if(!W.entAnc.has(n.id))return null;if(W.sc.has(n.id))return W.sc.get(n.id);
 const ps=[];W.ws.forEach((mp,id)=>{if(anc(N[id]).includes(n))ps.push(mp.map(toGJ))});const u=ps.length?safe(PC.union,...ps):null;const r=u?fromGJ(u):null;W.sc.set(n.id,r);return r}
// ---- tiles: what is on the map at this moment (the same drawing is used with and without a word) ----
const ZC=new WeakMap();
function cutZones(mp,zs){if(!zs.length)return mp;const key=zs.map(z=>MZ.indexOf(z)).join();let m=ZC.get(mp);if(!m)ZC.set(mp,m=new Map());if(m.has(key))return m.get(key);
 const d=safe(PC.difference,mp.map(toGJ),...zs.flatMap(z=>z.area.map(toGJ))),r=d?fromGJ(d):mp,out=r.length?r:null;m.set(key,out);return out}
const inRing=(ll,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[yi,xi]=r[i],[yj,xj]=r[j];if((yi>ll.lat)!==(yj>ll.lat)&&ll.lng<(xj-xi)*(ll.lat-yi)/(yj-yi)+xi)c=!c}return c};
const inPoly=(ll,po)=>inRing(ll,po[0])&&!po.slice(1).some(h=>inRing(ll,h));
const isSel=n=>n.id===S;
let HIT=[];
function wtiles(){const T=[],seen=new Set(),add=(n,mp,es)=>{if(mp&&mp.length&&!seen.has(n.id)){seen.add(n.id);T.push({n,mp,es})}};
 if(HZ){nodes.filter(vis).forEach(n=>{const es=entFor(n);add(n,es?tshape(n):wshape(n),es)});return T}
 W.ents.forEach((es,id)=>{const n=N[id];if(!E.has(id))return add(n,W.ws.get(id),es);
  const rec=c=>{if(W.ents.has(c.id))return;if(E.has(c.id)&&c.kids.length)return c.kids.forEach(rec);add(c,tshape(c),es)};n.kids.forEach(rec)});   // a broken-up word area shows its dialects
 return T}
const ptiles=()=>nodes.filter(vis).map(n=>({n,mp:shape(n),es:null})).filter(t=>t.mp);
function render(T){const byId=new Map(T.map(t=>[t.n.id,t]));
 const zs=MZ.filter(m=>m.ids.every(id=>byId.has(id)&&(!W||byId.get(id).es)));   // shared zones are drawn once, on their own
 const parts=[];T.forEach(t=>{const mp=cutZones(t.mp,zs.filter(m=>m.ids.includes(t.n.id)));mp&&mp.forEach(po=>parts.push({t,po,a:labelOf(po).area}))});parts.sort((x,y)=>y.a-x.a);
 const tip=(pl,txt)=>pl.bindTooltip(txt,{sticky:true}).on("click",e=>clickAt(e.latlng));
 parts.forEach(({t,po})=>{const n=t.n,es=t.es,cols=es?colsOf(es):[col(n)],sel=isSel(n),dash=disp(n),c=cols[0];
  const o=es?{weight:sel?3.6:1.6,fillOpacity:sel?.6:dash?.22:.4}:{weight:sel?3.2:1.8,fillOpacity:dash?.05:sel?.3:.13};
  const dp=dash||dispPart(n,po);if(dp&&!dash){o.fillOpacity=es?(sel?.6:.22):(sel?.3:.05)}
  tip(poly(po,{color:c,fillColor:c,opacity:.95,dashArray:dp?"5 5":null,...o},es?cols:null),n.name+(nat(n)?" "+nat(n):"")+(es?": "+forms(es):""));
  HIT.push({ids:[n.id],po});items.push(es?{po,txt:forms(es),sub:n.name,sel}:{po,txt:n.name,sub:nat(n),sel})});
 zs.forEach(m=>{const ids=m.ids.slice().sort(byName),nm=ids.map(id=>N[id].name).join(" + "),sel=ids.includes(S),dash=ids.some(id=>disp(N[id])),es=W?ids.flatMap(id=>byId.get(id).es):null,
   cols=es?colsOf(es):[mixCol(ids)],c=cols[0],o=es?{weight:sel?3.6:1.6,fillOpacity:sel?.6:dash?.22:.4}:{weight:sel?3.2:1.8,fillOpacity:dash?.05:sel?.3:.13};
  m.area.forEach(po=>{tip(poly(po,{color:c,fillColor:c,opacity:.95,dashArray:dash?"5 5":null,...o},es?cols:null),es?`${nm}: ${forms(es)}`:nm);HIT.push({ids,po});items.push({po,txt:es?forms(es):nm,sub:es?nm:"",sel:false})})});
 if(W){const spots=new Map();   // one thick outline per cluster, with its oldest root written on it (roots that sit on the same spot are written together)
  W.cls.forEach(c=>{if(!c.u)return;[[c.uN,null],[c.uD,"9 7"]].forEach(([u,d])=>u&&u.forEach(po=>L.polygon(po,{color:c.color,weight:4.5,fill:false,opacity:1,interactive:false,dashArray:d}).addTo(layer)));
   const big=c.u.slice().sort((x,y)=>labelOf(y).area-labelOf(x).area)[0],l=labelOf(big),key=l.lat.toFixed(2)+","+l.lng.toFixed(2),r=c.root,txt=r.form||r.lang||"?",sb=r.form?r.lang:"";
   const g=spots.get(key)||spots.set(key,{po:big,txt:[],sub:[]}).get(key);if(!g.txt.includes(txt))g.txt.push(txt);if(sb&&!g.sub.includes(sb))g.sub.push(sb)});
  spots.forEach(g=>items.push({po:g.po,txt:g.txt.join(", "),sub:g.sub.join(" / "),cls:"root",sel:false}))}}
// some polygons of a dialect are dispersed and some are not: dotted only while the dialect itself is on the map
function dispPart(n,po){const d=DISPP[n.id];if(!d)return false;const l=labelOf(po);return d.some(k=>{const q=P(n.id)[k];return q&&inPoly({lat:l.lat,lng:l.lng},q)})}
// a click selects the place under the pointer; where several languages or dialects meet there, none is selected and the box offers each of them
function clickAt(ll){const hit=new Set();HIT.forEach(h=>{if(inPoly(ll,h.po))h.ids.forEach(id=>hit.add(id))});const ids=[...hit].sort(byName);
 if(ids.length>1)openMix(ids);else if(ids.length)pick(ids[0])}
function draw(){layer.clearLayers();items=[];HIT=[];if(HM)renderHeat();else render(W?wtiles():ptiles());drawLabels()}
function openMix(ids){S=null;if(!HM)draw();tree();showBox(`<div class="mixbox">${ids.map(id=>`<button class="mx" data-id="${id}">${esc(N[id].name)}</button>`).join("")}</div>`,true)}
function drawLabels(){labels.clearLayers();const ppd=256*Math.pow(2,map.getZoom())/360;let selShown=0;
 items.slice().reverse().forEach(it=>{const l=labelOf(it.po),px=l.w*ppd*Math.cos(l.lat*Math.PI/180);let fs=Math.min(34,px/(it.txt.length*.56));
  if(it.sel&&selShown<12){selShown++;fs=Math.max(fs,10)}else if(fs<9)return;
  L.marker([l.lat,l.lng],{interactive:false,icon:L.divIcon({className:"",iconSize:[0,0],html:`<div class="lbl ${it.cls||""}" style="font-size:${fs}px">${esc(it.txt)}${fs>=13&&it.sub?`<small>${esc(it.sub)}</small>`:""}</div>`})}).addTo(labels)})}
map.on("zoomend",drawLabels);
function fitTo(mps){const pts=mps.flatMap(mp=>mp.flatMap(po=>po[0]));if(pts.length)map.fitBounds(L.latLngBounds(pts),{maxZoom:9,padding:[60,60]})}
function fly(n){const s=shape(n);if(s)fitTo([s])}
const drop=n=>{E.delete(n.id);n.kids.forEach(drop)};
function pick(id){S=id;if(HM){box();tree();return}draw();box();fly(N[id]);tree()}            // select only, never breaks
function go(id){const n=N[id];if(!n||n.name==="[…]")return;anc(n).forEach(a=>OPN.add(a.id));
 if(!has(n)||HM){S=id;if(!HM)draw();box();tree();return}   // with a heat map on, pages open but the map stays as drawn
 anc(n).forEach(a=>E.add(a.id));drop(n);S=id;draw();box();fly(n);tree()} // breaks parents, rejoins when an ancestor is clicked
window.go=go;
// ---- info box ----
function chip(n){if(n.name==="[…]")return`<button class="chip ghost" disabled data-tip="${esc(n.note||"Further Glottolog branches outside this project")}">[…]</button>`;return`<button class="chip ${ok(n)?"":"ghost"}" onclick="go('${n.id}')">${F(n,"x")?"† ":""}${esc(n.name)}</button>`}
const GLURL="https://glottolog.org/resource/languoid/id/";
const gcode=n=>{while(n&&!n.code)n=N[n.p];return n&&n.code};
const RETIRED={mol:"retired in 2008, merged into ron, i.e. Romanian"};
// hover tooltips (long texts wrap); on touch screens the first tap shows the text, the second opens the link
const tipEl=document.createElement("div");tipEl.id="tip";document.body.append(tipEl);let tipFor=null,lastPT="mouse";
function showTip(el){tipFor=el;tipEl.textContent=el.dataset.tip;tipEl.style.display="block";const r=el.getBoundingClientRect(),w=tipEl.offsetWidth,h=tipEl.offsetHeight;
 tipEl.style.left=Math.min(Math.max(8,r.left),innerWidth-w-8)+"px";let y=r.bottom+6;if(y+h>innerHeight-8)y=Math.max(8,r.top-h-6);tipEl.style.top=y+"px"}
function hideTip(){tipFor=null;tipEl.style.display="none"}
document.addEventListener("pointerover",e=>{lastPT=e.pointerType;const el=e.target.closest&&e.target.closest("[data-tip]");if(el&&e.pointerType!=="touch")showTip(el)});
document.addEventListener("pointerout",e=>{if(tipFor&&e.pointerType!=="touch"&&!(e.relatedTarget&&tipFor.contains(e.relatedTarget)))hideTip()});
document.addEventListener("focusin",e=>{const el=e.target.closest&&e.target.closest("[data-tip]");el&&showTip(el)});document.addEventListener("focusout",hideTip);
document.addEventListener("click",e=>{const el=e.target.closest&&e.target.closest("[data-tip]");
 if(lastPT==="touch"&&el&&tipFor!==el){e.preventDefault();showTip(el);return}if(!el||el!==tipFor)hideTip()},true);
const NOTE="Borders are approximations. Where areas overlap, the less widely spoken language or dialect takes priority over the more widespread one.";
function showBox(html,bare){hideTip();const b=$("#box");b.hidden=false;b.innerHTML=html+(bare?"":`<p class="mu note">${NOTE}</p>`)+`<button id="bxc">Close</button>`;$("#bxc").onclick=closeBox}
function closeBox(){$("#box").hidden=true;if(S){S=null;if(!HM)draw();tree()}}
const hostOf=u=>{try{return new URL(u).hostname}catch(e){return u}};
const defTip=u=>{try{const x=new URL(u),t=decodeURIComponent(x.pathname.split("/").pop()).replace(/_/g," ");return x.hostname.includes("wikipedia")?`Wikipedia (${x.hostname.split(".")[0]}): ${t}`:x.hostname.includes("glottolog")?`Glottolog: ${t}`:`${x.hostname}: ${t}`}catch(e){return u}};
// every link in the box is a letter in brackets: [a], [b], [c] ... in order of appearance; the hover holds the explanation
// a place has both dotted (dispersed) and full polygons somewhere inside it
const MD=new Map();
function mixedDisp(n){if(MD.has(n.id))return MD.get(n.id);let dot=false,full=false;const d=DISPP[n.id]||[];
 P(n.id).forEach((q,k)=>{if(disp(n)||d.includes(k))dot=true;else full=true});   // only this very place's own polygons count, never its parents
 const r=dot&&full;MD.set(n.id,r);return r}
function box(){const n=N[S];if(!n||n.name==="[…]")return;const up=N[n.p],bd=[],gc=F(n,"p")&&!n.code?null:gcode(n),inf=INFO[n.id]||{},K=[];
 const ref=(u,t)=>{const l=String.fromCharCode(97+K.length);K.push({l,u,t});return refA(l,u,t)};
 const refA=(l,u,t)=>u?`<sup><a class="rf" href="${esc(u)}" target="_blank" rel="noopener" data-tip="${esc(t)}" aria-label="${esc(t)}">[${l}]</a></sup>`:`<sup><span class="rf" tabindex="0" data-tip="${esc(t)}">[${l}]</span></sup>`;
 const m=/^ISO 639-3: (\w{3})$/.exec(n.note||""),code=m&&m[1];
 const refs=(gc?ref(GLURL+gc,n.code?"Open in Glottolog":"Nearest Glottolog entry"):"")
  +(code?ref("https://iso639-3.sil.org/code/"+code,`ISO 639-3: ${code}`+(RETIRED[code]?` (${RETIRED[code]})`:/^q[a-t][a-z]$/.test(code)?" (private-use code, not an official language code)":"")):"")
  +(inf.links||[]).map(l=>ref(l.url,l.tip||(l.url?defTip(l.url):""))).join("")+(mixedDisp(n)?ref(null,"The dotted regions represent dispersed populations."):"");
 const lnk=i=>K[(gc?1:0)+(code?1:0)+i];
 const mixedLink=mixedDisp(n)?"":null;
 if(F(n,"x"))bd.push("extinct");if(F(n,"d"))bd.push("disputed");if(disp(n))bd.push("dispersed");
 (inf.badges||[]).forEach(b=>bd.push(b));
 const e=W&&W.ents.get(n.id),facts=(inf.facts||[]).map(f=>{const rs=[].concat(f.ref==null?[]:f.ref).map(lnk).filter(Boolean);return`<p>${esc(f.t)}${rs.map(r=>refA(r.l,r.u,r.t)).join("")}</p>`}).join("");
 const wl=e?`<p>${esc(W.w.name)}: <b>${esc(forms(e))}</b>${[...new Map(e.filter(x=>x.src).map(x=>[x.src[0],x.src])).values()].map(s=>{const k=K.find(q=>q.u===s[0]);return k?refA(k.l,k.u,k.t):ref(s[0],s[1])}).join("")} <button onclick="wordsAt('${n.id}')">Etymology</button></p>`:"";
 showBox(`<h2>${esc(n.name)}${refs}</h2>${nat(n)?`<div class="nat mu" ${natAll(n)?`data-tip="${esc(natAll(n))}" tabindex="0"`:""}>${esc(nat(n))}</div>`:""}
 <p>${bd.map(b=>`<span class="badge">${esc(b)}</span>`).join("")}</p>${facts}
 ${wl}
 <p>Descended from: ${up?chip(up):'<span class="mu">top-level family in Glottolog</span>'}</p>
 ${n.note&&!code?`<p class="mu">${esc(n.note)}</p>`:""}
 ${n.kids.length?`<p>Descendants: ${n.kids.map(chip).join("")}</p>`:'<p class="mu">No further breakdown recorded.</p>'}`)}
// ---- horizons ----
const HB={};
// a node can only be broken up when all of its ancestors are broken up too (so under a joined language only the language shows)
function prune(){const keep=new Set(),walk=n=>{if(E.has(n.id)&&(!N[n.p]||keep.has(n.p))){keep.add(n.id);n.kids.forEach(walk)}};nodes.filter(n=>!N[n.p]).forEach(walk);E=keep}
// Branches level: nodes flagged B (Romance, Slavic, Germanic, Arabic, Goidelic ...) are the branches; everything above them is broken up. A family without any B node falls back to its first split.
const hasB=new Set();nodes.filter(n=>F(n,"B")).forEach(n=>anc(n).forEach(x=>hasB.add(x.id)));
function setH(m,b){E=new Set();nodes.forEach(n=>{if(!exp(n))return;
 if(m==="B"?hasB.has(n.id)||(!n.p&&!F(n,"L")):m==="L"?!F(n,"L")&&!F(n,"D"):m==="D")E.add(n.id)});prune();
 HZ=m;LASTH=m;S=null;draw();if(!HINT1){HINT1=true;showBox('<p class="mu">Click a shape to open it. Click one of its descendants in this box to break it up; click its ancestor to join it again.</p>')}else $("#box").hidden=true;$("#hz").classList.remove("open");
 document.querySelectorAll("#hz button").forEach(x=>x.classList.toggle("on",x===b));tree()}
[["Families","F"],["Branches","B"],["Languages","L"],["Dialects","D"]].forEach(([t,m],i)=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>setH(m,b);HB[m]=b;$("#hz").append(b);if(!i)b.classList.add("on")});
// ---- panels: only one open at a time ----
const panels=["#tree","#words","#cpanel","#vpanel"];

const isOpen=id=>$(id).classList.contains("open"), closeP=id=>$(id).classList.remove("open");
// ---- language tree (left to right, elbow lines, [+]/[-] on every branch) ----
const CW=224,RH=42,OPN=new Set();let TP=null,MI=0,FOCUSHIT=false;
function build(){const its=[];let row=0,md=0;
 const rec=(n,d,par,ph)=>{const it={n,d,par,ph,kids:[]};its.push(it);md=Math.max(md,d);
  if(ph){it.y=row++*RH;return it}
  if(n.kids.length){if(OPN.has(n.id))n.kids.forEach(k=>it.kids.push(rec(k,d+1,it)));else it.kids.push(rec(n,d+1,it,true))}
  it.y=it.kids.length?(it.kids[0].y+it.kids.at(-1).y)/2:row++*RH;return it};
 ROOTS.forEach(r=>{rec(r,0,null);row++});
 its.forEach(it=>it.x=it.d*CW);TP={its,w:(md+1)*CW+20,h:row*RH+20}}
function tree(center){hideTip();const t=$("#tree");if(!t.classList.contains("open"))return;
 const sel=N[S];if(center&&sel)anc(sel).forEach(a=>OPN.add(a.id));
 build();const {its,w,h}=TP,q=$("#tq").value.trim().toLowerCase();
 const hi=new Set(sel?[sel.id,...anc(sel).map(a=>a.id)]:[]);let pn="",ph="",boxes="";
 its.forEach(it=>{const n=it.n;
  if(it.par){const a=it.par,x1=a.x+154,xm=a.x+204,hl=!it.ph&&hi.has(n.id),d=`M${x1} ${a.y+19}H${xm}V${it.y+19}H${it.x}`;
   if(hl)ph+=`<path class="hi" d="${d}"/>`;else pn+=`<path class="${!it.ph&&F(n,"d")?"dot":""}" d="${d}"/>`}   // the pink branch is drawn last, so it always wins
  if(it.ph){boxes+=`<button class="tb ph" style="left:${it.x}px;top:${it.y}px" data-id="${n.id}" data-ph="1" data-tip="Open the subdivisions of ${esc(n.name)}"><span>[…]</span></button>`;return}
  const k=ok(n),m=q&&n.name.toLowerCase().includes(q),en=W&&W.ents.get(n.id),dots=n.name==="[…]",ta=natAll(n);
  boxes+=`<button class="tb ${k?"":"ghost"} ${dots?"dots":""} ${n.id===S?"sel":""} ${q?(m?"hit":"dim"):""}" style="left:${it.x}px;top:${it.y}px;border-left-color:${col(n)}" data-id="${n.id}" ${dots?`data-tip="${esc(n.note||"Further Glottolog branches outside this project")}"`:`title="${esc(n.name)}${F(n,"x")?" (extinct)":""}"`}><span>${F(n,"x")?"† ":""}${esc(n.name)}</span>${nat(n)||en?`<small class="r"><span ${ta?`data-tip="${esc(ta)}"`:""}>${esc(nat(n))}</span>${en?`<i>(${esc(forms(en))})</i>`:""}</small>`:""}</button>`;
  if(n.kids.length)boxes+=`<button class="tg2 ${hi.has(n.id)?"hi":""}" style="left:${it.x+154}px;top:${it.y+9}px" data-t="${n.id}" title="${OPN.has(n.id)?"Close":"Open"} the subdivisions of ${esc(n.name)}">${OPN.has(n.id)?"[-]":"[+]"}</button>`});
 $("#tc").style.cssText=`width:${w}px;height:${h}px`;$("#tc").innerHTML=`<svg width="${w}" height="${h}">${pn}${ph}</svg>${boxes}`;
 if(center&&S){const f=$(`#tc .tb[data-id="${S}"]`);f&&$("#tw").scrollTo({left:Math.max(0,f.offsetLeft-$("#tw").clientWidth/2+77),top:Math.max(0,f.offsetTop-$("#tw").clientHeight/2+19)})}
 const hits=[...document.querySelectorAll("#tc .tb.hit")];if(MI>=hits.length)MI=0;$("#tcnt").textContent=(hits.length?MI+1:0)+"/"+hits.length;
 if(q&&hits[MI]){const f=hits[MI];f.classList.add("cur");if(FOCUSHIT){const w=$("#tw");w.scrollTo({left:Math.max(0,f.offsetLeft-w.clientWidth/2+77),top:Math.max(0,f.offsetTop-w.clientHeight/2+19)})}}
 FOCUSHIT=false}
$("#tc").addEventListener("click",e=>{const g=e.target.closest(".tg2");
 if(g){const id=g.dataset.t;OPN.has(id)?OPN.delete(id):OPN.add(id);return tree()}
 const b=e.target.closest(".tb");if(!b)return;const n=N[b.dataset.id];
 if(b.dataset.ph){OPN.add(n.id);return tree()}
 go(n.id)});
$("#tg").onclick=()=>{const o=!isOpen("#tree");panels.forEach(closeP);if(o){$("#tree").classList.add("open");tree(true)}};$("#tx").onclick=()=>closeP("#tree");
$("#te").onclick=()=>{nodes.forEach(n=>n.kids.length&&OPN.add(n.id));tree()};$("#tf").onclick=()=>{OPN.clear();tree()};
const stepHit=d=>{const n=document.querySelectorAll("#tc .tb.hit").length;if(!n)return;MI=(MI+d+n)%n;FOCUSHIT=true;tree()};
$("#tup").onclick=()=>stepHit(-1);$("#tdn").onclick=()=>stepHit(1);$("#tq").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();stepHit(e.shiftKey?-1:1)}};
$("#tq").oninput=()=>{MI=0;FOCUSHIT=true;const q=$("#tq").value.trim().toLowerCase();if(q)nodes.forEach(n=>n.name.toLowerCase().includes(q)&&anc(n).forEach(a=>OPN.add(a.id)));tree()};
addEventListener("keydown",e=>{if(e.key==="Escape"){panels.forEach(closeP)}});
let dr=null;const tw=$("#tw");tw.addEventListener("pointerdown",e=>{if(e.target.closest(".tb,.tg2"))return;dr={x:e.clientX,y:e.clientY,l:tw.scrollLeft,t:tw.scrollTop};tw.classList.add("drag")});
addEventListener("pointermove",e=>{if(dr){tw.scrollLeft=dr.l-(e.clientX-dr.x);tw.scrollTop=dr.t-(e.clientY-dr.y)}});addEventListener("pointerup",()=>{dr=null;tw.classList.remove("drag")});
// ---- words page ----
const WD=window.WORDDATA||{};const NA=" (N/A)";
const SECS=(window.WORDS?WORDS.sections:[]).map(s=>({id:s.id,name:s.name,ordered:!!s.ordered,words:s.words.split(",").map(x=>x.trim()).filter(Boolean).map(nm=>{const id=s.id+"/"+nm.toLowerCase().replace(/[^a-z0-9]+/g,"-"),d=WD[id]||{};return{id,name:nm,sec:s.id,na:!((d.entries||[]).some(e=>N[e[0]])),clusters:d.clusters||{},entries:d.entries||[]}})})).map(s=>(s.ordered||s.words.sort((x,y)=>x.name.localeCompare(y.name)),s)).sort((x,y)=>x.name.localeCompare(y.name));
let curSec=null;
let HAVE=new Set();
function haveWords(){HAVE=new Set();const n=N[S];if(!n)return;const ids=new Set([n.id,...anc(n).map(x=>x.id)]);SECS.forEach(s=>s.words.forEach(w=>{if(w.entries.some(e=>ids.has(e[0])))HAVE.add(w.id)}));
 $("#wh").textContent=HAVE.size?`● marks what exists in ${n.name}.`:"The map behind this page shows the selected word."}
function renderSecs(){haveWords();const q=$("#wq").value.trim().toLowerCase();
 $("#wsec").innerHTML=q?(SECS.flatMap(s=>s.words.filter(w=>w.name.toLowerCase().includes(q)).map(w=>`<button data-w="${w.id}">${HAVE.has(w.id)?"● ":""}${esc(w.name)}${w.na?NA:""} <small class="mu">${esc(s.name)}</small></button>`)).join("")||'<span class="mu">No word matches.</span>'):SECS.map(s=>`<button data-s="${s.id}" class="${curSec&&curSec.id===s.id?"on":""} ${s.words.some(w=>HAVE.has(w.id))?"has":""}">${s.words.some(w=>HAVE.has(w.id))?"● ":""}${esc(s.name)}${s.words.every(w=>w.na)?NA:""}</button>`).join("")||'<span class="mu">No sections yet.</span>';
 const sl=$("#wsl");sl.innerHTML=curSec?`<option value="">Choose a word…</option>`+curSec.words.map(w=>`<option value="${w.id}" ${W&&W.w===w?"selected":""}>${HAVE.has(w.id)?"● ":""}${esc(w.name)}${w.na?NA:""}</option>`).join(""):`<option value="">Choose a section on the left</option>`;sl.disabled=!curSec}
$("#wq").oninput=renderSecs;
$("#wsec").onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.w){const w=SECS.flatMap(s=>s.words).find(x=>x.id===b.dataset.w);curSec=SECS.find(s=>s.id===w.sec);return setWord(curSec,w)}curSec=SECS.find(s=>s.id===b.dataset.s);renderSecs();if(!W||W.sec!==curSec)renderPage()};
$("#wsl").onchange=e=>{const w=curSec&&curSec.words.find(x=>x.id===e.target.value);if(w)setWord(curSec,w)};
$("#wd").onclick=()=>{const o=!isOpen("#words");panels.forEach(closeP);if(o){$("#box").hidden=true;$("#words").classList.add("open");renderSecs();renderPage()}};$("#wx").onclick=()=>{closeP("#words");if(PEND2&&W){PEND2=false;hint2()}};
function setWord(sec,w){if(HM)resetHeat(true);const ents=new Map(),all=[];
 w.entries.forEach(([id,form,key,chain,bor,src])=>{if(!N[id])return;const e={id,form,key,chain,bor,src,uid:all.length};all.push(e);if(!ents.has(id))ents.set(id,[]);ents.get(id).push(e)});
 const g={};all.forEach(e=>(g[e.key]=g[e.key]||[]).push(e));
 const cls=Object.entries(g).map(([key,es])=>{es.sort((x,y)=>byName(x.id,y.id)||x.form.localeCompare(y.form));return{key,es,ids:[...new Set(es.map(e=>e.id))].sort(byName),root:w.clusters[key]||{lang:"?",form:""}}});
 cls.sort((x,y)=>y.ids.length-x.ids.length||byName(x.ids[0],y.ids[0]));   // biggest cluster first, ties: whose first language comes first alphabetically
 cls.forEach((c,i)=>{c.i=i;c.color=PAL(i);const used={};c.es.forEach(e=>{used[e.id]=used[e.id]||0;e.color=shade(c.color,used[e.id]++)})});  // two words of one cluster in one place = two shades of its colour
 W={sec,w,ents,all,cls};WSEL=null;HZ=null;E=new Set();S=null;computeWS();
 document.querySelectorAll("#hz button").forEach(x=>x.classList.remove("on"));$("#rs").hidden=false;$("#wd").classList.add("on");
 draw();fitTo([...W.ws.values()]);if(isOpen("#words"))PEND2=!HINT2;else hint2();
 renderSecs();renderPage();tree()}
function noData(){const out=[],walk=n=>{if(!has(n)||W.ents.has(n.id))return;
 if(!W.entAnc.has(n.id)&&(F(n,"L")||F(n,"D"))){out.push(n.name);return}n.kids.forEach(walk)};
 nodes.filter(n=>!N[n.p]).forEach(walk);return out.sort((a,b)=>a.localeCompare(b))}
function renderPage(){const c=$("#wcl");$("#wet").innerHTML="";
 if(!W){c.innerHTML=`<p class="mu">${curSec?"Choose a word in the menu above.":"Choose a section on the left, then a word."}</p>`;return}
 const w=W.w,nd=noData();
 c.innerHTML=`<h3>${esc(w.name)}</h3>`+(W.cls.map(k=>`<div class="cg" style="border-left-color:${k.color}"><h4>${esc(k.root.form||k.root.lang||"?")} <small>${esc(k.root.form?k.root.lang:"")} · ${k.ids.length}</small></h4>${k.es.map(e=>`<button class="wl ${e.uid===WSEL?"on":""}" data-u="${e.uid}">${esc(N[e.id].name)}: ${esc(e.form)}</button>`).join("")}</div>`).join("")||'<p class="mu">No words recorded yet.</p>')
  +(nd.length?`<p class="mu">No data: ${nd.map(esc).join(", ")}</p>`:"");
 if(WSEL!=null)renderEty(WSEL)}
function renderEty(u){const e=W.all[u],r=W.w.clusters[e.key],st=[];
 if(r)st.push({l:r.lang,f:r.form});(e.chain||[]).forEach(([l,f,b])=>st.push({l,f,b:!!b}));st.push({l:N[e.id].name,f:e.form,b:!!e.bor,last:1});
 $("#wet").innerHTML=st.map((s,i)=>`${i?`<div class="eln ${s.b?"dot":""}"></div>`:""}<div class="eb ${s.last?"last":""}"><small>${esc(s.l)}</small><b>${esc(s.f)}</b></div>`).join("")}
$("#wcl").onclick=e=>{const b=e.target.closest(".wl");if(!b)return;WSEL=+b.dataset.u;document.querySelectorAll(".wl").forEach(x=>x.classList.toggle("on",x===b));renderEty(WSEL)};
window.wordsAt=id=>{panels.forEach(closeP);$("#words").classList.add("open");WSEL=W.ents.get(id)[0].uid;curSec=W.sec;renderSecs();renderPage()};
$("#rs").onclick=()=>{W=null;WSEL=null;$("#rs").hidden=true;$("#wd").classList.remove("on");renderSecs();renderPage();setH(LASTH,HB[LASTH])};
// ---- cluster: distance between languages from the words they share ----
const ALLW=SECS.flatMap(s=>s.words),WK=ALLW.map(w=>{const m=new Map();w.entries.forEach(e=>{if(!N[e[0]])return;if(!m.has(e[0]))m.set(e[0],new Set());m.get(e[0]).add(e[2])});return m}).filter(m=>m.size);
const LNG=[...new Set(WK.flatMap(m=>[...m.keys()]))].sort(byName);
const sim=(a,b)=>{let n=0,s=0;WK.forEach(m=>{if(m.has(a)&&m.has(b)){n++;if([...m.get(a)].some(k=>m.get(b).has(k)))s++}});return{n,s,v:n?s/n:null}};
const fmt=v=>String(Number(v.toFixed(3)));
let CM="i";
// ---- distance heat map: every language that shares words with the chosen one, deep blue (0) to bright red (1) ----
let HM=null;   // {from, tiles:[{n,mp,v}]}
const HC=[[0,[11,31,168]],[.33,[24,196,232]],[.66,[255,224,51]],[1,[255,20,20]]];
const heatCol=v=>{v=Math.max(0,Math.min(1,v));let i=0;while(i<HC.length-2&&v>HC[i+1][0])i++;const[x0,c0]=HC[i],[x1,c1]=HC[i+1],t=(v-x0)/(x1-x0);return"rgb("+c0.map((c,k)=>Math.round(c+(c1[k]-c)*t)).join(",")+")"};
function heatTiles(from){const T=[];LNG.forEach(id=>{const r=id===from?{v:1}:sim(from,id);if(r.v===null)return;const n=N[id],base=shape(n);if(!base)return;
  const cut=LNG.filter(o=>o!==id&&anc(N[o]).includes(n)).map(o=>shape(N[o])).filter(Boolean).map(s=>s.map(toGJ));
  let mp=base;if(cut.length){const d=safe(PC.difference,base.map(toGJ),...cut);mp=d?fromGJ(d):base}
  if(mp&&mp.length)T.push({n,mp,v:r.v})});return T}
function renderHeat(){HM.tiles.forEach(t=>{const c=heatCol(t.v),me=t.n.id===HM.from;t.mp.forEach(po=>{
  L.polygon(po,{color:me?"#111":c,fillColor:c,weight:me?3:1.5,opacity:.95,fillOpacity:.72}).addTo(layer).bindTooltip(`${t.n.name}: ${fmt(t.v)}`,{sticky:true}).on("click",e=>clickAt(e.latlng));
  HIT.push({ids:[t.n.id],po});items.push({po,txt:t.n.name,sub:fmt(t.v),sel:t.n.id===S})})})}
const lockLevels=b=>document.querySelectorAll("#hz button,#lv").forEach(x=>x.disabled=b);
function setHeat(id){if(W){W=null;WSEL=null;$("#rs").hidden=true;$("#wd").classList.remove("on");renderSecs();renderPage()}
 HM={from:id,tiles:heatTiles(id)};S=null;$("#box").hidden=true;$("#rs2").hidden=false;$("#cl").classList.add("on");$("#hleg").hidden=false;lockLevels(true);draw();fitTo(HM.tiles.map(t=>t.mp));tree()}
function resetHeat(quiet){HM=null;$("#rs2").hidden=true;$("#cl").classList.remove("on");$("#hleg").hidden=true;lockLevels(false);if(!quiet)setH(LASTH,HB[LASTH])}
$("#rs2").onclick=()=>resetHeat();
function renderC(){document.querySelectorAll("#cm button").forEach(b=>b.classList.toggle("on",b.dataset.m===CM));const c=$("#cbody");
 if(LNG.length<2){c.innerHTML='<p class="mu">There are not yet two languages with words, so there is nothing to compare.</p>';$("#chint").textContent="";return}
 if(CM==="i"){$("#chint").textContent="distance = shared roots / words both languages have";
  const cur=LNG.includes(S)?S:LNG.includes(c.dataset.id)?c.dataset.id:LNG[0];
  c.innerHTML=`<label>Language <select id="ci">${LNG.map(id=>`<option value="${id}" ${id===cur?"selected":""}>${esc(N[id].name)}</option>`).join("")}</select></label><div id="cr"></div>`;
  const run=()=>{const a=$("#ci").value;c.dataset.id=a;const g={},none=[];
   LNG.filter(b=>b!==a).forEach(b=>{const r=sim(a,b);if(r.v===null)none.push(N[b].name);else(g[fmt(r.v)]=g[fmt(r.v)]||[]).push(N[b].name)});
   $("#cr").innerHTML=Object.keys(g).sort((x,y)=>y-x).map(v=>`<p>${g[v].sort((x,y)=>x.localeCompare(y)).map(esc).join(", ")}: <b>${v}</b></p>`).join("")+(none.length?`<p class="mu">No shared words: ${none.sort((x,y)=>x.localeCompare(y)).map(esc).join(", ")}</p>`:"")};
  $("#ci").onchange=run;run()}
 else if(CM==="h"){$("#chint").textContent="pick a language: the map is coloured by distance to it, deep blue = 0, bright red = 1";
  c.innerHTML=`<label>Draw the map from <select id="ch"><option value="">Choose a language…</option>${LNG.map(id=>`<option value="${id}" ${HM&&HM.from===id?"selected":""}>${esc(N[id].name)}</option>`).join("")}</select></label>`;
  $("#ch").onchange=e=>{if(e.target.value){closeP("#cpanel");setHeat(e.target.value)}}}
 else{$("#chint").textContent="languages joined by average distance (UPGMA); a language meets its closest relatives first";c.innerHTML=`<div id="cwheel">${wheel()}</div>`}}
function upgma(ids){const n=ids.length,d=[];for(let i=0;i<n;i++){d.push([]);for(let j=0;j<n;j++){const r=i===j?{v:1}:sim(ids[i],ids[j]);d[i][j]=r.v===null?1:1-r.v}}
 const T=ids.map((id,i)=>({id,sz:1,h:0,kids:[]}));let act=ids.map((_,i)=>i);
 while(act.length>1){let bi=0,bj=1,bd=Infinity;for(let x=0;x<act.length;x++)for(let y=x+1;y<act.length;y++){const v=d[act[x]][act[y]];if(v<bd){bd=v;bi=x;bj=y}}
  const i=act[bi],j=act[bj],k=T.length;T.push({sz:T[i].sz+T[j].sz,h:bd,kids:[T[i],T[j]]});d.forEach(r=>r[k]=0);d[k]=[];
  act.forEach(m=>{if(m!==i&&m!==j){const v=(T[i].sz*d[i][m]+T[j].sz*d[j][m])/(T[i].sz+T[j].sz);d[k][m]=v;d[m][k]=v}});d[k][k]=0;
  act=act.filter(m=>m!==i&&m!==j);act.push(k)}
 return T[act[0]]}
function wheel(){const root=upgma(LNG),leaves=[],walk=n=>n.kids.length?n.kids.forEach(walk):leaves.push(n);walk(root);
 const n=leaves.length,R=Math.max(180,n*15/6.2832),Z=R+150,Hm=root.h||1;let gi=0;
 leaves.forEach((l,i)=>l.a=i/n*2*Math.PI);
 const pt=(r,a)=>[Z+r*Math.sin(a),Z-r*Math.cos(a)],f=v=>v.toFixed(1);let out="";
 const lay=(nd,cut,gc)=>{if(!nd.kids.length){nd.r=R;nd.gc=gc;return}
  if(gc==null&&nd.h<=cut)gc=gi++;nd.r=R*(1-nd.h/Hm);nd.kids.forEach(k=>lay(k,cut,gc));nd.a=nd.kids.reduce((s,k)=>s+k.a,0)/nd.kids.length;nd.gc=gc};
 // a group = a subtree whose members share at least half their words' roots
 const lay2=nd=>{lay(nd,.5,null)};lay2(root);
 const draw1=nd=>{if(!nd.kids.length)return;const as=nd.kids.map(k=>k.a),a0=Math.min(...as),a1=Math.max(...as),c=nd.gc==null?"var(--mu)":PAL(nd.gc);
  const [x0,y0]=pt(nd.r,a0),[x1,y1]=pt(nd.r,a1);out+=`<path d="M${f(x0)} ${f(y0)}A${f(nd.r)} ${f(nd.r)} 0 ${a1-a0>Math.PI?1:0} 1 ${f(x1)} ${f(y1)}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
  nd.kids.forEach(k=>{const [xa,ya]=pt(nd.r,k.a),[xb,yb]=pt(k.r,k.a);out+=`<path d="M${f(xa)} ${f(ya)}L${f(xb)} ${f(yb)}" stroke="${k.gc==null?"var(--mu)":PAL(k.gc)}" stroke-width="1.6"/>`;draw1(k)})};
 draw1(root);
 leaves.forEach(l=>{const [x,y]=pt(R+6,l.a),deg=l.a*180/Math.PI-90,fl=l.a>Math.PI;
  const me=l.id===S;out+=`<text transform="translate(${f(x)} ${f(y)}) rotate(${f(fl?deg+180:deg)})" text-anchor="${fl?"end":"start"}" dominant-baseline="middle" ${me?`style="fill:#e0182d;font-weight:700;font-size:14px;text-decoration:underline"`:l.gc==null?"":`style="fill:${PAL(l.gc)}"`}>${me?"● ":""}${esc(N[l.id].name)}<title>${esc(N[l.id].name)}</title></text>`});
 return`<svg width="${2*Z}" height="${2*Z}" viewBox="0 0 ${2*Z} ${2*Z}" role="img" aria-label="Wheel of language distances">${out}</svg>`}
$("#box").addEventListener("click",e=>{const b=e.target.closest(".mx");if(b)go(b.dataset.id)});
$("#cl").onclick=()=>{const o=!isOpen("#cpanel");panels.forEach(closeP);if(o){$("#box").hidden=true;$("#cpanel").classList.add("open");renderC()}};
$("#cm").onclick=e=>{const b=e.target.closest("button");if(b){CM=b.dataset.m;renderC()}};$("#cx").onclick=()=>closeP("#cpanel");

// ---- voting: what the project still lacks ----
const VAPI=(window.VOTE_API||"").replace(/\/$/,"");
const aliveN=n=>!F(n,"x")&&(!n.kids.length||n.kids.some(k=>k.name==="[…]")||n.kids.some(aliveN));
function votables(){   // languages: alive, without any polygon of their own or below; words: without a single entry
 const ls=nodes.filter(n=>n.name!=="[…]"&&!has(n)&&aliveN(n)),cnt={};ls.forEach(n=>cnt[n.name]=(cnt[n.name]||0)+1);
 const lang=ls.map(n=>({id:n.id,label:cnt[n.name]>1&&N[n.p]?`${n.name} (${N[n.p].name})`:n.name})).sort((x,y)=>x.label.localeCompare(y.label));
 const ws=SECS.flatMap(s=>s.words.map(w=>({id:w.id,name:w.name,sec:s.name,na:w.na}))).filter(w=>w.na),wc={};ws.forEach(w=>wc[w.name]=(wc[w.name]||0)+1);
 const word=ws.map(w=>({id:w.id,label:wc[w.name]>1?`${w.name} (${w.sec})`:w.name})).sort((x,y)=>x.label.localeCompare(y.label));
 return{lang,word}}
const demoDB={get(){try{return JSON.parse(localStorage.getItem("vote-demo")||"[]")}catch(e){return[]}},set(v){try{localStorage.setItem("vote-demo",JSON.stringify(v))}catch(e){}}};
function demoState(V){const ok={lang:new Set(V.lang.map(x=>x.id)),word:new Set(V.word.map(x=>x.id))},all=demoDB.get().filter(v=>ok[v.kind].has(v.item)),st={recent:{},ranks:{},mine:{}};
 ["lang","word"].forEach(k=>{const r=all.filter(v=>v.kind===k),c={};r.forEach(v=>c[v.item]=(c[v.item]||0)+1);
  st.recent[k]=r.slice(-10).reverse().map(v=>({item:v.item,ts:v.ts,place:"demo"}));st.ranks[k]=Object.entries(c).map(([item,n])=>({item,n}));st.mine[k]=r.length?r[r.length-1].item:null});return st}
async function vState(V){if(!VAPI)return demoState(V);try{const r=await fetch(VAPI+"/state");return await r.json()}catch(e){return null}}
async function vSend(kind,item,V){if(!VAPI){const d=demoDB.get().filter(v=>v.kind!==kind);d.push({kind,item,ts:Date.now()});demoDB.set(d);return{ok:true}}
 try{const r=await fetch(VAPI+"/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,item})});return await r.json()}catch(e){return{error:"network"}}}
const fmtTime=ts=>{const d=new Date(ts);return d.toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"})+", "+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};   // visitor's own local date and time
const fmtPlace=p=>{if(!p)return"";if(p==="demo")return"demo mode";const[c,r]=p.split("|");let n=c;try{n=new Intl.DisplayNames([navigator.language||"en"],{type:"region"}).of(c)||c}catch(e){}return r?`${n}, ${r}`:n};
let VV=null,VST=null;const VSORT={lang:-1,word:-1};   // -1 = descending (triangle points down)
const AGAIN="If you vote again, your new vote replaces your old one.";
const VC={lang:{items:[],id:null},word:{items:[],id:null}};
const normQ=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const VK=[["lang","#vsl","#vls","#vlsl","#vml"],["word","#vsw","#vws","#vwsl","#vmw"]];
function vBtns(){VK.forEach(([k,b,s,l,m])=>{const none=!(VV&&VV[k].length),cur=VST&&VST.mine&&typeof VST.mine[k]==="string"?(VV[k].find(x=>x.id===VST.mine[k])||{}).label:"";$(b).disabled=none||!VC[k].id;$(s).disabled=none;$(m).textContent=none?"Nothing left to vote for here.":(cur?`Your current vote: ${cur}. `:"")+AGAIN})}
function vRender(){if(!VV)return;const lab={lang:Object.fromEntries(VV.lang.map(x=>[x.id,x.label])),word:Object.fromEntries(VV.word.map(x=>[x.id,x.label]))};
 VC.lang.items=VV.lang;VC.word.items=VV.word;
 const st=VST||{recent:{lang:[],word:[]},ranks:{lang:[],word:[]},mine:{lang:false,word:false}};vBtns();
 [["lang","#vrl"],["word","#vrw"]].forEach(([k,id])=>{$(id).innerHTML=(st.recent[k]||[]).filter(r=>lab[k][r.item]).slice(0,10).map(r=>`<li>${esc(lab[k][r.item])}<small>${r.ts?esc(fmtTime(r.ts)):""}${r.place?" · "+esc(fmtPlace(r.place)):""}</small></li>`).join("")||'<li class="mu">No submissions yet.</li>'});
 [["lang","#vtl","#vol"],["word","#vtw","#vow"]].forEach(([k,id,btn])=>{const rows=(st.ranks[k]||[]).filter(r=>lab[k][r.item]).sort((x,y)=>VSORT[k]*(x.n-y.n)||lab[k][x.item].localeCompare(lab[k][y.item]));
  $(id).innerHTML=rows.map(r=>`<li><span class="n">${r.n}</span>${esc(lab[k][r.item])}</li>`).join("")||'<li class="mu">No votes yet.</li>';$(btn).innerHTML=`<i class="tri ${VSORT[k]<0?"dn":"up"}"></i>`})}
// the picker is a search box: nothing is listed until something is typed, then every entry that contains those letters in that order
VK.forEach(([k,b,s,l])=>{const el=$(s),ul=$(l),pick=li=>{VC[k].id=li.dataset.id;el.value=li.textContent;ul.hidden=true;vBtns()};
 const fill=()=>{const q=normQ(el.value.trim()),m=VC[k].items.filter(x=>!q||normQ(x.label).includes(q));   // click = the whole list, typing narrows it to entries containing those letters in that order
  ul.innerHTML=m.map(x=>`<li data-id="${esc(x.id)}">${esc(x.label)}</li>`).join("")||'<li class="none">No match</li>';ul.hidden=false};
 el.oninput=()=>{VC[k].id=null;vBtns();fill()};el.onfocus=el.onclick=()=>{if(!el.disabled)fill()};
 el.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const f=ul.querySelector("li[data-id]");if(f)pick(f)}};
 ul.onclick=e=>{const li=e.target.closest("li[data-id]");if(li)pick(li)}});
document.addEventListener("click",e=>{if(!e.target.closest(".combo"))document.querySelectorAll(".vsug").forEach(u=>u.hidden=true)});
async function vOpen(){VV=votables();VST=await vState(VV);$("#vhint").textContent=VAPI&&!VST?"The voting server could not be reached right now. Please try again in a moment.":"Vote for the languages and words you want added next.";vRender()}
$("#vt").onclick=()=>{const o=!isOpen("#vpanel");panels.forEach(closeP);if(o){$("#box").hidden=true;$("#vpanel").classList.add("open");vOpen()}};$("#vx").onclick=()=>closeP("#vpanel");
$("#vol").onclick=()=>{VSORT.lang*=-1;vRender()};$("#vow").onclick=()=>{VSORT.word*=-1;vRender()};
VK.forEach(([k,b,s,l,m])=>$(b).onclick=async()=>{const item=VC[k].id;if(!item)return;$(b).disabled=true;const r=await vSend(k,item,VV);
 if(r&&r.error)$(m).textContent=r.error==="not_votable"?"This one was just added, so it can't be voted for any more.":"Could not reach the voting server. Try again in a moment.";
 else{$(s).value="";VC[k].id=null}
 VST=await vState(VV);vRender()});
$("#lv").onclick=e=>{e.stopPropagation();$("#hz").classList.toggle("open")};
document.addEventListener("click",e=>{if(!e.target.closest("#hz,#lv"))$("#hz").classList.remove("open");if(!e.target.closest(".rcol"))$(".rcol").classList.remove("cogopen")});
// ---- theme, language ----
const SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',MOON='<svg viewBox="0 0 24 24"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>';
function theme(t){H.dataset.theme=t;$("#th").innerHTML=t==="dark"?SUN:MOON;$("#th").title=t==="dark"?"Light mode":"Dark mode";drawBase();tiles();draw();tree()}
$("#th").onclick=()=>theme(dark()?"light":"dark");const GL='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';$("#mp").innerHTML=GL;$("#mp").onclick=()=>{MODE=MODE==="sat"?"street":"sat";tiles()};
theme(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");setH("F",HB.F);
})();
