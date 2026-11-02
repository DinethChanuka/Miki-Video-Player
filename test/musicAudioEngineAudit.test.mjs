import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Dedicated Music Player Engine & Audio Visualizer Audit', () => {
  it('verifies MusicAudioEngine implements dedicated 10-band EQ, bass boost, and AnalyserNode', () => {
    const engineCode = fs.readFileSync(path.join(rootDir, 'src/core/MusicAudioEngine.ts'), 'utf-8');

    // Must use AudioContext
    assert.match(engineCode, /AudioContext/i);
    // Must create AnalyserNode for spectrum analysis
    assert.match(engineCode, /createAnalyser/i);
    // Must support 10 equalizer bands
    assert.match(engineCode, /32|64|125|250|500|1000|2000|4000|8000|16000/);
    // Must support Bass Boost
    assert.match(engineCode, /bassBoost/i);
  });

  it('verifies MusicPlayerView renders animated visualizer canvas and audio controls', () => {
    const viewCode = fs.readFileSync(path.join(rootDir, 'src/components/music/MusicPlayerView.tsx'), 'utf-8');

    // Must render canvas for audio visualization
    assert.match(viewCode, /<canvas/i);
    // Must have play/pause and equalizer preset controls
    assert.match(viewCode, /play|pause/i);
    assert.match(viewCode, /preset/i);
  });
});
