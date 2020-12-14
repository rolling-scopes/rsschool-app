import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { courseService, interviewService } from '../../services';
import { setResponse } from '../utils';
import { InterviewRepository } from '../../repositories/interview';
import { StageInterviewRepository } from '../../repositories/stageInterview';

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

  setResponse(ctx, OK, result);
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
  setResponse(ctx, OK, result);
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
  setResponse(ctx, OK, result);
};

export const getInterviewPairs = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseTaskId: number = Number(ctx.params.courseTaskId);
  const data = await interviewService.getInterviewPairs(courseTaskId);
  setResponse(ctx, OK, data);
};

export const createInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(InterviewRepository);
    const result = await repository.addStudent(courseId, Number(courseTaskId), student.id);
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(InterviewRepository);
    const result = await repository.findRegisteredStudent(courseId, Number(courseTaskId), student.id);
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, courseTaskId, studentGithubId, githubId: interviewerGithubId } = ctx.params;
  const result = await interviewService.createInterview(courseId, courseTaskId, interviewerGithubId, studentGithubId);
  setResponse(ctx, OK, { id: result?.id });
};

export const createInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const courseTaskId: number = Number(ctx.params.courseTaskId);
  try {
    const { clean = false, registrationEnabled = false } = ctx.request.body as {
      clean: boolean;
      registrationEnabled: boolean;
    };
    const result = await interviewService.createInterviewsAutomatically(courseId, courseTaskId, {
      clean,
      registrationEnabled,
    });
    if (result == null) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const cancelInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const pairId: number = Number(ctx.params.id);
  try {
    await interviewService.cancelInterviewPair(pairId);
    setResponse(ctx, OK, {});
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};
