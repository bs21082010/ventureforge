import { getModel, chatCompletion, isApiKeySet, checkOllama } from "@/lib/ai/openai-client";

export interface GameRequest {
  prompt: string;
  genre?: string;
  platform?: "html5" | "phaser";
}

export interface GameResult {
  html: string;
  title: string;
  description: string;
  instructions: string;
}

function generateGameLocal(request: GameRequest): GameResult {
  const p = request.prompt.toLowerCase();
  const isRacing = p.includes("race") || p.includes("car") || p.includes("drive") || p.includes("speed");
  const isShooter = p.includes("shoot") || p.includes("space") || p.includes("alien") || p.includes("bullet");
  const isPuzzle = p.includes("puzzle") || p.includes("match") || p.includes("tile") || p.includes("2048");
  const isSnake = p.includes("snake") || p.includes("worm") || p.includes("grow");
  const isPong = p.includes("pong") || p.includes("tennis") || p.includes("bounce") || p.includes("paddle");

  let title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Arcade Blast";
  let description = "An exciting HTML5 arcade game";
  let instructions = "Use arrow keys or mouse to play";

  if (isRacing) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Turbo Rush";
    description = "Race against the clock on a winding road. Dodge traffic and set the high score.";
    instructions = "Use LEFT/RIGHT arrows to steer. Avoid other cars. Survive as long as you can!";
    return {
      title,
      description,
      instructions,
      html: `<!DOCTYPE html><html><head><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;overflow:hidden}
canvas{border:2px solid #ff6b35;border-radius:8px;background:#1a1a2e}
#ui{position:absolute;top:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:18px;font-family:monospace;z-index:10}
</style></head><body>
<div id="ui">Score: <span id="score">0</span> | High: <span id="high">0</span></div>
<canvas id="g" width="400" height="600"></canvas>
<script>
const c=document.getElementById('g'),ctx=c.getContext('2d'),scoreEl=document.getElementById('score'),highEl=document.getElementById('high');
let player={x:180,w:40,h:60,y:500};
let road={x:50,w:300,lines:[]};
let obstacles=[],score=0,high=parseInt(localStorage.getItem('raceHigh')||'0'),gameOver=false,speed=3;
highEl.textContent=high;
for(let i=0;i<6;i++)road.lines.push({y:i*100});
let keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(gameOver&&e.key===' '){restart()}});
document.addEventListener('keyup',e=>keys[e.key]=false);
function restart(){gameOver=false;score=0;speed=3;obstacles=[];player.x=180}
function update(){
if(gameOver){ctx.fillStyle='#ff6b35';ctx.font='36px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',200,280);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Press SPACE to restart',200,340);return}
if(keys['ArrowLeft']&&player.x>road.x)player.x-=5;
if(keys['ArrowRight']&&player.x<road.x+road.w-player.w)player.x+=5;
road.lines.forEach(l=>{l.y+=speed;if(l.y>600)l.y=-100});
ctx.fillStyle='#2a2a3e';ctx.fillRect(road.x,0,road.w,600);
ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.setLineDash([20,20]);
ctx.strokeRect(road.x,0,road.w,600);
ctx.setLineDash([]);
road.lines.forEach(l=>{ctx.fillStyle='#fff';ctx.fillRect(road.x+road.w/2-2,l.y,4,40)});
if(score%50===0&&score>0)speed=Math.min(speed+0.2,8);
if(Math.random()<0.02){let w=40+Math.random()*30;obstacles.push({x:road.x+20+Math.random()*(road.w-w-40),y:-60,w,h:60+Math.random()*40})}
obstacles=obstacles.filter(o=>o.y<650);
obstacles.forEach(o=>{o.y+=speed;ctx.fillStyle='#ff4444';ctx.shadowBlur=10;ctx.shadowColor='#ff4444';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.shadowBlur=0});
ctx.fillStyle='#4fc3f7';ctx.shadowBlur=15;ctx.shadowColor='#4fc3f7';ctx.fillRect(player.x,player.y,player.w,player.h);ctx.shadowBlur=0;
obstacles.forEach(o=>{if(player.x<o.x+o.w&&player.x+player.w>o.x&&player.y<o.y+o.h&&player.y+player.h>o.y)gameOver=true});
score++;scoreEl.textContent=score;
if(score>high){high=score;localStorage.setItem('raceHigh',high);highEl.textContent=high}
requestAnimationFrame(update)
}
update()
</script></body></html>`,
    };
  }

  if (isShooter) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Space Defender";
    description = "Blast incoming aliens before they reach you. Survive the endless assault.";
    instructions = "Move with LEFT/RIGHT arrows. Shoot with SPACE. Don't let aliens pass!";
    return {
      title,
      description,
      instructions,
      html: `<!DOCTYPE html><html><head><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
canvas{border:2px solid #00ff88;border-radius:8px;background:#0d0d1a}
</style></head><body>
<canvas id="g" width="600" height="500"></canvas>
<script>
const c=document.getElementById('g'),ctx=c.getContext('2d');
let ship={x:270,w:60,y:430,h:40};
let bullets=[],enemies=[],score=0,gameOver=false;
let keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' '&&!gameOver)bullets.push({x:ship.x+ship.w/2-3,y:ship.y-10,w:6,h:15});if(gameOver&&e.key===' '){restart()}});
document.addEventListener('keyup',e=>keys[e.key]=false);
function restart(){gameOver=false;score=0;enemies=[];bullets=[]}
setInterval(()=>{if(!gameOver){let ex=Math.random()*540;enemies.push({x:ex,y:-30,w:40+Math.random()*20,h:30+Math.random()*20,speed:1+Math.random()*2})}},800);
function update(){
if(gameOver){ctx.fillStyle='#00ff88';ctx.font='36px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',300,240);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Score: '+score,300,290);ctx.fillText('Press SPACE to restart',300,330);return}
if(keys['ArrowLeft']&&ship.x>0)ship.x-=6;
if(keys['ArrowRight']&&ship.x<540)ship.x+=6;
bullets=bullets.filter(b=>b.y>-20);
bullets.forEach(b=>b.y-=7);
enemies.forEach(e=>{e.y+=e.speed});
enemies=enemies.filter(e=>e.y<520);
bullets.forEach((b,bi)=>{enemies.forEach((e,ei)=>{if(b.x<e.x+e.w&&b.x+b.w>e.x&&b.y<e.y+e.h&&b.y+b.h>e.y){bullets.splice(bi,1);enemies.splice(ei,1);score+=10}})});
enemies.forEach(e=>{if(e.y+e.h>ship.y&&e.x<ship.x+ship.w&&e.x+e.w>ship.x)gameOver=true});
ctx.clearRect(0,0,600,500);
ctx.fillStyle='#4fc3f7';ctx.shadowBlur=20;ctx.shadowColor='#4fc3f7';ctx.fillRect(ship.x,ship.y,ship.w,ship.h);ctx.shadowBlur=0;
bullets.forEach(b=>{ctx.fillStyle='#ffeb3b';ctx.shadowBlur=10;ctx.shadowColor='#ffeb3b';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.shadowBlur=0});
enemies.forEach(e=>{ctx.fillStyle='#ff4444';ctx.shadowBlur=10;ctx.shadowColor='#ff4444';ctx.fillRect(e.x,e.y,e.w,e.h);ctx.shadowBlur=0});
ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.textAlign='left';ctx.fillText('Score: '+score,10,25);
requestAnimationFrame(update)
}
update()
</script></body></html>`,
    };
  }

  if (isPuzzle) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Number Crunch";
    description = "Combine matching tiles to reach the highest score. Addictive brain teaser!";
    instructions = "Use arrow keys to move tiles. Same numbers merge!";
    return {
      title,
      description,
      instructions,
      html: `<!DOCTYPE html><html><head><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
canvas{border:2px solid #ff9800;border-radius:8px;background:#1a1a2e}
</style></head><body>
<canvas id="g" width="400" height="400"></canvas>
<script>
const c=document.getElementById('g'),ctx=c.getContext('2d');
let grid=Array(4).fill().map(()=>Array(4).fill(0)),score=0,gameOver=false;
const colors={2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
function addTile(){let empty=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!grid[r][c])empty.push([r,c]);if(empty.length){let[r,c]=empty[Math.floor(Math.random()*empty.length)];grid[r][c]=Math.random()<0.9?2:4}}
function slide(row){let arr=row.filter(v=>v);for(let i=0;i<arr.length-1;i++){if(arr[i]===arr[i+1]){arr[i]*=2;score+=arr[i];arr.splice(i+1,1)}}while(arr.length<4)arr.push(0);return arr}
function move(dir){let changed=false;for(let i=0;i<4;i++){let col=grid.map(r=>r[i]);if(dir==='left'){let n=slide(grid[i]);if(n.join()!==grid[i].join())changed=true;grid[i]=n}if(dir==='right'){let n=slide(grid[i].reverse()).reverse();if(n.join()!==grid[i].join())changed=true;grid[i]=n}if(dir==='up'){let n=slide(col);for(let r=0;r<4;r++){if(grid[r][i]!==n[r])changed=true;grid[r][i]=n[r]}}if(dir==='down'){let n=slide(col.reverse()).reverse();for(let r=0;r<4;r++){if(grid[r][i]!==n[r])changed=true;grid[r][i]=n[r]}}}if(changed)addTile();if(!changed){let full=grid.every(r=>r.every(v=>v));if(full)gameOver=true}}
document.addEventListener('keydown',e=>{if(gameOver&&e.key===' '){grid=Array(4).fill().map(()=>Array(4).fill(0));score=0;gameOver=false;addTile();addTile();return}if(e.key.startsWith('Arrow')){e.preventDefault();move(e.key.slice(5).toLowerCase())}});
addTile();addTile();
function draw(){ctx.clearRect(0,0,400,400);grid.forEach((row,r)=>row.forEach((v,c)=>{let x=c*100+5,y=r*100+5;ctx.fillStyle=colors[v]||'#3c3a32';ctx.shadowBlur=v>0?10:0;ctx.shadowColor='rgba(255,255,255,0.1)';ctx.fillRect(x,y,90,90);ctx.shadowBlur=0;if(v){ctx.fillStyle=v>4?'#fff':'#776e65';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v,x+45,y+45)}}));ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.textAlign='left';ctx.fillText('Score: '+score,10,380);if(gameOver){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,400,400);ctx.fillStyle='#ff9800';ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',200,200);ctx.font='16px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Press SPACE to restart',200,240)}
requestAnimationFrame(draw)}
draw()
</script></body></html>`,
    };
  }

  if (isSnake) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Snake Adventure";
    description = "Classic snake game. Eat food to grow. Don't hit the walls or yourself!";
    instructions = "Use arrow keys to control the snake. Eat the red food to grow.";
    return {
      title,
      description,
      instructions,
      html: `<!DOCTYPE html><html><head><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
canvas{border:2px solid #00e676;border-radius:8px;background:#1a1a2e}
</style></head><body>
<canvas id="g" width="400" height="400"></canvas>
<script>
const c=document.getElementById('g'),ctx=c.getContext('2d'),size=20;
let snake=[{x:10,y:10}],food={x:15,y:15},dir={x:0,y:0},nextDir={x:0,y:0},score=0,gameOver=false;
document.addEventListener('keydown',e=>{if(gameOver&&e.key===' '){snake=[{x:10,y:10}];dir={x:0,y:0};nextDir={x:0,y:0};score=0;gameOver=false;placeFood();return}const d={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}}[e.key];if(d&&(dir.x+d.x!==0||dir.y+d.y!==0))nextDir=d});
function placeFood(){food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)}}
placeFood();
setInterval(()=>{if(gameOver)return;dir=nextDir;let head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(head.x<0||head.x>=20||head.y<0||head.y>=20||snake.some(s=>s.x===head.x&&s.y===head.y)){gameOver=true;return}snake.unshift(head);if(head.x===food.x&&head.y===food.y){score++;placeFood()}else snake.pop()},150);
function draw(){ctx.clearRect(0,0,400,400);snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#00e676':'#4caf50';ctx.shadowBlur=i===0?15:5;ctx.shadowColor='#00e676';ctx.fillRect(s.x*size,s.y*size,size-2,size-2);ctx.shadowBlur=0});ctx.fillStyle='#ff5252';ctx.shadowBlur=10;ctx.shadowColor='#ff5252';ctx.fillRect(food.x*size,food.y*size,size-2,size-2);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('Score: '+score,10,20);if(gameOver){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,400,400);ctx.fillStyle='#00e676';ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',200,200);ctx.font='16px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Score: '+score+' - Press SPACE',200,240)}
requestAnimationFrame(draw)}
draw()
</script></body></html>`,
    };
  }

  if (isPong) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Pong Pro";
    description = "Classic paddle ball game. Beat the AI opponent!";
    instructions = "Move mouse up/down to control your paddle. First to 5 wins!";
    return {
      title,
      description,
      instructions,
      html: `<!DOCTYPE html><html><head><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
canvas{border:2px solid #448aff;border-radius:8px;background:#1a1a2e}
</style></head><body>
<canvas id="g" width="600" height="400"></canvas>
<script>
const c=document.getElementById('g'),ctx=c.getContext('2d');
let ball={x:300,y:200,r:8,vx:4,vy:3};
let p1={y:160,w:10,h:80,score:0},p2={y:160,w:10,h:80,score:0};
let gameOver=false;
c.addEventListener('mousemove',e=>{let rect=c.getBoundingClientRect();p1.y=e.clientY-rect.top-p1.h/2});
function reset(){ball.x=300;ball.y=200;ball.vx=(Math.random()>0.5?1:-1)*4;ball.vy=(Math.random()>0.5?1:-1)*3}
function update(){if(gameOver)return;ball.x+=ball.vx;ball.y+=ball.vy;if(ball.y-ball.r<0||ball.y+ball.r>400)ball.vy*=-1;if(ball.x-ball.r<0){p2.score++;if(p2.score>=5)gameOver=true;reset()}if(ball.x+ball.r>600){p1.score++;if(p1.score>=5)gameOver=true;reset()}if(ball.x-ball.r<p1.w+10&&ball.y>p1.y&&ball.y<p1.y+p1.h){ball.vx=Math.abs(ball.vx);ball.vx*=1.05}if(ball.x+ball.r>590-p2.w&&ball.y>p2.y&&ball.y<p2.y+p2.h){ball.vx=-Math.abs(ball.vx);ball.vx*=1.05}let target=ball.y-p2.h/2;p2.y+=(target-p2.y)*0.08}
setInterval(update,16);
function draw(){ctx.clearRect(0,0,600,400);ctx.fillStyle='#448aff';ctx.shadowBlur=10;ctx.shadowColor='#448aff';ctx.fillRect(10,p1.y,p1.w,p1.h);ctx.fillRect(580,p2.y,p2.w,p2.h);ctx.shadowBlur=0;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowBlur=20;ctx.shadowColor='#fff';ctx.fill();ctx.shadowBlur=0;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(300,0);ctx.lineTo(300,400);ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.stroke();ctx.setLineDash([]);ctx.font='24px sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(p1.score,150,40);ctx.fillText(p2.score,450,40);if(gameOver){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,600,400);ctx.fillStyle='#448aff';ctx.font='36px sans-serif';ctx.fillText('GAME OVER',300,200);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText((p1.score>p2.score?'You Win!':'AI Wins!')+' Final: '+p1.score+'-'+p2.score,300,250)}
requestAnimationFrame(draw)}
draw()
</script></body></html>`,
    };
  }

  return {
    title,
    description: "Classic platformer. Jump over obstacles and survive as long as you can!",
    instructions: "Press SPACE or UP arrow to jump. Avoid the red obstacles!",
    html: `<!DOCTYPE html><html><head><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
canvas{border:2px solid #ff6b35;border-radius:8px;background:#1a1a2e}
</style></head><body>
<canvas id="g" width="700" height="350"></canvas>
<script>
const c=document.getElementById('g'),ctx=c.getContext('2d');
let x=80,y=280,w=35,h=35,vy=0,g=0.6,jump=-10,ground=315;
let obstacles=[],score=0,gameOver=false;
let keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(gameOver&&e.key===' '){restart()}});
document.addEventListener('keyup',e=>keys[e.key]=false);
function restart(){gameOver=false;score=0;obstacles=[];x=80;y=280;vy=0}
function update(){if(gameOver){ctx.fillStyle='#ff6b35';ctx.font='36px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',350,170);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Score: '+score+' - Press SPACE',350,220);return}
vy+=g;y+=vy;if(y>ground-h){y=ground-h;vy=0}
if(y===ground-h&&(keys['ArrowUp']||keys[' ']))vy=jump;
obstacles=obstacles.filter(o=>o.x>-50);
if(score%80===0&&!gameOver){let oh=30+Math.random()*30;obstacles.push({x:700,y:ground-oh,w:25+Math.random()*15,h:oh})}
obstacles.forEach(o=>{o.x-=4+score/200;ctx.fillStyle='#ff6b35';ctx.shadowBlur=10;ctx.shadowColor='#ff6b35';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.shadowBlur=0;if(x<o.x+o.w&&x+w>o.x&&y<o.y+o.h&&y+h>o.y)gameOver=true});
ctx.fillStyle='#4fc3f7';ctx.shadowBlur=15;ctx.shadowColor='#4fc3f7';ctx.fillRect(x,y,w,h);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='20px sans-serif';ctx.fillText('Score: '+score,10,25);
score++;requestAnimationFrame(update)}
update()
</script></body></html>`,
  };
}

export async function generateGame(request: GameRequest): Promise<GameResult> {
  const prompt = `Create a complete, playable ${request.genre || "platform"} game as a single HTML file.
Requirements:
- Theme/idea: ${request.prompt}
- Use canvas 2D rendering
- Include keyboard controls
- Add score tracking
- Add game over / restart functionality
- Make it fun and polished with colors and effects
- Return ONLY valid HTML that works standalone

Return as JSON: { "html": "full HTML string", "title": "game title", "description": "short description", "instructions": "how to play" }`;

  const shouldTryAI = isApiKeySet() || await checkOllama();
  if (shouldTryAI) {
    try {
      const systemPrompt = "You are a game developer. Generate complete, playable HTML5 games. Return only valid JSON.";
      const result = await chatCompletion(getModel(), systemPrompt, prompt, { temperature: 0.8, maxTokens: 4096 });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  return generateGameLocal(request);
}
