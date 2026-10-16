/* Original code-drawn collectible figurines. Individual palettes, block silhouettes,
   depth and recognizable props keep each friend readable at small sizes. */
(() => {
 const cache=new Map();
 const shade=(hex,n)=>'#'+hex.match(/\w\w/g).map(x=>Math.min(255,Math.max(0,parseInt(x,16)+n)).toString(16).padStart(2,'0')).join('');
 function paint(ctx,item){
  const cream='#fff1d9',ink='#342c42',pink='#f291ae',gold='#efbb5d',mint='#a9dcb6';
  const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  const block=(x,y,w,h,color,d=7)=>{poly([[x,y],[x+d,y-d],[x+w+d,y-d],[x+w,y]],shade(color,22));poly([[x+w,y],[x+w+d,y-d],[x+w+d,y+h-d],[x+w,y+h]],shade(color,-27));rect(x,y,w,h,color);rect(x+3,y+3,w-6,3,shade(color,12));};
  const body=(x,y,w,h,c)=>{block(x+8,y,w-16,h,c);block(x,y+10,w,h-20,c);};
  const eye=(x,y)=>{rect(x,y,7,11,ink);rect(x+1,y+1,2,3,'#ffffff');};
  const face=(x,y,gap=32)=>{eye(x,y);eye(x+gap,y);rect(x-7,y+13,9,5,pink);rect(x+gap+5,y+13,9,5,pink);rect(x+gap/2-2,y+15,6,3,ink);rect(x+gap/2,y+18,3,2,ink);};
  const ears=(x,y,color)=>{block(x,y,20,24,color);block(x+68,y,20,24,color);rect(x+5,y+6,9,12,pink);rect(x+73,y+6,9,12,pink);};
  const star=(x,y,s=1,color=gold)=>{ctx.save();ctx.translate(x,y);ctx.scale(s,s);poly([[0,-18],[5,-6],[18,-6],[9,3],[12,17],[0,10],[-12,17],[-9,3],[-18,-6],[-5,-6]],shade(color,-25));poly([[0,-22],[5,-10],[18,-10],[9,-1],[12,13],[0,6],[-12,13],[-9,-1],[-18,-10],[-5,-10]],color);ctx.restore();};
  const paws=(color)=>{block(100,176,25,15,color);block(151,176,25,15,color);};
  const coins=(x,y)=>{for(let i=0;i<3;i++){block(x,y-i*8,30,7,gold,5);rect(x+9,y-i*8+1,12,2,'#ffe7a1');}};
  const note=(x,y,w=48,h=50)=>{block(x,y,w,h,cream,5);for(let i=0;i<3;i++)rect(x+9,y+14+i*9,w-18,3,'#aa9aba');};
  const wings=()=>{poly([[102,114],[67,90],[53,100],[60,131],[82,152],[111,149]],'#eee5ff');poly([[174,114],[207,90],[220,100],[211,131],[190,152],[165,149]],'#d6c5f1');rect(65,112,24,5,'#ffffff');rect(187,112,22,5,'#f9efff');};
  ctx.clearRect(0,0,280,240);
  const glow=ctx.createRadialGradient(140,120,15,140,120,110);glow.addColorStop(0,item.color+'1d');glow.addColorStop(1,item.color+'00');ctx.fillStyle=glow;ctx.fillRect(0,0,280,240);
  ctx.fillStyle='#09061145';ctx.beginPath();ctx.ellipse(141,207,65,10,0,0,Math.PI*2);ctx.fill();
  switch(item.icon){
   case 'catcup':
    rect(105,43,5,18,'#e5d1eb');rect(111,28,5,15,'#e5d1eb');rect(146,35,5,17,'#e5d1eb');
    block(183,108,31,50,'#c4a7df');rect(184,120,19,25,'#2b2035');
    ears(94,75,cream);body(90,91,102,58,cream);face(113,111,37);
    body(82,137,116,57,'#c5afe7');rect(94,139,91,7,'#e3d1f8');rect(121,161,32,18,cream);rect(132,167,9,7,pink);break;
   case 'cloud':
    body(69,98,142,68,'#e5e6fa');body(95,69,61,55,'#f3f1ff');body(145,85,44,45,'#e5e6fa');face(109,124,43);
    block(164,181,16,12,'#cbc5e5');block(185,197,10,8,'#b9b0d5');rect(88,175,59,4,'#d0b8e6');break;
   case 'cactus':
    block(113,65,40,100,'#8ccba6');block(78,99,24,44,'#a3dbb4');block(95,128,28,17,'#8ccba6');block(163,83,23,45,'#78b998');block(148,114,30,17,'#8ccba6');face(121,101,18);
    body(96,151,78,45,'#e6a3ad');block(89,148,92,14,'#f4bac4');rect(119,177,31,4,'#fff1db');star(149,57,.48,pink);break;
   case 'capy':
    body(91,116,88,71,'#b68a68');ears(89,71,'#c69d76');body(84,88,111,69,'#cca580');body(116,121,83,35,'#e8c7a0');eye(105,109);eye(160,110);rect(174,132,9,6,'#755844');rect(132,140,18,3,'#9d7458');paws('#bc946f');
    block(57,154,43,34,'#9387bd');rect(67,147,23,7,'#b5a7d1');rect(73,168,8,7,gold);break;
   case 'pillow':
    body(78,81,121,101,'#b7d6cf');rect(91,92,94,3,'#e7f4df');rect(91,167,94,3,'#91b8b1');face(104,123,43);
    block(174,63,30,33,'#83bd9d');poly([[180,79],[186,85],[198,70],[201,74],[186,91],[177,83]],cream);break;
   case 'dragon':
    poly([[96,126],[60,87],[62,137],[93,161]],'#b6a7e1');poly([[174,126],[210,87],[208,137],[178,161]],'#9983c6');block(99,75,16,25,cream);block(164,75,16,25,cream);
    body(94,118,84,67,'#b0cdbb');body(86,88,100,67,'#b9ddc6');face(106,113,42);body(111,152,52,29,'#e3edcd');paws('#9bbba8');star(205,165,.5,pink);break;
   case 'penguin':
    body(94,67,87,123,'#687b97');body(106,111,63,66,cream);rect(81,130,15,39,'#566a86');rect(180,130,15,39,'#566a86');face(113,100,36);poly([[131,118],[143,118],[137,126]],gold);paws(gold);
    block(121,148,42,29,'#c8b8ee');poly([[122,149],[142,162],[161,149]],'#f4deec');break;
   case 'bunny':
    block(101,41,23,57,cream);block(151,41,23,57,cream);rect(107,49,10,37,pink);rect(157,49,10,37,pink);body(89,91,99,72,cream);face(112,112,40);body(102,151,72,35,'#e8cada');paws(cream);
    block(180,130,13,59,'#756a8c');body(173,110,27,27,'#a8bad0');rect(178,116,19,3,'#dce5f5');break;
   case 'letter':
    block(73,88,134,91,'#b1cff2');poly([[74,90],[139,134],[205,90]],'#e1eafc');poly([[73,178],[119,135],[138,149],[158,135],[207,178]],'#c6dafa');
    face(109,137,47);star(195,69,.52,gold);break;
   case 'fox':
    poly([[172,159],[219,133],[222,161],[201,189],[169,184]],'#efaa6e');poly([[205,141],[219,133],[222,161],[212,173],[200,164]],cream);
    block(95,72,23,32,'#e9a16a');block(156,72,23,32,'#e9a16a');rect(102,80,9,15,cream);rect(162,80,9,15,cream);body(87,97,104,65,'#f0ae7a');
    poly([[88,126],[119,128],[137,144],[156,128],[190,126],[179,164],[100,164]],cream);eye(108,119);eye(158,119);rect(135,140,8,7,ink);body(107,162,62,22,'#e99d63');paws('#eeaf7e');break;
   case 'star':
    block(91,59,94,134,'#a2b6d7',10);rect(100,67,76,116,cream);rect(107,78,62,15,'#576480');ctx.fillStyle=cream;ctx.font='bold 11px sans-serif';ctx.fillText('COVER',117,90);star(138,126,1.25,gold);rect(107,164,43,4,'#a9afbc');rect(107,173,60,3,'#c3c6cf');break;
   case 'owl':
    ears(94,71,'#b2a0c7');body(87,90,108,98,'#bba9cb');body(99,114,80,66,'#e4d7e5');rect(78,132,15,41,'#9d88b6');rect(190,132,15,41,'#9d88b6');
    body(99,111,35,32,cream);body(148,111,35,32,cream);eye(113,119);eye(158,119);rect(132,123,17,5,ink);poly([[135,140],[147,140],[141,149]],gold);paws(gold);break;
   case 'bulb':
    body(94,68,90,84,'#f4d883');body(109,143,61,25,'#ffe4a1');face(112,109,37);block(113,164,51,21,'#aaa5c6');rect(115,171,45,4,'#ded7ef');block(124,186,28,8,'#76688d');
    rect(135,38,6,16,gold);rect(61,96,16,6,gold);rect(205,96,16,6,gold);star(197,58,.4,gold);break;
   case 'frog':
    note(85,107,109,84);rect(169,165,25,26,'#e7cc8f');block(96,76,33,31,'#9ace9d');block(149,76,33,31,'#9ace9d');body(85,94,110,64,'#a9d8a6');eye(109,86);eye(162,86);rect(99,120,12,6,pink);rect(168,120,12,6,pink);rect(119,130,42,4,'#537d5d');break;
   case 'donut':
    body(81,75,118,114,'#d3a379');body(85,77,110,95,'#f4acca');rect(121,110,40,43,'#302337');rect(116,116,50,29,'#302337');rect(124,110,34,6,'#9a6c60');
    for(const [x,y,c] of [[102,97,'#f7e29d'],[163,96,'#b3dcf2'],[92,132,'#c4b2ed'],[169,143,'#f7e29d'],[113,162,'#b8ddc4']])rect(x,y,12,4,c);eye(106,138);eye(164,138);rect(132,164,15,3,'#a4597f');break;
   case 'unicorn':
    poly([[125,85],[138,35],[151,85]],gold);rect(135,52,7,19,'#fff0ad');ears(92,75,cream);body(87,92,106,83,cream);block(174,98,22,88,'#c6afe8');block(182,133,19,41,'#b9caed');face(110,121,40);body(113,148,57,30,'#f3d1d9');rect(125,160,5,5,'#bd8b9e');rect(153,160,5,5,'#bd8b9e');break;
   case 'rocket':
    poly([[104,150],[78,186],[103,186],[118,163]],'#a493cc');poly([[172,150],[198,186],[173,186],[158,163]],'#8c7aba');poly([[112,182],[124,219],[139,201],[150,219],[164,182]],'#efbd71');
    block(107,94,62,90,cream);poly([[107,94],[138,51],[169,94]],'#f0a5c7');block(116,108,44,39,'#8bafd1');rect(122,113,32,28,'#b8def2');face(123,121,20);rect(117,166,42,6,'#b4a2d0');break;
   case 'cat':
    ears(93,80,'#e2d3be');body(86,101,108,74,'#f2e6d4');face(111,123,42);body(105,169,67,18,'#b6abdf');paws('#e2d3be');block(91,77,89,17,'#b5a3d7');block(111,65,58,15,'#c5b4e5');rect(142,57,7,8,'#8f7bb3');star(206,103,.75,gold);break;
   case 'bear':
    ears(92,72,'#c99d7a');body(87,94,107,86,'#d6af8d');face(110,115,43);body(120,137,37,23,cream);rect(135,144,10,5,'#8b6652');paws('#c99d7a');note(152,151,46,40);rect(165,146,20,9,'#a3b3c3');break;
   case 'heart':
    poly([[78,105],[78,86],[96,71],[120,71],[140,88],[160,71],[184,71],[203,90],[203,116],[140,184],[78,120]],'#d479a4');poly([[72,99],[72,80],[90,65],[114,65],[134,82],[154,65],[178,65],[197,84],[197,110],[134,178],[72,114]],'#f4a8c6');face(103,108,52);rect(87,82,20,5,'#ffccde');break;
   case 'hamster':
    ears(93,76,'#e3ba86');body(87,97,106,88,'#efcb98');body(98,137,84,41,cream);face(109,116,43);rect(94,136,20,11,pink);rect(166,136,20,11,pink);paws('#d5ac7b');coins(181,193);coins(65,188);break;
   case 'trophy':
    block(67,90,35,48,gold);rect(77,99,22,26,'#2c2236');block(177,90,35,48,gold);rect(179,99,22,26,'#2c2236');body(94,73,91,80,'#f5cd79');block(123,152,30,27,'#d8a552');block(105,180,67,14,'#c0a2d4');rect(120,184,35,5,cream);face(112,106,40);star(139,72,.5,cream);break;
   case 'angel':
    wings();note(101,90,76,104);rect(118,106,43,5,'#b0a6c3');face(118,132,32);rect(121,170,36,4,'#b0a6c3');rect(115,58,49,6,gold);rect(109,64,6,11,gold);rect(164,64,6,11,gold);rect(115,75,49,5,gold);break;
   case 'crown':
    body(92,116,93,66,'#c6b0e1');ears(91,82,cream);body(86,103,108,69,cream);face(111,128,42);paws('#e6d5b9');poly([[98,99],[91,54],[116,73],[138,43],[160,73],[184,54],[176,99]],gold);rect(99,88,77,12,'#f6d68b');rect(133,77,10,12,pink);rect(107,80,6,6,'#aebce9');rect(163,80,6,6,'#aebce9');break;
  }
  if(item.tier>=4){star(224,62,.32,item.color);star(63,157,.23,item.color);}
 }
 window.drawTrophy=(canvas,item)=>{
  let sprite=cache.get(item.id);if(!sprite){sprite=document.createElement('canvas');sprite.width=560;sprite.height=480;const c=sprite.getContext('2d');c.scale(2,2);paint(c,item);cache.set(item.id,sprite);}
  const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/280,canvas.height/240);c.drawImage(sprite,(canvas.width-280*scale)/2,(canvas.height-240*scale)/2,280*scale,240*scale);
 };
})();
