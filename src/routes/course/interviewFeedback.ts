import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';

import { setResponse } from '../utils';
import { Student, TaskInterviewResult } from '../../models';
import { ILogger } from '../../logger';
import { mentorsService, taskService } from '../../services';

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
  const mentor = await mentorsService.getCourseMentorWithUser(courseId, userId);
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
