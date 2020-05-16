import { BAD_REQUEST, LOCKED, OK, TOO_MANY_REQUESTS } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { awsTaskService, courseService, taskService } from '../../services';
import { setResponse } from '../utils';
import { getRepository } from 'typeorm';
import { CourseTask, TaskVerification } from '../../models';

export const createTaskVerification = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params;

  const inputData: any = ctx.request.body;

  const [courseTask, student] = await Promise.all([
    taskService.getCourseTask(courseTaskId),
    courseService.getStudentByGithubId(courseId, githubId),
  ]);

  if (courseTask == null || student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'No student or Not valid course task' });
    return;
  }

  const existing = await getRepository(TaskVerification)
    .createQueryBuilder('v')
    .select(['v.id'])
    .where("v.status = 'pending'")
    .andWhere('v.studentId = :studentId', { studentId: student.id })
    .andWhere('v.courseTaskId = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere("v.updatedDate > (NOW() - INTERVAL '1 hour')")
    .limit(1)
    .getOne();

  if (existing != null) {
    setResponse(ctx, TOO_MANY_REQUESTS, { id: existing });
    return;
  }

  const idCourseTaskExpired = await getRepository(CourseTask)
    .createQueryBuilder('v')
    .select(['v.id'])
    .where('v.id = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere('NOW() > v.studentEndDate')
    .limit(1)
    .getOne();

  if (idCourseTaskExpired != null) {
    setResponse(ctx, LOCKED, { id: idCourseTaskExpired, error: 'expired' });
    return;
  }

  const {
    identifiers: [identifier],
  } = await getRepository(TaskVerification).insert({
    studentId: student.id,
    courseTaskId: courseTask.id,
    score: 0,
    status: 'pending',
  });

  const result: VerificationEvent = {
    id: identifier.id,
    githubId,
    studentId: student.id,
    courseTask: {
      ...inputData,
      id: courseTask.id,
      type: courseTask.type || courseTask.task.type,
      attributes: courseTask.task.attributes ?? {},
    },
  };

  await awsTaskService.postTaskVerification([result]);
  setResponse(ctx, OK, result);
};

type VerificationEvent = {
  id: number;
  courseTask: {
    id: number;
    type: string;
    [key: string]: any;
  };
  studentId: number;
  githubId: string;
};
