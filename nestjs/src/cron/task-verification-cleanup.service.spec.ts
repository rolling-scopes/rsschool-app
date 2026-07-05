import { describe, expect, it, vi } from 'vitest';
import { TaskVerificationCleanupService } from './task-verification-cleanup.service';

describe('TaskVerificationCleanupService.cancelPendingTasks', () => {
  it('cancels pending verifications older than 1 hour via a single UPDATE', async () => {
    const execute = vi.fn().mockResolvedValue({ affected: 3 });
    const qb: Record<string, unknown> = {};
    qb.update = vi.fn(() => qb);
    qb.set = vi.fn(() => qb);
    qb.where = vi.fn(() => qb);
    qb.execute = execute;
    const repo = { createQueryBuilder: vi.fn(() => qb) };

    const service = new TaskVerificationCleanupService(repo as never);
    await service.cancelPendingTasks();

    expect(qb.set).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(qb.where).toHaveBeenCalledWith(
      `"updatedDate" + interval '1 hour' < now()::timestamp AND status = 'pending'`,
    );
    expect(execute).toHaveBeenCalled();
  });
});
