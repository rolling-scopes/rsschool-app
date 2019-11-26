import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskVerification } from '../../models';
import { setResponse } from '../utils';
import { getStudentByGithubId } from '../../services/courseService';

type Params = { courseId: number; githubId: string };

export const getTaskVerifications = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;

  const student = await getStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, {});
    return;
  }

  const tasks = await getRepository(TaskVerification)
    .createQueryBuilder('taskVerification')
    .innerJoin('taskVerification.courseTask', 'courseTask')
    .innerJoin('courseTask.task', 'task')
    .addSelect(['task.name', 'task.name', 'courseTask.id'])
    .where('taskVerification.studentId = :id', { id: student.id })
    .orderBy('taskVerification.updatedDate', 'DESC')
    .getMany();

  setResponse(ctx, OK, tasks);
};
