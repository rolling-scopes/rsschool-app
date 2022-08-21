import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '../config';
import { isTaskNeededToStart, isTaskNeededToFinish } from './tasks-filtering';
import { Checker, CourseTask } from '@entities/courseTask';
import { from, catchError, mergeMap, EMPTY, toArray, lastValueFrom } from 'rxjs';

const ONCE_A_DAY_AT_00_05 = '5 0 * * *';

@Injectable()
export class CrossCheckService {
  private readonly logger = new Logger('CrossCheckService');

  constructor(
    @InjectRepository(CourseTask)
    private readonly courseTaskRepository: Repository<CourseTask>,
    private readonly httpService: HttpService,
    private readonly conf: ConfigService,
  ) {}

  @Cron(ONCE_A_DAY_AT_00_05, { timeZone: 'UTC' })
  async executeCronJobs() {
    const { tasksToStart, tasksToFinish } = await this.getCrossCheckTasks();
    await this.initCrossCheckAction(tasksToStart, 'distribution');
    await this.initCrossCheckAction(tasksToFinish, 'completion');
  }

  private getInitalDataForRequest() {
    const { username, password } = this.conf.users.root;
    const host = this.conf.host;

    return {
      host,
      auth: {
        username,
        password,
      },
    };
  }

  private makeCrossCheckRequest(url: string, auth: { username: string; password: string }) {
    return this.httpService.post(url, null, {
      auth,
    });
  }

  private async initCrossCheckAction(courseTasks: CourseTask[], action: 'distribution' | 'completion') {
    const { host, auth } = this.getInitalDataForRequest();
    const baseurl = `${host}/api/course`;

    const courseTaskRequests$ = from(courseTasks).pipe(
      mergeMap(({ id, courseId }) => {
        const requestUrl = `${baseurl}/${courseId}/task/${id}/cross-check/${action}`;
        return this.makeCrossCheckRequest(requestUrl, auth).pipe(
          catchError(err => {
            this.logger.error({
              message: `Cross-Check ${action} failed for task with id ${id}!`,
              reason: err,
            });
            return EMPTY;
          }),
        );
      }),
      toArray(),
    );

    await lastValueFrom(courseTaskRequests$);
  }

  private async getCrossCheckTasks() {
    const allCrossCheckTasks = await this.courseTaskRepository.find({ where: { checker: Checker.CrossCheck } });

    return {
      tasksToStart: allCrossCheckTasks.filter(isTaskNeededToStart),
      tasksToFinish: allCrossCheckTasks.filter(isTaskNeededToFinish),
    };
  }
}
