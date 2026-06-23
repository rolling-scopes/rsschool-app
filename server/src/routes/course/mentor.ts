import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { StudentRepository } from '../../repositories/student.repository';
import { setResponse } from '../utils';

type Params = { courseId: number; githubId: string; courseTaskId: number };

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const repository = getCustomRepository(StudentRepository);
  const students = await repository.findByMentor(courseId, githubId);
  setResponse(ctx, OK, students);
};
