// Shared authoritative rules for the local Node server and Cloudflare Worker.
export const DAILY_SPINS = 12;
export const PITY_AT = 12;
export const SET_BONUS = 500;
export const NEW_BONUS = 40;
export const families = [
  {id:'cozy',name:'Уютный офис',icon:'☕'},
  {id:'media',name:'Медиа-зверята',icon:'✉'},
  {id:'creative',name:'Креативный отдел',icon:'✦'},
  {id:'dream',name:'Большой кейс',icon:'♛'},
];
const levels = [
  ['Обычный','#a8c4cd',10,800,2,6], ['Обычный','#b2d5ca',10,700,2,6],
  ['Редкий','#8ccfff',35,600,3,12], ['Эпический','#c6a2ff',80,280,5,24],
  ['Легендарный','#ffd196',180,100,8,null], ['Мифический','#ff9dd3',500,20,15,null],
];
const entries = [
 ['coffee','Кофейный котик','Мурчит, пока ты дописываешь бриф.','catcup'],
 ['edits','Облачко правочек','Всего одна малюсенькая правочка. И обнимашка.','cloud'],
 ['cactus','Кактус дедлайнов','Колючий только с теми, кто забыл про сроки.','cactus'],
 ['capy','Капибара-аккаунт','У клиента паника. У капибары — план.','capy'],
 ['pillow','Подушка «Согласовано»','Можно выдохнуть. Сегодня всё получилось.','pillow'],
 ['friday','Дракончик пятницы','Закрыл все таски и охраняет твои выходные.','dragon'],
 ['mail','Почтовый пингвин','Письмо дошло. И даже не в спам.','penguin'],
 ['mic','Микрофон-зайка','Даст слово даже самому тихому эксперту.','bunny'],
 ['release','Релиз без правок','Маленькое письмо с очень большим сердцем.','letter'],
 ['viral','Вирусный лисёнок','Утащил твой инфоповод во все ленты.','fox'],
 ['cover','Обложка Forbes','Звёздочка твоего экспертного комментария.','star'],
 ['owl','Сова главреда','Она не спит: она выбирает тебя на обложку.','owl'],
 ['idea','Лампочка Пикси','Зажигается, когда все уже устали думать.','bulb'],
 ['sticker','Стикер-лягушонок','Ква-ква-креатив! Приклеится к твоему сердцу.','frog'],
 ['donut','Пончик брейншторма','Внутри пустота. Снаружи — гениальные идеи.','donut'],
 ['unicorn','Единорог концепции','Такого точно никто ещё не делал. Почти.','unicorn'],
 ['rocket','Ракета охватов','Маленькие крылышки. Очень большие цифры.','rocket'],
 ['muse','Муза-котёнок','Приходит не по расписанию. Остаётся в коллекции.','cat'],
 ['brief','Бриф-медвежонок','Всё понятно, всё по делу. И мягкие лапки.','bear'],
 ['heart','Сердечко клиента','«Коллеги, это именно то, что мы хотели!»','heart'],
 ['budget','Бюджетный хомячок','Припрятал ещё немного на продакшен.','hamster'],
 ['trophy','Кубок с ушками','Награда за идею, в которую ты верил.','trophy'],
 ['contract','Договор-ангелочек','Без правок юристов. С крылышками.','angel'],
 ['client','Клиент мечты','Кот-король. Доверяет, платит и присылает сердечки.','crown'],
];
export const prizes=entries.map(([id,name,desc,icon],i)=>{const [rarity,color,points,weight,dust,craftCost]=levels[i%6];return {id,name,desc,icon,rarity,color,points,weight, chance:weight/100,tier:Math.max(1,i%6),dust,craftCost,family:families[Math.floor(i/6)].id};});
export function calendar(now=Date.now()) {
  const shifted=new Date(now+3*3600000);
  const day=shifted.toISOString().slice(0,10);
  shifted.setUTCHours(0,0,0,0);
  const nextDay=shifted.getTime()+86400000-3*3600000;
  shifted.setUTCDate(shifted.getUTCDate()-((shifted.getUTCDay()+6)%7));
  return {day,season:shifted.toISOString().slice(0,10),ends:shifted.getTime()+7*86400000-3*3600000,nextDay};
}
export function syncPlayer(p,now=Date.now()) {
  const c=calendar(now);
  p.collection??={};p.score??=0;p.spins??=0;
  if(p.season?.key!==c.season){
    if(p.season)p.previousSeason={key:p.season.key,score:p.season.score,found:Object.keys(p.season.collection).length};
    p.season={key:c.season,score:0,collection:{},shards:0,pity:0,sets:[],spins:0};
  }
  if(p.daily?.key!==c.day)p.daily={key:c.day,spins:0,families:[],claimed:[]};
  return p;
}
export function quests(p) {return [
  {id:'warmup',title:'Разбуди агентство',text:'Сделай 3 зачётные крутки',progress:Math.min(p.daily.spins,3),target:3,reward:40},
  {id:'shift',title:'Креативная смена',text:'Сделай 8 зачётных круток',progress:Math.min(p.daily.spins,8),target:8,reward:80},
  {id:'departments',title:'На одной волне',text:'Найди предметы из 3 отделов за день',progress:Math.min(p.daily.families.length,3),target:3,reward:100},
].map(q=>({...q,claimed:p.daily.claimed.includes(q.id)}));}
export function profile(p,now=Date.now()){
  syncPlayer(p,now);const c=calendar(now);
  return {id:p.id,name:p.name,score:p.score,spins:p.spins,collection:p.collection,season:p.season,previousSeason:p.previousSeason||null,daily:p.daily,quests:quests(p),tickets:DAILY_SPINS-p.daily.spins,calendar:c};
}
export class GameError extends Error {constructor(message,status=400){super(message);this.status=status;}}
export function choosePrize(p,random){const guaranteed=p.season.pity>=PITY_AT-1;const pool=guaranteed?prizes.filter(x=>x.tier>=3):prizes;let n=random(pool.reduce((s,x)=>s+x.weight,0));for(const x of pool){n-=x.weight;if(n<0)return {prize:x,guaranteed};}throw Error('Invalid random value');}
function collect(p,prize,base){
 const s=p.season;const isNew=!s.collection[prize.id];const bonuses=[];let gained=base;
 s.collection[prize.id]=(s.collection[prize.id]||0)+1;p.collection[prize.id]=(p.collection[prize.id]||0)+1;
 if(isNew){gained+=NEW_BONUS;bonuses.push({label:'Новая находка сезона',points:NEW_BONUS});}
 else s.shards+=prize.dust;
 const complete=prizes.filter(x=>x.family===prize.family).every(x=>s.collection[x.id]);
 if(complete&&!s.sets.includes(prize.family)){s.sets.push(prize.family);gained+=SET_BONUS;bonuses.push({label:'Полный набор: '+families.find(f=>f.id===prize.family).name,points:SET_BONUS});}
 s.score+=gained;p.score+=gained;return {isNew,bonuses,gained,dust:isNew?0:prize.dust};
}
export function spin(p,random,now=Date.now(),practice=false){
 syncPlayer(p,now);
 if(now-(p.last||0)<4200)throw new GameError('Машина ещё крутится. Подожди пару секунд.',429);
 if(!practice&&p.daily.spins>=DAILY_SPINS)throw new GameError('На сегодня все 12 зачётных круток использованы. Попробуй тренировку!',409);
 const roll=choosePrize(practice?{season:{pity:0}}:p,random);p.last=now;
 if(practice)return {...roll,practice:true,gained:0,isNew:false,bonuses:[],dust:0};
 p.spins++;p.season.spins++;p.daily.spins++;
 p.season.pity=roll.prize.tier>=3?0:p.season.pity+1;
 if(!p.daily.families.includes(roll.prize.family))p.daily.families.push(roll.prize.family);
 return {...roll,...collect(p,roll.prize,roll.prize.points),practice:false};
}
export function claim(p,id,now=Date.now()){
 syncPlayer(p,now);const q=quests(p).find(x=>x.id===id);
 if(!q||q.claimed||q.progress<q.target)throw new GameError('Это задание ещё не выполнено или награда уже получена.');
 p.daily.claimed.push(id);p.season.score+=q.reward;p.score+=q.reward;return {reward:q.reward};
}
export function craft(p,id,now=Date.now()){
 syncPlayer(p,now);const prize=prizes.find(x=>x.id===id);
 if(!prize?.craftCost)throw new GameError('Этот предмет можно найти только в рулетке.');
 if(p.season.collection[id])throw new GameError('Этот предмет уже есть в коллекции сезона.');
 if(p.season.shards<prize.craftCost)throw new GameError('Пока не хватает искр. Их приносят дубликаты.');
 p.season.shards-=prize.craftCost;
 return {prize,...collect(p,prize,0),crafted:true};
}
export const rules={dailySpins:DAILY_SPINS,pityAt:PITY_AT,setBonus:SET_BONUS,newBonus:NEW_BONUS,families};
