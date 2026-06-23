import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';
import { StudentRepository } from '../../repositories/student.repository';

export const getStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const studentRepository = getCustomRepository(StudentRepository);
  const student = await studentRepository.findAndIncludeDetails(courseId, githubId);
  setResponse(ctx, OK, student);
};

export const getCrossMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params as {
    githubId: string;
    courseId: number;
  };

  const taskCheckers = await courseService.getCrossMentorsByStudent(courseId, githubId);

  setResponse(ctx, OK, taskCheckers);
};
