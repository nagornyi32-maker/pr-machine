import {handleApi} from './api.mjs';
export function storage(db){return {
 async get(key){const row=await db.prepare('SELECT state, revision FROM players WHERE session_hash = ?').bind(key).first();return row?{...JSON.parse(row.state),rev:row.revision}:null;},
 async create(key,p){await db.prepare('INSERT INTO players (session_hash,id,name,season,score,created,state,revision) VALUES (?,?,?,?,?,?,?,0)').bind(key,p.id,p.name,p.season.key,p.season.score,p.created,JSON.stringify(p)).run();},
 async put(key,p,rev){const r=await db.prepare('UPDATE players SET name=?,season=?,score=?,state=?,revision=revision+1 WHERE session_hash=? AND revision=?').bind(p.name,p.season.key,p.season.score,JSON.stringify(p),key,rev).run();return r.meta.changes===1;},
 async leaders(season){const {results}=await db.prepare('SELECT id,name,score,state FROM players WHERE season=? AND score>0 ORDER BY score DESC,created ASC LIMIT 50').bind(season).all();return results.map(r=>{const p=JSON.parse(r.state);return {id:r.id,name:r.name,score:r.score,found:Object.keys(p.season.collection).length,sets:p.season.sets.length};});},
};}
export default {async fetch(request,env){
 if(new URL(request.url).pathname.startsWith('/api/'))return handleApi(request,storage(env.DB),{secure:new URL(request.url).protocol==='https:'});
 return env.ASSETS.fetch(request);
}};
