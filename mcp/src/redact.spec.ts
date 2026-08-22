import { describe, expect, it } from 'vitest';
import { isContactKey, isSecretKey, redactKeys, redactSecrets } from './redact.js';

describe('redactSecrets', () => {
  it('drops secret-like keys at any depth, case-insensitively', () => {
    const input = {
      id: 1,
      name: 'Octo',
      password: 'hunter2',
      Token: 'abc',
      nested: { accessToken: 'x', keep: true },
      list: [{ refreshToken: 'y', ok: 1 }],
    };
    expect(redactSecrets(input)).toEqual({
      id: 1,
      name: 'Octo',
      nested: { keep: true },
      list: [{ ok: 1 }],
    });
  });

  it('returns primitives and null unchanged', () => {
    expect(redactSecrets(null)).toBeNull();
    expect(redactSecrets(42)).toBe(42);
    expect(redactSecrets('plain')).toBe('plain');
  });
});

describe('redactKeys', () => {
  it('drops keys matching the predicate (e.g. contacts)', () => {
    const input = { githubId: 'm', contactsEmail: 'a@b.c', contactsPhone: '1', name: 'M' };
    expect(redactKeys(input, key => isContactKey(key))).toEqual({ githubId: 'm', name: 'M' });
  });

  it('composes secret and contact predicates', () => {
    const input = { name: 'M', token: 't', contactsSkype: 's' };
    expect(redactKeys(input, key => isSecretKey(key) || isContactKey(key))).toEqual({ name: 'M' });
  });
});

describe('isSecretKey / isContactKey', () => {
  it('classifies keys', () => {
    expect(isSecretKey('passwordHash')).toBe(true);
    expect(isSecretKey('email')).toBe(false);
    expect(isContactKey('contactsWhatsApp')).toBe(true);
    expect(isContactKey('name')).toBe(false);
  });
});
