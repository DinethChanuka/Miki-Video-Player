import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Security Sandboxing, Electron & CSP Audit', () => {
  it('verifies FullWindowGamesModal does not grant allow-same-origin to srcDoc games', () => {
    const modalPath = path.join(
      rootDir,
      'src/components/games/FullWindowGamesModal.tsx'
    );
    const code = fs.readFileSync(modalPath, 'utf8');

    // Look at the iframe sandbox definition
    assert.doesNotMatch(
      code,
      /sandbox="[^"]*allow-same-origin[^"]*"\s*[^>]*srcDoc/i,
      'FullWindowGamesModal must NOT grant allow-same-origin to srcDoc content'
    );
  });

  it('verifies electron/main.cjs has webSecurity enabled', () => {
    const electronMain = path.join(rootDir, 'electron/main.cjs');
    const code = fs.readFileSync(electronMain, 'utf8');

    assert.doesNotMatch(
      code,
      /webSecurity:\s*false/i,
      'electron/main.cjs must NOT disable webSecurity'
    );
    assert.match(
      code,
      /webSecurity:\s*true/i,
      'electron/main.cjs must explicitly enable webSecurity'
    );
  });

  it('verifies tauri.conf.json CSP removes unsafe-eval', () => {
    const tauriConfig = path.join(rootDir, 'src-tauri/tauri.conf.json');
    const content = fs.readFileSync(tauriConfig, 'utf8');
    const parsed = JSON.parse(content);
    const csp = parsed?.app?.security?.csp || '';

    assert.doesNotMatch(
      csp,
      /'unsafe-eval'/i,
      'Tauri CSP must not allow unsafe-eval'
    );
  });

  it('verifies nginx.conf includes Content-Security-Policy header', () => {
    const nginxPath = path.join(rootDir, 'nginx.conf');
    const content = fs.readFileSync(nginxPath, 'utf8');

    assert.match(
      content,
      /add_header\s+Content-Security-Policy/i,
      'nginx.conf must include Content-Security-Policy header'
    );
  });

  it('verifies src-tauri/capabilities/default.json exists with window permissions', () => {
    const capPath = path.join(rootDir, 'src-tauri/capabilities/default.json');
    assert.ok(fs.existsSync(capPath), 'src-tauri/capabilities/default.json must exist');

    const capContent = JSON.parse(fs.readFileSync(capPath, 'utf8'));
    assert.ok(capContent.permissions, 'Capability must specify permissions');
    const perms = JSON.stringify(capContent.permissions);
    assert.match(perms, /core:window|core:default/i, 'Must include core window permissions');
  });
});
