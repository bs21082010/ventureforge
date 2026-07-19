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

function generateGameLocal(request: GameRequest): GameResult {
  const p = request.prompt.toLowerCase();
  const is3D = request.dimension === "3d" || p.includes("3d") || p.includes("cube") || p.includes("polygon") || p.includes("space") && (p.includes("fly") || p.includes("ship"));

  const isRacing = p.includes("race") || p.includes("car") || p.includes("drive") || p.includes("speed");
  const isShooter = p.includes("shoot") || p.includes("space") || p.includes("alien") || p.includes("bullet");
  const isPuzzle = p.includes("puzzle") || p.includes("match") || p.includes("tile") || p.includes("2048");
  const isSnake = p.includes("snake") || p.includes("worm") || p.includes("grow");
  const isPong = p.includes("pong") || p.includes("tennis") || p.includes("bounce") || p.includes("paddle");
  const isPlatformer = p.includes("jump") || p.includes("platform") || p.includes("mario");
  const isTetris = p.includes("tetris") || p.includes("block") || p.includes("fall");
  const isFlappy = p.includes("flap") || p.includes("bird");

  let title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Game";
  let description = "A browser-based game";
  let instructions = "Use keyboard or mouse to play";

  if (is3D) {
    if (isShooter) {
      title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Void Raider";
      description = "3D space shooter with WebGL. Blast enemies in a 3D environment.";
      instructions = "WASD to move, Mouse to aim, Click to shoot, Scroll to zoom";
      return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript", "WebGL"], html: generateWebGLShooter(title) };
    }
    if (isRacing) {
      title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Neon Drift";
      description = "3D racing game with WebGL. Drift through neon tracks.";
      instructions = "LEFT/RIGHT arrows to steer, UP to accelerate, DOWN to brake";
      return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript", "WebGL"], html: generateWebGLRacer(title) };
    }
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "WebGL Explorer";
    description = "3D interactive experience built with WebGL. Explore and interact.";
    instructions = "WASD to move, Mouse to look around, Click to interact";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript", "WebGL"], html: generateWebGLScene(title) };
  }

  if (isFlappy) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Sky Jumper";
    description = "Flap through obstacles. How far can you go?";
    instructions = "SPACE or CLICK to flap. Don't hit the pipes!";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generateFlappy(title) };
  }

  if (isTetris) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Block Stack";
    description = "Classic falling blocks puzzle. Clear lines and score big!";
    instructions = "LEFT/RIGHT to move, UP to rotate, DOWN to fast drop, SPACE for hard drop";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generateTetris(title) };
  }

  if (isRacing) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Turbo Rush";
    description = "Race against the clock on a winding road. Dodge traffic and set the high score.";
    instructions = "LEFT/RIGHT arrows to steer. Avoid other cars. Survive as long as you can!";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generateRacing(title) };
  }

  if (isShooter) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Space Defender";
    description = "Blast incoming aliens before they reach you. Survive the endless assault.";
    instructions = "LEFT/RIGHT arrows to move. SPACE to shoot. Don't let aliens pass!";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generateShooter(title) };
  }

  if (isPuzzle) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Number Crunch";
    description = "Combine matching tiles to reach the highest score. Addictive brain teaser!";
    instructions = "Arrow keys to move tiles. Same numbers merge!";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generatePuzzle(title) };
  }

  if (isSnake) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Snake Arena";
    description = "Classic snake game. Eat food to grow. Don't hit walls or yourself!";
    instructions = "Arrow keys to control the snake. Eat the food to grow.";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generateSnake(title) };
  }

  if (isPong) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Pong Pro";
    description = "Classic paddle ball game. Beat the AI opponent!";
    instructions = "Move mouse up/down to control your paddle. First to 5 wins!";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generatePong(title) };
  }

  if (isPlatformer) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Jump Hero";
    description = "Classic platformer. Jump over obstacles and collect coins!";
    instructions = "SPACE or UP to jump. LEFT/RIGHT to move. Collect coins!";
    return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generatePlatformer(title) };
  }

  // Default: platformer
  title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Jump Hero";
  description = "Classic platformer. Jump over obstacles and survive as long as you can!";
  instructions = "Press SPACE or UP arrow to jump. Avoid the red obstacles!";
  return { title, description, instructions, techStack: ["HTML5", "CSS3", "JavaScript"], html: generatePlatformer(title) };
}

function generateWebGLShooter(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; font-family: 'Courier New', monospace; }
  canvas { display: block; }
  #ui { position: absolute; top: 20px; left: 20px; color: #0f0; z-index: 10; text-shadow: 0 0 10px #0f0; }
  #ui h2 { font-size: 24px; margin-bottom: 5px; }
  #ui p { font-size: 14px; opacity: 0.8; }
  #crosshair { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; border: 2px solid rgba(0,255,0,0.5); border-radius: 50%; pointer-events: none; z-index: 5; }
  #crosshair::before, #crosshair::after { content: ''; position: absolute; background: rgba(0,255,0,0.5); }
  #crosshair::before { width: 2px; height: 10px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  #crosshair::after { width: 10px; height: 2px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  #gameOver { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #f00; font-size: 48px; text-align: center; z-index: 20; text-shadow: 0 0 20px #f00; }
  #gameOver p { font-size: 18px; color: #fff; margin-top: 10px; }
</style>
</head>
<body>
<div id="ui"><h2>${title}</h2><p>Score: <span id="score">0</span></p><p>Health: <span id="health">100</span></p></div>
<div id="crosshair"></div>
<div id="gameOver">GAME OVER<p>Score: <span id="finalScore">0</span></p><p>Click to restart</p></div>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const vsSource = \`
attribute vec4 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelView;
uniform mat4 uProjection;
varying vec2 vTexCoord;
void main() {
  gl_Position = uProjection * uModelView * aPosition;
  vTexCoord = aTexCoord;
}
\`;

const fsSource = \`
precision mediump float;
varying vec2 vTexCoord;
uniform vec4 uColor;
uniform int uUseTexture;
uniform sampler2D uTexture;
void main() {
  if (uUseTexture == 1) {
    gl_FragColor = texture2D(uTexture, vTexCoord) * uColor;
  } else {
    gl_FragColor = uColor;
  }
}
\`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl.VERTEX_SHADER, vsSource));
gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(program);
gl.useProgram(program);

const aPosition = gl.getAttribLocation(program, 'aPosition');
const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
const uModelView = gl.getUniformLocation(program, 'uModelView');
const uProjection = gl.getUniformLocation(program, 'uProjection');
const uColor = gl.getUniformLocation(program, 'uColor');
const uUseTexture = gl.getUniformLocation(program, 'uUseTexture');

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
const texBuf = gl.createBuffer();

function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return [f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0];
}

function mat4Identity() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }

function mat4Translate(m, x, y, z) {
  const r = [...m];
  r[12] = m[0]*x + m[4]*y + m[8]*z + m[12];
  r[13] = m[1]*x + m[5]*y + m[9]*z + m[13];
  r[14] = m[2]*x + m[6]*y + m[10]*z + m[14];
  r[15] = m[3]*x + m[7]*y + m[11]*z + m[15];
  return r;
}

function mat4RotateY(m, a) {
  const c = Math.cos(a), s = Math.sin(a), r = [...m];
  r[0]=m[0]*c+m[8]*s; r[8]=m[8]*c-m[0]*s;
  r[2]=m[2]*c+m[10]*s; r[10]=m[10]*c-m[2]*s;
  return r;
}

function mat4RotateX(m, a) {
  const c = Math.cos(a), s = Math.sin(a), r = [...m];
  r[4]=m[4]*c+m[8]*s; r[8]=m[8]*c-m[4]*s;
  r[5]=m[5]*c+m[9]*s; r[9]=m[9]*c-m[5]*s;
  return r;
}

function setBuffer(data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
}

function drawCube(x, y, z, sx, sy, sz, r, g, b, a) {
  const v = [
    -1,-1,-1, 1,-1,-1, 1,1,-1, -1,-1,-1, 1,1,-1, -1,1,-1,
    -1,-1,1, 1,-1,1, 1,1,1, -1,-1,1, 1,1,1, -1,1,1,
    -1,-1,-1, -1,1,-1, -1,1,1, -1,-1,-1, -1,1,1, -1,-1,1,
    1,-1,-1, 1,1,-1, 1,1,1, 1,-1,-1, 1,1,1, 1,-1,1,
    -1,1,-1, 1,1,-1, 1,1,1, -1,1,-1, 1,1,1, -1,1,1,
    -1,-1,-1, 1,-1,-1, 1,-1,1, -1,-1,-1, 1,-1,1, -1,-1,1
  ];
  const d = [];
  for (let i = 0; i < v.length; i += 3) {
    d.push(v[i]*sx, v[i+1]*sy, v[i+2]*sz);
  }
  setBuffer(d);
  gl.uniform4f(uColor, r, g, b, a);
  gl.uniform1i(uUseTexture, 0);
  let mv = mat4Translate(mat4Identity(), x, y, z);
  gl.uniformMatrix4fv(uModelView, false, new Float32Array(mv));
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

const proj = mat4Perspective(Math.PI/4, canvas.width/canvas.height, 0.1, 1000);
gl.uniformMatrix4fv(uProjection, false, new Float32Array(proj));

let score = 0, health = 100, gameOver = false;
let playerZ = 0, playerX = 0, playerY = -2;
let bullets = [], enemies = [], particles = [];
let keys = {}, mouseX = 0, mouseY = 0;
let lastShot = 0;

document.addEventListener('keydown', e => { keys[e.key] = true; e.preventDefault(); });
document.addEventListener('keyup', e => keys[e.key] = false);
document.addEventListener('mousemove', e => { mouseX = (e.clientX / canvas.width - 0.5) * 2; mouseY = (e.clientY / canvas.height - 0.5) * 2; });
document.addEventListener('click', () => { if (gameOver) restart(); else shoot(); });

function shoot() {
  const now = Date.now();
  if (now - lastShot < 150) return;
  lastShot = now;
  bullets.push({ x: playerX, y: playerY, z: playerZ - 1, vz: -0.5 });
}

function spawnEnemy() {
  enemies.push({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 4,
    z: playerZ - 40 - Math.random() * 20,
    speed: 0.05 + Math.random() * 0.1,
    size: 0.3 + Math.random() * 0.5
  });
}

function restart() {
  gameOver = false; score = 0; health = 100;
  playerZ = 0; playerX = 0; playerY = -2;
  bullets = []; enemies = []; particles = [];
  document.getElementById('gameOver').style.display = 'none';
  document.getElementById('score').textContent = '0';
  document.getElementById('health').textContent = '100';
}

setInterval(spawnEnemy, 800);

function update() {
  if (gameOver) return;

  if (keys['w'] || keys['ArrowUp']) playerZ -= 0.15;
  if (keys['s'] || keys['ArrowDown']) playerZ += 0.1;
  if (keys['a'] || keys['ArrowLeft']) playerX -= 0.1;
  if (keys['d'] || keys['ArrowRight']) playerX += 0.1;

  playerX += mouseX * 0.05;
  playerY -= mouseY * 0.03;
  playerX = Math.max(-5, Math.min(5, playerX));
  playerY = Math.max(-4, Math.min(0, playerY));

  bullets.forEach(b => b.z += b.vz);
  bullets = bullets.filter(b => b.z > playerZ - 60);

  enemies.forEach(e => e.z += e.speed);
  enemies = enemies.filter(e => e.z < playerZ + 5);

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size && Math.abs(b.z - e.z) < e.size) {
        for (let i = 0; i < 8; i++) {
          particles.push({ x: e.x, y: e.y, z: e.z, vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2, vz: (Math.random()-0.5)*0.2, life: 1 });
        }
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
        document.getElementById('score').textContent = score;
      }
    });
  });

  enemies.forEach(e => {
    if (Math.abs(e.x - playerX) < e.size + 0.3 && Math.abs(e.y - playerY) < e.size + 0.3 && Math.abs(e.z - playerZ) < e.size + 0.5) {
      health -= 10;
      document.getElementById('health').textContent = health;
      if (health <= 0) {
        gameOver = true;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = score;
      }
    }
  });

  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.z += p.vz; p.life -= 0.02; });
  particles = particles.filter(p => p.life > 0);
}

function render() {
  gl.clearColor(0, 0, 0.05, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Stars
  for (let i = 0; i < 50; i++) {
    const sx = ((i * 137.5 + playerZ * 0.1) % 20) - 10;
    const sy = ((i * 97.3) % 8) - 4;
    const sz = ((i * 53.7) % 40) - 20 + playerZ;
    drawCube(sx, sy, sz, 0.02, 0.02, 0.02, 1, 1, 1, 0.5);
  }

  // Player ship
  let mv = mat4Translate(mat4Identity(), playerX, playerY, playerZ);
  mv = mat4RotateY(mv, mouseX * 0.3);
  mv = mat4RotateX(mv, mouseY * 0.2);
  gl.uniformMatrix4fv(uModelView, false, new Float32Array(mv));
  gl.uniform4f(uColor, 0, 1, 0.5, 1);
  gl.uniform1i(uUseTexture, 0);
  setBuffer([0,0.3,-0.8, -0.5,-0.2,0.5, 0.5,-0.2,0.5, 0,0.3,-0.8, 0,-0.3,0.8, -0.5,-0.2,0.5, 0,0.3,-0.8, 0.5,-0.2,0.5, 0,-0.3,0.8, -0.5,-0.2,0.5, 0.5,-0.2,0.5, 0,-0.3,0.8]);
  gl.drawArrays(gl.TRIANGLES, 0, 12);

  // Bullets
  bullets.forEach(b => drawCube(b.x, b.y, b.z, 0.05, 0.05, 0.3, 1, 1, 0, 1));

  // Enemies
  enemies.forEach(e => drawCube(e.x, e.y, e.z, e.size, e.size, e.size, 1, 0.2, 0.2, 1));

  // Particles
  particles.forEach(p => drawCube(p.x, p.y, p.z, 0.05, 0.05, 0.05, 1, 0.5, 0, p.life));

  requestAnimationFrame(render);
}

update();
setInterval(update, 16);
render();
</script>
</body>
</html>`;
}

function generateWebGLRacer(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; font-family: 'Courier New', monospace; }
  canvas { display: block; }
  #ui { position: absolute; top: 20px; left: 20px; color: #0ff; z-index: 10; text-shadow: 0 0 10px #0ff; }
  #ui h2 { font-size: 24px; }
  #ui p { font-size: 14px; opacity: 0.8; }
  #speed { position: absolute; bottom: 20px; right: 20px; color: #ff0; font-size: 32px; z-index: 10; text-shadow: 0 0 15px #ff0; }
</style>
</head>
<body>
<div id="ui"><h2>${title}</h2><p>Score: <span id="score">0</span></p></div>
<div id="speed">0 km/h</div>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const vsSource = \`
attribute vec4 aPosition;
attribute vec3 aColor;
uniform mat4 uMV;
uniform mat4 uP;
varying vec3 vColor;
void main() {
  gl_Position = uP * uMV * aPosition;
  vColor = aColor;
  gl_PointSize = 3.0;
}
\`;
const fsSource = \`
precision mediump float;
varying vec3 vColor;
void main() { gl_FragColor = vec4(vColor, 1.0); }
\`;

function mkShader(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vsSource));
gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(prog);
gl.useProgram(prog);

const aPos = gl.getAttribLocation(prog, 'aPosition');
const aCol = gl.getAttribLocation(prog, 'aColor');
const uMV = gl.getUniformLocation(prog, 'uMV');
const uP = gl.getUniformLocation(prog, 'uP');

gl.enable(gl.DEPTH_TEST);

const buf = gl.createBuffer();
const colBuf = gl.createBuffer();

function persp(fov, asp, n, f) {
  const t = 1/Math.tan(fov/2), nf = 1/(n-f);
  return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)*nf,-1, 0,0,2*f*n*nf,0];
}

function ident() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }

function translate(m, x, y, z) {
  const r=[...m]; r[12]=m[0]*x+m[4]*y+m[8]*z+m[12]; r[13]=m[1]*x+m[5]*y+m[9]*z+m[13]; r[14]=m[2]*x+m[6]*y+m[10]*z+m[14]; r[15]=m[3]*x+m[7]*y+m[11]*z+m[15]; return r;
}

function rotateY(m, a) {
  const c=Math.cos(a),s=Math.sin(a),r=[...m];
  r[0]=m[0]*c+m[8]*s; r[8]=m[8]*c-m[0]*s; r[2]=m[2]*c+m[10]*s; r[10]=m[10]*c-m[2]*s;
  return r;
}

function rotateX(m, a) {
  const c=Math.cos(a),s=Math.sin(a),r=[...m];
  r[4]=m[4]*c+m[8]*s; r[8]=m[8]*c-m[4]*s; r[5]=m[5]*c+m[9]*s; r[9]=m[9]*c-m[5]*s;
  return r;
}

function setVerts(data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
}

function setCols(data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aCol);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
}

const proj = persp(Math.PI/3, canvas.width/canvas.height, 0.1, 500);
gl.uniformMatrix4fv(uP, false, new Float32Array(proj));

let score = 0, speed = 0, maxSpeed = 3, accel = 0.02, steer = 0;
let playerX = 0, playerZ = 0;
let roadSegs = [], obstacles = [];
let keys = {};

for (let i = 0; i < 100; i++) roadSegs.push({ z: i * 5, curve: Math.sin(i * 0.1) * 2 });
for (let i = 0; i < 20; i++) obstacles.push({ x: (Math.random()-0.5)*6, z: 50 + i * 15, w: 0.8, h: 0.8 });

document.addEventListener('keydown', e => { keys[e.key] = true; e.preventDefault(); });
document.addEventListener('keyup', e => keys[e.key] = false);

function update() {
  if (keys['ArrowUp']) speed = Math.min(speed + accel, maxSpeed);
  else speed = Math.max(speed - 0.01, 0);
  if (keys['ArrowDown']) speed = Math.max(speed - 0.05, 0);
  if (keys['ArrowLeft']) steer = Math.max(steer - 0.02, -0.3);
  else if (keys['ArrowRight']) steer = Math.min(steer + 0.02, 0.3);
  else steer *= 0.9;

  playerX += steer * speed;
  playerX = Math.max(-3, Math.min(3, playerX));
  playerZ -= speed;
  score += Math.floor(speed * 10);

  obstacles.forEach(o => {
    if (Math.abs(o.x - playerX) < o.w && Math.abs(o.z - playerZ % 150 - 50) < 1) {
      speed *= 0.5;
    }
  });

  document.getElementById('score').textContent = score;
  document.getElementById('speed').textContent = Math.floor(speed * 60) + ' km/h';
}

function render() {
  gl.clearColor(0, 0, 0.05, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Road
  const roadVerts = [], roadCols = [];
  for (let i = 0; i < 80; i++) {
    const z1 = playerZ + i * 5;
    const z2 = z1 + 5;
    const x1 = Math.sin(z1 * 0.02) * 2 + steer * 2;
    const x2 = Math.sin(z2 * 0.02) * 2 + steer * 2;
    roadVerts.push(x1-2, -2, -(z1%200), x1+2, -2, -(z1%200), x2+2, -2, -(z2%200));
    roadVerts.push(x1-2, -2, -(z1%200), x2+2, -2, -(z2%200), x2-2, -2, -(z2%200));
    const stripe = i % 4 < 2 ? [0.2,0.2,0.2] : [0.3,0.3,0.3];
    roadCols.push(...stripe, ...stripe, ...stripe, ...stripe, ...stripe, ...stripe);
  }
  setVerts(roadVerts); setCols(roadCols);
  gl.uniformMatrix4fv(uMV, false, new Float32Array(ident()));
  gl.drawArrays(gl.TRIANGLES, 0, roadVerts.length / 3);

  // Road edges
  const edgeVerts = [], edgeCols = [];
  for (let i = 0; i < 80; i++) {
    const z1 = playerZ + i * 5;
    const z2 = z1 + 5;
    const x1 = Math.sin(z1 * 0.02) * 2 + steer * 2;
    const x2 = Math.sin(z2 * 0.02) * 2 + steer * 2;
    edgeVerts.push(x1-2.1, -1.9, -(z1%200), x1-1.9, -1.9, -(z1%200), x2-1.9, -1.9, -(z2%200));
    edgeVerts.push(x1+1.9, -1.9, -(z1%200), x1+2.1, -1.9, -(z1%200), x2+2.1, -1.9, -(z2%200));
    edgeCols.push(1,0.5,0, 1,0.5,0, 1,0.5,0, 1,0.5,0, 1,0.5,0, 1,0.5,0);
  }
  setVerts(edgeVerts); setCols(edgeCols);
  gl.drawArrays(gl.TRIANGLES, 0, edgeVerts.length / 3);

  // Player car
  let mv = translate(ident(), playerX, -1.5, -5);
  mv = rotateY(mv, steer * 0.5);
  setVerts([-0.4,0,-1, 0.4,0,-1, 0.4,0.3,-1, -0.4,0,-1, 0.4,0.3,-1, -0.4,0.3,-1,
            -0.4,0,1, 0.4,0,1, 0.4,0.3,1, -0.4,0,1, 0.4,0.3,1, -0.4,0.3,1,
            -0.4,0,-1, -0.4,0.3,-1, -0.4,0.3,1, -0.4,0,-1, -0.4,0.3,1, -0.4,0,1,
            0.4,0,-1, 0.4,0.3,-1, 0.4,0.3,1, 0.4,0,-1, 0.4,0.3,1, 0.4,0,1,
            -0.4,0.3,-1, 0.4,0.3,-1, 0.4,0.3,1, -0.4,0.3,-1, 0.4,0.3,1, -0.4,0.3,1]);
  setCols(new Array(36*3).fill(0).map((_,i) => i%9<6 ? (i%3===0?0.2:0.6) : 0.2));
  gl.uniformMatrix4fv(uMV, false, new Float32Array(mv));
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // Obstacles
  obstacles.forEach(o => {
    const oz = (o.z - playerZ) % 150;
    if (oz > -5 && oz < 50) {
      const omv = translate(ident(), o.x, -1.2, -oz);
      setVerts([-0.3,-0.5,-0.3, 0.3,-0.5,-0.3, 0.3,0.5,-0.3, -0.3,-0.5,-0.3, 0.3,0.5,-0.3, -0.3,0.5,-0.3,
                -0.3,-0.5,0.3, 0.3,-0.5,0.3, 0.3,0.5,0.3, -0.3,-0.5,0.3, 0.3,0.5,0.3, -0.3,0.5,0.3]);
      setCols(new Array(36).fill(0).map((_,i) => i%3===0?1:0.2));
      gl.uniformMatrix4fv(uMV, false, new Float32Array(omv));
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
  });

  // Stars
  const starVerts = [], starCols = [];
  for (let i = 0; i < 100; i++) {
    const x = ((i*173)%20)-10;
    const y = ((i*91)%8)+2;
    const z = ((i*37)%40)-20;
    starVerts.push(x, y, -z);
    starCols.push(1, 1, 1);
  }
  setVerts(starVerts); setCols(starCols);
  gl.uniformMatrix4fv(uMV, false, new Float32Array(ident()));
  gl.drawArrays(gl.POINTS, 0, 100);

  requestAnimationFrame(render);
}

setInterval(update, 16);
render();
</script>
</body>
</html>`;
}

function generateWebGLScene(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; font-family: 'Courier New', monospace; }
  canvas { display: block; }
  #ui { position: absolute; top: 20px; left: 20px; color: #fff; z-index: 10; text-shadow: 0 0 10px rgba(255,255,255,0.5); }
  #ui h2 { font-size: 24px; }
  #ui p { font-size: 12px; opacity: 0.7; margin-top: 4px; }
</style>
</head>
<body>
<div id="ui"><h2>${title}</h2><p>WASD to move | Mouse to look | Click to place block</p><p>Scroll to zoom</p></div>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const vs = \`
attribute vec4 aP;
attribute vec3 aC;
uniform mat4 uMV, uP;
varying vec3 vC;
void main() {
  gl_Position = uP * uMV * aP;
  vC = aC;
}
\`;
const fs = \`
precision mediump float;
varying vec3 vC;
void main() { gl_FragColor = vec4(vC, 1.0); }
\`;

function mkS(t, s) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; }
const p = gl.createProgram();
gl.attachShader(p, mkS(gl.VERTEX_SHADER, vs));
gl.attachShader(p, mkS(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(p);
gl.useProgram(p);

const aP = gl.getAttribLocation(p, 'aP');
const aC = gl.getAttribLocation(p, 'aC');
const uMV = gl.getUniformLocation(p, 'uMV');
const uP = gl.getUniformLocation(p, 'uP');
gl.enable(gl.DEPTH_TEST);

const buf = gl.createBuffer(), cbuf = gl.createBuffer();
let camX=0, camY=3, camZ=8, camRX=-0.3, camRY=0;
let keys={}, blocks=[{x:0,y:0,z:0,r:0.2,g:0.6,b:1},{x:1,y:0,z:0,r:1,g:0.3,b:0.3},{x:0,y:1,z:0,r:0.3,g:1,b:0.3},{x:-1,y:0,z:-1,r:1,g:1,b:0.3},{x:2,y:0,z:1,r:0.8,g:0.3,b:0.8}];
let zoom = 1;

function persp(f,a,n,fo){const t=1/Math.tan(f/2),nf=1/(n-fo);return[t/a,0,0,0,0,t,0,0,0,0,(fo+n)*nf,-1,0,2*fo*n*nf,0]}
function ident(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function trans(m,x,y,z){const r=[...m];r[12]=m[0]*x+m[4]*y+m[8]*z+m[12];r[13]=m[1]*x+m[5]*y+m[9]*z+m[13];r[14]=m[2]*x+m[6]*y+m[10]*z+m[14];r[15]=m[3]*x+m[7]*y+m[11]*z+m[15];return r}
function rotY(m,a){const c=Math.cos(a),s=Math.sin(a),r=[...m];r[0]=m[0]*c+m[8]*s;r[8]=m[8]*c-m[0]*s;r[2]=m[2]*c+m[10]*s;r[10]=m[10]*c-m[2]*s;return r}
function rotX(m,a){const c=Math.cos(a),s=Math.sin(a),r=[...m];r[4]=m[4]*c+m[8]*s;r[8]=m[8]*c-m[4]*s;r[5]=m[5]*c+m[9]*s;r[9]=m[9]*c-m[5]*s;return r}

document.addEventListener('keydown', e=>{keys[e.key]=true;e.preventDefault()});
document.addEventListener('keyup', e=>keys[e.key]=false);
document.addEventListener('mousemove', e=>{
  if(document.pointerLockElement===canvas){camRY+=e.movementX*0.002;camRX-=e.movementY*0.002;camRX=Math.max(-1.5,Math.min(1.5,camRX))}
});
canvas.addEventListener('click',()=>{if(!document.pointerLockElement)canvas.requestPointerLock()});
canvas.addEventListener('wheel', e=>{zoom=Math.max(0.3,Math.min(3,zoom-e.deltaY*0.001))});

function update(){
  const spd=0.1;
  if(keys['w']){camZ-=spd*Math.cos(camRY);camX-=spd*Math.sin(camRY)}
  if(keys['s']){camZ+=spd*Math.cos(camRY);camX+=spd*Math.sin(camRY)}
  if(keys['a']){camX-=spd*Math.cos(camRY);camZ+=spd*Math.sin(camRY)}
  if(keys['d']){camX+=spd*Math.cos(camRY);camZ-=spd*Math.sin(camRY)}
}

function drawCube(x,y,z,sx,sy,sz,r,g,b){
  const v=[-1,-1,-1,1,-1,-1,1,1,-1,-1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,
    -1,-1,-1,-1,1,-1,-1,1,1,-1,-1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,
    -1,1,-1,1,1,-1,1,1,1,-1,1,-1,1,1,1,-1,1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,-1,-1,1];
  const d=[];
  for(let i=0;i<v.length;i+=3)d.push(v[i]*sx,v[i+1]*sy,v[i+2]*sz);
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,cbuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(new Array(d.length/3*3).fill(0).map((_,i)=>i%3===0?r:i%3===1?g:b)),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aC);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,0,0);
  let mv=trans(ident(),x,y,z);
  gl.uniformMatrix4fv(uMV,false,new Float32Array(mv));
  gl.drawArrays(gl.TRIANGLES,0,36);
}

function render(){
  gl.clearColor(0.02,0.02,0.08,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  let view=trans(ident(),0,0,-zoom*8);
  view=rotX(view,camRX);view=rotY(view,camRY);
  view=trans(view,-camX,-camY,-camZ);
  const proj=persp(Math.PI/3,canvas.width/canvas.height,0.1,200);
  gl.uniformMatrix4fv(uP,false,new Float32Array(proj));
  gl.uniformMatrix4fv(uMV,false,new Float32Array(view));

  // Grid
  const gv=[],gc=[];
  for(let i=-10;i<=10;i++){
    gv.push(i,0,-10,i,0,10,-10,0,i,10,0,i);
    gc.push(0.1,0.1,0.15, 0.1,0.1,0.15, 0.1,0.1,0.15, 0.1,0.1,0.15, 0.1,0.1,0.15, 0.1,0.1,0.15);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(gv),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,cbuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(gc),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aC);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,0,0);
  gl.drawArrays(gl.LINES,0,gv.length/3);

  blocks.forEach(b=>drawCube(b.x,b.y+0.5,b.z,1,1,1,b.r,b.g,b.b));

  // Axes
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,0,3,0,0, 0,0,0,0,3,0, 0,0,0,0,0,3]),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,cbuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([1,0,0,1,0,0, 0,1,0,0,1,0, 0,0,1,0,0,1]),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aC);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,0,0);
  gl.drawArrays(gl.LINES,0,6);

  requestAnimationFrame(render);
}
setInterval(update,16);render();
</script>
</body>
</html>`;
}

function generateFlappy(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #e94560; border-radius: 8px; background: #16213e; }
  #score { position: absolute; top: 20px; color: #fff; font: bold 32px 'Courier New', monospace; text-shadow: 0 0 15px #e94560; z-index: 10; }
</style>
</head>
<body>
<div id="score">0</div>
<canvas id="g" width="400" height="600"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
let bird = { x: 80, y: 250, vy: 0, r: 15 };
let pipes = [], score = 0, gameOver = false, frame = 0;
const GRAVITY = 0.35, FLAP = -6.5, PIPE_W = 50, GAP = 150, PIPE_SPEED = 2.5;

document.addEventListener('keydown', e => { if (e.code === 'Space') flap(); });
document.addEventListener('click', flap);
document.addEventListener('touchstart', e => { e.preventDefault(); flap(); });

function flap() {
  if (gameOver) { bird = { x: 80, y: 250, vy: 0, r: 15 }; pipes = []; score = 0; gameOver = false; frame = 0; }
  else bird.vy = FLAP;
}

function update() {
  if (gameOver) return;
  frame++;
  bird.vy += GRAVITY;
  bird.y += bird.vy;
  if (bird.y > 580 || bird.y < 0) gameOver = true;
  if (frame % 90 === 0) {
    const gapY = 80 + Math.random() * 300;
    pipes.push({ x: 400, gapY, scored: false });
  }
  pipes.forEach(p => {
    p.x -= PIPE_SPEED;
    if (!p.scored && p.x + PIPE_W < bird.x) { p.scored = true; score++; document.getElementById('score').textContent = score; }
    if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W) {
      if (bird.y - bird.r < p.gapY || bird.y + bird.r > p.gapY + GAP) gameOver = true;
    }
  });
  pipes = pipes.filter(p => p.x > -PIPE_W);
}

function draw() {
  ctx.fillStyle = '#16213e'; ctx.fillRect(0, 0, 400, 600);

  // Pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#e94560'; ctx.shadowBlur = 15; ctx.shadowColor = '#e94560';
    ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
    ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, 600 - p.gapY - GAP);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f3460'; ctx.fillRect(p.x + 5, 0, PIPE_W - 10, p.gapY - 10);
    ctx.fillRect(p.x + 5, p.gapY + GAP + 10, PIPE_W - 10, 600 - p.gapY - GAP - 10);
  });

  // Bird
  ctx.fillStyle = '#533483'; ctx.shadowBlur = 20; ctx.shadowColor = '#533483';
  ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(bird.x + 5, bird.y - 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(bird.x + 6, bird.y - 4, 2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 400, 600);
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 200, 280);
    ctx.fillStyle = '#fff'; ctx.font = '18px Courier New';
    ctx.fillText('Score: ' + score, 200, 320);
    ctx.fillText('Tap or press SPACE', 200, 350);
  }

  requestAnimationFrame(draw);
}
setInterval(update, 16); draw();
</script>
</body>
</html>`;
}

function generateTetris(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f0f23; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Courier New', monospace; }
  canvas { border: 2px solid #00d4ff; border-radius: 4px; background: #0a0a1a; }
</style>
</head>
<body>
<canvas id="g" width="300" height="600"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
const COLS = 10, ROWS = 20, SZ = 30;
const COLORS = ['#000','#ff0055','#00ff88','#0088ff','#ffaa00','#aa00ff','#ff5500','#00ff00'];
const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]]
];
let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
let piece, px, py, color, score = 0, gameOver = false, dropTimer = 0;

function spawn() {
  const i = Math.floor(Math.random() * SHAPES.length);
  piece = SHAPES[i].map(r => [...r]);
  color = i + 1;
  px = Math.floor((COLS - piece[0].length) / 2);
  py = 0;
  if (collides(piece, px, py)) gameOver = true;
}

function collides(p, ox, oy) {
  for (let r = 0; r < p.length; r++)
    for (let col = 0; col < p[r].length; col++)
      if (p[r][col]) {
        const nx = ox + col, ny = oy + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx]) return true;
      }
  return false;
}

function lock() {
  piece.forEach((row, r) => row.forEach((v, col) => { if (v && py + r >= 0) grid[py + r][px + col] = color; }));
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r].every(v => v)) { grid.splice(r, 1); grid.unshift(Array(COLS).fill(0)); cleared++; r++; }
  }
  score += cleared * cleared * 100;
  spawn();
}

function rotate(p) {
  const rows = p.length, cols = p[0].length;
  return Array(cols).fill(null).map((_, c) => Array(rows).fill(null).map((_, r) => p[rows - 1 - r][c]));
}

document.addEventListener('keydown', e => {
  if (gameOver) { grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0)); score = 0; gameOver = false; spawn(); return; }
  if (e.key === 'ArrowLeft' && !collides(piece, px - 1, py)) px--;
  if (e.key === 'ArrowRight' && !collides(piece, px + 1, py)) px++;
  if (e.key === 'ArrowDown') { while (!collides(piece, px, py + 1)) py++; lock(); }
  if (e.key === 'ArrowUp') { const r = rotate(piece); if (!collides(r, px, py)) piece = r; }
  if (e.key === ' ') { while (!collides(piece, px, py + 1)) py++; lock(); }
});

function update() {
  if (gameOver) return;
  dropTimer++;
  if (dropTimer >= 30) { dropTimer = 0; if (!collides(piece, px, py + 1)) py++; else lock(); }
}

function draw() {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 300, 600);
  grid.forEach((row, r) => row.forEach((v, col) => {
    if (v) { ctx.fillStyle = COLORS[v]; ctx.fillRect(col * SZ, r * SZ, SZ - 1, SZ - 1); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5; ctx.strokeRect(col * SZ, r * SZ, SZ - 1, SZ - 1); }
  }));
  if (piece) {
    ctx.fillStyle = COLORS[color];
    piece.forEach((row, r) => row.forEach((v, col) => { if (v) ctx.fillRect((px + col) * SZ, (py + r) * SZ, SZ - 1, SZ - 1); }));
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 25);
  ctx.fillText('Arrow Keys + Space', 10, 585);
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, 300, 600);
    ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 28px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 150, 290);
    ctx.fillStyle = '#fff'; ctx.font = '14px Courier New';
    ctx.fillText('Press any key', 150, 320);
  }
  requestAnimationFrame(draw);
}
spawn(); setInterval(update, 16); draw();
</script>
</body>
</html>`;
}

function generateRacing(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #ff6b35; border-radius: 8px; background: #1a1a2e; }
</style>
</head>
<body>
<canvas id="g" width="400" height="600"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
let player = { x: 180, w: 40, h: 60, y: 500 };
let road = { x: 50, w: 300, lines: [] };
let obstacles = [], score = 0, high = parseInt(localStorage.getItem('raceHigh') || '0'), gameOver = false, speed = 3;
let keys = {};
for (let i = 0; i < 6; i++) road.lines.push({ y: i * 100 });

document.addEventListener('keydown', e => { keys[e.key] = true; if (gameOver && e.key === ' ') restart(); });
document.addEventListener('keyup', e => keys[e.key] = false);
function restart() { gameOver = false; score = 0; speed = 3; obstacles = []; player.x = 180; }

function update() {
  if (gameOver) { ctx.fillStyle = '#ff6b35'; ctx.font = '36px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', 200, 280); ctx.font = '18px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('Score: ' + score + ' | Press SPACE', 200, 340); return; }
  if (keys['ArrowLeft'] && player.x > road.x) player.x -= 5;
  if (keys['ArrowRight'] && player.x < road.x + road.w - player.w) player.x += 5;
  road.lines.forEach(l => { l.y += speed; if (l.y > 600) l.y = -100; });
  if (score % 50 === 0 && score > 0) speed = Math.min(speed + 0.2, 8);
  if (Math.random() < 0.02) { let w = 40 + Math.random() * 30; obstacles.push({ x: road.x + 20 + Math.random() * (road.w - w - 40), y: -60, w, h: 60 + Math.random() * 40 }); }
  obstacles = obstacles.filter(o => o.y < 650);
  obstacles.forEach(o => { o.y += speed; ctx.fillStyle = '#ff4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff4444'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.shadowBlur = 0; });
  obstacles.forEach(o => { if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) gameOver = true; });
  score++; if (score > high) { high = score; localStorage.setItem('raceHigh', high); }
}

function draw() {
  ctx.fillStyle = '#2a2a3e'; ctx.fillRect(road.x, 0, road.w, 600);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([20, 20]); ctx.strokeRect(road.x, 0, road.w, 600); ctx.setLineDash([]);
  road.lines.forEach(l => { ctx.fillStyle = '#fff'; ctx.fillRect(road.x + road.w / 2 - 2, l.y, 4, 40); });
  obstacles.forEach(o => { ctx.fillStyle = '#ff4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff4444'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.shadowBlur = 0; });
  ctx.fillStyle = '#4fc3f7'; ctx.shadowBlur = 15; ctx.shadowColor = '#4fc3f7'; ctx.fillRect(player.x, player.y, player.w, player.h); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Score: ' + score + ' | High: ' + high, 10, 25);
  requestAnimationFrame(draw);
}
setInterval(update, 16); draw();
</script>
</body>
</html>`;
}

function generateShooter(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #00ff88; border-radius: 8px; background: #0d0d1a; }
</style>
</head>
<body>
<canvas id="g" width="600" height="500"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
let ship = { x: 270, w: 60, y: 430, h: 40 };
let bullets = [], enemies = [], particles = [], score = 0, gameOver = false;
let keys = {};
document.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' ' && !gameOver) bullets.push({ x: ship.x + ship.w / 2 - 3, y: ship.y - 10, w: 6, h: 15 }); if (gameOver && e.key === ' ') restart(); });
document.addEventListener('keyup', e => keys[e.key] = false);
function restart() { gameOver = false; score = 0; enemies = []; bullets = []; particles = []; }
setInterval(() => { if (!gameOver) enemies.push({ x: Math.random() * 540, y: -30, w: 30 + Math.random() * 20, h: 25 + Math.random() * 20, speed: 1 + Math.random() * 2, color: ['#ff4444','#ff6600','#ff0066'][Math.floor(Math.random()*3)] }); }, 600);

function update() {
  if (gameOver) return;
  if (keys['ArrowLeft'] && ship.x > 0) ship.x -= 6;
  if (keys['ArrowRight'] && ship.x < 540) ship.x += 6;
  bullets.forEach(b => b.y -= 8);
  bullets = bullets.filter(b => b.y > -20);
  enemies.forEach(e => e.y += e.speed);
  enemies = enemies.filter(e => e.y < 520);
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        for (let i = 0; i < 12; i++) particles.push({ x: e.x + e.w/2, y: e.y + e.h/2, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6, life: 1, color: e.color });
        bullets.splice(bi, 1); enemies.splice(ei, 1); score += 10;
      }
    });
  });
  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; p.vy += 0.1; });
  particles = particles.filter(p => p.life > 0);
  enemies.forEach(e => { if (e.y + e.h > ship.y && e.x < ship.x + ship.w && e.x + e.w > ship.x) gameOver = true; });
}

function draw() {
  ctx.clearRect(0, 0, 600, 500);
  // Ship
  ctx.fillStyle = '#4fc3f7'; ctx.shadowBlur = 20; ctx.shadowColor = '#4fc3f7';
  ctx.beginPath(); ctx.moveTo(ship.x + ship.w/2, ship.y - 10); ctx.lineTo(ship.x, ship.y + ship.h); ctx.lineTo(ship.x + ship.w, ship.y + ship.h); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  // Bullets
  bullets.forEach(b => { ctx.fillStyle = '#ffeb3b'; ctx.shadowBlur = 10; ctx.shadowColor = '#ffeb3b'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.shadowBlur = 0; });
  // Enemies
  enemies.forEach(e => { ctx.fillStyle = e.color; ctx.shadowBlur = 10; ctx.shadowColor = e.color; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.shadowBlur = 0; });
  // Particles
  particles.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Score: ' + score, 10, 25);
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, 600, 500);
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 300, 230); ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    ctx.fillText('Score: ' + score + ' | Press SPACE', 300, 280);
  }
  requestAnimationFrame(draw);
}
setInterval(update, 16); draw();
</script>
</body>
</html>`;
}

function generatePuzzle(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #ff9800; border-radius: 8px; background: #1a1a2e; }
</style>
</head>
<body>
<canvas id="g" width="400" height="400"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
let grid = Array(4).fill().map(() => Array(4).fill(0)), score = 0, gameOver = false;
const colors = { 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563', 32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72', 256:'#edcc61', 512:'#edc850', 1024:'#edc53f', 2048:'#edc22e' };
function addTile() { let empty = []; for (let r = 0; r < 4; r++) for (let col = 0; col < 4; col++) if (!grid[r][col]) empty.push([r, col]); if (empty.length) { let [r, col] = empty[Math.floor(Math.random() * empty.length)]; grid[r][col] = Math.random() < 0.9 ? 2 : 4; } }
function slide(row) { let arr = row.filter(v => v); for (let i = 0; i < arr.length - 1; i++) { if (arr[i] === arr[i + 1]) { arr[i] *= 2; score += arr[i]; arr.splice(i + 1, 1); } } while (arr.length < 4) arr.push(0); return arr; }
function move(dir) {
  let changed = false;
  for (let i = 0; i < 4; i++) {
    let col = grid.map(r => r[i]);
    if (dir === 'left') { let n = slide(grid[i]); if (n.join() !== grid[i].join()) changed = true; grid[i] = n; }
    if (dir === 'right') { let n = slide(grid[i].reverse()).reverse(); if (n.join() !== grid[i].join()) changed = true; grid[i] = n; }
    if (dir === 'up') { let n = slide(col); for (let r = 0; r < 4; r++) { if (grid[r][i] !== n[r]) changed = true; grid[r][i] = n[r]; } }
    if (dir === 'down') { let n = slide(col.reverse()).reverse(); for (let r = 0; r < 4; r++) { if (grid[r][i] !== n[r]) changed = true; grid[r][i] = n[r]; } }
  }
  if (changed) addTile();
  if (!changed) { let full = grid.every(r => r.every(v => v)); if (full) gameOver = true; }
}
document.addEventListener('keydown', e => {
  if (gameOver && e.key === ' ') { grid = Array(4).fill().map(() => Array(4).fill(0)); score = 0; gameOver = false; addTile(); addTile(); return; }
  if (e.key.startsWith('Arrow')) { e.preventDefault(); move(e.key.slice(5).toLowerCase()); }
});
addTile(); addTile();
function draw() {
  ctx.clearRect(0, 0, 400, 400);
  grid.forEach((row, r) => row.forEach((v, col) => {
    let x = col * 100 + 5, y = r * 100 + 5;
    ctx.fillStyle = colors[v] || '#3c3a32';
    ctx.shadowBlur = v > 0 ? 10 : 0; ctx.shadowColor = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, 90, 90); ctx.shadowBlur = 0;
    if (v) { ctx.fillStyle = v > 4 ? '#fff' : '#776e65'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v, x + 45, y + 45); }
  }));
  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Score: ' + score, 10, 385);
  if (gameOver) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 400, 400); ctx.fillStyle = '#ff9800'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', 200, 200); ctx.font = '16px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('Press SPACE', 200, 240); }
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;
}

function generateSnake(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #00e676; border-radius: 8px; background: #1a1a2e; }
</style>
</head>
<body>
<canvas id="g" width="400" height="400"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d'), size = 20;
let snake = [{ x: 10, y: 10 }], food = { x: 15, y: 15 }, dir = { x: 0, y: 0 }, nextDir = { x: 0, y: 0 }, score = 0, gameOver = false;
document.addEventListener('keydown', e => {
  if (gameOver && e.key === ' ') { snake = [{ x: 10, y: 10 }]; dir = { x: 0, y: 0 }; nextDir = { x: 0, y: 0 }; score = 0; gameOver = false; placeFood(); return; }
  const d = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } }[e.key];
  if (d && (dir.x + d.x !== 0 || dir.y + d.y !== 0)) nextDir = d;
});
function placeFood() { food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20 }; }
placeFood();
setInterval(() => {
  if (gameOver) return;
  dir = nextDir;
  let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) { gameOver = true; return; }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) { score++; placeFood(); } else snake.pop();
}, 150);
function draw() {
  ctx.clearRect(0, 0, 400, 400);
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#00e676' : '#4caf50';
    ctx.shadowBlur = i === 0 ? 15 : 5; ctx.shadowColor = '#00e676';
    ctx.fillRect(s.x * size, s.y * size, size - 2, size - 2); ctx.shadowBlur = 0;
  });
  ctx.fillStyle = '#ff5252'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff5252';
  ctx.fillRect(food.x * size, food.y * size, size - 2, size - 2); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.fillText('Score: ' + score, 10, 20);
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#00e676'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 200, 200); ctx.font = '16px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score + ' | Press SPACE', 200, 240);
  }
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;
}

function generatePong(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #448aff; border-radius: 8px; background: #1a1a2e; }
</style>
</head>
<body>
<canvas id="g" width="600" height="400"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
let ball = { x: 300, y: 200, r: 8, vx: 4, vy: 3 };
let p1 = { y: 160, w: 10, h: 80, score: 0 }, p2 = { y: 160, w: 10, h: 80, score: 0 };
let gameOver = false;
c.addEventListener('mousemove', e => { let rect = c.getBoundingClientRect(); p1.y = e.clientY - rect.top - p1.h / 2; });
function reset() { ball.x = 300; ball.y = 200; ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4; ball.vy = (Math.random() > 0.5 ? 1 : -1) * 3; }
function update() {
  if (gameOver) return;
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.y - ball.r < 0 || ball.y + ball.r > 400) ball.vy *= -1;
  if (ball.x - ball.r < 0) { p2.score++; if (p2.score >= 5) gameOver = true; reset(); }
  if (ball.x + ball.r > 600) { p1.score++; if (p1.score >= 5) gameOver = true; reset(); }
  if (ball.x - ball.r < p1.w + 10 && ball.y > p1.y && ball.y < p1.y + p1.h) { ball.vx = Math.abs(ball.vx); ball.vx *= 1.05; }
  if (ball.x + ball.r > 590 - p2.w && ball.y > p2.y && ball.y < p2.y + p2.h) { ball.vx = -Math.abs(ball.vx); ball.vx *= 1.05; }
  let target = ball.y - p2.h / 2; p2.y += (target - p2.y) * 0.08;
}
setInterval(update, 16);
function draw() {
  ctx.clearRect(0, 0, 600, 400);
  ctx.fillStyle = '#448aff'; ctx.shadowBlur = 10; ctx.shadowColor = '#448aff';
  ctx.fillRect(10, p1.y, p1.w, p1.h); ctx.fillRect(580, p2.y, p2.w, p2.h); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.shadowBlur = 20; ctx.shadowColor = '#fff'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(300, 400); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); ctx.setLineDash([]);
  ctx.font = '24px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.fillText(p1.score, 150, 40); ctx.fillText(p2.score, 450, 40);
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 600, 400);
    ctx.fillStyle = '#448aff'; ctx.font = 'bold 36px sans-serif'; ctx.fillText('GAME OVER', 300, 200);
    ctx.font = '18px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText((p1.score > p2.score ? 'You Win!' : 'AI Wins!') + ' Final: ' + p1.score + '-' + p2.score, 300, 250);
  }
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;
}

function generatePlatformer(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
  canvas { border: 2px solid #ff6b35; border-radius: 8px; background: #1a1a2e; }
</style>
</head>
<body>
<canvas id="g" width="700" height="350"></canvas>
<script>
const c = document.getElementById('g'), ctx = c.getContext('2d');
let x = 80, y = 280, w = 35, h = 35, vy = 0, g = 0.6, jump = -10, ground = 315;
let obstacles = [], coins = [], score = 0, gameOver = false;
let keys = {};
document.addEventListener('keydown', e => { keys[e.key] = true; if (gameOver && e.key === ' ') restart(); });
document.addEventListener('keyup', e => keys[e.key] = false);
function restart() { gameOver = false; score = 0; obstacles = []; coins = []; x = 80; y = 280; vy = 0; }

function update() {
  if (gameOver) return;
  vy += g; y += vy;
  if (y > ground - h) { y = ground - h; vy = 0; }
  if (y === ground - h && (keys['ArrowUp'] || keys[' '])) vy = jump;
  if (keys['ArrowLeft'] && x > 0) x -= 4;
  if (keys['ArrowRight'] && x < 665) x += 4;
  obstacles = obstacles.filter(o => o.x > -50);
  if (score % 80 === 0 && !gameOver) { let oh = 30 + Math.random() * 30; obstacles.push({ x: 700, y: ground - oh, w: 25 + Math.random() * 15, h: oh }); }
  if (Math.random() < 0.02 && coins.length < 5) coins.push({ x: 700, y: ground - 40 - Math.random() * 100, r: 8 });
  obstacles.forEach(o => { o.x -= 4 + score / 200; if (x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y) gameOver = true; });
  coins.forEach(c => { c.x -= 4 + score / 200; if (Math.abs(x + w/2 - c.x) < w/2 + c.r && Math.abs(y + h/2 - c.y) < h/2 + c.r) { score += 20; c.x = -100; } });
  coins = coins.filter(c => c.x > -50);
  score++;
}

function draw() {
  ctx.clearRect(0, 0, 700, 350);
  // Ground
  ctx.fillStyle = '#2d5a27'; ctx.fillRect(0, ground, 700, 350 - ground);
  // Player
  ctx.fillStyle = '#4fc3f7'; ctx.shadowBlur = 15; ctx.shadowColor = '#4fc3f7';
  ctx.fillRect(x, y, w, h); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(x + 5, y + 5, 8, 8); ctx.fillStyle = '#000'; ctx.fillRect(x + 8, y + 8, 3, 3);
  // Obstacles
  obstacles.forEach(o => { ctx.fillStyle = '#ff6b35'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff6b35'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.shadowBlur = 0; });
  // Coins
  coins.forEach(cn => { ctx.fillStyle = '#ffd700'; ctx.shadowBlur = 10; ctx.shadowColor = '#ffd700'; ctx.beginPath(); ctx.arc(cn.x, cn.y, cn.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
  ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText('Score: ' + score, 10, 25);
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 700, 350);
    ctx.fillStyle = '#ff6b35'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 350, 170); ctx.font = '18px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score + ' | Press SPACE', 350, 220);
  }
  requestAnimationFrame(draw);
}
setInterval(update, 16); draw();
</script>
</body>
</html>`;
}

export async function generateGame(request: GameRequest): Promise<GameResult> {
  const dim = request.dimension || "2d";
  const prompt = `Create a complete, playable ${dim.toUpperCase()} ${request.genre || "platformer"} game as a single HTML file.
Requirements:
- Theme/idea: ${request.prompt}
- HTML5 for structure and Canvas/WebGL rendering
- CSS3 for styling, animations, and visual effects
- JavaScript for game logic, physics, interactivity, and asset handling${dim === "3d" ? "\n- WebGL for GPU-accelerated 3D graphics with shaders, perspective projection, and 3D transforms" : "\n- Canvas 2D for rendering with shadows, gradients, and particle effects"}
- Keyboard and/or mouse controls
- Score tracking and HUD
- Game over / restart functionality
- Polished visuals with colors, glow effects, and animations
- Return ONLY valid standalone HTML

Return as JSON: { "html": "full HTML string", "title": "game title", "description": "short description", "instructions": "how to play", "techStack": ["HTML5", "CSS3", "JavaScript"${dim === "3d" ? ', "WebGL"' : ""}] }`;

  const shouldTryAI = isApiKeySet() || await checkOllama();
  if (shouldTryAI) {
    try {
      const systemPrompt = "You are a game developer. Generate complete, playable HTML5 games using Canvas 2D or WebGL for rendering, CSS3 for styling, and JavaScript for game logic. Return only valid JSON.";
      const result = await chatCompletion(getModel(), systemPrompt, prompt, { temperature: 0.8, maxTokens: 8192 });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.techStack = parsed.techStack || ["HTML5", "CSS3", "JavaScript"];
        return parsed;
      }
    } catch {}
  }

  return generateGameLocal(request);
}
