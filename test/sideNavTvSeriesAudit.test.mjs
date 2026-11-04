import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Side Nav Bar TV Series Section Menu Audit', () => {
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf-8');

  it('verifies side navigation bar contains a dedicated TV Series menu item', () => {
    // Must contain TV Series button within sidebar navigation
    assert.match(
      dashboardCode,
      /<aside[\s\S]*?(?:TV Series|Tv series)[\s\S]*?<\/aside>/i,
      'Side navigation bar (<aside>) must contain a dedicated TV Series button'
    );
  });

  it('verifies clicking TV Series menu item activates the series section', () => {
    assert.match(
      dashboardCode,
      /setActiveCategory\(['"]Tv series['"]\)/,
      'TV Series button must set activeCategory to Tv series'
    );
  });

  it('verifies extreme left floating pill dock includes TV Series icon button', () => {
    assert.match(
      dashboardCode,
      /title=['"](?:TV Series|TV Shows)[\s\S]*?['"]/i,
      'Floating dock must include TV Series icon button'
    );
  });
});

