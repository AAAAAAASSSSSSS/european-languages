(()=>{
const $=s=>document.querySelector(s), H=document.documentElement;
const N={};TREE.forEach(([id,name,p,f,note],i)=>N[id]={id,name,p,f,note,i,kids:[]});
const nodes=Object.values(N);nodes.forEach(n=>N[n.p]&&N[n.p].kids.push(n));
const F=(n,c)=>n.f.includes(c), anc=n=>{const a=[];while(N[n.p]){n=N[n.p];a.push(n)}return a};
// ---- geometry ----
const memo={};
const P=id=>memo[id]||(memo[id]=AREAS[id]?AREAS[id].map(po=>po.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o})):N[id].kids.flatMap(k=>P(k.id)));
const has=n=>P(n.id).length>0, exp=n=>n.kids.some(has);
const bb=ring=>{let a=90,b=180,c=-90,d=-180;ring.forEach(([y,x])=>{a=Math.min(a,y);c=Math.max(c,y);b=Math.min(b,x);d=Math.max(d,x)});return[a,b,c,d]};
const lab={};
function labelOf(n){if(lab[n.id])return lab[n.id];let best=null,ba=-1;P(n.id).forEach(po=>{const b=bb(po[0]),a=(b[2]-b[0])*(b[3]-b[1]);if(a>ba){ba=a;best=po[0]}});
 const b=bb(best);let cy=0,A=0;for(let i=0;i<best.length-1;i++){const[y1,x1]=best[i],[y2,x2]=best[i+1],w=x1*y2-x2*y1;A+=w;cy+=(y1+y2)*w}
 cy=A?cy/(3*A):(b[0]+b[2])/2;if(cy<b[0]||cy>b[2])cy=(b[0]+b[2])/2;
 const xs=[];for(let i=0;i<best.length-1;i++){const[y1,x1]=best[i],[y2,x2]=best[i+1];if((y1<=cy&&y2>cy)||(y2<=cy&&y1>cy))xs.push(x1+(cy-y1)/(y2-y1)*(x2-x1))}
 xs.sort((p,q)=>p-q);let w=0,mx=(b[1]+b[3])/2;for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]-xs[i]>w){w=xs[i+1]-xs[i];mx=(xs[i]+xs[i+1])/2}
 return lab[n.id]={lat:cy,lng:mx,w:w||b[3]-b[1],area:ba}}
// ---- state ----
let E=new Set(),S=null,srcOpen=false;
const dark=()=>H.dataset.theme==="dark";
const col=n=>`hsl(${(n.i*137.508)%360},${dark()?62:56}%,${dark()?60:42}%)`;
const map=L.map("map",{zoomControl:false,minZoom:3,maxZoom:11,renderer:L.canvas({padding:.4})}).setView([53,20],4);
L.control.zoom({position:"bottomright"}).addTo(map);
const baseL=L.layerGroup().addTo(map),layer=L.layerGroup().addTo(map),labels=L.layerGroup().addTo(map);
function drawBase(){baseL.clearLayers();const cs=getComputedStyle(H);BASE.forEach(([c,po])=>{
 L.polygon(po.map(p=>p.map(r=>{const o=[];for(let i=0;i<r.length;i+=2)o.push([r[i+1],r[i]]);return o})),{fillColor:cs.getPropertyValue("--land"),fillOpacity:1,color:cs.getPropertyValue("--bd"),weight:.7,interactive:false}).addTo(baseL)})}
const vis=n=>has(n)&&(!n.p||E.has(n.p))&&!E.has(n.id);
function draw(){layer.clearLayers();const vs=nodes.filter(vis).sort((a,b)=>labelOf(b).area-labelOf(a).area);
 vs.forEach(n=>{const c=col(n),sel=n.id===S,sc=F(n,"s");
  L.polygon(P(n.id),{color:c,fillColor:c,weight:sel?3.5:1.3,fillOpacity:sc?.12:sel?.55:.34,dashArray:sc?"5 5":null}).bindTooltip(n.name,{sticky:true}).on("click",()=>pick(n.id)).addTo(layer)});
 drawLabels(vs)}
function drawLabels(vs){labels.clearLayers();const z=map.getZoom(),ppd=256*Math.pow(2,z)/360;vs=vs||nodes.filter(vis);
 vs.forEach(n=>{const l=labelOf(n),px=l.w*ppd*Math.cos(l.lat*Math.PI/180),fs=Math.min(30,px/(n.name.length*.56));
  if(fs<9&&n.id!==S)return;L.marker([l.lat,l.lng],{interactive:false,icon:L.divIcon({className:"",html:`<div class="lbl" style="font-size:${Math.max(fs,10)}px">${n.name}</div>`,iconSize:[0,0]})}).addTo(labels)})}
map.on("zoomend",()=>drawLabels());
function fly(n){if(!has(n))return;const pts=P(n.id).flatMap(po=>po[0]);map.fitBounds(L.latLngBounds(pts),{maxZoom:8,padding:[60,60]})}
const drop=n=>{E.delete(n.id);n.kids.forEach(drop)};
function pick(id){S=id;srcOpen=false;draw();box();fly(N[id]);tree()}            // select only, never breaks
function go(id){const n=N[id];anc(n).forEach(a=>E.add(a.id));if(has(n))drop(n);S=id;srcOpen=false;draw();box();fly(n);tree()} // breaks parents, rejoins when an ancestor is clicked
window.go=go;window.tgl=()=>{srcOpen=!srcOpen;box()};
// ---- info box ----
const why=n=>F(n,"x")?"extinct":F(n,"n")||(!has(n)&&!F(n,"x"))?"no polygon (outside the Europe definition)":"";
function chip(n){const ok=has(n);return`<button class="chip ${ok?"":"ghost"}" ${ok?`onclick="go('${n.id}')"`:`disabled title="${F(n,"x")?"Extinct":"Not drawn: outside the Europe definition"}"`}>${F(n,"x")?"† ":""}${n.name}</button>`}
function srcs(n){const a=(SOURCES[n.id]||[]).slice();if(F(n,"d")&&!a.length)a.push({c:"Classification or status is disputed",w:"to be filled in",r:"",s:"pending"});return a.concat(SOURCES._generic)}
function box(){const n=N[S];if(!n)return;const up=N[n.p],bd=[];
 if(F(n,"x"))bd.push("extinct");if(F(n,"d"))bd.push("disputed");if(F(n,"s"))bd.push("dispersed");if(!has(n)&&!F(n,"x"))bd.push("outside Europe");
 $("#box").innerHTML=`<h2>${n.name}<sup><button onclick="tgl()" aria-label="Sources" title="Sources">[i]</button></sup></h2>
 <p>${bd.map(b=>`<span class="badge">${b}</span>`).join("")}</p>
 <p>Descended from: ${up?chip(up):`<span class="mu">${n.note||"unknown"}</span>`}</p>
 ${n.note&&up?`<p class="mu">${n.note}</p>`:""}
 ${n.kids.length?`<p>Descendants: ${n.kids.map(chip).join("")}</p>`:'<p class="mu">No further breakdown recorded.</p>'}
 ${srcOpen?srcs(n).map(s=>`<div class="src ${s.s}"><b>${s.c}</b><br>${s.w}${s.r?` — ${s.r}`:""} <span class="mu">[${s.s}]</span></div>`).join(""):""}`}
// ---- horizons ----
function setH(m,b){E=new Set();nodes.forEach(n=>{if(!exp(n))return;
 if(m==="B"?!n.p:m==="L"?!F(n,"L")&&!F(n,"D"):m==="D")E.add(n.id)});
 S=null;draw();$("#box").innerHTML='<p class="mu">Click a shape to open it. Click one of its descendants in this box to break it up; click its ancestor to join it again.</p>';
 document.querySelectorAll("#hz button").forEach(x=>x.classList.toggle("on",x===b));map.setView([53,20],4);tree()}
[["Families","F"],["Branches","B"],["Languages","L"],["Dialects","D"]].forEach(([t,m],i)=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>setH(m,b);$("#hz").append(b);if(!i)b.classList.add("on")});
// ---- family tree (left to right, elbow lines) ----
const CW=196,RH=32;let TP=null;
function build(){const pos={};let row=0,md=0;
 const rec=(n,d)=>{md=Math.max(md,d);if(!n.kids.length){pos[n.id]={x:d*CW,y:row++*RH};return}n.kids.forEach(k=>rec(k,d+1));pos[n.id]={x:d*CW,y:(pos[n.kids[0].id].y+pos[n.kids.at(-1).id].y)/2}};
 nodes.filter(n=>!N[n.p]).forEach(r=>{rec(r,0);row++});
 TP={pos,w:(md+1)*CW+20,h:row*RH+20}}
function tree(){const t=$("#tree");if(!t.classList.contains("open"))return;if(!TP)build();const {pos,w,h}=TP,q=$("#tq").value.trim().toLowerCase();
 const sel=N[S],hi=new Set(sel?[sel.id,...anc(sel).map(a=>a.id)]:[]);let paths="",boxes="";
 nodes.forEach(n=>{const p=pos[n.id];if(N[n.p]){const a=pos[n.p],x1=a.x+154,x2=p.x,xm=(x1+x2)/2;paths+=`<path class="${F(n,"d")?"dot":""} ${hi.has(n.id)?"hi":""}" d="M${x1} ${a.y+13}H${xm}V${p.y+13}H${x2}"/>`}
  const ok=has(n),m=q&&n.name.toLowerCase().includes(q);
  boxes+=`<button class="tb ${ok?"":"ghost"} ${F(n,"x")?"ext":""} ${n.id===S?"sel":""} ${q?(m?"hit":"dim"):""}" style="left:${p.x}px;top:${p.y}px;border-left-color:${col(n)}" data-id="${n.id}" title="${n.name}${ok?"":F(n,"x")?" (extinct)":" (no polygon)"}">${F(n,"x")?"† ":""}${n.name}</button>`});
 $("#tc").style.cssText=`width:${w}px;height:${h}px`;$("#tc").innerHTML=`<svg width="${w}" height="${h}">${paths}</svg>${boxes}`;
 if(q){const f=$("#tc .hit");f&&$("#tw").scrollTo({left:Math.max(0,f.offsetLeft-120),top:Math.max(0,f.offsetTop-120)})}}
$("#tc").addEventListener("click",e=>{const b=e.target.closest(".tb");if(!b)return;const n=N[b.dataset.id];
 if(has(n)){$("#tree").classList.remove("open");go(n.id)}else{S=n.id;srcOpen=false;box();tree()}});
$("#tg").onclick=()=>{$("#tree").classList.toggle("open");tree()};$("#tx").onclick=()=>$("#tree").classList.remove("open");
$("#tq").oninput=tree;addEventListener("keydown",e=>e.key==="Escape"&&$("#tree").classList.remove("open"));
let dr=null;const tw=$("#tw");tw.addEventListener("pointerdown",e=>{if(e.target.closest(".tb"))return;dr={x:e.clientX,y:e.clientY,l:tw.scrollLeft,t:tw.scrollTop};tw.classList.add("drag")});
addEventListener("pointermove",e=>{if(dr){tw.scrollLeft=dr.l-(e.clientX-dr.x);tw.scrollTop=dr.t-(e.clientY-dr.y)}});addEventListener("pointerup",()=>{dr=null;tw.classList.remove("drag")});
// ---- theme, language ----
const SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',MOON='<svg viewBox="0 0 24 24"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>';
function theme(t){H.dataset.theme=t;$("#th").innerHTML=t==="dark"?SUN:MOON;$("#th").title=t==="dark"?"Light mode":"Dark mode";drawBase();draw();tree()}
$("#th").onclick=()=>theme(dark()?"light":"dark");$("#lg").onclick=()=>{const m=$("#lgm");m.style.display=m.style.display==="block"?"none":"block"};
theme(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");setH("F",$("#hz button"));
})();
