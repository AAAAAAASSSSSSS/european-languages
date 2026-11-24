// Voting server for the Languages of Europe map: Cloudflare Worker + D1 (free tier is enough).
// Rules: each visitor (IP) may have ONE open language vote and ONE open word vote. A vote stops counting, and the
// visitor may vote again, as soon as the item is no longer in votable.json (i.e. it was added to the project).
// The IP is only used through a salted hash (GDPR friendly); location comes from Cloudflare (country + region only).

const json=(o,env,status=200)=>new Response(JSON.stringify(o),{status,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":env.ALLOWED_ORIGIN||"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Cache-Control":"no-store"}});
let votableCache={at:0,data:null};
async function votable(env){
  if(votableCache.data&&Date.now()-votableCache.at<300000)return votableCache.data;   // refresh every 5 minutes
  const r=await fetch(env.VOTABLE_URL,{cf:{cacheTtl:300}});const d=await r.json();
  votableCache={at:Date.now(),data:{lang:new Set(d.lang),word:new Set(d.word)}};return votableCache.data}
async function ipHash(env,ip){const b=new TextEncoder().encode((env.SALT||"change-me")+"|"+ip);return[...new Uint8Array(await crypto.subtle.digest("SHA-256",b))].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function state(env,V,h){
  const out={recent:{},ranks:{},mine:{}};
  for(const k of["lang","word"]){
    const rec=await env.DB.prepare("SELECT item,ts,place FROM submissions WHERE kind=? AND ts IS NOT NULL ORDER BY id DESC LIMIT 40").bind(k).all();
    out.recent[k]=rec.results.filter(r=>V[k].has(r.item)).slice(0,10);
    const rk=await env.DB.prepare("SELECT item,COUNT(*) AS n FROM submissions WHERE kind=? GROUP BY item").bind(k).all();
    out.ranks[k]=rk.results.filter(r=>V[k].has(r.item));
    const mine=await env.DB.prepare("SELECT item FROM submissions WHERE kind=? AND ip_hash=?").bind(k,h).all();
    out.mine[k]=mine.results.some(r=>V[k].has(r.item));
  }
  return out}
export default{
  async fetch(req,env){
    if(req.method==="OPTIONS")return json({},env);
    const url=new URL(req.url),ip=req.headers.get("CF-Connecting-IP")||"0.0.0.0",h=await ipHash(env,ip),V=await votable(env);
    if(url.pathname==="/state"&&req.method==="GET")return json(await state(env,V,h),env);
    if(url.pathname==="/vote"&&req.method==="POST"){
      let b;try{b=await req.json()}catch(e){return json({error:"bad_request"},env,400)}
      const k=b&&b.kind,item=b&&b.item;
      if(!(k==="lang"||k==="word")||typeof item!=="string")return json({error:"bad_request"},env,400);
      if(!V[k].has(item))return json({error:"not_votable"},env,409);
      const mine=await env.DB.prepare("SELECT item FROM submissions WHERE kind=? AND ip_hash=?").bind(k,h).all();
      if(mine.results.some(r=>V[k].has(r.item)))return json({error:"already"},env,429);
      // the visitor's older votes were for items that have since been added: forget them
      await env.DB.prepare("DELETE FROM submissions WHERE kind=? AND ip_hash=?").bind(k,h).run();
      const cf=req.cf||{},place=cf.country?cf.country+"|"+(cf.region||""):null;
      await env.DB.prepare("INSERT INTO submissions(kind,item,ip_hash,ts,place) VALUES(?,?,?,?,?)").bind(k,item,h,Date.now(),place).run();
      // keep time + place only for the newest 10 of this kind
      await env.DB.prepare("UPDATE submissions SET ts=NULL,place=NULL WHERE kind=? AND ts IS NOT NULL AND id NOT IN (SELECT id FROM submissions WHERE kind=? ORDER BY id DESC LIMIT 10)").bind(k,k).run();
      // drop rows of items that were added to the project meanwhile
      const items=await env.DB.prepare("SELECT DISTINCT item FROM submissions WHERE kind=?").bind(k).all();
      for(const r of items.results)if(!V[k].has(r.item))await env.DB.prepare("DELETE FROM submissions WHERE kind=? AND item=?").bind(k,r.item).run();
      return json({ok:true,...await state(env,V,h)},env);
    }
    return json({error:"not_found"},env,404);
  }
};
