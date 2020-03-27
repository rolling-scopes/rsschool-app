import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { IUserSession, StageInterview, Student } from '../../models';
import { setResponse } from '../utils';
import { courseService, stageInterviewService } from '../../services';
import { getRepository, getCustomRepository } from 'typeorm';
import { StageInterviewRepository } from '../../repositories/stageInterview';
import { StageInterviewFeedbackRepository } from '../../repositories/stageInterviewFeedback';

export const getInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;
  const repository = getCustomRepository(StageInterviewRepository);
  const result = await repository.findMany(courseId);
  setResponse(ctx, OK, result);
};

export const getInterviewerStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const repository = getCustomRepository(StageInterviewRepository);
  const result = await repository.findByInterviewer(courseId, githubId);
  setResponse(ctx, OK, result);
};

export const createInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, studentGithubId, githubId: mentorGithubId } = ctx.params;
  const repository = getCustomRepository(StageInterviewRepository);
  const result = await repository.create(courseId, studentGithubId, mentorGithubId);
  setResponse(ctx, OK, { id: result?.id });
};

export const deleteInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const interviewId = Number(ctx.params.interviewId);
  try {
    const interview = await getRepository(StageInterview).delete(interviewId);
    setResponse(ctx, OK, interview);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const updateInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const { interviewId } = ctx.params;
    const { githubId } = ctx.request.body;

    const repository = getCustomRepository(StageInterviewRepository);
    await repository.updateInterviewer(Number(interviewId), githubId);
    setResponse(ctx, OK, {});
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  try {
    const { keepReserve = true, noRegistration = false } = ctx.request.body as {
      keepReserve: boolean;
      noRegistration: boolean;
    };
    const repository = getCustomRepository(StageInterviewRepository);
    console.log(keepReserve);
    const result = await repository.createAutomatically(courseId, keepReserve, noRegistration);
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getAvailableStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const result = await stageInterviewService.getAvailableStudents(courseId);
  setResponse(ctx, OK, result);
};

type InterviewFeedbackPostInput = {
  githubId: string;
  json: string;
  isCompleted: boolean;
  decision: string | null;
  isGoodCandidate: boolean | null;
};

export const createFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: InterviewFeedbackPostInput = ctx.request.body;
  const { courseId } = ctx.params;

  const user = ctx.state!.user as IUserSession;
  const githubId = data.githubId;

  try {
    const repository = getCustomRepository(StageInterviewRepository);
    const interviews = await repository.findByStudent(courseId, githubId);
    const interview = interviews.find(it => it.interviewer.githubId === user.githubId);

    if (interview == null) {
      throw new Error(`Stage Interview for interviewer='${user.githubId}' and student='${githubId}' is not found'`);
    }

    const feedbackRepository = getCustomRepository(StageInterviewFeedbackRepository);
    await feedbackRepository.create(interview.id, data);

    const [student, mentor] = await Promise.all([
      courseService.queryStudentByGithubId(courseId, githubId),
      courseService.queryMentorByGithubId(courseId, user.githubId),
    ]);

    if (data.decision === 'yes' && student && mentor) {
      await getRepository(Student).update(student?.id, { mentorId: mentor.id });
    }

    setResponse(ctx, OK, { stageInterviewId: interview.id, ...data });
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { interviewId } = ctx.params;
  const mentorGithubId = (ctx.state!.user as IUserSession).githubId;
  try {
    const repository = getCustomRepository(StageInterviewFeedbackRepository);
    const feedback = await repository.find(Number(interviewId), mentorGithubId);
    console.log(feedback);
    setResponse(ctx, OK, JSON.parse(feedback?.json ?? '{}'));
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.addStudent(courseId, student.id);
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getInterviewStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  try {
    const student = await courseService.queryStudentByGithubId(courseId, githubId);
    if (student == null) {
      setResponse(ctx, BAD_REQUEST, null);
      return;
    }
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.findStudent(courseId, student.id);
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};
