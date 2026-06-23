import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository, getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskInterviewResult } from '../../models';
import { courseService, taskService } from '../../services';
import { setResponse } from '../utils';
import { StudentRepository } from '../../repositories/student.repository';

export const getStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const studentRepository = getCustomRepository(StudentRepository);
  const student = await studentRepository.findAndIncludeDetails(courseId, githubId);
  setResponse(ctx, OK, student);
};

export const createInterviewResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params as {
    githubId: string;
    courseId: number;
    courseTaskId: number;
  };
  const userId = ctx.state.user.id;

  const inputData: InterviewResultInput = ctx.request.body;

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
  const existingResult = await repository
    .createQueryBuilder('taskInterviewResult')
    .where('"taskInterviewResult"."studentId" = :studentId', { studentId: student.id })
    .andWhere('"taskInterviewResult"."courseTaskId" = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere('"taskInterviewResult"."mentorId" = :mentorId', { mentorId: mentor.id })
    .getOne();

  if (existingResult != null) {
    const result = await repository.update(existingResult.id, {
      formAnswers: inputData.formAnswers,
      score: Math.round(Number(inputData.score)),
      comment: inputData.comment || '',
    });
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

export const getCrossMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params as {
    githubId: string;
    courseId: number;
  };

  const taskCheckers = await courseService.getCrossMentorsByStudent(courseId, githubId);

  setResponse(ctx, OK, taskCheckers);
};

type InterviewResultInput = {
  score: number | string;
  comment: string;
  formAnswers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
};
