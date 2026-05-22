import { PersonalAccessToken } from '@entities/personalAccessToken';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Repository } from 'typeorm';

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

@Injectable()
export class PersonalAccessTokensService {
  private readonly lastUsedTouchedAt = new Map<string, number>();

  constructor(
    @InjectRepository(PersonalAccessToken)
    private readonly repo: Repository<PersonalAccessToken>,
  ) {}

  public async create(params: { userId: number; name: string; expiresInDays?: number }): Promise<CreatePatResult> {
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
      }),
    );

    return { record, token: `${PAT_TOKEN_PREFIX}${prefix}_${secret}` };
  }

  public async validateTokenString(token: string): Promise<PatValidationResult> {
    const parsed = parseToken(token);
    if (!parsed) return { ok: false, reason: 'malformed' };

    const record = await this.repo.findOne({ where: { prefix: parsed.prefix } });
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
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
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
