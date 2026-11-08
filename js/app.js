(()=>{
const $=s=>document.querySelector(s), H=document.documentElement, esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ED=window.EDITS||{},INFO=ED.info||{};
const ROWS=TREE.filter(t=>!(ED.remove||[]).includes(t[0])).map(t=>t.slice()).concat((ED.add||[]).map(t=>t.slice()));
const RB={};ROWS.forEach(t=>RB[t[0]]=t);
Object.entries(ED.rename||{}).forEach(([id,v])=>RB[id]&&(RB[id][1]=v));Object.entries(ED.parent||{}).forEach(([id,v])=>RB[id]&&(RB[id][2]=v));Object.entries(ED.flags||{}).forEach(([id,v])=>RB[id]&&(RB[id][3]=v));
const N={};ROWS.forEach(([id,name,p,f,note,code],i)=>N[id]={id,name,p,f,note,code,i,kids:[]});
const nodes=Object.values(N);nodes.forEach(n=>N[n.p]&&N[n.p].kids.push(n));
const F=(n,c)=>n.f.includes(c), anc=n=>{const a=[];while(N[n.p]){n=N[n.p];a.push(n)}return a};
const byName=(a,b)=>N[a].name.localeCompare(N[b].name);
// ---- geometry: only the small shapes are given; every bigger shape is the UNION (set theory) of its parts ----
const NAT={};Object.entries(window.NATIVE||{}).forEach(([k,v])=>NAT[k]={main:[v]});Object.assign(NAT,ED.native||{});
const nat=n=>NAT[n.id]?`(${NAT[n.id].main.join("/")})`:"", natAll=n=>NAT[n.id]&&NAT[n.id].all?NAT[n.id].all.join(" / "):"";
const PC=window.polygonClipping, safe=(f,...a)=>{try{return f(...a)}catch(e){return null}};
const AR={};
const P=id=>AR[id]||(AR[id]=(AREAS[id]||[]).map(po=>po.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o})));
const toGJ=po=>po.map(r=>r.map(([la,ln])=>[ln,la])), fromGJ=mp=>mp.map(po=>po.map(r=>r.map(([x,y])=>[y,x])));
const SH={};
function shape(n){if(n.id in SH)return SH[n.id];const parts=P(n.id).map(toGJ);n.kids.forEach(k=>{const s=shape(k);if(s)s.forEach(po=>parts.push(toGJ(po)))});
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
let E=new Set(),S=null,MODE="street",HZ="F",LASTH="F",W=null,WSEL=null,items=[];
const dark=()=>H.dataset.theme==="dark";
const col=n=>`hsl(${(n.i*137.508)%360},${dark()?66:60}%,${dark()?62:40}%)`;
// cluster colours: red, blue, green, yellow, orange, then more (no black / white)
const PALC=["#e6194b","#2f6fe0","#2fa84f","#f2cf1d","#f58231","#911eb4","#17b8b8","#e056a8","#8b5a2b","#7f9a1c"];
const PAL=i=>i<PALC.length?PALC[i]:`hsl(${(i*137.508)%360},65%,50%)`;
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
const vis=n=>has(n)&&(!n.p||E.has(n.p))&&!E.has(n.id);
// ---- words: which node carries which word ----
const entFor=n=>{while(n){const e=W.ents.get(n.id);if(e)return e;n=N[n.p]}return null};   // own word, else the nearest ancestor's
function computeWS(){W.ws=new Map();const below={};W.entAnc=new Set();
 W.ents.forEach((e,id)=>{below[id]=[];anc(N[id]).forEach(a=>W.entAnc.add(a.id))});
 W.ents.forEach((e,id)=>anc(N[id]).forEach(a=>W.ents.has(a.id)&&below[a.id].push(id)));
 W.ents.forEach((e,id)=>{const base=shape(N[id]);if(!base)return;let r=base;
  const cut=below[id].map(d=>shape(N[d])).filter(Boolean);
  if(cut.length){const d=safe(PC.difference,base.map(toGJ),...cut.map(s=>s.map(toGJ)));r=d?fromGJ(d):base}
  if(r.length)W.ws.set(id,r)});
 W.cls.forEach(c=>{const ps=c.ids.map(id=>W.ws.get(id)).filter(Boolean).map(s=>s.map(toGJ));
  c.u=ps.length?(()=>{const u=safe(PC.union,...ps);return fromGJ(u||ps.flat())})():null})}
// ---- drawing ----
function addPoly(n,po,o,tip){const a=labelOf(po).area;L.polygon(po,o).bindTooltip(tip,{sticky:true}).on("click",()=>pick(n.id)).addTo(layer);return a}
function draw(){layer.clearLayers();items=[];
 if(W&&!HZ){drawWord();return drawLabels()}
 const parts=[];nodes.filter(vis).forEach(n=>(shape(n)||[]).forEach(po=>parts.push({n,po,a:labelOf(po).area})));parts.sort((x,y)=>y.a-x.a);
 parts.forEach(({n,po})=>{const e=W&&entFor(n),c=e?e.color:col(n),sel=n.id===S,sc=F(n,"s");
  L.polygon(po,{color:c,fillColor:c,weight:sel?3.2:1.8,opacity:.95,fillOpacity:sc?.05:sel?.3:.13,dashArray:sc?"5 5":null}).bindTooltip(n.name+(nat(n)?" "+nat(n):"")+(e?": "+e.form:""),{sticky:true}).on("click",()=>pick(n.id)).addTo(layer);
  items.push(e?{po,txt:e.form,sub:n.name,sel:n.id===S}:{po,txt:n.name,sub:nat(n),sel:n.id===S})});
 drawLabels()}
// word mode: every language/dialect with a word is its own polygon (children with their own word cut out), coloured by cluster; then one outline per cluster
function drawWord(){const parts=[];
 W.ws.forEach((mp,id)=>mp.forEach(po=>parts.push({id,po,a:labelOf(po).area})));parts.sort((x,y)=>y.a-x.a);
 parts.forEach(({id,po})=>{const n=N[id],e=W.ents.get(id),sel=id===S;
  L.polygon(po,{color:e.color,fillColor:e.color,weight:sel?3.6:1.6,opacity:.95,fillOpacity:sel?.6:.4}).bindTooltip(`${n.name}: ${e.form}`,{sticky:true}).on("click",()=>pick(id)).addTo(layer);
  items.push({po,txt:e.form,sub:n.name,sel})});
 W.cls.forEach(c=>{if(!c.u)return;c.u.forEach(po=>L.polygon(po,{color:c.color,weight:4.5,fill:false,opacity:1,interactive:false}).addTo(layer));
  const big=c.u.slice().sort((x,y)=>labelOf(y).area-labelOf(x).area)[0],r=c.root;
  items.push({po:big,txt:r.form||r.lang||"?",sub:r.form?r.lang:"",cls:"root",sel:false,color:c.color})})}
function drawLabels(){labels.clearLayers();const ppd=256*Math.pow(2,map.getZoom())/360;let selShown=0;
 items.slice().reverse().forEach(it=>{const l=labelOf(it.po),px=l.w*ppd*Math.cos(l.lat*Math.PI/180);let fs=Math.min(34,px/(it.txt.length*.56));
  if(it.sel&&selShown<12){selShown++;fs=Math.max(fs,10)}else if(fs<9)return;
  L.marker([l.lat,l.lng],{interactive:false,icon:L.divIcon({className:"",iconSize:[0,0],html:`<div class="lbl ${it.cls||""}" style="font-size:${fs}px">${esc(it.txt)}${fs>=13&&it.sub?`<small>${esc(it.sub)}</small>`:""}</div>`})}).addTo(labels)})}
map.on("zoomend",drawLabels);
function fitTo(mps){const pts=mps.flatMap(mp=>mp.flatMap(po=>po[0]));if(pts.length)map.fitBounds(L.latLngBounds(pts),{maxZoom:9,padding:[60,60]})}
function fly(n){const s=shape(n);if(s)fitTo([s])}
const drop=n=>{E.delete(n.id);n.kids.forEach(drop)};
function pick(id){S=id;draw();box();fly(N[id]);tree()}            // select only, never breaks
function go(id){const n=N[id];if(W&&!HZ)return pick(id);anc(n).forEach(a=>E.add(a.id));if(has(n))drop(n);S=id;draw();box();fly(n);tree()} // breaks parents, rejoins when an ancestor is clicked
window.go=go;
// ---- info box ----
function chip(n){if(n.name==="[…]")return`<button class="chip ghost" disabled data-tip="${esc(n.note||"Further Glottolog branches outside this project")}">[…]</button>`;const k=ok(n);return`<button class="chip ${k?"":"ghost"}" ${k?`onclick="go('${n.id}')"`:`disabled title="${F(n,"x")?"Extinct":"No shape on the map yet"}"`}>${F(n,"x")?"† ":""}${n.name}</button>`}
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
function showBox(html){hideTip();const b=$("#box");b.hidden=false;b.innerHTML=html+`<button id="bxc">Close</button>`;$("#bxc").onclick=closeBox}
function closeBox(){$("#box").hidden=true;if(S){S=null;draw();tree()}}
const hostOf=u=>{try{return new URL(u).hostname}catch(e){return u}};
const defTip=u=>{try{const x=new URL(u),t=decodeURIComponent(x.pathname.split("/").pop()).replace(/_/g," ");return x.hostname.includes("wikipedia")?`Wikipedia (${x.hostname.split(".")[0]}): ${t}`:x.hostname.includes("glottolog")?`Glottolog: ${t}`:`${x.hostname}: ${t}`}catch(e){return u}};
const wordsOf=id=>SECS.flatMap(s=>s.words.flatMap(w=>w.entries.filter(e=>e[0]===id).map(e=>({w:w.name,f:e[1],src:e[5]}))));
// every link in the box is a letter in brackets: [a], [b], [c] ... in order of appearance; the hover holds the explanation
function box(){const n=N[S];if(!n||n.name==="[…]")return;const up=N[n.p],bd=[],gc=gcode(n),inf=INFO[n.id]||{},K=[];
 const ref=(u,t)=>{const l=String.fromCharCode(97+K.length);K.push({l,u,t});return refA(l,u,t)};
 const refA=(l,u,t)=>u?`<sup><a class="rf" href="${esc(u)}" target="_blank" rel="noopener" data-tip="${esc(t)}" aria-label="${esc(t)}">[${l}]</a></sup>`:`<sup><span class="rf" tabindex="0" data-tip="${esc(t)}">[${l}]</span></sup>`;
 const m=/^ISO 639-3: (\w{3})$/.exec(n.note||""),code=m&&m[1];
 const refs=(gc?ref(GLURL+gc,n.code?"Open in Glottolog":"Nearest Glottolog entry"):"")
  +(code?ref("https://iso639-3.sil.org/code/"+code,`ISO 639-3: ${code}`+(RETIRED[code]?` (${RETIRED[code]})`:/^q[a-t][a-z]$/.test(code)?" (private-use code, not an official language code)":"")):"")
  +(inf.links||[]).map(l=>ref(l.url,l.tip||(l.url?defTip(l.url):""))).join("");
 const lnk=i=>K[(gc?1:0)+(code?1:0)+i];
 if(F(n,"x"))bd.push("extinct");if(F(n,"d"))bd.push("disputed");if(F(n,"s"))bd.push("dispersed");if(F(n,"n"))bd.push("outside Europe");
 (inf.badges||[]).forEach(b=>bd.push(b));if(F(n,"p"))bd.push("project-defined, not in Glottolog");if(!NOSHAPES&&!has(n)&&!F(n,"n")&&!F(n,"x"))bd.push("no shape yet");
 const e=W&&W.ents.get(n.id),facts=(inf.facts||[]).map(f=>{const r=f.ref!=null&&lnk(f.ref);return`<p>${esc(f.t)}${r?refA(r.l,r.u,r.t):""}</p>`}).join("");
 const ws=wordsOf(n.id),wl=ws.length?`<p>${ws.map(x=>{let r="";if(x.src){let k=K.find(q=>q.u===x.src[0]);r=k?refA(k.l,k.u,k.t):ref(x.src[0],x.src[1])}return`${esc(x.w)}: <b>${esc(x.f)}</b>${r}`}).join("; ")}</p>`:"";
 showBox(`<h2>${esc(n.name)}${refs}</h2>${nat(n)?`<div class="nat mu" ${natAll(n)?`data-tip="${esc(natAll(n))}" tabindex="0"`:""}>${esc(nat(n))}</div>`:""}
 <p>${bd.map(b=>`<span class="badge">${esc(b)}</span>`).join("")}</p>${facts}
 ${e?`<p>${esc(W.w.name)}: <b>${esc(e.form)}</b> <button onclick="wordsAt('${n.id}')">Etymology</button></p>`:""}${wl}
 <p>Descended from: ${up?chip(up):'<span class="mu">top-level family in Glottolog</span>'}</p>
 ${n.note&&!code?`<p class="mu">${esc(n.note)}</p>`:""}
 ${n.kids.length?`<p>Descendants: ${n.kids.map(chip).join("")}</p>`:'<p class="mu">No further breakdown recorded.</p>'}`)}
// ---- horizons ----
const HB={};
function setH(m,b){E=new Set();nodes.forEach(n=>{if(!exp(n))return;
 if(m==="B"?!n.p:m==="L"?!F(n,"L")&&!F(n,"D"):m==="D")E.add(n.id)});
 HZ=m;LASTH=m;S=null;draw();showBox('<p class="mu">Click a shape to open it. Click one of its descendants in this box to break it up; click its ancestor to join it again.</p>');
 document.querySelectorAll("#hz button").forEach(x=>x.classList.toggle("on",x===b));map.setView([53,20],4);tree()}
[["Families","F"],["Branches","B"],["Languages","L"],["Dialects","D"]].forEach(([t,m],i)=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>setH(m,b);HB[m]=b;$("#hz").append(b);if(!i)b.classList.add("on")});
// ---- panels: only one open at a time ----
const panels=["#tree","#words","#cpanel"];

const isOpen=id=>$(id).classList.contains("open"), closeP=id=>$(id).classList.remove("open");
// ---- language tree (left to right, elbow lines, [+]/[-] on every branch) ----
const CW=224,RH=42,OPN=new Set();let TP=null;
function build(){const its=[];let row=0,md=0;
 const rec=(n,d,par,ph)=>{const it={n,d,par,ph,kids:[]};its.push(it);md=Math.max(md,d);
  if(ph){it.y=row++*RH;return it}
  if(n.kids.length){if(OPN.has(n.id))n.kids.forEach(k=>it.kids.push(rec(k,d+1,it)));else it.kids.push(rec(n,d+1,it,true))}
  it.y=it.kids.length?(it.kids[0].y+it.kids.at(-1).y)/2:row++*RH;return it};
 nodes.filter(n=>!N[n.p]).forEach(r=>{rec(r,0,null);row++});
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
  boxes+=`<button class="tb ${k?"":"ghost"} ${dots?"dots":""} ${n.id===S?"sel":""} ${q?(m?"hit":"dim"):""}" style="left:${it.x}px;top:${it.y}px;border-left-color:${col(n)}" data-id="${n.id}" ${dots?`data-tip="${esc(n.note||"Further Glottolog branches outside this project")}"`:`title="${esc(n.name)}${k?"":F(n,"x")?" (extinct)":" (no polygon)"}"`}><span>${F(n,"x")?"† ":""}${esc(n.name)}</span>${nat(n)||en?`<small class="r"><span ${ta?`data-tip="${esc(ta)}"`:""}>${esc(nat(n))}</span>${en?`<i>(${esc(en.form)})</i>`:""}</small>`:""}</button>`;
  if(n.kids.length)boxes+=`<button class="tg2 ${hi.has(n.id)?"hi":""}" style="left:${it.x+154}px;top:${it.y+9}px" data-t="${n.id}" title="${OPN.has(n.id)?"Close":"Open"} the subdivisions of ${esc(n.name)}">${OPN.has(n.id)?"[-]":"[+]"}</button>`});
 $("#tc").style.cssText=`width:${w}px;height:${h}px`;$("#tc").innerHTML=`<svg width="${w}" height="${h}">${pn}${ph}</svg>${boxes}`;
 if(center&&S){const f=$(`#tc .tb[data-id="${S}"]`);f&&$("#tw").scrollTo({left:Math.max(0,f.offsetLeft-$("#tw").clientWidth/2+77),top:Math.max(0,f.offsetTop-$("#tw").clientHeight/2+19)})}
 if(q){const f=$("#tc .hit");f&&$("#tw").scrollTo({left:Math.max(0,f.offsetLeft-120),top:Math.max(0,f.offsetTop-120)})}}
$("#tc").addEventListener("click",e=>{const g=e.target.closest(".tg2");
 if(g){const id=g.dataset.t;OPN.has(id)?OPN.delete(id):OPN.add(id);return tree()}
 const b=e.target.closest(".tb");if(!b)return;const n=N[b.dataset.id];
 if(b.dataset.ph){OPN.add(n.id);return tree()}
 if(n.name==="[…]")return;if(has(n)){closeP("#tree");go(n.id)}else{S=n.id;box();tree()}});
$("#tg").onclick=()=>{const o=!isOpen("#tree");panels.forEach(closeP);if(o){$("#tree").classList.add("open");tree(true)}};$("#tx").onclick=()=>closeP("#tree");
$("#te").onclick=()=>{nodes.forEach(n=>n.kids.length&&OPN.add(n.id));tree()};$("#tf").onclick=()=>{OPN.clear();tree()};
$("#tq").oninput=()=>{const q=$("#tq").value.trim().toLowerCase();if(q)nodes.forEach(n=>n.name.toLowerCase().includes(q)&&anc(n).forEach(a=>OPN.add(a.id)));tree()};
addEventListener("keydown",e=>{if(e.key==="Escape"){panels.forEach(closeP)}});
let dr=null;const tw=$("#tw");tw.addEventListener("pointerdown",e=>{if(e.target.closest(".tb,.tg2"))return;dr={x:e.clientX,y:e.clientY,l:tw.scrollLeft,t:tw.scrollTop};tw.classList.add("drag")});
addEventListener("pointermove",e=>{if(dr){tw.scrollLeft=dr.l-(e.clientX-dr.x);tw.scrollTop=dr.t-(e.clientY-dr.y)}});addEventListener("pointerup",()=>{dr=null;tw.classList.remove("drag")});
// ---- words page ----
const SECS=(window.WORDS?WORDS.sections:[]).slice().sort((a,b)=>a.name.localeCompare(b.name));SECS.forEach(s=>s.words.sort((a,b)=>a.name.localeCompare(b.name)));
let curSec=null;
function renderSecs(){$("#wsec").innerHTML=SECS.map(s=>`<button data-s="${s.id}" class="${curSec&&curSec.id===s.id?"on":""}">${esc(s.name)}</button>`).join("")||'<span class="mu">No sections yet.</span>';
 const sl=$("#wsl");sl.innerHTML=curSec?`<option value="">Choose a word…</option>`+curSec.words.map(w=>`<option value="${w.id}" ${W&&W.w===w?"selected":""}>${esc(w.name)}</option>`).join(""):`<option value="">Choose a section on the left</option>`;sl.disabled=!curSec}
$("#wsec").onclick=e=>{const b=e.target.closest("button");if(!b)return;curSec=SECS.find(s=>s.id===b.dataset.s);renderSecs();if(!W||W.sec!==curSec)renderPage()};
$("#wsl").onchange=e=>{const w=curSec&&curSec.words.find(x=>x.id===e.target.value);if(w)setWord(curSec,w)};
$("#wd").onclick=()=>{const o=!isOpen("#words");panels.forEach(closeP);if(o){$("#box").hidden=true;$("#words").classList.add("open");renderSecs();renderPage()}};$("#wx").onclick=()=>closeP("#words");
function setWord(sec,w){const ents=new Map();w.entries.forEach(([id,form,key,chain,bor,src])=>{if(N[id])ents.set(id,{id,form,key,chain,bor,src})});
 const g={};ents.forEach(e=>(g[e.key]=g[e.key]||[]).push(e.id));
 const cls=Object.entries(g).map(([key,ids])=>({key,ids:ids.sort(byName),root:w.clusters[key]||{lang:"?",form:""}}));
 cls.sort((a,b)=>b.ids.length-a.ids.length||byName(a.ids[0],b.ids[0]));   // biggest cluster first, ties: whose first language comes first alphabetically
 cls.forEach((c,i)=>{c.i=i;c.color=PAL(i);c.ids.forEach(id=>ents.get(id).color=c.color)});
 W={sec,w,ents,cls};WSEL=null;HZ=null;E=new Set();S=null;computeWS();
 document.querySelectorAll("#hz button").forEach(x=>x.classList.remove("on"));$("#rs").hidden=false;$("#wd").classList.add("on");
 draw();fitTo([...W.ws.values()]);showBox('<p class="mu">Word mode: each shape carries its word, shapes of one cluster share a colour, and the thick outline carries the oldest known root.</p>');
 renderSecs();renderPage();tree()}
function noData(){const out=[],walk=n=>{if(!has(n)||W.ents.has(n.id))return;
 if(!W.entAnc.has(n.id)&&(F(n,"L")||F(n,"D"))){out.push(n.name);return}n.kids.forEach(walk)};
 nodes.filter(n=>!N[n.p]).forEach(walk);return out.sort((a,b)=>a.localeCompare(b))}
function renderPage(){const c=$("#wcl");$("#wet").innerHTML="";
 if(!W){c.innerHTML=`<p class="mu">${curSec?"Choose a word in the menu above.":"Choose a section on the left, then a word."}</p>`;return}
 const w=W.w,nd=noData();
 c.innerHTML=`<h3>${esc(w.name)}</h3>`+(W.cls.map(k=>`<div class="cg" style="border-left-color:${k.color}"><h4>${esc(k.root.form||k.root.lang||"?")} <small>${esc(k.root.form?k.root.lang:"")} · ${k.ids.length}</small></h4>${k.ids.map(id=>`<button class="wl ${id===WSEL?"on":""}" data-id="${id}">${esc(N[id].name)}: ${esc(W.ents.get(id).form)}</button>`).join("")}</div>`).join("")||'<p class="mu">No words recorded yet.</p>')
  +(nd.length?`<p class="mu">No data: ${nd.map(esc).join(", ")}</p>`:"");
 if(WSEL)renderEty(WSEL)}
function renderEty(id){const e=W.ents.get(id),r=W.w.clusters[e.key],st=[];
 if(r)st.push({l:r.lang,f:r.form});(e.chain||[]).forEach(([l,f,b])=>st.push({l,f,b:!!b}));st.push({l:N[id].name,f:e.form,b:!!e.bor,last:1});
 $("#wet").innerHTML=st.map((s,i)=>`${i?`<div class="eln ${s.b?"dot":""}"></div>`:""}<div class="eb ${s.last?"last":""}"><small>${esc(s.l)}</small><b>${esc(s.f)}</b></div>`).join("")}
$("#wcl").onclick=e=>{const b=e.target.closest(".wl");if(!b)return;WSEL=b.dataset.id;document.querySelectorAll(".wl").forEach(x=>x.classList.toggle("on",x===b));renderEty(WSEL)};
window.wordsAt=id=>{panels.forEach(closeP);$("#words").classList.add("open");WSEL=id;curSec=W.sec;renderSecs();renderPage()};
$("#rs").onclick=()=>{W=null;WSEL=null;$("#rs").hidden=true;$("#wd").classList.remove("on");renderSecs();renderPage();setH(LASTH,HB[LASTH])};
// ---- cluster: distance between languages from the words they share ----
const ALLW=SECS.flatMap(s=>s.words),WK=ALLW.map(w=>{const m=new Map();w.entries.forEach(e=>N[e[0]]&&m.set(e[0],e[2]));return m});
const LNG=[...new Set(WK.flatMap(m=>[...m.keys()]))].sort(byName);
const sim=(a,b)=>{let n=0,s=0;WK.forEach(m=>{if(m.has(a)&&m.has(b)){n++;if(m.get(a)===m.get(b))s++}});return{n,s,v:n?s/n:null}};
const fmt=v=>String(Number(v.toFixed(3)));
let CM="i";
function renderC(){document.querySelectorAll("#cm button").forEach(b=>b.classList.toggle("on",b.dataset.m===CM));const c=$("#cbody");
 if(LNG.length<2){c.innerHTML='<p class="mu">There are not yet two languages with words, so there is nothing to compare.</p>';$("#chint").textContent="";return}
 if(CM==="i"){$("#chint").textContent="distance = shared roots / words both languages have";
  const cur=LNG.includes(S)?S:LNG.includes(c.dataset.id)?c.dataset.id:LNG[0];
  c.innerHTML=`<label>Language <select id="ci">${LNG.map(id=>`<option value="${id}" ${id===cur?"selected":""}>${esc(N[id].name)}</option>`).join("")}</select></label><div id="cr"></div>`;
  const run=()=>{const a=$("#ci").value;c.dataset.id=a;const g={},none=[];
   LNG.filter(b=>b!==a).forEach(b=>{const r=sim(a,b);if(r.v===null)none.push(N[b].name);else(g[fmt(r.v)]=g[fmt(r.v)]||[]).push(N[b].name)});
   $("#cr").innerHTML=Object.keys(g).sort((x,y)=>y-x).map(v=>`<p>${g[v].sort((x,y)=>x.localeCompare(y)).map(esc).join(", ")}: <b>${v}</b></p>`).join("")+(none.length?`<p class="mu">No shared words: ${none.sort((x,y)=>x.localeCompare(y)).map(esc).join(", ")}</p>`:"")};
  $("#ci").onchange=run;run()}
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
  out+=`<text transform="translate(${f(x)} ${f(y)}) rotate(${f(fl?deg+180:deg)})" text-anchor="${fl?"end":"start"}" dominant-baseline="middle" ${l.gc==null?"":`style="fill:${PAL(l.gc)}"`}>${esc(N[l.id].name)}<title>${esc(N[l.id].name)}</title></text>`});
 return`<svg width="${2*Z}" height="${2*Z}" viewBox="0 0 ${2*Z} ${2*Z}" role="img" aria-label="Wheel of language distances">${out}</svg>`}
$("#cl").onclick=()=>{const o=!isOpen("#cpanel");panels.forEach(closeP);if(o){$("#box").hidden=true;$("#cpanel").classList.add("open");renderC()}};
$("#cm").onclick=e=>{const b=e.target.closest("button");if(b){CM=b.dataset.m;renderC()}};$("#cx").onclick=()=>closeP("#cpanel");
// ---- theme, language ----
const SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',MOON='<svg viewBox="0 0 24 24"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>';
function theme(t){H.dataset.theme=t;$("#th").innerHTML=t==="dark"?SUN:MOON;$("#th").title=t==="dark"?"Light mode":"Dark mode";drawBase();tiles();draw();tree()}
$("#th").onclick=()=>theme(dark()?"light":"dark");const GL='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';$("#mp").innerHTML=GL;$("#mp").onclick=()=>{MODE=MODE==="sat"?"street":"sat";tiles()};
$("#lg").onclick=()=>{const m=$("#lgm");m.style.display=m.style.display==="block"?"none":"block"};
theme(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");setH("F",HB.F);
})();
