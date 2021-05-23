import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { StageInterviewRepository } from '../../../repositories/stageInterview';
import { courseService } from '../../../services';
import { ILogger } from '../../../logger';
import { setResponse } from '../../utils';

export const createInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.addStudent(courseId, student.id);
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
