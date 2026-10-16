import http from 'node:http';
import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {handleApi} from './api.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const dir=process.env.DATA_DIR||join(root,'data');mkdirSync(dir,{recursive:true});
const file=join(dir,'players.json');
const db=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{players:[]};
for(const p of db.players){if(p.token){p.key=createHash('sha256').update(p.token).digest('hex');delete p.token;}p.rev??=0;}
function save(){writeFileSync(file+'.tmp',JSON.stringify(db));renameSync(file+'.tmp',file);}
const store={
 async get(key){return db.players.find(x=>x.key===key)||null;},
 async create(key,p){if(db.players.length>=10000)throw Error('Player capacity reached');db.players.push({...p,key});save();},
 async put(key,p,rev){const i=db.players.findIndex(x=>x.key===key);if(i<0||db.players[i].rev!==rev)return false;db.players[i]={...p,key,rev:rev+1};save();return true;},
 async leaders(season){return db.players.filter(p=>p.season?.key===season&&p.season.score>0).sort((a,b)=>b.season.score-a.season.score||a.created-b.created).slice(0,50).map(p=>({id:p.id,name:p.name,score:p.season.score,found:Object.keys(p.season.collection).length,sets:p.season.sets.length}));},
};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(req,res)=>{try{
 const origin=process.env.PUBLIC_ORIGIN||`http://${req.headers.host}`;
 const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
  const controller=new AbortController();req.on('aborted',()=>controller.abort());
  const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{}),signal:controller.signal});
  const response=await handleApi(request,store,{secure:process.env.COOKIE_SECURE==='1'});
  res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));
 }
 if(req.method==='GET'&&['/','/index.html','/app.js','/trophies.js','/style.css'].includes(url.pathname)){
  const name=url.pathname==='/'?'index.html':url.pathname.slice(1),ext=name.slice(name.lastIndexOf('.'));
  res.writeHead(200,{'Content-Type':mime[ext]+'; charset=utf-8','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"});return res.end(readFileSync(join(root,'public',name)));
 }
 res.writeHead(404);res.end('Not found');
}catch(e){console.error(e.message);res.writeHead(500);res.end('Server error');}});
server.listen(process.env.PORT||3000,process.env.HOST||'127.0.0.1',()=>console.log(`PR MACHINE: http://localhost:${process.env.PORT||3000}`));
