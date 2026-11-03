import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Native macOS Bundle Loading & Scheme Handler Audit', () => {
  const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
  const swiftAppPath = path.resolve(process.cwd(), 'MikiPlayerApp.swift');

  const viteConfigCode = fs.readFileSync(viteConfigPath, 'utf-8');
  const swiftAppCode = fs.readFileSync(swiftAppPath, 'utf-8');

  it('verifies vite.config.ts configures relative base to prevent hard-coded root-slash assets', () => {
    assert.match(
      viteConfigCode,
      /base:\s*['"]\.\/['"]/,
      'vite.config.ts must configure base: "./" for reliable relative bundle loading'
    );
  });

  it('verifies MikiPlayerApp.swift registers AppAssetSchemeHandler for "app" scheme', () => {
    assert.match(
      swiftAppCode,
      /class AppAssetSchemeHandler:\s*NSObject,\s*WKURLSchemeHandler/,
      'MikiPlayerApp.swift must implement AppAssetSchemeHandler'
    );
    assert.match(
      swiftAppCode,
      /setURLSchemeHandler\(AppAssetSchemeHandler\(\),\s*forURLScheme:\s*"app"\)/,
      'Must register "app" custom scheme handler in WKWebViewConfiguration'
    );
  });

  it('verifies MikiPlayerApp.swift loads app://localhost/index.html to ensure CORS-free ES module loading', () => {
    assert.match(
      swiftAppCode,
      /app:\/\/localhost\/index\.html/,
      'Must load app://localhost/index.html instead of raw file:// URLs'
    );
  });

  it('verifies main webView has navigationDelegate attached for error observability', () => {
    assert.match(
      swiftAppCode,
      /webView\.navigationDelegate\s*=\s*self/,
      'Main webView must attach navigationDelegate to report load failures'
    );
  });

  it('verifies packaged macOS bundle contains dist/index.html with relative asset references', () => {
    const packagedIndexPath = path.resolve(
      process.cwd(),
      'Build/MacOs/Miki Player.app/Contents/Resources/dist/index.html'
    );
    assert.ok(fs.existsSync(packagedIndexPath), 'Packaged dist/index.html must exist');
    const htmlContent = fs.readFileSync(packagedIndexPath, 'utf-8');
    assert.match(
      htmlContent,
      /\.\/assets\//,
      'Packaged index.html must use relative asset paths'
    );

    const zipPath = path.resolve(process.cwd(), 'Build/MacOs/Miki-Player-macOS.zip');
    assert.ok(fs.existsSync(zipPath), 'Build/MacOs/Miki-Player-macOS.zip must exist');
    assert.ok(fs.statSync(zipPath).size > 1000000, 'Zip file must be larger than 1MB');
  });
});
