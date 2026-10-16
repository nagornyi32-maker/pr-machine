import {prizes,rules,calendar,profile,syncPlayer,spin,claim,craft,GameError} from './game.mjs';
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
export async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
function random(max){const limit=0x100000000-(0x100000000%max);let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%max;}
export async function handleApi(request,store,{secure=false}={}){
 try{
  const url=new URL(request.url),path=url.pathname;
  if(request.method==='GET'&&path==='/api/catalog')return json({prizes,rules,calendar:calendar()});
  if(request.method==='GET'&&path==='/api/leaderboard')return json(await store.leaders(calendar().season));
  const raw=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('pr_session='))?.slice(11);
  const key=raw&&/^[a-f0-9]{64}$/.test(raw)?await hash(raw):null;
  const saved=key?await store.get(key):null;
  const p=saved?structuredClone(saved):null;
  if(request.method==='GET'&&path==='/api/me')return json(p?profile(p):null);
  if(request.method!=='POST')return json({error:'Не найдено'},404);
  const origin=request.headers.get('Origin');
  if(origin&&origin!==url.origin)return json({error:'Недопустимый источник'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Ожидается JSON'},415);
  if(Number(request.headers.get('Content-Length')||0)>4096)return json({error:'Слишком большой запрос'},413);
  const reader=request.body?.getReader();let chunks=[],length=0;
  if(reader){while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>4096){await reader.cancel();return json({error:'Слишком большой запрос'},413);}chunks.push(value);}}
  const bytes=new Uint8Array(length);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.length;}
  let b;try{b=JSON.parse(new TextDecoder().decode(bytes)||'{}');}catch{return json({error:'Некорректный JSON'},400);}
  if(!b||typeof b!=='object'||Array.isArray(b))return json({error:'Некорректный запрос'},400);
  if(path==='/api/join'){
   const name=typeof b.name==='string'?b.name.trim():'';
   if(name.length<2||name.length>20||/[\p{C}<>]/u.test(name))return json({error:'Имя: от 2 до 20 символов, без специальных знаков.'},400);
   if(p){p.name=name;syncPlayer(p);if(!await store.put(key,p,saved.rev))throw new GameError('Профиль обновился в другой вкладке. Попробуй ещё раз.',409);return json(profile(p));}
   const secret=token();const user={id:crypto.randomUUID(),name,score:0,spins:0,collection:{},created:Date.now(),last:0,rev:0};syncPlayer(user);
   await store.create(await hash(secret),user);
   return json(profile(user),200,{'Set-Cookie':`pr_session=${secret}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${secure?'; Secure':''}`});
  }
  if(!p)throw new GameError('Сначала введи имя',401);
  let result;
  if(path==='/api/spin')result=spin(p,random,Date.now(),b.mode==='practice');
  else if(path==='/api/claim')result=claim(p,b.id);
  else if(path==='/api/craft')result=craft(p,b.id);
  else return json({error:'Не найдено'},404);
  if(!await store.put(key,p,saved.rev))throw new GameError('Действие уже выполнено в другой вкладке. Обнови профиль.',409);
  return json({...result,player:profile(p)});
 }catch(e){if(!(e instanceof GameError))console.error(e.message);return json({error:e instanceof GameError?e.message:'Сервер временно недоступен. Попробуй ещё раз.'},e.status||503);}
}
