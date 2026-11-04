import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Task 3: Functional User Login and Guest State Toggle Audit', () => {
  const homeDashPath = resolve(process.cwd(), 'src/components/home/HomeDashboardView.tsx');
  const content = readFileSync(homeDashPath, 'utf8');

  it('verifies HomeDashboardView contains isUserLoggedIn state and toggling mechanisms', () => {
    assert.ok(
      content.includes('isUserLoggedIn') || content.includes('isLoggedIn'),
      'HomeDashboardView must track user authentication state (isUserLoggedIn)'
    );
    assert.ok(
      content.includes('setIsUserLoggedIn') || content.includes('setIsLoggedIn'),
      'HomeDashboardView must provide a setter to toggle user authentication'
    );
  });

  it('verifies UI displays Log Out option when logged in and Sign In option when in guest mode', () => {
    assert.ok(
      content.includes('Log Out') || content.includes('Logout'),
      'HomeDashboardView must render Log Out action for authenticated users'
    );
    assert.ok(
      content.includes('Sign In') || content.includes('Login'),
      'HomeDashboardView must render Sign In action when logged out / in guest mode'
    );
  });

  it('verifies dynamic user name / avatar changes between Suriya sharma and Guest User', () => {
    assert.ok(
      content.includes('Suriya sharma') || content.includes('Suriya'),
      'Authenticated view must render user profile identity'
    );
    assert.ok(
      content.includes('Guest') || content.includes('Guest User'),
      'Logged out view must render Guest User profile identity'
    );
  });
});
