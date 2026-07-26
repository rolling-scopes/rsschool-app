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
