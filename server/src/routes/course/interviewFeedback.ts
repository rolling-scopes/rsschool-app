import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';

import { setResponse } from '../utils';
import { Student, TaskInterviewResult } from '../../models';
import { ILogger } from '../../logger';
import { courseService, taskService, OperationResult, studentsService } from '../../services';

type Input = {
  studentId: number | string;
  courseTaskId: number | string;
  score: number | string;
  comment: string;
  formAnswers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
};

type InputApi = {
  courseId: number;
  studentGithubId: string;
  mentorGithubId: string;
  courseTaskId: number;
  score: number;
  comment: string;
  formAnswers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
};

export const postInterviewFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const userId = ctx.state.user.id;

  const inputData: Input = ctx.request.body;

  if (!inputData.studentId || !inputData.courseTaskId) {
    setResponse(ctx, BAD_REQUEST, 'invalid [studentId] or [courseTaskId]');
    return;
  }
  if (!inputData.score) {
    setResponse(ctx, BAD_REQUEST, 'no score');
    return;
  }

  const data = {
    studentId: Number(inputData.studentId),
    courseTaskId: Number(inputData.courseTaskId),
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    formAnswers: inputData.formAnswers,
  };

  const courseTask = await taskService.getCourseTask(data.courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  const student = await getRepository(Student).findOne(data.studentId, { relations: ['user'] });
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  const { courseTaskId, studentId } = data;
  const mentor = await courseService.getCourseMentorWithUser(courseId, userId);
  if (mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
    return;
  }

  const repository = getRepository(TaskInterviewResult);
  const existingResult = await repository
    .createQueryBuilder('interviewFeedback')
    .innerJoinAndSelect('interviewFeedback.student', 'student')
    .innerJoinAndSelect('interviewFeedback.courseTask', 'courseTask')
    .where('student.id = :studentId AND courseTask.id = :courseTaskId', {
      studentId,
      courseTaskId,
    })
    .getOne();

  if (existingResult != null) {
    setResponse(ctx, BAD_REQUEST, { message: 'Feedback already submitted' });
    return;
  }
  const entry: Partial<TaskInterviewResult> = {
    mentorId: mentor.id,
    studentId: data.studentId,
    formAnswers: data.formAnswers,
    score: data.score,
    comment: data.comment,
    courseTaskId: data.courseTaskId,
  };
  const result = await repository.save(entry);
  setResponse(ctx, OK, result);
};

export const postInterviewFeedbacks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const inputData: InputApi[] = ctx.request.body;
  const result: OperationResult[] = [];

  for await (const item of inputData) {
    if (!item.studentGithubId || !item.courseTaskId || !item.mentorGithubId) {
      result.push({
        status: 'skipped',
        value: `no student: ${item.studentGithubId} or mentor: ${item.mentorGithubId}`,
      });
      continue;
    }

    if (!item.score) {
      result.push({
        status: 'skipped',
        value: `no score`,
      });
      continue;
    }

    const courseTask = await taskService.getCourseTask(item.courseTaskId);
    if (courseTask == null) {
      result.push({
        status: 'skipped',
        value: 'not valid course task',
      });
      continue;
    }

    const student = await studentsService.getCourseStudentByGithubId(item.studentGithubId);
    if (student == null) {
      result.push({
        status: 'skipped',
        value: 'not valid student',
      });
      continue;
    }

    const { courseTaskId } = item;
    const mentor = await courseService.getMentorByGithubId(item.courseId, item.mentorGithubId);
    if (mentor == null) {
      result.push({
        status: 'skipped',
        value: 'not valid mentor',
      });
      continue;
    }

    const repository = getRepository(TaskInterviewResult);
    const existingResult = await repository
      .createQueryBuilder('interviewFeedback')
      .innerJoinAndSelect('interviewFeedback.student', 'student')
      .innerJoinAndSelect('interviewFeedback.courseTask', 'courseTask')
      .where('student.id = :studentId AND courseTask.id = :courseTaskId', {
        studentId: student.id,
        courseTaskId,
      })
      .getOne();

    if (existingResult != null) {
      result.push({
        status: 'skipped',
        value: 'feedback already submitted',
      });
      continue;
    }
    const entry: Partial<TaskInterviewResult> = {
      mentorId: mentor.id,
      studentId: student.id,
      formAnswers: item.formAnswers,
      score: item.score,
      comment: item.comment,
      courseTaskId: item.courseTaskId,
    };
    await repository.save(entry);
    result.push({
      status: 'created',
      value: `student ${item.studentGithubId}`,
    });
  }
  setResponse(ctx, OK, result);
};
