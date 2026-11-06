(()=>{
const $=s=>document.querySelector(s), H=document.documentElement;
const N={};TREE.forEach(([id,name,p,f,note,code],i)=>N[id]={id,name,p,f,note,code,i,kids:[]});
const nodes=Object.values(N);nodes.forEach(n=>N[n.p]&&N[n.p].kids.push(n));
const F=(n,c)=>n.f.includes(c), anc=n=>{const a=[];while(N[n.p]){n=N[n.p];a.push(n)}return a};
// ---- geometry ----
const NAT=window.NATIVE||{};const nat=n=>NAT[n.id]?`(${NAT[n.id]})`:"";
const AR={};
const P=id=>AR[id]||(AR[id]=(AREAS[id]||[]).map(po=>po.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o})));
const has=n=>!!AREAS[n.id], exp=n=>n.kids.some(has), NOSHAPES=!Object.keys(AREAS).length, ok=n=>has(n)||(NOSHAPES&&n.name!=="[…]");
const bb=ring=>{let a=90,b=180,c=-90,d=-180;ring.forEach(([y,x])=>{a=Math.min(a,y);c=Math.max(c,y);b=Math.min(b,x);d=Math.max(d,x)});return[a,b,c,d]};
const LB=new WeakMap();   // label spot of one part: widest horizontal stretch through the part
function labelOf(po){let r=LB.get(po);if(r)return r;const ring=po[0],b=bb(ring);let best={w:0,lat:(b[0]+b[2])/2,lng:(b[1]+b[3])/2};
 for(const f of[.5,.42,.58,.34,.66,.26,.74]){const cy=b[0]+(b[2]-b[0])*f,xs=[];
  for(let i=0;i<ring.length-1;i++){const[y1,x1]=ring[i],[y2,x2]=ring[i+1];if((y1<=cy&&y2>cy)||(y2<=cy&&y1>cy))xs.push(x1+(cy-y1)/(y2-y1)*(x2-x1))}
  xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]-xs[i]>best.w)best={w:xs[i+1]-xs[i],lat:cy,lng:(xs[i]+xs[i+1])/2}}
 return LB.set(po,r={...best,area:(b[2]-b[0])*(b[3]-b[1])}),r}
// ---- state ----
let E=new Set(),S=null,MODE="street",curParts=[];
const dark=()=>H.dataset.theme==="dark";
const col=n=>`hsl(${(n.i*137.508)%360},${dark()?66:60}%,${dark()?62:40}%)`;
const map=L.map("map",{zoomControl:false,minZoom:3,maxZoom:14,renderer:L.canvas({padding:.4})}).setView([53,20],4);
L.control.zoom({position:"bottomright"}).addTo(map);
new(L.Control.extend({options:{position:"bottomleft"},onAdd(){const d=L.DomUtil.create("div","leaflet-bar leaflet-control"),a=L.DomUtil.create("a","infobtn",d);a.href="#";a.textContent="i";a.title="About this project";a.setAttribute("role","button");
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
// every part (mainland, island, exclave) is its own target, smaller parts on top; a selected language lights up all its parts together
function draw(){layer.clearLayers();curParts=[];nodes.filter(vis).forEach(n=>P(n.id).forEach(po=>curParts.push({n,po,a:labelOf(po).area})));
 curParts.sort((x,y)=>y.a-x.a);
 curParts.forEach(({n,po})=>{const c=col(n),sel=n.id===S,sc=F(n,"s");
  L.polygon(po,{color:c,fillColor:c,weight:sel?3.2:1.8,opacity:.95,fillOpacity:sc?.05:sel?.3:.13,dashArray:sc?"5 5":null}).bindTooltip(n.name+(nat(n)?" "+nat(n):""),{sticky:true}).on("click",()=>pick(n.id)).addTo(layer)});
 drawLabels()}
function drawLabels(){labels.clearLayers();const ppd=256*Math.pow(2,map.getZoom())/360;let selShown=0;
 curParts.slice().reverse().forEach(({n,po})=>{const l=labelOf(po),px=l.w*ppd*Math.cos(l.lat*Math.PI/180);let fs=Math.min(34,px/(n.name.length*.56));
  if(n.id===S&&selShown<12){selShown++;fs=Math.max(fs,10)}else if(fs<9)return;
  L.marker([l.lat,l.lng],{interactive:false,icon:L.divIcon({className:"",iconSize:[0,0],html:`<div class="lbl" style="font-size:${fs}px">${n.name}${fs>=13&&nat(n)?`<small>${nat(n)}</small>`:""}</div>`})}).addTo(labels)})}
map.on("zoomend",drawLabels);
function fly(n){if(!has(n))return;const pts=P(n.id).flatMap(po=>po[0]);map.fitBounds(L.latLngBounds(pts),{maxZoom:9,padding:[60,60]})}
const drop=n=>{E.delete(n.id);n.kids.forEach(drop)};
function pick(id){S=id;draw();box();fly(N[id]);tree()}            // select only, never breaks
function go(id){const n=N[id];anc(n).forEach(a=>E.add(a.id));if(has(n))drop(n);S=id;draw();box();fly(n);tree()} // breaks parents, rejoins when an ancestor is clicked
window.go=go;
// ---- info box ----
function chip(n){const k=ok(n);return`<button class="chip ${k?"":"ghost"}" ${k?`onclick="go('${n.id}')"`:`disabled title="${F(n,"x")?"Extinct":"No shape on the map yet"}"`}>${F(n,"x")?"† ":""}${n.name}</button>`}
const gcode=n=>{while(n&&!n.code)n=N[n.p];return n&&n.code};
function box(){const n=N[S];if(!n)return;const up=N[n.p],bd=[],gc=n.name==="[…]"?null:gcode(n);
 if(F(n,"x"))bd.push("extinct");if(F(n,"d"))bd.push("disputed");if(F(n,"s"))bd.push("dispersed");if(F(n,"n")&&n.name!=="[…]")bd.push("outside Europe");
 if(F(n,"p"))bd.push("project-defined, not in Glottolog");if(!NOSHAPES&&!has(n)&&!F(n,"n")&&!F(n,"x"))bd.push("no shape yet");
 $("#box").innerHTML=`<h2>${n.name}${gc?`<sup><a href="https://glottolog.org/resource/languoid/id/${gc}" target="_blank" rel="noopener" title="${n.code?"Open in Glottolog":"Nearest Glottolog entry"}" aria-label="Open in Glottolog">[i]</a></sup>`:""}</h2>${nat(n)?`<div class="nat mu">${nat(n)}</div>`:""}
 <p>${bd.map(b=>`<span class="badge">${b}</span>`).join("")}</p>
 <p>Descended from: ${up?chip(up):'<span class="mu">top-level family in Glottolog</span>'}</p>
 ${n.note?`<p class="mu">${n.note}</p>`:""}
 ${n.kids.length?`<p>Descendants: ${n.kids.map(chip).join("")}</p>`:'<p class="mu">No further breakdown recorded.</p>'}`}
// ---- horizons ----
function setH(m,b){E=new Set();nodes.forEach(n=>{if(!exp(n))return;
 if(m==="B"?!n.p:m==="L"?!F(n,"L")&&!F(n,"D"):m==="D")E.add(n.id)});
 S=null;draw();$("#box").innerHTML='<p class="mu">Click a shape to open it. Click one of its descendants in this box to break it up; click its ancestor to join it again.</p>';
 document.querySelectorAll("#hz button").forEach(x=>x.classList.toggle("on",x===b));map.setView([53,20],4);tree()}
[["Families","F"],["Branches","B"],["Languages","L"],["Dialects","D"]].forEach(([t,m],i)=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>setH(m,b);$("#hz").append(b);if(!i)b.classList.add("on")});
// ---- family tree (left to right, elbow lines) ----
const CW=196,RH=42;let TP=null;
function build(){const pos={};let row=0,md=0;
 const rec=(n,d)=>{md=Math.max(md,d);if(!n.kids.length){pos[n.id]={x:d*CW,y:row++*RH};return}n.kids.forEach(k=>rec(k,d+1));pos[n.id]={x:d*CW,y:(pos[n.kids[0].id].y+pos[n.kids.at(-1).id].y)/2}};
 nodes.filter(n=>!N[n.p]).forEach(r=>{rec(r,0);row++});
 TP={pos,w:(md+1)*CW+20,h:row*RH+20}}
function tree(center){const t=$("#tree");if(!t.classList.contains("open"))return;if(!TP)build();const {pos,w,h}=TP,q=$("#tq").value.trim().toLowerCase();
 const sel=N[S],hi=new Set(sel?[sel.id,...anc(sel).map(a=>a.id)]:[]);let paths="",boxes="";
 nodes.forEach(n=>{const p=pos[n.id];if(N[n.p]){const a=pos[n.p],x1=a.x+154,x2=p.x,xm=(x1+x2)/2;paths+=`<path class="${F(n,"d")?"dot":""} ${hi.has(n.id)?"hi":""}" d="M${x1} ${a.y+19}H${xm}V${p.y+19}H${x2}"/>`}
  const k=ok(n),m=q&&n.name.toLowerCase().includes(q);
  boxes+=`<button class="tb ${k?"":"ghost"} ${F(n,"x")?"ext":""} ${n.id===S?"sel":""} ${q?(m?"hit":"dim"):""}" style="left:${p.x}px;top:${p.y}px;border-left-color:${col(n)}" data-id="${n.id}" title="${n.name}${k?"":F(n,"x")?" (extinct)":" (no polygon)"}"><span>${F(n,"x")?"† ":""}${n.name}</span>${nat(n)?`<small>${nat(n)}</small>`:""}</button>`});
 $("#tc").style.cssText=`width:${w}px;height:${h}px`;$("#tc").innerHTML=`<svg width="${w}" height="${h}">${paths}</svg>${boxes}`;
 if(center&&S){const f=$(`#tc .tb[data-id="${S}"]`);f&&$("#tw").scrollTo({left:Math.max(0,f.offsetLeft-$("#tw").clientWidth/2+77),top:Math.max(0,f.offsetTop-$("#tw").clientHeight/2+19)})}
 if(q){const f=$("#tc .hit");f&&$("#tw").scrollTo({left:Math.max(0,f.offsetLeft-120),top:Math.max(0,f.offsetTop-120)})}}
$("#tc").addEventListener("click",e=>{const b=e.target.closest(".tb");if(!b)return;const n=N[b.dataset.id];
 if(has(n)){$("#tree").classList.remove("open");go(n.id)}else{S=n.id;box();tree()}});
$("#tg").onclick=()=>{$("#tree").classList.toggle("open");tree(true)};$("#tx").onclick=()=>$("#tree").classList.remove("open");
$("#tq").oninput=tree;addEventListener("keydown",e=>e.key==="Escape"&&$("#tree").classList.remove("open"));
let dr=null;const tw=$("#tw");tw.addEventListener("pointerdown",e=>{if(e.target.closest(".tb"))return;dr={x:e.clientX,y:e.clientY,l:tw.scrollLeft,t:tw.scrollTop};tw.classList.add("drag")});
addEventListener("pointermove",e=>{if(dr){tw.scrollLeft=dr.l-(e.clientX-dr.x);tw.scrollTop=dr.t-(e.clientY-dr.y)}});addEventListener("pointerup",()=>{dr=null;tw.classList.remove("drag")});
// ---- theme, language ----
const SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',MOON='<svg viewBox="0 0 24 24"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>';
function theme(t){H.dataset.theme=t;$("#th").innerHTML=t==="dark"?SUN:MOON;$("#th").title=t==="dark"?"Light mode":"Dark mode";drawBase();tiles();draw();tree()}
$("#th").onclick=()=>theme(dark()?"light":"dark");const GL='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';$("#mp").innerHTML=GL;$("#mp").onclick=()=>{MODE=MODE==="sat"?"street":"sat";tiles()};
$("#lg").onclick=()=>{const m=$("#lgm");m.style.display=m.style.display==="block"?"none":"block"};
theme(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");setH("F",$("#hz button"));
})();
