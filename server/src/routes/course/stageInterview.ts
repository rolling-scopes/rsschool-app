import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from 'logger';
import { IUserSession, StageInterview, Student } from 'models';
import { setResponse } from 'routes/utils';
import { courseService, stageInterviewService } from 'services';
import { getRepository, getCustomRepository } from 'typeorm';
import { StageInterviewRepository } from 'repositories/stageInterview';
import { StageInterviewFeedbackRepository } from 'repositories/stageInterviewFeedback';

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

export const createInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  try {
    const { useReserve = false } = ctx.request.body as { useReserve: boolean };
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.createAutomatically(courseId, useReserve);
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
  studentId: number;
  json: string;
  isCompleted: boolean;
  decision: string | null;
  isGoodCandidate: boolean | null;
};

export const createFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: InterviewFeedbackPostInput = ctx.request.body;

  const stageId: number = Number(ctx.params.id);
  const userId: number = (ctx.state!.user as IUserSession).id;
  const studentId = data.studentId;

  try {
    const stageInterview: any = await getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .innerJoin('stageInterview.mentor', 'mentor')
      .innerJoin('mentor.user', 'user')
      .where('stageInterview.stageId = :stageId', { stageId })
      .andWhere('stageInterview.studentId = :studentId', { studentId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!stageInterview) {
      throw new Error(
        `Stage interview for userId='${userId}' and studentId='${studentId}' not found at stage='${stageId}'`,
      );
    }
    const repository = getCustomRepository(StageInterviewFeedbackRepository);
    await repository.create(stageInterview.id, data);
    if (data.decision === 'yes') {
      await getRepository(Student).update(studentId, { mentorId: stageInterview.mentorId });
    }
    setResponse(ctx, OK, { stageInterviewId: stageInterview.id, ...data });
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const mentorGithubId = (ctx.state!.user as IUserSession).githubId;
  try {
    const repository = getCustomRepository(StageInterviewFeedbackRepository);
    const feedback = await repository.findByStudent(courseId, githubId, mentorGithubId);
    setResponse(ctx, OK, feedback?.json ?? '{}');
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
