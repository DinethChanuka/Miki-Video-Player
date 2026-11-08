/**
 * Modern Generative Hi-Fi Canvas Visualizers
 * 
 * High-performance, Retina-crisp audio visualizers inspired by Apple Music,
 * Plexamp, and WebGL generative audio aesthetics:
 * 1. Aurora: Dynamic Ambient Aurora Fluid Mesh (volumetric morphing color gradients)
 * 2. Tunnel: Hyper-Warp 3D Stargate Tunnel (concentric geometric rings + starfield)
 * 3. Prism: Kinetic Holographic Prism (rotating 3D wireframe polyhedron)
 * 4. Halo: Audiophile Neon Pulse Ring (circular oscilloscope with transient sparks)
 * 5. Nebula: Quantum Nebula Particle Field (audio-reactive stardust constellations)
 * 6. Spectrum: Cyber Studio Spectrum (neon columns with smooth falling peak caps)
 */

export type VisualizerMode =
  | 'aurora'
  | 'tunnel'
  | 'prism'
  | 'halo'
  | 'nebula'
  | 'spectrum'
  | 'orbital' // legacy backward-compatibility alias
  | 'ribbon';  // legacy backward-compatibility alias

export interface VisualizerThemeMeta {
  id: VisualizerMode;
  label: string;
  icon: string;
  description: string;
  accent: string;
}

export const VISUALIZER_THEMES: VisualizerThemeMeta[] = [
  {
    id: 'aurora',
    label: 'Ambient Aurora',
    icon: 'Sparkles',
    description: 'Volumetric morphing fluid gradients that breathe to sub-bass & vocals',
    accent: 'from-cyan-500 to-indigo-600',
  },
  {
    id: 'tunnel',
    label: 'Hyper Warp 3D',
    icon: 'Radio',
    description: 'Infinite 3D stargate tunnel with neon rings pulsing to kick transients',
    accent: 'from-purple-500 to-pink-600',
  },
  {
    id: 'prism',
    label: 'Holo Prism 3D',
    icon: 'Box',
    description: 'Kinetic 3D crystalline polyhedron refracting chromatic beams',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'halo',
    label: 'Neon Pulse Halo',
    icon: 'Disc',
    description: 'Audiophile circular oscilloscope ring radiating harmonic waves',
    accent: 'from-amber-400 to-rose-500',
  },
  {
    id: 'nebula',
    label: 'Quantum Nebula',
    icon: 'Atom',
    description: 'Swirling galaxy of 400+ stardust nodes connected by dynamic energy webs',
    accent: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'spectrum',
    label: 'Cyber Spectrum',
    icon: 'Activity',
    description: 'Ultra-crisp neon columns with physics-based floating peak caps',
    accent: 'from-cyan-400 to-fuchsia-500',
  },
];

// Helper to compute average energy in frequency band
function getBandEnergy(data: Uint8Array | null, startBin: number, endBin: number): number {
  if (!data || data.length === 0) return 0.25;
  const end = Math.min(endBin, data.length);
  const start = Math.max(0, Math.min(startBin, end - 1));
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += data[i] || 0;
  }
  return sum / ((end - start) * 255);
}

/* ==================================================================== */
/* 1. Dynamic Ambient Aurora Fluid Mesh (Plexamp / Apple Music style)     */
/* ==================================================================== */
export function renderAmbientAurora(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);

  const bassEnergy = syncAudio && isPlaying ? getBandEnergy(data, 0, 12) : 0.35 + Math.sin(phase * 1.5) * 0.15;
  const midEnergy = syncAudio && isPlaying ? getBandEnergy(data, 12, 40) : 0.3 + Math.cos(phase * 1.8) * 0.15;
  const trebleEnergy = syncAudio && isPlaying ? getBandEnergy(data, 40, 80) : 0.25;

  const centerX = width / 2;
  const centerY = height * 0.52;

  // Layer 1: Deep Background Ambient Glow
  const bgGrad = ctx.createRadialGradient(
    centerX,
    centerY,
    50,
    centerX,
    centerY,
    Math.max(width, height) * 0.65
  );
  bgGrad.addColorStop(0, `rgba(15, 23, 42, 0.95)`);
  bgGrad.addColorStop(0.5, `rgba(10, 15, 30, 0.98)`);
  bgGrad.addColorStop(1, `rgba(3, 7, 18, 1)`);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Layer 2: Morphing Volumetric Aurora Orbs
  const orbs = [
    {
      x: centerX + Math.sin(phase * 0.7) * (width * 0.25),
      y: centerY + Math.cos(phase * 0.9) * (height * 0.18),
      radius: (width * 0.28) * (1 + bassEnergy * 0.45),
      c1: `rgba(6, 182, 212, ${0.45 + bassEnergy * 0.35})`, // Cyan
      c2: 'rgba(6, 182, 212, 0)',
    },
    {
      x: centerX + Math.cos(phase * 0.8) * (width * 0.22),
      y: centerY + Math.sin(phase * 1.1) * (height * 0.2),
      radius: (width * 0.32) * (1 + midEnergy * 0.4),
      c1: `rgba(168, 85, 247, ${0.4 + midEnergy * 0.35})`, // Purple
      c2: 'rgba(168, 85, 247, 0)',
    },
    {
      x: centerX + Math.sin(phase * 1.2 + 2) * (width * 0.2),
      y: centerY + Math.sin(phase * 0.6 + 1) * (height * 0.15),
      radius: (width * 0.24) * (1 + trebleEnergy * 0.5),
      c1: `rgba(236, 72, 153, ${0.35 + trebleEnergy * 0.35})`, // Pink
      c2: 'rgba(236, 72, 153, 0)',
    },
  ];

  for (const orb of orbs) {
    const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.radius);
    orbGrad.addColorStop(0, orb.c1);
    orbGrad.addColorStop(1, orb.c2);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 3: Smooth Harmonic Flowing Streamlines
  const lineCount = 4;
  for (let l = 0; l < lineCount; l++) {
    const lineY = centerY + (l - lineCount / 2) * 45;
    ctx.beginPath();
    ctx.moveTo(0, lineY);

    const step = 20;
    for (let x = 0; x <= width; x += step) {
      const envelope = Math.sin((x / width) * Math.PI);
      const wave = Math.sin(x * 0.008 + phase * (1.2 + l * 0.3) + l) * 28 * (1 + bassEnergy * 0.8) * envelope;
      ctx.lineTo(x, lineY + wave);
    }

    const strokeGrad = ctx.createLinearGradient(0, lineY, width, lineY);
    strokeGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
    strokeGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.25 + bassEnergy * 0.4})`);
    strokeGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 1.5 + (l % 2) * 1.0;
    ctx.stroke();
  }
}

/* ==================================================================== */
/* 2. Hyper-Warp 3D Stargate Tunnel                                     */
/* ==================================================================== */
interface WarpStar {
  x: number;
  y: number;
  z: number;
  pz: number;
}
let warpStars: WarpStar[] = [];
function initWarpStars(count = 180): void {
  if (warpStars.length >= count) return;
  warpStars = [];
  for (let i = 0; i < count; i++) {
    warpStars.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1600,
      z: Math.random() * 1000 + 1,
      pz: 1000,
    });
  }
}

export function renderWarpTunnel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);
  initWarpStars();

  const centerX = width / 2;
  const centerY = height * 0.52;
  const bass = syncAudio && isPlaying ? getBandEnergy(data, 0, 16) : 0.35;
  const warpSpeed = (isPlaying ? 14 : 2) * (1 + bass * 1.5);

  // Background deep space
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, width, height);

  // Concentric 3D Hexagonal Neon Rings
  const ringCount = 9;
  for (let i = 0; i < ringCount; i++) {
    const ringPhase = (phase * 0.8 + i / ringCount) % 1;
    const ringDist = (1 - ringPhase) * 650;
    const size = Math.max(20, (1 - ringDist / 700) * (Math.min(width, height) * 0.75));
    const alpha = Math.min(0.9, (1 - ringDist / 700) * (0.3 + bass * 0.6));

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(phase * 0.15 + (i % 2 === 0 ? 0 : Math.PI / 6));

    const sides = 6;
    ctx.beginPath();
    for (let s = 0; s <= sides; s++) {
      const angle = (s * Math.PI * 2) / sides;
      const rx = Math.cos(angle) * size;
      const ry = Math.sin(angle) * (size * 0.65); // 3D tilt
      if (s === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }

    ctx.strokeStyle = i % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
    ctx.lineWidth = 1.5 + (1 - ringDist / 700) * 2.5;
    ctx.stroke();
    ctx.restore();
  }

  // Warp Stars
  for (const s of warpStars) {
    s.pz = s.z;
    s.z -= warpSpeed;
    if (s.z <= 0) {
      s.z = 1000;
      s.pz = 1000;
      s.x = (Math.random() - 0.5) * 1600;
      s.y = (Math.random() - 0.5) * 1600;
    }

    const sx = centerX + (s.x / s.z) * 450;
    const sy = centerY + (s.y / s.z) * 450;
    const px = centerX + (s.x / s.pz) * 450;
    const py = centerY + (s.y / s.pz) * 450;

    const starAlpha = Math.min(1.0, (1 - s.z / 1000) * (0.4 + bass * 0.6));
    ctx.strokeStyle = `rgba(255, 255, 255, ${starAlpha})`;
    ctx.lineWidth = Math.max(1, (1 - s.z / 1000) * 2.5);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
}

/* ==================================================================== */
/* 3. Kinetic Holographic Prism (Rotating 3D Polyhedron & Tesseract)   */
/* ==================================================================== */
const POLY_VERTICES = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
  [0, 1.6, 0],
  [0, -1.6, 0],
];
const POLY_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
  [8, 2], [8, 3], [8, 6], [8, 7],
  [9, 0], [9, 1], [9, 4], [9, 5],
];

const OUTER_FRAME_VERTICES = [
  [-1.5, -1.5, -1.5],
  [1.5, -1.5, -1.5],
  [1.5, 1.5, -1.5],
  [-1.5, 1.5, -1.5],
  [-1.5, -1.5, 1.5],
  [1.5, -1.5, 1.5],
  [1.5, 1.5, 1.5],
  [-1.5, 1.5, 1.5],
];
const OUTER_FRAME_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

export function renderHolographicPrism(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height * 0.52;
  const energy = syncAudio && isPlaying ? getBandEnergy(data, 10, 50) : 0.35 + Math.sin(phase) * 0.15;
  // Expansive scale framing the central 256px cover flow card
  const scale = (Math.min(width, height) * 0.54) * (1 + energy * 0.25);

  // Background Ambient Holographic Aura
  const aura = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, scale * 1.8);
  aura.addColorStop(0, `rgba(59, 130, 246, ${0.35 * energy})`);
  aura.addColorStop(0.4, `rgba(168, 85, 247, ${0.18 * energy})`);
  aura.addColorStop(0.8, `rgba(6, 182, 212, ${0.08 * energy})`);
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Concentric Orbital Astrolabe Rings framing the album art
  const ringRadius1 = scale * 0.88;
  const ringRadius2 = scale * 1.18;

  // Ring 1 (tilted cyan astrolabe ring)
  ctx.beginPath();
  const tiltCos1 = Math.cos(phase * 0.45);
  const tiltSin1 = Math.sin(phase * 0.45);
  for (let s = 0; s <= 36; s++) {
    const ang = (s / 36) * Math.PI * 2;
    const px0 = Math.cos(ang) * ringRadius1;
    const py0 = Math.sin(ang) * ringRadius1 * 0.38;
    const rx = px0 * tiltCos1 - py0 * tiltSin1;
    const ry = px0 * tiltSin1 + py0 * tiltCos1;
    if (s === 0) ctx.moveTo(centerX + rx, centerY + ry);
    else ctx.lineTo(centerX + rx, centerY + ry);
  }
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Ring 2 (counter-tilted magenta astrolabe ring)
  ctx.beginPath();
  const tiltCos2 = Math.cos(-phase * 0.65);
  const tiltSin2 = Math.sin(-phase * 0.65);
  for (let s = 0; s <= 36; s++) {
    const ang = (s / 36) * Math.PI * 2;
    const px0 = Math.cos(ang) * ringRadius2;
    const py0 = Math.sin(ang) * ringRadius2 * 0.42;
    const rx = px0 * tiltCos2 - py0 * tiltSin2;
    const ry = px0 * tiltSin2 + py0 * tiltCos2;
    if (s === 0) ctx.moveTo(centerX + rx, centerY + ry);
    else ctx.lineTo(centerX + rx, centerY + ry);
  }
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3D Rotation angles for core inner polyhedron
  const rotX = phase * 0.6;
  const rotY = phase * 0.9;
  const rotZ = phase * 0.4;

  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  const distance = 2.4;
  const projected: Array<[number, number, number]> = [];

  for (const [vx, vy, vz] of POLY_VERTICES) {
    let x = vx * cosY - vz * sinY;
    let z = vx * sinY + vz * cosY;
    let y = vy * cosX - z * sinX;
    z = vy * sinX + z * cosX;
    const rx = x * cosZ - y * sinZ;
    const ry = x * sinZ + y * cosZ;

    const fov = 1 / (distance + z * 0.4);
    const sx = centerX + rx * scale * fov;
    const sy = centerY + ry * scale * fov;
    projected.push([sx, sy, z]);
  }

  // Draw Core Edges with Chromatic Neon Glow
  for (const [i1, i2] of POLY_EDGES) {
    const p1 = projected[i1];
    const p2 = projected[i2];
    if (!p1 || !p2) continue;

    const edgeGrad = ctx.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
    edgeGrad.addColorStop(0, '#06b6d4');
    edgeGrad.addColorStop(0.5, '#3b82f6');
    edgeGrad.addColorStop(1, '#ec4899');

    ctx.strokeStyle = edgeGrad;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  }

  // Draw Outer Framing Tesseract Cage (Counter-rotating)
  const oRotX = -phase * 0.4;
  const oRotY = -phase * 0.55;
  const oCosX = Math.cos(oRotX), oSinX = Math.sin(oRotX);
  const oCosY = Math.cos(oRotY), oSinY = Math.sin(oRotY);

  const outerProjected: Array<[number, number, number]> = [];
  for (const [vx, vy, vz] of OUTER_FRAME_VERTICES) {
    let x = vx * oCosY - vz * oSinY;
    let z = vx * oSinY + vz * oCosY;
    let y = vy * oCosX - z * oSinX;
    z = vy * oSinX + z * oCosX;

    const fov = 1 / (distance + z * 0.35);
    const sx = centerX + x * scale * fov;
    const sy = centerY + y * scale * fov;
    outerProjected.push([sx, sy, z]);
  }

  for (const [i1, i2] of OUTER_FRAME_EDGES) {
    const p1 = outerProjected[i1];
    const p2 = outerProjected[i2];
    if (!p1 || !p2) continue;

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  }

  // Projected Vertices Sparkle Nodes
  for (const [px, py] of projected) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 3.0 + energy * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Subtle outer halo per vertex
    ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.beginPath();
    ctx.arc(px, py, 6.0 + energy * 4.0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const [px, py] of outerProjected) {
    ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
    ctx.beginPath();
    ctx.arc(px, py, 2.5 + energy * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ==================================================================== */
/* 4. Audiophile Neon Pulse Ring (Minimalist Halo)                      */
/* ==================================================================== */
export function renderNeonPulseHalo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height * 0.5;
  const baseRadius = Math.min(width, height) * 0.23;
  const energy = syncAudio && isPlaying ? getBandEnergy(data, 0, 32) : 0.35 + Math.sin(phase * 1.5) * 0.15;

  // Center radial atmosphere
  const aura = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, baseRadius * 1.6);
  aura.addColorStop(0, `rgba(245, 158, 11, ${0.35 * energy})`);
  aura.addColorStop(0.6, `rgba(244, 63, 94, ${0.18 * energy})`);
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  const segmentCount = 96;
  const step = (Math.PI * 2) / segmentCount;

  ctx.beginPath();
  for (let i = 0; i <= segmentCount; i++) {
    const angle = i * step;
    let waveAmp = 6;
    if (isPlaying && syncAudio && data && data.length > 0) {
      const idx = Math.floor((i / segmentCount) * (data.length * 0.7));
      waveAmp = ((data[idx] || 0) / 255) * 48;
    } else {
      waveAmp = (Math.sin(angle * 6 + phase * 2.5) * 0.5 + 0.5) * 24;
    }

    const r = baseRadius + waveAmp;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  ctx.strokeStyle = `rgba(251, 146, 60, ${0.75 + energy * 0.25})`;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Secondary Echo Ring
  ctx.strokeStyle = `rgba(244, 63, 94, ${0.35 + energy * 0.25})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius * (1.1 + energy * 0.1), 0, Math.PI * 2);
  ctx.stroke();
}

/* ==================================================================== */
/* 5. Quantum Nebula Particle Field (Constellations)                     */
/* ==================================================================== */
interface NebulaNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}
let nebulaNodes: NebulaNode[] = [];
function initNebula(count = 70): void {
  if (nebulaNodes.length >= count) return;
  nebulaNodes = [];
  for (let i = 0; i < count; i++) {
    nebulaNodes.push({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.7,
    });
  }
}

export function renderQuantumNebula(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);
  initNebula();

  const energy = syncAudio && isPlaying ? getBandEnergy(data, 0, 64) : 0.35;
  const speedMult = isPlaying ? 1 + energy * 1.5 : 0.2;

  // Move and draw nodes
  for (let i = 0; i < nebulaNodes.length; i++) {
    const node = nebulaNodes[i];
    node.x += (node.vx + Math.sin(phase * 0.5 + i) * 0.15) * speedMult;
    node.y += (node.vy + Math.cos(phase * 0.5 + i) * 0.15) * speedMult;

    if (node.x < 0) node.x = width;
    if (node.x > width) node.x = 0;
    if (node.y < 0) node.y = height;
    if (node.y > height) node.y = 0;

    ctx.fillStyle = `rgba(52, 211, 153, ${node.alpha * (0.5 + energy * 0.5)})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size + energy * 2, 0, Math.PI * 2);
    ctx.fill();

    // Connect close neighbors with constellation energy web
    for (let j = i + 1; j < nebulaNodes.length; j++) {
      const n2 = nebulaNodes[j];
      const dx = node.x - n2.x;
      const dy = node.y - n2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        const linkAlpha = (1 - dist / 110) * 0.25 * (1 + energy);
        ctx.strokeStyle = `rgba(45, 212, 191, ${linkAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      }
    }
  }
}

/* ==================================================================== */
/* 6. Cyber Studio Spectrum (Modern Neon Columns)                        */
/* ==================================================================== */
const spectrumPeaks: number[] = [];

export function renderCyberSpectrum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);

  const barCount = 48;
  const barWidth = (width / barCount) * 0.72;
  const gap = (width / barCount) * 0.28;
  const centerY = height * 0.65;

  for (let i = 0; i < barCount; i++) {
    let intensity = 0.15;

    if (isPlaying) {
      if (syncAudio && data && data.length > 0) {
        // Map all 48 bars across the active musical spectrum (bins 0 to ~22 in 64-bin FFT)
        const t = i / (barCount - 1);
        const maxActiveBin = Math.max(8, Math.min(data.length - 1, Math.floor(data.length * 0.35)));
        const binPos = Math.pow(t, 1.15) * maxActiveBin;
        const binLow = Math.floor(binPos);
        const binHigh = Math.min(maxActiveBin, binLow + 1);
        const binFrac = binPos - binLow;
        const directVal = (data[binLow] || 0) * (1 - binFrac) + (data[binHigh] || 0) * binFrac;

        // Smooth treble acoustic compensation
        const trebleBoost = 1.0 + Math.pow(t, 0.75) * 1.35;

        // Harmonic continuity to maintain rhythmic response across upper octaves
        const harmonicBin = Math.floor((i % 16) * (maxActiveBin / 24));
        const harmonicVal = (data[harmonicBin] || 0) * 0.45;
        const blended = Math.max(directVal * trebleBoost, harmonicVal * (0.8 + 0.4 * t));

        intensity = Math.min(1.0, Math.max(0.18, blended / 220));
      } else {
        const wave1 = Math.sin(phase * 1.2 + i * 0.18) * 0.5 + 0.5;
        const wave2 = Math.cos(phase * 0.8 + i * 0.28) * 0.35 + 0.35;
        intensity = Math.min(1.0, wave1 * 0.65 + wave2 * 0.45);
      }
    }

    // Wide acoustic envelope that never zeros out edge bars
    const tNorm = i / (barCount - 1);
    const envelope = 0.88 + 0.12 * Math.sin(tNorm * Math.PI);
    const maxBarHeight = height * 0.48;
    const barHeight = Math.max(10, intensity * envelope * maxBarHeight);

    // Falling peak physics with capped overshoot
    spectrumPeaks[i] = Math.min(barHeight + 28, Math.max(barHeight, (spectrumPeaks[i] || 0) - 2.0));

    const x = i * (barWidth + gap) + gap / 2;
    const y = centerY - barHeight;

    // Upward Bar
    const grad = ctx.createLinearGradient(x, y, x, centerY);
    grad.addColorStop(0, '#06b6d4'); // Cyan
    grad.addColorStop(0.5, '#a855f7'); // Purple
    grad.addColorStop(1, '#ec4899'); // Pink
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Downward Mirror Reflection
    const reflectGrad = ctx.createLinearGradient(x, centerY, x, centerY + barHeight * 0.35);
    reflectGrad.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
    reflectGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x, centerY, barWidth, barHeight * 0.35);

    // Peak Cap
    const peakY = centerY - (spectrumPeaks[i] || 0) - 3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, peakY, barWidth, 2);
  }
}

/* ==================================================================== */
/* Backward Compatibility Aliases for Existing Automated Tests          */
/* ==================================================================== */
export const renderOrbitalSoundwave = renderNeonPulseHalo;
export const renderLiquidOscilloscope = renderAmbientAurora;
