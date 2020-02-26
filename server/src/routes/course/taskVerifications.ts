import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskVerification } from '../../models';
import { setResponse } from '../utils';
import { getStudentByGithubId } from '../../services/courseService';

type Params = { courseId: number; githubId: string };

export const getStudentTaskVerifications = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;

  const student = await getStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, {});
    return;
  }

  const verifications = await getRepository(TaskVerification)
    .createQueryBuilder('v')
    .innerJoin('v.courseTask', 'courseTask')
    .innerJoin('courseTask.task', 'task')
    .addSelect(['task.name', 'courseTask.id'])
    .where('v.studentId = :id', { id: student.id })
    .orderBy('v.updatedDate', 'DESC')
    .getMany();

  setResponse(ctx, OK, verifications);
};

export const getCourseTasksVerifications = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as Params;

  const verifications = await getRepository(TaskVerification)
    .createQueryBuilder('v')
    .select(['v.id', 'v.status'])
    .innerJoin('v.courseTask', 'courseTask')
    .innerJoin('courseTask.task', 'task')
    .innerJoin('v.student', 'student')
    .innerJoin('student.user', 'user')
    .addSelect([
      'student.id',
      'user.githubId',
      'task.name',
      'task.githubRepoName',
      'task.sourceGithubRepoUrl',
      'courseTask.id',
    ])
    .where('courseTask.courseId = :courseId', { courseId })
    .andWhere("v.status = 'pending' ")
    .orderBy('v.createdDate', 'ASC')
    .getMany();

  const result = verifications.map(verification => ({
    courseId: Number(courseId),
    id: verification.id,
    githubId: verification.student.user.githubId,
    courseTaskId: verification.courseTaskId,
    taskName: verification.courseTask.task.name,
    sourceGithubRepoUrl: verification.courseTask.task.sourceGithubRepoUrl,
    githubRepoName: verification.courseTask.task.githubRepoName,
  }));
  setResponse(ctx, OK, result);
};
