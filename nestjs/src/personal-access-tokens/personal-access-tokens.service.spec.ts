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
      expect.objectContaining({ where: { userId: 5 }, relations: { createdBy: true, user: true } }),
    );
  });
});

describe('PersonalAccessTokensService.listAll', () => {
  function makeQb() {
    const qb = {
      leftJoinAndSelect: vi.fn(() => qb),
      andWhere: vi.fn(() => qb),
      orderBy: vi.fn(() => qb),
      take: vi.fn(() => qb),
      skip: vi.fn(() => qb),
      getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
    };
    return qb;
  }

  function makeService() {
    const qb = makeQb();
    const repo = { createQueryBuilder: vi.fn(() => qb) } as unknown as Repository<PersonalAccessToken>;
    return { service: new PersonalAccessTokensService(repo), qb };
  }

  const wheres = (qb: ReturnType<typeof makeQb>) => qb.andWhere.mock.calls.map(call => String(call[0]));

  it('joins owner and issuer so both logins can be shown', async () => {
    const { service, qb } = makeService();
    await service.listAll({ page: 1, pageSize: 50 });
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('token.user', 'user');
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('token.createdBy', 'createdBy');
  });

  it('defaults to newest first with no filters', async () => {
    const { service, qb } = makeService();
    await service.listAll({ page: 1, pageSize: 50 });
    expect(qb.orderBy).toHaveBeenCalledWith('token.createdAt', 'DESC');
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('filters by owner, name and issuer with partial matches', async () => {
    const { service, qb } = makeService();
    await service.listAll({ githubId: 'oct', name: 'ci', issuedBy: 'adm', page: 1, pageSize: 50 });
    expect(wheres(qb)).toEqual([
      'user.githubId ILIKE :githubId',
      'token.name ILIKE :name',
      'createdBy.githubId ILIKE :issuedBy',
    ]);
    expect(qb.andWhere).toHaveBeenCalledWith('user.githubId ILIKE :githubId', { githubId: '%oct%' });
  });

  it('treats active as neither revoked nor expired', async () => {
    const { service, qb } = makeService();
    await service.listAll({ status: 'active', page: 1, pageSize: 50 });
    expect(wheres(qb)).toEqual(['token.revokedAt IS NULL', 'token.expiresAt > NOW()']);
  });

  it('treats expired as past-expiry but not revoked', async () => {
    const { service, qb } = makeService();
    await service.listAll({ status: 'expired', page: 1, pageSize: 50 });
    expect(wheres(qb)).toEqual(['token.revokedAt IS NULL', 'token.expiresAt <= NOW()']);
  });

  it('filters revoked tokens regardless of expiry', async () => {
    const { service, qb } = makeService();
    await service.listAll({ status: 'revoked', page: 1, pageSize: 50 });
    expect(wheres(qb)).toEqual(['token.revokedAt IS NOT NULL']);
  });

  it('maps the sort field through the whitelist', async () => {
    const { service, qb } = makeService();
    await service.listAll({ orderBy: 'githubId', orderDirection: 'asc', page: 1, pageSize: 50 });
    expect(qb.orderBy).toHaveBeenCalledWith('user.githubId', 'ASC');
  });

  it('never passes an unknown sort field to SQL', async () => {
    const { service, qb } = makeService();
    await service.listAll({ orderBy: 'name; DROP TABLE users' as never, page: 1, pageSize: 50 });
    expect(qb.orderBy).toHaveBeenCalledWith('token.createdAt', 'DESC');
  });

  it('paginates with the requested page and size', async () => {
    const { service, qb } = makeService();
    await service.listAll({ page: 3, pageSize: 20 });
    expect(qb.take).toHaveBeenCalledWith(20);
    expect(qb.skip).toHaveBeenCalledWith(40);
  });
});
