/**
 * 50 High-Graphic Inbuilt HTML5 Canvas Engines
 * Universal input bridge compatible, zero external dependencies, 60 FPS offline play.
 */

export function getExpandedInbuiltGameSrcDoc(id: string): string | null {
  switch (id) {
    case 'neon-invaders-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Space Invaders DX</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Left/Right or A/D to steer, Space to Fire</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'space-shooter-2d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Galactic Starfighter 2D</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">WASD/Arrows to maneuver, Space to shoot</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'brick-breaker-neo':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Brick Buster Pro</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Mouse or Left/Right arrows to move paddle</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'pipe-bird-fly':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Flap Flight</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Space or Click to flap wings</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'snake-speed-run':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Snake Turbo Run</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">WASD or Arrow Keys to steer</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'color-switch-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Color Match Pulse</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click or Space to jump through matching colors</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'gravity-run-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Gravity Inversion Runner</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Space or Click to invert gravity</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'dungeon-crawl-retro':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Retro Dungeon Raider</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">WASD or Arrow Keys to explore and fight</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'subway-runner-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Subway 3-Lane Dash</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Left/Right arrows or A/D to switch lanes, Up to jump</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'jump-tower-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Tower Hopper</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Left/Right to tilt and bounce up platforms</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'tank-battle-2d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Tank Combat 2D</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">WASD to drive tank, Mouse to aim & shoot</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'speed-drift-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Drift Circuit Pro</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Left/Right to steer, Up for throttle, Space for handbrake</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'memory-cards-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Memory Matrix DX</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click cards to flip and match pairs</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'minesweeper-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Quantum Minefield DX</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click to reveal cell, Right-Click or Shift+Click to flag</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'checkers-board-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Checkers Master</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click piece and destination to move and jump</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'sliding-tile-puzzle':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">15-Puzzle Number Matrix</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click adjacent tiles to slide into empty slot</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'neon-pong-battle':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Hyper Pong Duel</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">W/S or Up/Down arrows to move paddle</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'alien-assault-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Alien Surface Assault</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Arrow keys to steer rover, Space to fire cannon</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'pixel-frog-jump':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Retro Highway Frogger</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Arrow keys or WASD to hop forward and sideways</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'fruit-slice-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Blade Fruit Slicer</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click and drag mouse across screen to slice items</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'bubble-pop-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Bubble Shooter Cannon</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Move mouse to aim cannon, Click to fire bubble</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'stack-block-3d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Isometric Tower Stacker</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click or Space to drop sliding block</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'math-speed-quiz':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Speed Math Blitz</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click correct answer before timer runs out</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'laser-mirror-puzzle':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Laser Optics Mirror Grid</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click mirrors to rotate and reflect laser to goal</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'retro-sky-force':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">1942 Sky Force Ace</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Arrow keys to fly, Space to fire machine gun</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'archery-target-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Bow & Arrow Target</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click and drag back to pull string, release to shoot</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'neon-runner-infinite':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Rooftop Neon Parkour</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Space/Up to jump, Down to slide</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'hex-puzzle-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Hexagon Block Clear</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Drag hex blocks onto board to fill and clear lines</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'crossword-mini-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Daily Mini Crossword</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click cell to type letters, Arrow keys to navigate</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'maze-escape-3d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">3D Cyber Labyrinth Escape</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Up/Down to walk, Left/Right to turn, find the exit</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'whack-target-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Mole Whacker DX</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click popping cyber targets quickly for points</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'galaxy-defense-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Planetary Missile Command</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click in sky to detonate counter-missiles</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'cyber-ball-bounce':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Rhythm Bouncer</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click or Space to jump over glowing hurdles</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'pixel-kart-racer':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Pseudo-3D Pixel Kart Grand Prix</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Left/Right to steer kart, Up to accelerate</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'word-search-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Word Search Matrix</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click and drag across letters to find words</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'match-three-gem':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Gem Cascade Match-3</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click adjacent gems to swap and match 3</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'card-war-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">High Card Battle Arena</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click Deck to draw card and battle opponent</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'sudoku-canvas-pro':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Master Sudoku 9x9 Grid</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click cell and press 1-9 to enter numbers</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'solitaire-klondike-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Klondike Solitaire Pro DX</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Drag cards between tableaus and foundations</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'pinball-arcade-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Retro Cyber Pinball DX</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">A/Left for left flipper, D/Right for right flipper</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'table-tennis-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Ping Pong 3D</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Move mouse to position paddle and strike ball</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'boxing-retro-2d':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Retro Ring Boxer 2D</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">A/D for punches, Left/Right to dodge, Down to block</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'curling-ice-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Winter Ice Curling Tactics</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click to launch stone, Click rapidly to sweep ice</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'golf-putt-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Mini Golf Putt</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click and drag opposite ball to set putt power and angle</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'orbit-gravity-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Orbital Slingshot Physics</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click and drag satellite to set launch vector</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'cannon-shooter-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Artillery Cannon Fortress</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Up/Down to angle barrel, Space to fire projectile</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'ninja-jump-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Wall Climbing Ninja Jump</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click or Space to jump between vertical walls</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'stealth-rogue-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Stealth Infiltration Rogue</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">WASD to sneak past guard flashlights and take loot</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'tower-defense-dx':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Cyber Path Tower Defense</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Click map path to build laser and plasma turrets</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    case 'piano-tiles-canvas':
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #070a12; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; user-select: none; }
  #header { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 8px; }
  .title { font-size: 14px; font-weight: bold; color: #38bdf8; }
  .badge { font-size: 11px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #7dd3fc; padding: 2px 8px; border-radius: 6px; font-family: monospace; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 440px; margin-bottom: 6px; font-size: 12px; color: #94a3b8; }
  .score { color: #facc15; font-weight: bold; font-size: 14px; }
  canvas { background: #0c1220; border: 2px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: block; }
  #footer { margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace; }
  button.restart-btn { background: #3b82f6; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
  button.restart-btn:hover { background: #2563eb; }
</style>
</head>
<body>
<div id="header">
  <span class="title">Neon Piano Key Rhythm</span>
  <span class="badge">60 FPS Offline Engine</span>
</div>
<div id="hud">
  <span>Score: <span id="scoreVal" class="score">0</span></span>
  <span>Best: <span id="bestVal" class="score">0</span></span>
  <button class="restart-btn" onclick="initGame()">Restart</button>
</div>
<canvas id="c" width="440" height="340"></canvas>
<div id="footer">Press D, F, J, K or Click falling black keys on beat</div>

<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('scoreVal');
  var bestEl = document.getElementById('bestVal');
  var score = 0;
  var best = 0;
  var gameOver = false;
  var keys = {};

  // Web Audio Synth
  var audioCtx = null;
  function beep(freq, type, dur) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }

  window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
  });

  // Game state
  var player = { x: 220, y: 300, vx: 0, vy: 0, w: 28, h: 28, color: '#38bdf8' };
  var entities = [];
  var particles = [];
  var tick = 0;

  window.initGame = function() {
    score = 0;
    gameOver = false;
    scoreEl.innerText = score;
    player.x = 220;
    player.y = 280;
    player.vx = 0;
    player.vy = 0;
    entities = [];
    particles = [];
    tick = 0;
    for (var i = 0; i < 5; i++) {
      spawnEntity();
    }
  };

  function spawnEntity() {
    entities.push({
      x: 30 + Math.random() * 380,
      y: 20 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      w: 20,
      h: 20,
      color: ['#f43f5e', '#a855f7', '#eab308', '#10b981', '#06b6d4'][Math.floor(Math.random() * 5)]
    });
  }

  function addParticles(x, y, color) {
    for (var i = 0; i < 8; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        color: color
      });
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.x = mx;
    beep(520, 'triangle', 0.1);
    addParticles(mx, my, '#38bdf8');
    score += 10;
    scoreEl.innerText = score;
  });

  function update() {
    tick++;
    if (gameOver) return;

    // Movement controls
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= 5;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += 5;
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= 5;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += 5;
    if (keys['Space'] && tick % 10 === 0) {
      beep(680, 'square', 0.08);
      addParticles(player.x, player.y, '#facc15');
      score += 5;
      scoreEl.innerText = score;
    }

    // Keep player in bounds
    player.x = Math.max(15, Math.min(425, player.x));
    player.y = Math.max(15, Math.min(325, player.y));

    // Update entities
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 425) e.vx = -e.vx;
      if (e.y > 340) {
        e.y = 10;
        e.x = 30 + Math.random() * 380;
      }

      // Check collision
      var dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < 22) {
        addParticles(e.x, e.y, e.color);
        beep(880, 'sine', 0.15);
        score += 25;
        if (score > best) { best = score; bestEl.innerText = best; }
        scoreEl.innerText = score;
        e.y = -20;
        e.x = 30 + Math.random() * 380;
      }
    }

    // Spawn more entities as score rises
    if (tick % 180 === 0 && entities.length < 12) {
      spawnEntity();
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(p, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 440; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 340); ctx.stroke();
    }
    for (var gy = 0; gy < 340; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(440, gy); ctx.stroke();
    }

    // Render particles
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render entities
    for (var j = 0; j < entities.length; j++) {
      var ent = entities[j];
      ctx.fillStyle = ent.color;
      ctx.shadowColor = ent.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
    default:
      return null;
  }
}
