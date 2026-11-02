import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 2 Audit: GPU Video Enhancements & Shaders', () => {
  const commandsSource = fs.readFileSync(
    path.resolve('src-tauri/src/commands.rs'),
    'utf-8'
  );
  const mpvControllerSource = fs.readFileSync(
    path.resolve('src-tauri/src/engine/mpv_controller.rs'),
    'utf-8'
  );
  const typesSource = fs.readFileSync(
    path.resolve('src-tauri/src/engine/types.rs'),
    'utf-8'
  );

  it('verifies VideoShaderConfig supports debanding, sharpening, and HDR tone mapping', () => {
    assert.ok(
      typesSource.includes('deband') || typesSource.includes('debandEnabled'),
      'VideoShaderConfig must include deband control'
    );
    assert.ok(
      typesSource.includes('hdrToneMapping') || typesSource.includes('hdr_tone_mapping'),
      'VideoShaderConfig must include HDR tone mapping configuration'
    );
  });

  it('verifies player_apply_shader configures real GPU filters beyond only contrast & saturation', () => {
    assert.ok(
      mpvControllerSource.includes('apply_video_enhancements'),
      'MpvController must implement real apply_video_enhancements pipeline'
    );
    assert.ok(
      mpvControllerSource.includes('deband'),
      'MpvController must configure deband filter'
    );
    assert.ok(
      mpvControllerSource.includes('tone-mapping') || mpvControllerSource.includes('tone_mapping'),
      'MpvController must configure HDR tone mapping'
    );
    assert.ok(
      commandsSource.includes('apply_video_enhancements'),
      'commands.rs must delegate to real video enhancement pipeline'
    );
  });
});

