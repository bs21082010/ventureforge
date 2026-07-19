import { getModel, chatCompletion, isApiKeySet, checkOllama } from "@/lib/ai/openai-client";

export interface GameRequest {
  prompt: string;
  genre?: string;
  dimension?: "2d" | "3d";
}

export interface GameResult {
  html: string;
  title: string;
  description: string;
  instructions: string;
  techStack: string[];
}

function analyzePrompt(prompt: string): {
  title: string;
  theme: string;
  colors: { primary: string; secondary: string; bg: string; accent: string };
  mechanics: string[];
  setting: string;
  characterName: string;
} {
  const p = prompt.toLowerCase();

  // Extract title
  const titleMatch = p.match(/(?:called|named|titled|叫|名)\s+["""]?([^""",.]+?)[""""]?(?:\s|,|\.|$)/i);
  let title: string;
  if (titleMatch) {
    title = titleMatch[1].trim().split(' ').slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } else {
    title = extractTitle(p);
  }

  // Extract theme/setting
  const setting = extractSetting(p);

  // Extract color preferences
  const colors = extractColors(p);

  // Extract game mechanics
  const mechanics = extractMechanics(p);

  // Extract character/subject
  const characterName = extractCharacter(p);

  return { title, theme: setting, colors, mechanics, setting, characterName };
}

function extractTitle(p: string): string {
  const skipWords = ['the', 'and', 'for', 'with', 'that', 'this', 'game', 'make', 'create', 'build', 'want', 'about', 'like', 'from', 'where', 'featuring', 'python', 'pygame', 'using', 'built', 'html', 'css', 'javascript'];
  const words = p.split(/\s+/).filter(w => w.length > 2 && !skipWords.includes(w.toLowerCase()));
  if (words.length >= 2) return words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return "My Game";
}

function extractSetting(p: string): string {
  if (p.match(/space|galaxy|star|planet|cosmos|universe|astronaut|rocket/)) return "space";
  if (p.match(/underwater|ocean|sea|fish|deep sea|submarine/)) return "underwater";
  if (p.match(/forest|jungle|tree|nature|wood|jungle/)) return "forest";
  if (p.match(/city|urban|street|building|tower|skyline/)) return "city";
  if (p.match(/desert|sand|dune|egypt|pyramid/)) return "desert";
  if (p.match(/mountain|cave|rock|cliff|volcano/)) return "mountain";
  if (p.match(/castle|dungeon|knight|medieval|dragon|sword/)) return "medieval";
  if (p.match(/future|cyber|neon|robot|sci-fi|tech/)) return "futuristic";
  if (p.match(/night|dark|moon|shadow|ghost|zombie|horror/)) return "dark";
  if (p.match(/candy|sweet|sugar|chocolate|cake|cookie/)) return "candy";
  if (p.match(/snow|ice|frozen|winter|penguin|ski/)) return "arctic";
  if (p.match(/farm|crop|harvest|animal|chicken|cow/)) return "farm";
  if (p.match(/pirate|ship|sea|treasure|island/)) return "pirate";
  if (p.match(/ninja|samurai|temple|cherry blossom/)) return "japanese";
  return "default";
}

function extractColors(p: string): { primary: string; secondary: string; bg: string; accent: string } {
  const colorMap: Record<string, { primary: string; secondary: string; bg: string; accent: string }> = {
    red: { primary: '#ff4444', secondary: '#ff8888', bg: '#1a0a0a', accent: '#ff0000' },
    blue: { primary: '#4488ff', secondary: '#88bbff', bg: '#0a0a1a', accent: '#0066ff' },
    green: { primary: '#44ff88', secondary: '#88ffbb', bg: '#0a1a0a', accent: '#00ff44' },
    yellow: { primary: '#ffdd44', secondary: '#ffee88', bg: '#1a1a0a', accent: '#ffcc00' },
    purple: { primary: '#aa44ff', secondary: '#cc88ff', bg: '#1a0a1a', accent: '#8800ff' },
    orange: { primary: '#ff8844', secondary: '#ffbb88', bg: '#1a100a', accent: '#ff6600' },
    pink: { primary: '#ff66aa', secondary: '#ff99cc', bg: '#1a0a10', accent: '#ff3388' },
    cyan: { primary: '#44ddff', secondary: '#88eeff', bg: '#0a1a1a', accent: '#00ccff' },
    neon: { primary: '#00ff88', secondary: '#ff00ff', bg: '#0a0a1a', accent: '#ffff00' },
    dark: { primary: '#666666', secondary: '#999999', bg: '#0a0a0a', accent: '#ff4444' },
    gold: { primary: '#ffd700', secondary: '#ffec80', bg: '#1a150a', accent: '#ffaa00' },
    fire: { primary: '#ff4400', secondary: '#ff8844', bg: '#1a0800', accent: '#ff2200' },
    ice: { primary: '#88ddff', secondary: '#ccf0ff', bg: '#0a1520', accent: '#00bbff' },
    nature: { primary: '#44aa44', secondary: '#88cc88', bg: '#0a1a0a', accent: '#22ff22' },
  };

  for (const [name, colors] of Object.entries(colorMap)) {
    if (p.includes(name)) return colors;
  }

  // Default based on setting
  return { primary: '#4fc3f7', secondary: '#81d4fa', bg: '#0a0a1a', accent: '#ff6b35' };
}

function extractMechanics(p: string): string[] {
  const mechanics: string[] = [];
  if (p.match(/jump|hop|leap|bounce/)) mechanics.push('jump');
  if (p.match(/shoot|fire|bullet|laser|gun/)) mechanics.push('shoot');
  if (p.match(/run|dash|sprint|speed/)) mechanics.push('run');
  if (p.match(/collect|gather|pick|coin|star/)) mechanics.push('collect');
  if (p.match(/avoid|dodge|escape|hide/)) mechanics.push('avoid');
  if (p.match(/build|craft|place|stack/)) mechanics.push('build');
  if (p.match(/fight|battle|attack|defend/)) mechanics.push('fight');
  if (p.match(/drive|race|steer|car/)) mechanics.push('drive');
  if (p.match(/puzzle|solve|match|connect/)) mechanics.push('puzzle');
  if (p.match(/fly|air|wing|glide/)) mechanics.push('fly');
  if (p.match(/swim|dive|water/)) mechanics.push('swim');
  if (p.match(/climb|scale|攀爬/)) mechanics.push('climb');
  if (p.match(/stealth|sneak|hide|quiet/)) mechanics.push('stealth');
  if (mechanics.length === 0) mechanics.push('move');
  return mechanics;
}

function extractCharacter(p: string): string {
  const chars: Record<string, string> = {
    cat: 'Cat', dog: 'Dog', bird: 'Bird', fish: 'Fish', dragon: 'Dragon',
    knight: 'Knight', ninja: 'Ninja', wizard: 'Wizard', robot: 'Robot', alien: 'Alien',
    ghost: 'Ghost', zombie: 'Zombie', hero: 'Hero', player: 'Player',
    car: 'Car', ship: 'Ship', plane: 'Plane', ball: 'Ball',
    cube: 'Cube', circle: 'Circle', square: 'Square',
    astronaut: 'Astronaut', pirate: 'Pirate', monkey: 'Monkey',
    snake: 'Snake', worm: 'Worm', bug: 'Bug', bee: 'Bee',
    mushroom: 'Mushroom', tree: 'Tree', flower: 'Flower',
  };
  for (const [key, name] of Object.entries(chars)) {
    if (p.includes(key)) return name;
  }
  return "Player";
}

function generateGameLocal(request: GameRequest): GameResult {
  const analysis = analyzePrompt(request.prompt);
  const p = request.prompt.toLowerCase();
  const c = analysis.colors;

  const is3D = request.dimension === "3d" || p.includes("3d") || p.includes("cube") || p.includes("polygon");
  const genre = request.genre || "platformer";

  if (is3D) return generate3DGame(analysis, p, genre, c);

  // Genre-based generation with prompt customization
  if (genre === "shooter" || p.match(/shoot|gun|laser|bullet|attack|fight/)) return generateShooterGame(analysis, c);
  if (genre === "racing" || p.match(/race|car|drive|speed|road|track/)) return generateRacingGame(analysis, c);
  if (genre === "puzzle" || p.match(/puzzle|match|tile|2048|connect|logic/)) return generatePuzzleGame(analysis, c);
  if (genre === "snake" || p.match(/snake|worm|grow|length/)) return generateSnakeGame(analysis, c);
  if (genre === "pong" || p.match(/pong|tennis|paddle|ball.*bounce/)) return generatePongGame(analysis, c);
  if (genre === "flappy" || p.match(/flap|bird|fly|wing|tap/)) return generateFlappyGame(analysis, c);
  if (genre === "tetris" || p.match(/tetris|block|fall|stack|line/)) return generateTetrisGame(analysis, c);

  // Default: platformer (most versatile)
  return generatePlatformerGame(analysis, c);
}

function generate3DGame(analysis: any, p: string, genre: string, c: any): GameResult {
  const { title, characterName, mechanics } = analysis;
  if (genre === "shooter" || mechanics.includes('shoot') || p.match(/shoot|gun|laser|space.*combat/)) {
    return {
      title, description: `3D ${title} — WebGL shooter with ${characterName}`,
      instructions: "WASD to move, Mouse to aim, Click to shoot",
      techStack: ["HTML5", "CSS3", "JavaScript", "WebGL"],
      html: genWebGLShooter(title, characterName, c)
    };
  }
  if (genre === "racing" || mechanics.includes('drive') || p.match(/race|car|speed/)) {
    return {
      title, description: `3D ${title} — WebGL racing game`,
      instructions: "Arrow keys to steer, Up to accelerate",
      techStack: ["HTML5", "CSS3", "JavaScript", "WebGL"],
      html: genWebGLRacer(title, c)
    };
  }
  return {
    title, description: `3D ${title} — Interactive WebGL scene`,
    instructions: "WASD to move, Mouse to look, Click to interact",
    techStack: ["HTML5", "CSS3", "JavaScript", "WebGL"],
    html: genWebGLExplorer(title, characterName, c)
  };
}

function genWebGLShooter(title: string, ship: string, c: any): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden;font-family:'Courier New',monospace}canvas{display:block}#ui{position:absolute;top:20px;left:20px;color:${c.accent};z-index:10;text-shadow:0 0 10px ${c.accent}}#ui h2{font-size:22px}#ui p{font-size:13px;opacity:.8}#go{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:${c.primary};font-size:48px;text-align:center;z-index:20;text-shadow:0 0 20px ${c.primary}}#go p{font-size:18px;color:#fff;margin-top:10px}</style></head><body>
<div id="ui"><h2>${title}</h2><p>Score: <span id="sc">0</span> | HP: <span id="hp">100</span></p></div>
<div id="go">GAME OVER<p id="fs"></p><p>Click to restart</p></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),gl=cv.getContext('webgl')||cv.getContext('experimental-webgl');
cv.width=innerWidth;cv.height=innerHeight;gl.viewport(0,0,cv.width,cv.height);
const vs=\`attribute vec4 aP;uniform mat4 uMV,uP;varying float vD;void main(){gl_Position=uP*uMV*aP;vD=aP.z;}\`;
const fs=\`precision mediump float;uniform vec4 uC;varying float vD;void main(){float f=clamp(1.0+vD*0.02,0.0,1.0);gl_FragColor=vec4(uC.rgb*f,uC.a);}\`;
function mkS(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh}
const pg=gl.createProgram();gl.attachShader(pg,mkS(gl.VERTEX_SHADER,vs));gl.attachShader(pg,mkS(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pg);gl.useProgram(pg);
const aP=gl.getAttribLocation(pg,'aP'),uMV=gl.getUniformLocation(pg,'uMV'),uP=gl.getUniformLocation(pg,'uP'),uC=gl.getUniformLocation(pg,'uC');
gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const bf=gl.createBuffer();
function setV(d){gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0)}
function persp(fov,a,n,f){const t=1/Math.tan(fov/2),nf=1/(n-f);return[t/a,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,2*f*n*nf,0]}
function id(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function trans(m,x,y,z){const r=[...m];r[12]=m[0]*x+m[4]*y+m[8]*z+m[12];r[13]=m[1]*x+m[5]*y+m[9]*z+m[13];r[14]=m[2]*x+m[6]*y+m[10]*z+m[14];r[15]=m[3]*x+m[7]*y+m[11]*z+m[15];return r}
function rY(m,a){const co=Math.cos(a),si=Math.sin(a),r=[...m];r[0]=m[0]*co+m[8]*si;r[8]=m[8]*co-m[0]*si;r[2]=m[2]*co+m[10]*si;r[10]=m[10]*co-m[2]*si;return r}
function rX(m,a){const co=Math.cos(a),si=Math.sin(a),r=[...m];r[4]=m[4]*co+m[8]*si;r[8]=m[8]*co-m[4]*si;r[5]=m[5]*co+m[9]*si;r[9]=m[9]*co-m[5]*si;return r}
function cube(sx,sy,sz){return[-sx,-sy,-sz,sx,-sy,-sz,sx,sy,-sz,-sx,-sy,-sz,sx,sy,-sz,-sx,sy,-sz,-sx,-sy,sz,sx,-sy,sz,sx,sy,sz,-sx,-sy,sz,sx,sy,sz,-sx,sy,sz,-sx,-sy,-sz,-sx,sy,-sz,-sx,sy,sz,-sx,-sy,-sz,-sx,sy,sz,-sx,-sy,sz,sx,-sy,-sz,sx,sy,-sz,sx,sy,sz,sx,-sy,-sz,sx,sy,sz,sx,-sy,sz,-sx,sy,-sz,sx,sy,-sz,sx,sy,sz,-sx,sy,-sz,sx,sy,sz,-sx,sy,sz,-sx,-sy,-sz,sx,-sy,-sz,sx,-sy,sz,-sx,-sy,-sz,sx,-sy,sz,-sx,-sy,sz]}
function drawC(x,y,z,sx,sy,sz,r,g,b,a){setV(cube(sx,sy,sz).map((v,i)=>i%3===0?v:i%3===1?v:v));gl.uniform4f(uC,r,g,b,a);let mv=trans(id(),x,y,z);gl.uniformMatrix4fv(uMV,false,new Float32Array(mv));gl.drawArrays(gl.TRIANGLES,0,36)}
gl.uniformMatrix4fv(uP,false,new Float32Array(persp(Math.PI/4,cv.width/cv.height,0.1,1e3)));
let sc=0,hp=100,go=false,pZ=0,pX=0,pY=-2,buls=[],ens=[],pts=[];
let ks={},mx=0,my=0,ls=0;
document.addEventListener('keydown',e=>{ks[e.key]=true;e.preventDefault()});
document.addEventListener('keyup',e=>ks[e.key]=false);
document.addEventListener('mousemove',e=>{mx=(e.clientX/cv.width-.5)*2;my=(e.clientY/cv.height-.5)*2});
document.addEventListener('click',()=>{if(go)restart();else shoot()});
function shoot(){const n=Date.now();if(n-ls<150)return;ls=n;buls.push({x:pX,y:pY,z:pZ-1,vz:-.5})}
function spawn(){ens.push({x:(Math.random()-.5)*10,y:(Math.random()-.5)*4,z:pZ-40-Math.random()*20,sp:.05+Math.random()*.1,sz:.3+Math.random()*.5})}
function restart(){go=false;sc=0;hp=100;pZ=0;pX=0;pY=-2;buls=[];ens=[];pts=[];document.getElementById('go').style.display='none'}
setInterval(spawn,800);
function update(){if(go)return;if(ks['w']||ks['ArrowUp'])pZ-=.15;if(ks['s']||ks['ArrowDown'])pZ+=.1;if(ks['a']||ks['ArrowLeft'])pX-=.1;if(ks['d']||ks['ArrowRight'])pX+=.1;pX+=mx*.05;pY-=my*.03;pX=Math.max(-5,Math.min(5,pX));pY=Math.max(-4,Math.min(0,pY));buls.forEach(b=>b.z+=b.vz);buls=buls.filter(b=>b.z>pZ-60);ens.forEach(e=>e.z+=e.sp);ens=ens.filter(e=>e.z<pZ+5);buls.forEach((b,bi)=>{ens.forEach((e,ei)=>{if(Math.abs(b.x-e.x)<e.sz&&Math.abs(b.y-e.y)<e.sz&&Math.abs(b.z-e.z)<e.sz){for(let i=0;i<8;i++)pts.push({x:e.x,y:e.y,z:e.z,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,vz:(Math.random()-.5)*.2,l:1});buls.splice(bi,1);ens.splice(ei,1);sc++;document.getElementById('sc').textContent=sc}})});ens.forEach(e=>{if(Math.abs(e.x-pX)<e.sz+.3&&Math.abs(e.y-pY)<e.sz+.3&&Math.abs(e.z-pZ)<e.sz+.5){hp-=10;document.getElementById('hp').textContent=hp;if(hp<=0){go=true;document.getElementById('go').style.display='block';document.getElementById('fs').textContent='Score: '+sc}}});pts.forEach(p2=>{p2.x+=p2.vx;p2.y+=p2.vy;p2.z+=p2.vz;p2.l-=.02});pts=pts.filter(p2=>p2.l>0)}
function render(){gl.clearColor(0,0,.05,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);for(let i=0;i<50;i++){const sx2=((i*137.5+pZ*.1)%20)-10,sy2=((i*97.3)%8)-4,sz2=((i*53.7)%40)-20+pZ;drawC(sx2,sy2,sz2,.02,.02,.02,1,1,1,.5)}let mv=trans(id(),pX,pY,pZ);mv=rY(mv,mx*.3);mv=rX(mv,my*.2);setV([0,.3,-.8,-.5,-.2,.5,.5,-.2,.5,0,.3,-.8,0,-.3,.8,-.5,-.2,.5,0,.3,-.8,.5,-.2,.5,0,-.3,.8,-.5,-.2,.5,.5,-.2,.5,0,-.3,.8]);gl.uniform4f(uC,0,1,.5,1);gl.uniformMatrix4fv(uMV,false,new Float32Array(mv));gl.drawArrays(gl.TRIANGLES,0,12);buls.forEach(b=>drawC(b.x,b.y,b.z,.05,.05,.3,1,1,0,1));ens.forEach(e=>drawC(e.x,e.y,e.z,e.sz,e.sz,e.sz,1,.2,.2,1));pts.forEach(p2=>drawC(p2.x,p2.y,p2.z,.05,.05,.05,1,.5,0,p2.l));requestAnimationFrame(render)}
update();setInterval(update,16);render();</script></body></html>`;
}

function genWebGLRacer(title: string, c: any): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden;font-family:'Courier New',monospace}canvas{display:block}#ui{position:absolute;top:20px;left:20px;color:${c.accent};z-index:10;text-shadow:0 0 10px ${c.accent}}#sp{position:absolute;bottom:20px;right:20px;color:#ff0;font-size:32px;z-index:10;text-shadow:0 0 15px #ff0}</style></head><body>
<div id="ui"><h2>${title}</h2><p>Score: <span id="sc">0</span></p></div><div id="sp">0 km/h</div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),gl=cv.getContext('webgl')||cv.getContext('experimental-webgl');
cv.width=innerWidth;cv.height=innerHeight;gl.viewport(0,0,cv.width,cv.height);
const vs=\`attribute vec4 aP;attribute vec3 aC;uniform mat4 uMV,uP;varying vec3 vC;void main(){gl_Position=uP*uMV*aP;vC=aC;}\`;
const fs=\`precision mediump float;varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.0);}\`;
function mkS(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh}
const pg=gl.createProgram();gl.attachShader(pg,mkS(gl.VERTEX_SHADER,vs));gl.attachShader(pg,mkS(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pg);gl.useProgram(pg);
const aP=gl.getAttribLocation(pg,'aP'),aC=gl.getAttribLocation(pg,'aC'),uMV=gl.getUniformLocation(pg,'uMV'),uP=gl.getUniformLocation(pg,'uP');
gl.enable(gl.DEPTH_TEST);
const bf=gl.createBuffer(),cf=gl.createBuffer();
function setV(d){gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0)}
function setC(d){gl.bindBuffer(gl.ARRAY_BUFFER,cf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aC);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,0,0)}
function persp(fov,a,n,f){const t=1/Math.tan(fov/2),nf=1/(n-f);return[t/a,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,2*f*n*nf,0]}
function id(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function trans(m,x,y,z){const r=[...m];r[12]=m[0]*x+m[4]*y+m[8]*z+m[12];r[13]=m[1]*x+m[5]*y+m[9]*z+m[13];r[14]=m[2]*x+m[6]*y+m[10]*z+m[14];r[15]=m[3]*x+m[7]*y+m[11]*z+m[15];return r}
function rY(m,a){const co=Math.cos(a),si=Math.sin(a),r=[...m];r[0]=m[0]*co+m[8]*si;r[8]=m[8]*co-m[0]*si;r[2]=m[2]*co+m[10]*si;r[10]=m[10]*co-m[2]*si;return r}
gl.uniformMatrix4fv(uP,false,new Float32Array(persp(Math.PI/3,cv.width/cv.height,0.1,500)));
let sc=0,spd=0,mxS=3,acc=.02,st=0,pX=0,pZ=0;
let obs=[];for(let i=0;i<20;i++)obs.push({x:(Math.random()-.5)*6,z:50+i*15,w:.8});
let ks={};
document.addEventListener('keydown',e=>{ks[e.key]=true;e.preventDefault()});
document.addEventListener('keyup',e=>ks[e.key]=false);
function update(){if(ks['ArrowUp'])spd=Math.min(spd+acc,mxS);else spd=Math.max(spd-.01,0);if(ks['ArrowDown'])spd=Math.max(spd-.05,0);if(ks['ArrowLeft'])st=Math.max(st-.02,-.3);else if(ks['ArrowRight'])st=Math.min(st+.02,.3);else st*=.9;pX+=st*spd;pX=Math.max(-3,Math.min(3,pX));pZ-=spd;sc+=Math.floor(spd*10);obs.forEach(o=>{if(Math.abs(o.x-pX)<o.w&&Math.abs(o.z-pZ%150-50)<1)spd*=.5});document.getElementById('sc').textContent=sc;document.getElementById('sp').textContent=Math.floor(spd*60)+' km/h'}
function render(){gl.clearColor(0,0,.05,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
const rv=[],rc=[];for(let i=0;i<80;i++){const z1=pZ+i*5,z2=z1+5,x1=Math.sin(z1*.02)*2+st*2,x2=Math.sin(z2*.02)*2+st*2;rv.push(x1-2,-2,-(z1%200),x1+2,-2,-(z1%200),x2+2,-2,-(z2%200),x1-2,-2,-(z1%200),x2+2,-2,-(z2%200),x2-2,-2,-(z2%200));const s=i%4<2?[.2,.2,.2]:[.3,.3,.3];rc.push(...s,...s,...s,...s,...s,...s)}
setV(rv);setC(rc);gl.uniformMatrix4fv(uMV,false,new Float32Array(id()));gl.drawArrays(gl.TRIANGLES,0,rv.length/3);
const ev=[],ec=[];for(let i=0;i<80;i++){const z1=pZ+i*5,z2=z1+5,x1=Math.sin(z1*.02)*2+st*2,x2=Math.sin(z2*.02)*2+st*2;ev.push(x1-2.1,-1.9,-(z1%200),x1-1.9,-1.9,-(z1%200),x2-1.9,-1.9,-(z2%200),x1+1.9,-1.9,-(z1%200),x1+2.1,-1.9,-(z1%200),x2+2.1,-1.9,-(z2%200));ec.push(1,.5,0,1,.5,0,1,.5,0,1,.5,0,1,.5,0,1,.5,0)}
setV(ev);setC(ec);gl.drawArrays(gl.TRIANGLES,0,ev.length/3);
let mv=trans(id(),pX,-1.5,-5);mv=rY(mv,st*.5);
setV([-.4,0,-.8,.4,0,-.8,.4,.3,-.8,-.4,0,-.8,.4,.3,-.8,-.4,.3,-.8,-.4,0,.8,.4,0,.8,.4,.3,.8,-.4,0,.8,.4,.3,.8,-.4,.3,.8,-.4,0,-.8,-.4,.3,-.8,-.4,.3,.8,-.4,0,-.8,-.4,.3,.8,-.4,0,.8,.4,0,-.8,.4,.3,-.8,.4,.3,.8,.4,0,-.8,.4,.3,.8,.4,0,.8,-.4,.3,-.8,.4,.3,-.8,.4,.3,.8,-.4,.3,-.8,.4,.3,.8,-.4,.3,.8]);
const rc2=[];for(let i=0;i<36;i++){const m=i%9;if(m<3)rc2.push(0,.6,.2);else if(m<6)rc2.push(.2,.4,.8);else rc2.push(.1,.1,.2)}
setC(rc2);gl.uniformMatrix4fv(uMV,false,new Float32Array(mv));gl.drawArrays(gl.TRIANGLES,0,36);
obs.forEach(o=>{const oz=(o.z-pZ)%150;if(oz>-5&&oz<50){const omv=trans(id(),o.x,-1.2,-oz);setV([-.3,-.5,-.3,.3,-.5,-.3,.3,.5,-.3,-.3,-.5,-.3,.3,.5,-.3,-.3,.5,-.3,-.3,-.5,.3,.3,-.5,.3,.3,.5,.3,-.3,-.5,.3,.3,.5,.3,-.3,.5,.3,-.3,-.5,-.3,-.3,.5,-.3,.3,.5,-.3,-.3,-.5,-.3,.3,-.5,-.3,.3,.5,.3,-.3,-.5,.3,.3,.5,.3,-.3,.5,.3]);setC(new Array(36).fill(0).map((_,i)=>i%3===0?1:.2));gl.uniformMatrix4fv(uMV,false,new Float32Array(omv));gl.drawArrays(gl.TRIANGLES,0,36)}});
const sv=[],scl=[];for(let i=0;i<100;i++){sv.push(((i*173)%20)-10,((i*91)%8)+2,-((i*37)%40));scl.push(1,1,1)}
setV(sv);setC(scl);gl.uniformMatrix4fv(uMV,false,new Float32Array(id()));gl.drawArrays(gl.POINTS,0,100);
requestAnimationFrame(render)}
setInterval(update,16);render();</script></body></html>`;
}

function genWebGLExplorer(title: string, entity: string, c: any): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden;font-family:'Courier New',monospace}canvas{display:block}#ui{position:absolute;top:20px;left:20px;color:${c.accent};z-index:10;text-shadow:0 0 10px ${c.accent}}#ui h2{font-size:22px}#ui p{font-size:12px;opacity:.7;margin-top:4px}</style></head><body>
<div id="ui"><h2>${title}</h2><p>WASD move | Mouse look | Click place block</p><p>Blocks: <span id="cnt">5</span></p></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),gl=cv.getContext('webgl')||cv.getContext('experimental-webgl');
cv.width=innerWidth;cv.height=innerHeight;gl.viewport(0,0,cv.width,cv.height);
const vs=\`attribute vec4 aP;attribute vec3 aC;uniform mat4 uMV,uP;varying vec3 vC;void main(){gl_Position=uP*uMV*aP;vC=aC;}\`;
const fs=\`precision mediump float;varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.0);}\`;
function mkS(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh}
const pg=gl.createProgram();gl.attachShader(pg,mkS(gl.VERTEX_SHADER,vs));gl.attachShader(pg,mkS(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pg);gl.useProgram(pg);
const aP=gl.getAttribLocation(pg,'aP'),aC=gl.getAttribLocation(pg,'aC'),uMV=gl.getUniformLocation(pg,'uMV'),uP=gl.getUniformLocation(pg,'uP');
gl.enable(gl.DEPTH_TEST);
const bf=gl.createBuffer(),cf=gl.createBuffer();
function setV(d){gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0)}
function setC(d){gl.bindBuffer(gl.ARRAY_BUFFER,cf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aC);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,0,0)}
function persp(fov,a,n,f){const t=1/Math.tan(fov/2),nf=1/(n-f);return[t/a,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,2*f*n*nf,0]}
function id(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function trans(m,x,y,z){const r=[...m];r[12]=m[0]*x+m[4]*y+m[8]*z+m[12];r[13]=m[1]*x+m[5]*y+m[9]*z+m[13];r[14]=m[2]*x+m[6]*y+m[10]*z+m[14];r[15]=m[3]*x+m[7]*y+m[11]*z+m[15];return r}
function rY(m,a){const co=Math.cos(a),si=Math.sin(a),r=[...m];r[0]=m[0]*co+m[8]*si;r[8]=m[8]*co-m[0]*si;r[2]=m[2]*co+m[10]*si;r[10]=m[10]*co-m[2]*si;return r}
function rX(m,a){const co=Math.cos(a),si=Math.sin(a),r=[...m];r[4]=m[4]*co+m[8]*si;r[8]=m[8]*co-m[4]*si;r[5]=m[5]*co+m[9]*si;r[9]=m[9]*co-m[5]*si;return r}
let camX=0,camY=3,camZ=8,camRX=-.3,camRY=0,keys={};
const blocks=[{x:0,y:0,z:0,r:.2,g:.6,b:1},{x:1,y:0,z:0,r:1,g:.3,b:.3},{x:0,y:1,z:0,r:.3,g:1,b:.3},{x:-1,y:0,z:-1,r:1,g:1,b:.3},{x:2,y:0,z:1,r:.8,g:.3,b:.8}];
document.addEventListener('keydown',e=>{keys[e.key]=true;e.preventDefault()});
document.addEventListener('keyup',e=>keys[e.key]=false);
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){camRY+=e.movementX*.002;camRX-=e.movementY*.002;camRX=Math.max(-1.5,Math.min(1.5,camRX))}});
cv.addEventListener('click',()=>{if(!document.pointerLockElement)cv.requestPointerLock();else{const bx=Math.floor(camX-Math.sin(camRY)*3),bz=Math.floor(camZ-Math.cos(camRY)*3);blocks.push({x:bx,y:0,z:bz,r:Math.random(),g:Math.random(),b:Math.random()});document.getElementById('cnt').textContent=blocks.length}});
function update(){const s=.1;if(keys['w']){camZ-=s*Math.cos(camRY);camX-=s*Math.sin(camRY)}if(keys['s']){camZ+=s*Math.cos(camRY);camX+=s*Math.sin(camRY)}if(keys['a']){camX-=s*Math.cos(camRY);camZ+=s*Math.sin(camRY)}if(keys['d']){camX+=s*Math.cos(camRY);camZ-=s*Math.sin(camRY)}}
function drawC(x,y,z,sx,sy,sz,r,g,b){const v=[-1,-1,-1,1,-1,-1,1,1,-1,-1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,-1,1,1,-1,-1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,-1,1,-1,1,1,-1,-1,1,1,1,1,-1,1,-1,1,-1,1,1,-1,1,1,1,-1,1,-1,1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,-1,-1,1];const d=[];for(let i=0;i<v.length;i+=3)d.push(v[i]*sx,v[i+1]*sy,v[i+2]*sz);setV(d);const cl=[];for(let i=0;i<d.length/3;i++)cl.push(r,g,b);setC(cl);let mv=trans(id(),x,y+.5,z);gl.uniformMatrix4fv(uMV,false,new Float32Array(mv));gl.drawArrays(gl.TRIANGLES,0,36)}
function render(){gl.clearColor(.02,.02,.08,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
let view=trans(id(),0,0,-8);view=rX(view,camRX);view=rY(view,camRY);view=trans(view,-camX,-camY,-camZ);
gl.uniformMatrix4fv(uP,false,new Float32Array(persp(Math.PI/3,cv.width/cv.height,0.1,200)));gl.uniformMatrix4fv(uMV,false,new Float32Array(view));
const gv=[],gc=[];for(let i=-10;i<=10;i++){gv.push(i,0,-10,i,0,10,-10,0,i,10,0,i);gc.push(.1,.1,.15,.1,.1,.15,.1,.1,.15,.1,.1,.15,.1,.1,.15,.1,.1,.15)}setV(gv);setC(gc);gl.drawArrays(gl.LINES,0,gv.length/3);
blocks.forEach(b=>drawC(b.x,b.y,b.z,1,1,1,b.r,b.g,b.b));
setV([0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,3]);setC([1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1]);gl.drawArrays(gl.LINES,0,6);
requestAnimationFrame(render)}
setInterval(update,16);render();</script></body></html>`;
}

// ============ 2D GAME GENERATORS ============

function generatePlatformerGame(analysis: any, c: any): GameResult {
  const { title, characterName, mechanics, setting } = analysis;
  const collect = mechanics.includes('collect');
  return {
    title,
    description: `${title} — A ${setting} platformer with ${characterName}`,
    instructions: `SPACE/UP to jump, LEFT/RIGHT to move${collect ? ', collect items!' : '! Avoid obstacles!'}`,
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}canvas{border:2px solid ${c.accent};border-radius:8px;background:${c.bg}}</style></head><body>
<canvas id="g" width="700" height="350"></canvas><script>
const ctx=document.getElementById('g').getContext('2d');
let x=80,y=280,w=35,h=35,vy=0,g=.6,jmp=-10,ground=315;
let obs=[],coins=[],sc=0,go=false,ks={};
const cols=['${c.primary}','${c.secondary}','${c.accent}','${c.primary}aa'];
document.addEventListener('keydown',e=>{ks[e.key]=true;if(go&&e.key===' ')restart()});
document.addEventListener('keyup',e=>ks[e.key]=false);
function restart(){go=false;sc=0;obs=[];coins=[];x=80;y=280;vy=0}
function update(){if(go)return;vy+=g;y+=vy;if(y>ground-h){y=ground-h;vy=0}if(y===ground-h&&(ks['ArrowUp']||ks[' ']))vy=jmp;
if(ks['ArrowLeft']&&x>0)x-=4;if(ks['ArrowRight']&&x<665)x+=4;
obs=obs.filter(o=>o.x>-50);if(sc%80===0&&!go){let oh=30+Math.random()*30;obs.push({x:700,y:ground-oh,w:25+Math.random()*15,h:oh})}
if(Math.random()<.02&&coins.length<5)coins.push({x:700,y:ground-40-Math.random()*100,r:8});
obs.forEach(o=>{o.x-=4+sc/200;if(x<o.x+o.w&&x+w>o.x&&y<o.y+o.h&&y+h>o.y)go=true});
coins.forEach(cn=>{cn.x-=4+sc/200;if(Math.abs(x+w/2-cn.x)<w/2+cn.r&&Math.abs(y+h/2-cn.y)<h/2+cn.r){sc+=20;cn.x=-100}});
coins=coins.filter(cn=>cn.x>-50);sc++}
function draw(){ctx.clearRect(0,0,700,350);
ctx.fillStyle='#2d5a27';ctx.fillRect(0,ground,700,350-ground);
ctx.fillStyle='${c.primary}';ctx.shadowBlur=15;ctx.shadowColor='${c.accent}';ctx.fillRect(x,y,w,h);ctx.shadowBlur=0;
ctx.fillStyle='#fff';ctx.fillRect(x+5,y+5,8,8);ctx.fillStyle='#000';ctx.fillRect(x+8,y+8,3,3);
obs.forEach(o=>{ctx.fillStyle='${c.accent}';ctx.shadowBlur=10;ctx.shadowColor='${c.accent}';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.shadowBlur=0});
coins.forEach(cn=>{ctx.fillStyle='#ffd700';ctx.shadowBlur=10;ctx.shadowColor='#ffd700';ctx.beginPath();ctx.arc(cn.x,cn.y,cn.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
ctx.fillStyle='#fff';ctx.font='20px sans-serif';ctx.fillText('Score: '+sc,10,25);
if(go){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,700,350);ctx.fillStyle='${c.accent}';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',350,170);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Score: '+sc+' | Press SPACE',350,220)}
requestAnimationFrame(draw)}
setInterval(update,16);draw();</script></body></html>`
  };
}

function generateShooterGame(analysis: any, c: any): GameResult {
  const { title, characterName } = analysis;
  return {
    title,
    description: `${title} — Blast enemies as ${characterName}`,
    instructions: "LEFT/RIGHT to move, SPACE to shoot",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}canvas{border:2px solid ${c.accent};border-radius:8px;background:${c.bg}}</style></head><body>
<canvas id="g" width="600" height="500"></canvas><script>
const ctx=document.getElementById('g').getContext('2d');
let ship={x:270,w:60,y:430,h:40},buls=[],ens=[],pts=[],sc=0,go=false,ks={};
document.addEventListener('keydown',e=>{ks[e.key]=true;if(e.key===' '&&!go)buls.push({x:ship.x+ship.w/2-3,y:ship.y-10,w:6,h:15});if(go&&e.key===' ')restart()});
document.addEventListener('keyup',e=>ks[e.key]=false);
function restart(){go=false;sc=0;ens=[];buls=[];pts=[]}
setInterval(()=>{if(!go)ens.push({x:Math.random()*540,y:-30,w:30+Math.random()*20,h:25+Math.random()*20,sp:1+Math.random()*2,col:['${c.primary}','${c.secondary}','${c.accent}'][Math.floor(Math.random()*3)]})},600);
function update(){if(go)return;if(ks['ArrowLeft']&&ship.x>0)ship.x-=6;if(ks['ArrowRight']&&ship.x<540)ship.x+=6;
buls.forEach(b=>b.y-=8);buls=buls.filter(b=>b.y>-20);ens.forEach(e=>e.y+=e.sp);ens=ens.filter(e=>e.y<520);
buls.forEach((b,bi)=>{ens.forEach((e,ei)=>{if(b.x<e.x+e.w&&b.x+b.w>e.x&&b.y<e.y+e.h&&b.y+b.h>e.y){for(let i=0;i<12;i++)pts.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:1,col:e.col});buls.splice(bi,1);ens.splice(ei,1);sc+=10}})});
pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.l-=.03;p.vy+=.1});pts=pts.filter(p=>p.l>0);
ens.forEach(e=>{if(e.y+e.h>ship.y&&e.x<ship.x+ship.w&&e.x+e.w>ship.x)go=true})}
function draw(){ctx.clearRect(0,0,600,500);
ctx.fillStyle='${c.primary}';ctx.shadowBlur=20;ctx.shadowColor='${c.accent}';ctx.beginPath();ctx.moveTo(ship.x+ship.w/2,ship.y-10);ctx.lineTo(ship.x,ship.y+ship.h);ctx.lineTo(ship.x+ship.w,ship.y+ship.h);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
buls.forEach(b=>{ctx.fillStyle='#ffeb3b';ctx.shadowBlur=10;ctx.shadowColor='#ffeb3b';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.shadowBlur=0});
ens.forEach(e=>{ctx.fillStyle=e.col;ctx.shadowBlur=10;ctx.shadowColor=e.col;ctx.fillRect(e.x,e.y,e.w,e.h);ctx.shadowBlur=0});
pts.forEach(p=>{ctx.globalAlpha=p.l;ctx.fillStyle=p.col;ctx.fillRect(p.x-2,p.y-2,4,4)});ctx.globalAlpha=1;
ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('Score: '+sc,10,25);
if(go){ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(0,0,600,500);ctx.fillStyle='${c.accent}';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',300,230);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('Score: '+sc+' | Press SPACE',300,280)}
requestAnimationFrame(draw)}
setInterval(update,16);draw();</script></body></html>`
  };
}

function generateRacingGame(analysis: any, c: any): GameResult {
  const { title } = analysis;
  return {
    title,
    description: `${title} — Dodge traffic and survive`,
    instructions: "LEFT/RIGHT to steer, A for AI Analyzer, survive!",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden;font-family:'Courier New',monospace}#wrap{position:relative}canvas{display:block}</style></head><body>
<div id="wrap"><canvas id="g" width="400" height="650"></canvas></div>
<script>
var cv=document.getElementById('g'),ctx=cv.getContext('2d');
var W=400,H=650;
var ROAD_L=60,ROAD_W=280,ROAD_R=ROAD_L+ROAD_W;
var LX=ROAD_L,RX=ROAD_R,LW=ROAD_W/3;

var player={x:170,y:530,w:36,h:68,speed:0,color:'#00bfff'};
var cars=[],stars=[],score=0,best=0,gameSpeed=3,alive=true,aiMode=false;
var aiDec=0,aiDodges=0,aiCrashes=0,aiReact=[];
var frameCount=0;

try{best=parseInt(localStorage.getItem('race_best')||'0')}catch(e){best=0}

var COLORS=['#e74c3c','#c0392b','#3498db','#2980b9','#2ecc71','#27ae60','#f39c12','#e67e22','#9b59b6','#8e44ad','#1abc9c','#16a085','#ecf0f1','#bdc3c7','#d35400'];

function drawCarShape(x,y,w,h,color,isPlayer){
  var cx=x+w/2;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx,y+h+4,w/2+6,5,0,0,Math.PI*2);
  ctx.fill();

  // Main body
  ctx.fillStyle=color;
  ctx.fillRect(x+3,y+h*0.25,w-6,h*0.6);
  // Body darker top
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.fillRect(x+3,y+h*0.25,w-6,h*0.15);

  // Roof
  ctx.fillStyle=isPlayer?'#0d4f7a':'#1a0a0a';
  ctx.fillRect(x+w*0.2,y+h*0.08,w*0.6,h*0.22);

  // Windshield
  ctx.fillStyle='rgba(100,200,255,0.5)';
  ctx.fillRect(x+w*0.22,y+h*0.1,w*0.56,h*0.14);
  // Windshield shine
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.fillRect(x+w*0.25,y+h*0.11,w*0.15,h*0.12);

  // Rear window
  ctx.fillStyle='rgba(100,200,255,0.35)';
  ctx.fillRect(x+w*0.22,y+h*0.62,w*0.56,h*0.12);

  // Headlights
  ctx.fillStyle='#ffe066';
  ctx.shadowColor='#ffe066';
  ctx.shadowBlur=8;
  ctx.fillRect(x+4,y+h*0.27,7,6);
  ctx.fillRect(x+w-11,y+h*0.27,7,6);
  // Headlight beam
  ctx.fillStyle='rgba(255,224,102,0.15)';
  ctx.fillRect(x-2,y-10,w+4,30);

  // Taillights
  ctx.fillStyle='#ff2222';
  ctx.shadowColor='#ff2222';
  ctx.shadowBlur=6;
  ctx.fillRect(x+4,y+h*0.8,7,5);
  ctx.fillRect(x+w-11,y+h*0.8,7,5);

  // Tail glow
  ctx.fillStyle='rgba(255,34,34,0.2)';
  ctx.fillRect(x+2,y+h*0.85,w-4,10);

  ctx.shadowBlur=0;

  // Wheels
  ctx.fillStyle='#111';
  ctx.fillRect(x-3,y+h*0.28,5,h*0.18);
  ctx.fillRect(x+w-2,y+h*0.28,5,h*0.18);
  ctx.fillRect(x-3,y+h*0.72,5,h*0.18);
  ctx.fillRect(x+w-2,y+h*0.72,5,h*0.18);
  // Wheel shine
  ctx.fillStyle='#222';
  ctx.fillRect(x-2,y+h*0.32,3,h*0.08);
  ctx.fillRect(x+w-1,y+h*0.32,3,h*0.08);
  ctx.fillRect(x-2,y+h*0.76,3,h*0.08);
  ctx.fillRect(x+w-1,y+h*0.76,3,h*0.08);

  // Racing stripe for player
  if(isPlayer){
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.fillRect(cx-2,y+h*0.28,4,h*0.55);
  }
}

function spawnCar(){
  var w=34+Math.random()*8;
  var col=COLORS[Math.floor(Math.random()*COLORS.length)];
  var lane=Math.floor(Math.random()*3);
  var lx=ROAD_L+lane*LW+LW/2-w/2;
  // Avoid spawning on top of another car
  for(var i=0;i<cars.length;i++){
    if(Math.abs(cars[i].x-lx)<50&&cars[i].y<100)return;
  }
  cars.push({x:lx,y:-80,w:w,h:62+Math.random()*10,col:col});
}

function drawRoad(){
  // Grass
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0a1f0a');g.addColorStop(1,'#0d2d0d');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  // Road surface
  ctx.fillStyle='#1a1a2e';
  ctx.fillRect(ROAD_L,0,ROAD_W,H);

  // Road texture lines
  ctx.fillStyle='rgba(255,255,255,0.03)';
  for(var i=0;i<H;i+=4){
    ctx.fillRect(ROAD_L,i,ROAD_W,1);
  }

  // Road edges (orange glow)
  ctx.fillStyle='#ff6600';
  ctx.shadowColor='#ff6600';ctx.shadowBlur=12;
  ctx.fillRect(ROAD_L-3,0,4,H);
  ctx.fillRect(ROAD_R-1,0,4,H);
  ctx.shadowBlur=0;

  // Lane markings
  var offset=(frameCount*gameSpeed)%60;
  ctx.fillStyle='rgba(255,255,255,0.5)';
  for(var i=-60;i<H+60;i+=60){
    var yy=i+offset;
    if(yy>0&&yy<H){
      ctx.fillRect(ROAD_L+LW-1,yy,2,25);
      ctx.fillRect(ROAD_L+LW*2-1,yy,2,25);
    }
  }
}

function drawHUD(){
  // Score bar background
  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.fillRect(0,0,W,32);

  ctx.fillStyle='#fff';ctx.font='bold 14px Courier New';
  ctx.textAlign='left';
  ctx.fillText('SCORE: '+score,10,22);
  ctx.textAlign='right';
  ctx.fillText('BEST: '+best,W-10,22);
  ctx.textAlign='center';
  ctx.fillStyle='#ff6600';
  ctx.fillText(Math.floor(gameSpeed*18)+' km/h',W/2,22);
}

function drawAIPanel(){
  if(!aiMode)return;
  var px=8,py=H-110,pw=W-16,ph=100;
  ctx.fillStyle='rgba(0,0,0,0.85)';
  ctx.fillRect(px,py,pw,ph);
  ctx.strokeStyle='#ff6600';ctx.lineWidth=1;
  ctx.strokeRect(px,py,pw,ph);

  ctx.fillStyle='#ff6600';ctx.font='bold 12px Courier New';ctx.textAlign='left';
  ctx.fillText('AI ANALYZER',px+8,py+16);

  ctx.fillStyle='#fff';ctx.font='11px Courier New';
  var avgR=aiReact.length>0?(aiReact.reduce(function(a,b){return a+b},0)/aiReact.length).toFixed(1):'0';
  var acc=aiDodges+aiCrashes>0?Math.floor(aiDodges/(aiDodges+aiCrashes)*100):0;

  ctx.fillText('Decisions: '+aiDec,px+8,py+34);
  ctx.fillText('Dodges: '+aiDodges,px+8,py+50);
  ctx.fillText('Crashes: '+aiCrashes,px+130,py+34);
  ctx.fillText('React: '+avgR+'ms',px+130,py+50);

  // Accuracy bar
  ctx.fillStyle='#333';ctx.fillRect(px+8,py+60,pw-16,8);
  ctx.fillStyle='#4caf50';ctx.fillRect(px+8,py+60,(pw-16)*acc/100,8);
  ctx.fillStyle='#fff';ctx.font='10px Courier New';
  ctx.fillText('Accuracy: '+acc+'%',px+8,py+80);

  ctx.fillStyle=alive?'#4caf50':'#ff4444';
  ctx.fillText('Status: '+(alive?'Playing':'Crashed @ '+score+'pts'),px+130,py+80);
}

function drawGameOver(){
  ctx.fillStyle='rgba(0,0,0,0.8)';
  ctx.fillRect(0,32,W,H-32);

  ctx.fillStyle='#ff6600';ctx.font='bold 42px Courier New';ctx.textAlign='center';
  ctx.fillText('GAME OVER',W/2,H/2-40);

  ctx.fillStyle='#fff';ctx.font='18px Courier New';
  ctx.fillText('Score: '+score,W/2,H/2+10);

  ctx.fillStyle='#aaa';ctx.font='14px Courier New';
  ctx.fillText('SPACE to restart | A for AI mode',W/2,H/2+50);

  if(aiMode){
    ctx.fillStyle='#ff6600';ctx.font='12px Courier New';
    ctx.fillText('AI mode: ON — watching AI play...',W/2,H/2+80);
  }
}

function aiControl(){
  if(!aiMode||!alive)return;
  var t0=performance.now();
  var danger=false;
  var dangerLeft=false;
  for(var i=0;i<cars.length;i++){
    var o=cars[i];
    if(o.y>player.y-200&&o.y<player.y+player.h){
      var ox=o.x+o.w/2;
      var px2=player.x+player.w/2;
      if(Math.abs(ox-px2)<55){
        danger=true;
        dangerLeft=ox>px2;
      }
    }
  }
  if(danger){
    if(dangerLeft&&player.x>ROAD_L+5)player.x-=5;
    else if(!dangerLeft&&player.x<ROAD_R-player.w-5)player.x+=5;
    aiDec++;
    aiReact.push(performance.now()-t0);
  }
}

function update(){
  frameCount++;
  if(!alive)return;

  aiControl();

  if(!aiMode){
    if(keys.ArrowLeft&&player.x>ROAD_L+2)player.x-=5;
    if(keys.ArrowRight&&player.x<ROAD_R-player.w-2)player.x+=5;
  }

  gameSpeed=3+Math.floor(score/80)*0.15;
  if(gameSpeed>9)gameSpeed=9;

  if(frameCount%Math.max(20,50-Math.floor(score/20))===0)spawnCar();

  for(var i=cars.length-1;i>=0;i--){
    cars[i].y+=gameSpeed;
    if(cars[i].y>H+100){cars.splice(i,1);continue}

    var o=cars[i];
    if(player.x<o.x+o.w&&player.x+player.w>o.x&&player.y<o.y+o.h&&player.y+player.h>o.y){
      alive=false;
      aiCrashes++;
      if(score>best){best=score;try{localStorage.setItem('race_best',String(best))}catch(e){}}
    }
  }

  score++;
}

function draw(){
  drawRoad();
  // Cars
  for(var i=0;i<cars.length;i++){
    drawCarShape(cars[i].x,cars[i].y,cars[i].w,cars[i].h,cars[i].col,false);
  }
  // Player
  drawCarShape(player.x,player.y,player.w,player.h,player.color,true);

  drawHUD();
  drawAIPanel();
  if(!alive)drawGameOver();

  requestAnimationFrame(draw);
}

var keys={};
document.addEventListener('keydown',function(e){
  keys[e.key]=true;
  if(e.key===' '&&!alive){
    alive=true;score=0;gameSpeed=3;cars=[];
    player.x=170;
    aiDec=0;aiDodges=0;aiCrashes=0;aiReact=[];
  }
  if(e.key==='a'||e.key==='A'){aiMode=!aiMode}
  e.preventDefault();
});
document.addEventListener('keyup',function(e){keys[e.key]=false});

setInterval(update,16);
draw();
</script></body></html>`
  };
}

function generatePuzzleGame(analysis: any, c: any): GameResult {
  const { title } = analysis;
  return {
    title,
    description: `${title} — Merge tiles and score big`,
    instructions: "Arrow keys to move, same numbers merge!",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}canvas{border:2px solid ${c.accent};border-radius:8px;background:${c.bg}}</style></head><body>
<canvas id="g" width="400" height="400"></canvas><script>
const ctx=document.getElementById('g').getContext('2d');
let grid=Array(4).fill().map(()=>Array(4).fill(0)),sc=0,go=false;
const cls={2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
function add(){let e=[];for(let r=0;r<4;r++)for(let c2=0;c2<4;c2++)if(!grid[r][c2])e.push([r,c2]);if(e.length){let[r,c2]=e[Math.floor(Math.random()*e.length)];grid[r][c2]=Math.random()<.9?2:4}}
function slide(row){let a=row.filter(v=>v);for(let i=0;i<a.length-1;i++){if(a[i]===a[i+1]){a[i]*=2;sc+=a[i];a.splice(i+1,1)}}while(a.length<4)a.push(0);return a}
function move(dir){let ch=false;for(let i=0;i<4;i++){let col=grid.map(r=>r[i]);
if(dir==='left'){let n=slide(grid[i]);if(n.join()!==grid[i].join())ch=true;grid[i]=n}
if(dir==='right'){let n=slide(grid[i].reverse()).reverse();if(n.join()!==grid[i].join())ch=true;grid[i]=n}
if(dir==='up'){let n=slide(col);for(let r=0;r<4;r++){if(grid[r][i]!==n[r])ch=true;grid[r][i]=n[r]}}
if(dir==='down'){let n=slide(col.reverse()).reverse();for(let r=0;r<4;r++){if(grid[r][i]!==n[r])ch=true;grid[r][i]=n[r]}}}
if(ch)add();if(!ch&&grid.every(r=>r.every(v=>v)))go=true}
document.addEventListener('keydown',e=>{if(go&&e.key===' '){grid=Array(4).fill().map(()=>Array(4).fill(0));sc=0;go=false;add();add();return}if(e.key.startsWith('Arrow')){e.preventDefault();move(e.key.slice(5).toLowerCase())}});
add();add();
function draw(){ctx.clearRect(0,0,400,400);
grid.forEach((row,r)=>row.forEach((v,c2)=>{let x=c2*100+5,y=r*100+5;ctx.fillStyle=cls[v]||'#3c3a32';ctx.shadowBlur=v>0?10:0;ctx.shadowColor='rgba(255,255,255,.1)';ctx.fillRect(x,y,90,90);ctx.shadowBlur=0;
if(v){ctx.fillStyle=v>4?'#fff':'#776e65';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v,x+45,y+45)}}));
ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.textAlign='left';ctx.fillText('Score: '+sc,10,385);
if(go){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,400,400);ctx.fillStyle='${c.accent}';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',200,200);ctx.font='16px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Press SPACE',200,240)}
requestAnimationFrame(draw)}
draw();</script></body></html>`
  };
}

function generateSnakeGame(analysis: any, c: any): GameResult {
  const { title } = analysis;
  return {
    title,
    description: `${title} — Eat, grow, survive`,
    instructions: "Arrow keys to move. Eat food to grow!",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}canvas{border:2px solid ${c.accent};border-radius:8px;background:${c.bg}}</style></head><body>
<canvas id="g" width="400" height="400"></canvas><script>
const ctx=document.getElementById('g').getContext('2d'),sz=20;
let snake=[{x:10,y:10}],food={x:15,y:15},dir={x:0,y:0},nd={x:0,y:0},sc=0,go=false;
document.addEventListener('keydown',e=>{if(go&&e.key===' '){snake=[{x:10,y:10}];dir={x:0,y:0};nd={x:0,y:0};sc=0;go=false;pf();return}
const d={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}}[e.key];if(d&&(dir.x+d.x!==0||dir.y+d.y!==0))nd=d});
function pf(){food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)}}pf();
setInterval(()=>{if(go)return;dir=nd;let h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
if(h.x<0||h.x>=20||h.y<0||h.y>=20||snake.some(s=>s.x===h.x&&s.y===h.y)){go=true;return}
snake.unshift(h);if(h.x===food.x&&h.y===food.y){sc++;pf()}else snake.pop()},150);
function draw(){ctx.clearRect(0,0,400,400);
snake.forEach((s,i)=>{ctx.fillStyle=i===0?'${c.primary}':'${c.secondary}';ctx.shadowBlur=i===0?15:5;ctx.shadowColor='${c.accent}';ctx.fillRect(s.x*sz,s.y*sz,sz-2,sz-2);ctx.shadowBlur=0});
ctx.fillStyle='#ff5252';ctx.shadowBlur=10;ctx.shadowColor='#ff5252';ctx.fillRect(food.x*sz,food.y*sz,sz-2,sz-2);ctx.shadowBlur=0;
ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('Score: '+sc,10,20);
if(go){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,400,400);ctx.fillStyle='${c.accent}';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('GAME OVER',200,200);ctx.font='16px sans-serif';ctx.fillStyle='#fff';ctx.fillText('Score: '+sc+' | SPACE',200,240)}
requestAnimationFrame(draw)}
draw();</script></body></html>`
  };
}

function generatePongGame(analysis: any, c: any): GameResult {
  const { title } = analysis;
  return {
    title,
    description: `${title} — Beat the AI opponent`,
    instructions: "Move mouse up/down. First to 5 wins!",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}canvas{border:2px solid ${c.accent};border-radius:8px;background:${c.bg}}</style></head><body>
<canvas id="g" width="600" height="400"></canvas><script>
const ctx=document.getElementById('g').getContext('2d');
let ball={x:300,y:200,r:8,vx:4,vy:3},p1={y:160,w:10,h:80,sc:0},p2={y:160,w:10,h:80,sc:0},go=false;
document.getElementById('g').addEventListener('mousemove',e=>{let r=e.target.getBoundingClientRect();p1.y=e.clientY-r.top-p1.h/2});
function reset(){ball.x=300;ball.y=200;ball.vx=(Math.random()>.5?1:-1)*4;ball.vy=(Math.random()>.5?1:-1)*3}
function update(){if(go)return;ball.x+=ball.vx;ball.y+=ball.vy;
if(ball.y-ball.r<0||ball.y+ball.r>400)ball.vy*=-1;
if(ball.x-ball.r<0){p2.sc++;if(p2.sc>=5)go=true;reset()}
if(ball.x+ball.r>600){p1.sc++;if(p1.sc>=5)go=true;reset()}
if(ball.x-ball.r<p1.w+10&&ball.y>p1.y&&ball.y<p1.y+p1.h){ball.vx=Math.abs(ball.vx);ball.vx*=1.05}
if(ball.x+ball.r>590-p2.w&&ball.y>p2.y&&ball.y<p2.y+p2.h){ball.vx=-Math.abs(ball.vx);ball.vx*=1.05}
let t=ball.y-p2.h/2;p2.y+=(t-p2.y)*.08}
setInterval(update,16);
function draw(){ctx.clearRect(0,0,600,400);
ctx.fillStyle='${c.primary}';ctx.shadowBlur=10;ctx.shadowColor='${c.accent}';ctx.fillRect(10,p1.y,p1.w,p1.h);ctx.fillRect(580,p2.y,p2.w,p2.h);ctx.shadowBlur=0;
ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowBlur=20;ctx.shadowColor='#fff';ctx.fill();ctx.shadowBlur=0;
ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(300,0);ctx.lineTo(300,400);ctx.strokeStyle='rgba(255,255,255,.2)';ctx.stroke();ctx.setLineDash([]);
ctx.font='24px sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(p1.sc,150,40);ctx.fillText(p2.sc,450,40);
if(go){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,600,400);ctx.fillStyle='${c.accent}';ctx.font='bold 36px sans-serif';ctx.fillText('GAME OVER',300,200);ctx.font='18px sans-serif';ctx.fillStyle='#fff';ctx.fillText((p1.sc>p2.sc?'You Win!':'AI Wins!')+' '+p1.sc+'-'+p2.sc,300,250)}
requestAnimationFrame(draw)}
draw();</script></body></html>`
  };
}

function generateFlappyGame(analysis: any, c: any): GameResult {
  const { title } = analysis;
  return {
    title,
    description: `${title} — Flap through obstacles`,
    instructions: "SPACE/CLICK to flap. Don't hit the pipes!",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}canvas{border:2px solid ${c.accent};border-radius:8px;background:${c.bg}}</style></head><body>
<canvas id="g" width="400" height="600"></canvas><script>
const ctx=document.getElementById('g').getContext('2d');
let bird={x:80,y:250,vy:0,r:15},pipes=[],sc=0,go=false,fr=0;
const GV=.35,FL=-6.5,PW=50,GAP=150,PS=2.5;
document.addEventListener('keydown',e=>{if(e.code==='Space')flap()});
document.addEventListener('click',flap);
document.addEventListener('touchstart',e=>{e.preventDefault();flap()});
function flap(){if(go){bird={x:80,y:250,vy:0,r:15};pipes=[];sc=0;go=false;fr=0}else bird.vy=FL}
function update(){if(go)return;fr++;bird.vy+=GV;bird.y+=bird.vy;
if(bird.y>580||bird.y<0)go=true;
if(fr%90===0){const gy=80+Math.random()*300;pipes.push({x:400,gy,sc:false})}
pipes.forEach(p=>{p.x-=PS;if(!p.sc&&p.x+PW<bird.x){p.sc=true;sc++;document.getElementById('sc').textContent=sc}
if(bird.x+bird.r>p.x&&bird.x-bird.r<p.x+PW){if(bird.y-bird.r<p.gy||bird.y+bird.r>p.gy+GAP)go=true}});
pipes=pipes.filter(p=>p.x>-PW)}
function draw(){ctx.fillStyle='${c.bg}';ctx.fillRect(0,0,400,600);
pipes.forEach(p=>{ctx.fillStyle='${c.accent}';ctx.shadowBlur=15;ctx.shadowColor='${c.accent}';ctx.fillRect(p.x,0,PW,p.gy);ctx.fillRect(p.x,p.gy+GAP,PW,600-p.gy-GAP);ctx.shadowBlur=0;
ctx.fillStyle='${c.primary}';ctx.fillRect(p.x+5,0,PW-10,p.gy-10);ctx.fillRect(p.x+5,p.gy+GAP+10,PW-10,600-p.gy-GAP-10)});
ctx.fillStyle='${c.secondary}';ctx.shadowBlur=20;ctx.shadowColor='${c.accent}';ctx.beginPath();ctx.arc(bird.x,bird.y,bird.r,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bird.x+5,bird.y-4,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(bird.x+6,bird.y-4,2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
if(go){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,400,600);ctx.fillStyle='${c.accent}';ctx.font='bold 36px Courier New';ctx.textAlign='center';ctx.fillText('GAME OVER',200,280);ctx.fillStyle='#fff';ctx.font='18px Courier New';ctx.fillText('Score: '+sc,200,320);ctx.fillText('Tap or SPACE',200,350)}
requestAnimationFrame(draw)}
setInterval(update,16);draw();</script></body></html>`
  };
}

function generateTetrisGame(analysis: any, c: any): GameResult {
  const { title } = analysis;
  return {
    title,
    description: `${title} — Classic falling blocks`,
    instructions: "Arrow keys to move, UP to rotate, SPACE for hard drop",
    techStack: ["HTML5", "CSS3", "JavaScript", "Canvas 2D"],
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.bg};display:flex;justify-content:center;align-items:center;height:100vh;font-family:'Courier New',monospace}canvas{border:2px solid ${c.accent};border-radius:4px;background:${c.bg}}</style></head><body>
<canvas id="g" width="300" height="600"></canvas><script>
const ctx=document.getElementById('g').getContext('2d'),COLS=10,ROWS=20,SZ=30;
const COLORS=['#000','${c.primary}','${c.secondary}','${c.accent}','#ffaa00','#aa00ff','#ff5500','#00ff00'];
const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
let grid=Array(ROWS).fill(null).map(()=>Array(COLS).fill(0)),piece,px,py,col,sc=0,go=false,dt=0;
function spawn(){const i=Math.floor(Math.random()*SHAPES.length);piece=SHAPES[i].map(r=>[...r]);col=i+1;px=Math.floor((COLS-piece[0].length)/2);py=0;if(coll(piece,px,py))go=true}
function coll(p,ox,oy){for(let r=0;r<p.length;r++)for(let c=0;c<p[r].length;c++)if(p[r][c]){const nx=ox+c,ny=oy+r;if(nx<0||nx>=COLS||ny>=ROWS)return true;if(ny>=0&&grid[ny][nx])return true}return false}
function lock(){piece.forEach((row,r)=>row.forEach((v,c)=>{if(v&&py+r>=0)grid[py+r][px+c]=col}));let cl=0;
for(let r=ROWS-1;r>=0;r--){if(grid[r].every(v=>v)){grid.splice(r,1);grid.unshift(Array(COLS).fill(0));cl++;r++}}sc+=cl*cl*100;spawn()}
function rot(p){const rows=p.length,cols=p[0].length;return Array(cols).fill(null).map((_,c)=>Array(rows).fill(null).map((_,r)=>p[rows-1-r][c]))}
document.addEventListener('keydown',e=>{if(go){grid=Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));sc=0;go=false;spawn();return}
if(e.key==='ArrowLeft'&&!coll(piece,px-1,py))px--;if(e.key==='ArrowRight'&&!coll(piece,px+1,py))px++;
if(e.key==='ArrowDown'){while(!coll(piece,px,py+1))py++;lock()}
if(e.key==='ArrowUp'){const r=rot(piece);if(!coll(r,px,py))piece=r}
if(e.key===' '){while(!coll(piece,px,py+1))py++;lock()}});
function update(){if(go)return;dt++;if(dt>=30){dt=0;if(!coll(piece,px,py+1))py++;else lock()}}
function draw(){ctx.fillStyle='${c.bg}';ctx.fillRect(0,0,300,600);
grid.forEach((row,r)=>row.forEach((v,c)=>{if(v){ctx.fillStyle=COLORS[v];ctx.fillRect(c*SZ,r*SZ,SZ-1,SZ-1);ctx.strokeStyle='#fff';ctx.lineWidth=.5;ctx.strokeRect(c*SZ,r*SZ,SZ-1,SZ-1)}}));
if(piece){ctx.fillStyle=COLORS[col];piece.forEach((row,r)=>row.forEach((v,c)=>{if(v)ctx.fillRect((px+c)*SZ,(py+r)*SZ,SZ-1,SZ-1)}))}
ctx.fillStyle='#fff';ctx.font='bold 16px Courier New';ctx.textAlign='left';ctx.fillText('Score: '+sc,10,25);
if(go){ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(0,0,300,600);ctx.fillStyle='${c.accent}';ctx.font='bold 28px Courier New';ctx.textAlign='center';ctx.fillText('GAME OVER',150,290);ctx.fillStyle='#fff';ctx.font='14px Courier New';ctx.fillText('Press any key',150,320)}
requestAnimationFrame(draw)}
spawn();setInterval(update,16);draw();</script></body></html>`
  };
}

export async function generateGame(request: GameRequest): Promise<GameResult> {
  const dim = request.dimension || "2d";
  const analysis = analyzePrompt(request.prompt);

  const prompt = `Create a complete, playable ${dim.toUpperCase()} game based on this description: "${request.prompt}"

The game MUST be built with these technologies:
- HTML5: Document structure, semantic elements, Canvas element or WebGL canvas
- CSS3: All styling, animations, gradients, shadows, transitions, visual effects
- JavaScript: All game logic, physics engine, input handling, collision detection, scoring, state management
${dim === "3d" ? "- WebGL: GPU-accelerated 3D rendering with vertex/fragment shaders, perspective projection, 3D transforms, lighting" : "- Canvas 2D: 2D rendering with sprites, particles, gradients, shadows, image drawing"}

Requirements:
- Single standalone HTML file
- The game MUST match the prompt's theme, characters, setting, and mechanics
- Use colors derived from the prompt (e.g., "neon" → bright colors, "forest" → greens)
- The title should reflect the prompt
- Game mechanics must match what was described
- Include score tracking, game over, restart
- Polish: glow effects, particles, smooth animations

Return ONLY valid JSON: {"html":"full HTML","title":"game title","description":"short description","instructions":"how to play","techStack":["HTML5","CSS3","JavaScript","${dim === "3d" ? "WebGL" : "Canvas 2D"}"]}`;

  const shouldTryAI = isApiKeySet() || await checkOllama();
  if (shouldTryAI) {
    try {
      const systemPrompt = `You are an expert game developer. Generate complete, playable HTML5 games.
Tech requirements: HTML5 structure, CSS3 styling/animations, JavaScript game logic, and ${dim === "3d" ? "WebGL for GPU-accelerated 3D graphics with shaders" : "Canvas 2D for rendering with effects"}.
Analyze the user's prompt carefully: extract the theme, characters, setting, colors, and game mechanics.
The generated game MUST reflect ALL elements from the prompt — not just a generic template.
Return only valid JSON.`;
      const result = await chatCompletion(getModel(), systemPrompt, prompt, { temperature: 0.8, maxTokens: 8192 });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.techStack = parsed.techStack || ["HTML5", "CSS3", "JavaScript", dim === "3d" ? "WebGL" : "Canvas 2D"];
        return parsed;
      }
    } catch {}
  }

  return generateGameLocal(request);
}
