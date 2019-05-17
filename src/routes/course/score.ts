import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { TaskResult, Mentor, Student } from '../../models';
import { ILogger } from '../../logger';
import { studentsService, mentorsService, OperationResult } from '../../services';

type ScoreInput = {
  studentId: number;
  courseTaskId: number;
  score: number;
  comment?: string;
  githubPrUrl: string;
};

type ScoresInput = {
  studentGithubId: string;
  mentorGithubId: string;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl: string;
};

export const postScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  logger.info(ctx.request.body);

  const data: ScoreInput = ctx.request.body;

  const id = ctx.state.user.id;
  const mentor = await mentorsService.getCourseMentorWithUser(courseId, id);

  if (mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
    return;
  }

  const student = await getRepository(Student).findOne(Number(data.studentId), { relations: ['mentor'] });

  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (student.mentor.id !== mentor.id) {
    setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
    return;
  }

  const { courseTaskId, studentId } = data;
  const existingResult = await getRepository(TaskResult)
    .createQueryBuilder('taskResult')
    .innerJoinAndSelect('taskResult.student', 'student')
    .innerJoinAndSelect('taskResult.courseTask', 'courseTask')
    .where('student.id = :studentId AND courseTask.id = :courseTaskId', {
      studentId: Number(studentId),
      courseTaskId: Number(courseTaskId),
    })
    .getOne();

  if (existingResult == null) {
    const taskResult: Partial<TaskResult> = {
      comment: data.comment,
      courseTaskId: Number(data.courseTaskId),
      student: Number(data.studentId),
      score: data.score,
      historicalScores: [
        {
          authorId: id,
          score: data.score,
          dateTime: Date.now(),
          comment: data.comment || '',
        },
      ],
      githubPrUrl: data.githubPrUrl,
    };

    const addResult = await getRepository(TaskResult).save(taskResult);
    setResponse(ctx, OK, addResult);
    return;
  }

  existingResult.githubPrUrl = data.githubPrUrl;
  existingResult.comment = data.comment;
  if (data.score !== existingResult.score) {
    existingResult.historicalScores.push({
      authorId: id,
      score: data.score,
      dateTime: Date.now(),
      comment: data.comment || '',
    });
    existingResult.score = data.score;
  }

  const updateResult = await getRepository(TaskResult).save(existingResult);
  setResponse(ctx, OK, updateResult);
  return;
};

export const postScores = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  logger.info(ctx.request.body);
  const data: ScoresInput[] = ctx.request.body;
  const result: OperationResult[] = [];

  for await (const item of data) {
    try {
      logger.info(item.studentGithubId);

      const { mentorGithubId, studentGithubId } = item;
      const score = Math.round(item.score);

      const mentor = await getRepository(Mentor)
        .createQueryBuilder('mentor')
        .innerJoinAndSelect('mentor.user', 'user')
        .where('"mentor"."courseId" = :courseId AND "user"."githubId" = :mentorGithubId', { mentorGithubId, courseId })
        .getOne();

      if (mentor == null) {
        result.push({
          status: 'skipped',
          value: `no mentor: ${mentorGithubId}`,
        });
        continue;
      }

      const student = await getRepository(Student)
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.mentor', 'mentor')
        .innerJoinAndSelect('student.user', 'user')
        .where('"user"."githubId" = :studentGithubId AND "student"."courseId" = :courseId', {
          studentGithubId,
          courseId,
        })
        .getOne();

      if (student == null) {
        result.push({
          status: 'skipped',
          value: `no student: ${studentGithubId}`,
        });
        continue;
      }

      const { courseTaskId } = item;
      const existingResult = await getRepository(TaskResult)
        .createQueryBuilder('taskResult')
        .innerJoinAndSelect('taskResult.student', 'student')
        .innerJoinAndSelect('taskResult.courseTask', 'courseTask')
        .where('student.id = :studentId AND courseTask.id = :courseTaskId', {
          studentId: student.id,
          courseTaskId,
        })
        .getOne();

      if (existingResult == null) {
        const taskResult: Partial<TaskResult> = {
          comment: item.comment,
          courseTaskId: item.courseTaskId,
          student: Number(student.id),
          score,
          historicalScores: [
            {
              authorId: 0,
              score,
              dateTime: Date.now(),
              comment: item.comment,
            },
          ],
          githubPrUrl: item.githubPrUrl,
        };
        const addResult = await getRepository(TaskResult).save(taskResult);
        result.push({
          status: 'created',
          value: addResult.id,
        });
        continue;
      }

      if (existingResult.historicalScores.some(({ authorId }) => authorId !== 0)) {
        result.push({
          status: 'skipped',
          value: `${existingResult.id}. Possible user data override`,
        });
        return;
      }

      existingResult.githubPrUrl = item.githubPrUrl;
      existingResult.comment = item.comment;
      if (score !== existingResult.score) {
        existingResult.historicalScores.push({
          authorId: 0,
          score,
          dateTime: Date.now(),
          comment: item.comment,
        });
        existingResult.score = score;
      }

      const updateResult = await getRepository(TaskResult).save(existingResult);
      result.push({
        status: 'updated',
        value: updateResult.id,
      });
    } catch (e) {
      result.push({
        status: 'failed',
        value: e.message,
      });
    }
  }

  setResponse(ctx, OK, result);
};

export const getScore = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const students = await studentsService.getCourseStudentsWithTasks(courseId);
  setResponse(ctx, OK, students);
};
