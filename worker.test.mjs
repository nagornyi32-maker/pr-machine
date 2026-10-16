import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{storage} from './worker.mjs';
function database(){
 const sql=new DatabaseSync(':memory:');
 sql.exec(readFileSync(new URL('./migrations/0001_players.sql',import.meta.url),'utf8'));
 return {sql,prepare(query){return {bind(...args){
  const stmt=sql.prepare(query);
  return {
   async first(){return stmt.get(...args)||null;},
   async all(){return {results:stmt.all(...args)};},
   async run(){return {meta:{changes:Number(stmt.run(...args).changes)}};}
  };
 }};}};
}
test('Worker API and D1 SQL: cookies, CAS race protection, leaderboard privacy',async()=>{
 const db=database(),env={DB:db,ASSETS:{fetch:()=>new Response('asset')}};
 const req=(path,body,cookie)=>worker.fetch(new Request('https://game.example/api/'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json','Origin':'https://game.example'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined}),env);
 try{
  const joined=await req('join',{name:'Котик'});assert.equal(joined.status,200);assert.match(joined.headers.get('set-cookie'),/HttpOnly.*Secure/);const cookie=joined.headers.get('set-cookie').split(';')[0];
  const [a,b]=await Promise.all([req('spin',{score:999999},cookie),req('spin',{score:999999},cookie)]);assert.equal([a,b].filter(r=>r.status===200).length,1);assert.ok([a,b].some(r=>[409,429].includes(r.status)));
  const me=await (await req('me',null,cookie)).json();assert.equal(me.tickets,11);assert.equal(me.spins,1);
  const leaders=await (await req('leaderboard')).json();assert.equal(leaders.length,1);assert.equal(leaders[0].score,me.season.score);assert.equal(leaders[0].collection,undefined);assert.equal(leaders[0].key,undefined);
  const record=db.sql.prepare('SELECT * FROM players').get();assert.notEqual(record.session_hash,cookie.split('=')[1]);
  const store=storage(db),copy=await store.get(record.session_hash);copy.season.shards=100;copy.daily.spins=8;await store.put(record.session_hash,copy,copy.rev);
  const outcomes=await Promise.all([req('claim',{id:'warmup'},cookie),req('claim',{id:'warmup'},cookie)]);assert.equal(outcomes.filter(r=>r.status===200).length,1);assert.ok(outcomes.some(r=>[400,409].includes(r.status)));
  const after=await (await req('me',null,cookie)).json();assert.equal(after.season.score,me.season.score+40);
  const stale=await store.get(record.session_hash);assert.equal(await store.put(record.session_hash,stale,stale.rev),true);assert.equal(await store.put(record.session_hash,stale,stale.rev),false);
  const missing=(await (await req('catalog')).json()).prizes.find(p=>p.craftCost&&!after.season.collection[p.id]);const crafted=await req('craft',{id:missing.id},cookie);assert.equal(crafted.status,200);assert.equal((await crafted.json()).gained,40);
  assert.equal((await worker.fetch(new Request('https://game.example/'),env)).status,200);
 }finally{db.sql.close();}
});
