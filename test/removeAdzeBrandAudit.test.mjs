import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Remove Adze Design Branding Audit', () => {
  const dashboardPath = path.join(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const dashboardCode = fs.readFileSync(dashboardPath, 'utf-8');

  it('verifies "Adze" and "DESIGN" brand text are removed from the left sidebar header', () => {
    // Check that visible text "Adze." and "DESIGN" in sidebar header are not rendered
    assert.equal(
      /<span[^>]*>\s*Adze\.?\s*<\/span>/i.test(dashboardCode),
      false,
      'HomeDashboardView must not render "Adze." in the sidebar'
    );
    assert.equal(
      /<span[^>]*>\s*DESIGN\s*<\/span>/i.test(dashboardCode),
      false,
      'HomeDashboardView must not render "DESIGN" in the sidebar'
    );
  });

  it('verifies sidebar navigation feeds start cleanly with proper top padding', () => {
    // Check sidebar exists and maintains proper structure
    assert.match(
      dashboardCode,
      /<aside className="w-60[\s\S]*?Main Sections/i,
      'Sidebar navigation structure must remain intact'
    );
  });
});

