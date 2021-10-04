import { StatusCodes } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { courseService, InterviewService } from '../../services';
import { setResponse } from '../utils';
import { InterviewRepository } from '../../repositories/interview.repository';
import { StageInterviewRepository } from '../../repositories/stageInterview.repository';

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

export const getInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;
  const data = await courseService.getCourseTasks(courseId);

  const result = data
    .filter(interview => {
      const type = interview.type ?? interview.task.type;
      return type === 'stage-interview' || type === 'interview';
    })
    .map(interview => {
      return {
        id: interview.id,
        name: interview.task.name,
        startDate: interview.studentStartDate,
        endDate: interview.studentEndDate,
        descriptionUrl: interview.task.descriptionUrl,
        type: interview.type || interview.task.type,
      };
    });
  setResponse(ctx, StatusCodes.OK, result);
};

export const getInterviewPairs = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const courseTaskId: number = Number(ctx.params.courseTaskId);
  const service = new InterviewService(courseId);
  const data = await service.getInterviewPairs(courseTaskId);
  setResponse(ctx, StatusCodes.OK, data);
};

export const createInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(InterviewRepository);
    const result = await repository.addStudent(courseId, Number(courseTaskId), student.id);
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
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
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};

export const createInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, courseTaskId, studentGithubId, githubId: interviewerGithubId } = ctx.params;
  const interviewService = new InterviewService(courseId);
  const result = await interviewService.createInterview(courseTaskId, interviewerGithubId, studentGithubId);
  setResponse(ctx, StatusCodes.OK, { id: result?.id });
};

export const createInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const courseTaskId: number = Number(ctx.params.courseTaskId);
  try {
    const { clean = false, registrationEnabled = true } = ctx.request.body as {
      clean: boolean;
      registrationEnabled: boolean;
    };
    const interviewService = new InterviewService(courseId);
    const result = await interviewService.createInterviewsAutomatically(courseTaskId, {
      clean,
      registrationEnabled,
    });
    if (result == null) {
      setResponse(ctx, StatusCodes.BAD_REQUEST);
      return;
    }
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};

export const cancelInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const pairId: number = Number(ctx.params.id);

  try {
    const interviewService = new InterviewService(courseId);
    await interviewService.cancelInterviewPair(pairId);
    setResponse(ctx, StatusCodes.OK, {});
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
