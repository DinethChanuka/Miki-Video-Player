import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('GitHub Actions Workflow Artifact Creation Audit', () => {
  const workflowPath = path.join(rootDir, '.github/workflows/build-crossplatform.yml');
  const workflowYaml = fs.readFileSync(workflowPath, 'utf8');

  it('contains actions/upload-artifact@v4 across all platform jobs', () => {
    const uploadMatches = workflowYaml.match(/uses:\s*actions\/upload-artifact@v4/g);
    assert.ok(uploadMatches, 'Workflow must use actions/upload-artifact@v4');
    assert.ok(uploadMatches.length >= 5, `Expected at least 5 artifact upload steps, found ${uploadMatches?.length}`);
  });

  it('ensures macOS artifact packaging specifies valid bundle zip and app path', () => {
    assert.match(
      workflowYaml,
      /name:\s*Miki-Player-macOS-Desktop/,
      'macOS artifact job must define Miki-Player-macOS-Desktop artifact'
    );
    assert.match(
      workflowYaml,
      /Build\/MacOs\/Miki-Player-macOS\.zip/,
      'macOS artifact must include Build/MacOs/Miki-Player-macOS.zip'
    );
  });

  it('ensures Windows, Linux, Android, and iOS artifacts target robust directory paths', () => {
    assert.match(workflowYaml, /name:\s*Miki-Player-Windows-x64/);
    assert.match(workflowYaml, /path:\s*Build\/windows\//);

    assert.match(workflowYaml, /name:\s*Miki-Player-Linux-x86_64/);
    assert.match(workflowYaml, /path:\s*Build\/Linux\//);

    assert.match(workflowYaml, /name:\s*Miki-Player-Android-APK/);
    assert.match(workflowYaml, /path:\s*Build\/Android\//);

    assert.match(workflowYaml, /name:\s*Miki-Player-iOS-Bundle/);
    assert.match(workflowYaml, /path:\s*Build\/ios\//);
  });

  it('uploads web production bundle artifact in CI quality gate', () => {
    assert.match(
      workflowYaml,
      /name:\s*Miki-Player-Web-Production/,
      'Workflow must upload Miki-Player-Web-Production artifact'
    );
    assert.match(
      workflowYaml,
      /path:\s*dist\/?/,
      'Web production artifact must upload dist/'
    );
  });

  it('verifies package-ios.sh uses correct find grouping parentheses', () => {
    const iosScript = fs.readFileSync(path.join(rootDir, 'scripts/package-ios.sh'), 'utf8');
    assert.match(
      iosScript,
      /\\\(\s*-name\s*"\*\.ipa"\s*-o\s*-name\s*"\*\.app"\s*\\\)/,
      'package-ios.sh must group find predicates with \\( ... \\)'
    );
  });
});
