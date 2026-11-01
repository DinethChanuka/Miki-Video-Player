import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Gmail Account Validation & Storage Schema', () => {
  const isValidGoogleEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    // Validates standard email pattern and checks for gmail.com or googlemail.com or valid domain
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(clean)) return false;
    return true;
  };

  const isStrictGmail = (email) => {
    if (!isValidGoogleEmail(email)) return false;
    const clean = email.trim().toLowerCase();
    return clean.endsWith('@gmail.com') || clean.endsWith('@googlemail.com');
  };

  const createStoredAccount = (email, displayName) => {
    if (!isValidGoogleEmail(email)) {
      throw new Error('Invalid email address format');
    }
    const clean = email.trim().toLowerCase();
    return {
      email: clean,
      displayName: displayName?.trim() || clean.split('@')[0],
      connectedAt: Date.now(),
      provider: 'google',
      isVerified: true,
    };
  };

  it('validates standard gmail addresses correctly', () => {
    assert.equal(isValidGoogleEmail('myuser@gmail.com'), true);
    assert.equal(isStrictGmail('myuser@gmail.com'), true);
    assert.equal(isStrictGmail('alex.smith+work@googlemail.com'), true);
  });

  it('accepts Google Workspace / custom domain emails', () => {
    assert.equal(isValidGoogleEmail('user@company.com'), true);
    assert.equal(isStrictGmail('user@company.com'), false);
  });

  it('rejects malformed email strings', () => {
    assert.equal(isValidGoogleEmail(''), false);
    assert.equal(isValidGoogleEmail('plainaddress'), false);
    assert.equal(isValidGoogleEmail('@missingusername.com'), false);
    assert.equal(isValidGoogleEmail('missingdomain@'), false);
  });

  it('creates valid stored account payload with fallback display name', () => {
    const acc = createStoredAccount('developer@gmail.com');
    assert.equal(acc.email, 'developer@gmail.com');
    assert.equal(acc.displayName, 'developer');
    assert.equal(acc.provider, 'google');
    assert.equal(acc.isVerified, true);
    assert.ok(acc.connectedAt > 0);
  });

  it('preserves user custom display name if provided', () => {
    const acc = createStoredAccount('dev@gmail.com', 'Alex Dev');
    assert.equal(acc.displayName, 'Alex Dev');
  });
});
