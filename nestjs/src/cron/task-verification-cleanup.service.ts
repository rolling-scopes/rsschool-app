import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { TaskVerification } from '@entities/taskVerification';

const EVERY_HOUR = '0 * * * *';

// Ported 1:1 from the legacy Koa cancelPendingTasks cron.
@Injectable()
export class TaskVerificationCleanupService {
  private readonly logger = new Logger('TaskVerificationCleanup');

  constructor(
    @InjectRepository(TaskVerification)
    private readonly taskVerificationRepository: Repository<TaskVerification>,
  ) {}

  @Cron(EVERY_HOUR, { timeZone: 'UTC' })
  async handleCron() {
    this.logger.log('Starting pending tasks cancelling job');
    await this.cancelPendingTasks();
  }

  public cancelPendingTasks() {
    return this.taskVerificationRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'cancelled' })
      .where(`"updatedDate" + interval '1 hour' < now()::timestamp AND status = 'pending'`)
      .execute();
  }
}
