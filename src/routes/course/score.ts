import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import * as NodeCache from 'node-cache';
import { setResponse } from '../utils';
import { TaskResult, Mentor, Student } from '../../models';
import { ILogger } from '../../logger';
import { studentsService, mentorsService, OperationResult, taskResultsService } from '../../services';

type ScoreInput = {
  studentId: number | string;
  courseTaskId: number | string;
  score: number | string;
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

const cache = new NodeCache({ stdTTL: 120, checkperiod: 150 });

export const postScore = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const inputData: ScoreInput = ctx.request.body;
  const data = {
    studentId: Number(inputData.studentId),
    courseTaskId: Number(inputData.courseTaskId),
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    githubPrUrl: inputData.githubPrUrl,
  };

  const authorId = ctx.state.user.id;
  const mentor = await mentorsService.getCourseMentorWithUser(courseId, authorId);

  if (mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
    return;
  }

  const student = await getRepository(Student).findOne(data.studentId, { relations: ['mentor'] });

  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (student.mentor.id !== mentor.id) {
    setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
    return;
  }

  const { courseTaskId, studentId } = data;
  const existingResult = await taskResultsService.getStudentTaskResult(studentId, courseTaskId);

  if (existingResult == null) {
    const taskResult = taskResultsService.createTaskResult(authorId, data);
    const addResult = await getRepository(TaskResult).save(taskResult);
    setResponse(ctx, OK, addResult);
    return;
  }

  if (data.githubPrUrl) {
    existingResult.githubPrUrl = data.githubPrUrl;
  }
  if (data.comment) {
    existingResult.comment = data.comment;
  }
  if (data.score !== existingResult.score) {
    existingResult.historicalScores.push({
      authorId,
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

  const inputData: ScoresInput[] = ctx.request.body;
  const result: OperationResult[] = [];

  for await (const item of inputData) {
    try {
      logger.info(item.studentGithubId);

      const data = {
        studentGithubId: item.studentGithubId,
        mentorGithubId: item.mentorGithubId,
        courseTaskId: Number(item.courseTaskId),
        score: Math.round(Number(item.score)),
        comment: item.comment || '',
        githubPrUrl: item.githubPrUrl,
      };

      const { mentorGithubId, studentGithubId } = data;

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

      const existingResult = await taskResultsService.getStudentTaskResult(student.id, data.courseTaskId);

      if (existingResult == null) {
        const taskResult = taskResultsService.createTaskResult(0, {
          ...data,
          studentId: Number(student.id),
        });
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
        continue;
      }

      if (data.githubPrUrl) {
        existingResult.githubPrUrl = item.githubPrUrl;
      }
      if (data.comment) {
        existingResult.comment = item.comment;
      }
      if (data.score !== existingResult.score) {
        existingResult.historicalScores.push({
          authorId: 0,
          score: data.score,
          dateTime: Date.now(),
          comment: item.comment,
        });
        existingResult.score = data.score;
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

export const getScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const cacheKey = `${courseId}_score`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    logger.info(`[Cache]: Score for ${courseId}`);
    setResponse(ctx, OK, cachedData);
    return;
  }

  const students = await studentsService.getCourseStudentsWithTasks(courseId);
  cache.set(cacheKey, students);
  setResponse(ctx, OK, students);
};
