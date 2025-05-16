import { StatusCodes } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { courseService, InterviewService, notificationService, taskService } from '../../services';
import { setResponse } from '../utils';
import { InterviewRepository } from '../../repositories/interview.repository';
import { StageInterviewRepository } from '../../repositories/stageInterview.repository';
import { userGuards } from '../guards';

type Params = { courseId: number; githubId: string; courseTaskId: number };

export const getStudentInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const interviewRepository = getCustomRepository(InterviewRepository);
  const stageInterviewRepository = getCustomRepository(StageInterviewRepository);
  const [interviews, stageInterviews] = await Promise.all([
    interviewRepository.findByStudent(courseId, githubId),
    stageInterviewRepository.findByStudent(courseId, githubId),
  ]);
  const result = stageInterviews.concat(interviews);

  setResponse(ctx, StatusCodes.OK, result);
};

export const getMentorInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const interviewRepository = getCustomRepository(InterviewRepository);
  const stageInterviewRepository = getCustomRepository(StageInterviewRepository);
  const [interviews, stageInterviews] = await Promise.all([
    interviewRepository.findByInterviewer(courseId, githubId),
    stageInterviewRepository.findByInterviewer(courseId, githubId),
  ]);
  const result = stageInterviews.concat(interviews);
  setResponse(ctx, StatusCodes.OK, result);
};

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

  if (guard.isMentor(courseId)) {
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

export const createInterviews = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const courseTaskId: number = Number(ctx.params.courseTaskId);

  try {
    const { clean = false, registrationEnabled = true } = ctx.request.body as {
      clean: boolean;
      registrationEnabled: boolean;
    };

    const courseTask = await taskService.getCourseTask(courseTaskId);

    if (courseTask == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST, { message: 'not valid course task' });
      return;
    }

    if (courseTask.isCreatingInterviewPairs) {
      setResponse(ctx, StatusCodes.PROCESSING, { message: 'course task is already being processed' });
      return;
    }

    await taskService.changeCourseTaskProcessing(courseTaskId, true);

    const interviewService = new InterviewService(courseId, logger);
    const result = await interviewService.createInterviewsAutomatically(courseTaskId, {
      clean,
      registrationEnabled,
    });

    if (result == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST);
      return;
    }

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
  } finally {
    await taskService.changeCourseTaskProcessing(courseTaskId, false);
  }
};

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
