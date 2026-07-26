import type { PersonalAccessToken } from '@entities/personalAccessToken';
import type { Repository } from 'typeorm';
import { vi } from 'vitest';
import { PAT_TOKEN_PREFIX, PersonalAccessTokensService, parseToken, sha256Hex } from './personal-access-tokens.service';

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

describe('PersonalAccessTokensService.create', () => {
  function makeService() {
    const saved: Partial<PersonalAccessToken>[] = [];
    const repo = {
      create: (entity: Partial<PersonalAccessToken>) => entity,
      save: async (entity: Partial<PersonalAccessToken>) => {
        saved.push(entity);
        return { ...entity, id: 'token-uuid', createdAt: new Date() } as PersonalAccessToken;
      },
      find: vi.fn(),
    } as unknown as Repository<PersonalAccessToken>;
    return { service: new PersonalAccessTokensService(repo), saved, repo };
  }

  it('stores the issuer for a self-service token', async () => {
    const { service, saved } = makeService();
    await service.create({ userId: 7, name: 'mine', createdById: 7 });
    expect(saved[0]).toMatchObject({ userId: 7, createdById: 7 });
  });

  it('stores the admin as issuer when the owner is someone else', async () => {
    const { service, saved } = makeService();
    await service.create({ userId: 42, name: 'for a service account', createdById: 1 });
    expect(saved[0]).toMatchObject({ userId: 42, createdById: 1 });
  });

  it('returns a token matching the stored prefix and hash', async () => {
    const { service, saved } = makeService();
    const { token } = await service.create({ userId: 1, name: 'x', createdById: 1 });
    const parsed = parseToken(token);
    expect(parsed?.prefix).toBe(saved[0]?.prefix);
    expect(sha256Hex(parsed!.secret)).toBe(saved[0]?.tokenHash);
  });
});

describe('PersonalAccessTokensService.listByUser', () => {
  it('joins the issuer so the UI can show who handed out the token', async () => {
    const find = vi.fn().mockResolvedValue([]);
    const service = new PersonalAccessTokensService({ find } as unknown as Repository<PersonalAccessToken>);
    await service.listByUser(5);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 5 }, relations: { createdBy: true } }),
    );
  });
});
