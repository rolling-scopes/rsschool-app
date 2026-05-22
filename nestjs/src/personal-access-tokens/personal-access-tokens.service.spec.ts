import { PAT_TOKEN_PREFIX, parseToken, sha256Hex } from './personal-access-tokens.service';

describe('parseToken', () => {
  it('parses a well-formed token', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGh_secretpart12345`)).toEqual({
      prefix: 'AbCdEfGh',
      secret: 'secretpart12345',
    });
  });

  it('rejects token without library prefix', () => {
    expect(parseToken('AbCdEfGh_secret')).toBeNull();
  });

  it('rejects token with wrong prefix length', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCd_secret`)).toBeNull();
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGhX_secret`)).toBeNull();
  });

  it('rejects token without separator', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGhsecret`)).toBeNull();
  });

  it('rejects token with empty secret', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGh_`)).toBeNull();
  });
});

describe('sha256Hex', () => {
  it('returns the canonical sha256 of abc', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('is deterministic for the same input', () => {
    expect(sha256Hex('hello')).toBe(sha256Hex('hello'));
  });

  it('differs for different inputs', () => {
    expect(sha256Hex('a')).not.toBe(sha256Hex('b'));
  });
});
