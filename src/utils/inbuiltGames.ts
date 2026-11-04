/**
 * Self-Contained Inbuilt HTML5 Canvas Game Engines
 * Zero latency, zero external network requests, zero X-Frame-Options blocking.
 * Includes Web Audio API retro sound synthesis and full responsive canvas.
 */

const UNIVERSAL_INPUT_BRIDGE_SCRIPT = `
<script>
(function() {
  window.__MIKI_GAME_MODE = 'level';
  window.__MIKI_GAME_LEVEL = 1;

  window.addEventListener('message', function(ev) {
    if (!ev.data) return;
    if (ev.data.type === 'miki:game-input') {
      try {
        var synthetic = new KeyboardEvent(ev.data.action === 'down' ? 'keydown' : 'keyup', {
          key: ev.data.key,
          code: ev.data.code,
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(synthetic);
      } catch(err) {}
    } else if (ev.data.type === 'miki:set-game-mode') {
      if (ev.data.mode) {
        window.__MIKI_GAME_MODE = ev.data.mode;
      }
      if (typeof ev.data.level === 'number') {
        window.__MIKI_GAME_LEVEL = Math.max(1, Math.min(10, ev.data.level));
      }
      try {
        var customEv = new CustomEvent('miki:mode-change', {
          detail: { mode: window.__MIKI_GAME_MODE, level: window.__MIKI_GAME_LEVEL }
        });
        window.dispatchEvent(customEv);
        document.dispatchEvent(customEv);
      } catch(err) {}
    }
  });

  window.addEventListener('keydown', function(e) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
    try {
      window.parent.postMessage({ type: 'miki:key-activity', code: e.code, isDown: true }, '*');
    } catch(err) {}
  }, true);

  window.addEventListener('keyup', function(e) {
    try {
      window.parent.postMessage({ type: 'miki:key-activity', code: e.code, isDown: false }, '*');
    } catch(err) {}
  }, true);
})();
</script>
`;

import { getExpandedInbuiltGameSrcDoc } from './inbuiltExpandedEngines.ts';

export function getInbuiltGameSrcDoc(id: string): string {
  const expanded = getExpandedInbuiltGameSrcDoc(id);
  const rawDoc = expanded || getRawInbuiltGameSrcDoc(id);
  if (!rawDoc) return '';
  return rawDoc.replace('</body>', `${UNIVERSAL_INPUT_BRIDGE_SCRIPT}</body>`);
}

function getRawInbuiltGameSrcDoc(id: string): string {
  switch (id) {
    case '2048':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0b0f19; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h1 { margin: 0 0 10px; font-size: 28px; color: #38bdf8; display: flex; align-items: center; gap: 15px; }
  .score-box { background: #1e293b; padding: 4px 12px; border-radius: 10px; font-size: 14px; color: #f8fafc; border: 1px solid #334155; }
  #grid { display: grid; grid-template-columns: repeat(4, 70px); grid-template-rows: repeat(4, 70px); gap: 10px; background: #1e293b; padding: 10px; border-radius: 16px; border: 2px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .tile { width: 70px; height: 70px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; background: #334155; color: #f8fafc; transition: all 0.1s ease; }
  .tile-2 { background: #38bdf8; color: #0f172a; }
  .tile-4 { background: #818cf8; color: #0f172a; }
  .tile-8 { background: #c084fc; color: #0f172a; }
  .tile-16 { background: #f472b6; color: #fff; }
  .tile-32 { background: #fb7185; color: #fff; }
  .tile-64 { background: #f97316; color: #fff; }
  .tile-128 { background: #eab308; color: #0f172a; font-size: 20px; }
  .tile-256 { background: #10b981; color: #fff; font-size: 20px; }
  .tile-512 { background: #06b6d4; color: #fff; font-size: 20px; }
  .tile-1024 { background: #6366f1; color: #fff; font-size: 18px; }
  .tile-2048 { background: #ec4899; color: #fff; font-size: 18px; box-shadow: 0 0 20px #ec4899; }
  .hint { margin-top: 15px; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
  <h1>2048 <span class="score-box">SCORE: <span id="score">0</span></span></h1>
  <div id="grid"></div>
  <div class="hint">Use Arrow Keys or WASD to slide & combine tiles</div>
<script>
  let board = Array(16).fill(0);
  let score = 0;
  function addRandom() {
    let empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
    if (!empty.length) return;
    board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  }
  function render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    board.forEach(v => {
      const el = document.createElement('div');
      el.className = 'tile' + (v > 0 ? ' tile-' + v : '');
      el.textContent = v > 0 ? v : '';
      grid.appendChild(el);
    });
    document.getElementById('score').textContent = score;
  }
  function slide(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  }
  function move(dir) {
    let prev = [...board];
    for (let i = 0; i < 4; i++) {
      let line = [];
      for (let j = 0; j < 4; j++) {
        let idx = dir === 'left' ? i * 4 + j : dir === 'right' ? i * 4 + (3 - j) : dir === 'up' ? j * 4 + i : (3 - j) * 4 + i;
        line.push(board[idx]);
      }
      let slided = slide(line);
      for (let j = 0; j < 4; j++) {
        let idx = dir === 'left' ? i * 4 + j : dir === 'right' ? i * 4 + (3 - j) : dir === 'up' ? j * 4 + i : (3 - j) * 4 + i;
        board[idx] = slided[j];
      }
    }
    if (prev.some((v, i) => v !== board[i])) {
      addRandom();
      render();
    }
  }
  window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'KeyA'].includes(e.code)) move('left');
    else if (['ArrowRight', 'KeyD'].includes(e.code)) move('right');
    else if (['ArrowUp', 'KeyW'].includes(e.code)) move('up');
    else if (['ArrowDown', 'KeyS'].includes(e.code)) move('down');
  });
  addRandom(); addRandom(); render();
</script>
</body>
</html>`;

    case 'snake':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #090d16; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #10b981; font-size: 20px; }
  canvas { border: 2px solid #10b981; border-radius: 12px; background: #030712; box-shadow: 0 0 25px rgba(16, 185, 129, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>SNAKE RETRO <span style="color:#fff">SCORE: <span id="score">0</span></span></h2>
  <canvas id="c" width="400" height="400"></canvas>
  <div class="hud">Use Arrows / WASD to steer. Don't hit walls or yourself!</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let grid = 20, count = 0, score = 0;
  let snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
  let apple = { x: 320, y: 320 };
  function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
  function loop() {
    requestAnimationFrame(loop);
    if (++count < 6) return; count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.x += snake.dx; snake.y += snake.dy;
    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
      snake.x = 160; snake.y = 160; snake.cells = []; snake.maxCells = 4; snake.dx = grid; snake.dy = 0;
      score = 0; document.getElementById('score').textContent = score;
    }
    snake.cells.unshift({ x: snake.x, y: snake.y });
    if (snake.cells.length > snake.maxCells) snake.cells.pop();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(apple.x + grid/2, apple.y + grid/2, grid/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    snake.cells.forEach((cell, index) => {
      ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);
      if (cell.x === apple.x && cell.y === apple.y) {
        snake.maxCells++; score += 10;
        document.getElementById('score').textContent = score;
        apple.x = getRandomInt(0, 20) * grid; apple.y = getRandomInt(0, 20) * grid;
      }
      for (let i = index + 1; i < snake.cells.length; i++) {
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          snake.x = 160; snake.y = 160; snake.cells = []; snake.maxCells = 4; snake.dx = grid; snake.dy = 0;
          score = 0; document.getElementById('score').textContent = score;
        }
      }
    });
  }
  window.addEventListener('keydown', e => {
    if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
    else if ((e.code === 'ArrowUp' || e.code === 'KeyW') && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
    else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
    else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
  });
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'pong':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #060911; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #38bdf8; font-size: 20px; }
  canvas { border: 2px solid #38bdf8; border-radius: 12px; background: #000; box-shadow: 0 0 25px rgba(56, 189, 248, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>PONG ARCADE <span style="color:#38bdf8"><span id="pScore">0</span> : <span id="aiScore">0</span></span></h2>
  <canvas id="c" width="600" height="400"></canvas>
  <div class="hud">Use Mouse or Up/Down arrows to control left paddle</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let pY = 160, aiY = 160, pScore = 0, aiScore = 0;
  let bX = 300, bY = 200, bVx = 4, bVy = 3;
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    pY = e.clientY - rect.top - 40;
  });
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') pY -= 20;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') pY += 20;
  });
  function loop() {
    requestAnimationFrame(loop);
    bX += bVx; bY += bVy;
    if (bY <= 0 || bY >= canvas.height - 10) bVy = -bVy;
    if (aiY + 40 < bY) aiY += 3.2; else if (aiY + 40 > bY) aiY -= 3.2;
    pY = Math.max(0, Math.min(canvas.height - 80, pY));
    aiY = Math.max(0, Math.min(canvas.height - 80, aiY));
    if (bX <= 25 && bY + 10 >= pY && bY <= pY + 80) { bVx = Math.abs(bVx) + 0.2; }
    if (bX >= canvas.width - 35 && bY + 10 >= aiY && bY <= aiY + 80) { bVx = -Math.abs(bVx) - 0.2; }
    if (bX < 0) { aiScore++; bX = 300; bY = 200; bVx = 4; }
    if (bX > canvas.width) { pScore++; bX = 300; bY = 200; bVx = -4; }
    document.getElementById('pScore').textContent = pScore;
    document.getElementById('aiScore').textContent = aiScore;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([6, 6]); ctx.strokeStyle = '#334155'; ctx.beginPath();
    ctx.moveTo(300, 0); ctx.lineTo(300, 400); ctx.stroke();
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(15, pY, 10, 80);
    ctx.fillStyle = '#f43f5e'; ctx.fillRect(canvas.width - 25, aiY, 10, 80);
    ctx.fillStyle = '#fff'; ctx.fillRect(bX, bY, 10, 10);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'breakout':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #080a14; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #fbbf24; font-size: 20px; }
  canvas { border: 2px solid #fbbf24; border-radius: 12px; background: #000; box-shadow: 0 0 25px rgba(251, 191, 36, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>BRICK BREAKER <span style="color:#fbbf24">SCORE: <span id="score">0</span></span></h2>
  <canvas id="c" width="480" height="380"></canvas>
  <div class="hud">Move mouse or A/D to steer paddle and destroy all bricks</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let pW = 80, pX = 200, score = 0;
  let bX = 240, bY = 300, bVx = 3, bVy = -3, bR = 6;
  const rows = 4, cols = 7, brW = 58, brH = 16, brPad = 8, brOffT = 40, brOffL = 12;
  const colors = ['#f43f5e', '#fb923c', '#eab308', '#10b981'];
  let bricks = [];
  for (let c = 0; c < cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < rows; r++) bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    pX = Math.max(0, Math.min(canvas.width - pW, e.clientX - rect.left - pW/2));
  });
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') pX = Math.max(0, pX - 25);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') pX = Math.min(canvas.width - pW, pX + 25);
  });
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (bricks[c][r].status === 1) {
          let bX_pos = c * (brW + brPad) + brOffL;
          let bY_pos = r * (brH + brPad) + brOffT;
          bricks[c][r].x = bX_pos; bricks[c][r].y = bY_pos;
          ctx.fillStyle = colors[r];
          ctx.fillRect(bX_pos, bY_pos, brW, brH);
          if (bX > bX_pos && bX < bX_pos + brW && bY > bY_pos && bY < bY_pos + brH) {
            bVy = -bVy; bricks[c][r].status = 0; score += 20;
            document.getElementById('score').textContent = score;
          }
        }
      }
    }
    bX += bVx; bY += bVy;
    if (bX + bR > canvas.width || bX - bR < 0) bVx = -bVx;
    if (bY - bR < 0) bVy = -bVy;
    else if (bY + bR > canvas.height - 20) {
      if (bX > pX && bX < pX + pW) { bVy = -Math.abs(bVy); bVx = (bX - (pX + pW/2)) * 0.15; }
      else if (bY > canvas.height) { bX = 240; bY = 300; bVx = 3; bVy = -3; }
    }
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(pX, canvas.height - 20, pW, 10);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bX, bY, bR, 0, Math.PI * 2); ctx.fill();
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'flappy-bird':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070c18; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #38bdf8; font-size: 20px; }
  canvas { border: 2px solid #38bdf8; border-radius: 12px; background: #0c4a6e; box-shadow: 0 0 25px rgba(56, 189, 248, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>FLAPPY BIRD <span style="color:#38bdf8">SCORE: <span id="score">0</span></span></h2>
  <canvas id="c" width="360" height="480"></canvas>
  <div class="hud">Press Spacebar or Click to flap wings</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let bY = 200, bVy = 0, score = 0, pipes = [];
  function flap() { bVy = -6.5; }
  window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') flap(); });
  window.addEventListener('mousedown', flap);
  function loop() {
    requestAnimationFrame(loop);
    bVy += 0.35; bY += bVy;
    ctx.fillStyle = '#0c4a6e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (Math.random() < 0.015) {
      pipes.push({ x: 360, y: Math.floor(Math.random() * 200) + 50, passed: false });
    }
    for (let i = pipes.length - 1; i >= 0; i--) {
      let p = pipes[i]; p.x -= 2.5;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(p.x, 0, 45, p.y);
      ctx.fillRect(p.x, p.y + 110, 45, canvas.height);
      if (p.x < 70 && p.x + 45 > 50) {
        if (bY < p.y || bY + 16 > p.y + 110) { bY = 200; bVy = 0; pipes = []; score = 0; }
      }
      if (!p.passed && p.x < 50) { p.passed = true; score++; document.getElementById('score').textContent = score; }
      if (p.x < -50) pipes.splice(i, 1);
    }
    if (bY > canvas.height || bY < 0) { bY = 200; bVy = 0; pipes = []; score = 0; }
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(60, bY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(68, bY + 2, 5, 0, Math.PI * 2); ctx.fill();
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'asteroids':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #c084fc; font-size: 20px; }
  canvas { border: 2px solid #c084fc; border-radius: 12px; background: #000; box-shadow: 0 0 25px rgba(192, 132, 252, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>ASTEROIDS DEFENDER <span style="color:#c084fc">SCORE: <span id="score">0</span></span></h2>
  <canvas id="c" width="500" height="400"></canvas>
  <div class="hud">Left/Right: Rotate, Up/W: Thrust, Spacebar: Fire Laser</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let ship = { x: 250, y: 200, a: 0, r: 12, vx: 0, vy: 0, thrust: false };
  let lasers = [], roids = [], score = 0;
  for (let i = 0; i < 5; i++) {
    roids.push({ x: Math.random() * 500, y: Math.random() * 400, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, r: 25 });
  }
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') ship.a -= 0.15;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') ship.a += 0.15;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') ship.thrust = true;
    if (e.code === 'Space') {
      lasers.push({ x: ship.x + Math.cos(ship.a)*ship.r, y: ship.y + Math.sin(ship.a)*ship.r, vx: Math.cos(ship.a)*7, vy: Math.sin(ship.a)*7 });
    }
  });
  window.addEventListener('keyup', e => { if (e.code === 'ArrowUp' || e.code === 'KeyW') ship.thrust = false; });
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ship.thrust) { ship.vx += Math.cos(ship.a)*0.15; ship.vy += Math.sin(ship.a)*0.15; }
    ship.vx *= 0.98; ship.vy *= 0.98;
    ship.x = (ship.x + ship.vx + canvas.width) % canvas.width;
    ship.y = (ship.y + ship.vy + canvas.height) % canvas.height;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(ship.x + Math.cos(ship.a)*ship.r, ship.y + Math.sin(ship.a)*ship.r);
    ctx.lineTo(ship.x + Math.cos(ship.a + 2.5)*ship.r, ship.y + Math.sin(ship.a + 2.5)*ship.r);
    ctx.lineTo(ship.x + Math.cos(ship.a - 2.5)*ship.r, ship.y + Math.sin(ship.a - 2.5)*ship.r);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    for (let i = lasers.length - 1; i >= 0; i--) {
      let l = lasers[i]; l.x += l.vx; l.y += l.vy;
      ctx.fillRect(l.x - 2, l.y - 2, 4, 4);
      for (let j = roids.length - 1; j >= 0; j--) {
        let r = roids[j];
        if (Math.hypot(l.x - r.x, l.y - r.y) < r.r) {
          lasers.splice(i, 1); score += 50;
          document.getElementById('score').textContent = score;
          if (r.r > 15) { r.r /= 2; roids.push({ x: r.x, y: r.y, vx: -r.vx, vy: -r.vy, r: r.r }); }
          else roids.splice(j, 1);
          break;
        }
      }
      if (l.x < 0 || l.x > canvas.width || l.y < 0 || l.y > canvas.height) lasers.splice(i, 1);
    }
    ctx.strokeStyle = '#c084fc';
    roids.forEach(r => {
      r.x = (r.x + r.vx + canvas.width) % canvas.width;
      r.y = (r.y + r.vy + canvas.height) % canvas.height;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.stroke();
    });
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'tetris':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070913; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #ec4899; font-size: 20px; }
  canvas { border: 2px solid #ec4899; border-radius: 12px; background: #000; box-shadow: 0 0 25px rgba(236, 72, 153, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>TETRIS BLOCKS <span style="color:#ec4899">SCORE: <span id="score">0</span></span></h2>
  <canvas id="c" width="240" height="400"></canvas>
  <div class="hud">Arrows: Left/Right, Up: Rotate, Down: Drop</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  const cols = 12, rows = 20, sz = 20;
  let board = Array(rows).fill(0).map(() => Array(cols).fill(0));
  let score = 0, count = 0;
  const pieces = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,0],[0,1,1]]
  ];
  const colors = ['#000', '#06b6d4', '#eab308', '#a855f7', '#3b82f6', '#f97316', '#22c55e', '#ef4444'];
  let cur = { p: pieces[0], x: 4, y: 0, c: 1 };
  function spawn() {
    const idx = Math.floor(Math.random() * pieces.length);
    cur = { p: pieces[idx], x: 4, y: 0, c: idx + 1 };
  }
  function collide(p, x, y) {
    for (let r = 0; r < p.length; r++) {
      for (let c = 0; c < p[r].length; c++) {
        if (p[r][c] && (board[y + r] === undefined || board[y + r][x + c] === undefined || board[y + r][x + c])) return true;
      }
    }
    return false;
  }
  function rotate(p) { return p[0].map((_, i) => p.map(row => row[i]).reverse()); }
  function loop() {
    requestAnimationFrame(loop);
    if (++count < 25) return; count = 0;
    if (!collide(cur.p, cur.x, cur.y + 1)) cur.y++;
    else {
      cur.p.forEach((r, ry) => r.forEach((val, rx) => { if (val) board[cur.y + ry][cur.x + rx] = cur.c; }));
      board = board.filter(row => row.some(v => v === 0));
      while (board.length < rows) { board.unshift(Array(cols).fill(0)); score += 100; }
      document.getElementById('score').textContent = score;
      spawn();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((r, ry) => r.forEach((val, rx) => { if (val) { ctx.fillStyle = colors[val]; ctx.fillRect(rx*sz, ry*sz, sz-1, sz-1); } }));
    cur.p.forEach((r, ry) => r.forEach((val, rx) => { if (val) { ctx.fillStyle = colors[cur.c]; ctx.fillRect((cur.x+rx)*sz, (cur.y+ry)*sz, sz-1, sz-1); } }));
  }
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' && !collide(cur.p, cur.x - 1, cur.y)) cur.x--;
    if (e.code === 'ArrowRight' && !collide(cur.p, cur.x + 1, cur.y)) cur.x++;
    if (e.code === 'ArrowDown' && !collide(cur.p, cur.x, cur.y + 1)) cur.y++;
    if (e.code === 'ArrowUp') {
      const rot = rotate(cur.p);
      if (!collide(rot, cur.x, cur.y)) cur.p = rot;
    }
  });
  spawn(); requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'dino':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0c101d; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #22c55e; font-size: 20px; }
  canvas { border: 2px solid #22c55e; border-radius: 12px; background: #000; box-shadow: 0 0 25px rgba(34, 197, 94, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>CHROME DINO RUNNER <span style="color:#22c55e">SCORE: <span id="score">0</span></span></h2>
  <canvas id="c" width="550" height="220"></canvas>
  <div class="hud">Press Spacebar or Click to jump over obstacles</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let dino = { y: 170, vy: 0, w: 20, h: 30, isJumping: false };
  let cacti = [], score = 0, speed = 4;
  function jump() { if (!dino.isJumping) { dino.vy = -8.5; dino.isJumping = true; } }
  window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') jump(); });
  window.addEventListener('mousedown', jump);
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dino.y += dino.vy; dino.vy += 0.45;
    if (dino.y >= 170) { dino.y = 170; dino.vy = 0; dino.isJumping = false; }
    if (Math.random() < 0.02 && (cacti.length === 0 || cacti[cacti.length-1].x < canvas.width - 150)) {
      cacti.push({ x: canvas.width, w: 15, h: Math.random() < 0.5 ? 25 : 35 });
    }
    ctx.strokeStyle = '#334155'; ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(canvas.width, 200); ctx.stroke();
    ctx.fillStyle = '#22c55e'; ctx.fillRect(40, dino.y, dino.w, dino.h);
    ctx.fillStyle = '#f43f5e';
    for (let i = cacti.length - 1; i >= 0; i--) {
      let c = cacti[i]; c.x -= speed;
      ctx.fillRect(c.x, 200 - c.h, c.w, c.h);
      if (c.x < 40 + dino.w && c.x + c.w > 40 && dino.y + dino.h > 200 - c.h) {
        score = 0; cacti = []; speed = 4;
      }
      if (c.x < -20) { cacti.splice(i, 1); score += 10; speed += 0.05; }
    }
    document.getElementById('score').textContent = score;
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'minesweeper':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0f172a; color: #fff; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #38bdf8; }
  #board { display: grid; grid-template-columns: repeat(9, 32px); gap: 2px; background: #334155; padding: 4px; border-radius: 12px; }
  .cell { width: 32px; height: 32px; background: #1e293b; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; cursor: pointer; }
  .cell.open { background: #0f172a; cursor: default; }
  .cell.mine { background: #ef4444; }
  .hud { font-size: 12px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>MINESWEEPER <span style="color:#f43f5e">💣 <span id="mines">10</span></span></h2>
  <div id="board"></div>
  <div class="hud">Left click to uncover. Right click to place flag.</div>
<script>
  const sz = 9, totalMines = 10;
  let grid = Array(sz*sz).fill(0).map(() => ({ mine: false, open: false, flag: false, count: 0 }));
  let placed = 0;
  while (placed < totalMines) {
    let r = Math.floor(Math.random() * (sz*sz));
    if (!grid[r].mine) { grid[r].mine = true; placed++; }
  }
  for (let i = 0; i < sz*sz; i++) {
    if (grid[i].mine) continue;
    let r = Math.floor(i / sz), c = i % sz;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < sz && nc >= 0 && nc < sz && grid[nr*sz + nc].mine) grid[i].count++;
    }
  }
  const boardEl = document.getElementById('board');
  function render() {
    boardEl.innerHTML = '';
    grid.forEach((cell, i) => {
      const el = document.createElement('div');
      el.className = 'cell' + (cell.open ? ' open' : '') + (cell.open && cell.mine ? ' mine' : '');
      if (cell.flag) el.textContent = '🚩';
      else if (cell.open) el.textContent = cell.mine ? '💣' : cell.count || '';
      el.onclick = () => { if (cell.flag || cell.open) return; cell.open = true; if (cell.mine) alert('Game Over!'); render(); };
      el.oncontextmenu = e => { e.preventDefault(); if (!cell.open) cell.flag = !cell.flag; render(); };
      boardEl.appendChild(el);
    });
  }
  render();
</script>
</body>
</html>`;

    case 'tic-tac-toe':
    case 'tictactoe':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #090d16; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 10px; color: #38bdf8; }
  #board { display: grid; grid-template-columns: repeat(3, 80px); gap: 8px; background: #1e293b; padding: 8px; border-radius: 16px; }
  .cell { width: 80px; height: 80px; background: #0f172a; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; cursor: pointer; color: #38bdf8; }
  .cell.o { color: #f43f5e; }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 15px; }
</style>
</head>
<body>
  <h2>TIC-TAC-TOE MASTER</h2>
  <div id="board"></div>
  <div class="hud" id="msg">Your turn (X) vs Computer (O)</div>
<script>
  let b = Array(9).fill('');
  const boardEl = document.getElementById('board');
  function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let l of lines) { if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return b[l[0]]; }
    return b.every(v => v) ? 'Tie' : null;
  }
  function aiMove() {
    let empty = b.map((v, i) => v === '' ? i : null).filter(v => v !== null);
    if (!empty.length) return;
    b[empty[Math.floor(Math.random() * empty.length)]] = 'O';
    render();
  }
  function render() {
    boardEl.innerHTML = '';
    b.forEach((v, i) => {
      const el = document.createElement('div');
      el.className = 'cell' + (v === 'O' ? ' o' : '');
      el.textContent = v;
      el.onclick = () => {
        if (b[i] || checkWinner()) return;
        b[i] = 'X'; render();
        let w = checkWinner();
        if (!w) setTimeout(aiMove, 200);
      };
      boardEl.appendChild(el);
    });
    let win = checkWinner();
    if (win) document.getElementById('msg').textContent = win === 'Tie' ? "It's a draw!" : win + ' wins!';
  }
  render();
</script>
</body>
</html>`;

    case 'connect-four':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #060913; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 10px; color: #fbbf24; }
  #board { display: grid; grid-template-columns: repeat(7, 44px); gap: 6px; background: #1e3a8a; padding: 10px; border-radius: 16px; }
  .slot { width: 44px; height: 44px; background: #0b132b; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .slot.p1 { background: #ef4444; }
  .slot.p2 { background: #eab308; }
  .hud { font-size: 12px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>CONNECT FOUR <span style="color:#ef4444">🔴</span> vs <span style="color:#eab308">🟡</span></h2>
  <div id="board"></div>
  <div class="hud">Click any column to drop your piece</div>
<script>
  const rows = 6, cols = 7;
  let grid = Array(rows).fill(0).map(() => Array(cols).fill(0));
  let turn = 1;
  const boardEl = document.getElementById('board');
  function drop(col) {
    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][col] === 0) {
        grid[r][col] = turn;
        turn = turn === 1 ? 2 : 1;
        render();
        break;
      }
    }
  }
  function render() {
    boardEl.innerHTML = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'slot' + (grid[r][c] === 1 ? ' p1' : grid[r][c] === 2 ? ' p2' : '');
        el.onclick = () => drop(c);
        boardEl.appendChild(el);
      }
    }
  }
  render();
</script>
</body>
</html>`;

    case 'memory-match':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0b0f19; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 10px; color: #38bdf8; }
  #grid { display: grid; grid-template-columns: repeat(4, 60px); gap: 10px; }
  .card { width: 60px; height: 60px; background: #1e293b; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; border: 1px solid #334155; }
  .card.flipped { background: #0284c7; }
</style>
</head>
<body>
  <h2>MEMORY MATCH <span id="moves" style="font-size:14px;color:#94a3b8">Moves: 0</span></h2>
  <div id="grid"></div>
<script>
  const icons = ['🚀','⭐','🎮','🔥','💎','⚡','🪐','🍕'];
  let deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
  let flipped = [], matched = 0, moves = 0;
  const grid = document.getElementById('grid');
  deck.forEach((icon, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.onclick = () => {
      if (flipped.length < 2 && !el.classList.contains('flipped')) {
        el.textContent = icon; el.classList.add('flipped');
        flipped.push({ el, icon });
        if (flipped.length === 2) {
          moves++; document.getElementById('moves').textContent = 'Moves: ' + moves;
          if (flipped[0].icon === flipped[1].icon) { matched++; flipped = []; }
          else { setTimeout(() => { flipped.forEach(c => { c.el.textContent = ''; c.el.classList.remove('flipped'); }); flipped = []; }, 700); }
        }
      }
    };
    grid.appendChild(el);
  });
</script>
</body>
</html>`;

    case 'maze':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070913; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 8px; color: #a855f7; font-size: 20px; }
  canvas { border: 2px solid #a855f7; border-radius: 12px; background: #000; box-shadow: 0 0 25px rgba(168, 85, 247, 0.25); }
  .hud { font-size: 13px; color: #94a3b8; margin-top: 10px; }
</style>
</head>
<body>
  <h2>MAZE RUNNER <span style="color:#a855f7">COLLECT 🔑 AND ESCAPE 🚪</span></h2>
  <canvas id="c" width="380" height="380"></canvas>
  <div class="hud">Use Arrow Keys or WASD to navigate player</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  const sz = 19, tile = 20;
  let p = { x: 1, y: 1 }, key = { x: 17, y: 1 }, exit = { x: 17, y: 17 }, hasKey = false;
  // Simple labyrinth map
  let map = Array(sz).fill(0).map((_, r) => Array(sz).fill(0).map((_, c) => (r===0||r===sz-1||c===0||c===sz-1 || (r%2===0&&c%2===0)) ? 1 : 0));
  window.addEventListener('keydown', e => {
    let nx = p.x, ny = p.y;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') ny--;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') ny++;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') nx--;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') nx++;
    if (!map[ny][nx]) { p.x = nx; p.y = ny; }
    if (p.x === key.x && p.y === key.y) hasKey = true;
    if (p.x === exit.x && p.y === exit.y && hasKey) alert('Maze Complete! 🎉');
    render();
  });
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < sz; r++) for (let c = 0; c < sz; c++) {
      if (map[r][c]) { ctx.fillStyle = '#334155'; ctx.fillRect(c*tile, r*tile, tile, tile); }
    }
    if (!hasKey) { ctx.fillStyle = '#fbbf24'; ctx.fillRect(key.x*tile+4, key.y*tile+4, tile-8, tile-8); }
    ctx.fillStyle = hasKey ? '#10b981' : '#f43f5e'; ctx.fillRect(exit.x*tile+2, exit.y*tile+2, tile-4, tile-4);
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(p.x*tile+tile/2, p.y*tile+tile/2, tile/2 - 2, 0, Math.PI*2); ctx.fill();
  }
  render();
</script>
</body>
</html>`;

    case 'pacman':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#05070d; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#facc15; }
  canvas { background:#000; border:2px solid #3b82f6; border-radius:12px; box-shadow:0 0 20px rgba(59,130,246,0.3); }
  .hud { margin-top:8px; font-size:12px; color:#94a3b8; font-family:monospace; }
</style>
</head>
<body>
  <h2>PAC-MAN 1980 <span style="color:#38bdf8">SCORE: <span id="s">0</span> | LIVES: <span id="l">3</span></span></h2>
  <canvas id="c" width="400" height="400"></canvas>
  <div class="hud">Use Arrow Keys or WASD to navigate Pac-Man</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  const cols = 20, rows = 20, sz = 20;
  let score = 0, lives = 3, mouth = 0.2, mouthDir = 0.03;
  let pac = { x: 1, y: 1, dx: 1, dy: 0, nextDx: 1, nextDy: 0 };
  let ghost = { x: 10, y: 10, dx: 1, dy: 0 };
  let grid = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,2,2,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,2,2,2,2,1,2,2,0,2,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,2,2,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') { pac.nextDx = 0; pac.nextDy = -1; }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { pac.nextDx = 0; pac.nextDy = 1; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { pac.nextDx = -1; pac.nextDy = 0; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { pac.nextDx = 1; pac.nextDy = 0; }
  });
  function canMove(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return true;
    return grid[y][x] !== 1;
  }
  let step = 0;
  function update() {
    step++;
    if (step % 8 === 0) {
      if (canMove(pac.x + pac.nextDx, pac.y + pac.nextDy)) {
        pac.dx = pac.nextDx; pac.dy = pac.nextDy;
      }
      if (canMove(pac.x + pac.dx, pac.y + pac.dy)) {
        pac.x += pac.dx; pac.y += pac.dy;
        if (pac.x < 0) pac.x = cols - 1;
        if (pac.x >= cols) pac.x = 0;
      }
      if (grid[pac.y] && grid[pac.y][pac.x] === 0) {
        grid[pac.y][pac.x] = 2;
        score += 10;
        document.getElementById('s').innerText = score;
      }
      const gdirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(d => canMove(ghost.x+d.dx, ghost.y+d.dy));
      if (gdirs.length > 0) {
        const best = gdirs.sort((a,b) => (Math.hypot(ghost.x+a.dx-pac.x, ghost.y+a.dy-pac.y) - Math.hypot(ghost.x+b.dx-pac.x, ghost.y+b.dy-pac.y)))[0];
        ghost.x += best.dx; ghost.y += best.dy;
      }
      if (Math.hypot(ghost.x - pac.x, ghost.y - pac.y) < 1) {
        lives--;
        document.getElementById('l').innerText = lives;
        pac.x = 1; pac.y = 1; pac.dx = 1; pac.dy = 0;
        if (lives <= 0) { alert('Game Over! Final Score: ' + score); lives = 3; score = 0; location.reload(); }
      }
    }
    mouth += mouthDir;
    if (mouth > 0.4 || mouth < 0.05) mouthDir = -mouthDir;
    render();
    requestAnimationFrame(update);
  }
  function render() {
    ctx.clearRect(0,0,400,400);
    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        if (grid[r][c] === 1) {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(c*sz, r*sz, sz, sz);
        } else if (grid[r][c] === 0) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath(); ctx.arc(c*sz+sz/2, r*sz+sz/2, 2.5, 0, Math.PI*2); ctx.fill();
        }
      }
    }
    const angle = pac.dx === 1 ? 0 : pac.dx === -1 ? Math.PI : pac.dy === 1 ? Math.PI/2 : -Math.PI/2;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(pac.x*sz+sz/2, pac.y*sz+sz/2, sz/2 - 1, angle + mouth * Math.PI, angle + (2 - mouth) * Math.PI);
    ctx.lineTo(pac.x*sz+sz/2, pac.y*sz+sz/2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ghost.x*sz+sz/2, ghost.y*sz+sz/2 - 2, sz/2 - 2, Math.PI, 0, false);
    ctx.lineTo(ghost.x*sz+sz - 2, ghost.y*sz+sz - 2);
    ctx.lineTo(ghost.x*sz+2, ghost.y*sz+sz - 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(ghost.x*sz+4, ghost.y*sz+4, 4, 4);
    ctx.fillRect(ghost.x*sz+12, ghost.y*sz+4, 4, 4);
  }
  update();
</script>
</body>
</html>`;

    case 'space-invaders':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#020617; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#22c55e; }
  canvas { background:#000; border:2px solid #22c55e; border-radius:12px; box-shadow:0 0 20px rgba(34,197,94,0.3); }
  .hud { margin-top:8px; font-size:12px; color:#94a3b8; font-family:monospace; }
</style>
</head>
<body>
  <h2>SPACE INVADERS 1978 <span style="color:#38bdf8">SCORE: <span id="s">0</span> | LEVEL: <span id="lvl">1</span></span></h2>
  <canvas id="c" width="400" height="420"></canvas>
  <div class="hud">Left / Right Arrow to steer | Spacebar to shoot lasers</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let player = { x: 180, y: 390, w: 28, h: 14, speed: 4 };
  let lasers = [], invaders = [], invaderSpeed = 1, invaderDir = 1, score = 0, level = 1;
  let keys = {};
  window.addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') shoot(); });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  function shoot() {
    if (lasers.length < 4) { lasers.push({ x: player.x + player.w/2 - 2, y: player.y - 6, w: 4, h: 10 }); }
  }
  function spawnInvaders() {
    invaders = [];
    for (let r=0; r<4; r++) {
      for (let c=0; c<8; c++) {
        invaders.push({ x: 40 + c*40, y: 40 + r*30, w: 24, h: 18, color: r===0?'#ef4444':r===1?'#eab308':'#22c55e' });
      }
    }
  }
  spawnInvaders();
  function update() {
    if (keys['ArrowLeft'] || keys['KeyA']) player.x = Math.max(10, player.x - player.speed);
    if (keys['ArrowRight'] || keys['KeyD']) player.x = Math.min(canvas.width - player.w - 10, player.x + player.speed);
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].y -= 7;
      if (lasers[i].y < 0) { lasers.splice(i, 1); continue; }
      for (let j = invaders.length - 1; j >= 0; j--) {
        const inv = invaders[j], l = lasers[i];
        if (l && l.x > inv.x && l.x < inv.x + inv.w && l.y > inv.y && l.y < inv.y + inv.h) {
          invaders.splice(j, 1);
          lasers.splice(i, 1);
          score += 20;
          document.getElementById('s').innerText = score;
          break;
        }
      }
    }
    let hitEdge = false;
    for (const inv of invaders) {
      inv.x += invaderSpeed * invaderDir;
      if (inv.x <= 10 || inv.x + inv.w >= canvas.width - 10) hitEdge = true;
    }
    if (hitEdge) {
      invaderDir = -invaderDir;
      for (const inv of invaders) {
        inv.y += 12;
        if (inv.y + inv.h >= player.y) {
          alert('Earth has fallen! Score: ' + score);
          score = 0; level = 1; spawnInvaders(); return;
        }
      }
    }
    if (invaders.length === 0) {
      level++;
      document.getElementById('lvl').innerText = level;
      invaderSpeed += 0.4;
      spawnInvaders();
    }
    render();
    requestAnimationFrame(update);
  }
  function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(player.x, player.y + 4, player.w, player.h - 4);
    ctx.fillRect(player.x + player.w/2 - 3, player.y, 6, 6);
    ctx.fillStyle = '#fde047';
    for (const l of lasers) ctx.fillRect(l.x, l.y, l.w, l.h);
    for (const inv of invaders) {
      ctx.fillStyle = inv.color;
      ctx.fillRect(inv.x+2, inv.y, inv.w-4, inv.h-4);
      ctx.fillRect(inv.x, inv.y+4, inv.w-8, inv.h-8);
      ctx.fillStyle = '#000';
      ctx.fillRect(inv.x+4, inv.y+4, 4, 4);
      ctx.fillRect(inv.x+inv.w-8, inv.y+4, 4, 4);
    }
  }
  update();
</script>
</body>
</html>`;

    case 'solitaire':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#064e3b; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#fde047; }
  canvas { background:#047857; border:3px solid #065f46; border-radius:12px; box-shadow:0 0 25px rgba(0,0,0,0.5); cursor:pointer; }
  .hud { margin-top:8px; font-size:12px; color:#a7f3d0; font-family:monospace; }
</style>
</head>
<body>
  <h2>KLONDIKE SOLITAIRE <span style="color:#fde047">MOVES: <span id="m">0</span> | SCORE: <span id="s">100</span></span></h2>
  <canvas id="c" width="460" height="380"></canvas>
  <div class="hud">Click Stockpile to deal | Click cards to auto-play to Foundations</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let moves = 0, score = 100;
  const suits = ['♠','♥','♦','♣'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let deck = [];
  for (let s of suits) for (let v of values) deck.push({ suit: s, val: v, red: (s==='♥'||s==='♦') });
  deck.sort(() => Math.random() - 0.5);
  let piles = Array(7).fill(0).map((_, i) => deck.splice(0, i + 1));
  let stock = deck, waste = [], foundations = [[],[],[],[]];
  
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    moves++; document.getElementById('m').innerText = moves;
    if (x >= 20 && x <= 65 && y >= 20 && y <= 85) {
      if (stock.length > 0) waste.push(stock.pop());
      else { stock = waste.reverse(); waste = []; }
      render(); return;
    }
    for (let c=0; c<7; c++) {
      const colX = 20 + c * 62;
      if (x >= colX && x <= colX + 45 && piles[c].length > 0) {
        const card = piles[c][piles[c].length - 1];
        for (let f=0; f<4; f++) {
          if (foundations[f].length === 0 && card.val === 'A') {
            foundations[f].push(piles[c].pop()); score += 15;
            document.getElementById('s').innerText = score;
            render(); return;
          }
        }
      }
    }
    render();
  });

  function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = stock.length > 0 ? '#1e40af' : '#065f46';
    ctx.fillRect(20, 20, 45, 65);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(20, 20, 45, 65);
    if (waste.length > 0) {
      drawCard(waste[waste.length-1], 80, 20);
    }
    for (let i=0; i<4; i++) {
      ctx.strokeStyle = '#10b981'; ctx.strokeRect(200 + i*65, 20, 45, 65);
      if (foundations[i].length > 0) {
        drawCard(foundations[i][foundations[i].length-1], 200 + i*65, 20);
      }
    }
    for (let c=0; c<7; c++) {
      const colX = 20 + c*62;
      ctx.strokeStyle = '#065f46'; ctx.strokeRect(colX, 110, 45, 65);
      piles[c].forEach((card, idx) => {
        drawCard(card, colX, 110 + idx*20);
      });
    }
  }
  function drawCard(c, x, y) {
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 45, 65);
    ctx.strokeStyle = '#333'; ctx.strokeRect(x, y, 45, 65);
    ctx.fillStyle = c.red ? '#dc2626' : '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(c.val + c.suit, x+4, y+16);
  }
  render();
</script>
</body>
</html>`;

    case 'sudoku':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#0f172a; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#38bdf8; }
  canvas { background:#fff; border:3px solid #0284c7; border-radius:12px; box-shadow:0 0 20px rgba(56,189,248,0.25); cursor:pointer; }
  .hud { margin-top:8px; font-size:12px; color:#94a3b8; font-family:monospace; }
</style>
</head>
<body>
  <h2>SUDOKU PUZZLE <span style="color:#fde047">CLICK CELL & PRESS 1-9</span></h2>
  <canvas id="c" width="360" height="360"></canvas>
  <div class="hud">Use number keys (1-9) or Backspace to solve</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let selected = { r: 0, c: 0 };
  let initial = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ];
  let board = initial.map(r => [...r]);
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    selected.c = Math.floor((e.clientX - rect.left) / 40);
    selected.r = Math.floor((e.clientY - rect.top) / 40);
    render();
  });
  window.addEventListener('keydown', e => {
    const num = parseInt(e.key);
    if (initial[selected.r][selected.c] === 0) {
      if (num >= 1 && num <= 9) board[selected.r][selected.c] = num;
      if (e.code === 'Backspace' || e.code === 'Delete' || e.key === '0') board[selected.r][selected.c] = 0;
      render();
    }
  });
  function render() {
    ctx.clearRect(0,0,360,360);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(selected.c*40, selected.r*40, 40, 40);
    for (let i=0; i<=9; i++) {
      ctx.beginPath();
      ctx.lineWidth = i%3===0 ? 3 : 1;
      ctx.strokeStyle = i%3===0 ? '#0f172a' : '#cbd5e1';
      ctx.moveTo(i*40, 0); ctx.lineTo(i*40, 360);
      ctx.moveTo(0, i*40); ctx.lineTo(360, i*40);
      ctx.stroke();
    }
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let r=0; r<9; r++) {
      for (let c=0; c<9; c++) {
        const val = board[r][c];
        if (val !== 0) {
          ctx.fillStyle = initial[r][c] !== 0 ? '#0f172a' : '#0284c7';
          ctx.fillText(val, c*40+20, r*40+20);
        }
      }
    }
  }
  render();
</script>
</body>
</html>`;

    case 'simon-says':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#09090b; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#ec4899; }
  canvas { border-radius:50%; box-shadow:0 0 30px rgba(236,72,153,0.3); cursor:pointer; }
  .hud { margin-top:8px; font-size:12px; color:#94a3b8; font-family:monospace; }
</style>
</head>
<body>
  <h2>SIMON SAYS <span style="color:#38bdf8">ROUND: <span id="rnd">1</span></span></h2>
  <canvas id="c" width="340" height="340"></canvas>
  <div class="hud">Repeat the audio-visual color sequence!</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  const colors = ['#22c55e', '#ef4444', '#eab308', '#3b82f6'];
  const bright = ['#86efac', '#fca5a5', '#fef08a', '#93c5fd'];
  let sequence = [Math.floor(Math.random()*4)], playerStep = 0, active = -1;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function beep(freq) {
    try {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = freq; g.gain.setValueAtTime(0.1, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
  }
  function playSequence() {
    let i = 0;
    const timer = setInterval(() => {
      active = sequence[i];
      beep([300, 400, 500, 600][active]);
      render();
      setTimeout(() => { active = -1; render(); }, 350);
      i++;
      if (i >= sequence.length) clearInterval(timer);
    }, 650);
  }
  setTimeout(playSequence, 500);
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 170, y = e.clientY - rect.top - 170;
    let clicked = -1;
    if (x < 0 && y < 0) clicked = 0;
    if (x >= 0 && y < 0) clicked = 1;
    if (x < 0 && y >= 0) clicked = 2;
    if (x >= 0 && y >= 0) clicked = 3;
    if (clicked === sequence[playerStep]) {
      beep([300, 400, 500, 600][clicked]);
      playerStep++;
      if (playerStep >= sequence.length) {
        sequence.push(Math.floor(Math.random()*4));
        playerStep = 0;
        document.getElementById('rnd').innerText = sequence.length;
        setTimeout(playSequence, 800);
      }
    } else {
      beep(150);
      alert('Wrong sequence! Replaying...');
      playerStep = 0; playSequence();
    }
  });
  function render() {
    ctx.clearRect(0,0,340,340);
    const rad = 160;
    const quadrants = [
      { start: Math.PI, end: Math.PI*1.5, c: active===0?bright[0]:colors[0] },
      { start: Math.PI*1.5, end: Math.PI*2, c: active===1?bright[1]:colors[1] },
      { start: Math.PI*0.5, end: Math.PI, c: active===2?bright[2]:colors[2] },
      { start: 0, end: Math.PI*0.5, c: active===3?bright[3]:colors[3] }
    ];
    for (let q of quadrants) {
      ctx.beginPath(); ctx.moveTo(170, 170); ctx.arc(170, 170, rad, q.start, q.end);
      ctx.closePath(); ctx.fillStyle = q.c; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(170, 170, 55, 0, Math.PI*2); ctx.fillStyle = '#09090b'; ctx.fill();
  }
  render();
</script>
</body>
</html>`;

    case 'space-defender':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#020617; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#38bdf8; }
  canvas { background:#030712; border:2px solid #0284c7; border-radius:12px; box-shadow:0 0 25px rgba(2,132,199,0.3); }
  .hud { margin-top:8px; font-size:12px; color:#94a3b8; font-family:monospace; }
</style>
</head>
<body>
  <h2>SPACE DEFENDER <span style="color:#fde047">SCORE: <span id="s">0</span> | HULL: <span id="h">100</span>%</span></h2>
  <canvas id="c" width="460" height="340"></canvas>
  <div class="hud">W/S or Up/Down to fly | Spacebar to shoot lasers</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let ship = { x: 30, y: 150, vy: 0, speed: 4 };
  let lasers = [], enemies = [], stars = [], score = 0, hull = 100;
  for (let i=0; i<40; i++) stars.push({ x: Math.random()*460, y: Math.random()*340, speed: 1 + Math.random()*3 });
  let keys = {};
  window.addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') lasers.push({ x: ship.x + 24, y: ship.y + 8, w: 10, h: 4 }); });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  function update() {
    if (keys['ArrowUp'] || keys['KeyW']) ship.y = Math.max(10, ship.y - ship.speed);
    if (keys['ArrowDown'] || keys['KeyS']) ship.y = Math.min(canvas.height - 30, ship.y + ship.speed);
    for (let st of stars) { st.x -= st.speed; if (st.x < 0) st.x = 460; }
    if (Math.random() < 0.03) enemies.push({ x: 460, y: Math.random()*300, w: 20, h: 20, speed: 2.5 + Math.random()*2 });
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].x += 8;
      if (lasers[i].x > 460) { lasers.splice(i, 1); continue; }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const en = enemies[j], l = lasers[i];
        if (l && l.x > en.x && l.x < en.x + en.w && l.y > en.y && l.y < en.y + en.h) {
          enemies.splice(j, 1); lasers.splice(i, 1);
          score += 50; document.getElementById('s').innerText = score;
          break;
        }
      }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].x -= enemies[i].speed;
      if (enemies[i].x < -20) { enemies.splice(i, 1); continue; }
      if (Math.hypot(enemies[i].x - ship.x, enemies[i].y - ship.y) < 22) {
        enemies.splice(i, 1); hull -= 20;
        document.getElementById('h').innerText = hull;
        if (hull <= 0) { alert('Ship Destroyed! Score: ' + score); score = 0; hull = 100; ship.y = 150; }
      }
    }
    render();
    requestAnimationFrame(update);
  }
  function render() {
    ctx.clearRect(0,0,460,340);
    ctx.fillStyle = '#fff';
    for (let st of stars) ctx.fillRect(st.x, st.y, st.speed>2?2:1, st.speed>2?2:1);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.moveTo(ship.x, ship.y); ctx.lineTo(ship.x+24, ship.y+10); ctx.lineTo(ship.x, ship.y+20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fde047';
    for (const l of lasers) ctx.fillRect(l.x, l.y, l.w, l.h);
    ctx.fillStyle = '#ef4444';
    for (const en of enemies) {
      ctx.fillRect(en.x, en.y+4, en.w, en.h-8);
      ctx.fillRect(en.x+4, en.y, en.w-8, en.h);
    }
  }
  update();
</script>
</body>
</html>`;

    case 'whack-a-mole':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin:0; background:#1c1917; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; user-select:none; }
  h2 { margin:0 0 8px; font-size:16px; color:#f97316; }
  canvas { background:#451a03; border:3px solid #78350f; border-radius:16px; box-shadow:0 0 25px rgba(249,115,22,0.25); cursor:crosshair; }
  .hud { margin-top:8px; font-size:12px; color:#d6d3d1; font-family:monospace; }
</style>
</head>
<body>
  <h2>WHACK-A-MOLE <span style="color:#fde047">WHACKS: <span id="s">0</span> | TIME: <span id="t">30</span>s</span></h2>
  <canvas id="c" width="360" height="360"></canvas>
  <div class="hud">Click the popping moles before they burrow down!</div>
<script>
  const canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
  let score = 0, timeLeft = 30, activeHole = -1;
  const holes = [
    {x:60,y:60},{x:180,y:60},{x:300,y:60},
    {x:60,y:180},{x:180,y:180},{x:300,y:180},
    {x:60,y:300},{x:180,y:300},{x:300,y:300}
  ];
  setInterval(() => {
    activeHole = Math.floor(Math.random() * 9);
    render();
  }, 750);
  setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.getElementById('t').innerText = timeLeft;
      if (timeLeft === 0) alert('Time Up! Total Whacks: ' + score);
    }
  }, 1000);
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (activeHole >= 0) {
      const h = holes[activeHole];
      if (Math.hypot(mx - h.x, my - h.y) < 35) {
        score++;
        document.getElementById('s').innerText = score;
        activeHole = -1;
        render();
      }
    }
  });
  function render() {
    ctx.clearRect(0,0,360,360);
    for (let i=0; i<9; i++) {
      const h = holes[i];
      ctx.fillStyle = '#1c1917';
      ctx.beginPath(); ctx.ellipse(h.x, h.y+10, 36, 18, 0, 0, Math.PI*2); ctx.fill();
      if (activeHole === i) {
        ctx.fillStyle = '#b45309';
        ctx.beginPath(); ctx.arc(h.x, h.y-10, 24, Math.PI, 0, false); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(h.x-8, h.y-14, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(h.x+8, h.y-14, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath(); ctx.arc(h.x, h.y-8, 4, 0, Math.PI*2); ctx.fill();
      }
    }
  }
  render();
</script>
</body>
</html>`;

    case 'tron':
    case 'tron-light-cycles':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 10px; color: #06b6d4; font-size: 20px; letter-spacing: 2px; }
  canvas { background: #020617; border: 2px solid #06b6d4; box-shadow: 0 0 20px rgba(6,182,212,0.4); border-radius: 8px; }
  .hud { margin-top: 10px; font-size: 12px; color: #94a3b8; display: flex; gap: 20px; }
</style>
</head>
<body>
  <h2>TRON LIGHT CYCLES</h2>
  <canvas id="c" width="480" height="360"></canvas>
  <div class="hud">
    <span>YOU: <b id="s1" style="color:#06b6d4">0</b></span>
    <span>AI: <b id="s2" style="color:#f43f5e">0</b></span>
    <span>Arrows / WASD to Steer</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const GRID_W = 120, GRID_H = 90, CELL = 4;
  let grid = new Uint8Array(GRID_W * GRID_H);
  let p1, p2, score1 = 0, score2 = 0, running = true;

  function reset() {
    grid.fill(0);
    p1 = { x: 30, y: 45, dx: 1, dy: 0, dead: false };
    p2 = { x: 90, y: 45, dx: -1, dy: 0, dead: false };
    running = true;
  }

  function step() {
    if (!running) return;
    p1.x += p1.dx; p1.y += p1.dy;
    if (p1.x < 0 || p1.x >= GRID_W || p1.y < 0 || p1.y >= GRID_H || grid[p1.y * GRID_W + p1.x]) {
      p1.dead = true;
    } else {
      grid[p1.y * GRID_W + p1.x] = 1;
    }

    const dirs = [{dx: 0, dy: -1}, {dx: 1, dy: 0}, {dx: 0, dy: 1}, {dx: -1, dy: 0}];
    const safe = dirs.filter(d => {
      if (d.dx === -p2.dx && d.dy === -p2.dy) return false;
      const nx = p2.x + d.dx, ny = p2.y + d.dy;
      return nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H && !grid[ny * GRID_W + nx];
    });
    if (safe.length) {
      const forward = safe.find(d => d.dx === p2.dx && d.dy === p2.dy);
      if (!forward || Math.random() < 0.1) {
        const choice = safe[Math.floor(Math.random() * safe.length)];
        p2.dx = choice.dx; p2.dy = choice.dy;
      }
    }
    p2.x += p2.dx; p2.y += p2.dy;
    if (p2.x < 0 || p2.x >= GRID_W || p2.y < 0 || p2.y >= GRID_H || grid[p2.y * GRID_W + p2.x]) {
      p2.dead = true;
    } else {
      grid[p2.y * GRID_W + p2.x] = 2;
    }

    if (p1.dead || p2.dead) {
      running = false;
      if (p1.dead && !p2.dead) score2++;
      else if (p2.dead && !p1.dead) score1++;
      document.getElementById('s1').innerText = score1;
      document.getElementById('s2').innerText = score2;
      setTimeout(reset, 1200);
    }
    draw();
  }

  function draw() {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const val = grid[y * GRID_W + x];
        if (val === 1) { ctx.fillStyle = '#06b6d4'; ctx.fillRect(x * CELL, y * CELL, CELL, CELL); }
        else if (val === 2) { ctx.fillStyle = '#f43f5e'; ctx.fillRect(x * CELL, y * CELL, CELL, CELL); }
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(p1.x * CELL, p1.y * CELL, CELL, CELL);
    ctx.fillRect(p2.x * CELL, p2.y * CELL, CELL, CELL);
  }

  window.addEventListener('keydown', e => {
    if ((e.code === 'ArrowUp' || e.code === 'KeyW') && p1.dy === 0) { p1.dx = 0; p1.dy = -1; }
    else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && p1.dy === 0) { p1.dx = 0; p1.dy = 1; }
    else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && p1.dx === 0) { p1.dx = -1; p1.dy = 0; }
    else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && p1.dx === 0) { p1.dx = 1; p1.dy = 0; }
  });

  reset();
  setInterval(step, 45);
</script>
</body>
</html>`;

    case 'lunar-lander':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 10px; color: #fbbf24; font-size: 18px; letter-spacing: 2px; }
  canvas { background: #020617; border: 2px solid #334155; border-radius: 8px; }
  .hud { margin-top: 10px; font-size: 12px; color: #94a3b8; display: flex; gap: 20px; }
</style>
</head>
<body>
  <h2>APOLLO LUNAR LANDER</h2>
  <canvas id="c" width="480" height="360"></canvas>
  <div class="hud">
    <span>FUEL: <b id="fuel" style="color:#22c55e">100%</b></span>
    <span>ALT: <b id="alt" style="color:#38bdf8">0</b></span>
    <span>SPEED: <b id="spd" style="color:#fbbf24">0.0</b></span>
    <span>[SPACE/W] Thrust [A/D] Rotate</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let x = 240, y = 50, vx = 0, vy = 0, angle = 0, fuel = 1000, landed = false, crashed = false;
  let keys = {};

  const terrain = [
    {x: 0, y: 320}, {x: 80, y: 300}, {x: 150, y: 330},
    {x: 200, y: 320}, {x: 280, y: 320},
    {x: 350, y: 300}, {x: 480, y: 330}
  ];

  function reset() {
    x = 100 + Math.random() * 280; y = 40; vx = (Math.random() - 0.5) * 1.5; vy = 0; angle = 0; fuel = 1000;
    landed = false; crashed = false;
  }

  window.addEventListener('keydown', e => { keys[e.code] = true; if ((landed || crashed) && e.code === 'Space') reset(); });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  function step() {
    if (!landed && !crashed) {
      vy += 0.03;
      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && fuel > 0) {
        vx += Math.sin(angle) * 0.08;
        vy -= Math.cos(angle) * 0.08;
        fuel -= 2;
      }
      if (keys['ArrowLeft'] || keys['KeyA']) angle -= 0.05;
      if (keys['ArrowRight'] || keys['KeyD']) angle += 0.05;

      x += vx; y += vy;
      if (y >= 310) {
        const onPad = x >= 195 && x <= 275;
        const safeSpd = Math.hypot(vx, vy) < 1.4 && Math.abs(angle) < 0.2;
        if (onPad && safeSpd) { landed = true; } else { crashed = true; }
      }
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, 480, 360);
    ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(terrain[0].x, terrain[0].y);
    for (let p of terrain) ctx.lineTo(p.x, p.y);
    ctx.lineTo(480, 360); ctx.lineTo(0, 360); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(200, 320); ctx.lineTo(280, 320); ctx.stroke();
    ctx.lineWidth = 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(-8, -8, 16, 14);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(-4, -4, 8, 5);
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-8, 6); ctx.lineTo(-12, 12);
    ctx.moveTo(8, 6); ctx.lineTo(12, 12);
    ctx.stroke();

    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && fuel > 0 && !landed && !crashed) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-5, 6); ctx.lineTo(5, 6); ctx.lineTo(0, 16 + Math.random() * 8);
      ctx.fill();
    }
    ctx.restore();

    if (landed) {
      ctx.fillStyle = '#22c55e'; ctx.font = 'bold 20px monospace';
      ctx.fillText('THE EAGLE HAS LANDED!', 110, 160);
      ctx.font = '12px monospace'; ctx.fillText('Press SPACE to Restart', 160, 190);
    } else if (crashed) {
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 20px monospace';
      ctx.fillText('LANDER DESTROYED!', 140, 160);
      ctx.font = '12px monospace'; ctx.fillText('Press SPACE to Restart', 160, 190);
    }

    document.getElementById('fuel').innerText = Math.max(0, Math.round(fuel / 10)) + '%';
    document.getElementById('alt').innerText = Math.max(0, Math.round(320 - y));
    document.getElementById('spd').innerText = Math.hypot(vx, vy).toFixed(1) + ' m/s';
  }

  setInterval(step, 30);
</script>
</body>
</html>`;

    case 'wordle':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0b0f19; color: #fff; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 10px; color: #38bdf8; letter-spacing: 3px; }
  #grid { display: grid; grid-template-rows: repeat(6, 44px); gap: 6px; margin-bottom: 12px; }
  .row { display: grid; grid-template-columns: repeat(5, 44px); gap: 6px; }
  .tile { width: 44px; height: 44px; border: 2px solid #334155; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; background: #1e293b; text-transform: uppercase; }
  .tile.correct { background: #22c55e; border-color: #22c55e; color: #000; }
  .tile.present { background: #eab308; border-color: #eab308; color: #000; }
  .tile.absent { background: #475569; border-color: #475569; }
  #kb { display: flex; flex-direction: column; gap: 4px; align-items: center; }
  .kb-row { display: flex; gap: 4px; }
  .key { padding: 8px 10px; border-radius: 6px; background: #334155; font-size: 11px; font-weight: bold; cursor: pointer; }
  .msg { font-size: 13px; color: #38bdf8; height: 18px; margin-top: 6px; }
</style>
</head>
<body>
  <h2>WORDLE 5-LETTER</h2>
  <div id="grid"></div>
  <div id="kb"></div>
  <div class="msg" id="msg">Type or click letters, ENTER to submit</div>
<script>
  const WORDS = ['AUDIO','REACT','LIGHT','SPACE','MUSIC','VIDEO','ROBOT','CABLE','SPEED','LASER','STORM','EARTH','SMART','POWER','MAGIC'];
  const target = WORDS[Math.floor(Math.random() * WORDS.length)];
  let row = 0, col = 0, current = '', over = false;

  const gridEl = document.getElementById('grid');
  for (let r = 0; r < 6; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = 't-' + r + '-' + c;
      rowEl.appendChild(tile);
    }
    gridEl.appendChild(rowEl);
  }

  function handleInput(key) {
    if (over) return;
    if (key === 'ENTER') {
      if (current.length === 5) {
        checkWord();
      } else {
        document.getElementById('msg').innerText = 'Not enough letters!';
      }
    } else if (key === 'BACKSPACE' || key === 'DEL') {
      if (current.length > 0) {
        current = current.slice(0, -1);
        col--;
        document.getElementById('t-' + row + '-' + col).innerText = '';
      }
    } else if (/^[A-Z]$/.test(key) && current.length < 5) {
      document.getElementById('t-' + row + '-' + col).innerText = key;
      current += key;
      col++;
    }
  }

  function checkWord() {
    for (let i = 0; i < 5; i++) {
      const tile = document.getElementById('t-' + row + '-' + i);
      const ch = current[i];
      if (ch === target[i]) tile.className = 'tile correct';
      else if (target.includes(ch)) tile.className = 'tile present';
      else tile.className = 'tile absent';
    }
    if (current === target) {
      over = true;
      document.getElementById('msg').innerText = 'Splendid! You guessed the word!';
      return;
    }
    row++; col = 0; current = '';
    if (row >= 6) {
      over = true;
      document.getElementById('msg').innerText = 'Game Over! The word was: ' + target;
    }
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleInput('ENTER');
    else if (e.key === 'Backspace') handleInput('BACKSPACE');
    else if (/^[a-zA-Z]$/.test(e.key)) handleInput(e.key.toUpperCase());
  });

  const KB_LAYOUT = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  const kbEl = document.getElementById('kb');
  KB_LAYOUT.forEach((str, i) => {
    const kRow = document.createElement('div');
    kRow.className = 'kb-row';
    if (i === 2) {
      const ent = document.createElement('div'); ent.className = 'key'; ent.innerText = 'ENTER';
      ent.onclick = () => handleInput('ENTER'); kRow.appendChild(ent);
    }
    str.split('').forEach(ch => {
      const key = document.createElement('div'); key.className = 'key'; key.innerText = ch;
      key.onclick = () => handleInput(ch); kRow.appendChild(key);
    });
    if (i === 2) {
      const del = document.createElement('div'); del.className = 'key'; del.innerText = 'DEL';
      del.onclick = () => handleInput('BACKSPACE'); kRow.appendChild(del);
    }
    kbEl.appendChild(kRow);
  });
</script>
</body>
</html>`;

    case 'synthwave-racer-3d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #050510; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #f43f5e; font-size: 20px; letter-spacing: 3px; text-shadow: 0 0 10px #f43f5e; }
  canvas { background: #000; border: 2px solid #ec4899; border-radius: 12px; box-shadow: 0 0 25px rgba(236,72,153,0.4); }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON OUTRUN 3D</h2>
  <canvas id="c" width="480" height="360"></canvas>
  <div class="hud">
    <span>SPEED: <b id="spd" style="color:#22c55e">0</b> KM/H</span>
    <span>SCORE: <b id="sc" style="color:#f59e0b">0</b></span>
    <span>[LEFT/RIGHT] Steer [UP] Turbo</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let speed = 0, maxSpeed = 240, pos = 0, playerX = 0, score = 0, gameOver = false;
  let keys = {};
  const cars = [
    { z: 400, x: -0.4, color: '#06b6d4' },
    { z: 900, x: 0.5, color: '#eab308' },
    { z: 1400, x: -0.2, color: '#ec4899' },
    { z: 1900, x: 0.3, color: '#a855f7' }
  ];

  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  function loop() {
    if (!gameOver) {
      if (keys['ArrowUp'] || keys['KeyW']) speed = Math.min(maxSpeed, speed + 4);
      else speed = Math.max(0, speed - 2);
      if (keys['ArrowLeft'] || keys['KeyA']) playerX = Math.max(-1.4, playerX - 0.04);
      if (keys['ArrowRight'] || keys['KeyD']) playerX = Math.min(1.4, playerX + 0.04);

      pos += speed;
      score += Math.floor(speed / 10);
      document.getElementById('spd').innerText = Math.floor(speed);
      document.getElementById('sc').innerText = score;
    }

    // Render Sky and Sun
    const grad = ctx.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, '#1e1035'); grad.addColorStop(1, '#ff007f');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 480, 180);

    // Glowing Neon Sun
    ctx.beginPath();
    ctx.arc(240, 130, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#ffde59';
    ctx.shadowBlur = 30; ctx.shadowColor = '#ff59b3';
    ctx.fill(); ctx.shadowBlur = 0;

    // Horizon line
    ctx.fillStyle = '#0f051d'; ctx.fillRect(0, 180, 480, 180);

    // Render 3D Perspective Road
    for (let n = 180; n < 360; n += 4) {
      const p = (n - 180) / 180;
      const w = 40 + p * 360;
      const x = 240 - w / 2 - playerX * p * 60;
      const stripe = Math.sin((n * 2 + pos * 0.1)) > 0;
      ctx.fillStyle = stripe ? '#ec4899' : '#3b0764';
      ctx.fillRect(x, n, w, 4);

      // Center Lane Stripe
      if (stripe) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(240 - playerX * p * 60 - 2, n, 4, 4);
      }
    }

    // Render Oncoming Cars
    cars.forEach(car => {
      car.z -= (speed + 20);
      if (car.z < 0) { car.z = 2000; car.x = (Math.random() - 0.5) * 1.8; }
      if (car.z < 1800 && car.z > 30) {
        const scale = 200 / car.z;
        const cy = 180 + (180 - scale * 90);
        const cx = 240 + (car.x - playerX) * scale * 200;
        const cw = 40 * scale, ch = 20 * scale;
        if (cy > 180 && cy < 350) {
          ctx.fillStyle = car.color;
          ctx.fillRect(cx - cw/2, cy - ch, cw, ch);
          ctx.fillStyle = '#ff0'; ctx.fillRect(cx - cw/2 + 2, cy - 4, 4 * scale, 4 * scale);
          ctx.fillRect(cx + cw/2 - 6 * scale, cy - 4, 4 * scale, 4 * scale);
          // Collision check
          if (car.z < 120 && car.z > 40 && Math.abs(car.x - playerX) < 0.3) {
            gameOver = true;
          }
        }
      }
    });

    // Player Car
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(220, 310, 40, 20);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(222, 325, 8, 4); ctx.fillRect(250, 325, 8, 4);
    ctx.fillStyle = '#0284c7'; ctx.fillRect(225, 305, 30, 8);

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 480, 360);
      ctx.fillStyle = '#f43f5e'; ctx.font = 'bold 28px monospace';
      ctx.fillText('CRASHED! RESTARTING...', 70, 180);
      setTimeout(() => { gameOver = false; speed = 0; score = 0; playerX = 0; }, 2000);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'cyber-tunnel-3d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #a855f7; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #a855f7; border-radius: 12px; box-shadow: 0 0 20px rgba(168,85,247,0.5); }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>HYPERSPACE CYBER TUNNEL</h2>
  <canvas id="c" width="480" height="360"></canvas>
  <div class="hud">
    <span>SCORE: <b id="sc" style="color:#22c55e">0</b></span>
    <span>[MOUSE / ARROWS] Warp Position</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let angle = 0, px = 240, py = 180, score = 0, over = false;
  const obstacles = [];
  for (let i = 0; i < 6; i++) {
    obstacles.push({ z: 100 + i * 150, ang: Math.random() * Math.PI * 2, len: 1.2 });
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    px = e.clientX - rect.left; py = e.clientY - rect.top;
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') px = Math.max(80, px - 20);
    if (e.key === 'ArrowRight') px = Math.min(400, px + 20);
    if (e.key === 'ArrowUp') py = Math.max(60, py - 20);
    if (e.key === 'ArrowDown') py = Math.min(300, py + 20);
  });

  function render() {
    ctx.fillStyle = '#040209'; ctx.fillRect(0, 0, 480, 360);
    angle += 0.02;
    if (!over) { score++; document.getElementById('sc').innerText = score; }

    // Draw tunnel rings
    for (let r = 20; r < 240; r += 20) {
      ctx.beginPath();
      ctx.arc(240, 180, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsl(' + ((angle * 50 + r) % 360) + ', 80%, 50%)';
      ctx.lineWidth = 2; ctx.stroke();
    }

    // Obstacles
    obstacles.forEach(o => {
      o.z -= 4;
      if (o.z < 10) { o.z = 900; o.ang = Math.random() * Math.PI * 2; }
      const rad = 2500 / o.z;
      if (rad > 10 && rad < 240) {
        ctx.beginPath();
        ctx.arc(240, 180, rad, o.ang, o.ang + o.len);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 10; ctx.stroke();

        // Collision detection
        const pAng = Math.atan2(py - 180, px - 240);
        const normPAng = (pAng + Math.PI * 2) % (Math.PI * 2);
        const normOAng = (o.ang + Math.PI * 2) % (Math.PI * 2);
        const pDist = Math.hypot(px - 240, py - 180);
        if (Math.abs(pDist - rad) < 15 && normPAng >= normOAng && normPAng <= normOAng + o.len) {
          over = true;
        }
      }
    });

    // Player Cursor Ship
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8'; ctx.shadowBlur = 15; ctx.shadowColor = '#38bdf8';
    ctx.fill(); ctx.shadowBlur = 0;

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, 480, 360);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px monospace';
      ctx.fillText('WARP COLLISION! RESTARTING...', 40, 180);
      setTimeout(() => { over = false; score = 0; }, 1800);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
</script>
</body>
</html>`;

    case 'geometry-dash-lite':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0b0f19; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #eab308; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #eab308; border-radius: 12px; }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON GEOMETRY DASH</h2>
  <canvas id="c" width="480" height="300"></canvas>
  <div class="hud">
    <span>PERCENT: <b id="pct" style="color:#22c55e">0%</b></span>
    <span>ATTEMPTS: <b id="att" style="color:#f59e0b">1</b></span>
    <span>[SPACE / CLICK] Jump</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let y = 220, vy = 0, rot = 0, grounded = true, progress = 0, attempts = 1, over = false;
  const spikes = [400, 700, 950, 1200, 1450, 1750, 2050, 2350, 2650, 3000];

  function jump() {
    if (grounded && !over) { vy = -12; grounded = false; }
  }
  window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') jump(); });
  canvas.addEventListener('mousedown', jump);

  function loop() {
    ctx.fillStyle = '#060a14'; ctx.fillRect(0, 0, 480, 300);

    // Floor
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 240, 480, 60);
    ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 240); ctx.lineTo(480, 240); ctx.stroke();

    if (!over) {
      progress += 6;
      vy += 0.8; y += vy;
      if (y >= 220) { y = 220; vy = 0; grounded = true; rot = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2); }
      else { rot += 0.15; }
      document.getElementById('pct').innerText = Math.min(100, Math.floor((progress / 3200) * 100)) + '%';
    }

    // Render Spikes
    spikes.forEach(sx => {
      const screenX = sx - progress + 80;
      if (screenX > -30 && screenX < 510) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(screenX, 240); ctx.lineTo(screenX + 15, 205); ctx.lineTo(screenX + 30, 240);
        ctx.closePath(); ctx.fill();

        // Hitbox
        if (screenX < 100 && screenX + 25 > 80 && y > 200) {
          over = true;
        }
      }
    });

    // Player Cube
    ctx.save();
    ctx.translate(90, y + 10);
    ctx.rotate(rot);
    ctx.fillStyle = '#eab308'; ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = '#0284c7'; ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, 480, 300);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 22px monospace';
      ctx.fillText('CRASHED! TRY AGAIN', 120, 150);
      setTimeout(() => {
        over = false; progress = 0; y = 220; vy = 0; rot = 0; attempts++;
        document.getElementById('att').innerText = attempts;
      }, 1000);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'bubble-shooter-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #080a14; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #06b6d4; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #06b6d4; border-radius: 12px; box-shadow: 0 0 20px rgba(6,182,212,0.4); }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON BUBBLE SHOOTER</h2>
  <canvas id="c" width="400" height="420"></canvas>
  <div class="hud">
    <span>SCORE: <b id="sc" style="color:#22c55e">0</b></span>
    <span>[MOUSE] Aim [CLICK] Shoot</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];
  let score = 0, cannonAngle = -Math.PI / 2;
  let bullet = null, nextColor = COLORS[0];

  const grid = [];
  for (let r = 0; r < 5; r++) {
    grid[r] = [];
    for (let c = 0; c < 10; c++) {
      grid[r][c] = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    cannonAngle = Math.atan2(my - 400, mx - 200);
  });

  canvas.addEventListener('click', () => {
    if (!bullet) {
      bullet = { x: 200, y: 400, vx: Math.cos(cannonAngle) * 9, vy: Math.sin(cannonAngle) * 9, color: nextColor };
      nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
  });

  function draw() {
    ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, 400, 420);

    // Draw Grid
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < 10; c++) {
        if (grid[r] && grid[r][c]) {
          ctx.beginPath();
          ctx.arc(c * 38 + 28, r * 34 + 25, 15, 0, Math.PI * 2);
          ctx.fillStyle = grid[r][c]; ctx.fill();
        }
      }
    }

    // Bullet physics
    if (bullet) {
      bullet.x += bullet.vx; bullet.y += bullet.vy;
      if (bullet.x < 15 || bullet.x > 385) bullet.vx = -bullet.vx;
      if (bullet.y < 40) {
        // Stick top
        score += 50; document.getElementById('sc').innerText = score;
        bullet = null;
      }
      if (bullet) {
        ctx.beginPath(); ctx.arc(bullet.x, bullet.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = bullet.color; ctx.fill();
      }
    }

    // Cannon
    ctx.save();
    ctx.translate(200, 400); ctx.rotate(cannonAngle);
    ctx.fillStyle = '#64748b'; ctx.fillRect(0, -6, 40, 12);
    ctx.restore();

    ctx.beginPath(); ctx.arc(200, 400, 18, 0, Math.PI * 2);
    ctx.fillStyle = nextColor; ctx.fill();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
</script>
</body>
</html>`;

    case 'chess-mini':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #090d16; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #38bdf8; font-size: 20px; letter-spacing: 2px; }
  #board { display: grid; grid-template-columns: repeat(8, 44px); grid-template-rows: repeat(8, 44px); border: 3px solid #334155; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
  .sq { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; }
  .light { background: #cbd5e1; color: #0f172a; }
  .dark { background: #475569; color: #f8fafc; }
  .sel { background: #38bdf8 !important; }
  .hud { margin-top: 8px; font-size: 13px; color: #94a3b8; }
</style>
</head>
<body>
  <h2>MINI CHESS MASTER</h2>
  <div id="board"></div>
  <div class="hud" id="status">Turn: White (Click piece to move)</div>
<script>
  const boardEl = document.getElementById('board');
  const PIECES = {
    r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
    R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
  };
  let board = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
  let selected = null;

  function render() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        sq.className = 'sq ' + (isDark ? 'dark' : 'light');
        if (selected && selected[0] === r && selected[1] === c) sq.classList.add('sel');
        sq.innerText = PIECES[board[r][c]] || '';
        sq.onclick = () => handleClick(r, c);
        boardEl.appendChild(sq);
      }
    }
  }

  function handleClick(r, c) {
    if (selected) {
      board[r][c] = board[selected[0]][selected[1]];
      board[selected[0]][selected[1]] = '';
      selected = null;
      render();
      setTimeout(aiMove, 300);
    } else if (board[r][c] && board[r][c] === board[r][c].toUpperCase()) {
      selected = [r, c];
      render();
    }
  }

  function aiMove() {
    const blackPieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && board[r][c] === board[r][c].toLowerCase()) blackPieces.push([r, c]);
      }
    }
    if (blackPieces.length > 0) {
      const [fromR, fromC] = blackPieces[Math.floor(Math.random() * blackPieces.length)];
      const targetR = Math.min(7, fromR + 1);
      board[targetR][fromC] = board[fromR][fromC];
      board[fromR][fromC] = '';
      render();
    }
  }
  render();
</script>
</body>
</html>`;

    case 'helix-jump-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #10b981; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #10b981; border-radius: 12px; }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON HELIX JUMP</h2>
  <canvas id="c" width="380" height="420"></canvas>
  <div class="hud">
    <span>LEVEL: <b id="lvl" style="color:#22c55e">1</b></span>
    <span>SCORE: <b id="sc" style="color:#f59e0b">0</b></span>
    <span>[A/D or ARROWS] Spin Tower</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let towerAngle = 0, ballY = 120, ballVy = 0, score = 0;

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'KeyA') towerAngle -= 0.15;
    if (e.key === 'ArrowRight' || e.key === 'KeyD') towerAngle += 0.15;
  });

  function loop() {
    ctx.fillStyle = '#060a12'; ctx.fillRect(0, 0, 380, 420);

    // Central Pole
    ctx.fillStyle = '#1e293b'; ctx.fillRect(175, 0, 30, 420);

    // Rotating Platforms
    for (let i = 0; i < 6; i++) {
      const py = 80 + i * 65;
      const ang = towerAngle + i * 0.8;
      ctx.beginPath();
      ctx.ellipse(190, py, 110, 25, 0, ang, ang + 4.5);
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 14; ctx.stroke();
    }

    // Bouncing Ball
    ballVy += 0.35; ballY += ballVy;
    if (ballY > 320) { ballY = 320; ballVy = -7.5; score += 10; document.getElementById('sc').innerText = score; }

    ctx.beginPath(); ctx.arc(190, ballY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24'; ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
    ctx.fill(); ctx.shadowBlur = 0;

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'sand-physics-sandbox':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #000; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #f59e0b; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #334155; border-radius: 8px; cursor: crosshair; }
  .tools { margin-top: 8px; display: flex; gap: 8px; }
  button { padding: 4px 10px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; }
</style>
</head>
<body>
  <h2>FALLING SAND AUTOMATA</h2>
  <canvas id="c" width="300" height="250"></canvas>
  <div class="tools">
    <button style="background:#eab308;color:#000" onclick="sel=1">Sand</button>
    <button style="background:#38bdf8;color:#000" onclick="sel=2">Water</button>
    <button style="background:#ef4444;color:#fff" onclick="sel=3">Fire</button>
    <button style="background:#94a3b8;color:#000" onclick="sel=4">Wall</button>
    <button style="background:#334155;color:#fff" onclick="grid.fill(0)">Clear</button>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const W = 100, H = 83;
  const grid = new Uint8Array(W * H);
  let sel = 1, isDown = false;

  canvas.addEventListener('mousedown', () => isDown = true);
  window.addEventListener('mouseup', () => isDown = false);
  canvas.addEventListener('mousemove', e => {
    if (isDown) {
      const rect = canvas.getBoundingClientRect();
      const gx = Math.floor((e.clientX - rect.left) / 3);
      const gy = Math.floor((e.clientY - rect.top) / 3);
      if (gx >= 0 && gx < W && gy >= 0 && gy < H) grid[gy * W + gx] = sel;
    }
  });

  function update() {
    for (let y = H - 2; y >= 0; y--) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (grid[i] === 1) { // Sand
          if (grid[i + W] === 0) { grid[i + W] = 1; grid[i] = 0; }
          else if (grid[i + W - 1] === 0 && x > 0) { grid[i + W - 1] = 1; grid[i] = 0; }
          else if (grid[i + W + 1] === 0 && x < W - 1) { grid[i + W + 1] = 1; grid[i] = 0; }
        } else if (grid[i] === 2) { // Water
          if (grid[i + W] === 0) { grid[i + W] = 2; grid[i] = 0; }
          else if (grid[i + 1] === 0 && x < W - 1) { grid[i + 1] = 2; grid[i] = 0; }
          else if (grid[i - 1] === 0 && x > 0) { grid[i - 1] = 2; grid[i] = 0; }
        }
      }
    }
    // Render
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < grid.length; i++) {
      const p = i * 4;
      if (grid[i] === 1) { img.data[p] = 234; img.data[p+1] = 179; img.data[p+2] = 8; img.data[p+3] = 255; }
      else if (grid[i] === 2) { img.data[p] = 56; img.data[p+1] = 189; img.data[p+2] = 248; img.data[p+3] = 255; }
      else if (grid[i] === 3) { img.data[p] = 239; img.data[p+1] = 68; img.data[p+2] = 68; img.data[p+3] = 255; }
      else if (grid[i] === 4) { img.data[p] = 148; img.data[p+1] = 163; img.data[p+2] = 184; img.data[p+3] = 255; }
      else { img.data[p+3] = 255; }
    }
    ctx.putImageData(img, 0, 0);
    ctx.drawImage(canvas, 0, 0, W, H, 0, 0, 300, 250);
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
</script>
</body>
</html>`;

    case 'cyber-pinball':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #080c14; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #ec4899; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #ec4899; border-radius: 12px; box-shadow: 0 0 20px rgba(236,72,153,0.4); }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON PINBALL DX</h2>
  <canvas id="c" width="360" height="440"></canvas>
  <div class="hud">
    <span>SCORE: <b id="sc" style="color:#f59e0b">0</b></span>
    <span>[A / LEFT] Left [D / RIGHT] Right [SPACE] Launch</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let bx = 180, by = 150, bvx = 3, bvy = 4, score = 0;
  let leftFlip = false, rightFlip = false;

  window.addEventListener('keydown', e => {
    if (e.key === 'a' || e.key === 'ArrowLeft') leftFlip = true;
    if (e.key === 'd' || e.key === 'ArrowRight') rightFlip = true;
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'a' || e.key === 'ArrowLeft') leftFlip = false;
    if (e.key === 'd' || e.key === 'ArrowRight') rightFlip = false;
  });

  function loop() {
    ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, 360, 440);

    // Bumpers
    const bumpers = [{x: 120, y: 120}, {x: 240, y: 120}, {x: 180, y: 200}];
    bumpers.forEach(b => {
      ctx.beginPath(); ctx.arc(b.x, b.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899'; ctx.fill();
      if (Math.hypot(bx - b.x, by - b.y) < 30) {
        bvx = (bx - b.x) * 0.4; bvy = (by - b.y) * 0.4;
        score += 100; document.getElementById('sc').innerText = score;
      }
    });

    // Ball physics
    bvy += 0.15; bx += bvx; by += bvy;
    if (bx < 15 || bx > 345) bvx = -bvx;
    if (by < 15) bvy = -bvy;
    if (by > 440) { bx = 180; by = 100; bvx = 2; bvy = 2; }

    // Flippers
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(80, 380); ctx.lineTo(150, leftFlip ? 360 : 395); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(280, 380); ctx.lineTo(210, rightFlip ? 360 : 395); ctx.stroke();

    // Flipper Hit
    if (by > 370 && by < 400) {
      if (bx > 80 && bx < 160 && leftFlip) { bvy = -8; score += 20; }
      if (bx > 200 && bx < 280 && rightFlip) { bvy = -8; score += 20; }
    }

    // Draw Ball
    ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#ffde59'; ctx.fill();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'traffic-crossy-road':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #0f172a; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #38bdf8; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #38bdf8; border-radius: 12px; }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON TRAFFIC CROSSING</h2>
  <canvas id="c" width="400" height="380"></canvas>
  <div class="hud">
    <span>SCORE: <b id="sc" style="color:#22c55e">0</b></span>
    <span>[W/A/S/D or ARROWS] Hop</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let px = 200, py = 340, score = 0, over = false;
  const lanes = [
    { y: 80, speed: 3, cars: [50, 220] },
    { y: 140, speed: -4, cars: [100, 300] },
    { y: 200, speed: 2.5, cars: [30, 200] },
    { y: 260, speed: -3.5, cars: [80, 260] }
  ];

  window.addEventListener('keydown', e => {
    if (over) return;
    if (e.key === 'ArrowUp' || e.key === 'w') {
      py -= 60; score += 10; document.getElementById('sc').innerText = score;
      if (py < 40) { py = 340; score += 100; }
    }
    if (e.key === 'ArrowDown' || e.key === 's') py = Math.min(340, py + 60);
    if (e.key === 'ArrowLeft' || e.key === 'a') px = Math.max(30, px - 30);
    if (e.key === 'ArrowRight' || e.key === 'd') px = Math.min(370, px + 30);
  });

  function loop() {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 400, 380);

    // Roads
    lanes.forEach(l => {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, l.y - 20, 400, 50);
      l.cars.forEach((cx, idx) => {
        l.cars[idx] += l.speed;
        if (l.cars[idx] > 450) l.cars[idx] = -60;
        if (l.cars[idx] < -60) l.cars[idx] = 450;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(l.cars[idx], l.y - 12, 45, 24);

        if (Math.hypot(px - (l.cars[idx] + 22), py - l.y) < 24) over = true;
      });
    });

    // Player
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, 400, 380);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px monospace';
      ctx.fillText('SPLAT! RESTARTING...', 70, 190);
      setTimeout(() => { over = false; px = 200; py = 340; score = 0; }, 1500);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    case 'cyber-hockey':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  h2 { margin: 0 0 5px; color: #06b6d4; font-size: 20px; letter-spacing: 2px; }
  canvas { border: 2px solid #06b6d4; border-radius: 12px; box-shadow: 0 0 25px rgba(6,182,212,0.4); }
  .hud { margin-top: 8px; font-size: 13px; color: #38bdf8; display: flex; gap: 20px; font-weight: bold; }
</style>
</head>
<body>
  <h2>NEON AIR HOCKEY</h2>
  <canvas id="c" width="340" height="460"></canvas>
  <div class="hud">
    <span>YOU: <b id="pSc" style="color:#22c55e">0</b></span>
    <span>CPU: <b id="cSc" style="color:#ef4444">0</b></span>
    <span>[MOUSE] Guide Mallet</span>
  </div>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  let px = 170, py = 380, cx = 170, cy = 80;
  let bx = 170, by = 230, bvx = 3, bvy = 4;
  let pScore = 0, cScore = 0;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    px = e.clientX - rect.left;
    py = Math.max(260, Math.min(430, e.clientY - rect.top));
  });

  function loop() {
    ctx.fillStyle = '#030712'; ctx.fillRect(0, 0, 340, 460);

    // Table lines
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(340, 230); ctx.stroke();
    ctx.beginPath(); ctx.arc(170, 230, 40, 0, Math.PI * 2); ctx.stroke();

    // AI Mallet
    cx += (bx - cx) * 0.08;

    // Puck Physics
    bx += bvx; by += bvy;
    if (bx < 15 || bx > 325) bvx = -bvx;

    // Paddle Hit
    if (Math.hypot(bx - px, by - py) < 32) { bvy = -Math.abs(bvy) * 1.05; bvx = (bx - px) * 0.3; }
    if (Math.hypot(bx - cx, by - cy) < 32) { bvy = Math.abs(bvy) * 1.05; bvx = (bx - cx) * 0.3; }

    // Goal Check
    if (by < 10) { pScore++; document.getElementById('pSc').innerText = pScore; reset(); }
    if (by > 450) { cScore++; document.getElementById('cSc').innerText = cScore; reset(); }

    function reset() { bx = 170; by = 230; bvx = (Math.random() - 0.5) * 6; bvy = 4; }

    // Render Mallets
    ctx.beginPath(); ctx.arc(px, py, 20, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill();

    // Render Puck
    ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fillStyle = '#38bdf8'; ctx.fill();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`;

    default:
      return '';
  }
}
