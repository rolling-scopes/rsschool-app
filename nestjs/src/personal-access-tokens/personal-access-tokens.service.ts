import { PersonalAccessToken } from '@entities/personalAccessToken';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { paginate } from '../core/paginate';

export const PAT_TOKEN_PREFIX = 'rsapp_pat_';
export const PAT_DEFAULT_EXPIRY_DAYS = 90;
export const PAT_MAX_EXPIRY_DAYS = 365;

const PREFIX_LENGTH = 8;
const SECRET_LENGTH = 32;
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TOUCH_THROTTLE_MS = 60_000;

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function parseToken(token: string): { prefix: string; secret: string } | null {
  if (!token.startsWith(PAT_TOKEN_PREFIX)) return null;
  const rest = token.slice(PAT_TOKEN_PREFIX.length);
  const sep = rest.indexOf('_');
  if (sep !== PREFIX_LENGTH) return null;
  const prefix = rest.slice(0, sep);
  const secret = rest.slice(sep + 1);
  if (!prefix || !secret) return null;
  return { prefix, secret };
}

function base62(bytes: Buffer, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += BASE62.charAt(bytes[i]! % 62);
  }
  return out;
}

function clampExpiryDays(days: number | undefined): number {
  if (!days || days <= 0) return PAT_DEFAULT_EXPIRY_DAYS;
  return Math.min(days, PAT_MAX_EXPIRY_DAYS);
}

export type CreatePatResult = {
  record: PersonalAccessToken;
  token: string;
};

export type PatValidationResult =
  | { ok: true; record: PersonalAccessToken }
  | { ok: false; reason: 'malformed' | 'not_found' | 'revoked' | 'expired' | 'invalid_secret' };

export const PAT_SORTABLE_FIELDS = {
  createdAt: 'token.createdAt',
  expiresAt: 'token.expiresAt',
  lastUsedAt: 'token.lastUsedAt',
  name: 'token.name',
  githubId: 'user.githubId',
} as const;

export type PatSortField = keyof typeof PAT_SORTABLE_FIELDS;
export type PatStatus = 'active' | 'revoked' | 'expired';

export type PatListParams = {
  githubId?: string;
  name?: string;
  issuedBy?: string;
  status?: PatStatus;
  orderBy?: PatSortField;
  orderDirection?: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

/** "Active" means neither revoked nor past its expiry — the two are independent. */
function applyStatusFilter(qb: SelectQueryBuilder<PersonalAccessToken>, status: PatStatus | undefined): void {
  if (status === 'revoked') {
    qb.andWhere('token.revokedAt IS NOT NULL');
    return;
  }
  if (status === 'expired') {
    qb.andWhere('token.revokedAt IS NULL').andWhere('token.expiresAt <= NOW()');
    return;
  }
  if (status === 'active') {
    qb.andWhere('token.revokedAt IS NULL').andWhere('token.expiresAt > NOW()');
  }
}

@Injectable()
export class PersonalAccessTokensService {
  private readonly lastUsedTouchedAt = new Map<string, number>();

  constructor(
    @InjectRepository(PersonalAccessToken)
    private readonly repo: Repository<PersonalAccessToken>,
  ) {}

  public async create(params: {
    userId: number;
    name: string;
    expiresInDays?: number;
    /** Who issued the token — differs from `userId` when an admin issues for someone else. */
    createdById: number;
  }): Promise<CreatePatResult> {
    const prefix = base62(randomBytes(PREFIX_LENGTH), PREFIX_LENGTH);
    const secret = base62(randomBytes(SECRET_LENGTH), SECRET_LENGTH);
    const tokenHash = sha256Hex(secret);
    const expiresAt = new Date(Date.now() + clampExpiryDays(params.expiresInDays) * 24 * 60 * 60 * 1000);

    const record = await this.repo.save(
      this.repo.create({
        userId: params.userId,
        name: params.name,
        prefix,
        tokenHash,
        expiresAt,
        createdById: params.createdById,
      }),
    );

    return { record, token: `${PAT_TOKEN_PREFIX}${prefix}_${secret}` };
  }

  public async validateTokenString(token: string): Promise<PatValidationResult> {
    const parsed = parseToken(token);
    if (!parsed) return { ok: false, reason: 'malformed' };

    const record = await this.repo.findOne({ where: { prefix: parsed.prefix }, relations: { user: true } });
    if (!record) return { ok: false, reason: 'not_found' };
    if (record.revokedAt) return { ok: false, reason: 'revoked' };
    if (record.expiresAt.getTime() <= Date.now()) return { ok: false, reason: 'expired' };

    const expected = Buffer.from(record.tokenHash, 'hex');
    const actual = Buffer.from(sha256Hex(parsed.secret), 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return { ok: false, reason: 'invalid_secret' };
    }

    return { ok: true, record };
  }

  public async touchLastUsed(tokenId: string): Promise<void> {
    const now = Date.now();
    const prev = this.lastUsedTouchedAt.get(tokenId) ?? 0;
    if (now - prev < TOUCH_THROTTLE_MS) return;
    this.lastUsedTouchedAt.set(tokenId, now);
    try {
      await this.repo.update({ id: tokenId }, { lastUsedAt: new Date(now) });
    } catch {
      this.lastUsedTouchedAt.delete(tokenId);
    }
  }

  public listByUser(userId: number): Promise<PersonalAccessToken[]> {
    // `createdBy` is joined so the UI can show who issued each token — the
    // interesting case being a token issued by an admin for someone else.
    return this.repo.find({
      where: { userId },
      relations: { createdBy: true, user: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin listing across every user: paginated, filterable and sortable so the
   * table itself is the search UI (no separate "pick a user first" step).
   */
  public listAll(params: PatListParams) {
    const qb = this.repo
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .leftJoinAndSelect('token.createdBy', 'createdBy');

    if (params.githubId) {
      qb.andWhere('user.githubId ILIKE :githubId', { githubId: `%${params.githubId}%` });
    }
    if (params.name) {
      qb.andWhere('token.name ILIKE :name', { name: `%${params.name}%` });
    }
    if (params.issuedBy) {
      qb.andWhere('createdBy.githubId ILIKE :issuedBy', { issuedBy: `%${params.issuedBy}%` });
    }
    applyStatusFilter(qb, params.status);

    // Whitelisted mapping: the sort field reaches SQL, so it must never be
    // taken from the query string verbatim.
    const orderBy = PAT_SORTABLE_FIELDS[params.orderBy ?? 'createdAt'] ?? PAT_SORTABLE_FIELDS.createdAt;
    qb.orderBy(orderBy, params.orderDirection === 'asc' ? 'ASC' : 'DESC');

    return paginate(qb, { page: params.page, limit: params.pageSize });
  }

  public async revoke(params: { tokenId: string; ownerId: number; revokedById: number }): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(PersonalAccessToken)
      .set({ revokedAt: new Date(), revokedById: params.revokedById })
      .where('id = :id', { id: params.tokenId })
      .andWhere('userId = :ownerId', { ownerId: params.ownerId })
      .andWhere('revokedAt IS NULL')
      .execute();
    return (result.affected ?? 0) > 0;
  }

  public async revokeByAdmin(params: { tokenId: string; revokedById: number }): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(PersonalAccessToken)
      .set({ revokedAt: new Date(), revokedById: params.revokedById })
      .where('id = :id', { id: params.tokenId })
      .andWhere('revokedAt IS NULL')
      .execute();
    return (result.affected ?? 0) > 0;
  }
}
