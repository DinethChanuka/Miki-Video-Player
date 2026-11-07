import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 6 Audit: UI Volume & Preamp Synchronization', () => {
  const fullPlayerPath = path.resolve(process.cwd(), 'src/components/music/FullWindowMusicPlayer.tsx');
  const eqModalPath = path.resolve(process.cwd(), 'src/components/hud/EqualizerModal.tsx');
  const hubPath = path.resolve(process.cwd(), 'src/components/hud/PersistentMusicControlHub.tsx');

  const fullPlayerCode = fs.readFileSync(fullPlayerPath, 'utf8');
  const eqModalCode = fs.readFileSync(eqModalPath, 'utf8');
  const hubCode = fs.readFileSync(hubPath, 'utf8');

  it('verifies standard 0-100% master volume slider range across player components', () => {
    // FullWindowMusicPlayer volume slider min=0, max=100
    assert.match(
      fullPlayerCode,
      /min="0"[\s\S]*?max="100"/,
      'FullWindowMusicPlayer volume slider must have standard 0-100% range'
    );

    // PersistentMusicControlHub volume slider min={0}, max={100}
    assert.match(
      hubCode,
      /min=\{0\}[\s\S]*?max=\{100\}/,
      'PersistentMusicControlHub volume slider must have standard 0-100% range'
    );
  });

  it('verifies dedicated Preamp Gain boost control in EqualizerModal', () => {
    assert.match(
      eqModalCode,
      /preampGain/i,
      'EqualizerModal must provide dedicated Preamp Gain control'
    );
    assert.match(
      eqModalCode,
      /setPreampGain/i,
      'EqualizerModal must allow adjusting Preamp Gain'
    );
  });
});
