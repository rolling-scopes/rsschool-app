import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '../config';
import { isTaskNeededToStart, isTaskNeededToFinish } from './utils/tasksFiltering';
import { CourseTask } from '@entities/courseTask';
import { from, catchError, mergeMap, EMPTY, toArray, lastValueFrom } from 'rxjs';

@Injectable()
export class CrossCheckService {
  private readonly logger = new Logger('CrossCheckService');

  constructor(
    @InjectRepository(CourseTask)
    private readonly courseTaskRepository: Repository<CourseTask>,
    private readonly httpService: HttpService,
    private readonly conf: ConfigService,
  ) {}

  @Cron('5 0 * * *', { timeZone: 'UTC' })
  async executeCronJobs() {
    const { tasksToStart, tasksToFinish } = await this.getCrossCheckTasks();
    await this.initCrossCheckAction(tasksToStart, 'distribution');
    await this.initCrossCheckAction(tasksToFinish, 'completion');
  }

  private getInitalDataForRequest() {
    const { username, password } = this.conf.users.root;

    const authHeader = `Basic ${Buffer.from(username + ':' + password).toString('base64')}`;
    const host = this.conf.host;

    return {
      host,
      authHeader,
    };
  }

  private makeCrossCheckRequest(url: string, authHeader: string) {
    return this.httpService.post(url, null, {
      headers: {
        Authorization: authHeader,
      },
    });
  }

  private async initCrossCheckAction(courseTasks: CourseTask[], action: 'distribution' | 'completion') {
    const { host, authHeader } = this.getInitalDataForRequest();
    const baseurl = `${host}/api/course`;

    const courseTaskRequests$ = from(courseTasks).pipe(
      mergeMap(({ id, courseId }) => {
        const requestUrl = `${baseurl}/${courseId}/task/${id}/cross-check/${action}`;
        return this.makeCrossCheckRequest(requestUrl, authHeader).pipe(
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
    const allCrossCheckTasks = await this.courseTaskRepository.find({ where: { checker: 'crossCheck' } });

    return {
      tasksToStart: allCrossCheckTasks.filter(isTaskNeededToStart),
      tasksToFinish: allCrossCheckTasks.filter(isTaskNeededToFinish),
    };
  }
}
