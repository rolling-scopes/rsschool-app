import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterviewRepository } from '../../../repositories/stageInterview';
import { courseService } from '../../../services';
import { setResponse } from '../../utils';

type RequestParams = {
  courseId: number;
  githubId: string;
};

export const getInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as RequestParams;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.findStudent(courseId, student.id);
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
