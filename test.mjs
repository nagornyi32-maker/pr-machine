import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('registration, authoritative scores, cooldown, persistence',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pr-test-'));let proc;
 async function start(){proc=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:'3199',DATA_DIR:dir}});await new Promise((resolve,reject)=>{proc.stdout.once('data',resolve);proc.once('error',reject);proc.once('exit',code=>reject(Error('Server exited '+code)));});}
 async function stop(){const p=proc;await new Promise(r=>{p.once('exit',r);p.kill();});proc=null;}
 const request=(path,body,cookie)=>fetch('http://localhost:3199/api/'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined});
 try{await start();assert.equal((await request('spin',{})).status,401);assert.equal((await request('join',{name:'x'})).status,400);
 const joined=await request('join',{name:'Тестовый креатор'});assert.equal(joined.status,200);const cookie=joined.headers.get('set-cookie').split(';')[0];
 const spin=await request('spin',{score:999999},cookie);const result=await spin.json();assert.equal(spin.status,200);assert.equal(result.player.score,result.prize.points+40);assert.equal(result.player.season.score,result.gained);assert.equal(result.player.tickets,11);assert.equal(result.player.spins,1);
 assert.equal((await request('spin',{},cookie)).status,429);const list=await (await request('leaderboard')).json();assert.equal(list.length,1);assert.equal(list[0].token,undefined);
 const hostile=await fetch('http://localhost:3199/api/join',{method:'POST',headers:{Origin:'https://evil.invalid','Content-Type':'application/json'},body:JSON.stringify({name:'Bad'})});assert.equal(hostile.status,403);
 await stop();await start();const saved=await (await request('me',null,cookie)).json();assert.equal(saved.score,result.prize.points+40);assert.equal(saved.collection[result.prize.id],1);assert.equal(saved.tickets,11);
 }finally{if(proc)await stop();await rm(dir,{recursive:true,force:true});}
});
