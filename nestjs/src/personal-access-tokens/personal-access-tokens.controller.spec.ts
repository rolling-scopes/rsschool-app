import type { PersonalAccessToken } from '@entities/personalAccessToken';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import type { AuthUser, CurrentRequest } from '../auth';
import { PersonalAccessTokensController } from './personal-access-tokens.controller';
import type { PersonalAccessTokensService } from './personal-access-tokens.service';

function makeRecord(overrides: Partial<PersonalAccessToken> = {}): PersonalAccessToken {
  return {
    id: 'token-uuid',
    userId: 7,
    name: 'agent',
    prefix: 'AbCdEfGh',
    tokenHash: 'x'.repeat(64),
    expiresAt: new Date('2026-12-31T00:00:00Z'),
    lastUsedAt: null,
    createdById: 7,
    revokedAt: null,
    revokedById: null,
    createdAt: new Date('2026-07-20T00:00:00Z'),
    updatedAt: new Date('2026-07-20T00:00:00Z'),
    ...overrides,
  } as PersonalAccessToken;
}

function makeRequest(user: Partial<AuthUser>): CurrentRequest {
  return { user } as CurrentRequest;
}

describe('PersonalAccessTokensController issuer tracking', () => {
  let service: PersonalAccessTokensService;
  let controller: PersonalAccessTokensController;

  beforeEach(() => {
    service = {
      create: vi.fn().mockResolvedValue({ record: makeRecord(), token: 'rsapp_pat_AbCdEfGh_secret' }),
      listByUser: vi.fn().mockResolvedValue([]),
      revoke: vi.fn().mockResolvedValue(true),
      revokeByAdmin: vi.fn().mockResolvedValue(true),
    } as unknown as PersonalAccessTokensService;
    controller = new PersonalAccessTokensController(service);
  });

  it('records the owner as issuer for a self-service token', async () => {
    await controller.createMine({ name: 'mine' }, makeRequest({ id: 7 }));
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, createdById: 7 }));
  });

  it('records the acting admin as issuer when creating for another user', async () => {
    await controller.createForUser(42, { name: 'for someone else' }, makeRequest({ id: 1, isAdmin: true }));
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, createdById: 1 }));
  });

  it('passes the expiry through on the admin path', async () => {
    await controller.createForUser(42, { name: 'n', expiresInDays: 30 }, makeRequest({ id: 1, isAdmin: true }));
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ expiresInDays: 30, createdById: 1 }));
  });

  it('exposes the issuer in the listing', async () => {
    const withIssuer = makeRecord({
      createdById: 1,
      createdBy: { githubId: 'admin-user' } as PersonalAccessToken['createdBy'],
    });
    service.listByUser = vi.fn().mockResolvedValue([withIssuer]);
    const [dto] = await controller.listForUser(7);
    expect(dto).toMatchObject({ createdById: 1, createdByGithubId: 'admin-user' });
  });

  it('reports the issuer id even when the relation was not joined', async () => {
    // The create response doesn't load `createdBy`, so only the id is known.
    service.listByUser = vi.fn().mockResolvedValue([makeRecord({ createdById: 7, createdBy: undefined })]);
    const [dto] = await controller.listMine(makeRequest({ id: 7 }));
    expect(dto).toMatchObject({ createdById: 7, createdByGithubId: null });
  });
});

describe('PersonalAccessTokensController revocation', () => {
  it('records the revoking admin', async () => {
    const revokeByAdmin = vi.fn().mockResolvedValue(true);
    const controller = new PersonalAccessTokensController({
      revokeByAdmin,
    } as unknown as PersonalAccessTokensService);
    await controller.revokeAsAdmin('token-uuid', makeRequest({ id: 1, isAdmin: true }));
    expect(revokeByAdmin).toHaveBeenCalledWith({ tokenId: 'token-uuid', revokedById: 1 });
  });

  it('refuses admin revocation for a non-admin', async () => {
    const controller = new PersonalAccessTokensController({
      revokeByAdmin: vi.fn(),
    } as unknown as PersonalAccessTokensService);
    await expect(controller.revokeAsAdmin('token-uuid', makeRequest({ id: 2, isAdmin: false }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('404s when there is nothing to revoke', async () => {
    const controller = new PersonalAccessTokensController({
      revoke: vi.fn().mockResolvedValue(false),
      revokeByAdmin: vi.fn().mockResolvedValue(false),
    } as unknown as PersonalAccessTokensService);
    await expect(controller.revokeMine('token-uuid', makeRequest({ id: 7 }))).rejects.toThrow(NotFoundException);
    await expect(controller.revokeAsAdmin('token-uuid', makeRequest({ id: 1, isAdmin: true }))).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('PersonalAccessTokensController.listAll', () => {
  function makeController(listAll = vi.fn().mockResolvedValue({ items: [], meta: { total: 0 } })) {
    return {
      listAll,
      controller: new PersonalAccessTokensController({ listAll } as unknown as PersonalAccessTokensService),
    };
  }

  it('applies sane defaults for an unparameterised request', async () => {
    const { controller, listAll } = makeController();
    await controller.listAll();
    expect(listAll).toHaveBeenCalledWith({
      githubId: undefined,
      name: undefined,
      issuedBy: undefined,
      status: undefined,
      orderBy: undefined,
      orderDirection: 'desc',
      page: 1,
      pageSize: 50,
    });
  });

  it('passes filters, sorting and paging through', async () => {
    const { controller, listAll } = makeController();
    await controller.listAll('oct', 'ci', 'admin', 'active', 'githubId', 'asc', '3', '20');
    expect(listAll).toHaveBeenCalledWith(
      expect.objectContaining({
        githubId: 'oct',
        name: 'ci',
        issuedBy: 'admin',
        status: 'active',
        orderBy: 'githubId',
        orderDirection: 'asc',
        page: 3,
        pageSize: 20,
      }),
    );
  });

  it('drops an unknown status or sort field instead of trusting the query string', async () => {
    const { controller, listAll } = makeController();
    await controller.listAll(undefined, undefined, undefined, 'bogus', 'name; DROP TABLE users');
    expect(listAll).toHaveBeenCalledWith(expect.objectContaining({ status: undefined, orderBy: undefined }));
  });

  it('clamps paging to protect the backend', async () => {
    const { controller, listAll } = makeController();
    await controller.listAll(undefined, undefined, undefined, undefined, undefined, undefined, '0', '5000');
    expect(listAll).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 200 }));
  });

  it('returns items and pagination meta', async () => {
    const meta = { itemCount: 1, total: 1, pageSize: 50, totalPages: 1, current: 1 };
    const listAll = vi.fn().mockResolvedValue({ items: [makeRecord()], meta });
    const { controller } = makeController(listAll);
    const result = await controller.listAll();
    expect(result.meta).toEqual(meta);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ id: 'token-uuid', userId: 7 });
  });

  it('exposes the owner login from the joined relation', async () => {
    const record = makeRecord({ user: { githubId: 'owner-user' } as PersonalAccessToken['user'] });
    const listAll = vi.fn().mockResolvedValue({ items: [record], meta: { total: 1 } });
    const { controller } = makeController(listAll);
    const result = await controller.listAll();
    expect(result.items[0]).toMatchObject({ userGithubId: 'owner-user' });
  });
});
