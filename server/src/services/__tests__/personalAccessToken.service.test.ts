import { PAT_TOKEN_PREFIX, parseToken, sha256Hex } from '../personalAccessToken.service';

describe('parseToken', () => {
  test('parses valid token', () => {
    const result = parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGh_secretpart12345`);
    expect(result).toEqual({ prefix: 'AbCdEfGh', secret: 'secretpart12345' });
  });

  test('rejects missing prefix', () => {
    expect(parseToken('AbCdEfGh_secret')).toBeNull();
  });

  test('rejects wrong prefix length', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCd_secret`)).toBeNull();
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGhX_secret`)).toBeNull();
  });

  test('rejects missing separator', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGhsecret`)).toBeNull();
  });

  test('rejects empty secret', () => {
    expect(parseToken(`${PAT_TOKEN_PREFIX}AbCdEfGh_`)).toBeNull();
  });
});

describe('sha256Hex', () => {
  test('returns hex-encoded sha256', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  test('is deterministic', () => {
    expect(sha256Hex('hello')).toBe(sha256Hex('hello'));
  });

  test('differs for different inputs', () => {
    expect(sha256Hex('a')).not.toBe(sha256Hex('b'));
  });
});
