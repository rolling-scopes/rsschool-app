import { StatusCodes } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { courseService, InterviewService, notificationService } from '../../services';
import { setResponse } from '../utils';
import { InterviewRepository } from '../../repositories/interview.repository';
import { userGuards } from '../guards';

export const getInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(InterviewRepository);
    const result = await repository.findRegisteredStudent(courseId, Number(courseTaskId), student.id);
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: (e as Error).message });
  }
};

export const createInterview = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const user = ctx.state.user;
  const guard = userGuards(user);
  const { courseId, courseTaskId, studentGithubId, githubId: interviewerGithubId } = ctx.params;
  const interviewService = new InterviewService(courseId, logger);

  if (guard.isMentor(courseId) && !guard.isPowerUser(courseId)) {
    const isStarted = await interviewService.isInterviewStarted(courseTaskId);
    if (!isStarted) {
      setResponse(ctx, StatusCodes.FORBIDDEN);
      return;
    }
  }

  const result = await interviewService.createInterview(courseTaskId, interviewerGithubId, studentGithubId);

  await sendInteviewerAssignedNotification(logger, courseId, { interviewerGithubId, studentGithubId });

  setResponse(ctx, StatusCodes.OK, { id: result?.id });
};

export async function sendInteviewerAssignedNotification(
  logger: ILogger,
  courseId: number,
  {
    interviewerGithubId,
    interviewerId,
    studentGithubId,
    studentId,
  }: {
    interviewerGithubId?: string;
    studentGithubId?: string | undefined;
    studentId?: number;
    interviewerId?: number;
  },
) {
  if ((!interviewerGithubId && !interviewerId) || (!studentId && !studentGithubId)) {
    logger.info(`sendInteviewerAssignedNotification: missing id info`);
    return;
  }
  try {
    const mentorRequest =
      (interviewerGithubId !== undefined && courseService.queryMentorByGithubId(courseId, interviewerGithubId)) ||
      (interviewerId !== undefined && courseService.queryMentorById(courseId, interviewerId));

    const studentRequest =
      (studentGithubId !== undefined && courseService.queryStudentByGithubId(courseId, studentGithubId)) ||
      (studentId !== undefined && courseService.queryStudentById(courseId, studentId));

    if (!mentorRequest || !studentRequest) return;
    const [interviewer, student] = await Promise.all([mentorRequest, studentRequest]);
    if (!student || !interviewer) return;

    await notificationService.sendNotification({
      userId: student.userId,
      notificationId: 'interviewerAssigned',
      data: {
        interviewer,
      },
    });
  } catch (e) {
    logger.error(`sendInteviewerAssignedNotification: ${(e as Error).message}`);
  }
}

export const cancelInterview = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const pairId: number = Number(ctx.params.id);

  try {
    const interviewService = new InterviewService(courseId, logger);
    await interviewService.cancelInterviewPair(pairId);
    setResponse(ctx, StatusCodes.OK, {});
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: (e as Error).message });
  }
};
