import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTask, Task } from '../../../models';
import { setResponse } from '../../utils';

export const getCourseTask = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const courseTaskId: number = ctx.params.id;

  const courseTask = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .leftJoin('courseTask.taskOwner', 'taskOwner')
    .addSelect(['taskOwner.githubId', 'taskOwner.id', 'taskOwner.firstName', 'taskOwner.lastName'])
    .where(`courseTask.courseId = :courseId`, { courseId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .andWhere('courseTask.id = :id', { id: courseTaskId })
    .getOne();

  const data = {
    id: courseTask?.id,
    taskId: (courseTask?.task as Task).id,
    name: (courseTask?.task as Task).name,
    maxScore: courseTask?.maxScore,
    scoreWeight: courseTask?.scoreWeight,
    githubPrRequired: !!(courseTask?.task as Task).githubPrRequired,
    verification: (courseTask?.task as Task).verification,
    descriptionUrl: (courseTask?.task as Task).descriptionUrl,
    description: (courseTask?.task as Task).description,
    studentStartDate: courseTask?.studentStartDate,
    studentEndDate: courseTask?.studentEndDate,
    useJury: (courseTask?.task as Task).useJury,
    checker: courseTask?.checker,
    taskOwnerId: courseTask?.taskOwnerId,
    taskOwner: courseTask?.taskOwner
      ? {
          id: courseTask?.taskOwner.id,
          githubId: courseTask?.taskOwner.githubId,
          name: `${courseTask?.taskOwner.firstName} ${courseTask?.taskOwner.lastName}`,
        }
      : null,
    githubRepoName: (courseTask?.task as Task).githubRepoName,
    sourceGithubRepoUrl: (courseTask?.task as Task).sourceGithubRepoUrl,
    type: courseTask?.type || (courseTask?.task as Task).type,
    pairsCount: courseTask?.pairsCount,
    publicAttributes: (courseTask?.task as Task).attributes?.public,
    special: courseTask?.special,
    duration: courseTask?.duration,
  };

  setResponse(ctx, OK, data);
};
