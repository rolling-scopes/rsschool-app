import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskVerification, Student } from '../../models';
import { setResponse } from '../utils';

export const getTaskVerifications = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;

  const student = await getRepository(Student).findOne({ where: { userId, courseId } });
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
    .orderBy('taskVerification.updatedDate')
    .getMany();

  setResponse(ctx, OK, tasks);
};
