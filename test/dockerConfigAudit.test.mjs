import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Docker Containerization Configuration Audit', () => {
  it('verifies Dockerfile exists and implements multi-stage build', () => {
    const dockerfilePath = path.join(rootDir, 'Dockerfile');
    assert.ok(fs.existsSync(dockerfilePath), 'Dockerfile must exist in root directory');
    const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');

    assert.match(dockerfile, /FROM\s+node:22-alpine\s+AS\s+builder/i, 'Dockerfile must use node:22-alpine as builder stage');
    assert.match(dockerfile, /FROM\s+nginx:.*alpine\s+AS\s+runner/i, 'Dockerfile must use nginx alpine as runtime stage');
    assert.match(dockerfile, /npm\s+run\s+build/, 'Dockerfile must execute production build');
    assert.match(dockerfile, /COPY\s+--from=builder\s+\/app\/dist\s+\/usr\/share\/nginx\/html/, 'Dockerfile must copy dist into nginx html');
    assert.match(dockerfile, /EXPOSE\s+80/, 'Dockerfile must expose port 80');
    assert.match(dockerfile, /HEALTHCHECK/, 'Dockerfile must define a container healthcheck');
  });

  it('verifies custom nginx.conf exists with SPA fallback and security headers', () => {
    const nginxConfPath = path.join(rootDir, 'nginx.conf');
    assert.ok(fs.existsSync(nginxConfPath), 'nginx.conf must exist in root directory');
    const nginxConf = fs.readFileSync(nginxConfPath, 'utf8');

    assert.match(nginxConf, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html;/, 'nginx.conf must include SPA fallback routing');
    assert.match(nginxConf, /gzip\s+on;/, 'nginx.conf must enable gzip compression');
    assert.match(nginxConf, /add_header\s+X-Content-Type-Options\s+"nosniff"/, 'nginx.conf must include security headers');
  });

  it('verifies docker-compose.yml exists and maps port 3000 to port 80', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml');
    assert.ok(fs.existsSync(composePath), 'docker-compose.yml must exist in root directory');
    const compose = fs.readFileSync(composePath, 'utf8');

    assert.match(compose, /miki-player/, 'docker-compose must name miki-player service');
    assert.match(compose, /3000.*:80|PORT:-3000/, 'docker-compose must map port 3000 to port 80');
    assert.match(compose, /unless-stopped/, 'docker-compose must specify restart policy');
  });

  it('verifies .dockerignore exists and excludes build artifacts and node_modules', () => {
    const ignorePath = path.join(rootDir, '.dockerignore');
    assert.ok(fs.existsSync(ignorePath), '.dockerignore must exist in root directory');
    const ignore = fs.readFileSync(ignorePath, 'utf8');

    assert.match(ignore, /node_modules/, '.dockerignore must exclude node_modules');
    assert.match(ignore, /dist/, '.dockerignore must exclude dist');
    assert.match(ignore, /src-tauri\/target|\.git/, '.dockerignore must exclude targets and git metadata');
  });
});
