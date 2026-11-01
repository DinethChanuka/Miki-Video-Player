import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCleanFileName,
  formatPathForOS,
  getOSPresetDirectories,
  detectOperatingSystem,
} from '../src/utils/pathUtils.ts';

describe('Cross-Platform Path Utilities (pathUtils)', () => {
  describe('extractCleanFileName', () => {
    it('extracts filename from macOS/Linux file URI', () => {
      const uri = 'file:///Users/tester/Movies/Blockbuster.2026.1080p.mp4';
      assert.equal(extractCleanFileName(uri), 'Blockbuster.2026.1080p.mp4');
    });

    it('extracts filename from Windows file path with backslashes', () => {
      const path = 'C:\\Media\\Movies\\SciFi_Epic.mkv';
      assert.equal(extractCleanFileName(path), 'SciFi_Epic.mkv');
    });

    it('extracts filename from remote HTTP stream URL removing query params and hash', () => {
      const url = 'https://stream.example.org/live/playlist.m3u8?auth_token=abc123xyz#t=10';
      assert.equal(extractCleanFileName(url), 'playlist.m3u8');
    });

    it('handles encoded URI strings gracefully', () => {
      const uri = 'file:///home/user/My%20Favorite%20Movie%20(2025).mp4';
      assert.equal(extractCleanFileName(uri), 'My Favorite Movie (2025).mp4');
    });

    it('returns default fallback for empty or missing input', () => {
      assert.equal(extractCleanFileName(''), 'Untitled Media');
      assert.equal(extractCleanFileName(null), 'Untitled Media');
      assert.equal(extractCleanFileName(undefined), 'Untitled Media');
    });
  });

  describe('formatPathForOS', () => {
    it('formats paths for Windows with backslashes and expands home folder', () => {
      const input = '~/Movies/Captures';
      const result = formatPathForOS(input, 'windows');
      assert.equal(result, 'C:\\Users\\%USERNAME%\\Movies\\Captures');
    });

    it('formats paths for macOS / Linux with forward slashes and home tilde', () => {
      const input = 'C:\\Users\\%USERNAME%\\Pictures\\Miki Player';
      const result = formatPathForOS(input, 'macos');
      assert.equal(result, '~/Pictures/Miki Player');
    });

    it('handles empty path inputs gracefully', () => {
      assert.equal(formatPathForOS('', 'windows'), '');
      assert.equal(formatPathForOS('', 'linux'), '');
    });
  });

  describe('getOSPresetDirectories', () => {
    it('returns valid directory presets for Windows', () => {
      const presets = getOSPresetDirectories('windows');
      assert.ok(Array.isArray(presets));
      assert.ok(presets.length >= 4);
      assert.ok(presets.some((p) => p.label.includes('Pictures')));
      assert.ok(presets.every((p) => typeof p.path === 'string' && typeof p.description === 'string'));
    });

    it('returns valid directory presets for macOS', () => {
      const presets = getOSPresetDirectories('macos');
      assert.ok(Array.isArray(presets));
      assert.ok(presets.length >= 4);
      assert.ok(presets.some((p) => p.label.includes('Pictures')));
      assert.ok(presets.every((p) => p.path.startsWith('~/')));
    });

    it('returns valid directory presets for Linux', () => {
      const presets = getOSPresetDirectories('linux');
      assert.ok(Array.isArray(presets));
      assert.ok(presets.length >= 4);
      assert.ok(presets.some((p) => p.label.includes('Videos')));
    });
  });

  describe('detectOperatingSystem', () => {
    it('falls back to windows when window is undefined in server environment', () => {
      assert.equal(detectOperatingSystem(), 'windows');
    });
  });
});

