import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Repository Security & Integrity Audit', () => {
  it('ensures no secret/credential files exist in the repository root', () => {
    const prohibitedFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'id_rsa',
      'id_ed25519',
      'private.key',
      'server.key',
      'keystore.jks',
      'release.keystore',
    ];

    for (const file of prohibitedFiles) {
      assert.equal(
        existsSync(join(process.cwd(), file)),
        false,
        `Prohibited credential/secret file should NOT exist: ${file}`
      );
    }
  });

  it('verifies package.json does not leak insecure plain-text secrets', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
    const serialized = JSON.stringify(pkg);
    assert.equal(/api[_-]?key["'\s:]+[A-Za-z0-9_-]{20,}/i.test(serialized), false);
    assert.equal(/secret["'\s:]+[A-Za-z0-9_-]{20,}/i.test(serialized), false);
  });

  it('verifies all dependencies use standard semantic versioning', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(deps)) {
      assert.ok(
        !version.startsWith('git:') && !version.startsWith('http:'),
        `Dependency ${name} should use npm registry version, not unverified URL`
      );
    }
  });
});
