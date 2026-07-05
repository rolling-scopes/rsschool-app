import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { isTaskNeededToStart, isTaskNeededToFinish } from './tasks-filtering';
import { Checker, CourseTask } from '@entities/courseTask';
import { CourseCrossCheckService } from '../courses/cross-checks';

const ONCE_A_DAY_AT_00_05 = '5 0 * * *';

@Injectable()
export class CrossCheckService {
  private readonly logger = new Logger('CrossCheckService');

  constructor(
    @InjectRepository(CourseTask)
    private readonly courseTaskRepository: Repository<CourseTask>,
    private readonly courseCrossCheckService: CourseCrossCheckService,
  ) {}

  @Cron(ONCE_A_DAY_AT_00_05, { timeZone: 'UTC' })
  async executeCronJobs() {
    const { tasksToStart, tasksToFinish } = await this.getCrossCheckTasks();
    await this.initCrossCheckAction(tasksToStart, 'distribution');
    await this.initCrossCheckAction(tasksToFinish, 'completion');
  }

  private async initCrossCheckAction(courseTasks: CourseTask[], action: 'distribution' | 'completion') {
    for (const { id } of courseTasks) {
      try {
        if (action === 'distribution') {
          await this.courseCrossCheckService.runDistribution(id);
        } else {
          await this.courseCrossCheckService.runCompletion(id);
        }
      } catch (err) {
        this.logger.error({
          message: `Cross-Check ${action} failed for task with id ${id}!`,
          reason: err,
        });
      }
    }
  }

  private async getCrossCheckTasks() {
    const allCrossCheckTasks = await this.courseTaskRepository.find({
      where: { checker: Checker.CrossCheck, disabled: false },
    });

    return {
      tasksToStart: allCrossCheckTasks.filter(isTaskNeededToStart),
      tasksToFinish: allCrossCheckTasks.filter(isTaskNeededToFinish),
    };
  }
}
