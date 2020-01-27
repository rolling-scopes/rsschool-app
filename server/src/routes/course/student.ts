import { BAD_REQUEST, CONFLICT, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { IUserSession, Student, TaskInterviewResult } from '../../models';
import { courseService, taskService } from '../../services';
import { getInterviewsByStudent } from '../../services/stageInterviews';
import { setResponse } from '../utils';

export const postStudentStatus = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const data: { comment?: string; status: 'expelled' | 'active' } = ctx.request.body;

  if (data.status !== 'expelled') {
    throw new Error('Not Supported');
  }

  const { user } = ctx.state as { user: IUserSession };
  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (!courseService.isPowerUser(courseId, user)) {
    const [interviews, mentor] = await Promise.all([
      getInterviewsByStudent(courseId, student.id),
      courseService.getCourseMentor(courseId, user.id),
    ] as const);
    if (mentor == null) {
      setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
      return;
    }
    if (!interviews.some(it => it.mentor.id === mentor!.id) && student.mentorId !== mentor.id) {
      setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
      return;
    }
  }

  await getRepository(Student).update(student.id, {
    isExpelled: true,
    expellingReason: data.comment || '',
    endDate: new Date(),
  });
  setResponse(ctx, OK);
  return;
};

export const getStudentSummary = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;

  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, OK, null);
    return;
  }

  const [score, mentor] = await Promise.all([
    courseService.getStudentScore(student.id),
    student.mentorId ? await courseService.getMentorWithContacts(student.mentorId) : null,
  ]);

  setResponse(
    ctx,
    OK,
    {
      ...score,
      isActive: !student.isExpelled && !student.isFailed,
      mentor,
    },
    60,
  );
};

type Input = {
  score: number | string;
  comment: string;
  formAnswers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
};

export const postStudentInterviewResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params as {
    githubId: string;
    courseId: number;
    courseTaskId: number;
  };
  const userId = ctx.state.user.id;

  const inputData: Input = ctx.request.body;

  if (inputData.score == null) {
    setResponse(ctx, BAD_REQUEST, 'no score');
    return;
  }

  const [student, mentor] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    courseService.getCourseMentor(courseId, userId),
  ]);

  if (student == null || mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or mentor' });
    return;
  }

  const courseTask = await taskService.getCourseTaskOnly(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  const repository = getRepository(TaskInterviewResult);
  let existingResult = await repository
    .createQueryBuilder('taskInterviewResult')
    .where('"taskInterviewResult"."studentId" = :studentId', { studentId: student.id })
    .andWhere('"taskInterviewResult"."courseTaskId" = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere('"taskInterviewResult"."mentorId" = :mentorId', { mentorId: mentor.id })
    .getOne();

  if (existingResult != null) {
    existingResult = {
      ...existingResult,
      formAnswers: inputData.formAnswers,
      score: Math.round(Number(inputData.score)),
      comment: inputData.comment || '',
    };
    const result = await repository.update(existingResult.id, existingResult);
    setResponse(ctx, OK, result);
    return;
  }

  const entry: Partial<TaskInterviewResult> = {
    mentorId: mentor.id,
    studentId: student.id,
    formAnswers: inputData.formAnswers,
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    courseTaskId: courseTask.id,
  };
  const result = await repository.insert(entry);
  setResponse(ctx, OK, result);
};

export const getCrossMentorsTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params as {
    githubId: string;
    courseId: number;
  };

  const taskCheckers = await courseService.getCrossMentorsByStudent(courseId, githubId);

  setResponse(ctx, OK, taskCheckers);
};
