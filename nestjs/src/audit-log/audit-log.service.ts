import { AuditLog } from '@entities/auditLog';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../core/paginate';

export type AuditLogEntry = {
  userId: number;
  tokenId: string;
  action: string;
  method: string;
  path: string;
  resource?: string | null;
  resourceId?: string | null;
  requestPayload?: Record<string, unknown> | null;
  responseStatus: number;
  durationMs: number;
  ip?: string | null;
  userAgent?: string | null;
};

const FLUSH_INTERVAL_MS = 2_000;
const MAX_BATCH = 100;

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private queue: AuditLogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  public enqueue(entry: AuditLogEntry): void {
    this.queue.push(entry);
    if (this.queue.length >= MAX_BATCH) {
      void this.flush();
      return;
    }
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => void this.flush(), FLUSH_INTERVAL_MS);
    }
  }

  public async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.queue.length);
    try {
      // requestPayload is jsonb; TypeORM's DeepPartial<unknown> union fights us. Cast to bypass.
      await this.repo.insert(batch as never);
    } catch (err) {
      this.logger.error({ message: 'Failed to flush audit log', err });
    }
  }

  public list(params: {
    userId?: number;
    tokenId?: string;
    from?: Date;
    to?: Date;
    action?: string;
    page: number;
    pageSize: number;
  }) {
    const qb = this.repo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .leftJoinAndSelect('audit.token', 'token')
      .orderBy('audit.createdAt', 'DESC');

    if (params.userId !== undefined) qb.andWhere('audit.userId = :userId', { userId: params.userId });
    if (params.tokenId) qb.andWhere('audit.tokenId = :tokenId', { tokenId: params.tokenId });
    if (params.from) qb.andWhere('audit.createdAt >= :from', { from: params.from });
    if (params.to) qb.andWhere('audit.createdAt <= :to', { to: params.to });
    if (params.action) qb.andWhere('audit.action ILIKE :action', { action: `%${params.action}%` });

    return paginate(qb, { page: params.page, limit: params.pageSize });
  }
}
