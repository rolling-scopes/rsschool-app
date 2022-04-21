import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterviewRepository } from '../../../repositories/stageInterview.repository';
import { setResponse } from '../../utils';
import { sendInteviewerAssignedNotification } from '../interviews';

type BodyParams = {
  keepReserve: boolean;
  noRegistration: boolean;
};

export const createInterviews = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  try {
    const { keepReserve = true, noRegistration = false } = ctx.request.body as BodyParams;
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.createAutomatically(courseId, keepReserve, noRegistration);

    await Promise.all(
      result.map(
        async pair =>
          await sendInteviewerAssignedNotification(logger, courseId, {
            interviewerId: pair.mentorId,
            studentId: pair.studentId,
          }),
      ),
    );
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: (e as Error).message });
  }
};
