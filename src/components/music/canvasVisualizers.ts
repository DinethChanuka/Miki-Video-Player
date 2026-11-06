/**
 * Tri-Mode Premium Hi-Fi Canvas Visualizers
 * 
 * High-performance, Retina-crisp audio visualizers featuring:
 * 1. Cyber Spectrum: Symmetrical glowing frequency bars with reflection & peak caps
 * 2. Orbital Soundwave: Circular pulsing pulsar sound ring with rotating star-dust particles
 * 3. Liquid Oscilloscope: Multi-layer flowing holographic Bezier ribbons
 */

export type VisualizerMode = 'spectrum' | 'orbital' | 'ribbon';

// Persistent falling peak heights for Cyber Spectrum
const peakHeights: number[] = [];

// Persistent orbital particles
interface OrbitalParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
}
let orbitalParticles: OrbitalParticle[] = [];

function initParticles(count = 45): void {
  if (orbitalParticles.length > 0) return;
  for (let i = 0; i < count; i++) {
    orbitalParticles.push({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 90,
      speed: (0.005 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.7,
    });
  }
}

/**
 * 1. Cyber Spectrum Bars with Neon Glow, Mirror Floor & Floating Peak Caps
 */
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
  const barWidth = (width / barCount) * 0.75;
  const gap = (width / barCount) * 0.25;
  const centerY = height * 0.65;

  for (let i = 0; i < barCount; i++) {
    let intensity = 0.2;

    if (isPlaying) {
      if (syncAudio && data && data.length > 0) {
        const dataIdx = Math.floor((i / barCount) * (data.length * 0.75));
        intensity = (data[dataIdx] || 0) / 255;
      } else {
        const wave1 = Math.sin(phase * 1.2 + i * 0.18) * 0.5 + 0.5;
        const wave2 = Math.cos(phase * 0.8 + i * 0.32) * 0.35 + 0.35;
        intensity = Math.min(1.0, wave1 * 0.65 + wave2 * 0.45);
      }
    }

    const bellCurve = Math.sin((i / barCount) * Math.PI);
    const maxBarHeight = height * 0.55;
    const barHeight = Math.max(6, intensity * bellCurve * maxBarHeight);

    // Track falling peak caps
    peakHeights[i] = Math.max(barHeight, (peakHeights[i] || 0) - 1.2);

    const x = i * (barWidth + gap) + gap / 2;
    const y = centerY - barHeight;

    // Upward Bar
    const grad = ctx.createLinearGradient(x, y, x, centerY);
    grad.addColorStop(0, '#06b6d4'); // Cyan
    grad.addColorStop(0.4, '#a855f7'); // Purple
    grad.addColorStop(1, '#ec4899'); // Pink
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Downward Mirror Reflection with fade
    const reflectGrad = ctx.createLinearGradient(x, centerY, x, centerY + barHeight * 0.4);
    reflectGrad.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
    reflectGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x, centerY, barWidth, barHeight * 0.4);

    // Floating Peak Cap
    const peakY = centerY - (peakHeights[i] || 0) - 3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, peakY, barWidth, 2);
  }
}

/**
 * 2. Orbital Soundwave (Futuristic Pulsar Ring with Orbiting Star-Dust)
 */
export function renderOrbitalSoundwave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);
  initParticles();

  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) * 0.22;

  // Calculate overall energy
  let energy = 0.3;
  if (isPlaying) {
    if (syncAudio && data && data.length > 0) {
      let sum = 0;
      for (let i = 0; i < 16; i++) sum += data[i] || 0;
      energy = (sum / 16 / 255) * 1.5;
    } else {
      energy = Math.sin(phase * 2) * 0.2 + 0.5;
    }
  }

  // Central Core Aura
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseRadius * 1.2);
  coreGrad.addColorStop(0, `rgba(6, 182, 212, ${0.45 * energy})`);
  coreGrad.addColorStop(0.6, `rgba(168, 85, 247, ${0.2 * energy})`);
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Radial Spikes (Circular EQ)
  const spikeCount = 64;
  const angleStep = (Math.PI * 2) / spikeCount;

  for (let i = 0; i < spikeCount; i++) {
    const angle = i * angleStep + phase * 0.1;
    let spikeLen = 8;

    if (isPlaying) {
      if (syncAudio && data && data.length > 0) {
        const dIdx = Math.floor((i / spikeCount) * (data.length * 0.8));
        spikeLen = 8 + ((data[dIdx] || 0) / 255) * (baseRadius * 0.9);
      } else {
        const sWave = Math.sin(phase * 1.8 + i * 0.3) * 0.5 + 0.5;
        spikeLen = 8 + sWave * (baseRadius * 0.7);
      }
    }

    const r1 = baseRadius;
    const r2 = baseRadius + spikeLen;

    const x1 = centerX + Math.cos(angle) * r1;
    const y1 = centerY + Math.sin(angle) * r1;
    const x2 = centerX + Math.cos(angle) * r2;
    const y2 = centerY + Math.sin(angle) * r2;

    const spikeGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    spikeGrad.addColorStop(0, '#06b6d4');
    spikeGrad.addColorStop(1, '#ec4899');

    ctx.strokeStyle = spikeGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Orbiting Star-Dust Particles
  for (const p of orbitalParticles) {
    if (isPlaying) {
      p.angle += p.speed * (1 + energy * 0.8);
    }
    const currentR = p.radius + energy * 18;
    const px = centerX + Math.cos(p.angle) * currentR;
    const py = centerY + Math.sin(p.angle) * currentR;

    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (0.4 + energy * 0.6)})`;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner Ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * 3. Liquid Oscilloscope Ribbon (Multi-Layer Holographic Sine Waves)
 */
export function renderLiquidOscilloscope(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8Array | null,
  phase: number,
  isPlaying: boolean,
  syncAudio = true
): void {
  ctx.clearRect(0, 0, width, height);

  const centerY = height * 0.55;
  const layers = [
    { freq: 0.015, speed: 1.5, amp: height * 0.22, color1: 'rgba(6, 182, 212, 0.35)', color2: 'rgba(59, 130, 246, 0.05)', stroke: '#06b6d4' },
    { freq: 0.022, speed: 2.1, amp: height * 0.18, color1: 'rgba(168, 85, 247, 0.35)', color2: 'rgba(139, 92, 246, 0.05)', stroke: '#a855f7' },
    { freq: 0.031, speed: 2.8, amp: height * 0.14, color1: 'rgba(236, 72, 153, 0.35)', color2: 'rgba(244, 63, 94, 0.05)', stroke: '#ec4899' },
  ];

  let audioMod = 1.0;
  if (isPlaying && syncAudio && data && data.length > 0) {
    let sum = 0;
    for (let i = 0; i < 24; i++) sum += data[i] || 0;
    audioMod = 0.5 + (sum / 24 / 255) * 1.3;
  }

  for (const layer of layers) {
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    const step = 8;
    for (let x = 0; x <= width; x += step) {
      const activePhase = isPlaying ? phase * layer.speed : 0;
      const y =
        centerY +
        Math.sin(x * layer.freq + activePhase) *
          layer.amp *
          audioMod *
          Math.sin((x / width) * Math.PI); // Pin edges to zero

      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, centerY - layer.amp, 0, height);
    grad.addColorStop(0, layer.color1);
    grad.addColorStop(1, layer.color2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Top wave stroke line
    ctx.strokeStyle = layer.stroke;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      const activePhase = isPlaying ? phase * layer.speed : 0;
      const y =
        centerY +
        Math.sin(x * layer.freq + activePhase) *
          layer.amp *
          audioMod *
          Math.sin((x / width) * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
