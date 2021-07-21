import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTask } from '../../../models';
import { setResponse } from '../../utils';

export const getCourseTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const status: 'started' | 'inprogress' | 'finished' = ctx.query.status;
  const now = new Date().toISOString();

  const courseTasksQuery = getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .where(`courseTask.courseId = :courseId`, { courseId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .orderBy('courseTask.studentEndDate', 'ASC');

  if (status === 'started') {
    courseTasksQuery.andWhere('courseTask.studentStartDate <= :now', { now });
  }

  if (status === 'inprogress') {
    courseTasksQuery.andWhere('courseTask.studentStartDate <= :now', { now });
    courseTasksQuery.andWhere('courseTask.studentEndDate > :now', { now });
  }

  if (status === 'finished') {
    courseTasksQuery.andWhere('courseTask.studentEndDate < :now', { now });
  }

  const courseTasks = await courseTasksQuery.getMany();

  const data = courseTasks.map(item => ({
    id: item.id,
    taskId: item.task.id,
    name: item.task.name,
    maxScore: item.maxScore,
    scoreWeight: item.scoreWeight,
    githubPrRequired: !!item.task.githubPrRequired,
    verification: item.task.verification,
    descriptionUrl: item.task.descriptionUrl,
    studentStartDate: item.studentStartDate,
    studentEndDate: item.studentEndDate,
    useJury: item.task.useJury,
    checker: item.checker,
    taskOwnerId: item.taskOwnerId,
    githubRepoName: item.task.githubRepoName,
    sourceGithubRepoUrl: item.task.sourceGithubRepoUrl,
    type: item.type || item.task.type,
    pairsCount: item.pairsCount,
    publicAttributes: item.task.attributes?.public,
    special: item.special,
    duration: item.duration,
  }));

  setResponse(ctx, StatusCodes.OK, data);
};
